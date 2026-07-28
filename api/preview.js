const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[?::1\]?$|.*\.local$)/i;
const PRIVATE_172 = /^172\.(1[6-9]|2\d|3[01])\./;

function pickMeta(html, names) {
  for (const name of names) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,
      "i"
    );
    const m = html.match(re);
    if (m) return (m[1] || m[2] || "").trim();
  }
  return "";
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
  const raw = req.query.url;
  if (!raw || typeof raw !== "string") return res.status(400).json({});

  let target;
  try {
    target = new URL(raw);
  } catch {
    return res.status(400).json({});
  }
  if (!/^https?:$/.test(target.protocol)) return res.status(400).json({});
  if (PRIVATE_HOST.test(target.hostname) || PRIVATE_172.test(target.hostname)) {
    return res.status(400).json({});
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(target.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        Accept: "text/html,application/xhtml+xml"
      }
    });
    clearTimeout(timer);

    const type = resp.headers.get("content-type") || "";
    if (!type.includes("html")) return res.status(200).json({});

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    while (html.length < 400000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});

    let image = pickMeta(html, ["og:image:secure_url", "og:image", "twitter:image"]);
    let title = pickMeta(html, ["og:title", "twitter:title"]);
    if (!title) {
      const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (t) title = t[1].trim();
    }
    if (image) {
      try {
        image = new URL(decodeEntities(image), resp.url || target.href).href;
        if (!/^https?:/.test(image)) image = "";
      } catch {
        image = "";
      }
    }
    return res.status(200).json({
      title: decodeEntities(title).slice(0, 150),
      image: image.slice(0, 2000)
    });
  } catch {
    return res.status(200).json({});
  }
}
