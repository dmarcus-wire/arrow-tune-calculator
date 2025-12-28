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
    drawWt = 70
  } = req.query;

  if (!bowModel) return res.status(400).json({ error: 'Missing bowModel' });

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not loaded' });

  try {
    const openai = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });

    const systemPrompt = `
You are an archery arrow recommendation assistant for hunters.

ALWAYS return exactly 3 real-world arrow recommendations for the user's bow setup, categorized as:
1. Light/Fast
2. Balanced
3. Heavy

User inputs: appType="${appType}", bowModel="${bowModel}", drawLen=${drawLen}, drawWt=${drawWt}.

Best practices for hunting:
- FOC: 12–18%
- GPP: 6.5–7.5
- GPI: 7–9.5
- FPS >= 270

Use real arrows from brands like Easton, Gold Tip, Victory, Black Eagle, etc. Pull accurate specs (spine, inside diameter/ID, recommended length, etc.).

Return ONLY valid JSON:
{
  "ambiguous": true,
  "matches": [
    {
      "full_name": "Arrow full name",
      "year": "Year",
      "type": "Hunting",
      "arrowLength": "Recommended cut length (inches)",
      "foc": "FOC %",
      "gpp": "GPP",
      "gpi": "GPI",
      "stiffness": "Spine",
      "arrowDia": "Inside diameter (ID) or category (e.g., .204 in, micro, small, standard)",
      "why": "Reason why it fits"
    }
  ],
  "clarification": "Select an arrow to auto-fill"
}

- ALWAYS include "arrowDia" (e.g., ".204 in", "micro", "small", "standard").
- Ensure all 3 meet best practices.
- arrowLength: drawLen + 0.5 to 1 inch.
- Output pure JSON only.`;

    const completion = await openai.chat.completions.create({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Recommend 3 arrows (light/fast, balanced, heavy) for ${bowModel}, ${drawWt} lb, ${drawLen} in, ${appType}` }
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content.trim();
    let data = JSON.parse(content);

    // Force 3 matches with arrowDia if AI fails
    if (!data.matches || data.matches.length !== 3) {
      data = {
        ambiguous: true,
        matches: [
          {
            full_name: "Victory RIP TKO Elite 300",
            year: "2025",
            type: "Hunting",
            arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1),
            foc: "13-15",
            gpp: "6.7-7.2",
            gpi: "7.2",
            stiffness: "300",
            arrowDia: ".204 in (small)",  // Added
            why: "Light/fast option with small diameter for speed and penetration"
          },
          {
            full_name: "Easton Axis 5mm 340",
            year: "2025",
            type: "Hunting",
            arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1),
            foc: "12-15",
            gpp: "6.8-7.2",
            gpi: "9.0",
            stiffness: "340",
            arrowDia: "5mm (micro)",  // Added
            why: "Balanced choice for speed, durability, and wind resistance"
          },
          {
            full_name: "Gold Tip Hunter XT 300",
            year: "2025",
            type: "Hunting",
            arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1),
            foc: "14-17",
            gpp: "7.0-7.5",
            gpi: "9.5",
            stiffness: "300",
            arrowDia: ".246 in (standard)",  // Added
            why: "Heavy option for maximum momentum and penetration"
          }
        ],
        clarification: "Select an arrow to auto-fill"
      };
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}