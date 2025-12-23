export default async function handler(req, res) {
  const { model: userModel } = req.query; // renamed for clarity

  if (!userModel) {
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          {
            role: 'system',
            content: `You are an archery bow spec lookup assistant. User input: "${userModel}" (may be partial/ambiguous).

Use web search and browsing tools to find the most relevant compound bow models (prioritize Hoyt, Mathews, etc., recent/current 2024–2026 models from manufacturer sites like hoyt.com, mathewsinc.com, or reliable archery sources).

Return ONLY valid JSON (no explanations, no extra text):
{
  "ambiguous": boolean,
  "matches": array of objects like {
    "full_name": "2025 Hoyt Carbon RX-9 Ultra",
    "year": "2025",
    "type": "compound",
    "ibo": number or null,
    "brace": number or null,
    "cam": string or null
  },
  "clarification": short string (max 100 chars, only if ambiguous) like "Which year/model for accurate specs?"
}

If one clear match, ambiguous=false, matches=[single object].
If ambiguous, ambiguous=true, matches=2–5 best options.
If nothing found, { "error": "not found" }.
Output pure JSON only.`
          },
          {
            role: 'user',
            content: `Find specs for bow model: ${userModel}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
        tools: [
          {
            name: "web_search",
            description: "Search the web for bow specs",
            input_schema: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query" },
                num_results: { type: "integer", description: "Number of results (default 10)" }
              },
              required: ["query"]
            }
          },
          {
            name: "browse_page",
            description: "Browse a specific URL for details",
            input_schema: {
              type: "object",
              properties: {
                url: { type: "string", description: "The URL to browse" },
                instructions: { type: "string", description: "Instructions for summarizer" }
              },
              required: ["url", "instructions"]
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    // If model returns tool calls, we need to handle them (for now, assume it resolves in one call)
    if (message.tool_calls) {
      // In production, you'd implement tool execution loop here
      // For simple cases, model often returns final JSON without tool_calls
      return res.status(200).json({ error: 'Tool calls not yet handled in proxy' });
    }

    const content = message.content?.trim();

    try {
      const specs = JSON.parse(content);
      return res.status(200).json(specs);
    } catch (e) {
      console.error('JSON parse error:', content);
      return res.status(500).json({ error: 'Invalid response format' });
    }
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: 'Failed to fetch specs' });
  }
}