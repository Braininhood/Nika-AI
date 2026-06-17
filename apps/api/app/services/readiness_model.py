"""sklearn readiness predictor — supplements rule-based gates (Phase 8)."""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier

GRADE_ORDER = ["E", "D", "C", "C+", "B", "A"]
SKILLS = ("listening", "reading", "writing", "speaking")


def _grade_index(grade: str) -> float:
    try:
        return float(GRADE_ORDER.index(grade))
    except ValueError:
        return 2.0


def extract_features(
    skill_map: dict,
    stats: dict,
    consecutive_passes: int = 0,
) -> np.ndarray:
    """Vector: gaps, session counts, weak tags, mock streak."""
    diagnostic = skill_map.get("diagnostic", {})
    sessions = stats.get("sessionsBySkill", {})
    weak_tags = skill_map.get("weakTags", []) or []

    gaps = [_grade_index(diagnostic.get(s, {}).get("band", "C")) for s in SKILLS]
    target_indices = [
        _grade_index(diagnostic.get(s, {}).get("target", "B")) for s in SKILLS
    ]
    gap_deltas = [max(0.0, t - g) for g, t in zip(gaps, target_indices, strict=True)]
    session_counts = [float(sessions.get(s, 0)) for s in SKILLS]

    return np.array(
        [
            *gap_deltas,
            *session_counts,
            float(len(weak_tags)),
            float(consecutive_passes),
            float(sum(gap_deltas)),
            float(min(session_counts) if session_counts else 0.0),
        ],
        dtype=np.float64,
    ).reshape(1, -1)


def _synthetic_training_set(n: int = 400, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """Bootstrap labels from OET-style heuristics until real outcomes exist."""
    rng = np.random.default_rng(seed)
    rows: list[list[float]] = []
    labels: list[int] = []

    for _ in range(n):
        gaps = rng.integers(0, 3, size=4).astype(float)
        sessions = rng.integers(0, 12, size=4).astype(float)
        weak_count = float(rng.integers(0, 8))
        consecutive = float(rng.integers(0, 3))
        row = [
            *gaps.tolist(),
            *sessions.tolist(),
            weak_count,
            consecutive,
            float(gaps.sum()),
            float(sessions.min()),
        ]
        rows.append(row)

        ready = (
            gaps.max() == 0
            and sessions.min() >= 3
            and weak_count <= 2
            and consecutive >= 2
        )
        likely = (
            gaps.sum() <= 2
            and sessions.mean() >= 4
            and weak_count <= 4
            and consecutive >= 1
        )
        labels.append(1 if ready else (1 if likely and rng.random() > 0.35 else 0))

    return np.array(rows, dtype=np.float64), np.array(labels, dtype=np.int32)


@dataclass
class ReadinessPrediction:
    probability: float
    model_version: str
    features_used: int


class ReadinessModel:
    """Gradient boosting — bootstrap + real outcomes from ml_training_samples."""

    MODEL_VERSION = "gb-v2-hybrid"

    def __init__(self) -> None:
        self._model: GradientBoostingClassifier | None = None
        self._trained_on_real: int = 0

    def _ensure_model(self) -> GradientBoostingClassifier:
        if self._model is None:
            self._model, self._trained_on_real = _build_hybrid_model()
        return self._model

    def retrain(self, x: np.ndarray, y: np.ndarray, real_count: int) -> None:
        model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=3,
            learning_rate=0.08,
            random_state=42,
        )
        model.fit(x, y)
        self._model = model
        self._trained_on_real = real_count
        if real_count > 0:
            self.MODEL_VERSION = f"gb-v2-real-{real_count}"

    def predict_probability(
        self,
        skill_map: dict,
        stats: dict,
        consecutive_passes: int = 0,
    ) -> ReadinessPrediction:
        model = self._ensure_model()
        features = extract_features(skill_map, stats, consecutive_passes)
        proba = float(model.predict_proba(features)[0][1])
        proba = max(0.0, min(1.0, proba))
        return ReadinessPrediction(
            probability=round(proba, 4),
            model_version=self.MODEL_VERSION,
            features_used=features.shape[1],
        )


