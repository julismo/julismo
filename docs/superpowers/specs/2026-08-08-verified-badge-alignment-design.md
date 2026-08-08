# Verified Badge Alignment Design

## Goal

Make the verification seal read as part of the `Julismo` identity line without moving the name away from the visual centre.

## Evidence

At 390 px and 1440 px widths, the current seal is vertically centred but sits roughly 10 px from the name because it is positioned from the viewport centre. Research on compact icon/text pairs supports a 0–8 px gap; 6 px gives the seal a close relationship with the name without crowding it.

## Approved Design

- Keep `Julismo` physically centred in the viewport.
- Size the name-row to the intrinsic heading width.
- Anchor the decorative, hidden-from-accessibility seal to the heading’s right edge.
- Use a fixed 6 px visual gap and retain the current 21 px seal size and asset.
- Do not change the portrait, banner, bio, motion behaviour, or card layout.

## Verification

- A Playwright regression check runs at mobile 390 px and desktop 1440 px.
- It verifies the heading remains centred, the seal remains vertically centred, and the horizontal gap is 6 px within sub-pixel tolerance.
- Full Astro, Vitest, Playwright, and production-build checks run before release.
