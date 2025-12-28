import OpenAI from 'openai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const {
    appType = 'Hunting',
    bowModel = '',
    drawLen = 28,
    drawWt = 70,
    totalWt = 0,
    pointWt = 125,
    arrowLen = 28.5,
    spine = 300,
    foc = 10
  } = req.query;

  if (!bowModel) {
    return res.status(400).json({ error: 'Missing bowModel' });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not loaded' });

  try {
    const openai = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });

    const isArrowDataMissing = totalWt <= 0 || arrowLen <= 0 || spine <= 0 || foc <= 0;

    const prompt = isArrowDataMissing
      ? `User has limited bow info: appType=${appType}, bowModel=${bowModel}, drawLen=${drawLen}", drawWt=${drawWt}.
        Suggest 2–3 general arrow recommendations for this bow setup.
        Return JSON with "status": "Generating general recommendations..."`
      : `User has full bow + arrow data: appType=${appType}, bowModel=${bowModel}, drawLen=${drawLen}", drawWt=${drawWt}, totalWt=${totalWt}, pointWt=${pointWt}, arrowLen=${arrowLen}, spine=${spine}, foc=${foc}.
        Analyze the setup and suggest 1–3 optimizations (e.g., change point weight, arrow length, spine) to hit ideal FOC/GPP/GPI.
        Return JSON with "status": "Optimizing your current setup..."`;

    const completion = await openai.chat.completions.create({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: `Suggest arrows or optimizations for: ${JSON.stringify(req.query)}`,
        }
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content.trim();
    const data = JSON.parse(content);

    // Ensure status is always present
    data.status = data.status || (isArrowDataMissing ? 'Generating general recommendations...' : 'Optimizing your current setup...');

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}