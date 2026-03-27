import json
import os
import time
import numpy as np
from sentence_transformers import SentenceTransformer

# Initialize Embedding Model
print("Loading embedding model (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def create_customer_text(c):
    text = f"Customer Profile for {c['name']} (ID: {c['id']}). "
    text += f"Age: {2026 - int(c['dob'].split('-')[0])} years old. "
    text += f"Location: {c['city']}, {c['stateName']} ({c['state']}). Address: {c['address']}. "
    text += f"Contact: Email {c['email']}, Phone {c['phone']}. "
    text += f"KYC Status: {c['kycStatus'].replace('_', ' ').capitalize()}. "
    
    r = c['risk']
    f = c['financial']
    text += f"\nRisk Profile: {r['tier'].upper()} RISK (Score: {r['score']}/100, Credit Bureau Score: {r['creditBureauScore']}). "
    text += f"Defaults: {r['defaults']}. Late payments: {r['latePayments']}. "
    text += f"\nFinancial Summary: Total Outstanding: ${f['totalOutstanding']}. Credit Limit: ${f['creditLimit']}. "
    text += f"Utilization Rate: {f['utilizationRate']}%. Total Lifetime Spend: ${f['totalSpend']}. "
    
    text += "\nActive Accounts: "
    accts = []
    for a in c['accounts']:
        acct_str = f"{a['cardType']} (Bal: ${a['balance']} / Limit: ${a['limit']}, Status: {a['status']})"
        accts.append(acct_str)
    text += ", ".join(accts) + ". "

    return text

def ingest_data():
    file_path = os.path.join(os.path.dirname(__file__), "customers.json")
    print(f"Reading {file_path}...")
    with open(file_path, "r", encoding="utf-8") as f:
        customers = json.load(f)

    print(f"Loaded {len(customers)} customers. Preparing documents for embedding...")
    
    docs = []
    
    for c in customers:
        docs.append(create_customer_text(c))
        
    start_time = time.time()
    print("Computing embeddings for 10,000 customers... (This may take a minute)")
    embeddings = model.encode(docs, show_progress_bar=True)
    
    # Save embeddings to disk
    emb_path = os.path.join(os.path.dirname(__file__), "embeddings.npy")
    np.save(emb_path, embeddings)
    
    # Save the raw text documents to disk
    doc_path = os.path.join(os.path.dirname(__file__), "documents.json")
    with open(doc_path, "w") as f:
        json.dump(docs, f)

    print(f"Done! Saved {len(docs)} embeddings to {emb_path} in {time.time() - start_time:.2f} seconds.")

if __name__ == "__main__":
    ingest_data()
