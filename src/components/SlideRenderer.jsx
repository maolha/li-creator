import { contrastText } from "../utils/themes";

function hexToRgb(hex) {
  const h = (hex || "#000000").replace("#", "");
  const n = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}
import { getIntensitySpec } from "../utils/intensityStyles";
import Decorations from "./Decorations";

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

// Deterministic per-slide layout for "mixed" mode
const MIXED_SEQUENCE = ["classic", "editorial", "centered", "minimal", "editorial", "classic", "centered", "editorial", "minimal", "classic"];
function getEffectiveLayout(layout, slideIndex) {
  if (layout !== "mixed") return layout || "classic";
  return MIXED_SEQUENCE[slideIndex % MIXED_SEQUENCE.length];
}

function Pill({ tag, type, variant, T }) {
  const isFilled = variant === "filled";
  const isLight = variant === "light";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: isLight ? "rgba(255,255,255,0.15)" : isFilled ? T.accent : T.soft,
        border: `1px solid ${isLight ? "rgba(255,255,255,0.22)" : isFilled ? T.accent : T.border}`,
        borderRadius: 999,
        padding: "5px 16px",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: isLight ? "rgba(255,255,255,0.9)" : isFilled ? contrastText(T.accent) : T.accent,
        flexShrink: 0,
      }}
    >
      {tag || type}
    </div>
  );
}

function Bar({ brand, i, n, light, T, hideCounter }) {
  const ct = contrastText(T.accent);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `1px solid ${light ? "rgba(255,255,255,0.18)" : T.border}`,
        paddingTop: 20,
        marginTop: "auto",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: light ? ct : T.accent, opacity: light ? 0.65 : 0.85 }}>
        {brand}
      </span>
      <span style={{ fontSize: 12, color: light ? ct : T.muted, opacity: light ? 0.45 : 0.6 }}>
        {!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}
      </span>
    </div>
  );
}

const WEIGHT_MAP = { light: 300, medium: 500, bold: 700, black: 900 };

