import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function exportSlideAsBlob(domNode) {
  const dataUrl = await toPng(domNode, {
    width: 540,
    height: 540,
    pixelRatio: 2,
    cacheBust: true,
    style: {
      transform: "none",
      transformOrigin: "top left",
    },
  });
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function downloadSinglePng(domNode, filename) {
  const blob = await exportSlideAsBlob(domNode);
  saveAs(blob, filename);
}

export async function downloadAllPngs(renderFn, count, title) {
  const zip = new JSZip();
  const folder = zip.folder(title || "carousel");

  for (let i = 0; i < count; i++) {
    const node = await renderFn(i);
    if (!node) continue;
    const blob = await exportSlideAsBlob(node);
    folder.file(`slide-${String(i + 1).padStart(2, "0")}.png`, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${title || "carousel"}.zip`);
}
