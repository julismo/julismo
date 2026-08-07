# Inverted QR Design

## Decision

The Canva business-card artwork has a black field. The reusable Julismo QR will therefore use white QR modules on a solid black reading field, matching the supplied card reference rather than presenting a black-on-white code.

## Alternatives considered

1. **White modules on black (selected).** Matches the card and gives the requested visual continuity. It remains high-contrast and is verified from all generated formats before release.
2. Black modules on white. This is the most universally conventional QR treatment, but clashes with the approved card composition.
3. Ship both treatments. This would preserve a fallback but adds an unnecessary choice and risks the wrong file being placed in Canva.

## Rendering contract

- The target remains exactly `https://julismo.vercel.app/` and error correction remains level H.
- `julismo.svg`, `julismo.png`, and the nested QR in `julismo-card.svg` use a black field, white rounded data modules, and three inverse rounded finder patterns: white outer ring, black separator, white centre.
- A continuous four-module black quiet zone surrounds the QR matrix. No logo, text, wave art, or other decoration enters that reading region.
- The card SVG may keep its existing silver decoration only outside the QR reading area.
- The QR stays locally generated and static. It has no provider, scan quota, or expiry; it only needs regeneration if the target URL changes.

## Verification

- Extend the renderer test to assert the inverted colour contract together with its protected quiet zone and rounded finder geometry.
- Regenerate all three output assets.
- Decode the PNG, plain SVG, and card SVG after rasterisation using OpenCV. Each must return the exact target URL.
- Run the full repository verification and copy the confirmed PNG to `C:\Users\julis\Downloads\QR-JULISMO-FINAL.png` for Canva.

