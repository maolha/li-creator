import { contrastText } from "./themes";

export function buildPdf(slides, brand, T) {
  const ct = contrastText(T.accent);
  const { accent: a, card: c, text: tx, muted: mu, border: bo, soft: so } = T;

  const pill = (tag, type, light = false) =>
    `<div style="display:inline-flex;align-items:center;background:${light ? "rgba(255,255,255,0.15)" : so};border:1px solid ${light ? "rgba(255,255,255,0.2)" : bo};border-radius:100pt;padding:3pt 11pt;font-size:8pt;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:${light ? "rgba(255,255,255,0.9)" : a}">${tag || type}</div>`;

  const bar = (brand, i, n, light = false) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;border-top:1pt solid ${light ? "rgba(255,255,255,0.18)" : bo};padding-top:5.5mm;margin-top:auto;flex-shrink:0">
      <span style="font-size:8pt;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${light ? ct : a};opacity:${light ? 0.65 : 0.85}">${brand}</span>
      <span style="font-size:8pt;color:${light ? ct : mu};opacity:${light ? 0.45 : 0.6}">${i + 1} / ${n}</span>
    </div>`;

  const pages = slides
    .map((s, i) => {
      const type = s.type || "insight";
      const n = slides.length;
      let h = "";

      if (type === "cover") {
        const l = s.headline?.length || 0;
        const fs = l > 28 ? "40pt" : l > 20 ? "48pt" : "58pt";
        h = `<div style="width:190mm;height:190mm;background:${c};position:relative;overflow:hidden;display:flex;flex-direction:column;padding:15mm 18mm;box-sizing:border-box">
  <div style="position:absolute;top:-32mm;right:-32mm;width:135mm;height:135mm;border-radius:50%;background:${a};opacity:.09"></div>
  <div style="position:absolute;bottom:-38mm;left:-21mm;width:148mm;height:148mm;border-radius:50%;border:1.5pt solid ${a};opacity:.06"></div>
  <div style="position:absolute;top:0;left:0;width:2.5mm;height:190mm;background:${a}"></div>
  <div style="padding-left:3.5mm;display:flex;justify-content:space-between;align-items:center;margin-bottom:auto">
    <span style="font-size:8pt;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${a}">${brand}</span>
    <span style="font-size:8pt;color:${mu}">${i + 1} / ${n}</span>
  </div>
  <div style="padding-left:3.5mm">
    ${pill(s.tag, type)}
    <div style="width:22mm;height:1.5pt;background:${a};border-radius:1pt;margin:8mm 0 7.5mm"></div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:${fs};font-weight:400;line-height:1.08;color:${tx};font-style:italic;margin:0 0 7mm">${s.headline}</h1>
    <p style="font-size:11pt;line-height:1.65;color:${mu};margin:0">${s.body}</p>
  </div>
</div>`;
      } else if (type === "stat") {
        const sn = s.stat || "?";
        const sf = sn.length > 5 ? "55pt" : sn.length > 3 ? "70pt" : "88pt";
        h = `<div style="width:190mm;height:190mm;background:${c};overflow:hidden;display:flex;box-sizing:border-box">
  <div style="width:78mm;flex-shrink:0;background:${a};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:11mm 6mm;position:relative;overflow:hidden">
    <div style="position:absolute;top:-18mm;right:-18mm;width:60mm;height:60mm;border-radius:50%;background:rgba(255,255,255,0.08)"></div>
    <div style="position:absolute;bottom:-11mm;left:-11mm;width:46mm;height:46mm;border-radius:50%;background:rgba(0,0,0,0.07)"></div>
    <div style="font-family:'DM Serif Display',serif;font-size:${sf};font-weight:400;color:${ct};line-height:1;text-align:center;position:relative;z-index:1;word-break:break-all">${sn}</div>
    ${s.statLabel ? `<div style="font-size:8pt;font-weight:600;color:${ct};opacity:.7;margin-top:4mm;text-align:center;text-transform:uppercase;letter-spacing:.06em;position:relative;z-index:1">${s.statLabel}</div>` : ""}
  </div>
  <div style="flex:1;padding:15mm 15mm 14mm 13mm;display:flex;flex-direction:column;box-sizing:border-box">
    ${pill(s.tag, type)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:7mm 0">
      <div style="width:15mm;height:1.5pt;background:${a};border-radius:1pt;margin-bottom:7mm"></div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:27pt;font-weight:400;line-height:1.25;color:${tx};margin:0 0 5mm">${s.headline}</h2>
      <p style="font-size:10pt;line-height:1.7;color:${mu};margin:0">${s.body}</p>
    </div>
    ${bar(brand, i, n)}
  </div>
</div>`;
      } else if (type === "quote") {
        const l = s.headline?.length || 0;
        const fs = l > 42 ? "23pt" : l > 28 ? "28pt" : "35pt";
        h = `<div style="width:190mm;height:190mm;background:${c};overflow:hidden;display:flex;flex-direction:column;padding:14mm 18mm;box-sizing:border-box">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-shrink:0">
    <div style="font-family:'DM Serif Display',serif;font-size:130pt;line-height:.78;color:${a};opacity:.17;margin-left:-3.5mm;margin-top:-3mm">&ldquo;</div>
    <span style="font-size:8pt;color:${mu};padding-top:3mm">${i + 1} / ${n}</span>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;margin-top:-9mm">
    <h2 style="font-family:'DM Serif Display',serif;font-size:${fs};font-weight:400;line-height:1.33;color:${tx};font-style:italic;margin:0 0 7mm">${s.headline}</h2>
    <p style="font-size:10pt;line-height:1.7;color:${mu};margin:0">${s.body}</p>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1pt solid ${bo};padding-top:5.5mm;flex-shrink:0">
    ${pill(s.tag, type)}
    <span style="font-size:8pt;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${a}">${brand}</span>
  </div>
</div>`;
      } else if (type === "cta") {
        const l = s.headline?.length || 0;
        const fs = l > 28 ? "35pt" : l > 20 ? "43pt" : "51pt";
        h = `<div style="width:190mm;height:190mm;background:${a};overflow:hidden;position:relative;display:flex;flex-direction:column;padding:15mm 18mm;box-sizing:border-box">
  <div style="position:absolute;top:-28mm;right:-28mm;width:110mm;height:110mm;border-radius:50%;background:rgba(255,255,255,0.07)"></div>
  <div style="position:absolute;bottom:-21mm;left:-14mm;width:88mm;height:88mm;border-radius:50%;background:rgba(0,0,0,0.05)"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;position:relative;flex-shrink:0">
    ${pill(s.tag, type, true)}
    <span style="font-size:8pt;color:${ct};opacity:.45">${i + 1} / ${n}</span>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;position:relative">
    <div style="font-size:54pt;line-height:1;color:${ct};opacity:.55;margin-bottom:6mm;font-family:'DM Serif Display',serif">&#10022;</div>
    <h2 style="font-family:'DM Serif Display',serif;font-size:${fs};font-weight:400;line-height:1.12;color:${ct};margin:0 0 6mm">${s.headline}</h2>
    <p style="font-size:11pt;line-height:1.65;color:${ct};opacity:.78;margin:0">${s.body}</p>
  </div>
  <div style="border-top:1pt solid rgba(255,255,255,0.18);padding-top:5.5mm;position:relative;flex-shrink:0">
    <span style="font-size:8pt;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${ct};opacity:.6">${brand}</span>
  </div>
</div>`;
      } else {
        const l = s.headline?.length || 0;
        const fs = l > 35 ? "29pt" : l > 24 ? "36pt" : "43pt";
        h = `<div style="width:190mm;height:190mm;background:${c};overflow:hidden;display:flex;position:relative;box-sizing:border-box">
  <div style="width:2.8mm;height:190mm;background:${a};flex-shrink:0"></div>
  <div style="flex:1;padding:15mm 16mm 14mm 14mm;display:flex;flex-direction:column;position:relative;box-sizing:border-box">
    ${pill(s.tag, type)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:6mm 0">
      <div style="width:17mm;height:1.5pt;background:${a};border-radius:1pt;margin-bottom:8mm"></div>
      <h2 style="font-family:'DM Serif Display',serif;font-size:${fs};font-weight:400;line-height:1.18;color:${tx};margin:0 0 6mm">${s.headline}</h2>
      <p style="font-size:11pt;line-height:1.72;color:${mu};margin:0">${s.body}</p>
    </div>
    ${bar(brand, i, n)}
  </div>
</div>`;
      }
      return h + (i < n - 1 ? '<div style="page-break-after:always"></div>' : "");
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
@page{size:190mm 190mm;margin:0}
@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}}
</style></head>
<body>${pages}</body>
<script>document.fonts.ready.then(function(){setTimeout(function(){window.print()},700)});<\/script>
</html>`;
}
