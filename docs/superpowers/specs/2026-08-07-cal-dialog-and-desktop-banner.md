# Cal.com Dialog and Desktop Banner Design

## Goal

Give visitors a frictionless way to book a 30-minute conversation with Julismo while preserving the profile page's fast initial load. At the same time, improve the desktop-only crop of the supplied hero artwork so the authored technology stack is readable without changing the approved mobile composition.

## Booking CTA

- Add a contact card immediately after the primary WhatsApp card:
  - Title: `Agendar diagnóstico`
  - Description: `30 min · escolha o melhor horário`
  - Destination: `https://cal.com/julismo-costa-3nxpms/30min`
  - Visual: the existing black-and-silver card system with a calendar icon and rounded right-arrow action.
- Normalise WhatsApp, ARM, and calendar into the same restrained dark circular icon treatment used by Email, GitHub, and X. Retain crisp vector brand marks; do not use generated raster logos, which could distort recognisable marks at card size.
- The card is a progressively enhanced link: without JavaScript it opens the supplied Cal.com URL in a new tab; with JavaScript it prevents navigation and opens the in-page modal. Its accessible name describes the booking action and it exposes dialog semantics when enhanced.
- The main page must not download the Cal.com embed during initial render. On the first intentional interaction, load the Cal snippet, then initialise one inline calendar inside a native `<dialog>`.
- Preload only after intent (`pointerenter` or keyboard focus) where that is available; a click still opens immediately and triggers the same lazy load if it was not preloaded.

## Dialog behaviour

- Use the browser-native modal dialog so focus management and escape handling have a sound baseline.
- The dialog uses the existing black, charcoal, silver, and rounded-corner design system; it is compact on desktop and fills the safe viewport on small screens.
- Lock background scrolling while open. Closing works through the close control, Escape, and a click on the dialog backdrop.
- Include a visible fallback link which opens the supplied Cal.com URL in a new tab. This keeps booking available if the embed is blocked, JavaScript is unavailable, or the third-party calendar fails.
- Respect `prefers-reduced-motion` for the dialog transition.

## Performance model

- Follow the Trion Scale integration principle: keep the Cal vendor code outside the initial bundle and initialise it only when the visitor requests booking.
- Do not embed an iframe in the initial page or add a calendar request to the first-load network path.
- Keep the static profile usable if Cal.com is unavailable; only the booking action degrades to its external fallback.

## Desktop banner crop

- Keep the current mobile crop exactly as approved: `object-position: right center` at widths up to 480 px.
- At widths above 480 px, bias the image toward its lower source area (approximately `center 76%`). This moves the rendered artwork upward within the shallow desktop banner and reveals the authored `Full Stack Developer` text and programming-language icons.
- Preserve the portrait overlap, lower-edge veil, silver hairline, and all content positions. No parallax or added animation is introduced.

## Verification

- Add a failing Playwright contract before implementation proving the Cal card exists, opens an accessible dialog, uses the exact booking URL for the fallback, and does not load Cal.com prior to activation.
- Validate keyboard close and backdrop close, then capture a mobile and desktop visual screenshot of the dialog.
- Add a desktop-only computed crop assertion and prove that the mobile crop remains `right center`.
- Run the focused E2E suite first, then `npm test` and `npm run build` after implementation.
- Inspect the changed mobile and desktop compositions with managed Playwright sessions, closing those sessions before the full test run.
