// Each theme defines an accent + gradient. Dark/light variants are derived.
const THEME_ACCENTS = {
  "Midnight Pro": { accent: "#4F8EF7", gradient: "linear-gradient(135deg, #4F8EF7, #7C5CFC)" },
  "Swiss Minimal": { accent: "#1A1A2E", gradient: "linear-gradient(135deg, #1A1A2E, #2D2D4E)" },
  "Signal Red": { accent: "#E83A3A", gradient: "linear-gradient(135deg, #E83A3A, #FF6B35)" },
  "Ocean Depth": { accent: "#00D4AA", gradient: "linear-gradient(135deg, #00D4AA, #0099FF)" },
  "Royal Gold": { accent: "#D4A853", gradient: "linear-gradient(135deg, #D4A853, #F0C060)" },
  "Lavender Haze": { accent: "#7C5CFC", gradient: "linear-gradient(135deg, #7C5CFC, #E040FB)" },
};

function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  if (isNaN(n)) return { r: 128, g: 128, b: 128 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function makeDark(accent, gradient) {
  const { r, g, b } = hexToRgb(accent);
  return {
    bg: "#08090D",
    card: "#0F1117",
    accent,
    soft: `rgba(${r},${g},${b},0.10)`,
    text: "#F0F0F8",
    muted: "#7878A0",
    border: `rgba(${r},${g},${b},0.15)`,
    gradient,
  };
}

function makeLight(accent, gradient) {
  const { r, g, b } = hexToRgb(accent);
  const isDarkAccent = contrastText(accent) === "#FFFFFF";
  return {
    bg: "#F4F3EF",
    card: "#FFFFFF",
    accent,
    soft: `rgba(${r},${g},${b},0.07)`,
    text: isDarkAccent ? accent : "#1A1A2E",
    muted: "#888899",
    border: `rgba(${r},${g},${b},0.12)`,
    gradient,
  };
}

// Build both variants for all built-in themes
export function getThemeVariants() {
  const dark = {};
  const light = {};
  for (const [name, { accent, gradient }] of Object.entries(THEME_ACCENTS)) {
    dark[name] = makeDark(accent, gradient);
    light[name] = makeLight(accent, gradient);
  }
  return { dark, light };
}

// For custom themes from brand grabber / hex input
export function makeCustomVariants(accent, gradient) {
  const g = gradient || `linear-gradient(135deg, ${accent}, ${accent})`;
  return {
    dark: makeDark(accent, g),
    light: makeLight(accent, g),
  };
}

// Legacy export — returns themes for a given mode
export function getThemes(mode = "dark") {
  const { dark, light } = getThemeVariants();
  return mode === "dark" ? dark : light;
}

export function contrastText(hex) {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return "#F5F5F5";
    const srgb = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    const contrastWhite = 1.05 / (L + 0.05);
    const contrastBlack = (L + 0.05) / 0.05;
    // Slight bias toward white — on saturated colors white is
    // perceptually more readable when ratios are close
    // Strong bias toward white — dark text on colored backgrounds
    // is almost never readable. Only use dark on truly light colors.
    return L < 0.4 ? "#FFFFFF" : "#1A1A2E";
  } catch {
    return "#F5F5F5";
  }
}
