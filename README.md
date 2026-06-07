# 🇰🇭 Cambodia Tax Calculator

A responsive, multi-page web application for calculating various types of Cambodian taxes including Income Tax, Salary Tax, Value Added Tax (VAT), Property Tax, Withholding Tax, Specific Tax, Patent Tax, Transfer Tax, Accommodation Tax, Minimum Tax, and Tax on Profit.

Built with plain HTML, CSS, and JavaScript — no frameworks or build tools required.

---

## 📁 Project Structure

```
project-root/
├── index.html              # The root to serve site 
├── HTML/
│   ├── home.html           # Landing page with hero section
│   ├── calculate.html      # Main calculator hub
│   ├── tax-summary.html    # Rate reference table
│   ├── tax-guide.html      # Laws & regulations
│   ├── salary-tax.html
│   ├── value-added-tax.html
│   ├── withholding-tax.html
│   ├── specific-tax.html
│   ├── prepayment-tax.html
│   ├── minimum-tax.html
│   ├── income-tax.html
│   ├── patent-tax.html
│   ├── property-tax.html
│   ├── accommodation-tax.html
│   └── transfer-tax.html
├── CSS/
│   ├── variables.css       # Design tokens & color palette
│   ├── base.css            # Reset & typography
│   ├── layout.css          # Page structure
│   ├── hero.css            # Hero section styles
│   ├── calculator.css      # Calculator UI components
│   ├── sections.css        # Content sections
│   ├── modal.css           # Modal dialogs
│   ├── footer.css          # Footer styles
│   └── responsive.css      # Mobile & tablet breakpoints
├── js/
│   ├── config.js           # App-wide constants
│   ├── tax.js              # Tax formulas & calculation logic
│   ├── calculator.js       # UI, navigation & search
│   └── history.js          # Calculation history
├── images/
│   └── logo-3d.png
└── README.md
```
---

## 🚀 Deployment (Vercel)

This project is a static site — no build step required.

### Deploy via Vercel Dashboard

1. Push your project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Set the **Root Directory** to your project folder (if needed)
5. Leave **Framework Preset** as `Other`
6. Click **Deploy** ✅

### Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts — Vercel will auto-detect it as a static site.

---

## 💻 Run Locally

No dependencies or build tools required. Just open in a browser:

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server (recommended to avoid CORS)
npx serve .
# or
python3 -m http.server 3000
```

Then visit `http://localhost:3000`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, flexbox, grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Nunito, JetBrains Mono, Kantumruy Pro (Google Fonts) |
| Hosting | Vercel (static) |


---
## 📐 Tax Rates Reference (2026)

| Tax | Rate |
|---|---|
| Salary Tax | 0% – 20% (progressive) |
| VAT | 10% standard / 0% exports |
| Withholding Tax | 6% – 15% depending on type |
| Tax on Profit | 20% standard / 30% oil & gas / 0% QIP |
| Minimum Tax | 1% of turnover |
| Property Tax | 0.1% of assessed value |
| Transfer Tax | 4% of property value |
| Accommodation Tax | 2% of invoice price |
| Specific Tax | 3% – 35% depending on goods/services |
| Tax on Income | 0% – 20% (progressive, KHR brackets) |
| Patent Tax | Fixed annual fee by taxpayer class (Small / Medium / Large) |

*Rates are based on official GDT regulations. Always verify with current sub-decrees.*
---

## 👥 Team

| Name | Role |
|------|------|
| Nhen Theary       | Developer |
| Phyrun Pichchhorda| Developer |
| Nob Sreynich      | Developer |
| Ry Chhorly        | Developer |
| Yos Nisiy         | Developer |

---

## 📄 License
Academic project — Institute of Technology of Cambodia (ITC), 2026.

---

## 🙏 Acknowledgements

- [General Department of Taxation, Cambodia](https://www.tax.gov.kh)
- Ministry of Economy and Finance, Kingdom of Cambodia