"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const M = "'JetBrains Mono',monospace", S = "'Playfair Display',Georgia,serif", B = "'Source Serif 4',Georgia,serif";

const TABS = [
  { id:"home", label:"Home", icon:"◉", ai:false },
  { id:"business", label:"Business", icon:"◆", ai:false },
  { id:"science", label:"Science", icon:"◈", ai:false },
  { id:"intl", label:"Intl Relations", icon:"◎", ai:false },
  { id:"conflict", label:"War & Conflict", icon:"▲", ai:true },
  { id:"society", label:"Society", icon:"◇", ai:false },
  { id:"entertainment", label:"Entertainment", icon:"★", ai:false },
  { id:"ai", label:"AI & Tech", icon:"⬡", ai:false },
  { id:"uspolitics", label:"US Politics", icon:"■", ai:false },
  { id:"india", label:"India", icon:"●", ai:false },
  { id:"underreported", label:"Underreported", icon:"◌", ai:false },
  { id:"weekly", label:"Weekly Brief", icon:"▤", ai:true },
  { id:"campus", label:"Campus", icon:"◫", ai:false },
];

const US_SUB = [{ id:"domestic", label:"Domestic" },{ id:"international", label:"International" },{ id:"washington", label:"Washington State" }];
const IN_SUB = [{ id:"domestic", label:"Domestic" },{ id:"foreign", label:"Foreign Policy" },{ id:"economy", label:"Economy" },{ id:"society", label:"Society" }];

const LEAN = {
  Left:{ bg:"#1a2740", fg:"#5b9bd5", l:"L" },
  "Center-Left":{ bg:"#1a2d3a", fg:"#6bb5c9", l:"CL" },
  Center:{ bg:"#1f2937", fg:"#9ca3af", l:"C" },
  "Center-Right":{ bg:"#2d1f1f", fg:"#d4956a", l:"CR" },
  Right:{ bg:"#2d1a1a", fg:"#d46a6a", l:"R" },
  Independent:{ bg:"#1a2d1f", fg:"#6ad47a", l:"IND" },
  Public:{ bg:"#251a2d", fg:"#a06ad4", l:"PUB" },
};

const TC = {
  Politics:"#e94560", Conflict:"#ff6b6b", Economy:"#48cae4", Tech:"#a78bfa",
  Climate:"#52b788", Health:"#f7b731", Culture:"#e0aaff", Science:"#00b4d8",
  Sports:"#95d5b2", AI:"#a78bfa", Education:"#f59e0b", Security:"#ef4444",
  Diplomacy:"#06b6d4", Society:"#ec4899", Entertainment:"#f472b6",
  Innovation:"#10b981", Business:"#3b82f6", Military:"#dc2626",
};

const DESC = {
  home:"Breaking news from Reuters, AP, BBC, Al Jazeera, FT, Bloomberg, and more.",
  business:"FT, Bloomberg, The Economist, WSJ, NYT, Nikkei Asia, SCMP.",
  science:"Nature, Science, Scientific American, STAT News, Quanta.",
  intl:"Foreign Affairs, Foreign Policy, ICG, Politico, The Hindu, The Diplomat.",
  conflict:"AI-analyzed deep dive. All active conflicts with timelines, perspectives, historical parallels.",
  society:"The Atlantic, The Guardian, The Economist, National Review.",
  entertainment:"Variety, Hollywood Reporter, Deadline.",
  ai:"MIT Tech Review, Ars Technica, IEEE Spectrum, Semafor, Bloomberg Tech.",
  uspolitics:"Left (MSNBC, The Nation) · Center (Reuters, AP, PBS, WaPo) · Right (Fox, Dispatch, WSJ).",
  india:"The Hindu, Indian Express, NDTV, Times of India, Hindustan Times.",
  underreported:"Rest of World, Africa Report, Al Jazeera, DW, France 24.",
  weekly:"AI-generated zero-bias brief. Pure facts, no spin.",
  campus:"Times Higher Ed, Chronicle, Nature, Reuters, AP.",
};

