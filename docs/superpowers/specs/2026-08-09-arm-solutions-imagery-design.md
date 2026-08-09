# ARM Solutions Imagery Design

**Date:** 2026-08-09
**Status:** Approved for implementation by Julismo

## Goal

Add three restrained, generated visual thumbnails to the already-approved ARM Solutions disclosure. The visuals must make the expanded content feel more deliberate and premium without changing the profile into a gallery, diluting the WhatsApp or Cal.com conversion paths, or breaking the black, white and grey design system.

## Decision

Use the approved **miniatura lateral** composition. Each informational solution item presents its existing copy on the left and one decorative, square operational visual on the right. Images are visible only after the native ARM disclosure opens.

The final composition must be simpler than an award-show portfolio: no carousel, video, WebGL, horizontal scrolling, auto-scroll, new image animation or full-bleed imagery. Awwwards' Mobile Excellence guidance prioritises visible CTAs, fast loading and lazy-loading; Linktree's design guidance prioritises readable links and warns against busy visuals. The design therefore uses compact thumbnails, not image-led cards.

## Visual language

All three assets share one art direction:

- Abstract editorial operations still life.
- Deep black, matte graphite and brushed platinum only.
- One recognisable operational metaphor per image, centrally framed with generous crop-safe margins.
- No people, faces, trucks, warehouses, logos, brands, readable text, invented UI, neon, robots or fake dashboard screens.
- No embedded words or numbers; the copy remains live HTML text.

The three required concepts are:

1. **Orçamentos que chegam a tempo** — overlapping graphite document planes, thin platinum pricing guides and a restrained timing/precision motif.
2. **Documentos prontos a faturar** — ordered abstract document sheets connected by one brushed-metal route, suggesting a clean document hand-off without readable labels.
3. **Operação sob controlo** — a controlled dark network of a few platinum nodes and routes, balanced rather than futuristic, suggesting priorities and visibility.

Generate each source as a square 1024px bitmap, select only images that match the common art direction, then produce a 256px square WebP for delivery. Each delivered file must be at most 45 KB; all three together must stay below 135 KB.

## Image treatment

The image file is not expected to carry the final page colour treatment. The component applies the shared treatment with CSS so that every image sits in the same environment:

1. The image is cropped with `object-fit: cover` and a fixed square frame.
2. The image receives grayscale, reduced brightness and modest contrast adjustment.
3. A graphite-to-black translucent overlay sits above the image, with a restrained silver highlight only where it improves form.
4. The tile itself has the same rounded, dark material language as the parent card.

This preserves a reversible tuning point: overlay opacity, brightness and contrast can change without regenerating the image assets.

## Layout and spacing

Use the existing profile's compact spacing language, expanded only where imagery adds visual weight.

| Relationship | Default | At 280px |
| --- | ---: | ---: |
| ARM summary to panel | 12px | 12px |
| Between solution cards | 10px | 8px |
| Solution-card padding | 12px | 10px |
| Text-to-thumbnail gap | 12px | 10px |
| Thumbnail side | 72px | 58px |
| Solution-card minimum height | 92px | 88px |
| List to ARM website link | 12px | 12px |

`SOLUÇÕES` remains left-aligned to the content start of the main ARM copy, never visually centred. The expanded items use a two-column grid of `minmax(0, 1fr)` plus the bounded thumbnail; text may wrap normally rather than forcing horizontal overflow.

The `Conhecer a ARM Solutions` link remains visually restrained but receives a 44px minimum touch area. This follows Apple touch guidance while the overall disclosure continues to meet WCAG reflow at a 320 CSS-pixel width.

## Component and asset contract

- Add the three final WebPs under `public/images/arm-solutions/` with stable, descriptive names.
- Extend the solution data with the visual source path; do not introduce a CMS, remote image service or dependency.
- Render an explicit decorative image inside each `data-solution-id` item with empty `alt` and `aria-hidden="true"`.
- Set image width and height attributes to prevent layout shift, `decoding="async"`, and `loading="lazy"`.
- Preserve native `details`/`summary`, current keyboard order, the inner secure ARM external link, current gyro behaviour and reduced-motion behaviour.
- Keep fallback material behind each image so that a failed asset never creates a broken-image icon or makes copy unreadable.

## Accessibility, performance and validation

- Images are decorative because the live title and description already state the information; assistive technology must not announce them redundantly.
- The summary and ARM website remain the only interactive controls introduced by this disclosure.
- No horizontal overflow at 280, 320, 390, 768 or 1440px, with ARM open and closed.
- Verify thumbnail geometry, live-text contrast, visual alignment, touch-area size and empty alt text in automated tests where feasible.
- Inspect generated assets before accepting them, then capture open/closed screenshots at 390x844 and 1440x900 with Playwright.
- Run the complete existing quality gate after integration.

## Non-goals

- No per-solution destination, client claim, client logo, case-study screenshot, video or social feed.
- No coloured accent palette or image text.
- No replacement of existing main cards, global background, banner, profile photo or external-link structure.

## Reference basis

- [Awwwards Mobile Excellence guidelines](https://www.awwwards.com/mobile-excellence-guidelines.pdf)
- [Linktree design guidance](https://linktr.ee/help/en/articles/8614125-customizing-your-linktree-design)
- [Apple UI design tips](https://developer.apple.com/design/tips/)
- [WCAG 2.2 Reflow](https://www.w3.org/TR/WCAG22/#reflow)
