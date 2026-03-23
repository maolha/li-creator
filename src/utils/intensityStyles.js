import { contrastText } from "./themes";

const SS = 540;

export function getIntensitySpec(type, intensity, T, textLen) {
  const l = textLen || 0;
  const ct = contrastText(T.accent);
  const specs = SPECS[type];
  if (!specs) return specs_clean(type, T, l, ct);
  const fn = specs[intensity] || specs.clean;
  return fn(T, l, ct);
}

// ── COVER ──
const coverSpecs = {
  clean: (T, l, ct) => ({
    bg: T.card,
    textColor: T.text,
    bodyColor: T.muted,
    headlineSize: l > 28 ? 52 : l > 20 ? 62 : 74,
    headlineLH: 1.08,
    headlineItalic: true,
    bodySize: 17,
    padding: "44px 50px",
    accentBarW: 7,
    pillVariant: "default",
    decorations: [
      { type: "accentBar", top: 0, left: 0, width: 7, height: SS, color: T.accent },
      { type: "circle", top: -90, right: -90, size: 380, fill: T.accent, opacity: 0.09 },
      { type: "circle", bottom: -110, left: -60, size: 420, border: `2px solid ${T.accent}`, opacity: 0.06 },
    ],
  }),
  bold: (T, l, ct) => ({
    bg: T.card,
    textColor: T.text,
    bodyColor: T.muted,
    headlineSize: l > 28 ? 58 : l > 20 ? 70 : 82,
    headlineLH: 1.04,
    headlineItalic: false,
    bodySize: 18,
    padding: "40px 46px",
    accentBarW: 10,
    pillVariant: "filled",
    decorations: [
      { type: "accentBar", top: 0, left: 0, width: 10, height: SS, color: T.accent },
      { type: "stripe", top: 0, height: 12, gradient: T.gradient || T.accent },
      { type: "circle", top: -80, right: -80, size: 450, fill: T.accent, opacity: 0.15 },
      { type: "circle", bottom: -100, left: -50, size: 480, fill: T.accent, opacity: 0.08 },
      { type: "texture" },
    ],
  }),
  dramatic: (T, l, ct) => ({
    bg: T.accent,
    textColor: ct,
    bodyColor: ct,
    bodyOpacity: 0.8,
    headlineSize: l > 28 ? 62 : l > 20 ? 76 : 90,
    headlineLH: 1.0,
    headlineItalic: true,
    bodySize: 16,
    padding: "50px 54px",
    accentBarW: 0,
    pillVariant: "light",
    decorations: [
      { type: "gradientOverlay", gradient: `linear-gradient(160deg, ${T.accent} 40%, rgba(0,0,0,0.3))`, opacity: 1 },
      { type: "ghostText", text: (l > 0 ? "" : ""), fontSize: 180, opacity: 0.06, bottom: -10, right: -10, color: ct, rotate: -8 },
    ],
  }),
};

// ── INSIGHT ──
const insightSpecs = {
  clean: (T, l, ct) => ({
    bg: T.card,
    textColor: T.text,
    bodyColor: T.muted,
    headlineSize: l > 35 ? 38 : l > 24 ? 46 : 54,
    headlineLH: 1.18,
    bodySize: 16,
    barW: 8,
    dividerW: 50, dividerH: 4,
    ghostSize: 250, ghostOpacity: 0.04,
    padding: "44px 46px 40px 40px",
    decorations: [
      { type: "accentBar", top: 0, left: 0, width: 8, height: SS, color: T.accent },
    ],
  }),
  bold: (T, l, ct) => ({
    bg: T.card,
    textColor: T.text,
    bodyColor: T.muted,
    headlineSize: l > 35 ? 42 : l > 24 ? 52 : 60,
    headlineLH: 1.12,
    bodySize: 17,
    barW: 12,
    dividerW: 64, dividerH: 5,
    ghostSize: 300, ghostOpacity: 0.08,
    padding: "40px 42px 36px 40px",
    decorations: [
      { type: "accentBar", top: 0, left: 0, width: 12, height: SS, gradient: T.gradient || T.accent },
      { type: "texture" },
    ],
  }),
  dramatic: (T, l, ct) => ({
    bg: T.card,
    textColor: T.text,
    bodyColor: T.text,
    bodyOpacity: 0.7,
    headlineSize: l > 35 ? 46 : l > 24 ? 56 : 66,
    headlineLH: 1.06,
    bodySize: 15,
    barW: 0,
    dividerW: 80, dividerH: 3,
    ghostSize: 400, ghostOpacity: 0.06,
    padding: "36px 40px 36px 36px",
    decorations: [
      { type: "stripe", top: 0, height: 80, color: T.accent },
      { type: "gradientOverlay", gradient: `radial-gradient(ellipse at bottom right, ${T.accent}25, transparent 60%)`, opacity: 1 },
    ],
  }),
};

