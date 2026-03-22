import { contrastText } from "../utils/themes";

const SS = 540;

export function SpeakerSlideInner({ data, T, brand }) {
  const { eventTitle, eventDate, cta, eventLogo } = data || {};
  const speakers = Array.isArray(data?.speakers) ? data.speakers : [];
  const ct = contrastText(T.accent);
  const count = speakers.filter((s) => s?.name).length || 1;

  return (
    <div
      style={{
        width: SS,
        height: SS,
        background: T.card,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, width: SS, height: 6, background: T.accent }} />

      {/* Background decoration */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: T.accent, opacity: 0.06 }} />
      <div style={{ position: "absolute", bottom: -60, left: -40, width: 220, height: 220, borderRadius: "50%", border: `2px solid ${T.accent}`, opacity: 0.05 }} />

      {/* Header */}
      <div style={{ padding: "28px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", background: T.soft,
            border: `1px solid ${T.border}`, borderRadius: 999, padding: "4px 14px",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.accent,
          }}>
            Speaker{count > 1 ? "s" : ""}
          </div>
          {eventDate && (
            <div style={{ fontSize: 12, color: T.muted, marginTop: 8, fontWeight: 500 }}>
              {eventDate}
            </div>
          )}
        </div>
        {eventLogo ? (
          <img src={eventLogo} alt="" style={{ height: 32, maxWidth: 100, objectFit: "contain", borderRadius: 4 }} />
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent, opacity: 0.85 }}>
            {brand}
          </span>
        )}
      </div>

      {/* Event title */}
      <div style={{ padding: "16px 36px 0" }}>
        <div style={{ width: 50, height: 3, background: T.accent, borderRadius: 2, marginBottom: 14 }} />
        <h2 style={{
          fontFamily: "'DM Serif Display',serif",
          fontSize: eventTitle?.length > 40 ? 26 : eventTitle?.length > 25 ? 32 : 38,
          fontWeight: 400, lineHeight: 1.15, color: T.text, margin: 0, fontStyle: "italic",
        }}>
          {eventTitle || "Event Title"}
        </h2>
      </div>

      {/* Speakers */}
      <div style={{
        flex: 1, padding: "20px 36px", display: "flex",
        gap: count === 1 ? 0 : 16,
        alignItems: "center",
        justifyContent: count === 1 ? "flex-start" : "center",
      }}>
        {speakers.filter((s) => s?.name).map((speaker, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: count === 1 ? "row" : "column",
            alignItems: "center",
            gap: count === 1 ? 18 : 8,
            flex: count === 1 ? undefined : 1,
          }}>
            {/* Photo */}
            <div style={{
              width: count === 1 ? 90 : count === 2 ? 80 : 68,
              height: count === 1 ? 90 : count === 2 ? 80 : 68,
              borderRadius: "50%",
              background: T.soft,
              border: `3px solid ${T.accent}`,
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {speaker.photo ? (
                <img
                  src={speaker.photo}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ fontSize: count === 1 ? 36 : 28, color: T.accent, opacity: 0.3, fontFamily: "'DM Serif Display',serif" }}>
                  {speaker.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            {/* Info */}
            <div style={{ textAlign: count === 1 ? "left" : "center" }}>
              <div style={{
                fontSize: count === 1 ? 18 : count === 2 ? 15 : 13,
                fontWeight: 700, color: T.text, lineHeight: 1.25,
              }}>
                {speaker.name}
              </div>
              {speaker.title && (
                <div style={{
                  fontSize: count === 1 ? 13 : 11,
                  color: T.accent, fontWeight: 500, marginTop: 2, lineHeight: 1.3,
                }}>
                  {speaker.title}
                </div>
              )}
              {speaker.company && (
                <div style={{
                  fontSize: count === 1 ? 12 : 10,
                  color: T.muted, marginTop: 1, lineHeight: 1.3,
                }}>
                  {speaker.company}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA footer */}
      <div style={{
        padding: "0 36px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: `1px solid ${T.border}`, paddingTop: 16, margin: "0 36px",
      }}>
        <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>
          {cta || "Register now"}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent, opacity: 0.85 }}>
          {brand}
        </span>
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
