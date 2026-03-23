import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ScaledSlide } from "./SlideRenderer";
import Logo from "./Logo";

// Demo themes
const T_BLUE = { bg: "#08090D", card: "#0F1117", accent: "#0077B5", soft: "rgba(0,119,181,0.10)", text: "#F0F0F8", muted: "#7878A0", border: "rgba(0,119,181,0.15)", gradient: "linear-gradient(135deg, #0077B5, #571BC1)" };
const T_RED = { bg: "#0B0B0B", card: "#141414", accent: "#E83A3A", soft: "rgba(232,58,58,0.10)", text: "#F5F5F5", muted: "#808080", border: "rgba(232,58,58,0.18)", gradient: "linear-gradient(135deg, #E83A3A, #FF6B35)" };
const T_PURPLE = { bg: "#08090D", card: "#0F1117", accent: "#7C5CFC", soft: "rgba(124,92,252,0.10)", text: "#F0F0F8", muted: "#7878A0", border: "rgba(124,92,252,0.15)", gradient: "linear-gradient(135deg, #7C5CFC, #E040FB)" };
const T_TEAL = { bg: "#060D14", card: "#0C1520", accent: "#00D4AA", soft: "rgba(0,212,170,0.08)", text: "#E8F0F0", muted: "#607080", border: "rgba(0,212,170,0.15)", gradient: "linear-gradient(135deg, #00D4AA, #0099FF)" };
const T_GOLD = { bg: "#0C0A08", card: "#141210", accent: "#D4A853", soft: "rgba(212,168,83,0.08)", text: "#F0ECE4", muted: "#8A8070", border: "rgba(212,168,83,0.15)", gradient: "linear-gradient(135deg, #D4A853, #F0C060)" };

const SHOWCASE = [
  { slide: { type: "cover", headline: "The Future of AI in Enterprise", body: "How leaders are rethinking strategy in the age of intelligent automation.", tag: "Insight" }, theme: T_BLUE, intensity: "bold", i: 0, n: 7, label: "Carousel" },
  { slide: { type: "stat", headline: "Adoption Accelerating", body: "Measurable returns within the first quarter.", stat: "73%", statLabel: "Adoption", tag: "Data" }, theme: T_RED, intensity: "dramatic", i: 0, n: 1, label: "Stat Card" },
  { slide: { type: "quote", headline: "The best content doesn't sell. It starts conversations that lead to trust.", body: "Content strategy for the modern professional.", tag: "Insight" }, theme: T_PURPLE, intensity: "bold", i: 0, n: 1, label: "Quote Card" },
  { slide: { type: "insight", headline: "Your Hook Decides Everything", body: "The first two lines determine if anyone reads the rest.", tag: "Strategy" }, theme: T_TEAL, intensity: "clean", i: 2, n: 7, label: "Insight Slide" },
  { slide: { type: "cta", headline: "Join the Conversation", body: "Connect with leaders shaping the future.", tag: "Action" }, theme: T_GOLD, intensity: "bold", i: 6, n: 7, label: "CTA Slide" },
];

