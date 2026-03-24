import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, X, Star, ChevronDown, ChevronUp, Palette, Mic, Users, Hash,
  BookOpen, Heart, PenLine, Image, Type, Package,
} from "lucide-react";
import { createBrand } from "../utils/brandSchema";
import FontPicker from "./FontPicker";

export default function BrandEditor({ T, brands, onChange }) {
  const [expandedId, setExpandedId] = useState(null);

  function addBrand() {
    const newBrand = createBrand({ isDefault: brands.length === 0 });
    onChange([...brands, newBrand]);
    setExpandedId(newBrand.id);
  }

  function updateBrand(id, updates) {
    onChange(brands.map((b) => b.id === id ? { ...b, ...updates } : b));
  }

  function updateNested(id, path, field, value) {
    onChange(brands.map((b) => {
      if (b.id !== id) return b;
      return { ...b, [path]: { ...(b[path] || {}), [field]: value } };
    }));
  }

  function setDefault(id) {
    onChange(brands.map((b) => ({ ...b, isDefault: b.id === id })));
  }

  function removeBrand(id) {
    const filtered = brands.filter((b) => b.id !== id);
    if (filtered.length > 0 && !filtered.some((b) => b.isDefault)) filtered[0].isDefault = true;
    onChange(filtered);
  }

  function addHashtagGroup(brandId, name, tags) {
    onChange(brands.map((b) => b.id === brandId ? { ...b, hashtagGroups: [...(b.hashtagGroups || []), { name, tags }] } : b));
  }

  function removeHashtagGroup(brandId, index) {
    onChange(brands.map((b) => b.id === brandId ? { ...b, hashtagGroups: b.hashtagGroups.filter((_, i) => i !== index) } : b));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {brands.map((brand) => {
        const isOpen = expandedId === brand.id;
        const primary = brand.colors?.primary || brand.colors?.accent || "#0077B5";
        const secondary = brand.colors?.secondary || "#571BC1";
        return (
          <div key={brand.id} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            {/* Header */}
            <div onClick={() => setExpandedId(isOpen ? null : brand.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${primary}, ${secondary})`, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{brand.name || "Untitled"}</span>
              {brand.isDefault && <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.accent, background: T.soft, padding: "2px 8px", borderRadius: 4 }}>Default</span>}
              {isOpen ? <ChevronUp size={14} style={{ color: T.muted }} /> : <ChevronDown size={14} style={{ color: T.muted }} />}
            </div>

            {/* Expanded */}
            {isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Name */}
                <div>
                  <label style={lbl(T)}>Brand Name</label>
                  <input type="text" value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} style={inp(T)} />
                </div>

                {/* Colors */}
                <div>
                  <label style={lbl(T)}><Palette size={10} /> Colors</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <ColorInput label="Primary" value={primary} onChange={(v) => updateNested(brand.id, "colors", "primary", v)} T={T} />
                    <ColorInput label="Secondary" value={secondary} onChange={(v) => updateNested(brand.id, "colors", "secondary", v)} T={T} />
                    <ColorInput label="Dark" value={brand.colors?.dark || "#0a0c10"} onChange={(v) => updateNested(brand.id, "colors", "dark", v)} T={T} />
                    <ColorInput label="Light" value={brand.colors?.light || "#f4f5f7"} onChange={(v) => updateNested(brand.id, "colors", "light", v)} T={T} />
                  </div>
                </div>

                {/* Logos */}
                <div>
                  <label style={lbl(T)}><Image size={10} /> Logos</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <LogoInput label="For dark bg" value={brand.logos?.light} onChange={(v) => updateNested(brand.id, "logos", "light", v)} T={T} />
                    <LogoInput label="For light bg" value={brand.logos?.dark} onChange={(v) => updateNested(brand.id, "logos", "dark", v)} T={T} />
                  </div>
                </div>

                {/* Fonts */}
                <div>
                  <label style={lbl(T)}><Type size={10} /> Fonts</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 9, color: T.muted, opacity: 0.7 }}>Heading</span>
                      <FontPicker value={brand.fonts?.heading || ""} onChange={(v) => updateNested(brand.id, "fonts", "heading", v)} type="heading" T={T} />
                      <WeightPicker value={brand.fonts?.headingWeight || "bold"} onChange={(v) => updateNested(brand.id, "fonts", "headingWeight", v)} T={T} />
                    </div>
                    <div>
                      <span style={{ fontSize: 9, color: T.muted, opacity: 0.7 }}>Body</span>
                      <FontPicker value={brand.fonts?.body || ""} onChange={(v) => updateNested(brand.id, "fonts", "body", v)} type="body" T={T} />
                      <WeightPicker value={brand.fonts?.bodyWeight || "medium"} onChange={(v) => updateNested(brand.id, "fonts", "bodyWeight", v)} T={T} />
                    </div>
                  </div>
                </div>

                {/* Voice: Tone + Audience */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={lbl(T)}><Mic size={10} /> Tone</label>
                    <select value={brand.voice?.tone || "professional"} onChange={(e) => updateNested(brand.id, "voice", "tone", e.target.value)} style={{ ...inp(T), cursor: "pointer" }}>
                      {["professional", "provocative", "storytelling", "educational", "data-driven"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl(T)}><Users size={10} /> Audience</label>
                    <select value={brand.voice?.audience || "general"} onChange={(e) => updateNested(brand.id, "voice", "audience", e.target.value)} style={{ ...inp(T), cursor: "pointer" }}>
                      {["general", "c-suite", "developers", "marketers", "founders", "hr", "finance"].map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <label style={lbl(T)}><Package size={10} /> Products & Services</label>
                  <textarea value={brand.voice?.products || ""} onChange={(e) => updateNested(brand.id, "voice", "products", e.target.value)} rows={2} placeholder="What this brand sells or promotes..." style={{ ...inp(T), resize: "vertical", lineHeight: 1.6 }} />
                </div>

                {/* Narratives + Beliefs */}
                <div>
                  <label style={lbl(T)}><BookOpen size={10} /> Key Narratives</label>
                  <textarea value={brand.voice?.narratives || ""} onChange={(e) => updateNested(brand.id, "voice", "narratives", e.target.value)} rows={2} placeholder="Stories and angles..." style={{ ...inp(T), resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <div>
                  <label style={lbl(T)}><Heart size={10} /> Beliefs & Values</label>
                  <textarea value={brand.voice?.beliefs || ""} onChange={(e) => updateNested(brand.id, "voice", "beliefs", e.target.value)} rows={2} placeholder="Professional convictions..." style={{ ...inp(T), resize: "vertical", lineHeight: 1.6 }} />
                </div>

                {/* AI Instructions */}
                <div>
                  <label style={lbl(T)}><PenLine size={10} /> AI Instructions</label>
                  <textarea value={brand.voice?.aiInstructions || ""} onChange={(e) => updateNested(brand.id, "voice", "aiInstructions", e.target.value)} rows={3} placeholder="Rules for the AI: tone, words to avoid, style..." style={{ ...inp(T), resize: "vertical", lineHeight: 1.6 }} />
                </div>

                {/* Hashtag Groups */}
                <div>
                  <label style={lbl(T)}><Hash size={10} /> Hashtag Groups</label>
                  {(brand.hashtagGroups || []).map((g, gi) => (
                    <div key={gi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: T.soft, borderRadius: 6, marginBottom: 4, fontSize: 11 }}>
                      <span style={{ fontWeight: 700, color: T.accent, minWidth: 60 }}>{g.name}</span>
                      <span style={{ flex: 1, color: T.muted }}>{g.tags.map((t) => `#${t}`).join(" ")}</span>
                      <button onClick={() => removeHashtagGroup(brand.id, gi)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 0 }}><X size={12} /></button>
                    </div>
                  ))}
                  <HashtagGroupInput T={T} onAdd={(name, tags) => addHashtagGroup(brand.id, name, tags)} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {!brand.isDefault && <button onClick={() => setDefault(brand.id)} style={actionBtn(T)}><Star size={12} /> Set Default</button>}
                  <button onClick={() => removeBrand(brand.id)} style={{ ...actionBtn(T), color: "#E85A3A" }}><X size={12} /> Remove</button>
                </div>
              </motion.div>
            )}
          </div>
        );
      })}

      <button onClick={addBrand} style={{ background: T.soft, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px", cursor: "pointer", color: T.accent, fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Plus size={14} /> Add Brand
      </button>
    </div>
  );
}

