import { NextResponse } from "next/server";

/* ═══ CATEGORY → GNEWS QUERY MAPPING ═══ */
const CATEGORY_CONFIG = {
  home: { endpoint: "top-headlines", topic: "world", q: null },
  business: { endpoint: "top-headlines", topic: "business", q: null },
  science: { endpoint: "top-headlines", topic: "science", q: null },
  intl: { endpoint: "search", topic: null, q: "diplomacy OR geopolitics OR international relations OR foreign policy" },
  conflict: { endpoint: "search", topic: null, q: "war OR military OR conflict OR armed forces OR security" },
  society: { endpoint: "search", topic: null, q: "social movements OR culture OR migration OR demographics" },
  entertainment: { endpoint: "top-headlines", topic: "entertainment", q: null },
  ai: { endpoint: "search", topic: null, q: "artificial intelligence OR AI OR machine learning OR ChatGPT OR OpenAI" },
  campus: { endpoint: "search", topic: null, q: "university students OR college research OR campus OR student invention" },
  underreported: { endpoint: "search", topic: null, q: "Africa OR Southeast Asia OR Latin America OR Pacific Islands development" },

  "uspolitics-domestic": { endpoint: "search", topic: null, q: "US politics OR Congress OR White House OR Senate", country: "us" },
  "uspolitics-international": { endpoint: "search", topic: null, q: "US foreign policy OR American diplomacy OR State Department" },
  "uspolitics-washington": { endpoint: "search", topic: null, q: "Washington state OR Seattle politics OR Olympia legislation" },

  "india-domestic": { endpoint: "search", topic: null, q: "India politics OR Modi OR BJP OR Congress party OR Parliament India", country: "in" },
  "india-foreign": { endpoint: "search", topic: null, q: "India foreign policy OR India diplomacy OR India relations" },
  "india-economy": { endpoint: "search", topic: null, q: "India economy OR India GDP OR India markets OR India business" },
  "india-society": { endpoint: "search", topic: null, q: "India society OR India culture OR India social" },
};

/* ═══ SOURCE LEAN MAPPING ═══ */
const SOURCE_LEAN = {
  "reuters.com": "Center", "apnews.com": "Center", "bbc.com": "Center", "bbc.co.uk": "Center",
  "aljazeera.com": "Center", "france24.com": "Center", "dw.com": "Public",
  "ft.com": "Center-Right", "bloomberg.com": "Center", "economist.com": "Center-Right",
  "wsj.com": "Center-Right", "nytimes.com": "Center-Left", "theguardian.com": "Center-Left",
  "theatlantic.com": "Center-Left", "washingtonpost.com": "Center-Left",
  "foxnews.com": "Right", "cnn.com": "Center-Left", "nbcnews.com": "Center-Left",
  "msnbc.com": "Left", "thenation.com": "Left", "nationalreview.com": "Right",
  "politico.com": "Center", "thehill.com": "Center", "pbs.org": "Center",
  "cnbc.com": "Center", "marketwatch.com": "Center", "businessinsider.com": "Center-Left",
  "technologyreview.com": "Center", "arstechnica.com": "Center", "theverge.com": "Center-Left",
  "wired.com": "Center-Left", "techcrunch.com": "Center",
  "nature.com": "Independent", "science.org": "Independent", "scientificamerican.com": "Center-Left",
  "newscientist.com": "Center", "space.com": "Center",
  "variety.com": "Center", "hollywoodreporter.com": "Center", "deadline.com": "Center",
  "ndtv.com": "Center-Left", "thehindu.com": "Center-Left", "indianexpress.com": "Center",
  "timesofindia.indiatimes.com": "Center", "hindustantimes.com": "Center", "livemint.com": "Center",
  "scmp.com": "Center", "asia.nikkei.com": "Center", "japantimes.co.jp": "Center",
  "abc.net.au": "Center", "cbc.ca": "Center", "timesofisrael.com": "Center",
  "haaretz.com": "Center-Left", "rt.com": "State-Affiliated", "globaltimes.cn": "State-Affiliated",
  "restofworld.org": "Independent", "theafricareport.com": "Independent",
  "semafor.com": "Center", "axios.com": "Center",
};

const TAG_MAP = {
  home: "Politics", business: "Economy", science: "Science", intl: "Diplomacy",
  conflict: "Conflict", society: "Society", entertainment: "Entertainment",
  ai: "Tech", campus: "Education", underreported: "Society",
};

function getDomain(url) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; }
}

function inferTag(category) {
  if (category.startsWith("uspolitics")) return "Politics";
  if (category.startsWith("india")) return "Politics";
  return TAG_MAP[category] || "Politics";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "home";
  const apiKey = process.env.GNEWS_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GNEWS_KEY not set. Add it in Vercel Environment Variables." }, { status: 500 });
  }

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.home;

  let url;
  if (config.endpoint === "top-headlines") {
    url = `https://gnews.io/api/v4/top-headlines?topic=${config.topic}&lang=en&max=10&apikey=${apiKey}`;
    if (config.country) url += `&country=${config.country}`;
  } else {
    url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(config.q)}&lang=en&max=10&sortby=publishedAt&apikey=${apiKey}`;
    if (config.country) url += `&country=${config.country}`;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    if (data.errors || !data.articles) {
      console.error("[GNews]", data.errors || "No articles");
      return NextResponse.json({ error: data.errors?.[0] || "GNews API error" }, { status: 500 });
    }

    const stories = data.articles.map((a) => {
      const domain = getDomain(a.url || "");
      return {
        headline: a.title || "",
        summary: a.description || "",
        source: a.source?.name || domain,
        source_lean: SOURCE_LEAN[domain] || "Center",
        region: "",
        tag: inferTag(category),
        urgency: "standard",
        url: a.url || "",
        publishedAt: a.publishedAt || "",
      };
    }).filter(s => s.headline);

    return NextResponse.json({ stories });
  } catch (e) {
    console.error("[GNews]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
