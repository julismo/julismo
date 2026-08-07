# Banner Replacement and Responsive Hardening Design

## Goal

Replace the prior silver-wave hero artwork with the new supplied `Banner.png`, then make the profile resilient to narrow effective widths created by mobile devices or browser zoom.

## Banner treatment

- Copy the supplied 1584 by 396 artwork unchanged to `public/images/julismo-hero-banner.png`.
- Use it as the existing decorative full-bleed hero cover. Keep the portrait centred and straddling the lower edge of the banner.
- On small screens, bias the crop to the right (`object-position: right center`) so the authored “Full Stack Developer” and technology artwork remains the visual focus. The banner remains decorative: empty `alt`, hidden from assistive technology, and no interactive content.
- Give the lower edge a restrained scroll transition: a progressive dark veil resolves the artwork into `--color-bg`, and a single inset silver hairline with a soft shadow marks the content boundary. It remains static; no parallax or additional animation is introduced.

## Responsive hardening

- Treat a 280 px effective CSS width as the lower-bound regression target. This represents a narrow mobile layout or a zoomed browser without pretending that a CSS transform is browser zoom.
- Apply horizontal clipping at the root and preserve `min-width: 0` on the transformed page shell so full-bleed artwork and gyroscope transforms cannot create a horizontal scrollbar.
- Preserve normal vertical scrolling, fixed illumination, card sizes, destinations, portrait overlap, and all QR assets.

## Card action treatment

- Replace the loose upward-right glyph on each card with a compact circular silver action affordance containing a rounded right-arrow SVG.
- The card itself remains the only interactive element. The visual action is an `aria-hidden` span, avoiding an invalid nested button inside the link while preserving the full-card tap target.
- Its border, soft dark material, and restrained hover response reuse the existing black-and-silver card system rather than introducing a new colour or animation language.

## Verification

- Playwright first expects the new banner asset and fails while the old asset remains.
- At 280 px and 390 px effective viewport widths, document `scrollWidth` must not exceed `window.innerWidth`.
- Each of the five cards exposes one decorative `.link-card__action` with an accessible card-level link label.
- At 390 by 844, the existing real-scroll test stays green and `body::before` remains fixed after wheel scrolling.
- Inspect 390 by 844 managed-browser screenshots before and after a scroll to judge the banner crop, portrait overlap, illumination, and scrollbar.