function ColorInput({ label, value, onChange, T }) {
  return (
    <div>
      <span style={{ fontSize: 9, color: T.muted, opacity: 0.7 }}>{label}</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 28, height: 28, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inp(T), flex: 1, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
      </div>
    </div>
  );
}

function LogoInput({ label, value, onChange, T }) {
  return (
    <div>
      <span style={{ fontSize: 9, color: T.muted, opacity: 0.7 }}>{label}</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <input type="text" value={typeof value === "string" && !value.startsWith("data:") ? value : ""} onChange={(e) => onChange(e.target.value)} placeholder="URL..." style={{ ...inp(T), flex: 1, fontSize: 11 }} />
        <label style={{ background: T.soft, border: `1px solid ${T.border}`, borderRadius: 6, padding: "0 8px", cursor: "pointer", display: "flex", alignItems: "center", color: T.muted, fontSize: 10, fontWeight: 600, height: 32 }}>
          <Image size={11} />
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onChange(reader.result);
            reader.readAsDataURL(file);
          }} />
        </label>
      </div>
      {value && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <img src={value} alt="" style={{ height: 20, maxWidth: 60, objectFit: "contain" }} />
          <button onClick={() => onChange(null)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 10 }}>Remove</button>
        </div>
      )}
    </div>
  );
}

