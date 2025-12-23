export default async function handler(req, res) {
  const { model, debug } = req.query;
  const isDebug = !!debug || model === 'debug'; // Trigger debug mode

  if (!model && !isDebug) {
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;

  // Prepare debug info
  const debugInfo = {
    isDebugMode: isDebug,
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    nodeVersion: process.version,
    requestQuery: req.query,
    timestamp: new Date().toISOString(),
  };

  if (isDebug) {
    // Debug mode: return info without calling xAI
    return res.status(200).json({
      status: 'debug',
      ...debugInfo,
      message: 'Debug mode active. Env var loaded correctly if apiKeyLength > 0.',
    });
  }

  // Normal mode: proceed with xAI call
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
    };

    // Add debug info about headers (without leaking full key)
    debugInfo.authorizationPreview = headers.Authorization.substring(0, 20) + '...';

    const body = JSON.stringify({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        { role: 'user', content: `Test lookup for: ${model}` },
      ],
      temperature: 0.1,
    });

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body,
    });

    debugInfo.xaiStatus = response.status;
    debugInfo.xaiStatusText = response.statusText;

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

    return res.status(200).json({
      success: true,
      response: data,
      debugInfo,
    });

  } catch (err) {
    debugInfo.fetchError = err.message;

    return res.status(500).json({
      error: 'Fetch failed',
      debugInfo,
    });
  }
}