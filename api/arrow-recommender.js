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
    bowType = 'compound',
    arrowLen = drawLen + 0.5,
    pointWt = 125
  } = req.query;

  if (!bowModel && !bowType) {
    return res.status(400).json({ error: 'Missing bowModel or bowType' });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not loaded' });

  try {
    const openai = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });

    const systemPrompt = `
You are an expert archery arrow recommendation assistant.

Recommend exactly 3 real-world arrows for the user's bow setup, categorized as:
1. Light/Fast — prioritizes speed and flat trajectory
2. Balanced — best all-around performance
3. Heavy — maximizes penetration and momentum

User inputs:
- Bow Type: ${bowType} (compound, recurve, or longbow) — THIS IS CRITICAL
- Application: ${appType}
- Bow Model: ${bowModel || 'generic'}
- Draw Length: ${drawLen} inches
- Draw Weight: ${drawWt} lb
- Arrow Length: {{arrowLen}} inches (critical for spine)
- Point Weight: {{pointWt}} grains (critical for spine)

SPINE SELECTION RULES (especially for compound):
- Heavier point weight or longer arrow → weakens dynamic spine → recommend STIFFER spine (lower number)
- Lighter point or shorter arrow → recommend weaker spine (higher number)
- 70 lb / 28": Light/Fast ~300–340, Balanced ~280–320, Heavy ~250–280
- 60 lb / 30": shift ~30–50 spine weaker
- 80 lb / 29": shift ~30–50 spine stiffer

IMPORTANT: Choose arrow brands and models that are realistic and popular for the bow type:
- COMPOUND: Easton (Axis, FMJ, 5mm), Victory (RIP, VAP), Gold Tip (Airstrike, Hunter), Black Eagle (X-Impact), Iron Will (RIP TKO), Day Six, Altra, Bishop
- RECURVE: Easton (X10, Carbon One, A/C/E), Victory (VForce), Gold Tip (Traditional), Black Eagle (PS23, Instinct), Carbon Express (Heritage)
- LONGBOW / Traditional: Gold Tip Traditional, Black Eagle Instinct, Easton Legacy, 3Rivers Traditional Only, Big Jim's Dark Timbers

Best practices:
- Hunting compound: FOC 12–18%, GPP 6.5–7.5, GPI 7–9.5, FPS ≥ 270
- Target: lighter arrows, lower GPI (6–8.5), higher FPS
- Traditional (recurve/longbow): heavier arrows, GPI 9–12+, FOC 15–22%

Always use real, current arrow models with accurate specs.
Prioritize well-known, readily available arrows.

Return ONLY valid JSON in this exact format:
{
  "matches": [
    {
      "full_name": "Full arrow name with spine",
      "year": "Current or 2025",
      "arrowLength": "Recommended cut length",
      "foc": "FOC % (number or range)",
      "gpp": "GPP (number or range)",
      "gpi": "GPI",
      "stiffness": "Spine number",
      "arrowDia": "e.g., '.204 in', 'micro', '5mm', 'standard'",
      "why": "Brief reason why this fits the bow type and category"
    }
    // ... two more
  ]
}
`;

    const userMessage = `Recommend 3 arrows (Light/Fast, Balanced, Heavy) for a ${bowType} bow used for ${appType}. 
Bow: ${bowModel || 'generic'}, Draw weight: ${drawWt} lb, Draw length: ${drawLen} inches.`;

    const completion = await openai.chat.completions.create({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content.trim();
    let data = JSON.parse(content);

    // Fallback if AI fails (now bow-type aware)
    if (!data.matches || data.matches.length !== 3) {
      const isTraditional = ['recurve', 'longbow'].includes(bowType.toLowerCase());
      const isTarget = appType.toLowerCase() === 'target';

      data = { matches: [] };

      if (isTraditional) {
        data.matches = [
          { full_name: "Gold Tip Traditional XT 400", year: "Current", arrowLength: (parseFloat(drawLen) + 1).toFixed(1), foc: "16", gpp: "8.5", gpi: "10.0", stiffness: "400", arrowDia: "standard", why: "Light/fast traditional carbon" },
          { full_name: "Black Eagle Instinct 350", year: "Current", arrowLength: (parseFloat(drawLen) + 1).toFixed(1), foc: "17", gpp: "9.0", gpi: "10.8", stiffness: "350", arrowDia: ".244 in", why: "Balanced for recurve/longbow hunting" },
          { full_name: "Easton Legacy 300", year: "Current", arrowLength: (parseFloat(drawLen) + 1).toFixed(1), foc: "18", gpp: "9.5", gpi: "11.5", stiffness: "300", arrowDia: "standard", why: "Heavy for maximum penetration on traditional bows" }
        ];
      } else if (isTarget) {
        data.matches = [
          { full_name: "Easton X10 450", year: "Current", arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1), foc: "12", gpp: "6.5", gpi: "7.2", stiffness: "450", arrowDia: ".204 in", why: "Light/fast for maximum distance" },
          { full_name: "Victory VAP V1 500", year: "Current", arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1), foc: "11", gpp: "6.2", gpi: "6.8", stiffness: "500", arrowDia: ".166 in", why: "Ultra-small diameter target arrow" },
          { full_name: "Easton A/C/E 520", year: "Current", arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1), foc: "13", gpp: "6.8", gpi: "7.5", stiffness: "520", arrowDia: "small", why: "Proven heavy target shaft" }
        ];
      } else {
        // Default compound hunting
        data.matches = [
          { full_name: "Victory RIP TKO Elite 300", year: "Current", arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1), foc: "14", gpp: "7.0", gpi: "8.1", stiffness: "300", arrowDia: ".204 in", why: "Light/fast small-diameter hunting arrow" },
          { full_name: "Easton Axis 5mm 340", year: "Current", arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1), foc: "15", gpp: "7.2", gpi: "9.0", stiffness: "340", arrowDia: "5mm", why: "Balanced all-around hunting performer" },
          { full_name: "Gold Tip Hunter XT 300", year: "Current", arrowLength: (parseFloat(drawLen) + 0.5).toFixed(1), foc: "16", gpp: "7.4", gpi: "9.5", stiffness: "300", arrowDia: "standard", why: "Heavy hitter for deep penetration" }
        ];
      }
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}