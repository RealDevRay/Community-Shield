import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const incidentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const policeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Predictive Hotspot Icon
const hotspotIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Incident {
    id: string;
    type: string;
    description: string;
    lat: number;
    lng: number;
    severity: string;
    status: string;
}

interface Unit {
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: string;
}

interface Hotspot {
    id: string;
    lat: number;
    lng: number;
    risk: string;
    description: string;
}

interface MapProps {
    incidents: Incident[];
    units: Unit[];
    zoomTarget?: { lat: number; lng: number; zoom: number } | null;
}

const ZoomHandler: React.FC<{ zoomTarget: { lat: number; lng: number; zoom: number } | null }> = ({ zoomTarget }) => {
    const map = useMap();

    useEffect(() => {
        if (zoomTarget) {
            map.setView([zoomTarget.lat, zoomTarget.lng], zoomTarget.zoom);
        }
    }, [zoomTarget, map]);

    return null;
};

const Map: React.FC<MapProps> = ({ incidents, units, zoomTarget }) => {
    // Mock predictive hotspots - in real app, this would come from API
    const hotspots: Hotspot[] = [
        { id: 'h1', lat: -1.2834, lng: 36.8235, risk: 'High', description: 'CBD Area - High foot traffic' },
        { id: 'h2', lat: -1.2635, lng: 36.8024, risk: 'Medium', description: 'Westlands - Commercial district' },
    ];

    return (
        <div className="h-full w-full">
            <MapContainer center={[-1.2921, 36.8219]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <ZoomHandler zoomTarget={zoomTarget} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* Predictive Hotspots */}
                {hotspots.map((hotspot) => (
                    <Marker key={hotspot.id} position={[hotspot.lat, hotspot.lng]} icon={hotspotIcon}>
                        <Popup>
                            <div className="text-gray-900">
                                <strong>Predicted Hotspot</strong><br />
                                Risk: <span className="text-orange-600 font-bold">{hotspot.risk}</span><br />
                                {hotspot.description}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {incidents.map((inc) => (
                    <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={incidentIcon}>
                        <Popup>
                            <div className="text-gray-900">
                                <strong>{inc.type}</strong><br />
                                {inc.description}<br />
                                <span className="text-red-600 font-bold">{inc.severity}</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {units.map((unit) => (
                    <Marker key={unit.id} position={[unit.lat, unit.lng]} icon={policeIcon}>
                        <Popup>
                            <div className="text-gray-900">
                                <strong>{unit.name}</strong><br />
                                Status: {unit.status}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
