import { NextResponse } from "next/server";

/* ═══ OUTLET → DOMAIN MAPPING PER CATEGORY ═══ */
const CATEGORY_DOMAINS = {
  home: "reuters.com,apnews.com,bbc.com,aljazeera.com,france24.com,dw.com,ft.com,bloomberg.com,economist.com,foreignaffairs.com,technologyreview.com,theguardian.com,theatlantic.com",
  business: "ft.com,bloomberg.com,economist.com,wsj.com,nytimes.com,asia.nikkei.com,scmp.com,reuters.com",
  science: "nature.com,science.org,scientificamerican.com,statnews.com,quantamagazine.org",
  intl: "foreignaffairs.com,foreignpolicy.com,crisisgroup.org,politico.com,cfr.org,thehindu.com,thediplomat.com,reuters.com,bbc.com",
  conflict: "reuters.com,bbc.com,aljazeera.com,warontherocks.com,defensenews.com,apnews.com,france24.com,dw.com",
  society: "theatlantic.com,theguardian.com,economist.com,nationalreview.com,reuters.com,apnews.com",
  entertainment: "variety.com,hollywoodreporter.com,deadline.com",
  ai: "technologyreview.com,arstechnica.com,spectrum.ieee.org,ft.com,bloomberg.com,semafor.com",
  campus: "timeshighereducation.com,chronicle.com,nature.com,reuters.com,apnews.com",
  underreported: "restofworld.org,theafricareport.com,aljazeera.com,dw.com,france24.com,reuters.com",

  // US Politics sub-tabs
  "uspolitics-domestic": "reuters.com,apnews.com,washingtonpost.com,foxnews.com,msnbc.com,pbs.org,thenation.com,thedispatch.com,wsj.com",
  "uspolitics-international": "reuters.com,apnews.com,foreignpolicy.com,washingtonpost.com,wsj.com,politico.com",
  "uspolitics-washington": "reuters.com,apnews.com,washingtonpost.com,seattletimes.com,kuow.org",

  // India sub-tabs
  "india-domestic": "thehindu.com,indianexpress.com,ndtv.com,timesofindia.indiatimes.com,hindustantimes.com",
  "india-foreign": "thehindu.com,indianexpress.com,ndtv.com,reuters.com,bbc.com,thediplomat.com",
  "india-economy": "thehindu.com,indianexpress.com,reuters.com,bloomberg.com,ft.com,livemint.com",
  "india-society": "thehindu.com,indianexpress.com,ndtv.com,theguardian.com,bbc.com",
};

const CATEGORY_QUERIES = {
  home: "world news",
  business: "business economy finance",
  science: "science discovery research",
  intl: "diplomacy international relations geopolitics",
  conflict: "war conflict military security",
  society: "society culture social movements",
  entertainment: "entertainment film music television",
  ai: "artificial intelligence AI technology",
  campus: "university students college research",
  underreported: "Africa Asia Latin America development",
  "uspolitics-domestic": "US politics Congress White House",
  "uspolitics-international": "US foreign policy",
  "uspolitics-washington": "Washington state politics Seattle",
  "india-domestic": "India politics Modi parliament",
  "india-foreign": "India foreign policy diplomacy",
  "india-economy": "India economy GDP markets",
  "india-society": "India society culture",
};

/* ═══ SOURCE LEAN MAPPING ═══ */
const SOURCE_LEAN = {
  "reuters.com": "Center",
  "apnews.com": "Center",
  "bbc.com": "Center",
  "bbc.co.uk": "Center",
  "aljazeera.com": "Center",
  "france24.com": "Center",
  "dw.com": "Public",
  "ft.com": "Center-Right",
  "bloomberg.com": "Center",
  "economist.com": "Center-Right",
  "wsj.com": "Center-Right",
  "nytimes.com": "Center-Left",
  "foreignaffairs.com": "Center",
  "foreignpolicy.com": "Center",
  "technologyreview.com": "Center",
  "theguardian.com": "Center-Left",
  "theatlantic.com": "Center-Left",
  "nature.com": "Independent",
  "science.org": "Independent",
  "scientificamerican.com": "Center-Left",
  "statnews.com": "Center",
  "quantamagazine.org": "Independent",
  "crisisgroup.org": "Independent",
  "politico.com": "Center",
  "cfr.org": "Center",
  "thehindu.com": "Center-Left",
  "thediplomat.com": "Center",
  "warontherocks.com": "Center",
  "defensenews.com": "Center",
  "nationalreview.com": "Right",
  "variety.com": "Center",
  "hollywoodreporter.com": "Center",
  "deadline.com": "Center",
  "arstechnica.com": "Center",
  "spectrum.ieee.org": "Independent",
  "semafor.com": "Center",
  "asia.nikkei.com": "Center",
  "scmp.com": "Center",
  "msnbc.com": "Left",
  "thenation.com": "Left",
  "pbs.org": "Center",
  "washingtonpost.com": "Center-Left",
  "foxnews.com": "Right",
  "thedispatch.com": "Center-Right",
  "indianexpress.com": "Center",
  "ndtv.com": "Center-Left",
  "timesofindia.indiatimes.com": "Center",
  "hindustantimes.com": "Center",
  "restofworld.org": "Independent",
  "theafricareport.com": "Independent",
  "timeshighereducation.com": "Independent",
  "chronicle.com": "Center",
  "livemint.com": "Center",
  "seattletimes.com": "Center",
  "kuow.org": "Public",
};

function getDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch { return ""; }
}

function getSourceName(url) {
  const names = {
    "reuters.com": "Reuters", "apnews.com": "Associated Press", "bbc.com": "BBC News",
    "bbc.co.uk": "BBC News", "aljazeera.com": "Al Jazeera", "france24.com": "France 24",
    "dw.com": "Deutsche Welle", "ft.com": "Financial Times", "bloomberg.com": "Bloomberg",
    "economist.com": "The Economist", "wsj.com": "Wall Street Journal", "nytimes.com": "New York Times",
    "foreignaffairs.com": "Foreign Affairs", "foreignpolicy.com": "Foreign Policy",
    "technologyreview.com": "MIT Technology Review", "theguardian.com": "The Guardian",
    "theatlantic.com": "The Atlantic", "nature.com": "Nature", "science.org": "Science",
    "scientificamerican.com": "Scientific American", "statnews.com": "STAT News",
    "quantamagazine.org": "Quanta Magazine", "crisisgroup.org": "Int'l Crisis Group",
    "politico.com": "Politico", "cfr.org": "CFR", "thehindu.com": "The Hindu",
    "thediplomat.com": "The Diplomat", "warontherocks.com": "War on the Rocks",
    "defensenews.com": "Defense News", "nationalreview.com": "National Review",
    "variety.com": "Variety", "hollywoodreporter.com": "Hollywood Reporter",
    "deadline.com": "Deadline", "arstechnica.com": "Ars Technica",
    "spectrum.ieee.org": "IEEE Spectrum", "semafor.com": "Semafor",
    "asia.nikkei.com": "Nikkei Asia", "scmp.com": "South China Morning Post",
    "msnbc.com": "MSNBC", "thenation.com": "The Nation", "pbs.org": "PBS NewsHour",
    "washingtonpost.com": "Washington Post", "foxnews.com": "Fox News",
    "thedispatch.com": "The Dispatch", "indianexpress.com": "Indian Express",
    "ndtv.com": "NDTV", "timesofindia.indiatimes.com": "Times of India",
    "hindustantimes.com": "Hindustan Times", "restofworld.org": "Rest of World",
    "theafricareport.com": "Africa Report", "timeshighereducation.com": "Times Higher Ed",
    "chronicle.com": "Chronicle of Higher Ed", "livemint.com": "Mint",
    "seattletimes.com": "Seattle Times", "kuow.org": "KUOW",
  };
  const d = getDomain(url);
  return names[d] || url;
}

function inferTag(category, title = "") {
  const tagMap = {
    home: "Politics", business: "Economy", science: "Science", intl: "Diplomacy",
    conflict: "Conflict", society: "Society", entertainment: "Entertainment",
    ai: "Tech", campus: "Education", underreported: "Society",
  };
  if (category.startsWith("uspolitics")) return "Politics";
  if (category.startsWith("india")) return "Politics";
  return tagMap[category] || "Politics";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "home";
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "NEWSAPI_KEY not set" }, { status: 500 });
  }

  const domains = CATEGORY_DOMAINS[category] || CATEGORY_DOMAINS.home;
  const query = CATEGORY_QUERIES[category] || "world news";
  const pageSize = category === "home" ? 12 : 8;

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=${domains}&pageSize=${pageSize}&sortBy=publishedAt&language=en&apiKey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 min
    const data = await res.json();

    if (data.status !== "ok") {
      return NextResponse.json({ error: data.message || "NewsAPI error" }, { status: 500 });
    }

    const stories = (data.articles || []).map((a) => {
      const domain = getDomain(a.url || "");
      return {
        headline: a.title || "",
        summary: a.description || "",
        source: getSourceName(a.url || "") || a.source?.name || "",
        source_lean: SOURCE_LEAN[domain] || "Center",
        region: "", // NewsAPI doesn't provide this
        tag: inferTag(category, a.title),
        urgency: "standard",
        url: a.url || "",
        publishedAt: a.publishedAt || "",
      };
    }).filter(s => s.headline && s.headline !== "[Removed]");

    return NextResponse.json({ stories });
  } catch (e) {
    console.error("[News API]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
