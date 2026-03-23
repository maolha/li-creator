import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage({ onSignIn, loading }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c10", color: "#e8e6e3", fontFamily: "'Manrope', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        ::selection { background: rgba(0, 119, 181, 0.4); }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>

      {/* ── NAV ── */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "rgba(10,12,16,0.7)", backdropFilter: "blur(24px)" }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72, padding: "0 clamp(20px, 4vw, 48px)", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #0077B5, #571BC1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 800 }}>&#9670;</div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>ContentForge</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSignIn}
            style={{ background: "#fff", color: "#0a0c10", padding: "10px 22px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
          >
            Get Started
          </motion.button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        {/* Atmospheric background */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,119,181,0.15), transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 80% 60%, rgba(87,27,193,0.1), transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to top, #0a0c10, transparent)" }} />

        {/* Floating product mockups */}
        <motion.div style={{ y: heroY, opacity: heroOpacity, position: "absolute", right: "clamp(4%, 8vw, 12%)", top: "20%", width: "clamp(240px, 30vw, 400px)" }}>
          {/* Carousel mockup */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{ background: "#151820", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            <div style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", borderRadius: 10, height: "clamp(180px, 22vw, 280px)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(20px, 3vw, 36px)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>CAROUSEL SLIDE</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.15, color: "#fff" }}>The future belongs to those who create it</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>1 / 7</div>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 12, justifyContent: "center" }}>
              {[1,2,3,4,5,6,7].map((_, i) => <div key={i} style={{ width: i === 0 ? 20 : 6, height: 6, borderRadius: 3, background: i === 0 ? "#0077B5" : "rgba(255,255,255,0.15)" }} />)}
            </div>
          </motion.div>

          {/* Floating stat card */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            style={{ position: "absolute", bottom: -40, left: -60, background: "#151820", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", width: 150 }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0077B5", marginBottom: 6 }}>STAT CARD</div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: "#e8e6e3", lineHeight: 1 }}>73%</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Engagement lift</div>
          </motion.div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={false}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)", position: "relative", zIndex: 10 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ maxWidth: 540 }}
            >
              {/* Brand as hero signal */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #0077B5, #571BC1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 800, boxShadow: "0 8px 24px rgba(0,119,181,0.3)" }}>&#9670;</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>ContentForge</div>
                  <div style={{ fontSize: 12, color: "rgba(232,230,227,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>LinkedIn Content Studio</div>
                </div>
              </div>

              <h1 style={{ fontSize: "clamp(38px, 5.5vw, 68px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20 }}>
                Create content<br />
                that stops<br />
                <span style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>the scroll</span>
              </h1>

              <p style={{ fontSize: 17, color: "rgba(232,230,227,0.6)", lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
                Transform any text into stunning LinkedIn carousels and post copy. Personalized to your voice. Published in seconds.
              </p>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,119,181,0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onSignIn}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "16px 36px",
                  background: "#fff", color: "#0a0c10", fontWeight: 700, borderRadius: 12,
                  border: "none", fontSize: 16, cursor: "pointer", fontFamily: "'Manrope', sans-serif",
                  boxShadow: "0 4px 20px rgba(255,255,255,0.1)",
                  transition: "box-shadow 0.3s",
                }}
              >
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZa3zOgexK2Mebawxy68F-sMSEQmGNPMggZJ9-jD0hEVAva9s-qe5TL8o9wDcI84NV0TRlwKo_ue3TPWMDF-RhKygaRBlnkQAF0pBeIwwloHAVdTE7fWI08sQVSBDpVFWBc-K68QtwCGdL3GzWqeLgvsg1C45JzEDMAZLJRvXkTYSeXOpkX3VmjWVJEjGWlB_iNdLR9QLJVR0EUiXocJYlBe1sF0tiiUcS_DAI0UI-QFI1PVKFL9BZvgtPTFKefEmyYOtHm1WGlKo" alt="" style={{ width: 20, height: 20 }} />
                Start creating — free
              </motion.button>
              <p style={{ fontSize: 12, color: "rgba(232,230,227,0.3)", marginTop: 14 }}>
                Bring your own Claude API key. Your data stays private.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── WHAT YOU CREATE ── */}
      <section style={{ padding: "clamp(60px, 10vw, 120px) clamp(20px, 4vw, 48px)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #0a0c10, #0e1118, #0a0c10)" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 }}>
              What you create
            </h2>
            <p style={{ fontSize: 16, color: "rgba(232,230,227,0.5)", marginBottom: 48, maxWidth: 500 }}>
              Five content formats. One tool. Every one designed to perform on LinkedIn.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {[
              { title: "Carousels", desc: "Multi-slide decks with AI-crafted headlines, stats, and calls to action.", accent: "#0077B5" },
              { title: "Quote Cards", desc: "Single-image visuals that make insights shareable.", accent: "#6B5CE7" },
              { title: "Stat Cards", desc: "Data-driven visuals with bold numbers that demand attention.", accent: "#00B4D8" },
              { title: "Text Posts", desc: "Scroll-stopping copy with engineered hooks and structure.", accent: "#7C5CFC" },
              { title: "Speaker Visuals", desc: "Event cards with photos, titles, and full brand control.", accent: "#0077B5" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.08 * i, duration: 0.5 }}
                style={{ padding: "36px 32px", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative" }}
              >
                <div style={{ width: 3, height: 24, background: f.accent, borderRadius: 2, marginBottom: 16, opacity: 0.8 }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(232,230,227,0.5)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "clamp(60px, 10vw, 120px) clamp(20px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 56, textAlign: "center" }}
          >
            From idea to published<br />in under a minute
          </motion.h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { n: "01", title: "Paste anything", desc: "An article, transcript, idea, or just a few bullet points." },
              { n: "02", title: "AI builds everything", desc: "Slides, post copy, hashtags — matched to your voice and audience." },
              { n: "03", title: "Refine with instructions", desc: "Edit visually. Or tell the AI: 'make it more provocative.'" },
              { n: "04", title: "Copy. Paste. Publish.", desc: "One click to clipboard. Paste into LinkedIn. Done." },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                style={{ display: "flex", gap: 24, padding: "32px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span style={{ fontSize: 48, fontWeight: 800, color: "rgba(0,119,181,0.15)", lineHeight: 1, flexShrink: 0, width: 60 }}>{s.n}</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(232,230,227,0.5)", lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "clamp(80px, 12vw, 160px) clamp(20px, 4vw, 48px)", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,119,181,0.08), transparent 70%)" }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ position: "relative" }}
        >
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Your LinkedIn presence,<br />
            <span style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>architected</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(232,230,227,0.5)", marginBottom: 36, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
            Join creators who build authority without burning hours on content.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,119,181,0.4)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onSignIn}
            style={{
              padding: "18px 40px", background: "#fff", color: "#0a0c10",
              fontWeight: 700, borderRadius: 12, border: "none", fontSize: 16,
              cursor: "pointer", fontFamily: "'Manrope', sans-serif",
              boxShadow: "0 4px 20px rgba(255,255,255,0.08)",
            }}
          >
            Start creating — free
          </motion.button>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "32px clamp(20px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em" }}>ContentForge</span>
          <span style={{ fontSize: 12, color: "rgba(232,230,227,0.3)" }}>Your API key. Your data. Your content.</span>
        </div>
      </footer>
    </div>
  );
}
