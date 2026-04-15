import { contrastText } from "../utils/themes";
import { getIntensitySpec } from "../utils/intensityStyles";
import Decorations from "./Decorations";

function hexToRgb(hex) {
  const h = (hex || "#000000").replace("#", "");
  const n = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}

function hexLighten(hex, amount = 0.15) {
  const h = (hex || "#000000").replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function luminance(hex) {
  const h = (hex || "#000000").replace("#", "");
  const num = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1, hex2) {
  // Handle non-hex values (rgba, gradients) gracefully
  if (!hex1?.startsWith?.("#") || !hex2?.startsWith?.("#")) return 10;
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexDarken(hex, amount = 0.25) {
  const h = (hex || "#000000").replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  r = Math.max(0, Math.round(r * (1 - amount)));
  g = Math.max(0, Math.round(g * (1 - amount)));
  b = Math.max(0, Math.round(b * (1 - amount)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const SLIDE_ASPECTS = {
  "1:1": { w: 540, h: 540 },
  "4:5": { w: 540, h: 675 },
  "16:9": { w: 640, h: 360 },
};

export const SLIDE_LAYOUTS = [
  { id: "classic", label: "Classic" },
  { id: "centered", label: "Centered" },
  { id: "editorial", label: "Editorial" },
  { id: "minimal", label: "Minimal" },
  { id: "mixed", label: "Mixed" },
];

const MIXED_SEQUENCE = ["classic", "editorial", "centered", "minimal", "editorial", "classic", "centered", "editorial", "minimal", "classic"];
function getEffectiveLayout(layout, slideIndex) {
  if (layout !== "mixed") return layout || "classic";
  return MIXED_SEQUENCE[slideIndex % MIXED_SEQUENCE.length];
}

// ── DNA-aware background resolver ──
function resolveDnaBg(dna, T, baseSpec) {
  const bg = dna?.bg || "dark";
  const accent = T.accent;
  const rgb = hexToRgb(accent);
  switch (bg) {
    case "light":
      return {
        bg: "#FFFFFF",
        text: "#1A1A2E",
        body: "#6B6B7B",
        accent: accent,
        isLight: true,
        border: "rgba(26,26,46,0.10)",
      };
    case "accent":
      return {
        bg: accent,
        text: contrastText(accent),
        body: contrastText(accent),
        accent: contrastText(accent),
        isLight: false,
        border: contrastText(accent) === "#FFFFFF" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
        bodyOpacity: 0.8,
      };
    case "accent-soft": {
      const softBg = `rgba(${rgb},0.08)`;
      return {
        bg: T.card,
        text: T.text,
        body: T.muted,
        accent: accent,
        isLight: false,
        border: T.border,
        overlayGradient: `radial-gradient(ellipse at 70% 30%, rgba(${rgb},0.12), transparent 60%)`,
      };
    }
    case "gradient": {
      const darker = hexDarken(accent, 0.4);
      return {
        bg: darker,
        text: contrastText(darker),
        body: contrastText(darker),
        accent: hexLighten(accent, 0.2),
        isLight: false,
        border: "rgba(255,255,255,0.12)",
        bodyOpacity: 0.8,
        overlayGradient: `linear-gradient(135deg, ${darker} 0%, ${accent}CC 100%)`,
      };
    }
    default: // "dark"
      return {
        bg: baseSpec?.bg || T.card,
        text: baseSpec?.textColor || T.text,
        body: baseSpec?.bodyColor || T.muted,
        accent: accent,
        isLight: false,
        border: T.border,
      };
  }
}

// ── DNA-aware frame renderer ──
function DnaFrame({ frame, accent, SW, SH }) {
  if (!frame || frame === "none") return null;
  const a = accent;
  const common = { position: "absolute", zIndex: 2, pointerEvents: "none" };
  switch (frame) {
    case "bar-left":
      return <div style={{ ...common, top: 0, left: 0, width: 6, height: SH, background: a }} />;
    case "bar-left-thick":
      return <div style={{ ...common, top: 0, left: 0, width: 14, height: SH, background: a }} />;
    case "bar-top":
      return <div style={{ ...common, top: 0, left: 0, width: SW, height: 6, background: a }} />;
    case "bar-bottom":
      return <div style={{ ...common, bottom: 0, left: 0, width: SW, height: 6, background: a }} />;
    case "corner-tl":
      return <>
        <div style={{ ...common, top: 0, left: 0, width: 60, height: 5, background: a }} />
        <div style={{ ...common, top: 0, left: 0, width: 5, height: 60, background: a }} />
      </>;
    case "corner-br":
      return <>
        <div style={{ ...common, bottom: 0, right: 0, width: 60, height: 5, background: a }} />
        <div style={{ ...common, bottom: 0, right: 0, width: 5, height: 60, background: a }} />
      </>;
    case "corners":
      return <>
        <div style={{ ...common, top: 0, left: 0, width: 50, height: 4, background: a }} />
        <div style={{ ...common, top: 0, left: 0, width: 4, height: 50, background: a }} />
        <div style={{ ...common, bottom: 0, right: 0, width: 50, height: 4, background: a }} />
        <div style={{ ...common, bottom: 0, right: 0, width: 4, height: 50, background: a }} />
      </>;
    case "border":
      return <div style={{ ...common, inset: 8, border: `2px solid ${a}`, borderRadius: 4, opacity: 0.4 }} />;
    case "border-partial":
      return <div style={{ ...common, top: 8, left: 8, right: 8, bottom: 0, borderTop: `2px solid ${a}`, borderLeft: `2px solid ${a}`, borderRight: `2px solid ${a}`, borderRadius: "4px 4px 0 0", opacity: 0.35 }} />;
    default:
      return null;
  }
}

// ── DNA-aware decoration renderer ──
function DnaDecorations({ deco, accent, SW, SH, slideIndex, textColor }) {
  if (!deco || deco === "none") return null;
  const rgb = hexToRgb(accent);
  const common = { position: "absolute", zIndex: 0, pointerEvents: "none" };
  switch (deco) {
    case "circle-large":
      return <div style={{ ...common, top: -80, right: -80, width: 380, height: 380, borderRadius: "50%", background: `rgba(${rgb},0.08)` }} />;
    case "circle-duo":
      return <>
        <div style={{ ...common, top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: `rgba(${rgb},0.07)` }} />
        <div style={{ ...common, bottom: -80, left: -40, width: 320, height: 320, borderRadius: "50%", border: `2px solid rgba(${rgb},0.08)` }} />
      </>;
    case "dots-grid": {
      const dots = [];
      for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
        dots.push(<div key={`${r}-${c}`} style={{ position: "absolute", top: 20 + r * 18, right: 20 + c * 18, width: 3, height: 3, borderRadius: "50%", background: accent, opacity: 0.1 }} />);
      }
      return <div style={{ ...common, top: 0, right: 0 }}>{dots}</div>;
    }
    case "diagonal-line":
      return <div style={{ ...common, top: 0, left: 0, width: "150%", height: 2, background: accent, opacity: 0.12, transform: "rotate(-12deg)", transformOrigin: "top left", marginTop: SH * 0.3 }} />;
    case "gradient-blob":
      return <div style={{ ...common, bottom: -40, right: -40, width: SW * 0.7, height: SW * 0.7, borderRadius: "50%", background: `radial-gradient(circle, rgba(${rgb},0.1) 0%, transparent 70%)` }} />;
    case "corner-geo":
      return <div style={{ ...common, top: -20, right: -20, width: 160, height: 160, border: `3px solid rgba(${rgb},0.1)`, transform: "rotate(45deg)" }} />;
    case "stripe-thin":
      return <div style={{ ...common, top: SH * 0.15, left: 0, width: SW, height: 1, background: accent, opacity: 0.1 }} />;
    case "number-watermark":
      return <div style={{ ...common, bottom: -20, right: -10, fontFamily: "'DM Serif Display',serif", fontSize: 280, fontWeight: 400, lineHeight: 1, color: textColor || accent, opacity: 0.04, userSelect: "none", letterSpacing: "-0.04em" }}>
        {String(slideIndex + 1).padStart(2, "0")}
      </div>;
    default:
      return null;
  }
}

// ── Shared components ──

function Pill({ tag, type, variant, T }) {
  const isFilled = variant === "filled";
  const isLight = variant === "light";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      background: isLight ? "rgba(255,255,255,0.15)" : isFilled ? T.accent : T.soft,
      border: `1px solid ${isLight ? "rgba(255,255,255,0.22)" : isFilled ? T.accent : T.border}`,
      borderRadius: 999, padding: "5px 16px", fontSize: 13, fontWeight: 600,
      letterSpacing: "0.07em", textTransform: "uppercase",
      color: isLight ? "rgba(255,255,255,0.9)" : isFilled ? contrastText(T.accent) : T.accent,
      flexShrink: 0,
    }}>
      {tag || type}
    </div>
  );
}

function Bar({ brand, i, n, light, T, hideCounter }) {
  const ct = contrastText(T.accent);
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderTop: `1px solid ${light ? "rgba(255,255,255,0.18)" : T.border}`,
      paddingTop: 20, marginTop: "auto", flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: light ? ct : T.accent, opacity: light ? 0.65 : 0.85 }}>{brand}</span>
      <span style={{ fontSize: 12, color: light ? ct : T.muted, opacity: light ? 0.45 : 0.6 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
    </div>
  );
}

