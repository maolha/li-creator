import { contrastText } from "./themes";
import { getIntensitySpec } from "./intensityStyles";

// ── Helpers ──

function esc(str) {
  if (!str) return str;
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hexToRgb(hex) {
  const h = (hex || "#000000").replace("#", "");
  const n = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}

const WEIGHT_MAP = { light: 300, medium: 500, bold: 700, black: 900 };

const ASPECT_PX = {
  "1:1":  { w: 540, h: 540 },
  "4:5":  { w: 540, h: 675 },
  "16:9": { w: 640, h: 360 },
};

// ── Decoration renderer (HTML string, px units) ──

function renderDecorations(items) {
  if (!items?.length) return "";
  return items.map(d => {
    if (d.type === "circle") {
      const pos = [
        d.top != null ? `top:${d.top}px` : "",
        d.right != null ? `right:${d.right}px` : "",
        d.bottom != null ? `bottom:${d.bottom}px` : "",
        d.left != null ? `left:${d.left}px` : "",
      ].filter(Boolean).join(";");
      return `<div style="position:absolute;${pos};width:${d.size}px;height:${d.size}px;border-radius:50%;background:${d.fill||"transparent"};border:${d.border||"none"};opacity:${d.opacity||0.1}"></div>`;
    }
    if (d.type === "accentBar") {
      return `<div style="position:absolute;top:${d.top??0}px;left:${d.left??0}px;width:${d.width}px;height:${d.height}px;background:${d.color||d.gradient};opacity:${d.opacity??1}"></div>`;
    }
    if (d.type === "stripe") {
      return `<div style="position:absolute;top:${d.top??0}px;left:0;width:100%;height:${d.height||6}px;background:${d.color||d.gradient};opacity:${d.opacity??1}"></div>`;
    }
    if (d.type === "texture") {
      return `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.02) 10px,rgba(255,255,255,0.02) 20px);opacity:${d.opacity??1}"></div>`;
    }
    if (d.type === "gradientOverlay") {
      return `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:${d.gradient};opacity:${d.opacity??1}"></div>`;
    }
    if (d.type === "ghostText") {
      const pos = [
        d.top != null ? `top:${d.top}px` : "",
        d.right != null ? `right:${d.right}px` : "",
        d.bottom != null ? `bottom:${d.bottom}px` : "",
        d.left != null ? `left:${d.left}px` : "",
      ].filter(Boolean).join(";");
      return `<div style="position:absolute;${pos};font-family:'DM Serif Display',serif;font-size:${d.fontSize||250}px;font-weight:400;line-height:1;color:${d.color};opacity:${d.opacity||0.04};letter-spacing:${d.letterSpacing||"-0.04em"};white-space:nowrap;${d.rotate?`transform:rotate(${d.rotate}deg)`:""}">${esc(d.text)}</div>`;
    }
    if (d.type === "diagonal") {
      return `<div style="position:absolute;top:50%;left:-25%;width:${d.width||"150%"};height:${d.height||100}px;background:${d.color};opacity:${d.opacity||0.1};transform:rotate(${d.angle||-12}deg);transform-origin:center"></div>`;
    }
    if (d.type === "insetBorder") {
      const off = d.offset || 16;
      return `<div style="position:absolute;top:${off}px;left:${off}px;right:${off}px;bottom:${off}px;border:${d.width||2}px solid ${d.color||"rgba(255,255,255,0.15)"};border-radius:${d.radius||0}px"></div>`;
    }
    return "";
  }).join("");
}

// ── Render an HTML string to a canvas ──

async function renderToCanvas(htmlStr, width, height) {
  const html2canvas = (await import("html2canvas")).default;
  const el = document.createElement("div");
  el.innerHTML = htmlStr;
  // Position offscreen so it doesn't flash
  el.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1";
  document.body.appendChild(el);

  // Wait for fonts used in the HTML to load
  await document.fonts.ready;

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    width,
    height,
    scrollX: 0,
    scrollY: 0,
  });
  document.body.removeChild(el);
  return canvas;
}

