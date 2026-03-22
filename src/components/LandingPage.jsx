import { motion } from "framer-motion";
import {
  Sparkles,
  Layers,
  Quote,
  BarChart3,
  AlignLeft,
  UserCircle,
  Zap,
  ArrowRight,
  Shield,
  Palette,
  Copy,
  RefreshCw,
  LogIn,
} from "lucide-react";

const features = [
  { icon: Layers, title: "Carousels", desc: "Multi-slide decks that stop the scroll. AI-crafted headlines, stats, and CTAs." },
  { icon: Quote, title: "Quote Cards", desc: "Single-image quote visuals. Paste directly into LinkedIn." },
  { icon: BarChart3, title: "Stat Cards", desc: "Data-driven visuals with bold numbers that demand attention." },
  { icon: AlignLeft, title: "Text Posts", desc: "Scroll-stopping post copy with hooks, bullets, and CTAs." },
  { icon: UserCircle, title: "Speaker Visuals", desc: "Event speaker cards with photos, titles, and branding." },
  { icon: Palette, title: "6+ Themes", desc: "Professional dark and light presets. Custom brand colors." },
];

const workflow = [
  { step: "01", title: "Paste your content", desc: "Article, report, transcript, or just an idea." },
  { step: "02", title: "AI generates everything", desc: "Slides, post copy, hashtags — tailored to your voice." },
  { step: "03", title: "Edit and refine", desc: "Tweak headlines, rewrite with AI, adjust styling." },
  { step: "04", title: "Copy and publish", desc: "One click to clipboard. Paste into LinkedIn. Done." },
];

export default function LandingPage({ onSignIn, loading }) {
  return (
    <div style={{ minHeight: "100vh", background: "#08090D", color: "#F0F0F8", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1100, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #6B8AFF, #9B6BFF)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700,
          }}>
            &#9670;
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>ContentForge</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSignIn}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #6B8AFF, #9B6BFF)", color: "#fff", border: "none",
            borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <LogIn size={14} /> Sign in with Google
        </motion.button>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(107,138,255,0.1)",
            border: "1px solid rgba(107,138,255,0.2)", borderRadius: 999, padding: "6px 16px",
            fontSize: 12, fontWeight: 600, color: "#6B8AFF", marginBottom: 24,
          }}>
            <Sparkles size={13} /> AI-Powered LinkedIn Content Studio
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif", fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 400, lineHeight: 1.1, marginBottom: 20, fontStyle: "italic",
            maxWidth: 700, margin: "0 auto 20px",
          }}>
            Create content that
            <span style={{ color: "#6B8AFF" }}> stops the scroll</span>
          </h1>
          <p style={{ fontSize: 17, color: "#7878A0", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 36px" }}>
            Transform any text into stunning LinkedIn carousels, quote cards, and post copy.
            Personalized to your voice. Ready to publish in seconds.
          </p>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSignIn}
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #6B8AFF, #9B6BFF)", color: "#fff", border: "none",
              borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 4px 24px rgba(107,138,255,0.3)",
            }}
          >
            Get Started Free <ArrowRight size={18} />
          </motion.button>
          <p style={{ fontSize: 12, color: "#7878A0", marginTop: 12, opacity: 0.7 }}>
            Bring your own Claude API key. Your data stays yours.
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              style={{
                background: "#0F1117", border: "1px solid rgba(107,138,255,0.1)",
                borderRadius: 16, padding: "24px 20px",
              }}
            >
              <f.icon size={22} style={{ color: "#6B8AFF", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#7878A0", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 60px" }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400,
          textAlign: "center", marginBottom: 40, fontStyle: "italic",
        }}>
          How it works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {workflow.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.4 }}
              style={{
                display: "flex", gap: 20, alignItems: "flex-start",
                background: "#0F1117", border: "1px solid rgba(107,138,255,0.08)",
                borderRadius: 14, padding: "20px 24px",
              }}
            >
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700,
                color: "#6B8AFF", opacity: 0.5, flexShrink: 0, lineHeight: 1.4,
              }}>
                {w.step}
              </span>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{w.title}</h3>
                <p style={{ fontSize: 13, color: "#7878A0", margin: 0, lineHeight: 1.5 }}>{w.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 60px", textAlign: "center" }}>
        <div style={{
          display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap",
          padding: "20px 0",
        }}>
          {[
            { icon: Shield, text: "Your API key, encrypted" },
            { icon: Zap, text: "Powered by Claude AI" },
            { icon: Copy, text: "Copy to clipboard, paste to LinkedIn" },
            { icon: RefreshCw, text: "AI rewrite with instructions" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "#7878A0", fontSize: 12 }}>
              <item.icon size={14} style={{ color: "#6B8AFF" }} />
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ textAlign: "center", padding: "40px 24px 80px" }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSignIn}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #6B8AFF, #9B6BFF)", color: "#fff", border: "none",
            borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 10,
            boxShadow: "0 4px 24px rgba(107,138,255,0.3)",
          }}
        >
          <LogIn size={16} /> Sign in with Google
        </motion.button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(107,138,255,0.08)", padding: "20px 24px",
        textAlign: "center", fontSize: 11, color: "#7878A0", opacity: 0.6,
      }}>
        ContentForge &middot; Built for LinkedIn creators
      </footer>
    </div>
  );
}
