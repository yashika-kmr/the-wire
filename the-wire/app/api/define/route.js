import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!word) return NextResponse.json({ error: "No word" }, { status: 400 });
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });

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
        max_tokens: 250,
        system: 'Return ONLY JSON: {"word":"","pronunciation":"","part_of_speech":"","definition":"","example":""}',
        messages: [{ role: "user", content: `Define: ${word}` }],
      }),
    });

    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ word, definition: "Unavailable", part_of_speech: "", pronunciation: "", example: "" });
  }
}
