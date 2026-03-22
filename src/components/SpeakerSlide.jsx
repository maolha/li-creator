import { contrastText } from "../utils/themes";

const SS = 540;

const LAYOUTS = {
  classic: "Classic",
  centered: "Centered",
  bold: "Bold Banner",
  minimal: "Minimal",
};

export { LAYOUTS as SPEAKER_LAYOUTS };

export function SpeakerSlideInner({ data, T, brand }) {
  const { eventTitle, eventDate, cta, eventLogo, sessionTitle } = data || {};
  const speakers = Array.isArray(data?.speakers) ? data.speakers : [];
  const style = data?.style || {};
  const layout = style.layout || "classic";
  const ctaColor = style.ctaColor || T.accent;
  const ctaTextColor = contrastText(ctaColor);
  const ct = contrastText(T.accent);
  const count = speakers.filter((s) => s?.name).length || 1;
  const photoShape = style.photoShape || "circle"; // circle | rounded | square

  const photoRadius = photoShape === "circle" ? "50%" : photoShape === "rounded" ? 12 : 0;

  // ── CENTERED LAYOUT ──
  if (layout === "centered") {
    return (
      <div style={{ width: SS, height: SS, background: T.card, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: SS, height: 6, background: T.accent }} />
        <div style={{ position: "absolute", top: -100, right: -100, width: 350, height: 350, borderRadius: "50%", background: T.accent, opacity: 0.05 }} />

        {eventLogo ? (
          <img src={eventLogo} alt="" style={{ height: 28, maxWidth: 90, objectFit: "contain", marginBottom: 16 }} />
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent, opacity: 0.7, marginBottom: 16 }}>{brand}</span>
        )}

        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: eventTitle?.length > 35 ? 28 : 36, fontWeight: 400, lineHeight: 1.15, color: T.text, margin: "0 40px 8px", fontStyle: "italic" }}>
          {eventTitle || "Event Title"}
        </h2>
        {sessionTitle && <div style={{ fontSize: 13, color: T.muted, margin: "0 40px 16px", fontWeight: 500 }}>{sessionTitle}</div>}

        {eventDate && <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>{eventDate}</div>}

        <div style={{ display: "flex", gap: count === 1 ? 0 : 20, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          {speakers.filter((s) => s?.name).map((speaker, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: count === 1 ? 96 : count === 2 ? 80 : 64, height: count === 1 ? 96 : count === 2 ? 80 : 64, borderRadius: photoRadius, background: T.soft, border: `3px solid ${T.accent}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {speaker.photo ? <img src={speaker.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                  <div style={{ fontSize: 30, color: T.accent, opacity: 0.3, fontFamily: "'DM Serif Display',serif" }}>{speaker.name?.charAt(0)?.toUpperCase() || "?"}</div>}
              </div>
              <div>
                <div style={{ fontSize: count === 1 ? 16 : 13, fontWeight: 700, color: T.text }}>{speaker.name}</div>
                {speaker.title && <div style={{ fontSize: 11, color: T.accent, fontWeight: 500, marginTop: 1 }}>{speaker.title}</div>}
                {speaker.company && <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{speaker.company}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: ctaColor, color: ctaTextColor, padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {cta || "Register now"}
        </div>
      </div>
    );
  }

  // ── BOLD BANNER LAYOUT ──
  if (layout === "bold") {
    return (
      <div style={{ width: SS, height: SS, background: T.accent, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 250, height: 250, borderRadius: "50%", background: "rgba(0,0,0,0.05)" }} />

        <div style={{ padding: "32px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "4px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>
            Speaker{count > 1 ? "s" : ""}
          </div>
          {eventDate && <div style={{ fontSize: 12, color: ct, opacity: 0.6 }}>{eventDate}</div>}
        </div>

        <div style={{ flex: 1, padding: "20px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: eventTitle?.length > 35 ? 30 : 42, fontWeight: 400, lineHeight: 1.12, color: ct, margin: "0 0 8px", fontStyle: "italic" }}>
            {eventTitle || "Event Title"}
          </h2>
          {sessionTitle && <div style={{ fontSize: 13, color: ct, opacity: 0.7, marginBottom: 20, fontWeight: 500 }}>{sessionTitle}</div>}

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {speakers.filter((s) => s?.name).map((speaker, i) => (
              <div key={i} style={{ display: "flex", alignItems: count === 1 ? "center" : "center", flexDirection: count === 1 ? "row" : "column", gap: count === 1 ? 14 : 6 }}>
                <div style={{ width: count === 1 ? 72 : 56, height: count === 1 ? 72 : 56, borderRadius: photoRadius, background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {speaker.photo ? <img src={speaker.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                    <div style={{ fontSize: 24, color: ct, opacity: 0.4, fontFamily: "'DM Serif Display',serif" }}>{speaker.name?.charAt(0)?.toUpperCase() || "?"}</div>}
                </div>
                <div style={{ textAlign: count === 1 ? "left" : "center" }}>
                  <div style={{ fontSize: count === 1 ? 16 : 12, fontWeight: 700, color: ct }}>{speaker.name}</div>
                  {speaker.title && <div style={{ fontSize: 11, color: ct, opacity: 0.7, marginTop: 1 }}>{speaker.title}</div>}
                  {speaker.company && <div style={{ fontSize: 10, color: ct, opacity: 0.5, marginTop: 1 }}>{speaker.company}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 36px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 16, margin: "0 36px" }}>
          <div style={{ background: "rgba(255,255,255,0.95)", color: T.accent, padding: "8px 22px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            {cta || "Register now"}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: ct, opacity: 0.6 }}>{brand}</span>
        </div>
      </div>
    );
  }

  // ── MINIMAL LAYOUT ──
  if (layout === "minimal") {
    return (
      <div style={{ width: SS, height: SS, background: T.card, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box", padding: "40px 44px" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: SS, background: T.accent }} />

        {eventDate && <div style={{ fontSize: 11, color: T.muted, marginBottom: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{eventDate}</div>}

        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: eventTitle?.length > 35 ? 28 : 38, fontWeight: 400, lineHeight: 1.15, color: T.text, margin: "0 0 8px", fontStyle: "italic" }}>
          {eventTitle || "Event Title"}
        </h2>
        {sessionTitle && <div style={{ fontSize: 13, color: T.muted, marginBottom: 20, fontWeight: 500 }}>{sessionTitle}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          {speakers.filter((s) => s?.name).map((speaker, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: photoRadius, background: T.soft, border: `2px solid ${T.accent}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {speaker.photo ? <img src={speaker.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                  <div style={{ fontSize: 20, color: T.accent, opacity: 0.3 }}>{speaker.name?.charAt(0)?.toUpperCase() || "?"}</div>}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{speaker.name}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{[speaker.title, speaker.company].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ background: ctaColor, color: ctaTextColor, padding: "9px 22px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            {cta || "Register now"}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent, opacity: 0.7 }}>{brand}</span>
        </div>
      </div>
    );
  }

  // ── CLASSIC LAYOUT (default) ──
  return (
    <div style={{ width: SS, height: SS, background: T.card, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: SS, height: 6, background: T.accent }} />
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: T.accent, opacity: 0.06 }} />
      <div style={{ position: "absolute", bottom: -60, left: -40, width: 220, height: 220, borderRadius: "50%", border: `2px solid ${T.accent}`, opacity: 0.05 }} />

      <div style={{ padding: "28px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", background: T.soft, border: `1px solid ${T.border}`, borderRadius: 999, padding: "4px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.accent }}>
            Speaker{count > 1 ? "s" : ""}
          </div>
          {eventDate && <div style={{ fontSize: 12, color: T.muted, marginTop: 8, fontWeight: 500 }}>{eventDate}</div>}
        </div>
        {eventLogo ? (
          <img src={eventLogo} alt="" style={{ height: 32, maxWidth: 100, objectFit: "contain", borderRadius: 4 }} />
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent, opacity: 0.85 }}>{brand}</span>
        )}
      </div>

      <div style={{ padding: "16px 36px 0" }}>
        <div style={{ width: 50, height: 3, background: T.accent, borderRadius: 2, marginBottom: 14 }} />
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: eventTitle?.length > 40 ? 26 : eventTitle?.length > 25 ? 32 : 38, fontWeight: 400, lineHeight: 1.15, color: T.text, margin: 0, fontStyle: "italic" }}>
          {eventTitle || "Event Title"}
        </h2>
        {sessionTitle && <div style={{ fontSize: 13, color: T.muted, marginTop: 8, fontWeight: 500 }}>{sessionTitle}</div>}
      </div>

      <div style={{ flex: 1, padding: "20px 36px", display: "flex", gap: count === 1 ? 0 : 16, alignItems: "center", justifyContent: count === 1 ? "flex-start" : "center" }}>
        {speakers.filter((s) => s?.name).map((speaker, i) => (
          <div key={i} style={{ display: "flex", flexDirection: count === 1 ? "row" : "column", alignItems: "center", gap: count === 1 ? 18 : 8, flex: count === 1 ? undefined : 1 }}>
            <div style={{ width: count === 1 ? 90 : count === 2 ? 80 : 68, height: count === 1 ? 90 : count === 2 ? 80 : 68, borderRadius: photoRadius, background: T.soft, border: `3px solid ${T.accent}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {speaker.photo ? <img src={speaker.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                <div style={{ fontSize: count === 1 ? 36 : 28, color: T.accent, opacity: 0.3, fontFamily: "'DM Serif Display',serif" }}>{speaker.name?.charAt(0)?.toUpperCase() || "?"}</div>}
            </div>
            <div style={{ textAlign: count === 1 ? "left" : "center" }}>
              <div style={{ fontSize: count === 1 ? 18 : count === 2 ? 15 : 13, fontWeight: 700, color: T.text, lineHeight: 1.25 }}>{speaker.name}</div>
              {speaker.title && <div style={{ fontSize: count === 1 ? 13 : 11, color: T.accent, fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>{speaker.title}</div>}
              {speaker.company && <div style={{ fontSize: count === 1 ? 12 : 10, color: T.muted, marginTop: 1, lineHeight: 1.3 }}>{speaker.company}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 36px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.border}`, paddingTop: 16, margin: "0 36px" }}>
        <div style={{ background: ctaColor, color: ctaTextColor, padding: "8px 22px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
          {cta || "Register now"}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent, opacity: 0.85 }}>{brand}</span>
      </div>
    </div>
  );
}

export function ScaledSpeakerSlide({ data, T, brand, size }) {
  const sc = size / SS;
  return (
    <div style={{ width: size, height: size, borderRadius: 16, overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)" }}>
      <div style={{ width: SS, height: SS, transform: `scale(${sc})`, transformOrigin: "top left" }}>
        <SpeakerSlideInner data={data} T={T} brand={brand} />
      </div>
    </div>
  );
}
