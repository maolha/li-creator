import { contrastText } from "../utils/themes";

const SS = 540;

function Pill({ tag, type, light, T }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: light ? "rgba(255,255,255,0.15)" : T.soft,
        border: `1px solid ${light ? "rgba(255,255,255,0.22)" : T.border}`,
        borderRadius: 999,
        padding: "5px 16px",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: light ? "rgba(255,255,255,0.9)" : T.accent,
        flexShrink: 0,
      }}
    >
      {tag || type}
    </div>
  );
}

function Bar({ brand, i, n, light, T }) {
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
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: light ? ct : T.accent,
          opacity: light ? 0.65 : 0.85,
        }}
      >
        {brand}
      </span>
      <span
        style={{
          fontSize: 12,
          color: light ? ct : T.muted,
          opacity: light ? 0.45 : 0.6,
        }}
      >
        {i + 1} / {n}
      </span>
    </div>
  );
}

export function SlideInner({ s, brand, i, n, T }) {
  const type = s.type || "insight";
  const ct = contrastText(T.accent);

  if (type === "cover") {
    const l = s.headline?.length || 0;
    const fs = l > 28 ? 52 : l > 20 ? 62 : 74;
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
          padding: "44px 50px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -90,
            right: -90,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: T.accent,
            opacity: 0.09,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -110,
            left: -60,
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: `2px solid ${T.accent}`,
            opacity: 0.06,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 7,
            height: SS,
            background: T.accent,
          }}
        />
        <div
          style={{
            paddingLeft: 9,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "auto",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: T.accent,
            }}
          >
            {brand}
          </span>
          <span style={{ fontSize: 12, color: T.muted }}>
            {i + 1} / {n}
          </span>
        </div>
        <div style={{ paddingLeft: 9 }}>
          <Pill tag={s.tag} type={type} T={T} />
          <div
            style={{
              width: 64,
              height: 4,
              background: T.accent,
              borderRadius: 2,
              margin: "26px 0 22px",
            }}
          />
          <h1
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: fs,
              fontWeight: 400,
              lineHeight: 1.08,
              color: T.text,
              fontStyle: "italic",
              margin: "0 0 22px",
            }}
          >
            {s.headline}
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: T.muted,
              margin: 0,
            }}
          >
            {s.body}
          </p>
        </div>
      </div>
    );
  }

  if (type === "stat") {
    const sn = s.stat || "?";
    const sf = s.statFontSize || (sn.length > 5 ? 70 : sn.length > 3 ? 90 : 112);
    return (
      <div
        style={{
          width: SS,
          height: SS,
          background: T.card,
          overflow: "hidden",
          display: "flex",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 220,
            flexShrink: 0,
            background: T.accent,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 170,
              height: 170,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.07)",
            }}
          />
          <div
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: sf,
              fontWeight: 400,
              color: ct,
              lineHeight: 1,
              textAlign: "center",
              whiteSpace: "nowrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            {sn}
          </div>
          {s.statLabel && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: ct,
                opacity: 0.7,
                marginTop: 14,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                position: "relative",
                zIndex: 1,
              }}
            >
              {s.statLabel}
            </div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            padding: "44px 42px 40px 36px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          <Pill tag={s.tag} type={type} T={T} />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "22px 0",
            }}
          >
            <div
              style={{
                width: 44,
                height: 4,
                background: T.accent,
                borderRadius: 2,
                marginBottom: 20,
              }}
            />
            <h2
              style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: 36,
                fontWeight: 400,
                lineHeight: 1.25,
                color: T.text,
                margin: "0 0 16px",
              }}
            >
              {s.headline}
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.72,
                color: T.muted,
                margin: 0,
              }}
            >
              {s.body}
            </p>
          </div>
          <Bar brand={brand} i={i} n={n} T={T} />
        </div>
      </div>
    );
  }

  if (type === "quote") {
    const l = s.headline?.length || 0;
    const fs = l > 42 ? 30 : l > 28 ? 37 : 45;
    return (
      <div
        style={{
          width: SS,
          height: SS,
          background: T.card,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: "40px 50px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: 180,
              lineHeight: 0.78,
              color: T.accent,
              opacity: 0.17,
              userSelect: "none",
              marginLeft: -10,
              marginTop: -8,
            }}
          >
            &ldquo;
          </div>
          <span style={{ fontSize: 12, color: T.muted, paddingTop: 8 }}>
            {i + 1} / {n}
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginTop: -26,
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: fs,
              fontWeight: 400,
              lineHeight: 1.33,
              color: T.text,
              fontStyle: "italic",
              margin: "0 0 20px",
            }}
          >
            {s.headline}
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.72,
              color: T.muted,
              margin: 0,
            }}
          >
            {s.body}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${T.border}`,
            paddingTop: 20,
            flexShrink: 0,
          }}
        >
          <Pill tag={s.tag} type={type} T={T} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: T.accent,
              opacity: 0.85,
            }}
          >
            {brand}
          </span>
        </div>
      </div>
    );
  }

  if (type === "cta") {
    const l = s.headline?.length || 0;
    const fs = l > 28 ? 46 : l > 20 ? 55 : 64;
    return (
      <div
        style={{
          width: SS,
          height: SS,
          background: T.accent,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "44px 50px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 310,
            height: 310,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -40,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.05)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <Pill tag={s.tag} type={type} light T={T} />
          <span style={{ fontSize: 12, color: ct, opacity: 0.45 }}>
            {i + 1} / {n}
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1,
              color: ct,
              opacity: 0.55,
              marginBottom: 20,
              fontFamily: "'DM Serif Display',serif",
            }}
          >
            &#9670;
          </div>
          <h2
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: fs,
              fontWeight: 400,
              lineHeight: 1.12,
              color: ct,
              margin: "0 0 20px",
            }}
          >
            {s.headline}
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: ct,
              opacity: 0.78,
              margin: 0,
            }}
          >
            {s.body}
          </p>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.18)",
            paddingTop: 20,
            position: "relative",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: ct,
              opacity: 0.6,
            }}
          >
            {brand}
          </span>
        </div>
      </div>
    );
  }

  // INSIGHT (default)
  const l = s.headline?.length || 0;
  const fs = l > 35 ? 38 : l > 24 ? 46 : 54;
  return (
    <div
      style={{
        width: SS,
        height: SS,
        background: T.card,
        overflow: "hidden",
        display: "flex",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 8,
          height: SS,
          background: T.accent,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -14,
          right: -8,
          fontFamily: "'DM Serif Display',serif",
          fontSize: 250,
          fontWeight: 400,
          lineHeight: 1,
          color: T.accent,
          opacity: 0.04,
          userSelect: "none",
          letterSpacing: "-0.04em",
          pointerEvents: "none",
        }}
      >
        {String(i + 1).padStart(2, "0")}
      </div>
      <div
        style={{
          flex: 1,
          padding: "44px 46px 40px 40px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <Pill tag={s.tag} type={type} T={T} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "18px 0",
          }}
        >
          <div
            style={{
              width: 50,
              height: 4,
              background: T.accent,
              borderRadius: 2,
              marginBottom: 22,
            }}
          />
          <h2
            style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: fs,
              fontWeight: 400,
              lineHeight: 1.18,
              color: T.text,
              margin: "0 0 18px",
            }}
          >
            {s.headline}
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.72,
              color: T.muted,
              margin: 0,
            }}
          >
            {s.body}
          </p>
        </div>
        <Bar brand={brand} i={i} n={n} T={T} />
      </div>
    </div>
  );
}

export function ScaledSlide({ s, brand, i, n, T, size }) {
  const sc = size / SS;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          width: SS,
          height: SS,
          transform: `scale(${sc})`,
          transformOrigin: "top left",
        }}
      >
        <SlideInner s={s} brand={brand} i={i} n={n} T={T} />
      </div>
    </div>
  );
}
