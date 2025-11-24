import random
import time
from datetime import datetime
import uuid

CRIME_TYPES = ["Robbery", "Assault", "Traffic Accident", "Gunfire", "Suspicious Activity", "Medical Emergency"]
LOCATIONS = [
    {"name": "CBD near Archives", "lat": -1.2834, "lng": 36.8235},
    {"name": "Westlands near Sarit", "lat": -1.2635, "lng": 36.8024},
    {"name": "Kibera near DC", "lat": -1.3120, "lng": 36.7890},
    {"name": "Eastleigh 1st Ave", "lat": -1.2760, "lng": 36.8480},
    {"name": "Karen Shopping Center", "lat": -1.3200, "lng": 36.7050},
    {"name": "Thika Road Mall", "lat": -1.2200, "lng": 36.8900},
]
SOURCES = ["Police Radio", "Twitter", "ShotSpotter", "Anonymous Tip"]

def generate_raw_report():
    """Generates a raw, unstructured text report simulating a real-world alert."""
    crime = random.choice(CRIME_TYPES)
    loc = random.choice(LOCATIONS)
    source = random.choice(SOURCES)
    
    # Simulate unstructured text variations
    templates = [
        f"Report of {crime} at {loc['name']}. Units respond.",
        f"ALERT: {source} reporting {crime} in progress near {loc['name']}.",
        f"Citizen report: Saw {crime} happening at {loc['name']}. Please help.",
        f"Sensor triggered: Possible {crime} detected at {loc['name']} coordinates {loc['lat']}, {loc['lng']}.",
        f"Urgent: {crime} spotted. Location: {loc['name']}.",
    ]
    
    raw_text = random.choice(templates)
    
    return {
        "id": str(uuid.uuid4()),
        "raw_text": raw_text,
        "source": source,
        "timestamp": datetime.now().isoformat(),
        "ground_truth_lat": loc["lat"], # For simulation accuracy if needed, but Analyst should extract
        "ground_truth_lng": loc["lng"]
    }
