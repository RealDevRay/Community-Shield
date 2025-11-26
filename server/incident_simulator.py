"""
Simulated Incident Feed for Community Shield - Standalone Version
No .env dependencies - ready for immediate testing
"""
import asyncio
import random
from datetime import datetime
from supabase import create_client

# Supabase credentials (hardcoded for MVP demo)
SUPABASE_URL = "https://ojqpusrqleqnlbugsqeq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcXB1c3JxbGVxbmxidWdzcWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NzY5NjcsImV4cCI6MjA0ODE1Mjk2N30.zKQlWBcqkXOUy0FxQCNTJXxNzGtFKdNLxVnPRoXCQXI"

# Initialize Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Realistic incident templates
INCIDENTS = [
    {"type": "Theft", "location": "Westlands Mall", "lat": -1.2674, "lng": 36.8075, "severity": "Medium",
     "summaries": ["Phone stolen at food court", "Shoplifting at electronics store", "Wallet pickpocketed", "Bag snatching attempt"]},
    
    {"type": "Robbery", "location": "CBD, Moi Avenue", "lat": -1.2834, "lng": 36.8235, "severity": "High",
     "summaries": ["Armed robbery at M-Pesa agent", "Mugging near bus station", "Violent robbery at jewelry store"]},
    
    {"type": "Carjacking", "location": "Thika Road", "lat": -1.2500, "lng": 36.8900, "severity": "Critical",
     "summaries": ["Vehicle hijacking at traffic lights", "Armed carjacking near Roysambu", "SUV stolen at gunpoint"]},
    
    {"type": "Assault", "location": "Kibera", "lat": -1.3133, "lng": 36.7828, "severity": "High",
     "summaries": ["Physical altercation reported", "Gang violence incident", "Domestic dispute turned violent"]},
    
    {"type": "Theft", "location": "Eastleigh", "lat": -1.2833, "lng": 36.8500, "severity": "Medium",
     "summaries": ["Motorcycle theft", "Shop break-in overnight", "Mobile phone snatched"]},
    
    {"type": "Burglary", "location": "Karen", "lat": -1.3197, "lng": 36.7078, "severity": "High",
     "summaries": ["Home invasion reported", "Residential break-in", "Burglary at gated community"]},
]

async def generate_incidents():
    """Generate incidents every 30 seconds"""
    print("\n" + "=" * 70)
    print("  🎭 COMMUNITY SHIELD - INCIDENT SIMULATOR")
    print("=" * 70)
    print("📍 Generating realistic incidents every 30 seconds")
    print("🔴 Press Ctrl+C to stop\n")
    
    count = 0
    
    while True:
        try:
            # Pick random incident
            template = random.choice(INCIDENTS)
            summary = random.choice(template["summaries"])
            
            # Add randomness to coordinates
            lat = template["lat"] + random.uniform(-0.01, 0.01)
            lng = template["lng"] + random.uniform(-0.01, 0.01)
            
            incident = {
                "type": template["type"],
                "summary": summary,
                "location": template["location"],
                "lat": str(lat),
                "lng": str(lng),
                "severity": template["severity"],
                "source": "Simulator",
                "status": "Active",
                "bias_score": round(random.uniform(0.0, 0.3), 2)
            }
            
            # Insert into Supabase
            result = supabase.table("incidents").insert(incident).execute()
            count += 1
            
            # Log it
            log_msg = f"🎭 Simulated: {incident['type']} at {incident['location']}"
            supabase.table("logs").insert({"message": log_msg}).execute()
            
            # Print confirmation
            print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] Incident #{count}")
            print(f"   📍 {incident['location']}")
            print(f"   🚨 {incident['type']} - {incident['severity']}")
            print(f"   📝 {summary}")
            print("-" * 70)
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Wait 30 seconds
        await asyncio.sleep(30)

if __name__ == "__main__":
    try:
        asyncio.run(generate_incidents())
    except KeyboardInterrupt:
        print("\n\n🛑 Simulator stopped by user")
        print("=" * 70)
