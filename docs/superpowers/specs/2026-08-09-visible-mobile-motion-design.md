# Visible Mobile Motion Design

## Goal

Make the approved iPhone tilt interaction visibly perceptible: the contact cards, rather than the whole page, should move gently left/right with device tilt. A Safari visitor must receive useful feedback if permission succeeds but no sensor sample arrives.

## Root cause

The existing implementation transforms the entire `.page-shell` and caps translation at 3 px. The hero, cards, and surrounding content move as one plane, leaving almost no stationary visual reference. On an iPhone this is imperceptible in normal use. The current status is screen-reader-only, so a Safari permission result with no subsequent sensor event appears to do nothing.

## Approved behaviour

- Move `data-profile-plane` from the page shell to the `.link-list`; the hero and banner remain fixed while the six action cards follow the device tilt together.
- Keep the effect bounded and mobile-safe: 1.75 degrees maximum rotation, 8 px maximum translation, and 0.18 smoothing. A sustained lateral tilt should yield roughly 6–7 px of lateral card movement, inside the existing 20 px mobile gutter.
- Keep the existing baseline calibration, 0.8 degree dead zone, orientation-first data source, accelerometer fallback, direct Safari permission gesture, and reduced-motion opt-out.
- While waiting for Safari’s first sensor sample, show `Mova o telemóvel…`. If no sample arrives within 2 seconds, change state to `unavailable` and leave a visible `Movimento indisponível` result with accessible guidance to open the page directly in Safari. A valid first sample clears the timer, hides the prompt, and reports `Movimento ativado.` to assistive technology.

## Accessibility and safety

- `prefers-reduced-motion: reduce` remains fully static and has no prompt.
- The no-sensor result is visible and announced, rather than silently leaving the visitor in a waiting state.
- Cards remain links; the motion plane must not introduce horizontal overflow or change keyboard interaction.
- No contact destination, copy outside the motion affordance, Cal integration, QR asset, banner, or layout hierarchy changes.

## Verification

- A new mobile Safari-mocked Playwright regression dispatches sustained lateral orientation samples and requires a visibly shifted card plane while the hero remains stationary.
- A second regression proves that a granted permission with no event becomes `data-motion="unavailable"` and exposes `Movimento indisponível`.
- Existing Safari grant, acceleration fallback, denial, reduced-motion, mobile gutter, and no-overflow tests remain green.
- Run `npm test`, `npm run build`, inspect a 390 by 844 screenshot, publish a PR against `main`, merge it, then smoke-test the production deployment. A physical iPhone Safari pass remains required for actual sensor hardware.
