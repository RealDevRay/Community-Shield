from typing import Dict, List

class BiasGuard:
    """
    Ethical AI module to detect and flag potential bias in incident analysis.
    """
    
    # Keywords that might indicate subjective or biased reporting if not accompanied by specific evidence
    SUBJECTIVE_KEYWORDS = ["suspicious", "sketchy", "out of place", "loitering", "gang"]
    
    # Locations that historically might face over-policing (for simulation of location-bias check)
    # In a real app, this would be dynamic based on historical data analysis, not hardcoded.
    SENSITIVE_LOCATIONS = ["Kibera", "Mathare"]

    @staticmethod
    def check(analysis: Dict) -> Dict:
        """
        Analyzes the incident report for potential bias.
        Returns the original analysis enriched with bias metadata.
        """
        warnings = []
        bias_score = 0.0
        
        description = analysis.get("summary", "").lower() + " " + analysis.get("location", "").lower()
        
        # 1. Subjectivity Check
        # If high severity is assigned based purely on subjective terms
        if analysis.get("severity") in ["High", "Critical"]:
            for word in BiasGuard.SUBJECTIVE_KEYWORDS:
                if word in description:
                    warnings.append(f"High severity assigned with subjective keyword: '{word}'. Verify objective threat.")
                    bias_score += 0.3
        
        # 2. Location Bias Check (Simulation)
        # Check if severity is elevated just because of the location
        for loc in BiasGuard.SENSITIVE_LOCATIONS:
            if loc.lower() in description and analysis.get("severity") == "Critical":
                 warnings.append(f"Critical severity in sensitive zone '{loc}'. Ensure severity matches specific threat indicators.")
                 bias_score += 0.2

        # Cap score
        bias_score = min(bias_score, 1.0)
        
        # Append metadata
        analysis["bias_check"] = {
            "checked": True,
            "score": bias_score, # 0.0 = Low Risk, 1.0 = High Risk
            "warnings": warnings,
            "status": "Flagged" if bias_score > 0.4 else "Clear"
        }
        
        return analysis
