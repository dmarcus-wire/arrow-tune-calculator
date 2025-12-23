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

  // Debug info
  const apiKey = process.env.XAI_API_KEY;
  const debugInfo = {
    isDebugMode: isDebug,
    apiKeyLoaded: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    nodeVersion: process.version,
    queryParams: req.query,
    timestamp: new Date().toISOString(),
    requestUrl: req.url,
    requestMethod: req.method,
  };

  // Debug mode
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

    debugInfo.authorizationPreview = headers.Authorization.substring(0, 20) + '...';

    const body = JSON.stringify({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        {
          role: 'system',
          content: `You are an archery bow spec lookup assistant. User input: "${userModel}" (partial/ambiguous OK).

Use web_search and browse_page tools to fetch accurate specs from manufacturer sites (hoyt.com, mathewsinc.com) or reliable sources.

Return ONLY valid JSON (no text outside {}):
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
- Output pure JSON only`,
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
          name: "web_search",
          description: "Search the web for bow specs",
          input_schema: {
            type: "object",
            properties: {
              query: { type: "string", description: "The search query" },
              num_results: { type: "integer", description: "Number of results (default 5)" }
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
    });

    debugInfo.requestBodyPreview = body.substring(0, 200) + '...';

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body,
    });

    debugInfo.xaiStatus = response.status;
    debugInfo.xaiStatusText = response.statusText;
    debugInfo.xaiHeaders = Object.fromEntries(response.headers.entries());

    if (!response.ok) {
      const errorText = await response.text();
      debugInfo.xaiErrorBody = errorText;
      return res.status(response.status).json({
        error: `xAI API returned ${response.status}`,
        debugInfo,
      });
    }

    const data = await response.json();
    debugInfo.xaiResponsePreview = JSON.stringify(data, null, 2).substring(0, 500) + '...';

    const content = data.choices[0]?.message?.content?.trim() || '';

    return res.status(200).json({
      success: true,
      responseContent: content || '(No content returned)',
      debugInfo,
    });
  } catch (err) {
    debugInfo.fetchError = err.message;
    debugInfo.errorStack = err.stack?.substring(0, 500);

    return res.status(500).json({
      error: 'Internal error during fetch',
      debugInfo,
    });
  }
}