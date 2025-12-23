export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { model: userModel, debug } = req.query;
  const isDebug = !!debug;

  const apiKey = process.env.XAI_API_KEY;
  const debugInfo = {
    isDebugMode: isDebug,
    apiKeyLoaded: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    nodeVersion: process.version,
    queryParams: req.query,
    timestamp: new Date().toISOString(),
  };

  if (isDebug) {
    return res.status(200).json({
      status: 'debug',
      ...debugInfo,
      message: 'Debug mode active. apiKeyLength > 0 means env var loaded.',
    });
  }

  if (!userModel) {
    return res.status(400).json({ error: 'Missing bow model', debugInfo });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not loaded', debugInfo });
  }

  try {
    const fetchUrl = 'https://api.x.ai/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'User-Agent': 'ArrowForge/1.0 (Vercel)',
    };

    const body = JSON.stringify({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        {
          role: 'system',
          content: `You are an archery bow spec lookup assistant. User input: "${userModel}" (partial/ambiguous OK).

Use web_search and browse_page tools to fetch accurate specs from manufacturer sites (hoyt.com, mathewsinc.com) or reliable sources.

Return ONLY valid JSON (no text outside {}, no markdown, no intro/outro):
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
  "clarification": short string (max 100 chars, only if ambiguous) like "Which year/model?"
}

Rules:
- If one clear match, ambiguous=false, matches=[single object]
- If ambiguous, ambiguous=true, matches=2–5 best options
- If nothing found, { "error": "not found" }
- Output pure JSON only. No explanations.`,
        },
        {
          role: 'user',
          content: `Find specs for bow model: ${userModel}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
      tools: [
        {
          type: "function",
          function: {
            name: "web_search",
            description: "Search the web for bow specs",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query" },
                num_results: { type: "integer", description: "Number of results (default 5)" }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "browse_page",
            description: "Browse a specific URL for details",
            parameters: {
              type: "object",
              properties: {
                url: { type: "string", description: "The URL to browse" },
                instructions: { type: "string", description: "Instructions for summarizer" }
              },
              required: ["url", "instructions"]
            }
          }
        }
      ]
    });

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `xAI API returned ${response.status}: ${errorText}`,
        debugInfo,
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim() || '';

    let specs;
    try {
      specs = JSON.parse(content);
    } catch {
      specs = { raw: content, warning: 'Model did not return pure JSON' };
    }

    return res.status(200).json({
      success: true,
      ...specs,
      debugInfo,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal error: ' + err.message,
      debugInfo,
    });
  }
}