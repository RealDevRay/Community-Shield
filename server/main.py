import asyncio
import uvicorn
import os
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

from models import Incident, PatrolUnit
from agents.sentinel import generate_raw_report
from agents.analyst import analyze_report
from agents.commander import Commander
from agents.hotspot_manager import HotspotManager

load_dotenv()

app = FastAPI()

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# State
commander = Commander()
hotspot_manager = HotspotManager()

def log(message: str, log_type: str = "info", incident_id: str = None, unit_id: str = None):
    """Log a message to Supabase logs table"""
    try:
        supabase.table("logs").insert({
            "message": message,
            "log_type": log_type,
            "incident_id": incident_id,
            "unit_id": unit_id
        }).execute()
    except Exception as e:
        print(f"Error logging to Supabase: {e}")

async def simulation_loop():
    """Background task that simulates the agent loop."""
    while True:
        # 1. Sentinel: Ingest Data
        raw_data = generate_raw_report()
        log(f"🕵️ Sentinel: Picked up signal from {raw_data['source']}", log_type="info")
        
        # 2. Analyst: Process Data
        import random
        if random.random() > 0.7: # 30% chance to process a new incident
            log(f"🧠 Analyst: Analyzing report...", log_type="analysis")
            analysis = analyze_report(raw_data["raw_text"])
            
            if analysis.get("lat") is not None:
                # Create incident in Supabase
                incident_data = {
                    "type": analysis.get("type", "Unknown"),
                    "severity": analysis.get("severity", "Medium"),
                    "location": analysis.get("location", "Unknown"),
                    "lat": analysis["lat"],
                    "lng": analysis["lng"],
                    "summary": analysis.get("summary", raw_data["raw_text"]),
                    "raw_text": raw_data["raw_text"],
                    "source": raw_data["source"],
                    "status": "Active"
                }
                
                result = supabase.table("incidents").insert(incident_data).execute()
                incident_id = result.data[0]["id"]
                
                # Log Bias Check
                if "bias_check" in analysis:
                    bias_check = analysis["bias_check"]
                    supabase.table("bias_checks").insert({
                        "incident_id": incident_id,
                        "method": bias_check.get("method", "Unknown"),
                        "bias_score": bias_check.get("score", 0.0),
                        "status": bias_check.get("status", "Clear"),
                        "warnings": bias_check.get("warnings", []),
                        "reasoning": bias_check.get("reasoning", "")
                    }).execute()
                    
                    if bias_check.get("warnings"):
                        for warning in bias_check["warnings"]:
                            log(f"⚖️ BIAS ALERT: {warning}", log_type="bias", incident_id=incident_id)

                log(f"⚠️ New Incident: {incident_data['type']} at {incident_data['location']}", 
                    log_type="incident", incident_id=incident_id)
                
                # 3. Commander: Assign Resources
                # Get available units from Supabase
                units_response = supabase.table("units").select("*").eq("status", "Idle").execute()
                
                if units_response.data:
                    # Find nearest unit
                    nearest_unit = min(units_response.data, key=lambda u: 
                        ((u["lat"] - analysis["lat"])**2 + (u["lng"] - analysis["lng"])**2)**0.5
                    )
                    
                    # Update unit status
                    supabase.table("units").update({
                        "status": "Responding",
                        "current_incident_id": incident_id
                    }).eq("id", nearest_unit["id"]).execute()
                    
                    # Update incident with assigned unit
                    supabase.table("incidents").update({
                        "assigned_unit_id": nearest_unit["id"],
                        "status": "Dispatched"
                    }).eq("id", incident_id).execute()
                    
                    log(f"👮 Commander: Dispatched {nearest_unit['name']} to {incident_data['location']}", 
                        log_type="dispatch", incident_id=incident_id, unit_id=nearest_unit["id"])
                else:
                    log(f"👮 Commander: No units available for {incident_data['location']}!", 
                        log_type="dispatch", incident_id=incident_id)
            else:
                log("🧠 Analyst: Could not determine location. Discarding.", log_type="analysis")
        
        await asyncio.sleep(5) # Wait before next cycle

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