function HashtagGroupInput({ T, onAdd }) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Group" style={{ ...inp(T), width: 80, fontSize: 11 }} />
      <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2" style={{ ...inp(T), flex: 1, fontSize: 11 }} onKeyDown={(e) => { if (e.key === "Enter" && name && tags) { onAdd(name, tags.split(",").map((t) => t.trim()).filter(Boolean)); setName(""); setTags(""); } }} />
      <button onClick={() => { if (name && tags) { onAdd(name, tags.split(",").map((t) => t.trim()).filter(Boolean)); setName(""); setTags(""); } }} style={{ background: T.soft, border: `1px solid ${T.border}`, borderRadius: 6, padding: "0 8px", cursor: "pointer", color: T.accent }}><Plus size={12} /></button>
    </div>
  );
}

const WEIGHTS = [
  { id: "light", label: "Light", value: 300 },
  { id: "medium", label: "Medium", value: 500 },
  { id: "bold", label: "Bold", value: 700 },
  { id: "black", label: "Black", value: 900 },
];

function WeightPicker({ value, onChange, T }) {
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
      {WEIGHTS.map((w) => (
        <button
          key={w.id}
          onClick={() => onChange(w.id)}
          style={{
            flex: 1, padding: "4px 2px", borderRadius: 5, fontSize: 9,
            fontWeight: w.value,
            border: `1px solid ${value === w.id ? T.accent : T.border}`,
            background: value === w.id ? T.soft : "transparent",
            color: value === w.id ? T.accent : T.muted,
            cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center",
          }}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}

function lbl(T) { return { display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginBottom: 4 }; }
function inp(T) { return { background: T.card, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", fontFamily: "'Inter', sans-serif", fontSize: 13, width: "100%" }; }
function hint(T) { return { fontSize: 9, color: T.muted, opacity: 0.6, margin: "4px 0 0" }; }
function actionBtn(T) { return { background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: T.muted, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4 }; }
