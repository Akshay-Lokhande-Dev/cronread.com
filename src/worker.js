/**
 * CronRead — Main Worker
 * Handles /api/sql-proxy route (Groq AI)
 * All other requests → static assets (your HTML/CSS/JS files)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Route: POST /api/sql-proxy ─────────────────────────────────────
    if (url.pathname === '/api/sql-proxy') {

      // CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      // Handle preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Only allow POST
      if (request.method !== 'POST') {
        return Response.json(
          { error: { message: 'Method not allowed' } },
          { status: 405, headers: corsHeaders }
        );
      }

      // Check API key
      if (!env.GROQ_API_KEY) {
        return Response.json(
          { error: { message: 'GROQ_API_KEY not set in environment variables.' } },
          { status: 500, headers: corsHeaders }
        );
      }

      // Parse body
      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json(
          { error: { message: 'Invalid JSON body.' } },
          { status: 400, headers: corsHeaders }
        );
      }

      // Validate messages
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        return Response.json(
          { error: { message: 'messages array is required.' } },
          { status: 400, headers: corsHeaders }
        );
      }

      // Get user message
      const userMessage = body.messages
        .filter(m => m.role === 'user')
        .pop()?.content || '';

      // Call Groq API
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
          { status: 502, headers: corsHeaders }
        );
      }

      const groqData = await groqRes.json();

      // Handle Groq errors
      if (!groqRes.ok) {
        return Response.json(
          { error: { message: groqData?.error?.message || 'Groq API error.' } },
          { status: groqRes.status, headers: corsHeaders }
        );
      }

      // Return Anthropic-compatible format
      const responseText = groqData?.choices?.[0]?.message?.content || '';
      return Response.json(
        { content: [{ type: 'text', text: responseText }] },
        { headers: corsHeaders }
      );
    }

    // ── All other routes → Serve static files ─────────────────────────
    return env.ASSETS.fetch(request);
  }
};
