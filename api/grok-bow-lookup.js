import OpenAI from 'openai';

export default async function handler(req, res) {
  const { model: userModel, debug } = req.query;
  const isDebug = !!debug || userModel === 'debug';

  if (!userModel && !isDebug) {
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;
  const debugInfo = {
    isDebugMode: isDebug,
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    nodeVersion: process.version,
    requestQuery: req.query,
    timestamp: new Date().toISOString(),
  };

  if (isDebug) {
    return res.status(200).json({
      status: 'debug',
      ...debugInfo,
      message: 'Debug mode active. If apiKeyLength > 0, key is loaded.',
    });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not loaded', debugInfo });
  }

  try {
    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    });

    const response = await openai.chat.completions.create({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        { role: 'user', content: `Test bow lookup for: ${userModel}` },
      ],
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;

    return res.status(200).json({
      success: true,
      response: content,
      debugInfo,
    });
  } catch (err) {
    debugInfo.error = err.message;
    debugInfo.errorStack = err.stack?.substring(0, 500);

    return res.status(500).json({
      error: 'xAI call failed',
      debugInfo,
    });
  }
}