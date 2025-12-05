# 📘 Arrow Tune Calculator — Math & Formulas  
### *Complete mathematical reference with real examples for every calculation*

This document explains all formulas used in the Arrow Tune Calculator.  
Each equation includes a simple explanation and a real-world numeric example based on a typical hunting arrow setup.

---

# 🏹 Example Setup Used for All Calculations

| Variable | Example Value |
|---------|----------------|
| Draw Weight (DW) | **70 lb** |
| Arrow Length (L) | **28.5 in** |
| Balance Point (BP) | **18.5 in** |
| Total Arrow Weight (W) | **505 gr** |
| Point Weight | **150 gr** |
| Launch Speed (FPS₀) | **270 fps** |
| Distance to Target | **50 yd** |

---

# 1️⃣ GPP – Grains Per Pound

### Formula
GPP = Total Arrow Weight (gr) / Draw Weight (lb)

### Example  
GPP = 505 / 70 = **7.21**

---

# 2️⃣ GPI – Grains Per Inch

### Formula
GPI = Total Arrow Weight / Arrow Length

### Example  
GPI = 505 / 28.5 = **17.72**

---

# 3️⃣ FOC – Front of Center

### Formula
FOC% = ((Balance Point – (Arrow Length / 2)) / Arrow Length) × 100

### Example  
Arrow half-length = 28.5 / 2 = 14.25 in  
FOC% = ((18.5 – 14.25) / 28.5) × 100  
FOC% = (4.25 / 28.5) × 100  
FOC% = **14.9%**

---

# 4️⃣ Launch Kinetic Energy (KE₀)

### Formula
KE = (W × FPS²) / 450240

### Example  
KE = (505 × 270²) / 450240 = **81.8 ft-lbs**

---

# 5️⃣ Launch Momentum (M₀)

### Formula
Momentum = (W × FPS) / 225400

### Example  
Momentum = (505 × 270) / 225400 = **0.605 slug·ft/s**

---

# 6️⃣ Velocity Decay at Distance

### Formula
V(d) = FPS₀ × e^(–d / 300)

### Example at 50 yd  
V(50) = 270 × e^(–50/300)  
V(50) ≈ 270 × 0.8465 = **229 fps**

---

# 7️⃣ Impact KE at Distance

### Formula
KE(d) = (W × V(d)²) / 450240

### Example  
KE(50) = (505 × 229²) / 450240 = **62.2 ft-lbs**

---

# 8️⃣ Impact Momentum at Distance

### Formula
Momentum(d) = (W × V(d)) / 225400

### Example  
Momentum(50) = (505 × 229) / 225400 = **0.514 slug·ft/s**

---

# 9️⃣ Time to Impact (Flight Time)

### Formula
Time = Distance_ft / (FPS₀ × 0.8)

Where:  
Distance_ft = yards × 3

### Example  
Distance_ft = 50 × 3 = 150 ft  
Time = 150 / (270 × 0.8)  
Time = **0.69 sec**

---

# 🔟 Peak Height (Apex of Arrow Flight)

Uses standard projectile physics.

---

## Step 1 — Compute Launch Angle (θ)

### Formula
sin(2θ) = (R × g) / FPS₀²

Where:  
g = 32.174 ft/s²  
R = distance in ft = yards × 3

### Example  
R = 50 × 3 = 150 ft  
sin(2θ) = (150 × 32.174) / 270²  
sin(2θ) = 4826.1 / 72900 = 0.0662  
2θ = arcsin(0.0662)  
θ = **1.894°**

---

## Step 2 — Peak Height

### Formula
H_max = (FPS₀² × sin²θ) / (2g)

### Example  
sin(1.894°) = 0.0331  
H_max = (270² × 0.0331²) / (2 × 32.174) = **1.24 ft**  
Peak occurs halfway to the target → **25 yd**

---

# 📊 Summary of All Formulas

| Metric | Formula |
|--------|---------|
| **GPP** | W / DW |
| **GPI** | W / L |
| **FOC** | ((BP – L/2) / L) × 100 |
| **Launch KE** | (W × FPS²) / 450240 |
| **Launch Momentum** | (W × FPS) / 225400 |
| **Velocity @ d** | FPS × e^(–d/300) |
| **Impact KE** | (W × V²) / 450240 |
| **Impact Momentum** | (W × V) / 225400 |
| **Time to Impact** | (d × 3) / (FPS × 0.8) |
| **Launch Angle θ** | ½ × arcsin((R × g) / FPS²) |
| **Peak Height** | (FPS² × sin²θ) / (2g) |

---

# 📈 Future Possible Enhancements

- Drag coefficient modeling  
- Broadhead aerodynamic variance  
- Wind drift estimation  
- Group spread & standard deviation modeling  
- Chronograph-based velocity curve import  