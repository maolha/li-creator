// Generate a full theme from a single accent color
export function themeFromAccent(accent, mode = "dark") {
  const rgb = hexToRgb(accent);
  if (!rgb) return null;

  const lum = luminance(rgb);
  const isDarkAccent = lum < 0.4;

  if (mode === "dark") {
    return {
      bg: "#08090D",
      card: "#0F1117",
      accent,
      soft: `rgba(${rgb.r},${rgb.g},${rgb.b},0.10)`,
      text: "#F0F0F8",
      muted: "#7878A0",
      border: `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`,
      gradient: `linear-gradient(135deg, ${accent}, ${shiftHue(accent, 30)})`,
    };
  }

  return {
    bg: "#F6F5F2",
    card: "#FFFFFF",
    accent,
    soft: `rgba(${rgb.r},${rgb.g},${rgb.b},0.07)`,
    text: isDarkAccent ? accent : "#1A1A2E",
    muted: "#888899",
    border: `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`,
    gradient: `linear-gradient(135deg, ${accent}, ${shiftHue(accent, 30)})`,
  };
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function luminance({ r, g, b }) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function shiftHue(hex, degrees) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  h = ((h * 360 + degrees) % 360) / 360;

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  let rr, gg, bb;
  if (s === 0) {
    rr = gg = bb = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rr = hue2rgb(p, q, h + 1 / 3);
    gg = hue2rgb(p, q, h);
    bb = hue2rgb(p, q, h - 1 / 3);
  }

  return `#${[rr, gg, bb]
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}