// ── STAT ──
const statSpecs = {
  clean: (T, l, ct) => ({
    panelW: 220,
    panelBg: T.accent,
    statSize: (sl) => sl > 5 ? 70 : sl > 3 ? 90 : 112,
    labelSize: 12,
    headlineSize: 36,
    bodySize: 15,
    decorations: [
      { type: "circle", top: -50, right: -50, size: 170, fill: "rgba(255,255,255,0.08)" },
      { type: "circle", bottom: -30, left: -30, size: 130, fill: "rgba(0,0,0,0.07)" },
    ],
  }),
  bold: (T, l, ct) => ({
    panelW: 250,
    panelBg: T.gradient || T.accent,
    statSize: (sl) => sl > 5 ? 78 : sl > 3 ? 100 : 126,
    labelSize: 14,
    headlineSize: 40,
    bodySize: 16,
    decorations: [
      { type: "circle", top: -40, right: -40, size: 220, fill: "rgba(255,255,255,0.12)" },
      { type: "circle", bottom: -25, left: -25, size: 170, fill: "rgba(0,0,0,0.10)" },
      { type: "texture" },
    ],
  }),
  dramatic: (T, l, ct) => ({
    panelW: 300,
    panelBg: T.accent,
    statSize: (sl) => sl > 5 ? 88 : sl > 3 ? 116 : 150,
    labelSize: 11,
    labelSpacing: "0.14em",
    headlineSize: 34,
    bodySize: 15,
    decorations: [],
  }),
};

// ── QUOTE ──
const quoteSpecs = {
  clean: (T, l, ct) => ({
    bg: T.card,
    textColor: T.text,
    bodyColor: T.muted,
    headlineSize: l > 42 ? 30 : l > 28 ? 37 : 45,
    headlineLH: 1.33,
    quoteMarkSize: 180,
    quoteMarkOpacity: 0.17,
    quoteMarkPosition: "top-left",
    padding: "40px 50px",
    decorations: [],
  }),
  bold: (T, l, ct) => ({
    bg: T.card,
    textColor: T.text,
    bodyColor: T.muted,
    headlineSize: l > 42 ? 34 : l > 28 ? 42 : 50,
    headlineLH: 1.28,
    quoteMarkSize: 220,
    quoteMarkOpacity: 0.25,
    quoteMarkPosition: "top-left",
    padding: "40px 50px",
    showAccentUnderline: true,
    decorations: [
      { type: "accentBar", top: 0, left: 0, width: 6, height: SS, color: T.accent },
    ],
  }),
  dramatic: (T, l, ct) => ({
    bg: T.accent,
    textColor: ct,
    bodyColor: ct,
    bodyOpacity: 0.75,
    headlineSize: l > 42 ? 36 : l > 28 ? 46 : 56,
    headlineLH: 1.22,
    quoteMarkSize: 500,
    quoteMarkOpacity: 0.05,
    quoteMarkPosition: "center",
    padding: "60px 70px",
    centered: true,
    decorations: [],
  }),
};

// ── CTA ──
const ctaSpecs = {
  clean: (T, l, ct) => ({
    bg: T.accent,
    textColor: ct,
    headlineSize: l > 28 ? 46 : l > 20 ? 55 : 64,
    headlineLH: 1.12,
    bodySize: 16,
    bodyOpacity: 0.78,
    showIcon: true,
    iconSize: 72,
    iconOpacity: 0.55,
    padding: "44px 50px",
    decorations: [
      { type: "circle", top: -80, right: -80, size: 310, fill: "rgba(255,255,255,0.07)" },
      { type: "circle", bottom: -60, left: -40, size: 250, fill: "rgba(0,0,0,0.05)" },
    ],
  }),
  bold: (T, l, ct) => ({
    bg: T.gradient || T.accent,
    textColor: ct,
    headlineSize: l > 28 ? 52 : l > 20 ? 62 : 72,
    headlineLH: 1.06,
    bodySize: 17,
    bodyOpacity: 0.85,
    showIcon: true,
    iconSize: 88,
    iconOpacity: 0.7,
    padding: "40px 46px",
    decorations: [
      { type: "circle", top: -70, right: -70, size: 380, fill: "rgba(255,255,255,0.12)" },
      { type: "circle", bottom: -50, left: -30, size: 300, fill: "rgba(0,0,0,0.09)" },
      { type: "insetBorder", offset: 16, width: 2, color: "rgba(255,255,255,0.15)" },
    ],
  }),
  dramatic: (T, l, ct) => ({
    bg: T.accent,
    textColor: ct,
    headlineSize: l > 28 ? 56 : l > 20 ? 68 : 80,
    headlineLH: 1.0,
    bodySize: 18,
    bodyOpacity: 0.9,
    showIcon: false,
    padding: "50px 56px",
    decorations: [
      { type: "diagonal", angle: -12, color: "rgba(255,255,255,0.06)", height: 100, width: "150%" },
    ],
  }),
};

const SPECS = {
  cover: coverSpecs,
  insight: insightSpecs,
  stat: statSpecs,
  quote: quoteSpecs,
  cta: ctaSpecs,
};

function specs_clean(type, T, l, ct) {
  // Fallback to clean insight
  return insightSpecs.clean(T, l, ct);
}
