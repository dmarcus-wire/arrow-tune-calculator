# Arrow Tune Calculator – Complete Feature Roadmap (v2.0+)

                     10.4% 
                      |
FOC % (i)     [tail heavy][balanced][tip heavy]
                        7.1 gr
                         |
GPP (i)       [light][balanced][heavy]
                                 17.4 gr
                                   |
GPI (i)       [light][balanced][heavy]
                           495 gr
                              |
Total Wt      [light][medium][heavy]
                            Adjust
                              |
Stiffness (i) [stiff][good][weak]
                                5.99 ft
                                  |
Flatness (i)  [very flat][flat][curved]

                        |
Stability (i) [tight][average][unstable]


## 1. Mobile-First / PWA (Highest immediate ROI)
- Add `<meta name="apple-mobile-web-app-capable" content="yes">` + basic `manifest.json` → instantly installable as a home-screen app
- Larger touch targets on mobile (`font-size: 1rem`, `padding: 12px 16px`, `min-height: 48px`)
- Force single-column layout under 720 px (you already have most of this)
- Collapsible panels with swipe support (Saved Builds, Notes, Advanced Components)
- Floating “Last updated 3s ago” toast when scrolling
- Optional: prompt to add to home screen after 2 visits

## 2. Gear Presets Database (The #1 most-requested feature in archery)
```js
const PRESETS = {
  bows: {
    "2025 Hoyt RX-9 Ultra":     { ibo: 350 },
    "Mathews Lift 29.5":        { ibo: 348 },
    "PSE Evolve 33":            { ibo: 345 },
    // 30–50 current-year bows
  },
  arrows: {
    "Easton Axis 5MM 300":      { spine: 300, gpi_bare: 8.8 },
    "Victory VAP TKO 300":      { spine: 300, gpi_bare: 8.9 },
    "Gold Tip Airstrike 250":   { spine: 250, gpi_bare: 7.8 },
    // 50+ popular hunting & target shafts
  },
  points: {
    "Iron Will 125gr A2":       125,
    "Ethics 100gr stainless":   100,
    "QAD Exodus 100gr":         100,
    // 20+ common field points & broadheads
  }
};

→ Dropdowns auto-fill IBO, spine, bare-shaft GPI, point weight, etc.
→ Saves users 2–3 minutes every single build

```

## 3. Spine Chart Comparison Engine (Instant “best-in-class” status)

Hard-code 2024–2025 Easton, Victory, Gold Tip, Black Eagle spine charts
Uses: draw weight, draw length, arrow length, point weight
Output: recommended spine range + visual gauge
“Your 300 spine = Perfect / Slightly stiff / Too weak”
Place right next to the FOC gauge

## 4. Physics-Based Velocity Drop-Off (Replace current linear model)

```JavaScript
function velocityAtDistance(v0, yards, grains) {
  const bc = grains < 400 ? 0.0016 : grains < 550 ? 0.0018 : 0.0020;
  const v = v0 * Math.exp(-yards * 3 / (bc * 1092));  // matches real chrono data extremely well
  return Math.max(0, v);
}
```
→ Users immediately feel “this thing is accurate”

## 5. Shareable Build Links (Viral rocket fuel)
```JavaScript
// Save → generate ?build=base64(gzip(json))
const url = location.origin + location.pathname + '?build=' + compressed;
copy to clipboard + “Share this build” button

// On load → if URL contains ?build → auto-load it
```

→ One-click sharing on Facebook, Reddit, texts, forums

## 6. Print / PDF Export

One button → clean, beautiful single-page summary with all visuals, numbers, and notes
Uses @media print CSS + window.print()
Hunters print this and keep it in their bow case or truck

## 7. Kinetic Energy (KE) Bands – Finish & polish

Formula: KE = (grains × fps²) / 450240
Show launch KE + KE at farthest distance
Bands:
<10 ft-lbs → small game / practice
10–25 → light hunting
25–45 → deer / medium game
45–55 → elk / large-bodied game
55+ → big / dangerous game


## 8. Wind Drift Estimation
```JavaScript

drift_inches = (crosswind_mph * distance_yd² * 0.000095) / fps;

```

Optional wind speed input (0–20 mph)
Show drift at 40 yd & 60 yd in the trajectory section

## 9. Bow/Arrow Efficiency Ratio (Already in v1.0.5 – just polish UI)

Formula: (KE_launch / stored_energy) × 100
Stored energy ≈ (draw_weight × draw_length / 2) / 12 ft-lbs
Bands: <55% light/speed, 55–70% balanced, 70%+ heavy/quiet

## 10. AI-Powered Tuning Suggestions (Perfect Patreon tier)
Rule-based examples (start here):

“FOC 22.4% → extreme. Drop point weight 50–75 gr for better stability”
“480 gr at 292 fps → very quiet but 9" extra drop 20–60 yd. Try 430 gr for flatter arc”
“GPP 8.7 → heavy & quiet. Perfect for elk inside 50 yd”
→ Later upgrade to Grok API or tiny client-side model

## 11. Minor UX Polish (Low effort, massive perceived quality)

Auto-focus first empty field on load
Enter/Tab jumps to next logical field
Units toggle: grains ↔ grams, inches ↔ cm
Theme icon changes (moon ↔ sun)
“Copy all results” button (markdown table to clipboard)
“Last saved: 2 min ago” indicator
Small diagram tooltip showing exact balance-point measurement (nock throat → insert face)

## 12. Dream Features (When you want to own the niche forever)

Real-time pin gap calculator (20-30-40-50-60 yd gaps)
Noise/quietness score (based on GPP + brace height + string material)
Step-by-step tuning checklist (bare shaft → paper tune → walk-back)
Import from OnTarget2!, Archer’s Mark, or Garmin Xero chrono files

## Rank,Feature,Effort,Impact,Notes

Rank,Feature,Effort,Impact,Notes
1,PWA + mobile polish,1–2 days,★★★★★,Instant pro feel
2,30–50 gear presets,2 days,★★★★★,Users will love you forever
3,Shareable ?build= links,1 day,★★★★★,Viral growth on social media
4,Print/PDF export,0.5 day,★★★★,Hunters print everything
5,Spine chart + recommendation,3–4 days,★★★★★,Becomes the #1 tuning tool on the internet
6,Physics-based velocity drop,1 day,★★★★,Feels “real” instantly
7,Wind drift + polished KE bands,1 day,★★★,Nice hunting extras
8,Rule-based AI suggestions,2–3 days,★★★★,Perfect Patreon perk
