import google.generativeai as genai
import json
import os
import time

# Configure your API key
# os.environ["GOOGLE_API_KEY"] = "YOUR_API_KEY"
api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    print("Error: GOOGLE_API_KEY environment variable not set.")
    exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_customers(count=10):
    prompt = f"""
    Generate {count} realistic US-based customer profiles for a financial dashboard.
    Output MUST be a JSON array of objects.
    Each object must strictly follow this schema:
    {{
        "id": "CUST-XXXXX",
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "+1-XXX-XXX-XXXX",
        "dob": "YYYY-MM-DD",
        "address": "Street, City, State Zip",
        "city": "City",
        "state": "XX",
        "stateName": "State Name",
        "zip": "XXXXX",
        "ssn": "***-**-XXXX",
        "kycStatus": "verified|expired|pending_update",
        "kycLastUpdated": "YYYY-MM-DD",
        "customerSince": "YYYY-MM-DD",
        "avatar": "Emoji",
        "financial": {{
            "totalOutstanding": number,
            "creditLimit": number,
            "utilizationRate": number,
            "nextPaymentDue": "YYYY-MM-DD",
            "nextPaymentAmount": number,
            "totalSpend": number,
            "avgMonthly": number,
            "disputesFiled": number
        }},
        "risk": {{
            "score": number (0-100),
            "tier": "low|moderate|high",
            "defaults": number,
            "latePayments": number,
            "consecutiveOnTime": number,
            "creditBureauScore": number
        }},
        "accounts": [
            {{
                "vendorId": "VXXX",
                "accountNumber": "STR-XXXX-XX",
                "cardType": "Vendor Name",
                "balance": number,
                "limit": number,
                "status": "active|closed|defaulted",
                "openedDate": "YYYY-MM-DD",
                "paymentHistory": [
                    {{ "month": "Month YYYY", "status": "on-time|late|missed" }}
                ]
            }}
        ],
        "timeline": [
            {{ "date": "YYYY-MM-DD", "type": "payment|spend|dispute|default|kyc", "description": "String", "amount": number }}
        ]
    }}
    Provide only the JSON array. Don't include markdown code blocks.
    """
    
    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"Error generating customers: {e}")
        return []

if __name__ == "__main__":
    all_customers = []
    batch_size = 5
    total_needed = 20 # User asked for 10K, but start small for testing
    
    print(f"Generating {total_needed} customers in batches of {batch_size}...")
    
    for i in range(0, total_needed, batch_size):
        print(f"Generating batch {i//batch_size + 1}...")
        batch = generate_customers(batch_size)
        all_customers.extend(batch)
        time.sleep(2) # Avoid rate limits
        
    output_path = os.path.join("backend", "customers.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_customers, f, indent=2)
        
    print(f"Successfully generated {len(all_customers)} customers and saved to {output_path}")
