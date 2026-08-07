# Desktop Banner and Layout Polish Design

## Objective

Refine the personal profile at `julismo.vercel.app` so that the desktop cover image preserves the programming-language artwork, the desktop scrollbar does not look permanently imposed by the site, and the hierarchy of the link cards remains deliberate on both desktop and mobile.

The mobile layout must retain its current direct, touch-friendly character. This is a visual polish pass; it must not change the destination or interaction of any link, the Cal.com dialog, email, QR assets, or motion-consent behaviour.

## Evidence and root causes

At a 1440 by 900 desktop viewport, the current document height equals the viewport height (`scrollHeight = clientHeight = 900`), so there is no content overflow at the reference size. The visual impression of a permanent scrollbar comes from the global custom scrollbar track, not from an intentionally scrollable page.

The banner asset is 1584 by 396 (4:1), but the desktop banner is 1440 by 210 (about 6.9:1). `object-fit: cover` therefore removes a large vertical portion of the image. The current image position and dark lower gradient put the `Full Stack Developer` text and technology icons in the cropped/faded zone.

The `TRABALHO` label is placed in a centred page column with only one item below it. Even though the text itself is left-aligned, it reads as a detached central divider rather than a useful section heading.

## Alternatives considered

### A. Full-width desktop cards

Cards would expand across most or all of the browser viewport. This increases empty horizontal travel and makes the profile resemble an application dashboard rather than a focused personal landing page. It is rejected.

### B. Contained cards with a slightly wider desktop column (selected)

Cards remain a single, centred conversion column. On mobile, they use all of the content column with safe 12–16 px side gutters. From tablet/desktop upward, the column may widen modestly to about 430 px, never to the full viewport. This retains the Linktree-style scan pattern while giving desktop copy more breathing room.

### C. Preserve the complete banner by letterboxing or distorting it

`object-fit: contain` would preserve all pixels but leave empty lateral areas; stretching would distort the supplied artwork. Both weaken the intended cover treatment and are rejected.

## Approved visual design

### Responsive card column

- At mobile widths, retain a full-width content column inside 12–16 px safe gutters. Every card fills that column, so the whole card remains a generous touch target.
- At desktop widths, widen the maximum column from the current narrow presentation to approximately 430 px, with comfortable outer gutters. Cards do not extend from browser edge to browser edge.
- The primary WhatsApp card remains visually primary. Card height, copy, icons, and arrow action remain consistent across the column.

### Section hierarchy

- Replace the detached `TRABALHO` label with `SOLUÇÕES` above the ARM Solutions card.
- Align that label with the card copy column (rather than the visual centre of the browser or an arbitrary divider). Its purpose is to make the ARM card read as a business solution, not to create a large standalone heading.
- Do not introduce project thumbnails, video, or additional content in this pass.

### Desktop banner

- Keep the full-bleed cover only in the hero; the rest of the page stays constrained.
- On desktop/tablet, give the cover enough vertical room (roughly 230–240 px at common desktop widths) and align the image toward its lower content area so the `Full Stack Developer` line and technology icons are fully legible.
- Move the dark transition lower and reduce its opacity over the language row. The fine luminous boundary at the lower edge remains, giving the cover a clear but subtle end before the portrait overlap.
- The existing mobile framing stays unchanged, because it already presents the supplied artwork well at narrow widths.

### Scrollbar and zoom behaviour

- Do not force vertical scrolling and do not hide scroll capability.
- Remove the heavy custom track that appears as a persistent dark strip on desktop systems that reserve scrollbar space. When a page genuinely overflows (for example at a short viewport or browser zoom), the native/browser scrollbar remains available and usable.
- Preserve `overflow-x: clip` and verify there is no horizontal scroll at mobile, desktop, or common zoomed desktop widths.
- At the 1440 by 900 reference viewport and 100% zoom, layout must not create vertical overflow solely because of this polish.

## Accessibility and interaction constraints

- Every full card remains a semantic link with its existing accessible name and keyboard focus treatment.
- The section label is presentational context only and must not disrupt navigation landmark semantics.
- No mouse-only scrollbar affordance is introduced. Keyboard, mouse wheel, trackpad, and touch scrolling remain browser-native whenever overflow exists.
- `prefers-reduced-motion`, the motion-consent button, Cal.com modal, and outbound link behaviour remain untouched.

## Validation

- Add/adjust desktop and mobile Playwright assertions for the constrained card column, safe mobile gutters, banner geometry, and absence of horizontal overflow.
- Run the complete project quality gate (`npm test`) and production build.
- Capture and inspect 390 by 844 mobile and 1440 by 900 desktop screenshots. Confirm that mobile cards are nearly full width but not flush to the viewport, the desktop cover displays the complete language row, the section label is visually attached to ARM, and no horizontal overflow is present.
- Manually check the desktop page at common browser zoom levels. If the document overflows due to the available viewport height, scrolling must remain native and usable without a forced, decorative track.

## Out of scope

- New project/case-study content, video, gallery, or image cards.
- Changes to links, contact data, QR destination/assets, deployment settings, or analytics.
- Changes to the iPhone motion permission flow.
