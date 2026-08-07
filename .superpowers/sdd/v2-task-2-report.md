# V2 Task 2 — Cover Hero, Backdrop, Scale, and Badge

## Scope

Implemented only the Task 2 CSS/component/asset work. QR files were not edited.

## Markup and CSS choices

- Retained the existing `ProfileHero` banner as the first header child. The banner is in normal document flow, uses `width: 100vw`, `height: clamp(178px, 49vw, 210px)`, and `margin-left: calc(50% - 50vw)`. Its image is an `object-fit: cover` fill and its pseudo-element fades into `var(--color-bg)` at the lower edge.
- Made the hero itself full bleed with the same left-margin calculation. This is necessary because the centered grid otherwise resolves the banner six pixels off the portrait center at a 390 px viewport; it preserves the required banner rule and makes both centers exactly coincide.
- Removed shell top padding so the in-flow cover begins at the top. The 94 px portrait has `margin-top: -47px`, `position: relative`, and `z-index: 1`, placing it symmetrically across the banner’s lower boundary while leaving name, bio, and cards after the cover in document flow.
- Replaced the SVG body in `VerifiedRosette.astro` with the required decorative rounded-badge image markup. CSS sizes it to 21 × 21 px with `object-fit: contain`, `flex: 0 0 21px`, and no clipping.
- Set the body to solid background, moved the radial illumination to fixed `body::before` (`inset: 0`, `z-index: 0`, pointer-events disabled), and moved the small animated glow to `body::after`. `.page-shell` remains at `z-index: 1`.
- Set `--content-width: 390px`, the shell width to `min(calc(100% - 24px), var(--content-width))`, and the required larger type/card/icon measurements: 66 px cards, 94 px portrait, 38 px icons, 0.9/0.74 rem card text, 1.18 rem arrow, 0.86 rem bio, and clamped 1.45–1.62 rem heading.
- Added only thin black-and-silver vertical-scrollbar styling with standards properties and WebKit width/track/thumb rules. `overflow-x: clip` remains unchanged.

## Source asset handling

Confirmed that `public/images/julismo-verified-rosette-rounded.png` exists and is non-empty (315,741 bytes) before deletion. Added that approved rounded asset. Removed only the two confirmed unused generated alternatives:

- `public/images/julismo-verified-rosette-v1.png`
- `public/images/julismo-verified-rosette.png`

## TDD evidence

### RED

The existing approved focused contract was run before production changes:

```text
npx playwright test tests/e2e/profile.spec.ts --grep "global illuminated backdrop"
5 failed
```

After first ensuring Playwright was serving this worktree rather than a stale Astro process from `C:\dev\julismo`, the meaningful RED failure was the intended geometry assertion: `Expected: true; Received: false` for the portrait/banner overlap in all five projects.

### GREEN

After the scoped implementation:

```text
npx playwright test tests/e2e/profile.spec.ts --grep "global illuminated backdrop"
5 passed (6.6s)
```

The full required browser spec then passed:

```text
npx playwright test tests/e2e/profile.spec.ts
29 passed, 1 skipped (37.8s)
```

The sole skip is the intentional no-JS reduced-motion test skip.

## Self-review

- `git diff --check` completed without whitespace errors.
- Reviewed all requested CSS measurements and pseudo-element layering against the Task 2 brief.
- Confirmed the rendered 390 px geometry after the grid alignment correction: banner `{ left: 0, width: 390 }`, portrait center delta `0`, and lower-boundary overlap `true`.
- Confirmed the full browser spec has no horizontal-overflow regression.
- No QR files were changed.

## Commit

Commit SHA: PENDING

## Concerns

None. The only execution concern encountered was the pre-existing stale Astro development server on port 4321; it was verified as serving the root repository, stopped, and the required tests were then run against this specified worktree.
