import { contrastText } from "../utils/themes";

function hexToRgbStr(hex) {
  const h = (hex || "#000000").replace("#", "");
  const n = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}

const ASPECT_RATIOS = {
  "1:1": { w: 540, h: 540 },
  "4:5": { w: 540, h: 675 },
  "16:9": { w: 640, h: 360 },
  "9:16": { w: 360, h: 640 },
};

const LAYOUTS = {
  classic: "Classic",
  centered: "Centered",
  bold: "Bold Banner",
  minimal: "Minimal",
};

export { LAYOUTS as SPEAKER_LAYOUTS, ASPECT_RATIOS as SPEAKER_ASPECTS };

// Responsive sizes based on aspect ratio
function getSizes(aspect, count) {
  const isWide = aspect === "16:9";
  const isTall = aspect === "9:16";
  const isFourFive = aspect === "4:5";
  // 4:5 is taller than 1:1 — more room for bigger photos
  const sz = {
    "16:9": {
      pad: 20, padY: 16,
      titleSize: 22, titleSizeLong: 18, sessionSize: 10,
      photoSz: count === 1 ? 72 : count === 2 ? 64 : 52,
      nameSz: count === 1 ? 14 : 11,
      roleSz: 9, companySz: 8, pillSz: 9,
      ctaSz: 10, ctaPad: "6px 16px",
      dateSz: 9, brandSz: 9,
      barH: 4, accentBarW: 40, accentBarH: 2,
      gap: 10, photoGap: 6, logoH: 22,
    },
    "9:16": {
      pad: 22, padY: 24,
      titleSize: 28, titleSizeLong: 22, sessionSize: 13,
      photoSz: count === 1 ? 100 : count === 2 ? 88 : 72,
      nameSz: count === 1 ? 18 : count === 2 ? 15 : 13,
      roleSz: count === 1 ? 13 : 11, companySz: count === 1 ? 12 : 10, pillSz: 11,
      ctaSz: 12, ctaPad: "8px 22px",
      dateSz: 11, brandSz: 11,
      barH: 6, accentBarW: 50, accentBarH: 3,
      gap: 16, photoGap: 8, logoH: 26,
    },
    "4:5": {
      pad: 32, padY: 26,
      titleSize: 34, titleSizeLong: 26, sessionSize: 13,
      photoSz: count === 1 ? 120 : count === 2 ? 104 : 88,
      nameSz: count === 1 ? 18 : count === 2 ? 16 : 14,
      roleSz: count === 1 ? 13 : 12, companySz: count === 1 ? 12 : 11, pillSz: 11,
      ctaSz: 12, ctaPad: "9px 24px",
      dateSz: 11, brandSz: 11,
      barH: 6, accentBarW: 50, accentBarH: 3,
      gap: 16, photoGap: 10, logoH: 32,
    },
    "1:1": {
      pad: 36, padY: 28,
      titleSize: 34, titleSizeLong: 26, sessionSize: 13,
      photoSz: count === 1 ? 120 : count === 2 ? 100 : 84,
      nameSz: count === 1 ? 18 : count === 2 ? 15 : 13,
      roleSz: count === 1 ? 13 : 11, companySz: count === 1 ? 12 : 10, pillSz: 11,
      ctaSz: 12, ctaPad: "8px 22px",
      dateSz: 11, brandSz: 11,
      barH: 6, accentBarW: 50, accentBarH: 3,
      gap: 16, photoGap: 8, logoH: 32,
    },
  };
  return {
    ...(sz[aspect] || sz["1:1"]),
  };
}

function LogoOrBrand({ eventLogo, logoDarkBg, brand, theme, logoH }) {
  if (eventLogo) {
    return (
      <div style={{ background: logoDarkBg ? "#1a1a2e" : "transparent", borderRadius: logoDarkBg ? 6 : 0, padding: logoDarkBg ? "4px 8px" : 0 }}>
        <img src={eventLogo} alt="" style={{ height: logoH, maxWidth: logoH * 3, objectFit: "contain", display: "block" }} />
      </div>
    );
  }
  return <span style={{ fontSize: Math.max(9, logoH * 0.35), fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: theme.accent, opacity: 0.85 }}>{brand}</span>;
}

