import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize Together AI Client (OpenAI-compatible)
# Using cost-efficient Llama 3.1 8B Instruct (~$0.20 per 1M tokens)
client = OpenAI(
    api_key=os.environ.get("TOGETHER_API_KEY", ""),
    base_url="https://api.together.xyz/v1"
)

# Model selection: Llama 3.1 8B for cost efficiency
MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"

SYSTEM_PROMPT = """
You are an expert Police Dispatch Analyst. 
Your job is to extract structured data from raw emergency reports.
Return ONLY a valid JSON object with the following fields:
- type: The type of incident (e.g., Robbery, Accident).
- severity: Critical, High, Medium, or Low.
- location: A short text description of the location.
- lat: Estimated latitude (if mentioned or inferred from known Nairobi landmarks, otherwise null).
- lng: Estimated longitude (if mentioned or inferred from known Nairobi landmarks, otherwise null).
- summary: A brief 5-word summary.

Known Nairobi Landmarks for Inference:
- CBD/Archives: -1.2834, 36.8235
- Westlands/Sarit: -1.2635, 36.8024
- Kibera: -1.3120, 36.7890
- Eastleigh: -1.2760, 36.8480
- Karen: -1.3200, 36.7050
- Thika Road: -1.2200, 36.8900

If you cannot infer coordinates, use null. Do not hallucinate coordinates.
"""

def analyze_report(raw_text: str):
    # Check if API key is set properly
    api_key = os.environ.get("GROQ_API_KEY", "gsk_placeholder_key_replace_me")
    if api_key == "gsk_placeholder_key_replace_me" or not api_key:
        print("Analyst: Using fallback analysis (API key not configured)")
        return {
            "type": "Unknown",
            "severity": "Medium",
            "location": "Unknown",
            "lat": None,
            "lng": None,
            "summary": "Analysis Failed"
        }
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": raw_text,
                }
            ],
            model=MODEL,  # Using cost-efficient Llama 3.1 8B
            temperature=0,
            response_format={"type": "json_object"},
        )
        
        result = chat_completion.choices[0].message.content
        analysis = json.loads(result)
        
        # Apply Ethical AI Check
        from agents.bias_guard import BiasGuard
        analysis = BiasGuard.check(analysis)
        
        return analysis
    except Exception as e:
        print(f"Analyst Error: {e}")
        # Fallback for demo if API fails
        return {
            "type": "Unknown",
            "severity": "Medium",
            "location": "Unknown",
            "lat": None,
            "lng": None,
            "summary": "Analysis Failed"
        }
