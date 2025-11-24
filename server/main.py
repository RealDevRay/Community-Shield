import asyncio
import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from datetime import datetime

from models import Incident, PatrolUnit
from agents.sentinel import generate_raw_report
from agents.analyst import analyze_report
from agents.commander import Commander
from agents.hotspot_manager import HotspotManager

app = FastAPI()

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# State
commander = Commander()
hotspot_manager = HotspotManager()
incidents: Dict[str, Incident] = {}
system_logs: List[str] = []

def log(message: str):
    timestamp = datetime.now().strftime("%H:%M:%S")
    entry = f"[{timestamp}] {message}"
    system_logs.append(entry)
    # Keep logs manageable
    if len(system_logs) > 50:
        system_logs.pop(0)

async def simulation_loop():
    """Background task that simulates the agent loop."""
    while True:
        # 1. Sentinel: Ingest Data
        raw_data = generate_raw_report()
        log(f"🕵️ Sentinel: Picked up signal from {raw_data['source']}")
        
        # 2. Analyst: Process Data (Simulate processing time)
        # For demo purposes, we might skip calling Groq every single second to save API credits/rate limits
        # Let's do it every 10 seconds or so, or just random chance
        import random
        if random.random() > 0.7: # 30% chance to process a new incident
            log(f"🧠 Analyst: Analyzing report...")
            analysis = analyze_report(raw_data["raw_text"])
            
            if analysis.get("lat") is not None:
                incident = Incident(
                    id=raw_data["id"],
                    type=analysis.get("type", "Unknown"),
                    description=analysis.get("summary", raw_data["raw_text"]),
                    location=analysis.get("location", "Unknown"),
                    lat=analysis["lat"],
                    lng=analysis["lng"],
                    severity=analysis.get("severity", "Medium"),
                    timestamp=datetime.now(),
                    source=raw_data["source"]
                )
                
                # Log Bias Warnings if any
                if "bias_check" in analysis and analysis["bias_check"]["warnings"]:
                    for warning in analysis["bias_check"]["warnings"]:
                        log(f"⚖️ BIAS ALERT: {warning}")

                incidents[incident.id] = incident
                log(f"⚠️ New Incident: {incident.type} at {incident.location}")
                
                # 3. Commander: Assign Resources
                unit = commander.assign_unit(incident)
                if unit:
                    log(f"👮 Commander: Dispatched {unit.name} to {incident.location}")
                else:
                    log(f"👮 Commander: No units available for {incident.location}!")
            else:
                log("🧠 Analyst: Could not determine location. Discarding.")
        
        await asyncio.sleep(5) # Wait before next cycle

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

@app.get("/")
def read_root():
    return {"status": "Community Shield System Online"}

@app.get("/api/incidents")
def get_incidents():
    return list(incidents.values())

@app.get("/api/units")
def get_units():
    return commander.get_units()

@app.get("/api/logs")
def get_logs():
    return system_logs

@app.get("/api/hotspots")
def get_hotspots():
    return hotspot_manager.get_predictive_hotspots()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