export function SlideInner({ s, brand, i, n, T, intensity = "clean", aspect = "1:1", bgMode = "default", logoConfig, brandLogos, brandFonts, brandBgImage, bgImageMode = "off", ghostNumbers = "on", hideAllCounters = false, slideLayout = "classic" }) {
  const type = s.type || "insight";
  const layout = getEffectiveLayout(slideLayout, i);
  const { w: SW, h: SH } = SLIDE_ASPECTS[aspect] || SLIDE_ASPECTS["1:1"];
  const baseSpec = getIntensitySpec(type, intensity, T, s.headline?.length || 0);

  // Logo visibility
  const showLogo = (() => {
    const cfg = logoConfig?.show || "none";
    if (cfg === "none") return false;
    if (cfg === "all") return true;
    if (cfg === "first") return i === 0;
    if (cfg === "last") return i === n - 1;
    if (cfg === "first-last") return i === 0 || i === n - 1;
    return false;
  })();

  // Scale spec values for non-square aspects
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

  // Apply background mode override
  let theme = T;
  if (bgMode === "light") {
    theme = { ...T, card: "#FFFFFF", text: "#1A1A2E", muted: "#6B6B7B", border: "rgba(26,26,46,0.10)", soft: `rgba(${hexToRgb(T.accent)},0.07)` };
  } else if (bgMode === "invert") {
    const invCt = contrastText(T.accent);
    theme = {
      ...T,
      card: T.accent,
      text: invCt,
      accent: invCt,
      muted: invCt === "#FFFFFF" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)",
      border: invCt === "#FFFFFF" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)",
      soft: invCt === "#FFFFFF" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    };
  }
  const effectiveBg = bgMode === "default" ? spec.bg : theme.card;
  const effectiveText = bgMode === "default" ? (spec.textColor || theme.text) : theme.text;
  const effectiveBody = bgMode === "default" ? (spec.bodyColor || theme.muted) : theme.muted;

  const ct = contrastText(theme.accent);

  // Logo overlay
  const logoUrl = (() => {
    if (!showLogo || !brandLogos) return null;
    if (s.logoVersion === "none") return null;
    if (s.logoVersion === "light") return brandLogos.light || brandLogos.dark;
    if (s.logoVersion === "dark") return brandLogos.dark || brandLogos.light;
    const bgIsDark = contrastText(effectiveBg || theme.card) === "#FFFFFF";
    return bgIsDark ? (brandLogos.light || brandLogos.dark) : (brandLogos.dark || brandLogos.light);
  })();

  const logoPos = s.logoPosition || logoConfig?.position || "top-right";
  const padParts = (spec.padding || "44px 50px").split(" ").map((p) => parseInt(p));
  const contentPadTop = padParts[0] || 44;
  const contentPadRight = padParts[1] || padParts[0] || 50;
  const contentPadLeft = padParts[3] || padParts[1] || padParts[0] || 50;
  const contentPadBottom = padParts[2] || padParts[0] || 44;
  const barOffset = (spec.accentBarW || spec.barW || 0) > 0 ? (spec.accentBarW || spec.barW) + 2 : 0;
  const logoStyle = logoUrl ? {
    position: "absolute",
    [logoPos.includes("top") ? "top" : "bottom"]: logoPos.includes("top") ? contentPadTop : contentPadBottom,
    [logoPos.includes("right") ? "right" : "left"]: logoPos.includes("left") ? contentPadLeft + barOffset : contentPadRight,
    height: Math.round(SH * 0.055),
    maxWidth: Math.round(SW * 0.18),
    objectFit: "contain",
    zIndex: 20,
    opacity: 0.85,
  } : null;

  const LogoOverlay = logoUrl ? <img src={logoUrl} alt="" style={logoStyle} /> : null;

  // Background image overlay
  const activeBgMode = bgImageMode || "off";
  const BgImageOverlay = brandBgImage && activeBgMode !== "off" && !s.hideBgImage ? (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${brandBgImage})`,
        backgroundSize: "contain", backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: activeBgMode === "strong" ? 0.5 : 0.1,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: activeBgMode === "strong"
          ? `linear-gradient(180deg, ${effectiveBg}DD 0%, ${effectiveBg}88 50%, ${effectiveBg}DD 100%)`
          : effectiveBg,
        opacity: activeBgMode === "strong" ? 1 : 0.82,
      }} />
    </div>
  ) : null;

  const slideLabel = s.label !== undefined ? s.label : brand;
  const hideCounter = hideAllCounters || !!logoUrl || s.hideCounter;
  const hideBrandText = !!logoUrl && !s.label;

  // Brand fonts
  const headingFont = brandFonts?.heading ? `'${brandFonts.heading}', sans-serif` : "'DM Serif Display',serif";
  const headingWeight = WEIGHT_MAP[brandFonts?.headingWeight] || 400;
  const headingItalic = !brandFonts?.heading;

  // ── Layout-aware padding ──
  const isCentered = layout === "centered";
  const isEditorial = layout === "editorial";
  const isMinimal = layout === "minimal";

  // Minimal: more whitespace
  const layoutPad = isMinimal ? (isWide ? "36px 48px" : isTall ? "60px 64px" : "56px 60px") : spec.padding;
  // Centered: no accent bars
  const layoutBarW = (isCentered || isMinimal) ? 0 : (spec.accentBarW || 0);

  /* ═══════════ COVER ═══════════ */
  if (type === "cover") {
    // Centered cover: center-aligned text, no accent bar, larger headline
    if (isCentered) {
      return (
        <div style={{ width: SW, height: SH, background: effectiveBg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: layoutPad, boxSizing: "border-box" }}>
          {BgImageOverlay}
          <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
          {LogoOverlay}
          <Pill tag={s.tag} type={type} variant={spec.pillVariant} T={theme} />
          <div style={{ width: 48, height: 4, background: effectiveText === ct ? ct : theme.accent, borderRadius: 2, margin: `${Math.round(20 * vScale)}px auto`, opacity: effectiveText === ct ? 0.4 : 1 }} />
          <h1 style={{ fontFamily: headingFont, fontSize: Math.round(spec.headlineSize * 1.05), fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, fontStyle: headingItalic && spec.headlineItalic ? "italic" : "normal", margin: `0 0 ${Math.round(18 * vScale)}px`, maxWidth: "90%" }}>
            {s.headline}
          </h1>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.65, color: effectiveBody, margin: 0, opacity: spec.bodyOpacity || 1, maxWidth: "85%" }}>{s.body}</p>
          {/* Footer */}
          <div style={{ position: "absolute", bottom: contentPadBottom, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
            {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveText === ct ? ct : theme.accent, opacity: 0.7 }}>{slideLabel}</span>}
            <span style={{ fontSize: 12, color: effectiveText, opacity: 0.4 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        </div>
      );
    }
    // Editorial cover: headline takes up top 60%, body at bottom
    if (isEditorial) {
      return (
        <div style={{ width: SW, height: SH, background: effectiveBg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", padding: layoutPad, boxSizing: "border-box" }}>
          {BgImageOverlay}
          <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
          {LogoOverlay}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            {!hideBrandText && <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveText === ct ? ct : theme.accent, opacity: effectiveText === ct ? 0.8 : 1 }}>{slideLabel}</span>}
            {hideBrandText && <span />}
            <span style={{ fontSize: 12, color: effectiveText, opacity: 0.5 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
            <h1 style={{ fontFamily: headingFont, fontSize: Math.round(spec.headlineSize * 1.15), fontWeight: headingWeight, lineHeight: 1.0, color: effectiveText, fontStyle: headingItalic && spec.headlineItalic ? "italic" : "normal", margin: 0 }}>
              {s.headline}
            </h1>
          </div>
          <div style={{ flexShrink: 0, borderTop: `3px solid ${theme.accent}`, paddingTop: Math.round(16 * vScale) }}>
            <Pill tag={s.tag} type={type} variant={spec.pillVariant} T={theme} />
            <p style={{ fontSize: spec.bodySize + 1, lineHeight: 1.55, color: effectiveBody, margin: `${Math.round(12 * vScale)}px 0 0`, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
          </div>
        </div>
      );
    }
    // Minimal cover: very clean, large headline, minimal chrome
    if (isMinimal) {
      return (
        <div style={{ width: SW, height: SH, background: effectiveBg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: layoutPad, boxSizing: "border-box" }}>
          {BgImageOverlay}
          {LogoOverlay}
          <div style={{ position: "absolute", top: contentPadTop, left: contentPadLeft }}>
            <Pill tag={s.tag} type={type} variant={spec.pillVariant} T={theme} />
          </div>
          <h1 style={{ fontFamily: headingFont, fontSize: Math.round(spec.headlineSize * 1.1), fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, fontStyle: headingItalic && spec.headlineItalic ? "italic" : "normal", margin: `0 0 ${Math.round(16 * vScale)}px` }}>
            {s.headline}
          </h1>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.65, color: effectiveBody, margin: 0, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: Math.round(28 * vScale), flexShrink: 0 }}>
            {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: effectiveText === ct ? ct : theme.accent, opacity: 0.6 }}>{slideLabel}</span>}
            <span style={{ fontSize: 11, color: effectiveText, opacity: 0.35 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        </div>
      );
    }
    // Classic cover (default)
    return (
      <div style={{ width: SW, height: SH, background: effectiveBg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: spec.padding, boxSizing: "border-box" }}>
        {BgImageOverlay}
        <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
        {LogoOverlay}
        <div style={{ paddingLeft: spec.accentBarW > 0 ? spec.accentBarW + 2 : 0, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", flexShrink: 0 }}>
          {!hideBrandText && <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveText === ct ? ct : theme.accent, opacity: effectiveText === ct ? 0.8 : 1 }}>{slideLabel}</span>}
          {hideBrandText && <span />}
          <span style={{ fontSize: 12, color: effectiveText, opacity: 0.5 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
        </div>
        <div style={{ paddingLeft: spec.accentBarW > 0 ? spec.accentBarW + 2 : 0, position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <Pill tag={s.tag} type={type} variant={spec.pillVariant} T={theme} />
          <div style={{ width: 64, height: 4, background: effectiveText === ct ? ct : theme.accent, borderRadius: 2, margin: `${Math.round(26 * vScale)}px 0 ${Math.round(22 * vScale)}px`, opacity: effectiveText === ct ? 0.4 : 1 }} />
          <h1 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, fontStyle: headingItalic && spec.headlineItalic ? "italic" : "normal", margin: `0 0 ${Math.round(22 * vScale)}px` }}>
            {s.headline}
          </h1>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.65, color: effectiveBody, margin: 0, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
        </div>
      </div>
    );
  }

  /* ═══════════ STAT ═══════════ */
  if (type === "stat") {
    const sn = s.stat || "?";
    const sf = s.statFontSize || (spec.statSize ? spec.statSize(sn.length) : 90);

    // Centered stat: stat number centered above content
    if (isCentered) {
      return (
        <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: layoutPad, boxSizing: "border-box", position: "relative" }}>
          {BgImageOverlay}
          <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
          {LogoOverlay}
          <Pill tag={s.tag} type={type} variant="default" T={theme} />
          <div style={{ fontFamily: headingFont, fontSize: sf * 1.2, fontWeight: headingWeight, color: theme.accent, lineHeight: 1, margin: `${Math.round(20 * vScale)}px 0 ${Math.round(8 * vScale)}px`, whiteSpace: "nowrap" }}>{sn}</div>
          {s.statLabel && <div style={{ fontSize: spec.labelSize + 1, fontWeight: 600, color: theme.accent, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: Math.round(20 * vScale) }}>{s.statLabel}</div>}
          <div style={{ width: 40, height: 3, background: theme.accent, borderRadius: 2, marginBottom: Math.round(16 * vScale) }} />
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize - 2, fontWeight: headingWeight, lineHeight: 1.25, color: effectiveText, margin: `0 0 ${Math.round(10 * vScale)}px`, maxWidth: "85%" }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: effectiveBody, margin: 0, maxWidth: "85%" }}>{s.body}</p>
          {/* Footer */}
          <div style={{ position: "absolute", bottom: contentPadBottom, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
            {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.accent, opacity: 0.6 }}>{slideLabel}</span>}
            <span style={{ fontSize: 11, color: effectiveText, opacity: 0.35 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        </div>
      );
    }
    // Editorial stat: stat on right instead of left
    if (isEditorial) {
      return (
        <div style={{ width: SW, height: SH, background: theme.card, overflow: "hidden", display: "flex", flexDirection: "row-reverse", boxSizing: "border-box" }}>
          <div style={{ width: spec.panelW, flexShrink: 0, background: spec.panelBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${Math.round(32 * vScale)}px 18px`, position: "relative", overflow: "hidden" }}>
            {BgImageOverlay}
            <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
            {LogoOverlay}
            <div style={{ fontFamily: headingFont, fontSize: sf, fontWeight: headingWeight, color: ct, lineHeight: 1, textAlign: "center", whiteSpace: "nowrap", position: "relative", zIndex: 1 }}>{sn}</div>
            {s.statLabel && <div style={{ fontSize: spec.labelSize, fontWeight: 600, color: ct, opacity: 0.7, marginTop: Math.round(14 * vScale), textAlign: "center", textTransform: "uppercase", letterSpacing: spec.labelSpacing || "0.06em", position: "relative", zIndex: 1 }}>{s.statLabel}</div>}
          </div>
          <div style={{ flex: 1, padding: `${Math.round(44 * vScale)}px 36px ${Math.round(40 * vScale)}px 42px`, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <Pill tag={s.tag} type={type} variant="default" T={theme} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: `${Math.round(22 * vScale)}px 0` }}>
              <div style={{ width: 44, height: 4, background: theme.accent, borderRadius: 2, marginBottom: Math.round(20 * vScale) }} />
              <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: 1.25, color: theme.text, margin: `0 0 ${Math.round(16 * vScale)}px` }}>{s.headline}</h2>
              <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: theme.muted, margin: 0 }}>{s.body}</p>
            </div>
            <Bar brand={hideBrandText ? "" : brand} i={i} n={n} T={theme} hideCounter={hideCounter} />
          </div>
        </div>
      );
    }
    // Minimal stat: full-width stat on top band
    if (isMinimal) {
      return (
        <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box", padding: layoutPad, position: "relative" }}>
          {BgImageOverlay}
          {LogoOverlay}
          <Pill tag={s.tag} type={type} variant="default" T={theme} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: headingFont, fontSize: sf * 1.3, fontWeight: headingWeight, color: theme.accent, lineHeight: 1, marginBottom: Math.round(6 * vScale) }}>{sn}</div>
            {s.statLabel && <div style={{ fontSize: spec.labelSize + 1, fontWeight: 600, color: theme.accent, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: Math.round(22 * vScale) }}>{s.statLabel}</div>}
            <div style={{ width: 44, height: 3, background: theme.accent, opacity: 0.4, borderRadius: 2, marginBottom: Math.round(18 * vScale) }} />
            <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize - 2, fontWeight: headingWeight, lineHeight: 1.25, color: effectiveText, margin: `0 0 ${Math.round(12 * vScale)}px` }}>{s.headline}</h2>
            <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: effectiveBody, margin: 0 }}>{s.body}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, paddingTop: 16 }}>
            {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.accent, opacity: 0.5 }}>{slideLabel}</span>}
            <span style={{ fontSize: 11, color: effectiveText, opacity: 0.3 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        </div>
      );
    }
    // Classic stat (default)
    return (
      <div style={{ width: SW, height: SH, background: theme.card, overflow: "hidden", display: "flex", boxSizing: "border-box" }}>
        <div style={{ width: spec.panelW, flexShrink: 0, background: spec.panelBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${Math.round(32 * vScale)}px 18px`, position: "relative", overflow: "hidden" }}>
          {BgImageOverlay}
        <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
        {LogoOverlay}
          <div style={{ fontFamily: headingFont, fontSize: sf, fontWeight: headingWeight, color: ct, lineHeight: 1, textAlign: "center", whiteSpace: "nowrap", position: "relative", zIndex: 1 }}>{sn}</div>
          {s.statLabel && <div style={{ fontSize: spec.labelSize, fontWeight: 600, color: ct, opacity: 0.7, marginTop: Math.round(14 * vScale), textAlign: "center", textTransform: "uppercase", letterSpacing: spec.labelSpacing || "0.06em", position: "relative", zIndex: 1 }}>{s.statLabel}</div>}
        </div>
        <div style={{ flex: 1, padding: `${Math.round(44 * vScale)}px 42px ${Math.round(40 * vScale)}px 36px`, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          <Pill tag={s.tag} type={type} variant="default" T={theme} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: `${Math.round(22 * vScale)}px 0` }}>
            <div style={{ width: 44, height: 4, background: theme.accent, borderRadius: 2, marginBottom: Math.round(20 * vScale) }} />
            <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: 1.25, color: theme.text, margin: `0 0 ${Math.round(16 * vScale)}px` }}>{s.headline}</h2>
            <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: theme.muted, margin: 0 }}>{s.body}</p>
          </div>
          <Bar brand={hideBrandText ? "" : brand} i={i} n={n} T={theme} hideCounter={hideCounter} />
        </div>
      </div>
    );
  }

  /* ═══════════ QUOTE ═══════════ */
  if (type === "quote") {
    const qBg = effectiveBg;
    const qText = effectiveText;
    const qBody = effectiveBody;
    const specCentered = spec.centered;

    // Centered quote: always centered, big quote mark behind
    if (isCentered || specCentered) {
      return (
        <div style={{ width: SW, height: SH, background: qBg, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: isMinimal ? layoutPad : "60px 70px", boxSizing: "border-box", position: "relative" }}>
          {BgImageOverlay}
          <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
          {LogoOverlay}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: "'DM Serif Display',serif", fontSize: spec.quoteMarkSize * 1.5, lineHeight: 0.8, color: qText, opacity: 0.04, userSelect: "none", pointerEvents: "none" }}>&ldquo;</div>
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize + 4, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: qText, fontStyle: headingItalic ? "italic" : "normal", margin: `0 0 ${Math.round(20 * vScale)}px`, position: "relative", zIndex: 1 }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: qBody, margin: 0, opacity: spec.bodyOpacity || 1, position: "relative", zIndex: 1 }}>{s.body}</p>
          {!hideBrandText && <div style={{ position: "absolute", bottom: contentPadBottom, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: qText, opacity: 0.5 }}>{slideLabel}</div>}
        </div>
      );
    }
    // Editorial quote: quote mark on right, text left-aligned
    if (isEditorial) {
      return (
        <div style={{ width: SW, height: SH, background: qBg, overflow: "hidden", display: "flex", padding: spec.padding, boxSizing: "border-box", position: "relative" }}>
          {BgImageOverlay}
          <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
          {LogoOverlay}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: qBg === theme.card ? theme.muted : qText, opacity: 0.6 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: Math.round(60 * hScale) }}>
              <div style={{ width: 40, height: 4, background: theme.accent, borderRadius: 2, marginBottom: Math.round(18 * vScale) }} />
              <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize + 2, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: qText, fontStyle: headingItalic ? "italic" : "normal", margin: `0 0 ${Math.round(16 * vScale)}px` }}>{s.headline}</h2>
              <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: qBody, margin: 0, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${qBg === theme.card ? theme.border : "rgba(255,255,255,0.18)"}`, paddingTop: 20, flexShrink: 0 }}>
              <Pill tag={s.tag} type={type} variant={qBg === theme.card ? "default" : "light"} T={theme} />
              {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: qBg === theme.card ? theme.accent : qText, opacity: 0.85 }}>{slideLabel}</span>}
            </div>
          </div>
          {/* Large quote mark on right */}
          <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", fontFamily: "'DM Serif Display',serif", fontSize: SH * 0.7, lineHeight: 0.8, color: theme.accent, opacity: 0.06, userSelect: "none", pointerEvents: "none" }}>&rdquo;</div>
        </div>
      );
    }
    // Minimal quote: ultra-clean
    if (isMinimal) {
      return (
        <div style={{ width: SW, height: SH, background: qBg, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", padding: layoutPad, boxSizing: "border-box", position: "relative" }}>
          {BgImageOverlay}
          {LogoOverlay}
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 60, lineHeight: 0.6, color: theme.accent, opacity: 0.25, userSelect: "none", marginBottom: Math.round(16 * vScale) }}>&ldquo;</div>
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: qText, fontStyle: headingItalic ? "italic" : "normal", margin: `0 0 ${Math.round(16 * vScale)}px` }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: qBody, margin: 0, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 20, flexShrink: 0 }}>
            {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.accent, opacity: 0.5 }}>{slideLabel}</span>}
            <span style={{ fontSize: 11, color: effectiveText, opacity: 0.3 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        </div>
      );
    }
    // Classic quote
    return (
      <div style={{ width: SW, height: SH, background: qBg, overflow: "hidden", display: "flex", flexDirection: "column", padding: spec.padding, boxSizing: "border-box", position: "relative" }}>
        {BgImageOverlay}
        <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
        {LogoOverlay}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: spec.quoteMarkSize, lineHeight: 0.78, color: effectiveBg === theme.card ? theme.accent : qText, opacity: spec.quoteMarkOpacity, userSelect: "none", marginLeft: -10, marginTop: -8 }}>&ldquo;</div>
          <span style={{ fontSize: 12, color: effectiveBg === theme.card ? theme.muted : qText, paddingTop: 8, opacity: 0.6 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: -26, position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: qText, fontStyle: headingItalic ? "italic" : "normal", margin: `0 0 ${Math.round(20 * vScale)}px` }}>{s.headline}</h2>
          {spec.showAccentUnderline && <div style={{ width: "40%", height: 3, background: theme.accent, borderRadius: 2, marginBottom: Math.round(16 * vScale) }} />}
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: qBody, margin: 0, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${effectiveBg === theme.card ? theme.border : "rgba(255,255,255,0.18)"}`, paddingTop: 20, flexShrink: 0 }}>
          <Pill tag={s.tag} type={type} variant={effectiveBg === theme.card ? "default" : "light"} T={theme} />
          {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveBg === theme.card ? theme.accent : qText, opacity: 0.85 }}>{slideLabel}</span>}
        </div>
      </div>
    );
  }

  /* ═══════════ CTA ═══════════ */
  if (type === "cta") {
    // Centered CTA
    if (isCentered) {
      return (
        <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: layoutPad, boxSizing: "border-box" }}>
          {BgImageOverlay}
          <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
          {LogoOverlay}
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, margin: "0 0 16px", maxWidth: "90%" }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.65, color: effectiveText, opacity: spec.bodyOpacity, margin: "0 0 24px", maxWidth: "85%" }}>{s.body}</p>
          {s.ctaButton && (
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: theme.accent, color: contrastText(theme.accent),
              padding: `${Math.round(14 * vScale)}px ${Math.round(32 * hScale)}px`,
              borderRadius: 10, fontSize: Math.round(15 * vScale), fontWeight: 700,
            }}>
              {s.ctaButton}
            </div>
          )}
          <div style={{ position: "absolute", bottom: contentPadBottom, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveText, opacity: 0.5 }}>
            {!hideBrandText && slideLabel}
          </div>
        </div>
      );
    }
    // Minimal CTA: very stripped down
    if (isMinimal) {
      return (
        <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: layoutPad, boxSizing: "border-box" }}>
          {BgImageOverlay}
          {LogoOverlay}
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, margin: "0 0 16px" }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.65, color: effectiveText, opacity: spec.bodyOpacity, margin: 0 }}>{s.body}</p>
          {s.ctaButton && (
            <div style={{ marginTop: Math.round(24 * vScale) }}>
              <div style={{
                display: "inline-flex", alignItems: "center",
                background: theme.accent, color: contrastText(theme.accent),
                padding: `${Math.round(12 * vScale)}px ${Math.round(28 * hScale)}px`,
                borderRadius: 10, fontSize: Math.round(15 * vScale), fontWeight: 700,
              }}>
                {s.ctaButton}
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: Math.round(28 * vScale), flexShrink: 0 }}>
            {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: effectiveText, opacity: 0.5 }}>{slideLabel}</span>}
            <span style={{ fontSize: 11, color: effectiveText, opacity: 0.3 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        </div>
      );
    }
    // Classic/editorial CTA (same layout, editorial just skips icon)
    return (
      <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", padding: spec.padding, boxSizing: "border-box" }}>
        {BgImageOverlay}
        <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
        {LogoOverlay}
        {(s.tag || (!hideCounter && n > 1)) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", flexShrink: 0 }}>
            {s.tag ? <Pill tag={s.tag} type={type} variant={bgMode === "light" ? "default" : "light"} T={theme} /> : <span />}
            <span style={{ fontSize: 12, color: effectiveText, opacity: 0.45 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
          {spec.showIcon && !s.hideIcon && !isEditorial && (
            <div style={{ fontSize: spec.iconSize, lineHeight: 1, color: effectiveText, opacity: spec.iconOpacity, marginBottom: 20, fontFamily: "'DM Serif Display',serif" }}>&#9670;</div>
          )}
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, margin: "0 0 20px" }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.65, color: effectiveText, opacity: spec.bodyOpacity, margin: 0 }}>{s.body}</p>
          {s.ctaButton && (
            <div style={{ marginTop: Math.round(24 * vScale), position: "relative" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: theme.accent, color: contrastText(theme.accent),
                padding: `${Math.round(12 * vScale)}px ${Math.round(28 * hScale)}px`,
                borderRadius: 10, fontSize: Math.round(15 * vScale), fontWeight: 700,
                letterSpacing: "0.01em",
              }}>
                {s.ctaButton}
              </div>
            </div>
          )}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 20, position: "relative", flexShrink: 0 }}>
          {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveText, opacity: 0.6 }}>{slideLabel}</span>}
        </div>
      </div>
    );
  }

  /* ═══════════ INSIGHT (default) ═══════════ */

  // Centered insight
  if (isCentered) {
    return (
      <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", position: "relative", boxSizing: "border-box", padding: layoutPad }}>
        {BgImageOverlay}
        {LogoOverlay}
        {/* Ghost number */}
        {activeBgMode === "off" && ghostNumbers !== "off" && !(ghostNumbers === "middle" && (i === 0 || i === n - 1)) && (
          <div style={{ position: "absolute", bottom: -14, right: -8, fontFamily: "'DM Serif Display',serif", fontSize: spec.ghostSize, fontWeight: 400, lineHeight: 1, color: theme.accent, opacity: spec.ghostOpacity * 0.6, userSelect: "none", letterSpacing: "-0.04em", pointerEvents: "none" }}>
            {String(i + 1).padStart(2, "0")}
          </div>
        )}
        <Pill tag={s.tag} type={type} variant="default" T={theme} />
        <div style={{ width: 40, height: 3, background: theme.accent, borderRadius: 2, margin: `${Math.round(18 * vScale)}px auto` }} />
        <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, margin: `0 0 ${Math.round(14 * vScale)}px`, maxWidth: "88%" }}>{s.headline}</h2>
        <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: effectiveBody, margin: 0, opacity: spec.bodyOpacity || 1, maxWidth: "85%" }}>{s.body}</p>
        {/* Footer */}
        <div style={{ position: "absolute", bottom: contentPadBottom, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
          {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.accent, opacity: 0.6 }}>{slideLabel}</span>}
          <span style={{ fontSize: 11, color: effectiveText, opacity: 0.35 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
        </div>
      </div>
    );
  }

  // Editorial insight: headline large at top, body below divider
  if (isEditorial) {
    return (
      <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box", padding: spec.padding }}>
        <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
        {LogoOverlay}
        {/* Ghost number */}
        {activeBgMode === "off" && ghostNumbers !== "off" && !(ghostNumbers === "middle" && (i === 0 || i === n - 1)) && (
          <div style={{ position: "absolute", bottom: -14, right: -8, fontFamily: "'DM Serif Display',serif", fontSize: spec.ghostSize, fontWeight: 400, lineHeight: 1, color: theme.accent, opacity: spec.ghostOpacity, userSelect: "none", letterSpacing: "-0.04em", pointerEvents: "none" }}>
            {String(i + 1).padStart(2, "0")}
          </div>
        )}
        <Pill tag={s.tag} type={type} variant={intensity === "dramatic" ? "light" : "default"} T={theme} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: headingFont, fontSize: Math.round(spec.headlineSize * 1.15), fontWeight: headingWeight, lineHeight: 1.08, color: effectiveText, margin: 0 }}>{s.headline}</h2>
        </div>
        <div style={{ borderTop: `3px solid ${theme.accent}`, paddingTop: Math.round(14 * vScale), flexShrink: 0 }}>
          <p style={{ fontSize: spec.bodySize + 1, lineHeight: 1.65, color: effectiveBody, margin: `0 0 ${Math.round(14 * vScale)}px`, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
          <Bar brand={hideBrandText ? "" : brand} i={i} n={n} T={theme} hideCounter={hideCounter} />
        </div>
      </div>
    );
  }

  // Minimal insight
  if (isMinimal) {
    return (
      <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box", padding: layoutPad }}>
        {BgImageOverlay}
        {LogoOverlay}
        <Pill tag={s.tag} type={type} variant="default" T={theme} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, margin: `0 0 ${Math.round(14 * vScale)}px` }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: effectiveBody, margin: 0, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, paddingTop: 16 }}>
          {!hideBrandText && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.accent, opacity: 0.5 }}>{slideLabel}</span>}
          <span style={{ fontSize: 11, color: effectiveText, opacity: 0.3 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
        </div>
      </div>
    );
  }

  // Classic insight (default)
  return (
    <div style={{ width: SW, height: SH, background: effectiveBg, overflow: "hidden", display: "flex", position: "relative", boxSizing: "border-box" }}>
      <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
      {/* Ghost number */}
      {activeBgMode === "off" && ghostNumbers !== "off" && !(ghostNumbers === "middle" && (i === 0 || i === n - 1)) && (
        <div style={{ position: "absolute", bottom: -14, right: -8, fontFamily: "'DM Serif Display',serif", fontSize: spec.ghostSize, fontWeight: 400, lineHeight: 1, color: theme.accent, opacity: spec.ghostOpacity, userSelect: "none", letterSpacing: "-0.04em", pointerEvents: "none" }}>
          {String(i + 1).padStart(2, "0")}
        </div>
      )}
      <div style={{ flex: 1, padding: spec.padding, display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box", marginLeft: spec.barW > 0 ? 0 : undefined }}>
        <Pill tag={s.tag} type={type} variant={intensity === "dramatic" ? "light" : "default"} T={theme} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: `${Math.round(18 * vScale)}px 0` }}>
          <div style={{ width: spec.dividerW, height: spec.dividerH, background: theme.accent, borderRadius: 2, marginBottom: Math.round(22 * vScale) }} />
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: effectiveText, margin: `0 0 ${Math.round(18 * vScale)}px` }}>{s.headline}</h2>
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: effectiveBody, margin: 0, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
        </div>
        <Bar brand={hideBrandText ? "" : brand} i={i} n={n} T={theme} hideCounter={hideCounter} />
      </div>
    </div>
  );
}

export function ScaledSlide({ s, brand, i, n, T, size, intensity, aspect = "1:1", bgMode = "default", logoConfig, brandLogos, brandFonts, brandBgImage, bgImageMode, ghostNumbers, hideAllCounters, slideLayout }) {
  const { w, h } = SLIDE_ASPECTS[aspect] || SLIDE_ASPECTS["1:1"];
  const sc = size / w;
  const scaledH = h * sc;
  return (
    <div style={{ width: size, height: scaledH, borderRadius: 16, overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)" }}>
      <div style={{ width: w, height: h, transform: `scale(${sc})`, transformOrigin: "top left" }}>
        <SlideInner s={s} brand={brand} i={i} n={n} T={T} intensity={intensity} aspect={aspect} bgMode={bgMode} logoConfig={logoConfig} brandLogos={brandLogos} brandFonts={brandFonts} brandBgImage={brandBgImage} bgImageMode={bgImageMode} ghostNumbers={ghostNumbers} hideAllCounters={hideAllCounters} slideLayout={slideLayout} />
      </div>
    </div>
  );
}
