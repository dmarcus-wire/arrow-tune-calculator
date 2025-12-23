export default async function handler(req, res) {
  const { model: userModel, debug } = req.query;
  const isDebug = !!debug;

  // Collect debug info from the start
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

  // Debug mode: return immediately with info
  if (isDebug) {
    return res.status(200).json({
      status: 'debug',
      ...debugInfo,
      message: 'Debug mode active. Check apiKeyLength > 0 for env var success.',
    });
  }

  // Normal mode: require model
  if (!userModel) {
    return res.status(400).json({
      error: 'Missing bow model',
      debugInfo,
    });
  }

  // Check API key
  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not loaded in runtime',
      debugInfo,
    });
  }

  try {
    const fetchUrl = 'https://api.x.ai/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'User-Agent': 'ArrowForge-Debug/1.0 (Vercel)',
    };

    debugInfo.authorizationPreview = headers.Authorization.substring(0, 20) + '...';

    const body = JSON.stringify({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        {
          role: 'system',
          content: 'You are a test assistant.',
        },
        {
          role: 'user',
          content: `Test from Vercel debug: bow model ${userModel}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 50,
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