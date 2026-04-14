import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "weekly";
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  const prompts = {
    weekly: {
      system: `You are a zero-bias intelligence analyst. Return ONLY a JSON array. Each object: {"headline":"","summary":"3 sentences of pure facts","source":"outlet name","source_lean":"Center","region":"country","tag":"relevant tag","urgency":"standard","url":"real article URL","analysis":"what this means long-term"}. ZERO editorial framing. Only: what happened, what changed, what's developing. Draw from: Reuters, AP, Financial Times, Foreign Affairs, BBC, The Economist, Al Jazeera. Return 6 stories ranked by long-term global impact.`,
      query: "most consequential global developments this week",
    },
    conflict: {
      system: `You are a defense/security analyst. Return ONLY a JSON array. Each object: {"headline":"","summary":"2 sentences","source":"outlet name","source_lean":"Center","region":"country/zone","tag":"Conflict","urgency":"breaking|developing|standard","url":"real article URL","timeline":"key recent events timeline","historical_parallel":"historical parallel if any","perspectives":{"Side A":"position","Side B":"position"}}. Draw from: Reuters, BBC, Al Jazeera, War on the Rocks, Defense News, AP. Return 5 stories covering ALL major active conflict zones.`,
      query: "ongoing wars armed conflicts military operations worldwide today",
    },
  };

  const config = prompts[type] || prompts.weekly;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: config.system,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: `Search for: ${config.query}\nReturn JSON array.` }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[AI API]", res.status, err);
      return NextResponse.json({ error: `Anthropic API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const cleaned = text.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      const stories = JSON.parse(match[0]);
      return NextResponse.json({ stories });
    }

    return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
  } catch (e) {
    console.error("[AI API]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