/* ═══ DATA FETCHING ═══ */
async function fetchStories(tab, sub) {
  const tabInfo = TABS.find(t => t.id === tab);
  if (tabInfo?.ai) {
    // AI-powered tabs: weekly brief & conflict deep-dive
    const res = await fetch(`/api/ai?type=${tab}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.stories;
  } else {
    // NewsAPI-powered tabs: everything else (FAST)
    let category = tab;
    if (tab === "uspolitics" && sub) category = `uspolitics-${sub}`;
    if (tab === "india" && sub) category = `india-${sub}`;
    const res = await fetch(`/api/news?category=${category}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.stories;
  }
}

async function fetchDef(word) {
  try {
    const res = await fetch(`/api/define?word=${encodeURIComponent(word)}`);
    return await res.json();
  } catch {
    return { word, definition: "Unavailable", part_of_speech: "", pronunciation: "", example: "" };
  }
}

/* ═══ COMPONENTS ═══ */
function Loading({ isAI }) {
  const MSGS = isAI
    ? ["Running AI analysis...", "Searching global sources...", "Building intelligence brief...", "Synthesizing perspectives..."]
    : ["Loading articles...", "Fetching from news desks..."];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(p => (p + 1) % MSGS.length), 2000); return () => clearInterval(t); }, []);
  return (
    <div>
      <div style={{ textAlign: "center", padding: "36px 0 28px" }}>
        <div style={{ display: "inline-block", width: 22, height: 22, border: "2px solid rgba(255,255,255,0.08)", borderTop: "2px solid #e94560", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <p style={{ fontFamily: M, fontSize: 11, color: "#a8a4a0", marginTop: 14 }}>{MSGS[i]}</p>
      </div>
      <div style={{ display: "grid", gap: 12 }}>{[0, 1, 2].map(i =>
        <div key={i} style={{ background: "rgba(255,255,255,0.025)", padding: 24, borderLeft: "3px solid rgba(255,255,255,0.08)", animation: `shimmer 1.8s infinite ${i * 0.15}s` }}>
          <div style={{ height: 10, width: 100, background: "rgba(255,255,255,0.05)", marginBottom: 14, borderRadius: 2 }} />
          <div style={{ height: 18, width: `${80 - i * 10}%`, background: "rgba(255,255,255,0.05)", marginBottom: 10, borderRadius: 2 }} />
          <div style={{ height: 13, width: "85%", background: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
        </div>
      )}</div>
    </div>
  );
}

function Badge({ lean }) {
  const s = LEAN[lean] || LEAN.Center;
  return <span style={{ background: s.bg, color: s.fg, padding: "1px 6px", fontSize: 9, fontFamily: M, letterSpacing: "0.8px", fontWeight: 600 }}>{s.l}</span>;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Card({ story: s, index: i, visible: v, onMouseUp }) {
  const tc = TC[s.tag] || "#9ca3af";
  return (
    <div onMouseUp={onMouseUp} style={{
      opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(18px)",
      transition: `all 0.35s cubic-bezier(0.22,1,0.36,1) ${i * 0.04}s`,
      background: "rgba(255,255,255,0.025)", borderLeft: `3px solid ${tc}`, padding: "20px 22px 16px", borderRadius: 2,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {s.urgency === "breaking" && <span style={{ background: "#e94560", color: "#fff", padding: "1px 6px", fontSize: 9, fontFamily: M, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, animation: "pulse 2s infinite" }}>BREAKING</span>}
        {s.urgency === "developing" && <span style={{ background: "#f7b731", color: "#1a1a2e", padding: "1px 6px", fontSize: 9, fontFamily: M, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>DEVELOPING</span>}
        <span style={{ background: "rgba(255,255,255,0.05)", color: tc, padding: "1px 6px", fontSize: 9, fontFamily: M, letterSpacing: "1px", textTransform: "uppercase" }}>{s.tag}</span>
        <Badge lean={s.source_lean} />
        {s.publishedAt && <span style={{ fontSize: 10, color: "#5c5856", fontFamily: M }}>{timeAgo(s.publishedAt)}</span>}
        {s.region && <span style={{ fontSize: 10, color: "#5c5856", fontFamily: M, marginLeft: "auto" }}>{s.region}</span>}
      </div>
      <h3 style={{ fontFamily: S, fontSize: i < 2 ? 20 : 17, fontWeight: 700, lineHeight: 1.3, color: "#f0ece2", margin: "0 0 7px" }}>{s.headline}</h3>
      <p style={{ fontFamily: B, fontSize: 14, lineHeight: 1.7, color: "#a8a4a0", margin: "0 0 10px" }}>{s.summary}</p>

      {/* Conflict deep-dive extras */}
      {s.timeline && <div style={{ background: "rgba(255,255,255,0.03)", padding: "9px 13px", marginBottom: 9, borderRadius: 2 }}>
        <p style={{ fontFamily: M, fontSize: 9, color: "#5c5856", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Timeline</p>
        <p style={{ fontFamily: B, fontSize: 13, color: "#a8a4a0", lineHeight: 1.6 }}>{s.timeline}</p>
      </div>}
      {s.historical_parallel && <div style={{ background: "rgba(255,255,255,0.03)", padding: "9px 13px", marginBottom: 9, borderRadius: 2 }}>
        <p style={{ fontFamily: M, fontSize: 9, color: "#f7b731", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Historical Parallel</p>
        <p style={{ fontFamily: B, fontSize: 13, color: "#a8a4a0", lineHeight: 1.6 }}>{s.historical_parallel}</p>
      </div>}
      {s.perspectives && typeof s.perspectives === "object" && Object.keys(s.perspectives).length > 0 && <div style={{ background: "rgba(255,255,255,0.03)", padding: "9px 13px", marginBottom: 9, borderRadius: 2 }}>
        <p style={{ fontFamily: M, fontSize: 9, color: "#48cae4", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>Perspectives</p>
        {Object.entries(s.perspectives).map(([k, v]) => <div key={k} style={{ marginBottom: 3 }}><span style={{ fontFamily: M, fontSize: 11, color: "#f0ece2", fontWeight: 600 }}>{k}: </span><span style={{ fontFamily: B, fontSize: 13, color: "#a8a4a0" }}>{String(v)}</span></div>)}
      </div>}
      {s.analysis && <div style={{ background: "rgba(255,255,255,0.03)", padding: "9px 13px", marginBottom: 9, borderRadius: 2 }}>
        <p style={{ fontFamily: M, fontSize: 9, color: "#52b788", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Analysis</p>
        <p style={{ fontFamily: B, fontSize: 13, color: "#a8a4a0", lineHeight: 1.6 }}>{s.analysis}</p>
      </div>}
      {s.figures && Array.isArray(s.figures) && s.figures.length > 0 && <div style={{ background: "rgba(255,255,255,0.03)", padding: "9px 13px", marginBottom: 9, borderRadius: 2 }}>
        <p style={{ fontFamily: M, fontSize: 9, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>Key Figures</p>
        {s.figures.map((f, j) => <p key={j} style={{ fontFamily: B, fontSize: 13, color: "#a8a4a0", lineHeight: 1.5, marginBottom: 2 }}>• {typeof f === "string" ? f : `${f.name || ""}: ${f.action || ""}`}</p>)}
      </div>}

      {/* Source + Link */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: 10, color: "#5c5856", fontFamily: M, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.source}</span>
        {s.url && s.url.length > 10 && <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#48cae4", fontFamily: M, textDecoration: "none", padding: "3px 10px", border: "1px solid rgba(72,202,228,0.3)", borderRadius: 2 }}>Read Full Article →</a>}
      </div>
    </div>
  );
}

/* ═══ MAIN APP ═══ */
export default function Home() {
  const [tab, setTab] = useState("home");
  const [sub, setSub] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [vis, setVis] = useState(false);
  const [dict, setDict] = useState(null);
  const [dPos, setDPos] = useState({ x: 0, y: 0 });
  const [vocab, setVocab] = useState([]);
  const [vocabOpen, setVocabOpen] = useState(false);
  const cache = useRef({});

  const key = sub ? `${tab}_${sub}` : tab;
  const isAI = TABS.find(t => t.id === tab)?.ai || false;

  useEffect(() => {
    if (tab === "uspolitics" || tab === "india") {
      setSub(prev => {
        const valid = tab === "uspolitics" ? US_SUB : IN_SUB;
        if (prev && valid.some(s => s.id === prev)) return prev;
        return "domestic";
      });
    } else setSub(null);
  }, [tab]);

  const load = useCallback(async () => {
    const k = sub ? `${tab}_${sub}` : tab;
    setLoading(true); setErr(null); setVis(false);
    if (cache.current[k]) {
      setStories(cache.current[k]); setLoading(false); setTimeout(() => setVis(true), 50); return;
    }
    try {
      const data = await fetchStories(tab, sub);
      cache.current[k] = data; setStories(data); setLoading(false); setTimeout(() => setVis(true), 50);
    } catch (e) {
      console.error("[Wire]", e); setErr(e.message); setLoading(false);
    }
  }, [tab, sub]);

  useEffect(() => {
    if ((tab === "uspolitics" || tab === "india") && !sub) return;
    load();
  }, [tab, sub, load]);

  // Load vocab from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wire-vocab");
      if (saved) setVocab(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("wire-vocab", JSON.stringify(vocab)); } catch {}
  }, [vocab]);

  const onSel = useCallback(async () => {
    const sel = window.getSelection(); const t = sel?.toString().trim();
    if (!t || t.length < 2 || t.length > 30) return;
    const w = t.replace(/[^a-zA-Z'-]/g, ""); if (w.length < 2) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setDPos({ x: rect.left, y: rect.bottom });
    setDict({ word: w, definition: "Loading...", part_of_speech: "", pronunciation: "", example: "" });
    setDict(await fetchDef(w));
  }, []);

  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const subTabs = tab === "uspolitics" ? US_SUB : tab === "india" ? IN_SUB : null;
  const info = TABS.find(t => t.id === tab) || TABS[0];

  return (
    <>
      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, background: "rgba(14,14,18,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", zIndex: 200, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 8px" }}>
          <div>
            <h1 style={{ fontFamily: S, fontSize: 24, fontWeight: 900, letterSpacing: "-1px" }}>THE WIRE</h1>
            <p style={{ fontFamily: M, fontSize: 9, color: "#5c5856", letterSpacing: "2px" }}>GLOBAL INTELLIGENCE</p>
          </div>
          <button onClick={() => setVocabOpen(true)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#48cae4", padding: "5px 12px", borderRadius: 2, cursor: "pointer", fontFamily: M, fontSize: 10 }}>
            Vocab ({vocab.length})
          </button>
        </div>
        <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 8 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "6px 11px", background: tab === t.id ? "rgba(233,69,96,0.15)" : "transparent",
              border: "none", borderBottom: tab === t.id ? "2px solid #e94560" : "2px solid transparent",
              color: tab === t.id ? "#e94560" : "#a8a4a0", fontFamily: M, fontSize: 10,
              letterSpacing: "0.4px", whiteSpace: "nowrap", cursor: "pointer",
              transition: "all 0.15s",
            }}>{t.icon} {t.label}{t.ai ? " ✦" : ""}</button>
          ))}
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "24px 20px 80px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: S, fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px" }}>{info.icon} {info.label}</h2>
            {isAI && <span style={{ fontFamily: M, fontSize: 9, color: "#a78bfa", background: "rgba(167,139,250,0.1)", padding: "2px 8px", borderRadius: 2, letterSpacing: "1px" }}>AI-POWERED</span>}
            <span style={{ fontFamily: M, fontSize: 10, color: "#5c5856" }}>{date}</span>
          </div>
          {DESC[tab] && <p style={{ fontFamily: B, fontSize: 13, color: "#5c5856", marginTop: 6, lineHeight: 1.5 }}>{DESC[tab]}</p>}
          <div style={{ height: 1, background: "linear-gradient(to right,#e94560,transparent)", marginTop: 12 }} />
        </div>

        {subTabs && (
          <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
            {subTabs.map(st => (
              <button key={st.id} onClick={() => setSub(st.id)} style={{
                padding: "7px 14px",
                background: sub === st.id ? "rgba(233,69,96,0.15)" : "transparent",
                border: sub === st.id ? "1px solid rgba(233,69,96,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: sub === st.id ? "#e94560" : "#a8a4a0",
                borderRadius: 2, cursor: "pointer", fontFamily: M, fontSize: 10, letterSpacing: "0.8px", textTransform: "uppercase",
                transition: "all 0.15s",
              }}>{st.label}</button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <button onClick={() => { delete cache.current[key]; load(); }} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#5c5856",
            padding: "5px 12px", borderRadius: 2, cursor: "pointer", fontFamily: M, fontSize: 9,
            letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.15s",
          }}>↻ Refresh</button>
        </div>

        {loading ? <Loading isAI={isAI} /> : err ? (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <p style={{ fontSize: 15, color: "#a8a4a0", marginBottom: 6 }}>{err}</p>
            <button onClick={load} style={{ background: "#e94560", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontFamily: M, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>Retry</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {stories.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <p style={{ fontSize: 15, color: "#a8a4a0", marginBottom: 6 }}>No articles found for this category right now.</p>
                <button onClick={() => { delete cache.current[key]; load(); }} style={{ background: "#e94560", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 2, cursor: "pointer", fontFamily: M, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>Try Again</button>
              </div>
            ) : stories.map((s, i) => <Card key={`${key}-${i}`} story={s} index={i} visible={vis} onMouseUp={onSel} />)}
          </div>
        )}

        <p style={{ fontFamily: M, fontSize: 9, color: "#5c5856", textAlign: "center", marginTop: 48, letterSpacing: "2px", textTransform: "uppercase" }}>
          ✦ = AI-powered tab · Select any word for definition
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          {Object.entries(LEAN).map(([k, v]) => <span key={k} style={{ fontFamily: M, fontSize: 8, color: v.fg }}>{v.l}={k}</span>)}
        </div>
      </main>

      {/* DICTIONARY */}
      {dict && (
        <div style={{ position: "fixed", left: Math.min(dPos.x, typeof window !== "undefined" ? window.innerWidth - 310 : 400), top: Math.min(dPos.y + 10, typeof window !== "undefined" ? window.innerHeight - 260 : 400), width: 290, background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, padding: 14, zIndex: 9999, boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: S, fontSize: 17, color: "#f0ece2", fontWeight: 700 }}>{dict.word}</span>
            <button onClick={() => setDict(null)} style={{ background: "none", border: "none", color: "#5c5856", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          {dict.pronunciation && <div style={{ fontFamily: M, fontSize: 10, color: "#5c5856", marginBottom: 4 }}>{dict.pronunciation}</div>}
          {dict.part_of_speech && <div style={{ fontFamily: M, fontSize: 9, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>{dict.part_of_speech}</div>}
          <p style={{ fontFamily: B, fontSize: 13, color: "#a8a4a0", lineHeight: 1.6, marginBottom: 6 }}>{dict.definition}</p>
          {dict.example && <p style={{ fontFamily: B, fontSize: 12, color: "#5c5856", fontStyle: "italic", marginBottom: 10 }}>"{dict.example}"</p>}
          <button onClick={() => { setVocab(p => [dict, ...p]); setDict(null); }} style={{ width: "100%", background: "#48cae4", color: "#0e0e12", border: "none", padding: 6, borderRadius: 2, cursor: "pointer", fontFamily: M, fontSize: 9, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700 }}>+ Add to Vocab</button>
        </div>
      )}

      {/* VOCAB PANEL */}
      {vocabOpen && (
        <>
          <div onClick={() => setVocabOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9997 }} />
          <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 380, maxWidth: "90vw", background: "#12121a", borderLeft: "1px solid rgba(255,255,255,0.08)", zIndex: 9998, overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: S, fontSize: 20, color: "#f0ece2", fontWeight: 700 }}>Vocabulary ({vocab.length})</h3>
              <button onClick={() => setVocabOpen(false)} style={{ background: "none", border: "none", color: "#5c5856", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ padding: "12px 24px" }}>
              {!vocab.length && <p style={{ fontFamily: B, fontSize: 14, color: "#5c5856", textAlign: "center", padding: "40px 0" }}>Select any word while reading to build your list here.</p>}
              {vocab.map((w, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: S, fontSize: 15, color: "#f0ece2", fontWeight: 700 }}>{w.word}</span>
                    <button onClick={() => setVocab(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#5c5856", cursor: "pointer", fontSize: 11, fontFamily: M }}>×</button>
                  </div>
                  {w.part_of_speech && <div style={{ fontFamily: M, fontSize: 9, color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase", marginTop: 2 }}>{w.part_of_speech}</div>}
                  <p style={{ fontFamily: B, fontSize: 13, color: "#a8a4a0", lineHeight: 1.5, marginTop: 4 }}>{w.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
