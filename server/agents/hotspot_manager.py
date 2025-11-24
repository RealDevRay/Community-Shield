import random
from typing import List, Dict

class HotspotManager:
    """
    Simulates predictive analysis by generating hotspots based on 'historical' data patterns.
    In a real app, this would query a database of past incidents + lighting data.
    """
    
    def __init__(self):
        # Base locations (Nairobi)
        self.base_hotspots = [
            {"name": "Globe Cinema Roundabout", "lat": -1.2810, "lng": 36.8150, "risk_factor": "Lighting"},
            {"name": "River Road Junction", "lat": -1.2850, "lng": 36.8280, "risk_factor": "History"},
            {"name": "Uhuru Park Corner", "lat": -1.2900, "lng": 36.8180, "risk_factor": "Social Sentiment"},
            {"name": "Ngong Road/Prestige", "lat": -1.3000, "lng": 36.7800, "risk_factor": "Traffic Pattern"},
        ]

    def get_predictive_hotspots(self) -> List[Dict]:
        """
        Returns a list of current high-risk zones.
        """
        current_hotspots = []
        
        for spot in self.base_hotspots:
            # Simulate dynamic risk levels
            risk_score = random.uniform(0.6, 0.95)
            
            if risk_score > 0.7:
                current_hotspots.append({
                    "name": spot["name"],
                    "lat": spot["lat"],
                    "lng": spot["lng"],
                    "risk_score": round(risk_score, 2),
                    "reason": f"High risk detected due to {spot['risk_factor']}",
                    "recommended_action": "Deploy visible patrol"
                })
                
        return current_hotspots
