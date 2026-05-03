/**
 * CronRead — SQL Explainer Proxy (Groq — FREE)
 * File location in your repo: /functions/api/sql-proxy.js
 *
 * Uses Groq API (LLaMA 3.3 70B) — completely FREE.
 * API key stored as Cloudflare Pages environment variable (secret).
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function onRequestPost({ request, env }) {

  // ── Check API key is set ───────────────────────────────────────────────
  if (!env.GROQ_API_KEY) {
    return Response.json(
      { error: { message: 'GROQ_API_KEY not set in Cloudflare environment variables.' } },
      { status: 500 }
    );
  }

  // ── Parse request body ─────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { message: 'Invalid JSON body.' } },
      { status: 400 }
    );
  }

  // ── Validate messages ──────────────────────────────────────────────────
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: { message: 'messages array is required.' } },
      { status: 400 }
    );
  }

  // ── Get user message ───────────────────────────────────────────────────
  const userMessage = body.messages
    .filter(m => m.role === 'user')
    .pop()?.content || '';

  // ── Call Groq API ──────────────────────────────────────────────────────
  let groqRes;
  try {
    groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert SQL analyst. Always respond with valid JSON only. No markdown, no backticks, no explanation outside JSON. Your entire response must be a single valid JSON object.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      })
    });
  } catch (err) {
    return Response.json(
      { error: { message: 'Could not reach Groq API. Please try again.' } },
      { status: 502 }
    );
  }

  const groqData = await groqRes.json();

  // ── Handle Groq errors ─────────────────────────────────────────────────
  if (!groqRes.ok) {
    return Response.json(
      { error: { message: groqData?.error?.message || 'Groq API error.' } },
      { status: groqRes.status }
    );
  }

  // ── Return in Anthropic-compatible format (HTML doesn't need changes) ──
  const responseText = groqData?.choices?.[0]?.message?.content || '';

  return Response.json({
    content: [{ type: 'text', text: responseText }]
  });
}

export async function onRequestGet() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
