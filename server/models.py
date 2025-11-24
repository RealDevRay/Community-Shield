from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Incident(BaseModel):
    id: str
    type: str  # e.g., "Robbery", "Accident", "Gunfire"
    description: str
    location: str # Text description
    lat: float
    lng: float
    severity: str # "Low", "Medium", "High", "Critical"
    timestamp: datetime
    status: str = "New" # "New", "Assigned", "Resolved"
    source: str # "Radio", "Social", "Sensor"

class PatrolUnit(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    status: str = "Idle" # "Idle", "EnRoute", "Busy"
    current_incident_id: Optional[str] = None