def _build_hybrid_model() -> tuple[GradientBoostingClassifier, int]:
    x_syn, y_syn = _synthetic_training_set(300)
    x_real, y_real, real_count = _load_real_training_rows()
    if real_count > 0:
        x_train = np.vstack([x_syn, x_real])
        y_train = np.concatenate([y_syn, y_real])
    else:
        x_train, y_train = x_syn, y_syn
    model = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.08,
        random_state=42,
    )
    model.fit(x_train, y_train)
    return model, real_count


def _load_real_training_rows() -> tuple[np.ndarray, np.ndarray, int]:
    """Sync load — called at model init; DB fetch in retrain_from_database."""
    return np.empty((0, 12)), np.empty((0,), dtype=np.int32), 0


async def _fetch_training_samples() -> tuple[np.ndarray, np.ndarray, int]:
    from app.core.supabase_rest import supabase_rest

    try:
        rows = await supabase_rest(
            "GET",
            "ml_training_samples",
            params={"select": "features,label", "order": "recorded_at.desc", "limit": "2000"},
        )
    except Exception:
        return np.empty((0, 12)), np.empty((0,), dtype=np.int32), 0
    if not isinstance(rows, list) or not rows:
        return np.empty((0, 12)), np.empty((0,), dtype=np.int32), 0

    xs: list[list[float]] = []
    ys: list[int] = []
    for row in rows:
        feats = row.get("features")
        label = row.get("label")
        if isinstance(feats, list) and label in (0, 1):
            xs.append([float(v) for v in feats])
            ys.append(int(label))
        elif isinstance(feats, dict):
            vec = [
                float(feats.get("gapSum", 0)),
                float(feats.get("sessionMin", 0)),
                float(feats.get("weakCount", 0)),
                float(feats.get("consecutivePasses", 0)),
            ]
            while len(vec) < 12:
                vec.append(0.0)
            xs.append(vec[:12])
            ys.append(int(label))
    if not xs:
        return np.empty((0, 12)), np.empty((0,), dtype=np.int32), 0
    return np.array(xs, dtype=np.float64), np.array(ys, dtype=np.int32), len(xs)


async def record_training_outcome(
    *,
    user_id: str,
    skill_map: dict,
    stats: dict,
    consecutive_passes: int,
    exam_ready: bool,
) -> None:
    from app.core.supabase_rest import supabase_rest

    features = extract_features(skill_map, stats, consecutive_passes).flatten().tolist()
    await supabase_rest(
        "POST",
        "ml_training_samples",
        json={
            "user_id": user_id,
            "features": features,
            "label": 1 if exam_ready else 0,
            "source": "outcome",
        },
    )


async def retrain_from_database() -> dict:
    x_syn, y_syn = _synthetic_training_set(300)
    x_real, y_real, real_count = await _fetch_training_samples()
    if real_count > 0:
        x_train = np.vstack([x_syn, x_real])
        y_train = np.concatenate([y_syn, y_real])
    else:
        x_train, y_train = x_syn, y_syn
    _readiness_model.retrain(x_train, y_train, real_count)
    return {
        "ok": True,
        "modelVersion": _readiness_model.MODEL_VERSION,
        "realSamples": real_count,
        "totalTrainingRows": int(x_train.shape[0]),
    }


_readiness_model = ReadinessModel()


def predict_readiness_probability(
    skill_map: dict,
    stats: dict,
    consecutive_passes: int = 0,
) -> dict:
    prediction = _readiness_model.predict_probability(skill_map, stats, consecutive_passes)
    confidence = (
        "high"
        if prediction.probability >= 0.75 or prediction.probability <= 0.25
        else "medium"
        if prediction.probability >= 0.55 or prediction.probability <= 0.45
        else "low"
    )
    return {
        "probability": prediction.probability,
        "percent": int(math.floor(prediction.probability * 100)),
        "confidence": confidence,
        "modelVersion": prediction.model_version,
        "featuresUsed": prediction.features_used,
    }
