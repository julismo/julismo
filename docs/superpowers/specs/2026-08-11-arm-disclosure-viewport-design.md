# ARM disclosure viewport design

## Context

At 320px wide, opening the ARM Solutions `<details>` grows the disclosure from
the bottom of the viewport. The carousel is not clipped by CSS and the page has
no horizontal overflow, but the browser leaves `scrollY` unchanged. The first
viewport therefore shows only part of the new panel, which reads as a broken
or cut-off card.

## Decision

Keep the native `<details>/<summary>` structure and the existing card geometry.
On an opening `toggle`, wait for the browser to lay out the panel. If the fully
opened disclosure extends below the usable viewport, scroll its summary into
the top of the viewport with `block: 'start'`. The page must only move when
needed; a disclosure already contained in the viewport must not scroll.

The scroll uses `behavior: 'smooth'` by default and `behavior: 'auto'` for
`prefers-reduced-motion: reduce`. The summary receives a small scroll margin so
the card does not land flush against the viewport edge.

The panel also receives a short opacity/vertical reveal animation while it
opens. This is decorative only and is disabled under reduced motion. It must
not change the card dimensions, carousel timings, link ordering, or keyboard
semantics.

## Acceptance criteria

- At 320px and 390px, opening ARM from the initial profile position brings the
  entire disclosure within the viewport when it would otherwise exceed it.
- The browser does not auto-scroll if the opened disclosure already fits.
- There is no horizontal overflow at supported widths.
- Selected slide, tabs, chips, CTA and surrounding LinkedIn/GitHub links remain
  available and keyboard-operable.
- Reduced-motion users receive no smooth scroll or reveal animation.
- The change has a Playwright regression test that fails on the current
  behavior and passes after the fix.
