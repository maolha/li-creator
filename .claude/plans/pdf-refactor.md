# PDF Export Refactor Plan

## Problem
`buildPdf.js` renders slides as static HTML that ignores all visual settings the user has configured:
- **Intensity** (clean/bold/dramatic) — always renders "clean"
- **Background mode** (default/light/invert) — always uses default dark theme colors
- **Brand fonts** (heading + body + weights) — always uses DM Serif Display 400
- **Aspect ratio** (1:1/4:5/16:9) — always renders 190x190mm square
- **Background image** (subtle/strong) — never included
- **Logo overlay** — never included
- **Ghost numbers** — always shown (no on/off/middle setting)
- **Per-slide label** — always shows `brand`, ignores `s.label`
- **Invert mode accent swap** — not handled

## Current Architecture
- `buildPdf(slides, brand, T)` — takes only slides array, brand string, and theme object
- Returns a self-contained HTML string with inline styles
- Opens in new window, triggers `window.print()` after fonts load
- Each slide is a 190x190mm page with hardcoded decorations

## Proposed Changes

### Phase 1: Pass all settings through
Update the function signature:
```js
export function buildPdf(slides, brand, T, options = {}) {
  const {
    intensity = "clean",
    bgMode = "default",
    slideAspect = "1:1",
    brandFonts = {},      // { heading, headingWeight, body, bodyWeight }
    brandBgImage = null,
    bgImageMode = "off",
    logoConfig = {},      // { show, position }
    brandLogos = {},      // { light, dark }
    ghostNumbers = "on",
  } = options;
}
```

Update the call site in App.jsx `downloadPDF()`:
```js
const html = buildPdf(slides, brand, T, {
  intensity, bgMode: slideBgMode, slideAspect,
  brandFonts: activeBrand?.fonts,
  brandBgImage: activeBrand?.backgroundImage,
  bgImageMode, logoConfig: slideLogo,
  brandLogos: activeBrand?.logos, ghostNumbers,
});
```

### Phase 2: Aspect ratio support
Map aspect ratios to page sizes:
- 1:1 → 190mm × 190mm (current)
- 4:5 → 190mm × 237.5mm
- 16:9 → 190mm × 106.9mm

Update `@page` size dynamically based on `slideAspect`.

### Phase 3: Font support
- Add brand heading + body fonts to the Google Fonts `<link>` tag
- Use `brandFonts.heading` in all `<h1>`/`<h2>` font-family declarations
- Map weight names to CSS values: light=300, medium=500, bold=700, black=900
- Use `brandFonts.body` for body text `<p>` font-family

### Phase 4: Background mode
Apply bgMode to each slide:
- **default**: use `T.card` as background (current behavior)
- **light**: use `#FFFFFF` as background, `#1A1A2E` for text
- **invert**: use `T.accent` as background, contrast text for all elements, swap accent to contrast color for decorations

### Phase 5: Intensity
Port the intensity specs from `intensityStyles.js` into the PDF builder:
- **clean**: current behavior (keep as-is)
- **bold**: larger fonts, gradient stat panel, thicker accent bars, texture overlays
- **dramatic**: full-bleed accent backgrounds on cover/quote, oversized ghost text, diagonal stripes

This is the most complex phase — each of the 5 slide types × 3 intensities = 15 variants.
Approach: create a `getPdfSpec(type, intensity)` function that returns font sizes, padding, decoration HTML strings.

### Phase 6: Background image
When `bgImageMode !== "off"` and `brandBgImage` is set:
- Add the image as a `background-image` on each slide div
- Apply opacity via a color overlay div (same approach as SlideRenderer)
- `subtle`: 10% opacity image, 82% color overlay
- `strong`: 50% opacity image, gradient overlay

Note: base64 images will make the PDF HTML very large. URL-based images are preferred.

### Phase 7: Logo overlay
When `logoConfig.show` matches the slide position:
- Add an `<img>` with absolute positioning matching the `logoConfig.position`
- Auto-select light/dark logo based on background brightness
- Respect per-slide `s.logoVersion` override

### Phase 8: Ghost numbers & per-slide labels
- Ghost numbers: render the oversized background number only when `ghostNumbers !== "off"` and not on first/last for "middle" mode
- Per-slide labels: use `s.label ?? brand` instead of always `brand`
- Hide counter when logo is showing

### Implementation Order
1. Signature + call site update (quick)
2. Aspect ratio (quick)
3. Fonts (medium)
4. Background mode (medium)
5. Per-slide labels + ghost numbers (quick)
6. Logo overlay (medium)
7. Background image (medium)
8. Intensity (complex — do last, can be incremental)

### Files to modify
- `src/utils/buildPdf.js` — main refactor
- `src/App.jsx` — update `downloadPDF()` call to pass all options

### Risk
- PDF rendering uses browser print engine, not React — so we can't reuse SlideInner directly
- Fonts may not load in time for print — current `document.fonts.ready` approach handles this
- Base64 background images may exceed browser memory for print — use URL-based only
- Intensity "dramatic" with diagonal stripes requires CSS transforms in print — test browser support

### Estimated effort
- Phases 1-5: ~1-2 hours
- Phases 6-7: ~1 hour
- Phase 8 (intensity): ~2-3 hours
- Total: ~4-6 hours
