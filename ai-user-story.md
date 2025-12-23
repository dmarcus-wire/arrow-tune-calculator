# AI User Story

## User Scenario 1: Clicks AI Advisor button to prefill bow data

1. Clicks "AI Advisor" or a "Lookup Bow" button
1. User types bow model (e.g., "2025 Hoyt RX-9" or hoyt)
1. AI searches web/manufacturer data → returns specs
1. Auto-fills: Bow Type, IBO, Brace Height, Cam System

Prompt Structure: Use this as the system/user prompt in your API call
```sh
You are an archery bow spec lookup assistant. The user provided a partial bow model name: "{user_input}" (e.g., "hoyt rx").

Your task:
1. Use web search and browsing tools to find the most relevant Hoyt RX-series (or similar) compound bow models.
2. Prioritize recent/current models (2024–2026+), manufacturer sites (hoyt.com), and reliable archery sources.
3. If the input is ambiguous or partial, identify 2–5 closest matches (e.g., Carbon RX-9, Carbon RX-10, Carbon RX-8, etc.) with their likely years or variants.
4. Return ONLY a JSON object with:
   - "ambiguous": true/false
   - "matches": array of objects like { "full_name": "2025 Hoyt Carbon RX-9", "year": "2025", "type": "compound", "ibo": 342, "brace": 6.125, "cam": "HBX Gen 4" }  (use real specs from search; use "unknown" if not found)
   - "clarification": short string (max 100 chars) like "Which model/year do you have? Here are the closest matches:" (only if ambiguous)
   - "selected_specs": null  (do not auto-select; wait for user confirmation)

If only one clear match, set ambiguous=false and provide specs directly (still in "matches" as single item).
Do not add explanations, chit-chat, or extra text—output pure JSON only.
```

Handing ambigous prompts:

Your frontend can parse this JSON:
- If ambiguous: true, show the clarification message + a dropdown/list of matches for user to select.
- Once selected, re-query the API with the chosen full name (or add a new param like ?selected=2025 Hoyt Carbon RX-9).
 -If ambiguous: false, auto-prefill fields.

```sh
{
  "ambiguous": true,
  "matches": [
    { "full_name": "2025 Hoyt Carbon RX-9", "year": "2025", "type": "compound", "ibo": 342, "brace": 6.125, "cam": "HBX Gen 4" },
    { "full_name": "2026 Hoyt Carbon RX-10", "year": "2026", "type": "compound", "ibo": 340, "brace": 6.125, "cam": "HBX Gen 4" },
    { "full_name": "2024 Hoyt Carbon RX-8", "year": "2024", "type": "compound", "ibo": 340, "brace": 6.75, "cam": "HBX" }
  ],
  "clarification": "Which year/model for accurate specs?",
  "selected_specs": null
}
```

Keeps Conversation Tight:

 -Structured JSON-only output prevents rambling—model can't add fluff.
- No multi-turn in one call—it either resolves or asks for confirmation via the clarification field.
- Frontend controls flow—user picks from list → one follow-up query → specs prefilled.
- Edge cases (e.g., very obscure partial like "hoyt old rx") → returns empty matches or "unknown" + clarification.
- Add known hard-coded matches (from your code) as a fallback before/after API call.
- If the model hallucinates a non-existent model, the JSON structure makes it easy to filter (e.g., cross-check against hoyt.com via tools).
- Test with partials: "hoyt rx", "rx9", "carbon rx", "mathews lift" (should resolve to one if clear).

AI Advisor: Prefills 4x Bow Data fields by scraping the web.
```
I found the 2025 Hoyt RX-9 — great choice for hunting!

I’ve pre-filled these specs from official data:
• Bow Type: Compound
• IBO Speed: 340 fps
• Brace Height: 6.375 in
• Cam System: Hybrid

These values will now power all calculations. Feel free to adjust draw weight or length to match your setup.

Ready to build arrows? Try asking: "What arrows should I shoot for elk?"

(Then auto-fill the bow fields.)
```

User Scenario 2: What arrows should I shoot?
- User has a completed bow section
- Build Summary Table:
- Build Name	2025-12-19 2025 Hoyt Rx9 Hunting Setup
- Application	Hunting
- Bow Model	2025 Hoyt Rx9
- Bow Type	compound
- IBO Speed	340 fps
- Draw Weight	70 lb
- Draw Length	28 in
- Let-off	85%
- Brace Height	6.375 in
- Cam System	hybrid
- Range	50 yd

AI Advisor: Suggest 3 arrow configurations (Light/Fast, Balanced, Heavy/Stable) using 50 yards as the distance unless the range slider is moved to a different distance. The user can select a card and have it prefill the arrow fields for them to play with and save. The other 2 suggested arrows get cached for later
```
Here are 3 optimized arrow builds for your Hoyt RX-9 (70 lb, 28" draw) at 50 yards:

**1. Light/Fast — Max Speed & Flat Trajectory**
- Spine: 300
- Diameter: Micro (~4mm)
- Length: 28.5 in
- Total Weight: ~440 gr
- Point: 100 gr
- Estimated Speed: ~295 fps
- Best for: Long-range shots, 3D, quick recovery

**2. Balanced — All-Around Hunting Performance** ← Recommended
- Spine: 250
- Diameter: Small (~5mm)
- Length: 28.5 in
- Total Weight: ~495 gr
- Point: 125 gr
- Estimated Speed: ~282 fps
- Best for: Elk/deer, ethical kills, wind resistance

**3. Heavy/Stable — Deep Penetration**
- Spine: 200
- Diameter: Standard (~6.5mm)
- Length: 28.5 in
- Total Weight: ~540 gr
- Point: 175 gr (fixed or heavy mechanical)
- Estimated Speed: ~270 fps
- Best for: Moose, bear, tough angles

Which one would you like to load and tweak?
[Load Light/Fast] [Load Balanced] [Load Heavy/Stable]
```

