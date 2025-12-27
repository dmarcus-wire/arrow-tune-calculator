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
          content: `You are an expert archery bow database. User gives a bow model (partial or full).

        Return ONLY valid JSON in this EXACT structure. Nothing else. No explanations, no markdown.

        {
          "ambiguous": boolean,
          "matches": [
            {
              "full_name": string,
              "year": string or null,
              "type": "compound" or "recurve" or "longbow",
              "ibo": number or null,
              "brace": number or null,
              "cam": string or null
            }
          ],
          "clarification": string or null
        }

        Rules:
        - If input is partial/family name (e.g., "hoyt rx9", "mathews lift", "pse evo"), ALWAYS set "ambiguous": true and return 4-6 variants.
        - ALWAYS include the base/standard model as the FIRST item if it exists.
        - Use real manufacturer data (Hoyt, Mathews, PSE, etc.).
        - If exact single match: "ambiguous": false, one item in matches.
        - If no match: { "error": "not found" }

        Examples:

        Input: "hoyt rx9"
        Output:
        {
          "ambiguous": true,
          "matches": [
            {"full_name": "Hoyt RX-9 (standard)", "year": "2025", "type": "compound", "ibo": 342, "brace": 6.125, "cam": "HBX Gen 4"},
            {"full_name": "Hoyt RX-9 Ultra", "year": "2025", "type": "compound", "ibo": 345, "brace": 6.75, "cam": "HBX Gen 4"},
            {"full_name": "Hoyt RX-9 SD", "year": "2025", "type": "compound", "ibo": 338, "brace": 6.0, "cam": "HBX SD"},
            {"full_name": "Hoyt RX-9 LD", "year": "2025", "type": "compound", "ibo": 340, "brace": 7.0, "cam": "HBX Gen 4"},
            {"full_name": "Hoyt RX-9 Max", "year": "2025", "type": "compound", "ibo": 348, "brace": 6.5, "cam": "HBX Gen 4"}
          ],
          "clarification": "Which RX-9 variant do you have?"
        }

        Input: "mathews lift"
        Output: similar structure with Lift X 29.5, Lift X 33, Lift XD, Lift RS, etc.

        Output ONLY the JSON.`
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