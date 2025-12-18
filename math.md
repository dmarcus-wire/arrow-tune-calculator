# ArrowForge — Complete Math & Formulas Reference

*All calculations used in the Arrow Tune Calculator (as of v0.0.15)*

This document explains every formula in the app with real-world examples using a typical hunting setup.

---

## Example Setup Used for Calculations

| Parameter               | Value          |
|-------------------------|----------------|
| Draw Weight (DW)        | 70 lb          |
| Arrow Length (L)        | 28.5 in        |
| Balance Point (BP)      | 17.2 in        |
| Total Arrow Weight (W)  | 495 gr         |
| Point Weight            | 125 gr         |
| Launch Speed (FPS₀)     | 278 fps        |
| Range to Target         | 50 yd          |

---

## 1. GPP — Grains Per Pound

**Raw Equation**  
GPP = Total Arrow Weight ÷ Draw Weight

**Example**  
GPP = 495 ÷ 70 = **7.1**

**Influencing Fields**  
- Total Arrow Weight (primary — heavier = higher GPP)  
- Draw Weight (higher = lower GPP)  
- Indirect: Point weight, inserts, fletching, wraps, glue

**Sweet Spot (highlighted in green)**  
- Compound/Hunting: 6.5–7.5  
- Target: 6.0–8.0  
- Recurve/Longbow: 7.5–9.5  

---

## 2. GPI — Grains Per Inch

**Raw Equation**  
GPI = Total Arrow Weight ÷ Arrow Length

**Example**  
GPI = 495 ÷ 28.5 = **17.4 gr/in**

**Influencing Fields**  
- Total Arrow Weight (primary — heavier = higher GPI)  
- Arrow Length (longer = lower GPI)  
- Indirect: Shaft material, wall thickness, diameter, point/insert weight

**Sweet Spot (highlighted in green)**  
- Compound/Hunting: 7–9.5  
- Target: 6–8.5  
- Recurve/Longbow: 9–12  

---

## 3. FOC — Front of Center

**Raw Equation**  
FOC% = ((Balance Point − Arrow Length / 2) ÷ Arrow Length) × 100

**Step-by-Step**  
1. Midpoint = 28.5 ÷ 2 = 14.25 in  
2. Forward distance = 17.2 − 14.25 = 2.95 in  
3. FOC% = (2.95 ÷ 28.5) × 100 = **10.4%**

**Influencing Fields**  
- Balance Point (primary — farther forward = higher FOC)  
- Arrow Length (longer = lower FOC)  
- Indirect: Point/insert/outsert weight (heavier forward = higher FOC)

**Sweet Spot (highlighted in green)**  
- Compound/Hunting: 12–18%  
- Target: 10–14%  
- Recurve/Longbow: 15–22%  

---

## 4. Effective Draw Weight (for Spine Recommendation)

**Raw Equation**  
Effective Load = Draw Weight  
+ (Arrow Length − 28) × 2.5  
+ (Point Weight − 100) × 0.15  
+ (Total Arrow Weight − 400) × 0.05

**Step-by-Step**  
1. Length factor = (28.5 − 28) × 2.5 = +1.25  
2. Point factor = (125 − 100) × 0.15 = +3.75  
3. Weight factor = (495 − 400) × 0.05 = +4.75  
4. Effective Load = 70 + 1.25 + 3.75 + 4.75 = **80 lb**

**Influencing Fields**  
- Draw Weight (primary)  
- Arrow Length (longer = higher load)  
- Point Weight (heavier = higher load)  
- Total Arrow Weight (heavier = higher load)

---

## 5. Stiffness / Spine Recommendation

**Raw Equation**  
Recommended Spine Center = 600 − (Effective Load × 5)

**Example**  
Recommended Center = 600 − (80 × 5) = **200**

**Comparison**  
Actual Spine = 300 → Difference = +100 → "Weaker"

**Influencing Fields**  
- Effective Draw Weight (primary — higher = needs stiffer spine)  
- Indirect: Draw weight, arrow length, point weight, total weight

**Bar Direction**  
Left = Stiff / Stiffer / Stiffest  Right = Weak / Weaker / Weakest

---

## 6. Kinetic Energy (KE)

**Raw Equation**  
KE (ft-lbs) = (Total Weight × Velocity²) / 450240

**Launch KE Example**  
KE₀ = (495 × 278²) / 450240 ≈ **84.0 ft-lbs**

**Influencing Fields**  
- Total Arrow Weight (higher = higher KE)  
- Velocity (higher = much higher KE — squared)  
- Indirect: Bow power, arrow efficiency

**Constant Origin**  
450240 = 2 × gravity × grains per pound

---

## 7. Momentum

**Raw Equation**  
Momentum (slug·ft/s) = (Total Weight × Velocity) / 225400

**Launch Momentum Example**  
Momentum₀ = (495 × 278) / 225400 ≈ **0.610**

**Influencing Fields**  
- Total Arrow Weight (higher = higher momentum)  
- Velocity (higher = higher momentum)

**Constant Origin**  
225400 = 450240 / 2

---

## 8. Velocity Retention & Decay

**Raw Equation**  
Retention = e^(-k × Range / Total Weight)  
Impact Velocity = Launch FPS × Retention  
k = 0.532 (calibrated from real hunting arrow data)

**Example at 50 yd**  
Retention = e^(-0.532 × 50 / 495) ≈ 0.946  
Impact Velocity = 278 × 0.946 ≈ **263 fps**

**Influencing Fields**  
- Total Arrow Weight (higher = better retention)  
- Range (longer = more decay)  
- k (fixed calibration)

---

## 9. Flatness (20→60 yd Arc)

**Raw Equation**  
Extra Drop (ft) = [0.5 × g × (t₆₀² − t₂₀²)] / 12  
t = Distance_ft / FPS₀  
g = 32.174 ft/s²

**Step-by-Step**  
1. t₂₀ = 60 / 278 ≈ 0.216 sec  
2. t₆₀ = 180 / 278 ≈ 0.648 sec  
3. Extra Drop ≈ **6.0 ft**

**Influencing Fields**  
- Launch Speed (higher = flatter)  
- Indirect: Bow efficiency, arrow weight

---

## 10. Group Stability (Target / 3D Score)

**Raw Logic**  
Score = 0 to 3 based on:  
- FPS ≥ threshold  
- FOC in range  
- GPI ≤ threshold  

**Thresholds (dynamic by bow type)**  
- Compound/Hunting: FPS ≥ 270, FOC 12–18%, GPI ≤ 9.5  
- Target: FPS ≥ 280, FOC 10–14%, GPI ≤ 8.5  
- Recurve/Longbow: FPS ≥ 220, FOC 15–22%, GPI ≤ 12  

**Example**  
**1/3** conditions met

**Influencing Fields**  
- FPS, FOC, GPI (direct)  
- Indirect: Bow specs, arrow weight/length

---

**ArrowForge** — Built for archers, by archers 🏹  
v0.0.15 — December 2025

# 📈 Future Possible Enhancements

- Drag coefficient modeling  
- Broadhead aerodynamic variance  
- Group spread & standard deviation modeling  
- Chronograph-based velocity curve import