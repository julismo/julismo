# Link Section Hierarchy Design

## Objective

Make the profile's link hierarchy explicit without adding new destinations or changing the established contact-first conversion flow.

## Evidence

The approved order is based on Linktree's documented guidance to place the most important links first and use Link Headers to organize them. Mobile usability research also supports retaining the current wide, well-spaced card column rather than replacing cards with icon-only links or edge-to-edge controls.

The current data model incorrectly classifies ARM as `work` and GitHub/X as `contact`. The template can therefore render only one heading, `SOLUÇÕES`, and cannot express the agreed presence grouping.

## Alternatives considered

### A. Keep one heading and leave social links ungrouped

This preserves the current DOM but makes GitHub and X visually indistinguishable from conversion contacts. Rejected.

### B. Add a heading before every group

Adding `CONTACTOS`, `SOLUÇÕES`, and `PRESENÇA` would be explicit but would over-label a short, conversion-focused page. Rejected.

### C. Keep contact actions unheaded; add two meaningful headings (selected)

Keep WhatsApp, Cal.com, and Email as a continuous contact block. Render `SOLUÇÕES` immediately before ARM Solutions, and `PRESENÇA` immediately before GitHub. This matches the approved order and keeps the page concise.

## Approved design

### Data model

- Replace the ambiguous `work` section with `solutions`.
- Add a `presence` section.
- Keep WhatsApp, Cal.com, and Email in `contact`.
- Set ARM Solutions to `solutions`; set GitHub and X to `presence`.

### Rendering

- Render `SOLUÇÕES` immediately before the first `solutions` card.
- Render `PRESENÇA` immediately before the first `presence` card.
- Do not render a heading for the contact block.
- Preserve link order, destination URLs, icons, labels, descriptions, Cal.com interaction, and card geometry.

### Accessibility and responsive constraints

- Keep the existing navigation landmark and card links intact.
- Headings are contextual labels only and must not add focus stops.
- Preserve existing mobile safe gutters and desktop contained-card layout.

## Validation

- Extend the profile-data contract to lock the approved sections and order.
- Extend the Playwright contract to assert the two labels appear in the right sequence, each before its first card.
- Run Astro checking, unit tests, the focused E2E test, full E2E suite, and production build.

## Out of scope

- Adding projects, videos, thumbnails, analytics, new social networks, or extra contact methods.
- Changing any URL, the Cal.com dialog, email behavior, QR assets, banner, scroll behavior, or iPhone motion flow.
