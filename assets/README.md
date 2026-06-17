# Assets — Nika Artwork & Brand

Drop the **Nika dragon** artwork and brand assets here. This is the home for source art; optimized runtime copies live in `apps/web/public/nika/` once the app is scaffolded.

## Folder layout

```
assets/
├── nika/
│   ├── source/          # Master art: AI/PSD/AE projects, high-res PNG/SVG (provided by you)
│   ├── poses/           # Exported pose art: greeting, explaining, thinking,
│   │                    #   celebrating, encouraging, proud, resting
│   ├── stages/          # Growth stages: hatchling, fledgling, rising, soaring, guardian
│   ├── lottie/          # Animated states exported as .json
│   └── avatar/          # Square, small-size-legible avatars
├── brand/
│   ├── logo/            # Wordmark + logomark
│   ├── colors/          # Palette swatches / tokens.json
│   └── icons/           # App icon, favicon (Nika-based)
└── illustrations/       # Empty/loading/error state scenes
```

## Concept art (received ✓)

Nika concept art is in [`nika/source/concept/`](./nika/source/concept/):

| File | Maps to growth stage |
|------|----------------------|
| `nika-stage1-egg-hatching.png` | Egg / Hatchling |
| `nika-stage2-hatchling.png` | Hatchling (curious) |
| `nika-stage3-nurturing.png` | Fledgling (resting/nurturing) |
| `nika-stage4-rising.png` | Rising |
| `nika-stage5-guardian.png` | Guardian (glowing egg) |

**Direction locked from this art:** warm amber/bronze/copper dragon, golden knowledge-glow, forest/nest setting. Palette updated in [design brief](../docs/09-DESIGN/01-design-brief.md).

### Next steps for production art

- Commission clean **vector/turnaround** versions of each stage on transparent backgrounds
- Produce the **state poses** (greeting, explaining, thinking, celebrating, etc.) per [mascot spec](../docs/09-DESIGN/02-nika-mascot-companion.md)
- Export **Lottie** animations per [animation doc](../docs/09-DESIGN/03-animation-and-motion.md)
- Generate **avatar** crops (small-size legible) + app icon

## Naming convention

```
nika-{stage}-{state}.{ext}
  stage: hatchling | fledgling | rising | soaring | guardian | base
  state: greeting | explaining | thinking | celebrating | encouraging | proud | resting
e.g. nika-base-thinking.json, nika-guardian-proud.svg
```

## Formats

| Use | Format |
|-----|--------|
| Static, scalable | SVG |
| Animated states | Lottie JSON |
| Raster fallback | PNG (2x) |
| App icon | PNG 512/192 + maskable |

## Notes

- Keep large source files out of git if heavy (see `.gitignore`); commit optimized exports.
- Provide light + dark variants where possible.