@app.get("/")
def read_root():
    return {"status": "Community Shield System Online", "database": "Supabase"}

@app.get("/api/incidents")
def get_incidents():
    """Get all incidents from Supabase"""
    try:
        result = supabase.table("incidents").select("*").order("created_at", desc=True).limit(50).execute()
        # Convert Supabase response to frontend format
        incidents = []
        for inc in result.data:
            incidents.append({
                "id": inc["id"],
                "type": inc["type"],
                "description": inc["summary"],
                "location": inc["location"],
                "lat": float(inc["lat"]) if inc["lat"] else None,
                "lng": float(inc["lng"]) if inc["lng"] else None,
                "severity": inc["severity"],
                "timestamp": inc["created_at"],
                "source": inc["source"],
                "status": inc["status"]
            })
        return incidents
    except Exception as e:
        print(f"Error fetching incidents: {e}")
        return []

@app.get("/api/units")
def get_units():
    """Get all units from Supabase"""
    try:
        result = supabase.table("units").select("*").execute()
        # Convert to frontend format
        units = []
        for unit in result.data:
            units.append({
                "id": unit["id"],
                "name": unit["name"],
                "type": unit["type"],
                "status": unit["status"],
                "lat": float(unit["lat"]),
                "lng": float(unit["lng"])
            })
        return units
    except Exception as e:
        print(f"Error fetching units: {e}")
        return []

@app.get("/api/logs")
def get_logs():
    """Get recent logs from Supabase"""
    try:
        result = supabase.table("logs").select("*").order("created_at", desc=True).limit(50).execute()
        
        if not result.data:
            return []
        
        # Format logs to match frontend expectation
        formatted_logs = []
        for log in result.data:
            try:
                # Extract time from ISO timestamp
                timestamp = log['created_at']
                if 'T' in timestamp:
                    time_part = timestamp.split('T')[1][:8]  # Get HH:MM:SS
                else:
                    time_part = timestamp[-8:]
                
                formatted_logs.append(f"[{time_part}] {log['message']}")
            except Exception as e:
                print(f"Error formatting log: {e}")
                formatted_logs.append(f"[--:--:--] {log['message']}")
        
        return list(reversed(formatted_logs))
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return []

@app.get("/api/hotspots")
def get_hotspots():
    """Get predictive hotspots from Supabase"""
    result = supabase.table("hotspots").select("*").order("risk_score", desc=True).execute()
    return result.data

@app.post("/api/dispatch")
def dispatch_all():
    """Emergency: Dispatch all available units"""
    result = supabase.table("units").update({"status": "Responding"}).eq("status", "Idle").execute()
    log("🚨 EMERGENCY: All units dispatched!", log_type="dispatch")
    return {"message": "All units dispatched", "count": len(result.data)}

@app.post("/api/emergency")
def emergency_protocol():
    """Activate emergency protocol"""
    log("🚨 EMERGENCY PROTOCOL ACTIVATED!", log_type="dispatch")
    return {"message": "Emergency protocol activated"}

@app.post("/api/map/zoom/{location}")
def zoom_to_location(location: str):
    """Zoom map to predefined location"""
    locations = {
        "cbd": {"lat": -1.2834, "lng": 36.8235, "zoom": 14},
        "westlands": {"lat": -1.2635, "lng": 36.8024, "zoom": 14},
        "kibera": {"lat": -1.3120, "lng": 36.7890, "zoom": 14},
        "eastleigh": {"lat": -1.2760, "lng": 36.8480, "zoom": 14},
        "karen": {"lat": -1.3200, "lng": 36.7050, "zoom": 14}
    }
    if location.lower() in locations:
        return locations[location.lower()]
    return {"error": "Location not found"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
