# Arrow Tune Calculator

Arrow Tune Calculator is a lightweight, browser-based tool that helps archers calculate important arrow characteristics such as total arrow weight, FOC (Front of Center), grains per pound, grains per inch, and more. The tool works completely locally in your browser — no installs, no accounts, no tracking — and is easy to modify for future features.

> **Tagline:** *Understand your arrow, trust your shot.*

---

## 🔗 Live App

Use the calculator here:

👉 **https://dmarcus-wire.github.io/arrow-tune-calculator/**

(Open in your browser on desktop or mobile. It works on iOS, Android, and desktop browsers.)

---

## 💡 What it does

Arrow Tune Calculator lets you:

- Enter basic bow and arrow setup:
  - Bow draw weight & draw length  
  - Arrow length  
  - Total arrow weight (or detailed component breakdown)  
  - Balance point (for FOC)  
- See live calculations as you type:
  - **Total arrow weight (grains)**
  - **FOC (Front of Center)** with band tags (e.g., typical hunting ranges)
  - **Grains per pound (GPP)**
  - **Arrow GPI (full arrow) bands**
  - **Momentum estimates** (slug·ft/s)
- Visualize your setup:
  - Arrow balance (nock → point)
  - FOC shift gauge
  - Weight composition (shaft vs. point vs. fletching cluster)
  - Simple trajectory arc (distance vs. height)
  - Game momentum band at your farthest distance

All calculations run locally in the browser — nothing is uploaded.

---

## ✅ Current Features

- Instant live calculations while you type
- FOC (Front of Center) with visual indicator and “band” labels
- Total arrow weight (grains), driven by:
  - Advanced component breakdown **or**
  - Simple total arrow weight field
- Grains per Pound (GPP) with hunting-oriented bands
- Arrow GPI (full arrow) with simple classification
- Momentum calculation (slug·ft/s) plus game band interpretation  
- Weight distribution bar:
  - Shaft vs. point system vs. nock/wrap/vanes + glue
- Kinetics section:
  - Launch FPS (editable)
  - Speed loss per 10 yards (FPS)
  - Game momentum band at farthest distance
- Trajectory Arc (Distance vs Height):
  - Editable arc range
  - Labeled peak height
  - Impact momentum indicator
- Data Table:
  - Captures timestamp, bow/arrow labels, FOC/GPP/GPI bands, momentum band, and more
- Info (“i”) panels:
  - Optional explanations for each section so the UI stays clean but still beginner-friendly
- Mobile-friendly layout
- Light / dark theme toggle

---

## ❤️ Support the project on Patreon

I’m building Arrow Tune Calculator as a free, privacy-friendly tool for archers and bowhunters. If you’ve found it useful and want to support future development — including:

- Smarter **AI-powered build summaries** (e.g., “best for elk up to ~60 yards”)
- **Bow-model-aware FPS estimates** pulled from manufacturer specs
- More advanced visualizations and comparison tools
- Ongoing tweaks and tuning based on community feedback

you can support the project here:

👉 **Patreon:** https://patreon.com/ArrowTuneCalculator

Patreon supporters will help cover hosting, future AI costs, and unlock the time needed to keep improving the calculator.

---

## 🧪 Feedback & Ideas

If you’re testing Arrow Tune Calculator and have ideas, bug reports, or tuning thoughts, you can:

- Open an issue on GitHub, or  
- Send feedback via the in-app feedback panel (if enabled), or  
- Email: **arrow-tune-calculator@tuta.io**

Suggestions are very welcome — especially from bowhunters, target archers, and coaches.

---

## 🛠 Getting Started (for developers)

You only need a modern browser.

1. Clone or download this repo:
   ```bash
   git clone https://github.com/dmarcus-wire/arrow-tune-calculator.git
   cd arrow-tune-calculator