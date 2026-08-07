# iOS Gyroscope Permission Design

## Goal

Deliver the approved subtle profile-plane gyroscope effect on supported devices, including iPhone Safari, without overriding a visitor's reduced-motion preference.

## Root cause

The existing client script detects Safari's `DeviceOrientationEvent.requestPermission` API and immediately marks motion as static. It never invokes the required user-gesture permission request, so iPhone Safari can never subscribe to orientation events.

## Behaviour

- Android and browsers that expose orientation events without a permission API continue to enable motion automatically.
- On an iPhone/iPad browser that exposes `requestPermission`, the hero exposes one small, explicit `Ativar movimento` action. It is a one-time browser permission affordance, not a persistent settings toggle.
- A granted result hides the action, subscribes once to `deviceorientation`, calibrates from the first finite sample, and applies the existing bounded/smoothed tilt values.
- A denied or failed request hides the action and leaves the page static. It must not repeatedly prompt the visitor.
- When `prefers-reduced-motion: reduce` is active, no permission action appears and all motion remains disabled.

## Presentation and accessibility

- The action is initially hidden in markup, has an explicit Portuguese accessible name, and appears only when Safari requires permission.
- It uses the established understated silver/dark visual language and sits below the bio, not inside or over a contact card.
- The existing card destinations, Cal dialog, layout, scroll behaviour, and QR assets remain unchanged.

## Verification

- Playwright simulates Safari's permission API before page load and first proves the current implementation lacks the visible permission action.
- After implementation, the test verifies the permission action, a granted state, two orientation samples, and a non-zero tilt CSS custom property.
- Existing reduced-motion coverage verifies the action does not appear for visitors who request reduced motion.
- Run the complete local suite and build, then perform a production smoke test. A physical iPhone Safari pass remains the final device-specific confirmation because Chromium emulation is not Mobile Safari.
