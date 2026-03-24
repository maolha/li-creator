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

export function SlideInner({ s, brand, i, n, T, intensity = "clean", aspect = "1:1", bgMode = "default", logoConfig, brandLogos, brandFonts, brandBgImage, bgImageMode = "off", ghostNumbers = "on" }) {
  const type = s.type || "insight";
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
  const vScale = SH / 540; // vertical scale factor
  const hScale = SW / 540; // horizontal scale factor

  // Adjust padding, font sizes, and spacing for aspect
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
      accent: invCt, // accent elements become contrast color so they're visible on accent bg
      muted: invCt === "#FFFFFF" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)",
      border: invCt === "#FFFFFF" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)",
      soft: invCt === "#FFFFFF" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    };
  }
  // Override spec bg/colors if bgMode changes the background
  const effectiveBg = bgMode === "default" ? spec.bg : theme.card;
  const effectiveText = bgMode === "default" ? (spec.textColor || theme.text) : theme.text;
  const effectiveBody = bgMode === "default" ? (spec.bodyColor || theme.muted) : theme.muted;

  const ct = contrastText(theme.accent);

  // Logo overlay
  const logoUrl = (() => {
    if (!showLogo || !brandLogos) return null;
    // Per-slide override: s.logoVersion can be "light", "dark", "none", or undefined (auto)
    if (s.logoVersion === "none") return null;
    if (s.logoVersion === "light") return brandLogos.light || brandLogos.dark;
    if (s.logoVersion === "dark") return brandLogos.dark || brandLogos.light;
    // Auto: pick light logo for dark bg, dark logo for light bg
    const bgIsDark = contrastText(effectiveBg || theme.card) === "#FFFFFF";
    return bgIsDark ? (brandLogos.light || brandLogos.dark) : (brandLogos.dark || brandLogos.light);
  })();

  const logoPos = s.logoPosition || logoConfig?.position || "top-right";
  // Logo padding matches slide content edges
  const padParts = (spec.padding || "44px 50px").split(" ").map((p) => parseInt(p));
  const contentPadTop = padParts[0] || 44;
  const contentPadRight = padParts[1] || padParts[0] || 50;
  const contentPadLeft = padParts[3] || padParts[1] || padParts[0] || 50;
  const contentPadBottom = padParts[2] || padParts[0] || 44;
  // Add accent bar offset for left positioning
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

  const slideLabel = s.label !== undefined ? s.label : brand; // per-slide override
  const hideCounter = !!logoUrl || s.hideCounter; // hide when logo showing or per-slide toggle
  const hideBrandText = !!logoUrl && !s.label; // logo replaces brand text unless slide has custom label

  // Brand fonts
  const headingFont = brandFonts?.heading ? `'${brandFonts.heading}', sans-serif` : "'DM Serif Display',serif";
  const headingWeight = WEIGHT_MAP[brandFonts?.headingWeight] || 400;
  const headingItalic = !brandFonts?.heading; // only italic for default DM Serif

  /* COVER */
  if (type === "cover") {
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

  /* STAT */
  if (type === "stat") {
    const sn = s.stat || "?";
    const sf = s.statFontSize || spec.statSize(sn.length);
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

  /* QUOTE */
  if (type === "quote") {
    const qBg = effectiveBg;
    const qText = effectiveText;
    const qBody = effectiveBody;
    const isCentered = spec.centered;
    return (
      <div style={{ width: SW, height: SH, background: qBg, overflow: "hidden", display: "flex", flexDirection: "column", padding: spec.padding, boxSizing: "border-box", justifyContent: isCentered ? "center" : undefined, alignItems: isCentered ? "center" : undefined, textAlign: isCentered ? "center" : undefined, position: "relative" }}>
        {BgImageOverlay}
        <Decorations items={activeBgMode !== "off" ? [] : spec.decorations} />
        {LogoOverlay}
        {/* Quote mark */}
        {spec.quoteMarkPosition === "center" ? (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: "'DM Serif Display',serif", fontSize: spec.quoteMarkSize, lineHeight: 0.8, color: qText, opacity: spec.quoteMarkOpacity, userSelect: "none", pointerEvents: "none" }}>&ldquo;</div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: spec.quoteMarkSize, lineHeight: 0.78, color: effectiveBg === theme.card ? theme.accent : qText, opacity: spec.quoteMarkOpacity, userSelect: "none", marginLeft: -10, marginTop: -8 }}>&ldquo;</div>
            <span style={{ fontSize: 12, color: effectiveBg === theme.card ? theme.muted : qText, paddingTop: 8, opacity: 0.6 }}>{!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
          </div>
        )}
        <div style={{ flex: isCentered ? undefined : 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: isCentered ? 0 : -26, position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: headingFont, fontSize: spec.headlineSize, fontWeight: headingWeight, lineHeight: spec.headlineLH, color: qText, fontStyle: headingItalic ? "italic" : "normal", margin: `0 0 ${Math.round(20 * vScale)}px` }}>{s.headline}</h2>
          {spec.showAccentUnderline && <div style={{ width: "40%", height: 3, background: theme.accent, borderRadius: 2, marginBottom: Math.round(16 * vScale), marginLeft: isCentered ? "auto" : 0, marginRight: isCentered ? "auto" : undefined }} />}
          <p style={{ fontSize: spec.bodySize, lineHeight: 1.72, color: qBody, margin: 0, opacity: spec.bodyOpacity || 1 }}>{s.body}</p>
        </div>
        {!isCentered && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${effectiveBg === theme.card ? theme.border : "rgba(255,255,255,0.18)"}`, paddingTop: 20, flexShrink: 0 }}>
            <Pill tag={s.tag} type={type} variant={effectiveBg === theme.card ? "default" : "light"} T={theme} />
            {!hideBrandText && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: effectiveBg === theme.card ? theme.accent : qText, opacity: 0.85 }}>{slideLabel}</span>}
          </div>
        )}
        {isCentered && !hideBrandText && (
          <div style={{ marginTop: 24, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: qText, opacity: 0.5 }}>{slideLabel}</div>
        )}
      </div>
    );
  }

  /* CTA */
  if (type === "cta") {
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
          {spec.showIcon && !s.hideIcon && (
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

  /* INSIGHT (default) */
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

export function ScaledSlide({ s, brand, i, n, T, size, intensity, aspect = "1:1", bgMode = "default", logoConfig, brandLogos, brandFonts, brandBgImage, bgImageMode, ghostNumbers }) {
  const { w, h } = SLIDE_ASPECTS[aspect] || SLIDE_ASPECTS["1:1"];
  const sc = size / w;
  const scaledH = h * sc;
  return (
    <div style={{ width: size, height: scaledH, borderRadius: 16, overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)" }}>
      <div style={{ width: w, height: h, transform: `scale(${sc})`, transformOrigin: "top left" }}>
        <SlideInner s={s} brand={brand} i={i} n={n} T={T} intensity={intensity} aspect={aspect} bgMode={bgMode} logoConfig={logoConfig} brandLogos={brandLogos} brandFonts={brandFonts} brandBgImage={brandBgImage} bgImageMode={bgImageMode} ghostNumbers={ghostNumbers} />
      </div>
    </div>
  );
}