const WEIGHT_MAP = { light: 300, medium: 500, bold: 700, black: 900 };

// ════════════════════════════════════��══════════════════
// SlideInner — the main render function
// ═══════════════════════════════════════════════════════

export function SlideInner({
  s, brand, i, n, T,
  intensity = "clean", aspect = "1:1", bgMode = "default",
  logoConfig, brandLogos, brandFonts, brandBgImage, bgImageMode = "off",
  ghostNumbers = "on", hideAllCounters = false, slideLayout = "classic",
}) {
  const type = s.type || "insight";
  const dna = s.visualDna || null;
  const layout = getEffectiveLayout(slideLayout, i);
  const { w: SW, h: SH } = SLIDE_ASPECTS[aspect] || SLIDE_ASPECTS["1:1"];
  const baseSpec = getIntensitySpec(type, intensity, T, s.headline?.length || 0);

  const isWide = aspect === "16:9";
  const isTall = aspect === "4:5";
  const vScale = SH / 540;
  const hScale = SW / 540;

  const spec = {
    ...baseSpec,
    headlineSize: Math.round((baseSpec.headlineSize || 54) * (isWide ? 0.7 : isTall ? 1.1 : 1)),
    bodySize: Math.round((baseSpec.bodySize || 16) * (isWide ? 0.85 : isTall ? 1.05 : 1)),
    padding: isWide ? "28px 36px" : isTall ? "48px 50px" : baseSpec.padding,
    ghostSize: Math.round((baseSpec.ghostSize || 250) * vScale),
    ghostOpacity: baseSpec.ghostOpacity,
    quoteMarkSize: Math.round((baseSpec.quoteMarkSize || 180) * (isWide ? 0.65 : isTall ? 1.1 : 1)),
    iconSize: Math.round((baseSpec.iconSize || 72) * (isWide ? 0.7 : isTall ? 1.1 : 1)),
    dividerW: baseSpec.dividerW,
    dividerH: baseSpec.dividerH,
    panelW: Math.round((baseSpec.panelW || 220) * hScale),
    statSize: baseSpec.statSize ? (sl) => Math.round(baseSpec.statSize(sl) * (isWide ? 0.75 : isTall ? 1.1 : 1)) : baseSpec.statSize,
    labelSize: baseSpec.labelSize,
  };

  // ── Resolve colors from DNA or fallback to bgMode ──
  let resolved;
  if (dna) {
    resolved = resolveDnaBg(dna, T, baseSpec);
  } else {
    // Legacy: use bgMode
    if (bgMode === "light") {
      resolved = { bg: "#FFFFFF", text: "#1A1A2E", body: "#6B6B7B", accent: T.accent, isLight: true, border: "rgba(26,26,46,0.10)" };
    } else if (bgMode === "invert") {
      const invCt = contrastText(T.accent);
      resolved = { bg: T.accent, text: invCt, body: invCt, accent: invCt, isLight: false, border: invCt === "#FFFFFF" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)", bodyOpacity: 0.8 };
    } else {
      resolved = { bg: spec.bg || T.card, text: spec.textColor || T.text, body: spec.bodyColor || T.muted, accent: T.accent, isLight: false, border: T.border };
    }
  }

  const effectiveBg = resolved.bg;
  const effectiveText = resolved.text;
  const effectiveBody = resolved.body;
  const effectiveAccent = resolved.accent;
  const effectiveBorder = resolved.border || T.border;
  const bodyOpacity = resolved.bodyOpacity || spec.bodyOpacity || 1;

  // Ensure accent has good contrast against bg — if not, flip to contrast color
  let safeAccent = effectiveAccent;
  if (effectiveAccent?.startsWith?.("#") && effectiveBg?.startsWith?.("#")) {
    const ratio = getContrastRatio(effectiveAccent, effectiveBg);
    if (ratio < 2.5) {
      // Accent is too close to bg — use the text color or a contrasting version
      safeAccent = effectiveText;
    }
  }

  // Construct a theme-like object for sub-components
  const slideTheme = {
    ...T,
    card: effectiveBg,
    text: effectiveText,
    muted: effectiveBody,
    accent: safeAccent,
    border: effectiveBorder,
    soft: `rgba(${hexToRgb(safeAccent)},0.08)`,
  };

  const ct = contrastText(safeAccent);
  const isLightBg = resolved.isLight || contrastText(effectiveBg) !== "#FFFFFF";

  // Headline scale from DNA
  const hScale2 = dna?.headlineScale || 1.0;
  const headlineSize = Math.round(spec.headlineSize * hScale2);

  // Accent text from DNA — but only if it has good contrast against the bg
  const accentOnBgContrast = getContrastRatio(safeAccent, effectiveBg);
  const headlineColor = dna?.accentText && accentOnBgContrast > 3.0 ? safeAccent : effectiveText;

  // Alignment from DNA
  const align = dna?.align || (layout === "centered" ? "center" : "left");
  const textAlign = align;
  const alignItems = align === "center" ? "center" : "flex-start";

  // Brand fonts
  const headingFont = brandFonts?.heading ? `'${brandFonts.heading}', sans-serif` : "'DM Serif Display',serif";
  const headingWeight = WEIGHT_MAP[brandFonts?.headingWeight] || 400;
  const headingItalic = !brandFonts?.heading;

  // Logo
  const showLogo = (() => {
    const cfg = logoConfig?.show || "none";
    if (cfg === "none") return false;
    if (cfg === "all") return true;
    if (cfg === "first") return i === 0;
    if (cfg === "last") return i === n - 1;
    if (cfg === "first-last") return i === 0 || i === n - 1;
    return false;
  })();

  const logoUrl = (() => {
    if (!showLogo || !brandLogos) return null;
    if (s.logoVersion === "none") return null;
    if (s.logoVersion === "light") return brandLogos.light || brandLogos.dark;
    if (s.logoVersion === "dark") return brandLogos.dark || brandLogos.light;
    const bgIsDark = contrastText(effectiveBg) === "#FFFFFF";
    return bgIsDark ? (brandLogos.light || brandLogos.dark) : (brandLogos.dark || brandLogos.light);
  })();

  const padParts = (spec.padding || "44px 50px").split(" ").map((p) => parseInt(p));
  const contentPadTop = padParts[0] || 44;
  const contentPadRight = padParts[1] || padParts[0] || 50;
  const contentPadLeft = padParts[3] || padParts[1] || padParts[0] || 50;
  const contentPadBottom = padParts[2] || padParts[0] || 44;

  const logoPos = s.logoPosition || logoConfig?.position || "top-right";
  const barOffset = dna ? 0 : ((spec.accentBarW || spec.barW || 0) > 0 ? (spec.accentBarW || spec.barW) + 2 : 0);
  const logoStyle = logoUrl ? {
    position: "absolute",
    [logoPos.includes("top") ? "top" : "bottom"]: logoPos.includes("top") ? contentPadTop : contentPadBottom,
    [logoPos.includes("right") ? "right" : "left"]: logoPos.includes("left") ? contentPadLeft + barOffset : contentPadRight,
    height: Math.round(SH * 0.055), maxWidth: Math.round(SW * 0.18), objectFit: "contain", zIndex: 20, opacity: 0.85,
  } : null;
  const LogoOverlay = logoUrl ? <img src={logoUrl} alt="" style={logoStyle} /> : null;

  // BG image overlay
  const activeBgMode = bgImageMode || "off";
  const BgImageOverlay = brandBgImage && activeBgMode !== "off" && !s.hideBgImage ? (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${brandBgImage})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", opacity: activeBgMode === "strong" ? 0.5 : 0.1 }} />
      <div style={{ position: "absolute", inset: 0, background: activeBgMode === "strong" ? `linear-gradient(180deg, ${effectiveBg}DD 0%, ${effectiveBg}88 50%, ${effectiveBg}DD 100%)` : effectiveBg, opacity: activeBgMode === "strong" ? 1 : 0.82 }} />
    </div>
  ) : null;

  // DNA gradient overlay
  const GradientOverlay = resolved.overlayGradient ? (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: resolved.overlayGradient }} />
  ) : null;

  const slideLabel = s.label !== undefined ? s.label : brand;
  const hideCounter = hideAllCounters || !!logoUrl || s.hideCounter;
  const hideBrandText = !!logoUrl && !s.label;

  // Use DNA decorations if available, otherwise fallback to intensity decorations
  const useDnaDecos = !!dna;
  const fallbackDecos = !dna && activeBgMode === "off" ? spec.decorations : [];

  // Pill variant based on background
  const pillVariant = resolved.bg === T.accent || resolved.bg === contrastText(T.card) ? "light" : (spec.pillVariant || "default");

  // Frame padding offset
  const frameBarLeft = dna?.frame === "bar-left" ? 8 : dna?.frame === "bar-left-thick" ? 18 : 0;
  const pad = layout === "minimal" ? (isWide ? "36px 48px" : isTall ? "60px 64px" : "56px 60px") : spec.padding;

  // ── Shared wrapper ──
  const Wrapper = ({ children, style = {} }) => (
    <div style={{ width: SW, height: SH, background: effectiveBg, position: "relative", overflow: "hidden", boxSizing: "border-box", ...style }}>
      {BgImageOverlay}
      {GradientOverlay}
      {useDnaDecos ? (
        <DnaDecorations deco={dna.deco} accent={safeAccent} SW={SW} SH={SH} slideIndex={i} textColor={effectiveText} />
      ) : (
        <Decorations items={fallbackDecos} />
      )}
      {dna && <DnaFrame frame={dna.frame} accent={safeAccent} SW={SW} SH={SH} />}
      {LogoOverlay}
      {children}
    </div>
  );

  // ── Counter + label footer ──
  const Footer = ({ light = false, border = true }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderTop: border ? `1px solid ${light ? "rgba(255,255,255,0.18)" : effectiveBorder}` : "none",
      paddingTop: border ? 20 : 0, marginTop: "auto", flexShrink: 0,
    }}>
      {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: safeAccent, opacity: 0.75 }}>{slideLabel}</span>}
      {hideBrandText && <span />}
      <span style={{ fontSize: 12, color: effectiveText, opacity: 0.45 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
    </div>
  );

  // ═════════════ COVER ═════════════
  if (type === "cover") {
    const isCenterLayout = layout === "centered" || align === "center";
    return (
      <Wrapper style={{ display: "flex", flexDirection: "column", justifyContent: isCenterLayout ? "center" : "space-between", alignItems: isCenterLayout ? "center" : undefined, textAlign: isCenterLayout ? "center" : textAlign, padding: pad }}>
        {!isCenterLayout && (
          <div style={{ paddingLeft: frameBarLeft, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", flexShrink: 0 }}>
            {!hideBrandText && <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: safeAccent, opacity: 0.8 }}>{slideLabel}</span>}
            {hideBrandText && <span />}
            <span style={{ fontSize: 12, color: effectiveText, opacity: 0.5 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        )}
        <div style={{ paddingLeft: !isCenterLayout ? frameBarLeft : 0, position: "relative", flex: isCenterLayout ? undefined : 1, display: "flex", flexDirection: "column", justifyContent: isCenterLayout ? "center" : "flex-end", alignItems: isCenterLayout ? "center" : alignItems, maxWidth: isCenterLayout ? "92%" : undefined }}>
          <Pill tag={s.tag} type={type} variant={pillVariant} T={slideTheme} />
          <div style={{ width: isCenterLayout ? 48 : 64, height: 4, background: safeAccent, borderRadius: 2, margin: `${Math.round(22 * vScale)}px ${isCenterLayout ? "auto" : "0"} ${Math.round(18 * vScale)}px`, opacity: 0.8 }} />
          <h1 style={{ fontFamily: headingFont, fontSize: headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: headlineColor, fontStyle: headingItalic && spec.headlineItalic ? "italic" : "normal", margin: `0 0 ${Math.round(18 * vScale)}px` }}>
            {s.headline}
          </h1>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.65, color: effectiveBody, margin: 0, opacity: bodyOpacity }}>{s.body}</p>
        </div>
        {isCenterLayout && (
          <div style={{ position: "absolute", bottom: contentPadBottom, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
            {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: safeAccent, opacity: 0.6 }}>{slideLabel}</span>}
            <span style={{ fontSize: 12, color: effectiveText, opacity: 0.4 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        )}
      </Wrapper>
    );
  }

  // ═════════════ STAT ═════════════
  if (type === "stat") {
    const sn = s.stat || "?";
    // Smart auto-sizing: account for character count AND width of wide chars
    const wideChars = (sn.match(/[MW%CHF]/gi) || []).length;
    const effectiveLen = sn.length + wideChars * 0.4; // wide chars count ~1.4x
    const autoSize = effectiveLen > 8 ? 48 : effectiveLen > 6 ? 58 : effectiveLen > 4 ? 72 : effectiveLen > 2 ? 90 : 110;
    const sf = s.statFontSize || autoSize;
    const isCenterLayout = layout === "centered" || align === "center";
    const isFlipped = layout === "editorial";

    // For centered/minimal: stat is inline with other content, must be smaller
    const centerStatSize = Math.min(sf, effectiveLen > 6 ? 52 : effectiveLen > 4 ? 64 : 80);
    // For split panel: stat must fit within panel width
    const panelStatSize = Math.min(sf, Math.floor(spec.panelW * 0.42 / Math.max(1, effectiveLen * 0.55)));
    const clampedPanelSf = Math.max(36, Math.min(panelStatSize, sf));

    // Centered/minimal stat: no split panel
    if (isCenterLayout || layout === "minimal") {
      return (
        <Wrapper style={{ display: "flex", flexDirection: "column", alignItems: isCenterLayout ? "center" : alignItems, justifyContent: "center", textAlign: isCenterLayout ? "center" : textAlign, padding: pad }}>
          <Pill tag={s.tag} type={type} variant={pillVariant} T={slideTheme} />
          <div style={{ fontFamily: headingFont, fontSize: centerStatSize, fontWeight: headingWeight, color: safeAccent, lineHeight: 1, margin: `${Math.round(16 * vScale)}px 0 ${Math.round(6 * vScale)}px`, whiteSpace: "nowrap" }}>{sn}</div>
          {s.statLabel && <div style={{ fontSize: spec.labelSize + 1, fontWeight: 600, color: safeAccent, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: Math.round(18 * vScale) }}>{s.statLabel}</div>}
          <div style={{ width: 40, height: 3, background: safeAccent, borderRadius: 2, marginBottom: Math.round(14 * vScale), opacity: 0.5 }} />
          <h2 style={{ fontFamily: headingFont, fontSize: headlineSize - 4, fontWeight: headingWeight, lineHeight: 1.25, color: headlineColor, margin: `0 0 ${Math.round(10 * vScale)}px`, maxWidth: isCenterLayout ? "88%" : undefined }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: effectiveBody, margin: 0, opacity: bodyOpacity, maxWidth: isCenterLayout ? "85%" : undefined }}>{s.body}</p>
          <div style={{ position: "absolute", bottom: contentPadBottom, left: 0, right: 0, display: "flex", justifyContent: isCenterLayout ? "center" : "space-between", gap: 20, padding: `0 ${contentPadLeft}px` }}>
            {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: safeAccent, opacity: 0.55 }}>{slideLabel}</span>}
            <span style={{ fontSize: 11, color: effectiveText, opacity: 0.3 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        </Wrapper>
      );
    }

    // Split panel stat (classic or editorial-flipped)
    const statPanelBg = dna ? effectiveAccent : (spec.panelBg || T.accent);
    const statCt = contrastText(typeof statPanelBg === "string" && statPanelBg.includes("gradient") ? T.accent : (statPanelBg || T.accent));
    return (
      <div style={{ width: SW, height: SH, background: dna ? effectiveBg : T.card, overflow: "hidden", display: "flex", flexDirection: isFlipped ? "row-reverse" : "row", boxSizing: "border-box", position: "relative" }}>
        {GradientOverlay}
        {useDnaDecos && <DnaDecorations deco={dna?.deco} accent={safeAccent} SW={SW} SH={SH} slideIndex={i} textColor={effectiveText} />}
        {!useDnaDecos && <Decorations items={fallbackDecos} />}
        {dna && <DnaFrame frame={dna.frame} accent={safeAccent} SW={SW} SH={SH} />}
        {LogoOverlay}
        <div style={{ width: spec.panelW, flexShrink: 0, background: statPanelBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${Math.round(32 * vScale)}px 14px`, position: "relative", overflow: "hidden" }}>
          <div style={{ fontFamily: headingFont, fontSize: clampedPanelSf, fontWeight: headingWeight, color: statCt, lineHeight: 1, textAlign: "center", whiteSpace: "nowrap", position: "relative", zIndex: 1, maxWidth: spec.panelW - 28 }}>{sn}</div>
          {s.statLabel && <div style={{ fontSize: spec.labelSize, fontWeight: 600, color: statCt, opacity: 0.7, marginTop: Math.round(14 * vScale), textAlign: "center", textTransform: "uppercase", letterSpacing: spec.labelSpacing || "0.06em", position: "relative", zIndex: 1 }}>{s.statLabel}</div>}
        </div>
        <div style={{ flex: 1, padding: `${Math.round(44 * vScale)}px ${isFlipped ? "42px" : "42px"} ${Math.round(40 * vScale)}px ${isFlipped ? "42px" : "36px"}`, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          <Pill tag={s.tag} type={type} variant="default" T={slideTheme} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: `${Math.round(22 * vScale)}px 0` }}>
            <div style={{ width: 44, height: 4, background: safeAccent, borderRadius: 2, marginBottom: Math.round(20 * vScale) }} />
            <h2 style={{ fontFamily: headingFont, fontSize: headlineSize - 4, fontWeight: headingWeight, lineHeight: 1.25, color: dna ? effectiveText : T.text, margin: `0 0 ${Math.round(16 * vScale)}px` }}>{s.headline}</h2>
            <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: dna ? effectiveBody : T.muted, margin: 0, opacity: bodyOpacity }}>{s.body}</p>
          </div>
          <Bar brand={hideBrandText ? "" : brand} i={i} n={n} T={slideTheme} hideCounter={hideCounter} />
        </div>
      </div>
    );
  }

  // ═════════════ QUOTE ═════════════
  if (type === "quote") {
    const isCenterLayout = layout === "centered" || align === "center" || spec.centered;
    return (
      <Wrapper style={{ display: "flex", flexDirection: "column", justifyContent: isCenterLayout ? "center" : undefined, alignItems: isCenterLayout ? "center" : undefined, textAlign: isCenterLayout ? "center" : textAlign, padding: pad }}>
        {/* Quote mark */}
        {isCenterLayout ? (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: "'DM Serif Display',serif", fontSize: spec.quoteMarkSize * 1.4, lineHeight: 0.8, color: effectiveText, opacity: 0.04, userSelect: "none", pointerEvents: "none", zIndex: 0 }}>&ldquo;</div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: spec.quoteMarkSize, lineHeight: 0.78, color: safeAccent, opacity: spec.quoteMarkOpacity || 0.17, userSelect: "none", marginLeft: -10, marginTop: -8 }}>&ldquo;</div>
            <span style={{ fontSize: 12, color: effectiveText, paddingTop: 8, opacity: 0.5 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        )}
        <div style={{ flex: isCenterLayout ? undefined : 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: isCenterLayout ? 0 : -26, position: "relative", zIndex: 1, maxWidth: isCenterLayout ? "90%" : undefined }}>
          <h2 style={{ fontFamily: headingFont, fontSize: headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: headlineColor, fontStyle: headingItalic ? "italic" : "normal", margin: `0 0 ${Math.round(18 * vScale)}px` }}>{s.headline}</h2>
          {spec.showAccentUnderline && <div style={{ width: "40%", height: 3, background: safeAccent, borderRadius: 2, marginBottom: Math.round(16 * vScale), marginLeft: isCenterLayout ? "auto" : 0, marginRight: isCenterLayout ? "auto" : undefined }} />}
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: effectiveBody, margin: 0, opacity: bodyOpacity }}>{s.body}</p>
        </div>
        {!isCenterLayout && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${effectiveBorder}`, paddingTop: 20, flexShrink: 0 }}>
            <Pill tag={s.tag} type={type} variant={isLightBg ? "default" : "light"} T={slideTheme} />
            {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: safeAccent, opacity: 0.8 }}>{slideLabel}</span>}
          </div>
        )}
        {isCenterLayout && !hideBrandText && (
          <div style={{ marginTop: 24, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveText, opacity: 0.45 }}>{slideLabel}</div>
        )}
      </Wrapper>
    );
  }

  // ═════════════ CTA ═════════════
  if (type === "cta") {
    const isCenterLayout = layout === "centered" || align === "center";
    // CTA button color: if bg IS the accent, use contrast; otherwise use accent
    const btnBg = (resolved.bg === T.accent) ? effectiveText : effectiveAccent;
    const btnText = contrastText(typeof btnBg === "string" ? btnBg : T.accent);
    return (
      <Wrapper style={{ display: "flex", flexDirection: "column", justifyContent: isCenterLayout ? "center" : undefined, alignItems: isCenterLayout ? "center" : alignItems, textAlign: isCenterLayout ? "center" : textAlign, padding: pad }}>
        {!isCenterLayout && (s.tag || (!hideCounter && n > 1)) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", flexShrink: 0, width: "100%" }}>
            {s.tag ? <Pill tag={s.tag} type={type} variant={isLightBg ? "default" : "light"} T={slideTheme} /> : <span />}
            <span style={{ fontSize: 12, color: effectiveText, opacity: 0.45 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        )}
        <div style={{ flex: isCenterLayout ? undefined : 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", alignItems: isCenterLayout ? "center" : alignItems, maxWidth: isCenterLayout ? "90%" : undefined }}>
          {spec.showIcon && !s.hideIcon && layout !== "editorial" && layout !== "minimal" && !isCenterLayout && (
            <div style={{ fontSize: spec.iconSize, lineHeight: 1, color: effectiveText, opacity: spec.iconOpacity || 0.5, marginBottom: 20, fontFamily: "'DM Serif Display',serif" }}>&#9670;</div>
          )}
          <h2 style={{ fontFamily: headingFont, fontSize: headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: headlineColor, margin: "0 0 16px" }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.65, color: effectiveText, opacity: bodyOpacity, margin: "0 0 4px" }}>{s.body}</p>
          {s.ctaButton && (
            <div style={{ marginTop: Math.round(20 * vScale) }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: btnBg, color: btnText,
                padding: `${Math.round(12 * vScale)}px ${Math.round(28 * hScale)}px`,
                borderRadius: 10, fontSize: Math.round(15 * vScale), fontWeight: 700,
              }}>{s.ctaButton}</div>
            </div>
          )}
        </div>
        {!isCenterLayout && (
          <div style={{ borderTop: `1px solid ${effectiveBorder}`, paddingTop: 20, position: "relative", flexShrink: 0, width: "100%" }}>
            {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveText, opacity: 0.55 }}>{slideLabel}</span>}
          </div>
        )}
        {isCenterLayout && !hideBrandText && (
          <div style={{ position: "absolute", bottom: contentPadBottom, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveText, opacity: 0.45 }}>{slideLabel}</div>
        )}
      </Wrapper>
    );
  }

  // ═════════════ INSIGHT (default) ═════════════
  const isCenterLayout = layout === "centered" || align === "center";
  const isEditorial = layout === "editorial";

  return (
    <Wrapper style={{ display: "flex", flexDirection: "column", justifyContent: isCenterLayout ? "center" : undefined, alignItems: isCenterLayout ? "center" : undefined, textAlign: isCenterLayout ? "center" : textAlign, padding: pad }}>
      {/* Ghost number — only if no DNA deco watermark */}
      {!dna && activeBgMode === "off" && ghostNumbers !== "off" && !(ghostNumbers === "middle" && (i === 0 || i === n - 1)) && (
        <div style={{ position: "absolute", bottom: -14, right: -8, fontFamily: "'DM Serif Display',serif", fontSize: spec.ghostSize, fontWeight: 400, lineHeight: 1, color: safeAccent, opacity: spec.ghostOpacity, userSelect: "none", letterSpacing: "-0.04em", pointerEvents: "none" }}>
          {String(i + 1).padStart(2, "0")}
        </div>
      )}

      {!isCenterLayout && !isEditorial && (
        <Pill tag={s.tag} type={type} variant={isLightBg ? "default" : (intensity === "dramatic" ? "light" : "default")} T={slideTheme} />
      )}
      {isEditorial && <Pill tag={s.tag} type={type} variant={isLightBg ? "default" : "default"} T={slideTheme} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: isCenterLayout ? undefined : `${Math.round(18 * vScale)}px 0`, maxWidth: isCenterLayout ? "88%" : undefined, paddingLeft: !isCenterLayout && !isEditorial ? frameBarLeft : 0 }}>
        {!isEditorial && <div style={{ width: isCenterLayout ? 40 : spec.dividerW, height: spec.dividerH, background: safeAccent, borderRadius: 2, marginBottom: Math.round(18 * vScale), marginLeft: isCenterLayout ? "auto" : 0, marginRight: isCenterLayout ? "auto" : undefined }} />}
        <h2 style={{ fontFamily: headingFont, fontSize: isEditorial ? Math.round(headlineSize * 1.15) : headlineSize, fontWeight: headingWeight, lineHeight: isEditorial ? 1.06 : spec.headlineLH, color: headlineColor, margin: `0 0 ${Math.round(14 * vScale)}px` }}>{s.headline}</h2>
        {isEditorial && <div style={{ width: "100%", height: 3, background: safeAccent, borderRadius: 2, marginBottom: Math.round(12 * vScale), opacity: 0.7 }} />}
        <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: effectiveBody, margin: 0, opacity: bodyOpacity }}>{s.body}</p>
      </div>

      {isCenterLayout ? (
        <div style={{ position: "absolute", bottom: contentPadBottom, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
          {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: safeAccent, opacity: 0.55 }}>{slideLabel}</span>}
          <span style={{ fontSize: 11, color: effectiveText, opacity: 0.3 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
        </div>
      ) : (
        <Footer light={!isLightBg} />
      )}
    </Wrapper>
  );
}

// ═══════════════════════════════════════════════════════
// ScaledSlide — preview wrapper
// ═══════════════════════════════════════════════════════

export function ScaledSlide({ s, brand, i, n, T, size, intensity, aspect = "1:1", bgMode = "default", logoConfig, brandLogos, brandFonts, brandBgImage, bgImageMode, ghostNumbers, hideAllCounters, slideLayout }) {
  const { w, h } = SLIDE_ASPECTS[aspect] || SLIDE_ASPECTS["1:1"];
  const sc = size / w;
  const scaledH = h * sc;
  return (
    <div style={{ width: size, height: scaledH, borderRadius: 0, overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
      <div style={{ width: w, height: h, transform: `scale(${sc})`, transformOrigin: "top left" }}>
        <SlideInner s={s} brand={brand} i={i} n={n} T={T} intensity={intensity} aspect={aspect} bgMode={bgMode} logoConfig={logoConfig} brandLogos={brandLogos} brandFonts={brandFonts} brandBgImage={brandBgImage} bgImageMode={bgImageMode} ghostNumbers={ghostNumbers} hideAllCounters={hideAllCounters} slideLayout={slideLayout} />
      </div>
    </div>
  );
}
