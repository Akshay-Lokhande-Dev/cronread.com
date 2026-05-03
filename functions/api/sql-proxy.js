/**
 * CronRead — SQL Explainer Proxy (Cloudflare AI — FREE)
 * File location in your repo: /functions/api/sql-proxy.js
 *
 * Uses Cloudflare Workers AI (LLaMA 3.3 70B) — completely FREE.
 * No API key needed. No Anthropic account needed.
 * Just add the AI binding in Cloudflare Pages dashboard.
 *
 * Setup (one time):
 *   Cloudflare Dashboard → Pages → cronread → Settings
 *   → Functions → AI Bindings → Add binding
 *   → Variable name: AI  (exactly this, capital AI)
 *   → Save & redeploy
 *
 * Free limits:
 *   10,000 requests/day on free Cloudflare plan — more than enough to start.
 */

// Best free model on Cloudflare AI for instruction-following + JSON output
const CF_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export async function onRequestPost({ request, env }) {

  // ── Check AI binding is set up ─────────────────────────────────────────
  if (!env.AI) {
    return Response.json(
      { error: { message: 'AI binding not configured. Add AI binding in Cloudflare Pages → Settings → Functions → AI Bindings.' } },
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

  // ── Extract user prompt ────────────────────────────────────────────────
  // Get the last user message (the SQL analysis prompt)
  const userMessage = body.messages
    .filter(m => m.role === 'user')
    .pop()?.content || '';

  if (!userMessage) {
    return Response.json(
      { error: { message: 'No user message found.' } },
      { status: 400 }
    );
  }

  // ── Run Cloudflare AI ──────────────────────────────────────────────────
  let aiResponse;
  try {
    aiResponse = await env.AI.run(CF_MODEL, {
      messages: [
        {
          role: 'system',
          content: 'You are an expert SQL analyst. Always respond with valid JSON only. No markdown, no explanations outside JSON, no backticks. Your entire response must be a single valid JSON object.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 1500,
      temperature: 0.1  // Low temperature = more consistent JSON output
    });
  } catch (err) {
    console.error('Cloudflare AI error:', err);
    return Response.json(
      { error: { message: 'AI model error. Please try again.' } },
      { status: 502 }
    );
  }

  // ── Normalize response to Anthropic-compatible format ──────────────────
  // The HTML already knows how to parse Anthropic's response format,
  // so we return in the same shape — no HTML changes needed.
  const responseText = aiResponse?.response || '';

  return Response.json({
    content: [
      {
        type: 'text',
        text: responseText
      }
    ]
  });
}

// ── Block non-POST requests ────────────────────────────────────────────────
export async function onRequestGet() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
