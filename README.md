# 🎯 Arrow Tune Calculator  
**Offline • Fast • Mobile-Friendly Bow & Arrow Tuning Tool**

https://dmarcus-wire.github.io/arrow-tune-calculator/ 

The **Arrow Tune Calculator** is an all-in-one bowhunting and archery performance tool designed to help archers build, tune, and analyze arrow setups with clarity — entirely offline.

Whether you're experimenting with point weights, arrow components, FOC, trajectory, or kinetic energy, this calculator provides instant, accurate results through live calculations and clean, intuitive visuals.

---

## 🌟 Key Features

### 🔧 Bow & Arrow Setup
- Enter full bow specs: **IBO/ATA rating**, **draw weight**, **draw length**, **string components**, and more.  
- Choose **Simple** or **Advanced** modes for arrow weight input.  
- Smart **build name auto-suggestion** for organizing setups.

---

### 📐 Arrow Efficiency Metrics
- **FPS (launch speed)** — estimated from bow specs or manually entered  
- **GPP** (grains per pound)  
- **GPI** (grains per inch)  
- **TW** (Total Weight)  
- **FOC** with a compact visual bar  
- **Arrow Weight Composition** (shaft vs point vs components)

All metrics use unified colors and centered card layouts for readability.

---

### 🎯 Performance at Distance
Dynamic arrow behavior at any distance (0–120 yards):

- **Velocity @ distance**
- **Peak flight height** (calculated using projectile physics)
- **Launch & Impact KE**
- **Impact Momentum**
- **Time to Impact**

Set a distance with the slider and all metrics update instantly.

---

### 🦌 Game Effectiveness (Impact-Based)
Instant classification of ethical shot potential using KE and momentum:

- Small / Thin-skinned  
- Medium Game  
- Large / Tough  
- Dangerous / Extreme  

Each category displays **Send it** (green) or **Don’t** (red) based on widely-used KE & momentum thresholds.

---

### 💾 Build Management
- Save unlimited builds locally  
- Load or delete builds instantly  
- Automatically restores:
  - Simple/Advanced modes  
  - All bow & arrow inputs  
  - Notes  
- One-click **Build Summary Copy** for sharing or logging

---

### 📝 Notes
Record tuning steps, broadhead flight, chrono strings, and field results. Notes save per build.

---

### 🌗 Light & Dark Modes
Fully theme-aware and mobile-ready.

---

## 📸 Screenshots  
*(Optional placeholders — add your own images later)*
/assets/screenshot-light.png
/assets/screenshot-dark.png
/assets/screenshot-performance.png

---

## 🧮 How Calculations Work

# 🏹 Summary of Formulas

| Metric | Formula |
|-------|---------|
| GPP | W / DW |
| GPI | W / L |
| FOC | ((BP – L/2) / L) × 100 |
| Launch KE | (W × FPS²) / 450240 |
| Launch Momentum | (W × FPS) / 225400 |
| Velocity @ Distance | FPS × e^(–d/300) |
| Impact KE | (W × V²) / 450240 |
| Impact Momentum | (W × V) / 225400 |
| Time to Impact | distance_ft / (FPS × 0.8) |
| Peak Height | (FPS² × sin²θ) / (2g) |
| Launch Angle θ | θ = ½ arcsin((R × g) / FPS²) |

---

❤️ Support the Project

If this tool helps you tune better arrows or shoot more confidently, consider supporting development:

👉 https://patreon.com/ArrowTuneCalculator

Your support helps fund:
	•	New features
	•	Physics modeling improvements
	•	UI refinements
	•	Mobile optimizations
	•	Archery testing