/**
 * Visual DNA — per-slide randomized visual identity.
 *
 * Each slide in a carousel gets its own DNA that controls:
 *   bgVariant   — how the background is colored
 *   frame       — border/accent bar treatment
 *   align       — text alignment
 *   deco        — decorative element style
 *   headlineScale — relative headline size tweak
 *   accentText  — whether headline uses accent color
 */

// ── Options pools ──

const BG_VARIANTS = [
  "dark",        // default card bg
  "light",       // white/light bg
  "accent",      // full accent color bg
  "accent-soft", // very subtle accent tint
  "gradient",    // diagonal gradient using accent
];

const FRAME_STYLES = [
  "none",            // clean, no frame
  "bar-left",        // accent bar on left edge
  "bar-top",         // accent bar across top
  "bar-bottom",      // accent bar across bottom
  "bar-left-thick",  // thick accent bar left
  "corner-tl",       // accent corner mark top-left
  "corner-br",       // accent corner mark bottom-right
  "corners",         // accent marks on two opposing corners
  "border",          // thin full accent border
  "border-partial",  // border on 3 sides (open bottom)
];

const ALIGNS = ["left", "center"];

const DECO_STYLES = [
  "none",            // clean
  "circle-large",    // large semi-transparent circle
  "circle-duo",      // two overlapping circles
  "dots-grid",       // grid of small dots
  "diagonal-line",   // thin diagonal accent line
  "gradient-blob",   // soft gradient blob
  "corner-geo",      // geometric shape in corner
  "stripe-thin",     // thin horizontal stripe
  "number-watermark", // large ghost number
];

const HEADLINE_SCALES = [0.92, 0.96, 1.0, 1.0, 1.05, 1.1, 1.18];

// ── Helpers ──

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted(options, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

// ── Smart sequencing ──
// Instead of pure random, we sequence so adjacent slides never look the same

function sequenceBgs(count) {
  // Ensure variety: cover=dark or accent, middle=mix, cta=accent or gradient
  const result = [];
  const pool = [...BG_VARIANTS];
  let last = "";
  for (let i = 0; i < count; i++) {
    const isFirst = i === 0;
    const isLast = i === count - 1;
    let options, weights;
    if (isFirst) {
      // Cover: favor dark or accent for impact
      options = ["dark", "accent", "gradient"];
      weights = [3, 4, 2];
    } else if (isLast) {
      // CTA: favor accent or gradient
      options = ["accent", "gradient", "dark"];
      weights = [4, 3, 2];
    } else {
      // Middle: all options but avoid repeating
      options = BG_VARIANTS.filter((b) => b !== last);
      weights = options.map(() => 1);
    }
    const chosen = pickWeighted(options, weights);
    result.push(chosen);
    last = chosen;
  }
  return result;
}

function sequenceFrames(count) {
  const result = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    const available = FRAME_STYLES.filter((f) => !used.has(f) || used.size >= FRAME_STYLES.length);
    const chosen = pick(available);
    result.push(chosen);
    used.add(chosen);
    // Reset pool if exhausted
    if (used.size >= FRAME_STYLES.length) used.clear();
  }
  return result;
}

function sequenceAligns(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    // Cover and CTA tend center, others mix
    const isFirst = i === 0;
    const isLast = i === count - 1;
    if (isFirst || isLast) {
      result.push(pickWeighted(["left", "center"], [3, 5]));
    } else {
      result.push(pickWeighted(["left", "center"], [6, 3]));
    }
  }
  return result;
}

function sequenceDecos(count) {
  const result = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    const available = DECO_STYLES.filter((d) => !used.has(d) || used.size >= DECO_STYLES.length);
    const chosen = pick(available);
    result.push(chosen);
    used.add(chosen);
    if (used.size >= DECO_STYLES.length) used.clear();
  }
  return result;
}

// ── Public API ──

/**
 * Generate visual DNA for an entire carousel.
 * Uses smart sequencing so adjacent slides contrast.
 */
export function generateCarouselDna(slideCount) {
  const bgs = sequenceBgs(slideCount);
  const frames = sequenceFrames(slideCount);
  const aligns = sequenceAligns(slideCount);
  const decos = sequenceDecos(slideCount);

  return Array.from({ length: slideCount }, (_, i) => ({
    bg: bgs[i],
    frame: frames[i],
    align: aligns[i],
    deco: decos[i],
    headlineScale: pick(HEADLINE_SCALES),
    accentText: Math.random() < 0.25, // 25% chance headline uses accent color
  }));
}

/**
 * Generate DNA for a single slide (for regeneration).
 */
export function generateSlideDna() {
  return {
    bg: pick(BG_VARIANTS),
    frame: pick(FRAME_STYLES),
    align: pick(ALIGNS),
    deco: pick(DECO_STYLES),
    headlineScale: pick(HEADLINE_SCALES),
    accentText: Math.random() < 0.25,
  };
}

/**
 * Default DNA (classic look, no randomization).
 */
export function defaultDna() {
  return { bg: "dark", frame: "bar-left", align: "left", deco: "none", headlineScale: 1.0, accentText: false };
}

/**
 * All option labels for UI selectors.
 */
export const DNA_OPTIONS = {
  bg: BG_VARIANTS.map((v) => ({ id: v, label: v.replace("-", " ") })),
  frame: FRAME_STYLES.map((v) => ({ id: v, label: v.replace(/-/g, " ") })),
  align: ALIGNS.map((v) => ({ id: v, label: v })),
  deco: DECO_STYLES.map((v) => ({ id: v, label: v.replace(/-/g, " ") })),
};