export default function LandingPage({ onSignIn }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c10", color: "#e8e6e3", fontFamily: "'Manrope', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        ::selection { background: rgba(0,119,181,0.4); }
      `}</style>

      {/* NAV */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "rgba(10,12,16,0.7)", backdropFilter: "blur(24px)" }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72, padding: "0 clamp(20px, 4vw, 48px)", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={32} rounded={8} />
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

      {/* HERO — centered two-column */}
      <section ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,119,181,0.15), transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 75% 55%, rgba(87,27,193,0.1), transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to top, #0a0c10, transparent)" }} />

        <motion.div style={{ scale: heroScale, opacity: heroOpacity, width: "100%" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)", display: "flex", alignItems: "center", gap: "clamp(32px, 5vw, 72px)", flexWrap: "wrap", justifyContent: "center" }}>
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ flex: "1 1 400px", minWidth: 300, maxWidth: 520 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <Logo size={48} rounded={12} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>ContentForge</div>
                  <div style={{ fontSize: 11, color: "rgba(232,230,227,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>LinkedIn Content Studio</div>
                </div>
              </div>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 18 }}>
                Create content<br />that stops<br />
                <span style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>the scroll</span>
              </h1>
              <p style={{ fontSize: 16, color: "rgba(232,230,227,0.55)", lineHeight: 1.7, marginBottom: 32, maxWidth: 400 }}>
                Transform any text into stunning LinkedIn carousels and post copy. Personalized to your voice. Published in seconds.
              </p>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,119,181,0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onSignIn}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 32px", background: "#fff", color: "#0a0c10", fontWeight: 700, borderRadius: 12, border: "none", fontSize: 15, cursor: "pointer", fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 20px rgba(255,255,255,0.08)" }}
              >
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZa3zOgexK2Mebawxy68F-sMSEQmGNPMggZJ9-jD0hEVAva9s-qe5TL8o9wDcI84NV0TRlwKo_ue3TPWMDF-RhKygaRBlnkQAF0pBeIwwloHAVdTE7fWI08sQVSBDpVFWBc-K68QtwCGdL3GzWqeLgvsg1C45JzEDMAZLJRvXkTYSeXOpkX3VmjWVJEjGWlB_iNdLR9QLJVR0EUiXocJYlBe1sF0tiiUcS_DAI0UI-QFI1PVKFL9BZvgtPTFKefEmyYOtHm1WGlKo" alt="" style={{ width: 18, height: 18 }} />
                Start creating — free
              </motion.button>
              <p style={{ fontSize: 11, color: "rgba(232,230,227,0.25)", marginTop: 12 }}>Your API key. Your data. Always private.</p>
            </motion.div>

            {/* Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ flex: "0 1 380px", position: "relative" }}
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                <div style={{ background: "#151820", borderRadius: 16, padding: 14, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                  <div style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", borderRadius: 10, height: 240, display: "flex", flexDirection: "column", justifyContent: "center", padding: 28, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>CAROUSEL SLIDE</div>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, fontStyle: "italic", lineHeight: 1.15, color: "#fff" }}>The future belongs to those who create it</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 10 }}>1 / 7</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 10, justifyContent: "center" }}>
                    {[0,1,2,3,4,5,6].map((i) => <div key={i} style={{ width: i === 0 ? 18 : 5, height: 5, borderRadius: 3, background: i === 0 ? "#0077B5" : "rgba(255,255,255,0.12)" }} />)}
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1.5 }}
                style={{ position: "absolute", bottom: -30, left: -40, background: "#151820", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", width: 130 }}
              >
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E83A3A", marginBottom: 4 }}>STAT</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#e8e6e3", lineHeight: 1 }}>73%</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Engagement lift</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SHOWCASE — horizontal scroll of real rendered slides */}
      <section style={{ padding: "clamp(60px, 10vw, 100px) 0", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #0a0c10, #0e1118, #0a0c10)" }} />
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>
              What you create
            </h2>
            <p style={{ fontSize: 15, color: "rgba(232,230,227,0.45)", marginBottom: 40 }}>
              Five content formats. One tool. All designed to perform.
            </p>
          </motion.div>
        </div>

        {/* Scrollable slide strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", gap: 20, overflowX: "auto", padding: "0 clamp(24px, 5vw, 64px) 20px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {SHOWCASE.map((demo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx, duration: 0.5 }}
              style={{ flex: "0 0 auto", scrollSnapAlign: "start", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}
            >
              <ScaledSlide s={demo.slide} brand="PAIA" i={demo.i} n={demo.n} T={demo.theme} size={200} intensity={demo.intensity} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(232,230,227,0.5)", letterSpacing: "0.04em" }}>{demo.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "clamp(60px, 10vw, 100px) clamp(24px, 5vw, 64px)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 48, textAlign: "center" }}>
            Idea to published<br />in under a minute
          </motion.h2>
          {[
            { n: "01", title: "Paste anything", desc: "An article, transcript, or just a few bullet points." },
            { n: "02", title: "AI builds everything", desc: "Slides, copy, hashtags — matched to your voice." },
            { n: "03", title: "Refine with instructions", desc: "Edit visually or tell the AI what to change." },
            { n: "04", title: "Copy. Paste. Publish.", desc: "One click to clipboard. Paste into LinkedIn." },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              style={{ display: "flex", gap: 20, padding: "28px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <span style={{ fontSize: 44, fontWeight: 800, color: "rgba(0,119,181,0.12)", lineHeight: 1, flexShrink: 0, width: 56 }}>{s.n}</span>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(232,230,227,0.45)", lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(80px, 12vw, 140px) clamp(24px, 5vw, 64px)", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,119,181,0.06), transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ position: "relative" }}>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Your LinkedIn presence,<br />
            <span style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>architected</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(232,230,227,0.45)", marginBottom: 32, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
            Join creators building authority without burning hours on content.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,119,181,0.4)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onSignIn}
            style={{ padding: "16px 36px", background: "#fff", color: "#0a0c10", fontWeight: 700, borderRadius: 12, border: "none", fontSize: 15, cursor: "pointer", fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 20px rgba(255,255,255,0.06)" }}
          >
            Start creating — free
          </motion.button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "28px clamp(20px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>ContentForge</span>
          <span style={{ fontSize: 11, color: "rgba(232,230,227,0.25)" }}>Your API key. Your data. Your content.</span>
        </div>
      </footer>
    </div>
  );
}
