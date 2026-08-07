# Intentional Mobile Scroll Design

## Goal

Keep the profile feeling like a focused link-in-bio page while allowing its complete content to remain reachable on shorter mobile viewports.

## Behaviour

- At desktop dimensions, the page continues to fit in one viewport and has no forced vertical scroll.
- At mobile dimensions, the document keeps the browser's native vertical scroll and touch momentum. At 390 by 844, the approximately 88 px continuation reveals the footer without hiding the primary contact or diagnosis actions.
- The existing mobile bottom breathing room (`max(72px, 10svh)`) remains the safe area that prevents the footer from ending against the browser edge.
- The fixed background illumination remains fixed while content scrolls; the hero artwork is decorative and naturally leaves the viewport with the document.

## Explicit non-goals

- No horizontal scroll, internal scroll container, fake scrollbar, scroll snap, auto-scroll, parallax, or JavaScript scroll listener.
- No global `scroll-behavior: smooth`: it does not improve physical touch or trackpad scrolling and would only alter programmatic navigation.
- No separate textual scroll cue. The visible continuation of the content is sufficient and avoids competing with the six card actions.

## Accessibility and resilience

- Preserve the existing reduced-motion behaviour and normal keyboard traversal.
- Preserve the existing narrow-width protection: document `scrollWidth` must not exceed the viewport width.
- Do not change link targets, card sizing, the Cal dialog, gyroscope behaviour, or desktop composition.

## Verification

- At 390 by 844, native wheel/touch scrolling reaches the footer with a small real document scroll.
- At 1440 by 1000, the page has no vertical scroll.
- After the mobile scroll, the fixed illuminated backdrop is still visible and there is no horizontal overflow.
- Inspect top and post-scroll mobile screenshots to ensure the result remains calm and intentional.
