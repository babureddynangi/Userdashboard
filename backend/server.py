from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import json
import os
import re
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Customer 360 RAG API (Smart Analytics Engine)")

# Setup CORS for local frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Embeddings, Documents & Customer Data into memory
BASE_DIR = os.path.dirname(__file__)
EMB_PATH = os.path.join(BASE_DIR, "embeddings.npy")
DOC_PATH = os.path.join(BASE_DIR, "documents.json")
CUST_PATH = os.path.join(BASE_DIR, "customers.json")

customers = []
try:
    print("Loading 10K embeddings into RAM...")
    doc_embeddings = np.load(EMB_PATH)
    with open(DOC_PATH, "r", encoding="utf-8") as f:
        documents = json.load(f)
    with open(CUST_PATH, "r", encoding="utf-8") as f:
        customers = json.load(f)
    print("Loading Sentence Transformer...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    is_ready = True
    print(f"Loaded {len(customers)} customers, {len(documents)} documents, {len(doc_embeddings)} embeddings.")
except Exception as e:
    is_ready = False
    print(f"Warning: Could not load data. Run ingest.py first. Error: {e}")

# Request Model
class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

# ══════════════════════════════════════════════════
# SMART ANALYTICS Q&A ENGINE (No External LLM Needed)
# ══════════════════════════════════════════════════

def fmt_currency(amount):
    return f"${amount:,.0f}"

def analyze_query(query, top_k_docs):
    """Smart local analytics engine — parses natural language queries against customer data."""
    q = query.lower().strip()
    
    # ── Count Queries ──
    if any(w in q for w in ["how many", "count", "number of", "total number"]):
        if "high risk" in q or "high-risk" in q:
            count = sum(1 for c in customers if c["risk"]["tier"] == "high")
            return f"📊 **High Risk Customers:** {count:,} out of {len(customers):,} total ({count/len(customers)*100:.1f}%)"
        if "moderate risk" in q or "moderate-risk" in q:
            count = sum(1 for c in customers if c["risk"]["tier"] == "moderate")
            return f"📊 **Moderate Risk Customers:** {count:,} out of {len(customers):,} total ({count/len(customers)*100:.1f}%)"
        if "low risk" in q or "low-risk" in q:
            count = sum(1 for c in customers if c["risk"]["tier"] == "low")
            return f"📊 **Low Risk Customers:** {count:,} out of {len(customers):,} total ({count/len(customers)*100:.1f}%)"
        if "default" in q:
            count = sum(1 for c in customers if c["risk"]["defaults"] > 0)
            total_defaults = sum(c["risk"]["defaults"] for c in customers)
            return f"📊 **Customers with Defaults:** {count:,}\n**Total Default Events:** {total_defaults:,}"
        if "expired" in q and "kyc" in q:
            count = sum(1 for c in customers if c["kycStatus"] == "expired")
            return f"📊 **Customers with Expired KYC:** {count:,}"
        if "pending" in q and "kyc" in q:
            count = sum(1 for c in customers if c["kycStatus"] == "pending_update")
            return f"📊 **Customers with Pending KYC:** {count:,}"
        if "verified" in q and "kyc" in q:
            count = sum(1 for c in customers if c["kycStatus"] == "verified")
            return f"📊 **Customers with Verified KYC:** {count:,}"
        # State-specific count
        for c_data in customers:
            state_name = c_data.get("stateName", "").lower()
            state_abbr = c_data.get("state", "").lower()
            if state_name and state_name in q:
                count = sum(1 for c in customers if c["stateName"].lower() == state_name)
                return f"📊 **Customers in {c_data['stateName']}:** {count:,}"
            if len(state_abbr) == 2 and state_abbr in q.split():
                count = sum(1 for c in customers if c["state"].lower() == state_abbr)
                return f"📊 **Customers in {c_data['state']}:** {count:,}"
        if "customer" in q:
            return f"📊 **Total Customers:** {len(customers):,}"

    # ── Total Queries ──
    if "total" in q:
        if "outstanding" in q or "exposure" in q:
            total = sum(c["financial"]["totalOutstanding"] for c in customers)
            return f"💰 **Total Outstanding Exposure:** {fmt_currency(total)}"
        if "spend" in q:
            total = sum(c["financial"]["totalSpend"] for c in customers)
            return f"💰 **Total Lifetime Spend:** {fmt_currency(total)}"
        if "credit limit" in q or "credit_limit" in q:
            total = sum(c["financial"]["creditLimit"] for c in customers)
            return f"💰 **Total Credit Limit:** {fmt_currency(total)}"
        if "default" in q:
            total = sum(c["risk"]["defaults"] for c in customers)
            return f"📊 **Total Defaults:** {total:,}"

    # ── Average Queries ──
    if any(w in q for w in ["average", "avg", "mean"]):
        if "credit score" in q or "bureau score" in q or "bureau" in q:
            avg = sum(c["risk"]["creditBureauScore"] for c in customers) / len(customers)
            return f"📊 **Average Credit Bureau Score:** {avg:.0f}"
        if "utilization" in q:
            avg = sum(c["financial"]["utilizationRate"] for c in customers) / len(customers)
            return f"📊 **Average Utilization Rate:** {avg:.1f}%"
        if "risk score" in q:
            avg = sum(c["risk"]["score"] for c in customers) / len(customers)
            return f"📊 **Average Risk Score:** {avg:.1f}/100"
        if "age" in q:
            from datetime import datetime
            ages = [datetime.now().year - int(c["dob"].split("-")[0]) for c in customers]
            avg = sum(ages) / len(ages)
            return f"📊 **Average Customer Age:** {avg:.1f} years"
        if "outstanding" in q:
            avg = sum(c["financial"]["totalOutstanding"] for c in customers) / len(customers)
            return f"📊 **Average Outstanding:** {fmt_currency(avg)}"
        if "spend" in q:
            avg = sum(c["financial"]["totalSpend"] for c in customers) / len(customers)
            return f"📊 **Average Total Spend:** {fmt_currency(avg)}"

    # ── Ranking Queries (Top/Bottom N) ──
    top_match = re.search(r'(top|highest|best|largest)\s*(\d+)?', q)
    bottom_match = re.search(r'(bottom|lowest|worst|smallest)\s*(\d+)?', q)
    
    if top_match or bottom_match:
        is_top = top_match is not None
        match = top_match if is_top else bottom_match
        n = int(match.group(2)) if match.group(2) else 10
        n = min(n, 25)  # Cap at 25

        if any(w in q for w in ["spend", "spending", "spender"]):
            sorted_c = sorted(customers, key=lambda c: c["financial"]["totalSpend"], reverse=is_top)[:n]
            rows = "\n".join([f"• **{c['name']}** ({c['id']}) — {fmt_currency(c['financial']['totalSpend'])} | {c['city']}, {c['state']}" for c in sorted_c])
            return f"🏆 **{'Top' if is_top else 'Bottom'} {n} by Total Spend:**\n\n{rows}"
        if any(w in q for w in ["risk", "risky"]):
            sorted_c = sorted(customers, key=lambda c: c["risk"]["score"], reverse=is_top)[:n]
            rows = "\n".join([f"• **{c['name']}** ({c['id']}) — Score: {c['risk']['score']}/100 ({c['risk']['tier']}) | Bureau: {c['risk']['creditBureauScore']}" for c in sorted_c])
            return f"🏆 **{'Top' if is_top else 'Bottom'} {n} by Risk Score:**\n\n{rows}"
        if any(w in q for w in ["bureau", "credit score"]):
            sorted_c = sorted(customers, key=lambda c: c["risk"]["creditBureauScore"], reverse=is_top)[:n]
            rows = "\n".join([f"• **{c['name']}** ({c['id']}) — Bureau: {c['risk']['creditBureauScore']} | Risk: {c['risk']['tier']}" for c in sorted_c])
            return f"🏆 **{'Top' if is_top else 'Bottom'} {n} by Bureau Score:**\n\n{rows}"
        if any(w in q for w in ["utilization", "utilized"]):
            sorted_c = sorted(customers, key=lambda c: c["financial"]["utilizationRate"], reverse=is_top)[:n]
            rows = "\n".join([f"• **{c['name']}** ({c['id']}) — {c['financial']['utilizationRate']}% | Outstanding: {fmt_currency(c['financial']['totalOutstanding'])}" for c in sorted_c])
            return f"🏆 **{'Top' if is_top else 'Bottom'} {n} by Utilization:**\n\n{rows}"
        if any(w in q for w in ["outstanding", "balance", "debt", "owe"]):
            sorted_c = sorted(customers, key=lambda c: c["financial"]["totalOutstanding"], reverse=is_top)[:n]
            rows = "\n".join([f"• **{c['name']}** ({c['id']}) — {fmt_currency(c['financial']['totalOutstanding'])} | Limit: {fmt_currency(c['financial']['creditLimit'])}" for c in sorted_c])
            return f"🏆 **{'Top' if is_top else 'Bottom'} {n} by Outstanding:**\n\n{rows}"

    # ── Filter Queries ──
    if "defaulted" in q or ("show" in q and "default" in q):
        defaulted = [c for c in customers if c["risk"]["defaults"] > 0][:15]
        rows = "\n".join([f"• **{c['name']}** ({c['id']}) — {c['risk']['defaults']} defaults | Risk: {c['risk']['score']}/100 | {c['city']}, {c['state']}" for c in defaulted])
        total = sum(1 for c in customers if c["risk"]["defaults"] > 0)
        return f"⚠️ **Customers with Defaults** (showing 15 of {total:,}):\n\n{rows}"
    
    if "expired kyc" in q or ("expired" in q and "kyc" in q):
        expired = [c for c in customers if c["kycStatus"] == "expired"][:15]
        rows = "\n".join([f"• **{c['name']}** ({c['id']}) — Last Updated: {c['kycLastUpdated']} | Risk: {c['risk']['tier']}" for c in expired])
        total = sum(1 for c in customers if c["kycStatus"] == "expired")
        return f"📋 **Customers with Expired KYC** (showing 15 of {total:,}):\n\n{rows}"

    # ── Risk Breakdown ──
    if "risk breakdown" in q or "risk distribution" in q or "risk summary" in q:
        low = sum(1 for c in customers if c["risk"]["tier"] == "low")
        mod = sum(1 for c in customers if c["risk"]["tier"] == "moderate")
        high = sum(1 for c in customers if c["risk"]["tier"] == "high")
        
        if "state" in q:
            states = {}
            for c in customers:
                s = c["state"]
                if s not in states:
                    states[s] = {"low": 0, "moderate": 0, "high": 0}
                states[s][c["risk"]["tier"]] += 1
            sorted_states = sorted(states.items(), key=lambda x: x[1]["high"], reverse=True)[:10]
            rows = "\n".join([f"• **{s}** — 🟢 {v['low']} | 🟡 {v['moderate']} | 🔴 {v['high']}" for s, v in sorted_states])
            return f"📊 **Risk Breakdown by State** (Top 10 by High Risk):\n\n{rows}"
        
        return (
            f"📊 **Risk Distribution:**\n\n"
            f"• 🟢 **Low Risk:** {low:,} ({low/len(customers)*100:.1f}%)\n"
            f"• 🟡 **Moderate Risk:** {mod:,} ({mod/len(customers)*100:.1f}%)\n"
            f"• 🔴 **High Risk:** {high:,} ({high/len(customers)*100:.1f}%)"
        )

    # ── KYC Status ──
    if "kyc" in q and ("status" in q or "breakdown" in q or "summary" in q):
        verified = sum(1 for c in customers if c["kycStatus"] == "verified")
        pending = sum(1 for c in customers if c["kycStatus"] == "pending_update")
        expired = sum(1 for c in customers if c["kycStatus"] == "expired")
        return (
            f"📋 **KYC Status Breakdown:**\n\n"
            f"• ✅ **Verified:** {verified:,} ({verified/len(customers)*100:.1f}%)\n"
            f"• ⏳ **Pending Update:** {pending:,} ({pending/len(customers)*100:.1f}%)\n"
            f"• ❌ **Expired:** {expired:,} ({expired/len(customers)*100:.1f}%)"
        )

    # ── Portfolio Summary ──
    if any(w in q for w in ["portfolio", "overview", "summary", "dashboard"]):
        total_out = sum(c["financial"]["totalOutstanding"] for c in customers)
        total_limit = sum(c["financial"]["creditLimit"] for c in customers)
        total_spend = sum(c["financial"]["totalSpend"] for c in customers)
        avg_util = total_out / total_limit * 100 if total_limit > 0 else 0
        low = sum(1 for c in customers if c["risk"]["tier"] == "low")
        mod = sum(1 for c in customers if c["risk"]["tier"] == "moderate")
        high = sum(1 for c in customers if c["risk"]["tier"] == "high")
        defaults = sum(c["risk"]["defaults"] for c in customers)
        return (
            f"📊 **Portfolio Summary:**\n\n"
            f"• **Total Customers:** {len(customers):,}\n"
            f"• **Total Outstanding:** {fmt_currency(total_out)}\n"
            f"• **Total Credit Limit:** {fmt_currency(total_limit)}\n"
            f"• **Average Utilization:** {avg_util:.1f}%\n"
            f"• **Total Lifetime Spend:** {fmt_currency(total_spend)}\n"
            f"• **Risk — Low/Mod/High:** {low:,} / {mod:,} / {high:,}\n"
            f"• **Total Defaults:** {defaults:,}"
        )

    # ── Customer Lookup (by ID or name) ──
    cust_id_match = re.search(r'cust-?\d+', q, re.IGNORECASE)
    if cust_id_match:
        cid = cust_id_match.group(0).upper().replace("CUST", "CUST-").replace("CUST--", "CUST-")
        # Normalize to CUST-XXXXX
        num_part = re.search(r'\d+', cid).group(0).zfill(5)
        cid = f"CUST-{num_part}"
        match = next((c for c in customers if c["id"] == cid), None)
        if match:
            c = match
            return (
                f"👤 **{c['name']}** ({c['id']})\n\n"
                f"• **Location:** {c['city']}, {c['state']}\n"
                f"• **Email:** {c['email']} | **Phone:** {c['phone']}\n"
                f"• **KYC:** {c['kycStatus'].replace('_', ' ').title()}\n"
                f"• **Risk:** {c['risk']['score']}/100 ({c['risk']['tier']}) | Bureau: {c['risk']['creditBureauScore']}\n"
                f"• **Outstanding:** {fmt_currency(c['financial']['totalOutstanding'])} / {fmt_currency(c['financial']['creditLimit'])} ({c['financial']['utilizationRate']}%)\n"
                f"• **Total Spend:** {fmt_currency(c['financial']['totalSpend'])} | Defaults: {c['risk']['defaults']}\n"
                f"• **Accounts:** {len(c['accounts'])} | Active: {sum(1 for a in c['accounts'] if a['status'] == 'active')}"
            )
        return f"❌ Customer **{cid}** not found."

    # ── Geography Queries ──
    if any(w in q for w in ["customers in", "customer in", "people in", "how many in"]):
        for c_data in customers:
            state_name = c_data.get("stateName", "").lower()
            state_abbr = c_data.get("state", "").lower()
            city = c_data.get("city", "").lower()
            if state_name and state_name in q:
                count = sum(1 for c in customers if c["stateName"].lower() == state_name)
                return f"📍 **Customers in {c_data['stateName']}:** {count:,}"
            if city and city in q:
                count = sum(1 for c in customers if c["city"].lower() == city)
                state = c_data["state"]
                return f"📍 **Customers in {c_data['city']}, {state}:** {count:,}"

    # ── Fallback: Use RAG retrieved context ──
    if top_k_docs:
        context_summary = "\n\n".join([f"**Match {i+1}:**\n{doc[:300]}..." if len(doc) > 300 else f"**Match {i+1}:**\n{doc}" for i, doc in enumerate(top_k_docs)])
        return (
            f"🔍 **Semantic Search Results for:** \"{query}\"\n\n"
            f"Found the following matching customer profiles:\n\n{context_summary}\n\n"
            f"_💡 Tip: Try queries like \"How many high risk customers?\", \"Top 10 by spend\", "
            f"\"Risk breakdown\", \"Portfolio summary\", \"CUST-00042\", or \"Average credit score\"._"
        )

    return (
        f"🤔 I couldn't parse that query. Try one of these:\n\n"
        f"• **Counts:** \"How many high risk customers?\"\n"
        f"• **Totals:** \"Total outstanding\", \"Total spend\"\n"
        f"• **Averages:** \"Average credit score\", \"Avg utilization\"\n"
        f"• **Rankings:** \"Top 10 by spend\", \"Bottom 5 by bureau score\"\n"
        f"• **Filters:** \"Show defaulted accounts\", \"Expired KYC\"\n"
        f"• **Analysis:** \"Risk breakdown\", \"KYC status\", \"Portfolio summary\"\n"
        f"• **Lookups:** \"CUST-00042\", customer name"
    )

@app.post("/api/chat")
def chat_rag(request: QueryRequest):
    if not is_ready:
        raise HTTPException(status_code=500, detail="Vector store not initialized. Run ingest.py")
        
    try:
        # 1. Embed query
        query_embedding = model.encode(request.query)
        
        # 2. Compute Cosine Similarity
        q_norm = query_embedding / np.linalg.norm(query_embedding)
        d_norm = doc_embeddings / np.linalg.norm(doc_embeddings, axis=1, keepdims=True)
        similarities = np.dot(d_norm, q_norm)
        
        # 3. Get Top-K indices
        top_k_indices = np.argsort(similarities)[::-1][:request.top_k]
        
        # 4. Build Context
        retrieved_docs = [documents[i] for i in top_k_indices]

        # 5. Use Smart Analytics Engine
        answer = analyze_query(request.query, retrieved_docs)
        
        return {
            "answer": answer,
            "context": retrieved_docs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
