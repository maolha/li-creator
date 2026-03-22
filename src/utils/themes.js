export const THEMES = {
  "Midnight Pro": {
    bg: "#08090D",
    card: "#0F1117",
    accent: "#4F8EF7",
    soft: "rgba(79,142,247,0.10)",
    text: "#F0F0F8",
    muted: "#7878A0",
    border: "rgba(79,142,247,0.15)",
    gradient: "linear-gradient(135deg, #4F8EF7, #7C5CFC)",
  },
  "Swiss Minimal": {
    bg: "#F4F3EF",
    card: "#FFFFFF",
    accent: "#1A1A2E",
    soft: "rgba(26,26,46,0.06)",
    text: "#1A1A2E",
    muted: "#888899",
    border: "rgba(26,26,46,0.10)",
    gradient: "linear-gradient(135deg, #1A1A2E, #2D2D4E)",
  },
  "Signal Red": {
    bg: "#0B0B0B",
    card: "#141414",
    accent: "#E83A3A",
    soft: "rgba(232,58,58,0.10)",
    text: "#F5F5F5",
    muted: "#808080",
    border: "rgba(232,58,58,0.18)",
    gradient: "linear-gradient(135deg, #E83A3A, #FF6B35)",
  },
  "Ocean Depth": {
    bg: "#060D14",
    card: "#0C1520",
    accent: "#00D4AA",
    soft: "rgba(0,212,170,0.08)",
    text: "#E8F0F0",
    muted: "#607080",
    border: "rgba(0,212,170,0.15)",
    gradient: "linear-gradient(135deg, #00D4AA, #0099FF)",
  },
  "Royal Gold": {
    bg: "#0C0A08",
    card: "#141210",
    accent: "#D4A853",
    soft: "rgba(212,168,83,0.08)",
    text: "#F0ECE4",
    muted: "#8A8070",
    border: "rgba(212,168,83,0.15)",
    gradient: "linear-gradient(135deg, #D4A853, #F0C060)",
  },
  "Lavender Haze": {
    bg: "#F8F6FC",
    card: "#FFFFFF",
    accent: "#7C5CFC",
    soft: "rgba(124,92,252,0.07)",
    text: "#2A2040",
    muted: "#9088A8",
    border: "rgba(124,92,252,0.12)",
    gradient: "linear-gradient(135deg, #7C5CFC, #E040FB)",
  },
};

export function contrastText(hex) {
  try {
    // Handle shorthand hex
    let h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return "#F5F5F5";
    // WCAG relative luminance
    const srgb = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    // Contrast ratio against white vs black — pick whichever is higher
    const contrastWhite = (1.05) / (L + 0.05);
    const contrastBlack = (L + 0.05) / 0.05;
    return contrastWhite > contrastBlack ? "#FFFFFF" : "#111111";
  } catch {
    return "#F5F5F5";
  }
}
