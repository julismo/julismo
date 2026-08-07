# Revision 2 — Task 3: rounded QR renderer

## Scope

Implemented the rounded QR renderer and regenerated only the three QR assets. Hero and profile files were not changed.

## Renderer choices

- The trusted `qrcode` library still produces the standards-compliant matrix once with `QRCode.create(target.href, { errorCorrectionLevel: 'H' })`.
- `scripts/rounded-qr.mjs` is a small pure renderer. It emits SVG directly and high-resolution PNG buffers through `pngjs`; no canvas, jsdom, `qr-code-styling`, or native dependency was added.
- For this URL the H-level matrix is 33 modules wide. Both formats use the required 4-module quiet zone, yielding a 41-by-41-module QR image; PNG uses 40 pixels/module (1640-by-1640 pixels).
- Ordinary dark modules use a restrained `0.22` module corner radius. The three finder regions are replaced by labelled, high-contrast nested rounded structures: a dark 7-by-7 outer square, a white 5-by-5 middle square, and a dark 3-by-3 centre square.
- `julismo-card.svg` nests only the generated QR markup in its reading region. Its visual card framing, divider, and text remain outside that region.

## TDD evidence

The required test was written first in `tests/unit/rounded-qr.test.js`, before `scripts/rounded-qr.mjs` existed. It creates the H-level matrix for the approved URL and asserts the four-module viewBox margin, ordinary-module `rx="0.22"`, all three labelled finder patterns, absence of `shape-rendering="crispEdges"`, and a non-empty PNG `Buffer`.

The first attempted RED command exposed that the project configuration only included `.test.ts` files:

```text
npx vitest run tests/unit/rounded-qr.test.js
No test files found, exiting with code 1
include: tests/unit/**/*.test.ts
```

I made the minimal test-configuration-only correction to include `.test.js`, with no renderer production code present, then reran RED:

```text
npx vitest run tests/unit/rounded-qr.test.js
FAIL  tests/unit/rounded-qr.test.js
Error: Cannot find module '../../scripts/rounded-qr.mjs'
```

After adding the renderer, GREEN was observed:

```text
npx vitest run tests/unit/rounded-qr.test.js
Test Files  1 passed (1)
Tests  1 passed (1)
```

The required generation sequence also passed:

```text
npx vitest run tests/unit/rounded-qr.test.js && npm run generate:qr
Test Files  1 passed (1)
Tests  1 passed (1)
QR code generated for https://julismo.vercel.app/
```

Additional fresh verification:

```text
npm run check
Result (21 files): 0 errors, 0 warnings, 0 hints

npm run test:unit
Test Files  4 passed (4)
Tests  11 passed (11)
```

## Independent OpenCV decodes

The PNG was decoded directly. Both SVG assets were first rasterized with CairoSVG at 2048 pixels wide and then decoded with OpenCV, using this command:

```powershell
@'
from pathlib import Path
from tempfile import TemporaryDirectory
import cairosvg
import cv2

assets = [
    ('public/qr/julismo.png', None),
    ('public/qr/julismo.svg', 'julismo-raster.png'),
    ('public/qr/julismo-card.svg', 'julismo-card-raster.png'),
]
expected = 'https://julismo.vercel.app/'
with TemporaryDirectory() as directory:
    directory = Path(directory)
    for source, raster_name in assets:
        if raster_name:
            raster = directory / raster_name
            cairosvg.svg2png(url=source, write_to=str(raster), output_width=2048, output_height=2048 if 'card' not in source else 2408)
            image_path = raster
        else:
            image_path = Path(source)
        image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
        value, points, _ = cv2.QRCodeDetector().detectAndDecode(image)
        print(f'{source}: {value!r} | detected={points is not None} | shape={image.shape[1]}x{image.shape[0]}')
        if value != expected:
            raise SystemExit(f'Decode failed for {source}')
'@ | python -
```

Results:

```text
public/qr/julismo.png: 'https://julismo.vercel.app/' | detected=True | shape=1640x1640
public/qr/julismo.svg: 'https://julismo.vercel.app/' | detected=True | shape=2048x2048
public/qr/julismo-card.svg: 'https://julismo.vercel.app/' | detected=True | shape=2048x2408
```

## Package and test-runner changes

- Added direct dev dependency `pngjs@^5.0.0` and its package-lock root entry. The package was already transitively present through `qrcode`; declaring it directly makes the renderer's dependency explicit.
- Extended Vitest's unit-test include pattern to include the mandated JavaScript renderer test (`tests/unit/**/*.test.{js,ts}`).

## Commit

Implementation commit: `bb32e2f` (`feat: render rounded branded QR assets`).

## Self-review and concerns

- Reviewed the staged file list and `git diff --check`; only the intended generator, renderer, test/test configuration, dependency metadata, and three QR assets were committed. The unrelated pre-existing untracked planning/specification documents were left untouched.
- The artefacts decode successfully with OpenCV at native/high-resolution raster sizes. No functional concern remains for the requested scope.
- Browser end-to-end tests were not run because this task only changes generated static QR assets and the standalone renderer; type checking and the complete unit suite were run.
