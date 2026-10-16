# Hardware Component Knowledge Base & Lab Gotchas Portal ⚡🔬

A centralized, interactive engineering knowledge base for electronic hardware design, real-world breadboard & PCB pitfalls, and component-specific "gotchas" discovered through empirical laboratory prototyping.

Built specifically to retain and share practical analog precision, power integrity, and embedded hardware insights across projects.

---

## 🌟 Key Features

- **Component Catalog & Deep-Dive Profiles**: Comprehensive analysis of parts like `REF5045`, `ADS1220`, `OPA380`, `LM2596`, and `BPX 61`.
- **Real-World Gotchas & Traps**: Exact root-cause explanations of bench phenomena (capacitor leakage on high-Z nodes, differential MUX offset cancellation, loop stability ESR requirements).
- **Breadboard vs. PCB Prototyping Rules**: What must be populated (DNP rules), decoupling capacitor selection, and ground bounce mitigation.
- **Interactive Circuit Links**: Direct links to online **KiCanvas** schematic & board viewers from real hardware projects.
- **Dynamic Search & Filter**: Filter by category, tag (`#Leakage`, `#LoopStability`, `#OffsetCancellation`), or part number.
- **Local Storage Persistence**: Add new component gotchas directly through the UI and save them locally or export to Markdown/JSON.

---

## 🚀 How to Run Locally

You can open `index.html` directly in any web browser, or serve it using any local static server:

```bash
# Using Python
python -m http.server 3000

# Using Node / npx
npx serve .
```

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

This repository is ready to be hosted 100% free on **GitHub Pages**:
1. Go to repository **Settings** > **Pages**
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**
3. Select branch `main` and folder `/ (root)`, then click **Save**
4. Your knowledge portal will be live at `https://tachin-r.github.io/Hardware-Component-Knowledge-Base/`!
