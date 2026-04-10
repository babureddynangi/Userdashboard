# 🔮 Customer 360° Intelligence Dashboard

A full-featured **Customer Intelligence Dashboard** that leverages both procedurally generated and **LLM-synthesized data** to construct **10,000 US-based customer profiles** on the fly. It provides a unified 360° view across **50 vendors** and **10 categories** — featuring a built-in semantic search and **Smart Analytics Q&A Engine** for deep portfolio analysis.

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

### 🤖 Smart Analytics Q&A Engine
Ask complex questions in plain English and get instant answers without needing external APIs or incurring token costs. 

The Q&A Engine is built directly into the FastAPI backend using a hybrid Semantic Retrieval and Local Analytics pattern:
1. **Embedding Generation:** The database is vectorized using `sentence-transformers/all-MiniLM-L6-v2`.
2. **Dense Vector Search:** User queries are converted to embeddings and queried against the document matrices via fast `Numpy` dot-product similarity.
3. **Smart Analytics Engine:** An internal Natural Language processor intercepts analytical queries (counts, averages, rankings) and executes them directly against RAM-loaded `customers.json` to eliminate LLM quota bottlenecks and hallucinations.

**Supported query types:**

| Category | Example Queries |
|----------|----------------|
| **Counts** | "How many high risk customers?", "Count defaults" |
| **Totals** | "Total outstanding", "Total spend", "Total credit limit" |
| **Averages** | "Average credit score", "Avg utilization", "Average age" |
| **Rankings** | "Top 10 by spend", "Bottom 5 by bureau score" |
| **Filters** | "Show defaulted accounts", "Customers with expired KYC" |
| **Geography** | "Customers in California", "How many in TX?" |
| **Analysis** | "Risk breakdown", "Risk breakdown by state", "KYC status" |
| **Lookups** | "CUST-00042", customer name |
| **Portfolio** | "Portfolio summary", "Overview" |

---

## 🛠️ Implementation Architecture & Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Structure** | HTML5 (semantic, SEO-optimized) |
| **Frontend Styling** | Vanilla CSS — dark glassmorphism, CSS custom properties, responsive grid |
| **Frontend Logic** | Vanilla JavaScript — procedural generation, animations, fetch API |
| **Backend API** | Python `FastAPI` (REST API mapped to `/api/chat`) |
| **RAG Vector Store** | `Numpy` dense arrays (`embeddings.npy`) — fast, RAM-based dot product search |
| **Embedding Model** | `sentence-transformers/all-MiniLM-L6-v2` |
| **Data Generation** | Node.js (`generate_customers.js`) & Python LLM pipeline (`llm_generate_customers.py`) |

**100% Local Backend Execution. Deep Semantic Search. Zero Cloud Inference Dependencies.**

---

## 📈 Implementation Plan & Setup Journey

Transitioning the project to its current state involved multiple data architectural shifts:

1. **Procedural Frontend Generation:** Initially, generation was done purely client-side via seeded Pseudo-Random Number Generators (PRNG) to construct 10K customers on-the-fly.
2. **Backend Persistence Engine:** Scaled UI generation out to `generate_customers.js` to persist exact states as `customers.json` and unstructured raw context as `documents.json`.
3. **Data Ingestion Pipeline:** Implemented `ingest.py` to embed all 10K unstructured documents into heavy `embeddings.npy` matrices via `sentence-transformers`.
4. **LLM Transition Attempt:** Integrated `google-generativeai` (Gemini Flash) to act as the reasoning engine for the RAG pipeline. Encountered strict API quota rate-limit bottlenecks doing 10K document context injections.
5. **Smart Analytics Fallback Strategy:** Engineered a custom local string-matching and mathematical filtering algorithm directly inside the `server.py` API. It natively parses query intent (top, average, filter, count) and maps them to pure Python analytical logic over the `customers.json` objects.

---

## 📁 Project Structure

```
Userdashboard/
├── index.html                  # Main dashboard page
├── styles.css                  # Complete design system (dark theme, glassmorphism, animations)
├── data.js                     # Seeded PRNG generator (legacy JS structure)
├── app.js                      # Dashboard logic, search, profile rendering, RAG fetch
├── generate_customers.js       # Node pipeline to build deterministic customers
├── llm_generate_customers.py   # Python Gemini LLM data generator
├── backend/                    # RAG Python Backend
│   ├── requirements.txt
│   ├── ingest.py               # Embeds 10,000 JSON profiles into Numpy NPY arrays
│   ├── server.py               # FastAPI server providing the /api/chat analytics engine
│   ├── customers.json          # Exported 10K raw profiles
│   ├── documents.json          # Raw text chunks for RAG context
│   └── embeddings.npy          # Generated 384-dimensional dense vectors
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js (if regeneration of static data is required)

### 1. Generating Data (Optional - Only if data is missing)
```bash
node generate_customers.js 
# Generates backend/customers.json and backend/documents.json
```

### 2. Setup Backend & RAG Vector Store

```bash
cd Userdashboard/backend
python -m pip install -r requirements.txt

# Run the ingestion script (takes ~15m on CPU for 10,000 customers)
# This creates the embeddings.npy file
python ingest.py 

# Start the FastAPI Server (Port 8001)
python server.py
```

### 3. Start Frontend

Open a new terminal:
```bash
cd Userdashboard
python -m http.server 8888
# Open http://localhost:8888
```

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

## 📄 License

MIT License — free for personal and commercial use.
