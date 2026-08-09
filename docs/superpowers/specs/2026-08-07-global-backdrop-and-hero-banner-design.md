# Global Backdrop and Hero Banner Design

## Goal

Preserve the approved black-and-silver identity while making the illumination continuous during scrolling, moving the hero into a true cover-banner composition, making the mobile interface feel intentionally larger, and refining the reusable QR artwork.

## Visual direction

- A fixed, viewport-sized radial backdrop sits below every page element. It preserves the existing silver illumination at the top of the viewport while the user scrolls, rather than letting the document-height background end in flat black.
- The supplied 1584 by 396 `Banner.png` becomes the current true full-bleed cover banner at the start of the page. On small screens its crop favours the authored right-side role and technology artwork. Julismo's portrait is centred and overlaps the lower edge of that banner, following the visual relationship in the supplied Linktree reference. A subtle dark veil and inset silver hairline distinguish the banner from the scrolling page background; the name and bio remain underneath the portrait.
- The generated silver verification rosette with its rounded check mark replaces the inline SVG. It is cropped to its visible bounds, rendered as a small non-interactive image, and has enough CSS space to avoid clipping.
- Portrait, name, bio, card height, card typography, icons, and horizontal content width scale up for 320 px and 390 px mobile screens. Cards move lower as a result of the cover-banner hierarchy.
- The page remains a normal vertical document. A thin black-and-silver scrollbar is styled where the browser exposes it; horizontal scrolling remains prohibited.
- The reusable QR remains high-contrast, error-correction level H, and locally generated. It uses white rounded data modules and inverse white/black/white finder patterns on a solid black reading field, with an untouched 4-module black quiet zone. Both SVG and PNG outputs must still decode to `https://julismo.vercel.app/` after normalising the intentional inverse palette.

## Constraints

- Keep the five card destinations, card order, icon set, copy, black/silver palette, orientation effect, and reduced-motion support unchanged.
- The banner and verification badge are decorative only: each has empty alternative text and is hidden from assistive technology.
- No new JavaScript or dependency is required.
- The global backdrop and banner never receive pointer events or cover keyboard focus.

## Regression coverage

- Playwright verifies that the backdrop is a fixed radial layer, the banner asset is present, the portrait overlaps the cover banner, the badge asset is present, and the larger mobile card height is retained.
- Existing overflow coverage protects against horizontal scrolling.
- A unit test protects the rounded QR renderer's quiet zone, rounded module geometry, and rounded finder geometry. OpenCV decodes each generated production QR asset before publication.
- Existing keyboard, link-security, no-JS, reduced-motion, responsive, unit, and build checks remain required.
