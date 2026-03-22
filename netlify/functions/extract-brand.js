export default async function handler(req) {
  const url = new URL(req.url, "http://localhost").searchParams.get("url");
  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ContentForge/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch: ${response.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const html = await response.text();
    const result = extractBrandData(html, targetUrl);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || "Extraction failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function extractBrandData(html, url) {
  const colors = new Set();
  const fonts = new Set();

  const themeColorMatch = html.match(
    /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i
  );
  if (themeColorMatch) colors.add(themeColorMatch[1].trim());

  const tileColorMatch = html.match(
    /<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i
  );
  if (tileColorMatch) colors.add(tileColorMatch[1].trim());

  const hexPattern = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
  const rgbPattern =
    /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)/g;

  const styleBlocks = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const inlineStyles = html.match(/style=["'][^"']*["']/gi) || [];
  const colorSources = [...styleBlocks, ...inlineStyles].join(" ");

  let match;
  while ((match = hexPattern.exec(colorSources)) !== null) {
    colors.add(match[0].toLowerCase());
  }
  while ((match = rgbPattern.exec(colorSources)) !== null) {
    const hex = `#${[match[1], match[2], match[3]]
      .map((v) => parseInt(v).toString(16).padStart(2, "0"))
      .join("")}`;
    colors.add(hex);
  }

  const cssVarPattern =
    /--[\w-]*(?:color|bg|background|accent|primary|brand)[\w-]*\s*:\s*([^;}\n]+)/gi;
  while ((match = cssVarPattern.exec(html)) !== null) {
    const val = match[1].trim();
    if (val.startsWith("#")) colors.add(val.toLowerCase());
  }

  const gfPattern = /fonts\.googleapis\.com\/css2?\?family=([^"'&\s]+)/g;
  while ((match = gfPattern.exec(html)) !== null) {
    const families = decodeURIComponent(match[1]).split("|");
    families.forEach((f) => {
      const name = f.split(":")[0].replace(/\+/g, " ");
      if (name) fonts.add(name);
    });
  }

  const fontFamilyPattern = /font-family\s*:\s*["']?([^"';},]+)/gi;
  while ((match = fontFamilyPattern.exec(html)) !== null) {
    const name = match[1].trim().split(",")[0].trim().replace(/["']/g, "");
    if (
      name &&
      !["inherit", "initial", "unset", "serif", "sans-serif", "monospace", "cursive", "system-ui"].includes(name.toLowerCase())
    ) {
      fonts.add(name);
    }
  }

  const filtered = [...colors].filter((c) => {
    const hex = c.toLowerCase();
    return ![
      "#000000", "#000", "#ffffff", "#fff", "#333333", "#333",
      "#666666", "#666", "#999999", "#999", "#cccccc", "#ccc",
      "#f5f5f5", "#eeeeee", "#eee", "#e5e5e5",
    ].includes(hex);
  });

  return {
    url,
    colors: filtered.slice(0, 12),
    fonts: [...fonts].slice(0, 6),
    themeColor: themeColorMatch ? themeColorMatch[1].trim() : null,
  };
}

export const config = {
  path: "/api/extract-brand",
};
