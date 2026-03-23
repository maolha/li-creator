import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, X, Star, ChevronDown, ChevronUp, Palette, Mic, Users, Hash,
  BookOpen, Heart, PenLine,
} from "lucide-react";
import { createBrand } from "../utils/brandSchema";

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

  function updateBrandVoice(id, field, value) {
    onChange(brands.map((b) => b.id === id ? { ...b, voice: { ...b.voice, [field]: value } } : b));
  }

  function updateBrandColors(id, field, value) {
    onChange(brands.map((b) => b.id === id ? { ...b, colors: { ...b.colors, [field]: value } } : b));
  }

  function setDefault(id) {
    onChange(brands.map((b) => ({ ...b, isDefault: b.id === id })));
  }

  function removeBrand(id) {
    const filtered = brands.filter((b) => b.id !== id);
    if (filtered.length > 0 && !filtered.some((b) => b.isDefault)) {
      filtered[0].isDefault = true;
    }
    onChange(filtered);
  }

  function addHashtagGroup(brandId, name, tags) {
    onChange(brands.map((b) => b.id === brandId
      ? { ...b, hashtagGroups: [...(b.hashtagGroups || []), { name, tags }] }
      : b
    ));
  }

  function removeHashtagGroup(brandId, index) {
    onChange(brands.map((b) => b.id === brandId
      ? { ...b, hashtagGroups: b.hashtagGroups.filter((_, i) => i !== index) }
      : b
    ));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {brands.map((brand) => {
        const isOpen = expandedId === brand.id;
        return (
          <div key={brand.id} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            {/* Header */}
            <div
              onClick={() => setExpandedId(isOpen ? null : brand.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}
            >
              <div style={{ width: 24, height: 24, borderRadius: 6, background: brand.colors?.accent || T.accent, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{brand.name || "Untitled"}</span>
              {brand.isDefault && (
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.accent, background: T.soft, padding: "2px 8px", borderRadius: 4 }}>Default</span>
              )}
              {isOpen ? <ChevronUp size={14} style={{ color: T.muted }} /> : <ChevronDown size={14} style={{ color: T.muted }} />}
            </div>

            {/* Expanded editor */}
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* Name + Color */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                  <div>
                    <label style={lbl(T)}>Brand Name</label>
                    <input type="text" value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} style={inp(T)} />
                  </div>
                  <div>
                    <label style={lbl(T)}><Palette size={10} /> Color</label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="color" value={brand.colors?.accent || "#0077B5"} onChange={(e) => updateBrandColors(brand.id, "accent", e.target.value)} style={{ width: 36, height: 36, border: "none", borderRadius: 8, cursor: "pointer", padding: 0 }} />
                      <input type="text" value={brand.colors?.accent || ""} onChange={(e) => updateBrandColors(brand.id, "accent", e.target.value)} style={{ ...inp(T), width: 90, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} />
                    </div>
                  </div>
                </div>

                {/* Voice: Tone + Audience */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={lbl(T)}><Mic size={10} /> Tone</label>
                    <select value={brand.voice?.tone || "professional"} onChange={(e) => updateBrandVoice(brand.id, "tone", e.target.value)} style={{ ...inp(T), cursor: "pointer" }}>
                      {["professional", "provocative", "storytelling", "educational", "data-driven"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl(T)}><Users size={10} /> Audience</label>
                    <select value={brand.voice?.audience || "general"} onChange={(e) => updateBrandVoice(brand.id, "audience", e.target.value)} style={{ ...inp(T), cursor: "pointer" }}>
                      {["general", "c-suite", "developers", "marketers", "founders", "hr", "finance"].map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                {/* Narratives */}
                <div>
                  <label style={lbl(T)}><BookOpen size={10} /> Key Narratives</label>
                  <textarea value={brand.voice?.narratives || ""} onChange={(e) => updateBrandVoice(brand.id, "narratives", e.target.value)} rows={2} placeholder="Stories and angles for this brand..." style={{ ...inp(T), resize: "vertical", lineHeight: 1.6 }} />
                </div>

                {/* Beliefs */}
                <div>
                  <label style={lbl(T)}><Heart size={10} /> Beliefs & Values</label>
                  <textarea value={brand.voice?.beliefs || ""} onChange={(e) => updateBrandVoice(brand.id, "beliefs", e.target.value)} rows={2} placeholder="Professional convictions..." style={{ ...inp(T), resize: "vertical", lineHeight: 1.6 }} />
                </div>

                {/* AI Instructions */}
                <div>
                  <label style={lbl(T)}><PenLine size={10} /> AI Instructions</label>
                  <textarea value={brand.voice?.aiInstructions || ""} onChange={(e) => updateBrandVoice(brand.id, "aiInstructions", e.target.value)} rows={3} placeholder="e.g. Always use active voice, never say 'leverage'..." style={{ ...inp(T), resize: "vertical", lineHeight: 1.6 }} />
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
                  {!brand.isDefault && (
                    <button onClick={() => setDefault(brand.id)} style={actionBtn(T)}>
                      <Star size={12} /> Set as Default
                    </button>
                  )}
                  <button onClick={() => removeBrand(brand.id)} style={{ ...actionBtn(T), color: "#E85A3A" }}>
                    <X size={12} /> Remove
                  </button>
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

function lbl(T) {
  return { display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginBottom: 4 };
}
function inp(T) {
  return { background: T.card, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", fontFamily: "'Inter', sans-serif", fontSize: 13, width: "100%" };
}
function actionBtn(T) {
  return { background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: T.muted, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4 };
}
