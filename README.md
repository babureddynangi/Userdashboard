# 🔮 Customer 360° Intelligence Dashboard

A full-featured, zero-dependency **Customer Intelligence Dashboard** that generates **10,000 US-based customer profiles** on the fly and provides a unified 360° view across **50 vendors** and **10 categories** — with a built-in **natural-language Q&A engine**.

![Dashboard Overview](screenshots/overview.png)

---

## ✨ Features

### 📊 Overview Dashboard
- **KPI Cards** — Total customers (10K), risk distribution (low/moderate/high), average utilization, total defaults
- **Risk Distribution Chart** — Color-coded horizontal bar chart (green/amber/red)
- **Top States by Customers** — Geographic distribution across 20 US states
- **Top Vendors by Accounts** — Most popular card/vendor relationships
- **KYC Status Breakdown** — Verified, pending, and expired counts
- **Highest Risk Table** — Top 15 highest-risk customers with clickable profiles

### 🔍 Smart Search (10K Scale)
- Debounced search across name, email, customer ID, phone, city, and state
- Live dropdown with result count and risk tier badges
- Shows top 20 matches from 10,000 records instantly

### 👤 Full Customer Profile (per customer)
| Section | Details |
|---------|---------|
| **Identity & KYC** | Name, SSN (masked), DOB, age, email, phone, address, KYC status, last verified date |
| **Financial Summary** | Total outstanding, credit limit, utilization rate (with animated bar), next payment due |
| **Risk Profile** | 0–100 animated gauge, risk tier, credit bureau score, defaults, late payments, consecutive on-time |
| **All Accounts** | Every card across vendors — balance vs limit bar, account status (active/closed/defaulted), open date |
| **Payment History** | 12-month grid per account — green (on-time), amber (late), red (missed) |
| **Activity Timeline** | Chronological audit trail — payments, disputes, defaults, KYC events, settlements |
| **Vendor Relationships** | All vendor cards grouped by category with status indicators |
| **Lifetime Value** | Total spend, average monthly spend, disputes filed, customer tenure, active vs total accounts |

### 🤖 Q&A Engine (Natural Language)
Ask questions in plain English and get instant answers with formatted tables and clickable profile links.

**Supported query types:**

| Category | Example Queries |
|----------|----------------|
| **Counts** | "How many high risk customers?", "Count defaults" |
| **Totals** | "Total outstanding", "Total spend", "Total credit limit" |
| **Averages** | "Average credit score", "Avg utilization", "Average age" |
| **Rankings** | "Top 10 by spend", "Bottom 5 by bureau score", "Highest utilization" |
| **Filters** | "Show defaulted accounts", "Customers with expired KYC" |
| **Geography** | "Customers in California", "How many in TX?" |
| **Analysis** | "Risk breakdown", "Risk breakdown by state", "KYC status" |
| **Lookups** | "CUST-00042", customer name, vendor name |
| **Portfolio** | "Portfolio summary", "Overview" |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Structure** | HTML5 (semantic, SEO-optimized) |
| **Styling** | Vanilla CSS — dark glassmorphism, CSS custom properties, responsive grid |
| **Logic** | Vanilla JavaScript — no frameworks, no dependencies |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) via Google Fonts |
| **Data** | Procedurally generated via seeded PRNG (deterministic, reproducible) |
| **Server** | Any static file server (Python `http.server`, VS Code Live Server, etc.) |

**No API keys. No npm. No build step. No backend.**

---

## 📁 Project Structure

```
Userdashboard/
├── index.html      # Main dashboard page
├── styles.css      # Complete design system (dark theme, glassmorphism, animations)
├── data.js         # Seeded PRNG generator — 10K customers, 50 vendors, 20 states
├── app.js          # Dashboard logic, search, profile rendering, Q&A engine
└── README.md       # This file
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x (for local server) — or any static file server

### Run Locally

```bash
# Clone the repository
git clone https://github.com/babureddynangi/Userdashboard.git
cd Userdashboard

# Start a local server
python -m http.server 8888

