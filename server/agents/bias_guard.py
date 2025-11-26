import os
import json
from typing import Dict, List
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq Client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY", "gsk_placeholder_key_replace_me"),
)

SYSTEM_PROMPT = """
You are an expert Civil Rights Oversight AI.
Your job is to analyze police incident reports for potential bias, racial profiling, or unnecessary escalation.

Analyze the provided report summary and location.
Return ONLY a valid JSON object with the following fields:
- bias_score: A float between 0.0 (No Bias) and 1.0 (High Bias).
- status: "Clear" or "Flagged".
- warnings: A list of strings explaining specific concerns if any.
- reasoning: A brief explanation of your assessment.

Criteria for Flagging:
1. Subjective Language: Words like "suspicious", "sketchy", "out of place" without objective behavioral evidence.
2. Racial/Socio-economic Profiling: Assumptions based on location (e.g., assuming crime just because it's a low-income area) or appearance.
3. Disproportionate Severity: Assigning "High" or "Critical" severity to minor, non-violent issues (e.g., loitering).

If the report is neutral and objective, return score 0.0 and status "Clear".
"""

class BiasGuard:
    """
    Ethical AI module to detect and flag potential bias in incident analysis.
    Uses Groq Llama 3.3 70B for nuanced understanding, with keyword fallback.
    """
    
    # Fallback Keywords
    SUBJECTIVE_KEYWORDS = ["suspicious", "sketchy", "out of place", "loitering", "gang"]
    SENSITIVE_LOCATIONS = ["Kibera", "Mathare"]

    @staticmethod
    def check(analysis: Dict) -> Dict:
        """
        Analyzes the incident report for potential bias using AI.
        Returns the original analysis enriched with bias metadata.
        """
        # Check API Key
        api_key = os.environ.get("GROQ_API_KEY", "gsk_placeholder_key_replace_me")
        if api_key == "gsk_placeholder_key_replace_me" or not api_key:
            return BiasGuard._fallback_check(analysis)

        try:
            # Construct the input for the AI
            report_context = json.dumps({
                "type": analysis.get("type"),
                "severity": analysis.get("severity"),
                "location": analysis.get("location"),
                "summary": analysis.get("summary")
            })

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this report for bias:\n{report_context}",
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0,
                response_format={"type": "json_object"},
            )
            
            result = chat_completion.choices[0].message.content
            bias_data = json.loads(result)
            
            # Merge AI result into analysis
            analysis["bias_check"] = {
                "checked": True,
                "method": "AI_Llama_3.3",
                "score": bias_data.get("bias_score", 0.0),
                "status": bias_data.get("status", "Clear"),
                "warnings": bias_data.get("warnings", []),
                "reasoning": bias_data.get("reasoning", "")
            }
            
            return analysis

        except Exception as e:
            print(f"BiasGuard AI Error: {e}. Reverting to fallback.")
            return BiasGuard._fallback_check(analysis)

    @staticmethod
    def _fallback_check(analysis: Dict) -> Dict:
        """
        Keyword-based fallback if AI service is unavailable.
        """
        warnings = []
        bias_score = 0.0
        
        description = str(analysis.get("summary", "")).lower() + " " + str(analysis.get("location", "")).lower()
        
        # 1. Subjectivity Check
        if analysis.get("severity") in ["High", "Critical"]:
            for word in BiasGuard.SUBJECTIVE_KEYWORDS:
                if word in description:
                    warnings.append(f"High severity assigned with subjective keyword: '{word}'. Verify objective threat.")
                    bias_score += 0.3
        
        # 2. Location Bias Check
        for loc in BiasGuard.SENSITIVE_LOCATIONS:
            if loc.lower() in description and analysis.get("severity") == "Critical":
                 warnings.append(f"Critical severity in sensitive zone '{loc}'. Ensure severity matches specific threat indicators.")
                 bias_score += 0.2

        bias_score = min(bias_score, 1.0)
        
        analysis["bias_check"] = {
            "checked": True,
            "method": "Keyword_Fallback",
            "score": bias_score,
            "warnings": warnings,
            "status": "Flagged" if bias_score > 0.4 else "Clear"
        }
        
        return analysis
