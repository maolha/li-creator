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
    const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(
      (x) => parseInt(x, 16)
    );
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.45
      ? "#111111"
      : "#F5F5F5";
  } catch {
    return "#F5F5F5";
  }
}