# Open in browser
# http://localhost:8888
```

> **Note:** The dashboard generates all 10,000 customer profiles on page load in ~100ms using a seeded pseudo-random number generator. No external data sources needed.

---

## 📐 Data Architecture

### 10 Vendor Categories (50 vendors total)

| Category | Vendors |
|----------|---------|
| 💳 Premium Cards | Amex Platinum, Amex Gold, Citi Prestige, Chase Sapphire Reserve, Capital One Venture X |
| ✈️ Travel | Expedia Chase, Booking.com Visa, Priceline Barclays, Hotels.com Wells Fargo, Kayak Capital One |
| 🛒 Retail | Amazon Prime Visa, Target RedCard, Costco Citi, Walmart Capital One, Best Buy Citi |
| ⛽ Fuel | Shell Citi, BP Visa, ExxonMobil Amex, Chevron Visa, Marathon BofA |
| 🛫 Airlines | Delta SkyMiles Amex, United Explorer Chase, AA Citi AAdvantage, Southwest Chase, JetBlue Barclays |
| 🏨 Hotels | Marriott Bonvoy Amex, Hilton Honors Amex, Hyatt Chase, IHG Premier Chase, Wyndham Capital One |
| 📱 Telecom | T-Mobile Visa, Verizon Visa, AT&T Access, Xfinity Visa, Spectrum Mastercard |
| 🥬 Grocery | Whole Foods Amex, Kroger Visa, Safeway Visa, Trader Joe's Visa, Publix Visa |
| 🛡️ Insurance | State Farm Visa, Geico Mastercard, Progressive Visa, Allstate Visa, Liberty Mutual Visa |
| 🎬 Entertainment | Netflix Visa, Disney Visa, Hulu Mastercard, Spotify Visa, AMC Mastercard |

### Customer Profile Distribution
- **Risk tiers:** ~55% Low, ~30% Moderate, ~15% High
- **KYC status:** ~78% Verified, ~15% Pending, ~7% Expired
- **Accounts per customer:** 3–15 depending on risk tier
- **Geography:** 20 US states, 200 cities

### Data Model (per customer)
```
Customer
├── Identity (name, SSN, DOB, email, phone, address, city, state, zip)
├── KYC (status, last_updated)
├── Financial (outstanding, credit_limit, utilization, next_payment, total_spend, avg_monthly)
├── Risk (score 0-100, tier, defaults, late_payments, consecutive_on_time, bureau_score)
├── Accounts[] (vendor, account_number, card_type, balance, limit, status, opened_date)
│   └── PaymentHistory[] (12 months × {month, status: on-time|late|missed})
└── Timeline[] (date, type, description, amount?)
```

---

## 🎨 Design Philosophy

- **Dark glassmorphism** with `backdrop-filter` blur and frosted-glass cards
- **Vibrant color-coded risk tiers**: 🟢 Green (low), 🟡 Amber (moderate), 🔴 Red (high)
- **Animated SVG risk gauge** with dynamic stroke-dashoffset
- **Micro-animations**: hover lift effects, timeline slide-ins, payment dot scaling
- **Responsive grid layout** adapting from 3-column to 1-column on mobile
- **Monospaced typography** (JetBrains Mono) for all financial/numeric data

---

## 🏗️ Production Architecture Recommendation

For a production deployment with real data, the recommended architecture:

```
┌─────────────────────────────────────────────┐
│                   Frontend                   │
│         (This Dashboard UI Layer)            │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │  Unified REST API   │
         │  (Federation Layer) │
         └─────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐    ┌────▼────┐   ┌────▼────┐
│Cat 1-3│    │Cat 4-6  │   │Cat 7-10 │
│Stores │    │Stores   │   │Stores   │
└───────┘    └─────────┘   └─────────┘
```

- **Join key:** `user_id` or email across all vendor datastores
- **Data lake:** Databricks / BigQuery for scheduled ingestion
- **API layer:** Federated queries across category datastores in real-time
- **Caching:** Redis for hot customer lookups

---

## 📄 License

MIT License — free for personal and commercial use.