// ── Main export (async — direct PDF download) ──

export async function buildPdf(slides, brand, T, options = {}) {
  const {
    intensity = "clean",
    bgMode = "default",
    slideAspect = "1:1",
    brandFonts = {},
    brandBgImage = null,
    bgImageMode = "off",
    logoConfig = {},
    brandLogos = {},
    ghostNumbers = "on",
  } = options;

  const { w: SW, h: SH } = ASPECT_PX[slideAspect] || ASPECT_PX["1:1"];

  // Font setup
  const headingFont = brandFonts?.heading ? `'${brandFonts.heading}', sans-serif` : "'DM Serif Display',serif";
  const headingWeight = WEIGHT_MAP[brandFonts?.headingWeight] || 400;
  const headingItalic = !brandFonts?.heading;
  const bodyFont = brandFonts?.body ? `'${brandFonts.body}', sans-serif` : "'Inter',sans-serif";
  const bodyWeight = WEIGHT_MAP[brandFonts?.bodyWeight] || 400;

  // Preload brand fonts if needed
  const fontFamilies = ["Inter:wght@400;600;700", "DM+Serif+Display:ital@0;1"];
  if (brandFonts?.heading && brandFonts.heading !== "DM Serif Display") {
    fontFamilies.push(`${brandFonts.heading.replace(/ /g, "+")}:wght@300;400;500;600;700;900`);
  }
  if (brandFonts?.body && brandFonts.body !== "Inter") {
    fontFamilies.push(`${brandFonts.body.replace(/ /g, "+")}:wght@300;400;500;600;700`);
  }
  const fontsUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join("&")}&display=swap`;

  // Inject font link into head if not already present
  if (!document.querySelector(`link[href="${fontsUrl}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontsUrl;
    document.head.appendChild(link);
    // Give fonts a moment to start loading
    await new Promise(r => setTimeout(r, 500));
    await document.fonts.ready;
  }

  // Aspect scale factors
  const isWide = slideAspect === "16:9";
  const isTall = slideAspect === "4:5";
  const vScale = SH / 540;
  const hScale = SW / 540;

  // Background mode theme override
  let theme = { ...T };
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

  const ct = contrastText(theme.accent);

  // ── Pill ──
  function pill(tag, type, variant) {
    const isFilled = variant === "filled";
    const isLight = variant === "light";
    const bg = isLight ? "rgba(255,255,255,0.15)" : isFilled ? theme.accent : theme.soft;
    const border = isLight ? "rgba(255,255,255,0.22)" : isFilled ? theme.accent : theme.border;
    const color = isLight ? "rgba(255,255,255,0.9)" : isFilled ? contrastText(theme.accent) : theme.accent;
    return `<div style="display:inline-flex;align-items:center;background:${bg};border:1px solid ${border};border-radius:999px;padding:5px 16px;font-size:13px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:${color};flex-shrink:0">${esc(tag) || esc(type)}</div>`;
  }

  // ── Bar ──
  function bar(label, i, n, light, hideCounter) {
    return `<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${light ? "rgba(255,255,255,0.18)" : theme.border};padding-top:20px;margin-top:auto;flex-shrink:0">
      <span style="font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${light ? ct : theme.accent};opacity:${light ? 0.65 : 0.85}">${esc(label)}</span>
      <span style="font-size:12px;color:${light ? ct : theme.muted};opacity:${light ? 0.45 : 0.6}">${!hideCounter && n > 1 ? `${i + 1} / ${n}` : ""}</span>
    </div>`;
  }

  // ── Logo ──
  function logoHtml(s, i, n, effectiveBg) {
    const cfg = logoConfig?.show || "none";
    let showLogo = false;
    if (cfg === "all") showLogo = true;
    else if (cfg === "first") showLogo = i === 0;
    else if (cfg === "last") showLogo = i === n - 1;
    else if (cfg === "first-last") showLogo = i === 0 || i === n - 1;
    if (!showLogo || !brandLogos) return "";
    if (s.logoVersion === "none") return "";

    let logoUrl;
    if (s.logoVersion === "light") logoUrl = brandLogos.light || brandLogos.dark;
    else if (s.logoVersion === "dark") logoUrl = brandLogos.dark || brandLogos.light;
    else {
      const bgIsDark = contrastText(effectiveBg || theme.card) === "#FFFFFF";
      logoUrl = bgIsDark ? (brandLogos.light || brandLogos.dark) : (brandLogos.dark || brandLogos.light);
    }
    if (!logoUrl) return "";

    const pos = s.logoPosition || logoConfig?.position || "top-right";
    const padV = Math.round(44 * vScale);
    const padH = 50;
    const posStyle = [
      pos.includes("top") ? `top:${padV}px` : `bottom:${padV}px`,
      pos.includes("right") ? `right:${padH}px` : `left:${padH}px`,
    ].join(";");

    return `<img src="${logoUrl}" alt="" crossorigin="anonymous" style="position:absolute;${posStyle};height:${Math.round(SH * 0.055)}px;max-width:${Math.round(SW * 0.18)}px;object-fit:contain;z-index:20;opacity:0.85" />`;
  }

  // ── Background image ──
  function bgImageHtml(s, effectiveBg) {
    const mode = bgImageMode || "off";
    if (mode === "off" || !brandBgImage || s.hideBgImage) return "";
    const imgOpacity = mode === "strong" ? 0.5 : 0.1;
    const overlayBg = mode === "strong"
      ? `linear-gradient(180deg, ${effectiveBg}DD 0%, ${effectiveBg}88 50%, ${effectiveBg}DD 100%)`
      : effectiveBg;
    const overlayOpacity = mode === "strong" ? 1 : 0.82;
    return `<div style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:0">
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url(${brandBgImage});background-size:contain;background-position:center;background-repeat:no-repeat;opacity:${imgOpacity}"></div>
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:${overlayBg};opacity:${overlayOpacity}"></div>
    </div>`;
  }

  // ── Build slide HTML strings ──

  const n = slides.length;
  const slideHtmls = slides.map((s, i) => {
    const type = s.type || "insight";
    const l = s.headline?.length || 0;

    const baseSpec = getIntensitySpec(type, intensity, T, l);
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

    const effectiveBg = bgMode === "default" ? spec.bg : theme.card;
    const effectiveText = bgMode === "default" ? (spec.textColor || theme.text) : theme.text;
    const effectiveBody = bgMode === "default" ? (spec.bodyColor || theme.muted) : theme.muted;

    const slideLabel = s.label !== undefined ? s.label : brand;
    const hasLogo = (() => {
      const cfg = logoConfig?.show || "none";
      if (cfg === "none") return false;
      if (s.logoVersion === "none") return false;
      if (cfg === "all") return true;
      if (cfg === "first") return i === 0;
      if (cfg === "last") return i === n - 1;
      if (cfg === "first-last") return i === 0 || i === n - 1;
      return false;
    })();
    const hideCounter = hasLogo || s.hideCounter;
    const hideBrandText = hasLogo && !s.label;

    const activeBgMode = bgImageMode || "off";
    const decos = activeBgMode !== "off" ? [] : spec.decorations;

    const bodyOpacity = spec.bodyOpacity || 1;
    const headStyle = `font-family:${headingFont};font-weight:${headingWeight};line-height:${spec.headlineLH || 1.18}`;
    const isHeadItalic = headingItalic && (spec.headlineItalic !== false);

    let h = "";

    // ── COVER ──
    if (type === "cover") {
      const barW = spec.accentBarW || 0;
      const barPad = barW > 0 ? `${barW + 2}px` : "0";
      h = `<div style="width:${SW}px;height:${SH}px;background:${effectiveBg};position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:${spec.padding};box-sizing:border-box">
  ${bgImageHtml(s, effectiveBg)}
  ${renderDecorations(decos)}
  ${logoHtml(s, i, n, effectiveBg)}
  <div style="padding-left:${barPad};display:flex;justify-content:space-between;align-items:center;position:relative;flex-shrink:0">
    ${!hideBrandText ? `<span style="font-size:13px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${effectiveText===ct?ct:theme.accent};opacity:${effectiveText===ct?0.8:1}">${esc(slideLabel)}</span>` : "<span></span>"}
    <span style="font-size:12px;color:${effectiveText};opacity:0.5">${!hideCounter && n > 1 ? `${i+1} / ${n}` : ""}</span>
  </div>
  <div style="padding-left:${barPad};position:relative;flex:1;display:flex;flex-direction:column;justify-content:flex-end">
    ${pill(s.tag, type, spec.pillVariant)}
    <div style="width:64px;height:4px;background:${effectiveText===ct?ct:theme.accent};border-radius:2px;margin:${Math.round(26*vScale)}px 0 ${Math.round(22*vScale)}px;opacity:${effectiveText===ct?0.4:1}"></div>
    <h1 style="${headStyle};font-size:${spec.headlineSize}px;color:${effectiveText};font-style:${isHeadItalic && spec.headlineItalic ? "italic" : "normal"};margin:0 0 ${Math.round(22*vScale)}px">${esc(s.headline)}</h1>
    <p style="font-family:${bodyFont};font-weight:${bodyWeight};font-size:${spec.bodySize}px;line-height:1.65;color:${effectiveBody};margin:0;opacity:${bodyOpacity}">${esc(s.body)}</p>
  </div>
</div>`;
    }

    // ── STAT ──
    else if (type === "stat") {
      const sn = s.stat || "?";
      const sf = s.statFontSize || (spec.statSize ? spec.statSize(sn.length) : 90);
      h = `<div style="width:${SW}px;height:${SH}px;background:${theme.card};overflow:hidden;display:flex;box-sizing:border-box">
  <div style="width:${spec.panelW}px;flex-shrink:0;background:${spec.panelBg};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:${Math.round(32*vScale)}px 18px;position:relative;overflow:hidden">
    ${bgImageHtml(s, spec.panelBg)}
    ${renderDecorations(decos)}
    ${logoHtml(s, i, n, spec.panelBg)}
    <div style="${headStyle};font-size:${sf}px;color:${ct};line-height:1;text-align:center;white-space:nowrap;position:relative;z-index:1">${esc(sn)}</div>
    ${s.statLabel ? `<div style="font-size:${spec.labelSize||12}px;font-weight:600;color:${ct};opacity:.7;margin-top:${Math.round(14*vScale)}px;text-align:center;text-transform:uppercase;letter-spacing:${spec.labelSpacing||"0.06em"};position:relative;z-index:1">${esc(s.statLabel)}</div>` : ""}
  </div>
  <div style="flex:1;padding:${Math.round(44*vScale)}px 42px ${Math.round(40*vScale)}px 36px;display:flex;flex-direction:column;box-sizing:border-box">
    ${pill(s.tag, type, "default")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:${Math.round(22*vScale)}px 0">
      <div style="width:44px;height:4px;background:${theme.accent};border-radius:2px;margin-bottom:${Math.round(20*vScale)}px"></div>
      <h2 style="${headStyle};font-size:${spec.headlineSize||36}px;color:${theme.text};margin:0 0 ${Math.round(16*vScale)}px">${esc(s.headline)}</h2>
      <p style="font-family:${bodyFont};font-weight:${bodyWeight};font-size:${spec.bodySize||15}px;line-height:1.72;color:${theme.muted};margin:0">${esc(s.body)}</p>
    </div>
    ${bar(hideBrandText ? "" : slideLabel, i, n, false, hideCounter)}
  </div>
</div>`;
    }

    // ── QUOTE ──
    else if (type === "quote") {
      const qBg = effectiveBg;
      const qText = effectiveText;
      const qBody = effectiveBody;
      const isCentered = spec.centered;
      const isAccentBg = qBg !== theme.card;

      if (isCentered) {
        h = `<div style="width:${SW}px;height:${SH}px;background:${qBg};overflow:hidden;display:flex;flex-direction:column;padding:${spec.padding};box-sizing:border-box;justify-content:center;align-items:center;text-align:center;position:relative">
  ${bgImageHtml(s, qBg)}
  ${renderDecorations(decos)}
  ${logoHtml(s, i, n, qBg)}
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'DM Serif Display',serif;font-size:${spec.quoteMarkSize}px;line-height:0.8;color:${qText};opacity:${spec.quoteMarkOpacity}">&ldquo;</div>
  <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center">
    <h2 style="${headStyle};font-size:${spec.headlineSize}px;color:${qText};font-style:${isHeadItalic?"italic":"normal"};margin:0 0 ${Math.round(20*vScale)}px">${esc(s.headline)}</h2>
    <p style="font-family:${bodyFont};font-weight:${bodyWeight};font-size:${spec.bodySize||15}px;line-height:1.72;color:${qBody};margin:0;opacity:${bodyOpacity}">${esc(s.body)}</p>
  </div>
  ${!hideBrandText ? `<div style="margin-top:24px;font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${qText};opacity:0.5">${esc(slideLabel)}</div>` : ""}
</div>`;
      } else {
        h = `<div style="width:${SW}px;height:${SH}px;background:${qBg};overflow:hidden;display:flex;flex-direction:column;padding:${spec.padding};box-sizing:border-box;position:relative">
  ${bgImageHtml(s, qBg)}
  ${renderDecorations(decos)}
  ${logoHtml(s, i, n, qBg)}
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-shrink:0">
    <div style="font-family:'DM Serif Display',serif;font-size:${spec.quoteMarkSize}px;line-height:.78;color:${!isAccentBg?theme.accent:qText};opacity:${spec.quoteMarkOpacity};margin-left:-10px;margin-top:-8px">&ldquo;</div>
    <span style="font-size:12px;color:${!isAccentBg?theme.muted:qText};padding-top:8px;opacity:0.6">${!hideCounter && n > 1 ? `${i+1} / ${n}` : ""}</span>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;margin-top:-26px;position:relative;z-index:1">
    <h2 style="${headStyle};font-size:${spec.headlineSize}px;color:${qText};font-style:${isHeadItalic?"italic":"normal"};margin:0 0 ${Math.round(20*vScale)}px">${esc(s.headline)}</h2>
    ${spec.showAccentUnderline ? `<div style="width:40%;height:3px;background:${theme.accent};border-radius:2px;margin-bottom:${Math.round(16*vScale)}px"></div>` : ""}
    <p style="font-family:${bodyFont};font-weight:${bodyWeight};font-size:${spec.bodySize||15}px;line-height:1.72;color:${qBody};margin:0;opacity:${bodyOpacity}">${esc(s.body)}</p>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${!isAccentBg?theme.border:"rgba(255,255,255,0.18)"};padding-top:20px;flex-shrink:0">
    ${pill(s.tag, type, !isAccentBg ? "default" : "light")}
    ${!hideBrandText ? `<span style="font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${!isAccentBg?theme.accent:qText};opacity:0.85">${esc(slideLabel)}</span>` : ""}
  </div>
</div>`;
      }
    }

    // ── CTA ──
    else if (type === "cta") {
      h = `<div style="width:${SW}px;height:${SH}px;background:${effectiveBg};overflow:hidden;position:relative;display:flex;flex-direction:column;padding:${spec.padding};box-sizing:border-box">
  ${bgImageHtml(s, effectiveBg)}
  ${renderDecorations(decos)}
  ${logoHtml(s, i, n, effectiveBg)}
  ${(s.tag || (!hideCounter && n > 1)) ? `<div style="display:flex;justify-content:space-between;align-items:center;position:relative;flex-shrink:0">
    ${s.tag ? pill(s.tag, type, bgMode === "light" ? "default" : "light") : "<span></span>"}
    <span style="font-size:12px;color:${effectiveText};opacity:0.45">${!hideCounter && n > 1 ? `${i+1} / ${n}` : ""}</span>
  </div>` : ""}
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;position:relative">
    ${spec.showIcon && !s.hideIcon ? `<div style="font-size:${spec.iconSize}px;line-height:1;color:${effectiveText};opacity:${spec.iconOpacity};margin-bottom:20px;font-family:'DM Serif Display',serif">&#9670;</div>` : ""}
    <h2 style="${headStyle};font-size:${spec.headlineSize}px;color:${effectiveText};margin:0 0 20px">${esc(s.headline)}</h2>
    <p style="font-family:${bodyFont};font-weight:${bodyWeight};font-size:${spec.bodySize}px;line-height:1.65;color:${effectiveText};opacity:${bodyOpacity};margin:0">${esc(s.body)}</p>
    ${s.ctaButton ? `<div style="margin-top:${Math.round(24*vScale)}px"><div style="display:inline-flex;align-items:center;justify-content:center;background:${theme.accent};color:${contrastText(theme.accent)};padding:${Math.round(12*vScale)}px ${Math.round(28*hScale)}px;border-radius:10px;font-size:${Math.round(15*vScale)}px;font-weight:700;letter-spacing:0.01em">${esc(s.ctaButton)}</div></div>` : ""}
  </div>
  <div style="border-top:1px solid rgba(255,255,255,0.18);padding-top:20px;position:relative;flex-shrink:0">
    ${!hideBrandText ? `<span style="font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${effectiveText};opacity:0.6">${esc(slideLabel)}</span>` : ""}
  </div>
</div>`;
    }

    // ── INSIGHT (default) ──
    else {
      const showGhost = activeBgMode === "off" && ghostNumbers !== "off" && !(ghostNumbers === "middle" && (i === 0 || i === n - 1));
      h = `<div style="width:${SW}px;height:${SH}px;background:${effectiveBg};overflow:hidden;display:flex;position:relative;box-sizing:border-box">
  ${bgImageHtml(s, effectiveBg)}
  ${renderDecorations(decos)}
  ${logoHtml(s, i, n, effectiveBg)}
  ${showGhost ? `<div style="position:absolute;bottom:-14px;right:-8px;font-family:'DM Serif Display',serif;font-size:${spec.ghostSize}px;font-weight:400;line-height:1;color:${theme.accent};opacity:${spec.ghostOpacity||0.04};letter-spacing:-0.04em">${String(i+1).padStart(2,"0")}</div>` : ""}
  <div style="flex:1;padding:${spec.padding};display:flex;flex-direction:column;position:relative;box-sizing:border-box">
    ${pill(s.tag, type, intensity === "dramatic" ? "light" : "default")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:${Math.round(18*vScale)}px 0">
      <div style="width:${spec.dividerW||50}px;height:${spec.dividerH||4}px;background:${theme.accent};border-radius:2px;margin-bottom:${Math.round(22*vScale)}px"></div>
      <h2 style="${headStyle};font-size:${spec.headlineSize}px;color:${effectiveText};margin:0 0 ${Math.round(18*vScale)}px">${esc(s.headline)}</h2>
      <p style="font-family:${bodyFont};font-weight:${bodyWeight};font-size:${spec.bodySize}px;line-height:1.72;color:${effectiveBody};margin:0;opacity:${bodyOpacity}">${esc(s.body)}</p>
    </div>
    ${bar(hideBrandText ? "" : slideLabel, i, n, false, hideCounter)}
  </div>
</div>`;
    }

    return h;
  });

  // ── Render each slide to canvas, assemble PDF ──

  const { jsPDF } = await import("jspdf");

  // Use pt units with slide pixel dimensions — gives exact visual size
  const pdf = new jsPDF({
    orientation: SW >= SH ? "landscape" : "portrait",
    unit: "px",
    format: [SW, SH],
  });

  for (let i = 0; i < slideHtmls.length; i++) {
    if (i > 0) pdf.addPage([SW, SH], SW >= SH ? "landscape" : "portrait");
    const canvas = await renderToCanvas(slideHtmls[i], SW, SH);
    // Canvas is 2x scale, fit to page
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, SW, SH);
  }

  pdf.save(`${brand || "slides"}.pdf`);
}
