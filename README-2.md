# 🇰🇭 Cambodia Tax Calculator

A clean, web-based tax calculator for Cambodia's General Department of Taxation (GDT), covering all major tax types with official 2024 rates.

> Built for students, business owners, accountants, and anyone navigating Cambodia's tax system.

---

## ✨ Features

- **10 Tax Types** — Salary, VAT, Withholding, Specific, Tax on Profit, Minimum Tax, Tax on Income, Patent, Property, and Transfer Tax
- **Dual Currency** — KHR and USD with automatic conversion (1 USD = 4,000 KHR)
- **Progressive Brackets** — Accurate resident/non-resident salary tax brackets
- **Dependent Deductions** — Children and unemployed spouse deductions
- **Tax Summary** — Side-by-side rate reference for all tax types
- **Tax Guide** — Laws, sub-decrees, and Prakas references
- **Site Search** — Keyword search across all tax categories
- **Calculation History** — Saved results per session
- **Bilingual Ready** — English with Khmer font support (Kantumruy Pro)
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🧮 Supported Tax Calculators

| Tax Type | Description |
|---|---|
| Salary Tax (TOS) | Resident & non-resident employees, progressive brackets |
| Value Added Tax (VAT) | Input/output VAT, export exemptions |
| Withholding Tax (WHT) | Royalties, interest, dividends, services |
| Specific Tax | Accommodation, goods & services |
| Tax on Profit (TOP) | Prepayment and annual profit tax |
| Minimum Tax | 1% of annual turnover |
| Tax on Income (TOI) | Company income tax |
| Patent Tax | Business registration by type & branch |
| Property Tax | Immovable property (land & buildings) |
| Transfer Tax | Property ownership transfer |

---

## 🗂️ Project Structure

```
├── HTML/
│   ├── index.html          # Entry point (redirects to home)
│   ├── home.html           # Landing page with hero section
│   ├── calculate.html      # Main calculator hub
│   ├── tax-summary.html    # Rate reference table
│   ├── tax-guide.html      # Laws & regulations
│   ├── salary-tax.html
│   ├── value-added-tax.html
│   ├── withholding-tax.html
│   ├── specific-tax.html
│   ├── tax-on-profit.html
│   ├── minimum-tax.html
│   ├── tax-on-income.html
│   ├── patent-tax.html
│   ├── property-tax.html
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
├── vercel.json             # Vercel deployment config
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
open HTML/home.html

# Option 2: Use a local server (recommended to avoid CORS)
npx serve .
# or
python3 -m http.server 3000
```

Then visit `http://localhost:3000/HTML/home.html`

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

## 📐 Tax Rates Reference (2024)

| Tax | Rate |
|---|---|
| Salary Tax | 0% – 20% (progressive) |
| VAT | 10% standard / 0% exports |
| Withholding Tax | 6% – 15% depending on type |
| Tax on Profit | 20% standard |
| Minimum Tax | 1% of turnover |
| Property Tax | 0.1% of assessed value |
| Transfer Tax | 4% of property value |

*Rates are based on official GDT regulations. Always verify with current sub-decrees.*

---

## 📄 License

This project is for educational purposes. Tax rates are based on publicly available GDT regulations as of 2024.

---

## 🙏 Acknowledgements

- [General Department of Taxation, Cambodia](https://www.tax.gov.kh)
- Ministry of Economy and Finance, Kingdom of Cambodia
