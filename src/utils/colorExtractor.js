import { makeCustomVariants } from "./themes";

// Generate dark and light theme variants from a single accent color
export function themeFromAccent(accent) {
  if (!accent.match(/^#[0-9a-fA-F]{3,6}$/)) return null;
  return makeCustomVariants(accent);
}

export function shiftHue(hex, degrees) {
  let h2 = hex.replace("#", "");
  if (h2.length === 3) h2 = h2[0] + h2[0] + h2[1] + h2[1] + h2[2] + h2[2];
  const num = parseInt(h2, 16);
  if (isNaN(num)) return hex;
  let r = ((num >> 16) & 255) / 255;
  let g = ((num >> 8) & 255) / 255;
  let b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue, s, l = (max + min) / 2;

  if (max === min) {
    hue = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) hue = ((b - r) / d + 2) / 6;
    else hue = ((r - g) / d + 4) / 6;
  }

  hue = ((hue * 360 + degrees) % 360) / 360;

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
    rr = hue2rgb(p, q, hue + 1 / 3);
    gg = hue2rgb(p, q, hue);
    bb = hue2rgb(p, q, hue - 1 / 3);
  }

  return `#${[rr, gg, bb]
    .map((v) => Math.round(v * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}
