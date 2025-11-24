import math
from typing import List
from models import Incident, PatrolUnit

class Commander:
    def __init__(self):
        # Initialize some dummy patrol units around Nairobi
        self.units: List[PatrolUnit] = [
            PatrolUnit(id="U-001", name="Alpha 1", lat=-1.2834, lng=36.8235, status="Idle"), # CBD
            PatrolUnit(id="U-002", name="Bravo 2", lat=-1.2635, lng=36.8024, status="Idle"), # Westlands
            PatrolUnit(id="U-003", name="Charlie 3", lat=-1.3120, lng=36.7890, status="Idle"), # Kibera
            PatrolUnit(id="U-004", name="Delta 4", lat=-1.2760, lng=36.8480, status="Idle"), # Eastleigh
            PatrolUnit(id="U-005", name="Echo 5", lat=-1.2921, lng=36.8219, status="Idle"), # Upper Hill
        ]

    def _calculate_distance(self, lat1, lng1, lat2, lng2):
        # Simple Euclidean distance for demo speed (approximate)
        return math.sqrt((lat1 - lat2)**2 + (lng1 - lng2)**2)

    def assign_unit(self, incident: Incident):
        """Finds the nearest Idle unit and assigns it to the incident."""
        if incident.status != "New":
            return None

        nearest_unit = None
        min_dist = float('inf')

        for unit in self.units:
            if unit.status == "Idle":
                dist = self._calculate_distance(incident.lat, incident.lng, unit.lat, unit.lng)
                if dist < min_dist:
                    min_dist = dist
                    nearest_unit = unit

        if nearest_unit:
            nearest_unit.status = "EnRoute"
            nearest_unit.current_incident_id = incident.id
            incident.status = "Assigned"
            return nearest_unit
        
        return None

    def get_units(self):
        return self.units