function SpeakerPhotos({ speakers, count, photoSz, photoRadius, theme, nameSz, roleSz, companySz, photoGap, direction, ct }) {
  const textColor = ct || theme.text;
  const accentColor = ct ? ct : theme.accent;
  const mutedColor = ct ? (ct === "#FFFFFF" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)") : theme.muted;
  const borderStyle = ct ? "2px solid rgba(255,255,255,0.3)" : `3px solid ${theme.accent}`;
  const photoBg = ct ? "rgba(255,255,255,0.1)" : theme.soft;

  return (
    <div style={{ display: "flex", gap: count === 1 ? 0 : photoGap * 2, alignItems: "flex-start", justifyContent: count === 1 ? "flex-start" : "center", width: "100%" }}>
      {speakers.filter((s) => s?.name).map((speaker, i) => (
        <div key={i} style={{
          display: "flex",
          flexDirection: count === 1 ? "row" : "column",
          alignItems: count === 1 ? "center" : "center",
          gap: count === 1 ? photoGap * 2 : photoGap,
          flex: count > 1 ? 1 : undefined,
          width: count > 1 ? 0 : undefined,
        }}>
          <div style={{
            width: photoSz, height: photoSz, borderRadius: photoRadius,
            background: photoBg, border: borderStyle,
            overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {speaker.photo ? (
              <img src={speaker.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ fontSize: photoSz * 0.35, color: accentColor, opacity: 0.3, fontFamily: "'DM Serif Display',serif" }}>
                {speaker.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div style={{ textAlign: count === 1 ? "left" : "center", minHeight: nameSz * 2.5 }}>
            <div style={{ fontSize: nameSz, fontWeight: 700, color: textColor, lineHeight: 1.25 }}>{speaker.name}</div>
            {speaker.title && <div style={{ fontSize: roleSz, color: ct ? textColor : accentColor, fontWeight: 500, marginTop: 2, lineHeight: 1.3, opacity: ct ? 0.7 : 1 }}>{speaker.title}</div>}
            {speaker.company && <div style={{ fontSize: companySz, color: mutedColor, marginTop: 1, lineHeight: 1.3 }}>{speaker.company}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SpeakerSlideInner({ data, T, brand }) {
  const { eventTitle, eventDate, cta, eventLogo, sessionTitle, regUrl, tagLabel, logoDarkBg } = data || {};
  const speakers = Array.isArray(data?.speakers) ? data.speakers : [];
  const style = data?.style || {};
  const layout = style.layout || "classic";
  const aspect = style.aspect || "1:1";
  const bgMode = style.bgMode || "dark";
  const { w: SW, h: SH } = ASPECT_RATIOS[aspect] || ASPECT_RATIOS["1:1"];

  const accentRgb = hexToRgbStr(T.accent);
  const accentCt = contrastText(T.accent);
  let theme;
  if (bgMode === "light") {
    theme = {
      ...T, card: "#FFFFFF", text: "#1A1A2E", muted: "#6B6B7B",
      border: "rgba(26,26,46,0.10)", soft: `rgba(${accentRgb},0.07)`,
    };
    // Ensure accent is readable on white
    if (contrastText(theme.accent) === "#FFFFFF") {
      // Accent is too dark? It's fine on white. But if accent IS white-ish, darken it
    }
  } else if (bgMode === "invert") {
    theme = {
      ...T, card: T.accent, text: accentCt,
      muted: accentCt === "#FFFFFF" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)",
      border: accentCt === "#FFFFFF" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
      soft: accentCt === "#FFFFFF" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
      accent: accentCt,
    };
  } else {
    theme = { ...T };
  }

  // CONTRAST SAFETY: ensure text is always readable against card background
  const cardCt = contrastText(theme.card);
  if (theme.text === "#111111" && cardCt === "#FFFFFF") {
    // Dark text on dark bg — force white
    theme.text = "#FFFFFF";
    theme.muted = "rgba(255,255,255,0.6)";
  } else if (theme.text === "#FFFFFF" && cardCt === "#111111") {
    // White text on light bg — force dark
    theme.text = "#111111";
    theme.muted = "rgba(0,0,0,0.5)";
  }
  // Ensure accent is visible on card
  if (theme.accent === theme.card || (contrastText(theme.accent) === contrastText(theme.card) && theme.accent === theme.text)) {
    theme.accent = cardCt; // flip accent to contrast
  }

  const ctaColor = style.ctaColor || theme.accent;
  const ctaTextColor = contrastText(ctaColor);
  const ct = contrastText(theme.accent);
  const count = speakers.filter((s) => s?.name).length || 1;
  const photoRadius = (style.photoShape || "circle") === "circle" ? "50%" : (style.photoShape === "rounded" ? 12 : 0);
  const sz = getSizes(aspect, count);
  const tSz = (eventTitle?.length || 0) > 35 ? sz.titleSizeLong : sz.titleSize;

  // Element visibility (all default to true)
  const show = {
    tag: style.showTag !== false,
    date: style.showDate !== false,
    session: style.showSession !== false,
    cta: style.showCta !== false,
    brand: style.showBrand !== false,
    regUrl: style.showRegUrl !== false,
  };

  // ── CENTERED ──
  if (layout === "centered") {
    return (
      <div style={{ width: SW, height: SH, background: theme.card, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box", textAlign: "center", padding: `${sz.padY}px ${sz.pad}px` }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: SW, height: sz.barH, background: theme.accent }} />

        <LogoOrBrand eventLogo={eventLogo} logoDarkBg={logoDarkBg} brand={brand} theme={theme} logoH={sz.logoH * 0.8} />

        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: tSz, fontWeight: 400, lineHeight: 1.15, color: theme.text, margin: `10px 0 ${sessionTitle ? 4 : 10}px`, fontStyle: "italic" }}>
          {eventTitle || "Event Title"}
        </h2>
        {show.session && sessionTitle && <div style={{ fontSize: sz.sessionSize, color: theme.muted, marginBottom: 10, fontWeight: 500 }}>{sessionTitle}</div>}
        {show.date && eventDate && <div style={{ fontSize: sz.dateSz, color: theme.muted, marginBottom: 12 }}>{eventDate}</div>}

        <div style={{ marginBottom: 14 }}>
          <SpeakerPhotos speakers={speakers} count={count} photoSz={sz.photoSz} photoRadius={photoRadius} theme={theme} nameSz={sz.nameSz} roleSz={sz.roleSz} companySz={sz.companySz} photoGap={sz.photoGap} />
        </div>

        <div style={{ background: ctaColor, color: ctaTextColor, padding: sz.ctaPad, borderRadius: 8, fontSize: sz.ctaSz, fontWeight: 700 }}>
          {show.cta ? (cta || "Register now") : ""}
        </div>
      </div>
    );
  }

  // ── BOLD BANNER ──
  if (layout === "bold") {
    return (
      <div style={{ width: SW, height: SH, background: theme.accent, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />

        <div style={{ padding: `${sz.padY}px ${sz.pad}px 0`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: `3px ${sz.pad * 0.4}px`, fontSize: sz.pillSz, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>
            {show.tag ? (tagLabel || (count > 1 ? "Speakers" : "Speaker")) : ""}
          </div>
          {show.date && eventDate && <div style={{ fontSize: sz.dateSz, color: ct, opacity: 0.6 }}>{eventDate}</div>}
        </div>

        <div style={{ flex: 1, padding: `${sz.padY * 0.5}px ${sz.pad}px`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: tSz * 1.1, fontWeight: 400, lineHeight: 1.12, color: ct, margin: `0 0 ${sessionTitle ? 4 : 12}px`, fontStyle: "italic" }}>
            {eventTitle || "Event Title"}
          </h2>
          {show.session && sessionTitle && <div style={{ fontSize: sz.sessionSize, color: ct, opacity: 0.7, marginBottom: 12, fontWeight: 500 }}>{sessionTitle}</div>}

          <SpeakerPhotos speakers={speakers} count={count} photoSz={sz.photoSz} photoRadius={photoRadius} theme={theme} nameSz={sz.nameSz} roleSz={sz.roleSz} companySz={sz.companySz} photoGap={sz.photoGap} ct={ct} />
        </div>

        <div style={{ padding: `0 ${sz.pad}px ${sz.padY}px`, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 12, margin: `0 ${sz.pad}px` }}>
          <div style={{ background: "rgba(255,255,255,0.95)", color: theme.accent, padding: sz.ctaPad, borderRadius: 8, fontSize: sz.ctaSz, fontWeight: 700 }}>
            {show.cta ? (cta || "Register now") : ""}
          </div>
          <span style={{ fontSize: sz.brandSz, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: ct, opacity: 0.6 }}>{brand}</span>
        </div>
      </div>
    );
  }

  // ── MINIMAL ──
  if (layout === "minimal") {
    return (
      <div style={{ width: SW, height: SH, background: theme.card, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box", padding: `${sz.padY}px ${sz.pad + 8}px` }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: SH, background: theme.accent }} />

        {show.date && eventDate && <div style={{ fontSize: sz.dateSz, color: theme.muted, marginBottom: 8, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{eventDate}</div>}

        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: tSz, fontWeight: 400, lineHeight: 1.15, color: theme.text, margin: `0 0 ${sessionTitle ? 4 : 12}px`, fontStyle: "italic" }}>
          {eventTitle || "Event Title"}
        </h2>
        {show.session && sessionTitle && <div style={{ fontSize: sz.sessionSize, color: theme.muted, marginBottom: 12, fontWeight: 500 }}>{sessionTitle}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {speakers.filter((s) => s?.name).map((speaker, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: Math.min(sz.photoSz, 56), height: Math.min(sz.photoSz, 56), borderRadius: photoRadius, background: theme.soft, border: `2px solid ${theme.accent}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {speaker.photo ? <img src={speaker.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                  <div style={{ fontSize: 18, color: theme.accent, opacity: 0.3 }}>{speaker.name?.charAt(0)?.toUpperCase() || "?"}</div>}
              </div>
              <div>
                <div style={{ fontSize: sz.nameSz * 0.85, fontWeight: 700, color: theme.text }}>{speaker.name}</div>
                <div style={{ fontSize: sz.companySz, color: theme.muted }}>{[speaker.title, speaker.company].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ background: ctaColor, color: ctaTextColor, padding: sz.ctaPad, borderRadius: 8, fontSize: sz.ctaSz, fontWeight: 700 }}>
            {show.cta ? (cta || "Register now") : ""}
          </div>
          <span style={{ fontSize: sz.brandSz, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: theme.accent, opacity: 0.7 }}>{brand}</span>
        </div>
      </div>
    );
  }

  // ── CLASSIC (default) ──
  return (
    <div style={{ width: SW, height: SH, background: theme.card, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: SW, height: sz.barH, background: theme.accent }} />
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: theme.accent, opacity: 0.06 }} />

      {/* Header: tag + logo */}
      <div style={{ padding: `${sz.padY}px ${sz.pad}px 0`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
        <div style={{ display: "inline-flex", alignItems: "center", background: theme.soft, border: `1px solid ${theme.border}`, borderRadius: 999, padding: `3px ${sz.pad * 0.4}px`, fontSize: sz.pillSz, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: theme.accent }}>
          {show.tag ? (tagLabel || (count > 1 ? "Speakers" : "Speaker")) : ""}
        </div>
        <LogoOrBrand eventLogo={eventLogo} logoDarkBg={logoDarkBg} brand={brand} theme={theme} logoH={sz.logoH} />
      </div>

      {/* Title (capped height) */}
      <div style={{ padding: `10px ${sz.pad}px 0`, maxHeight: SH * 0.28, overflow: "hidden", flexShrink: 0 }}>
        <div style={{ width: sz.accentBarW, height: sz.accentBarH, background: theme.accent, borderRadius: 2, marginBottom: 10 }} />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: tSz, fontWeight: 400, lineHeight: 1.15, color: theme.text, margin: 0, fontStyle: "italic" }}>
          {eventTitle || "Event Title"}
        </h2>
        {show.session && sessionTitle && <div style={{ fontSize: sz.sessionSize, color: theme.muted, marginTop: 6, fontWeight: 500 }}>{sessionTitle}</div>}
      </div>

      {/* Speakers */}
      <div style={{ flex: 1, padding: `12px ${sz.pad}px`, display: "flex", alignItems: "flex-start", paddingTop: 14 }}>
        <SpeakerPhotos speakers={speakers} count={count} photoSz={sz.photoSz} photoRadius={photoRadius} theme={theme} nameSz={sz.nameSz} roleSz={sz.roleSz} companySz={sz.companySz} photoGap={sz.photoGap} />
      </div>

      {/* Footer */}
      <div style={{ padding: `0 ${sz.pad}px ${sz.padY * 0.7}px`, borderTop: `1px solid ${theme.border}`, paddingTop: 10, margin: `0 ${sz.pad}px`, flexShrink: 0 }}>
        {show.date && eventDate && <div style={{ fontSize: sz.dateSz, color: theme.muted, marginBottom: 6, fontWeight: 500 }}>{eventDate}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: ctaColor, color: ctaTextColor, padding: sz.ctaPad, borderRadius: 8, fontSize: sz.ctaSz, fontWeight: 700 }}>
              {show.cta ? (cta || "Register now") : ""}
            </div>
            {show.regUrl && regUrl && <span style={{ fontSize: Math.max(8, sz.dateSz - 2), color: theme.muted, opacity: 0.7 }}>{regUrl.replace(/^https?:\/\//, "")}</span>}
          </div>
          <span style={{ fontSize: sz.brandSz, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: theme.accent, opacity: 0.85 }}>{brand}</span>
        </div>
      </div>
    </div>
  );
}

export function ScaledSpeakerSlide({ data, T, brand, size }) {
  const aspect = data?.style?.aspect || "1:1";
  const { w, h } = ASPECT_RATIOS[aspect] || ASPECT_RATIOS["1:1"];
  const sc = size / w;
  const scaledH = h * sc;
  return (
    <div style={{ width: size, height: scaledH, borderRadius: 16, overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)" }}>
      <div style={{ width: w, height: h, transform: `scale(${sc})`, transformOrigin: "top left" }}>
        <SpeakerSlideInner data={data} T={T} brand={brand} />
      </div>
    </div>
  );
}
