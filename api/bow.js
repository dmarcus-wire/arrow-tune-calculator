import OpenAI from 'openai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('[OPTIONS] Preflight request received');
    return res.status(200).end();
  }

  console.log('[REQUEST] Received request for bow lookup');

  const { model: userModel } = req.query;
  console.log('[QUERY] userModel:', userModel);

  if (!userModel) {
    console.warn('[VALIDATION] Missing bow model');
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;
  console.log('[ENV] XAI_API_KEY present:', !!apiKey);
  console.log('[ENV] API key length:', apiKey ? apiKey.length : 'undefined');

  if (!apiKey) {
    console.error('[ERROR] XAI_API_KEY is missing or empty');
    return res.status(500).json({ error: 'API key not loaded' });
  }

  try {
    console.log('[OPENAI] Initializing client');

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    });

    console.log('[OPENAI] Creating completion request');
    console.log('[OPENAI] Model:', 'grok-4-1-fast-reasoning');
    console.log('[OPENAI] User model input:', userModel);

    const completion = await openai.chat.completions.create({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        {
          role: 'system',
          content: `You are an archery bow spec lookup assistant. User input: "${userModel}" (may be partial or ambiguous).

**MANDATORY RULE**: 
- ALWAYS return the **base/standard model** as the first match if the query is for a family/line (e.g., "hoyt rx9", "mathews lift", "pse evo").
- Then list 3–6 other variants (different years, trims like Ultra/SD/LD/Max, draw lengths, etc.).
- Do NOT skip the standard/base model — it must be included unless the user specifies a trim (e.g., "rx9 ultra").
- If the input is extremely specific (e.g., "2025 Hoyt RX-9 Ultra 31"), then ambiguous=false and return only that one.
- If no match at all: { "error": "not found" }

Return ONLY valid JSON. No text outside {}. No markdown, no intro/outro.

Structure:
{
  "ambiguous": boolean,
  "matches": [
    {
      "full_name": "Hoyt RX-9 (standard)",
      "year": "2025",
      "type": "compound",
      "ibo": number or null,
      "brace": number or null,
      "cam": string or null
    }
  ],
  "clarification": "Which variant do you have? (e.g., standard, Ultra, SD, LD, Max?)"  // always include if ambiguous
}

Examples:
- Input: "hoyt rx9" → ambiguous: true, matches: start with "Hoyt RX-9 (standard)", then Ultra, SD, LD, Max, etc.
- Input: "mathews lift" → ambiguous: true, include standard Lift first, then variants.
- Input: "2025 hoyt rx-9 ultra" → ambiguous: false, matches: [one exact object]

Output pure JSON only.`
        },
        {
          role: 'user',
          content: `Find specs for bow model: ${userModel}`
        }
      ],
      temperature: 0.0,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    console.log('[OPENAI] Completion received');
    console.log('[OPENAI] Choices count:', completion.choices?.length);

    const content = completion.choices[0].message.content.trim();
    console.log('[OPENAI] Raw content length:', content.length);
    console.log('[OPENAI] Raw content preview:', content.substring(0, 200) + '...');

    let specs;
    try {
      specs = JSON.parse(content);
      console.log('[PARSE] JSON parsed successfully');
    } catch (parseErr) {
      console.error('[PARSE] Failed to parse JSON:', parseErr.message);
      specs = { error: 'Invalid JSON from model', raw: content };
    }

    console.log('[RESPONSE] Sending successful JSON');
    return res.status(200).json(specs);
  } catch (err) {
    console.error('[ERROR] Function failed:', err.message);
    console.error('[ERROR] Stack trace:', err.stack);
    console.error('[ERROR] Full error object:', JSON.stringify(err, null, 2));

    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}