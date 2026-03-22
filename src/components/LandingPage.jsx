import { motion } from "framer-motion";

export default function LandingPage({ onSignIn, loading }) {
  return (
    <div style={{ minHeight: "100vh", background: "#131313", color: "#e5e2e1", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .text-gradient-ai { background: linear-gradient(135deg, #0077B5 0%, #571BC1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass-panel { background: rgba(28, 27, 27, 0.6); backdrop-filter: blur(20px); }
        ::selection { background: rgba(0,119,181,0.3); }
      `}</style>

      {/* Nav */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "rgba(19,19,19,0.6)", backdropFilter: "blur(20px)", boxShadow: "0 20px 40px rgba(229,226,225,0.06)" }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 80, padding: "0 32px", maxWidth: 1200, margin: "0 auto" }}>
          <div className="font-headline" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em" }}>ContentForge</div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button
              onClick={onSignIn}
              className="font-headline"
              style={{ background: "none", border: "none", color: "rgba(229,226,225,0.7)", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em" }}
            >
              Sign in
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignIn}
              className="font-headline"
              style={{
                background: "#0077b5", color: "#f3f7ff", padding: "10px 24px", borderRadius: 12,
                border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
                transition: "all 0.3s",
              }}
            >
              Get Started
            </motion.button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section style={{ paddingTop: 160, paddingBottom: 80, padding: "160px 32px 80px", position: "relative", overflow: "hidden" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 10 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999,
                background: "rgba(53,53,52,0.6)", border: "1px solid rgba(64,72,80,0.15)", marginBottom: 24,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#93ccff" }}>verified_user</span>
                <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(191,199,209,0.9)" }}>
                  Bring your own Claude API key. Your data stays yours.
                </span>
              </div>

              <h1 className="font-headline" style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.03em" }}>
                AI-Powered LinkedIn<br />
                <span className="text-gradient-ai">Content Studio</span>
              </h1>

              <p style={{ fontSize: 18, color: "rgba(191,199,209,0.9)", maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
                Create content that stops the scroll. Transform any text into stunning LinkedIn carousels, quote cards, and post copy. Personalized to your voice. Ready to publish in seconds.
              </p>

              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSignIn}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "16px 32px",
                    background: "#fff", color: "#000", fontWeight: 700, borderRadius: 12,
                    border: "none", fontSize: 15, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZa3zOgexK2Mebawxy68F-sMSEQmGNPMggZJ9-jD0hEVAva9s-qe5TL8o9wDcI84NV0TRlwKo_ue3TPWMDF-RhKygaRBlnkQAF0pBeIwwloHAVdTE7fWI08sQVSBDpVFWBc-K68QtwCGdL3GzWqeLgvsg1C45JzEDMAZLJRvXkTYSeXOpkX3VmjWVJEjGWlB_iNdLR9QLJVR0EUiXocJYlBe1sF0tiiUcS_DAI0UI-QFI1PVKFL9BZvgtPTFKefEmyYOtHm1WGlKo" alt="Google" style={{ width: 20, height: 20 }} />
                  Sign in with Google
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSignIn}
                  style={{
                    padding: "16px 32px", background: "#353534", color: "#e5e2e1",
                    fontWeight: 700, borderRadius: 12, border: "1px solid rgba(64,72,80,0.3)",
                    fontSize: 15, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Get Started Free
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ padding: "96px 32px", background: "#1c1b1b" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ marginBottom: 64 }}>
              <h2 className="font-headline" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
                The Architect's Toolkit
              </h2>
              <p style={{ fontSize: 17, color: "rgba(191,199,209,0.8)" }}>
                Every asset you need for a dominant LinkedIn presence.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
              {[
                { icon: "view_carousel", title: "Carousels", desc: "Multi-slide decks that stop the scroll. AI-crafted headlines, stats, and CTAs tailored for engagement.", color: "#93ccff" },
                { icon: "format_quote", title: "Quote Cards", desc: "Turn insights into impactful visuals. Single-image quote visuals designed to be pasted directly into LinkedIn.", color: "#d0bcff" },
                { icon: "bar_chart", title: "Stat Cards", desc: "Authority through data. High-conversion visuals with bold numbers that demand immediate professional attention.", color: "#ddb8ff" },
                { icon: "notes", title: "Text Posts", desc: "Scroll-stopping post copy with engineered hooks, structured bullets, and compelling calls-to-action.", color: "#93ccff" },
                { icon: "account_circle", title: "Speaker Visuals", desc: "Professional event speaker cards with high-fidelity branding, titles, and perfectly framed portraits.", color: "#d0bcff" },
                { icon: "palette", title: "6+ Themes", desc: "Professional dark and light presets that match your aesthetic. Fully customizable brand colors and typography.", color: "#ddb8ff" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                  style={{
                    padding: 32, borderRadius: 16,
                    background: "rgba(53,53,52,0.4)", border: "1px solid transparent",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#353534"; e.currentTarget.style.borderColor = "rgba(64,72,80,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(53,53,52,0.4)"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
                  }}>
                    <span className="material-symbols-outlined" style={{ color: f.color }}>{f.icon}</span>
                  </div>
                  <h3 className="font-headline" style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(191,199,209,0.8)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section style={{ padding: "96px 32px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 80 }}>
              <h2 className="font-headline" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginBottom: 24, letterSpacing: "-0.02em" }}>
                From Idea to Viral Post in Seconds
              </h2>
              <p style={{ fontSize: 18, color: "rgba(191,199,209,0.8)", maxWidth: 600, margin: "0 auto" }}>
                The streamlined workflow designed for busy founders and content creators.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 48 }}>
              {[
                { n: "01", title: "Paste your content", desc: "Input an article, report, podcast transcript, or just a rough idea into the forge." },
                { n: "02", title: "AI generates everything", desc: "Slides, post copy, and hashtags — all tailored perfectly to your unique brand voice." },
                { n: "03", title: "Edit and refine", desc: "Tweak headlines, rewrite sections with AI instructions, or adjust styling instantly." },
                { n: "04", title: "Copy and publish", desc: "One click to clipboard. Paste directly into LinkedIn. Your content is ready to shine." },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  style={{ position: "relative" }}
                >
                  <span className="font-headline" style={{
                    fontSize: 60, fontWeight: 900, color: "rgba(64,72,80,0.2)",
                    position: "absolute", top: -32, left: -16, lineHeight: 1,
                  }}>
                    {s.n}
                  </span>
                  <div style={{ position: "relative", zIndex: 1, paddingTop: 16 }}>
                    <h4 className="font-headline" style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{s.title}</h4>
                    <p style={{ fontSize: 14, color: "rgba(191,199,209,0.8)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section style={{ padding: "96px 32px", background: "#0e0e0e", borderTop: "1px solid rgba(64,72,80,0.1)", borderBottom: "1px solid rgba(64,72,80,0.1)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
            {[
              { icon: "lock", title: "Privacy First", desc: "Your API key, encrypted. Powered by Claude AI. We don't store your proprietary insights.", color: "#93ccff" },
              { icon: "content_paste", title: "Frictionless", desc: "Copy to clipboard, paste to LinkedIn. No complex downloads or file conversions needed.", color: "#d0bcff" },
              { icon: "psychology", title: "Dynamic Iteration", desc: "AI rewrite with specific instructions. Refine your message until it matches your exact vision.", color: "#ddb8ff" },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: 40, borderRadius: 24, background: "#1c1b1b", border: "1px solid rgba(64,72,80,0.1)" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${t.color}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: t.color, fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                </div>
                <h3 className="font-headline" style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{t.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(191,199,209,0.8)", lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: "128px 32px", textAlign: "center" }}>
          <div className="glass-panel" style={{
            maxWidth: 800, margin: "0 auto", padding: 64, borderRadius: 32,
            border: "1px solid rgba(0,119,181,0.2)", position: "relative",
          }}>
            <div style={{ position: "absolute", top: -48, left: "50%", transform: "translateX(-50%)", width: 96, height: 96, background: "#0077b5", borderRadius: "50%", filter: "blur(60px)", opacity: 0.5 }} />
            <h2 className="font-headline" style={{ fontSize: "clamp(28px, 4vw, 56px)", fontWeight: 800, marginBottom: 32, letterSpacing: "-0.03em" }}>
              Ready to become a <span style={{ color: "#93ccff" }}>Content Architect?</span>
            </h2>
            <p style={{ fontSize: 18, color: "rgba(191,199,209,0.8)", marginBottom: 48, maxWidth: 500, margin: "0 auto 48px" }}>
              Join leaders using ContentForge to build their LinkedIn presence without losing their authenticity.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ boxShadow: "0 0 30px rgba(0,119,181,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onSignIn}
                style={{
                  padding: "20px 40px", background: "#0077b5", color: "#f3f7ff",
                  fontWeight: 800, borderRadius: 12, border: "none", fontSize: 15,
                  cursor: "pointer", fontFamily: "'Manrope', sans-serif",
                  transition: "all 0.3s",
                }}
              >
                Get Started For Free
              </motion.button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(229,226,225,0.15)", background: "#131313" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "48px 32px", maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div className="font-headline" style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>ContentForge</div>
            <p style={{ fontSize: 13, color: "rgba(229,226,225,0.5)", margin: 0 }}>Built for LinkedIn creators who mean business.</p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {["Privacy Policy", "Terms of Service"].map((link) => (
              <span key={link} style={{ fontSize: 13, color: "rgba(229,226,225,0.4)", cursor: "pointer" }}>{link}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
