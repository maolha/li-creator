import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Key,
  User,
  Target,
  Check,
  Sparkles,
} from "lucide-react";

const STEPS = [
  { id: "apikey", icon: Key, title: "Connect your AI", subtitle: "Add your Claude API key to power content generation." },
  { id: "about", icon: User, title: "Tell us about you", subtitle: "Help the AI write in your voice." },
  { id: "goals", icon: Target, title: "Your content goals", subtitle: "What should your LinkedIn presence achieve?" },
];

export default function OnboardingFlow({ T, user, onComplete }) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [products, setProducts] = useState("");
  const [goals, setGoals] = useState("");
  const [brand, setBrand] = useState("");

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleComplete() {
    onComplete({
      apiKey,
      profile: {
        linkedinHeadline: headline,
        linkedinAbout: about,
        products,
        goals,
        defaultBrand: brand,
        narratives: "",
        beliefs: "",
        defaultTone: "professional",
        defaultAudience: "general",
        hashtagGroups: [],
      },
    });
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0c10", color: "#F0F0F8",
      fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #0077B5, #571BC1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#fff", fontWeight: 700, margin: "0 auto 16px",
          }}>
            &#9670;
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Welcome, {user?.displayName?.split(" ")[0] || "there"}
          </h1>
          <p style={{ fontSize: 13, color: "#7878A0" }}>
            Let's set up your content studio in 60 seconds.
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, justifyContent: "center" }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 32 : 10, height: 6, borderRadius: 3,
              background: i <= step ? "#0077B5" : "rgba(0,119,181,0.15)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              background: "#12151c", border: "1px solid rgba(0,119,181,0.12)",
              borderRadius: 18, padding: "28px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <current.icon size={18} style={{ color: "#0077B5" }} />
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{current.title}</h2>
                <p style={{ fontSize: 12, color: "#7878A0", margin: 0 }}>{current.subtitle}</p>
              </div>
            </div>

            {/* API Key step */}
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  style={inputStyle}
                />
                <p style={hintStyle}>
                  Get your key from <strong style={{ color: "#F0F0F8" }}>console.anthropic.com</strong>. Stored encrypted, never shared.
                </p>
              </div>
            )}

            {/* About step */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>LinkedIn Headline</label>
                  <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. CEO at PAIA | AI for Swiss Finance" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>About / Bio</label>
                  <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Paste your LinkedIn About section..." rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <div>
                  <label style={labelStyle}>Brand Name (shown on slides)</label>
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. PAIA" style={inputStyle} />
                </div>
              </div>
            )}

            {/* Goals step */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Products & Services</label>
                  <textarea value={products} onChange={(e) => setProducts(e.target.value)} placeholder="What do you sell or promote? This helps AI make content relevant to your offerings." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <div>
                  <label style={labelStyle}>Content Goals</label>
                  <textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="e.g. Position as thought leader in Swiss fintech, drive inbound leads..." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} style={secondaryBtnStyle}>
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}

          <div style={{ display: "flex", gap: 8 }}>
            {!isLast && (
              <button
                onClick={() => setStep((s) => s + 1)}
                style={{ ...secondaryBtnStyle, opacity: 0.6 }}
              >
                Skip
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => isLast ? handleComplete() : setStep((s) => s + 1)}
              style={primaryBtnStyle}
            >
              {isLast ? (
                <><Sparkles size={14} /> Start Creating</>
              ) : (
                <>Continue <ArrowRight size={14} /></>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#0a0c10",
  color: "#F0F0F8",
  border: "1px solid rgba(0,119,181,0.15)",
  borderRadius: 10,
  padding: "11px 14px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  width: "100%",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#7878A0",
  marginBottom: 5,
};

const hintStyle = {
  fontSize: 11,
  color: "#7878A0",
  margin: 0,
  opacity: 0.7,
  lineHeight: 1.5,
};

const primaryBtnStyle = {
  background: "linear-gradient(135deg, #0077B5, #571BC1)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "11px 20px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const secondaryBtnStyle = {
  background: "transparent",
  color: "#7878A0",
  border: "1px solid rgba(0,119,181,0.12)",
  borderRadius: 10,
  padding: "11px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  display: "flex",
  alignItems: "center",
  gap: 5,
};