User Scenario 3: How can I improve my arrow build?

AI Advisor: AI reviews the users inputs and make suggestions, from low hanging fruit like a different point or nock weight shifting the FOC and total weight to total shaft swap for a different spine stiffness.
```
Your current setup: Black Eagle Rampage 300, 504 gr total, 150 gr point, ~19% FOC — solid heavy hunting build.

Strengths:
• Excellent momentum for penetration
• High FOC for stability
• Good for tough game (elk+)

Opportunities for improvement:

1. **Slightly lighter point (125 gr)**  
   → Drops total weight to ~479 gr  
   → +6–8 fps (flatter trajectory)  
   → Still 17%+ FOC — great balance

2. **Lighter nock/insert combo**  
   → Save 10–15 gr in rear  
   → Boost FOC closer to 20%  
   → Better front-heavy flight

3. **Switch to micro-diameter shaft (e.g., Rampage .204)**  
   → Less wind drift at 50+ yd  
   → Same weight, better long-range accuracy

Want me to load one of these tweaks for you to test?
[Tweak 1: 125 gr point] [Tweak 2: Lighter rear] [Tweak 3: Micro shaft]
```

Solution: a structured, consistent AI Advisor system that will deliver predictable, high-value outcomes for all three scenarios.

## Core AI Advisor Principles:

Always personalized — use user’s exact inputs (bow model, draw weight, app type, range).
3 options when suggesting builds — Light/Fast, Balanced, Heavy/Stable.
Clear reasoning — explain why each option fits (speed vs penetration vs forgiveness).
Actionable — include "Load this build" button for one-click prefill.
Cache other suggestions — store the other two for quick access later.

## Implementation Tips

Use prompt templates with user data injected.
Cache the 3 suggested builds in localStorage for "Recall last suggestions" button.
"Load this build" → prefill arrow fields.

## Implementation Plan

Client-side JS sends model name to a serverless function (Vercel/Netlify function).
Function uses OpenAI to "search" known bow data or scrape manufacturer sites (or use a pre-built bow database).
Returns structured JSON → app fills fields.

Quick MVP: Hard-code common bows first, then add AI lookup.

```
const knownBows = {
  "2025 hoyt rx-9": {
    type: "compound",
    ibo: 340,
    brace: 6.375,
    cam: "hybrid"
  },
  "mathews lift": {
    type: "compound",
    ibo: 348,
    brace: 6,
    cam: "switchweight"
  },
  // add more as you go
};
```

## 1. AI-Powered Build Optimizer

- Users input their bow specs, hunting goals (e.g., "elk penetration at 50 yards"), and budget.
- AI suggests 3–5 optimized arrow builds (spine, weight, FOC, components) with pros/cons, estimated FPS, and drift/drop predictions.
- Integration: Use Grok API for recommendations (proxy through your Vercel server with your key — no user setup).
- User benefit: Saves time/money on trial-and-error; "Load this build" button pre-fills fields.
- Monetization: Free for basic (3 options), paid for premium (unlimited + explanations).

## 2. AI Tuning Advisor (Natural Language Chat)

- Add a chat box where users ask questions like "How to improve penetration?" or "Fix my weak spine?"
- AI analyzes current build (from app data) and gives step-by-step advice, with links to popup explanations or external resources.
- Integration: Grok API for chat (server-side, your key). - Cache responses offline for common queries.
User benefit: Feels like a pro coach; great for beginners without overwhelming tech.
Monetization: Free daily quota (5 queries), paid unlimited.

## 3. AI Training & Practice Planner

- Input skill level, goals (e.g., "hunt elk in 3 months"), and current setup.
- AI generates a personalized 4–8 week plan with drills, shot distances, and progress tracking (e.g., "Week 1: 20 yd groups, focus on form").
- Integration: Grok API for plan generation, app tracks progress offline.
- User benefit: Turns the app into a full training companion, motivating consistent practice.
- Monetization: Paid feature with progress reports and reminders.

## 4. AI Wind & Trajectory Simulator

- Users input weather (wind, temp), terrain, and setup — AI simulates real-time drift/drop for the shot.
- Suggests holdover or "pass on shot" if too risky.
- Integration: Grok API for advanced simulation (use your key server-side).
- User benefit: Helps in-field decisions; "What if" scenarios for different arrows.
- Monetization: Free basic, paid for detailed reports.

5. AI Pro Comparison Tool

- Compare user's build to pro profiles (e.g., "Cameron Hanes heavy hunter").
- AI highlights differences and suggests tweaks (e.g., "Add 50 gr point to match his FOC").
- Integration: Hard-coded pros + Grok API for dynamic comparisons.
- User benefit: Inspires users with real-world examples; "How do I stack up?"
- Monetization: Free for basic pros, paid for premium/custom comparisons.

## To implement this without user tech setup:

- Use your own Grok API key in a server-side proxy (Vercel function) — users just click, no keys needed.
- Offline fallback — hard-coded for common cases, AI for advanced.
- Pricing model: Free core app, $4.99/mo "AI Pro" for unlimited features (use Stripe or Patreon).