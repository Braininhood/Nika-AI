"""Tests for sklearn readiness predictor."""

from app.services.readiness_model import (
    extract_features,
    predict_readiness_probability,
)


def test_extract_features_shape() -> None:
    skill_map = {
        "diagnostic": {
            "writing": {"band": "C", "target": "B", "gap": 1},
            "reading": {"band": "B", "target": "B", "gap": 0},
            "listening": {"band": "C+", "target": "B", "gap": 1},
            "speaking": {"band": "B", "target": "B", "gap": 0},
        },
        "weakTags": ["writing:purpose"],
    }
    stats = {"sessionsBySkill": {"writing": 5, "reading": 4, "listening": 3, "speaking": 6}}
    features = extract_features(skill_map, stats, consecutive_passes=1)
    assert features.shape == (1, 12)


def test_predict_returns_bounded_probability() -> None:
    skill_map = {
        "diagnostic": {
            s: {"band": "B", "target": "B", "gap": 0}
            for s in ("listening", "reading", "writing", "speaking")
        },
        "weakTags": [],
    }
    stats = {"sessionsBySkill": {s: 8 for s in ("listening", "reading", "writing", "speaking")}}
    result = predict_readiness_probability(skill_map, stats, consecutive_passes=2)
    assert 0.0 <= result["probability"] <= 1.0
    assert result["modelVersion"].startswith("gb-v2")
    assert "percent" in result
