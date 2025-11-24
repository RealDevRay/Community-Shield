# Community Shield AI App

## Overview

**Community Shield** is an advanced AI-powered predictive policing system designed to enhance community safety through proactive threat detection and optimized resource allocation. By leveraging predictive analytics, the system analyzes historical crime data, lighting infrastructure, and social media sentiment to identify potential hotspots and recommend optimal patrol routes. A multi-agent AI architecture enables real-time incident response while incorporating ethical AI practices including bias detection.

## Features

- **Predictive Hotspot Analysis**: Analyzes historical crime reports, lighting infrastructure data, and social media sentiment to predict potential security incidents and identify high-risk areas.
- **Optimized Patrol Routing**: Recommends real-time patrol routes based on predictive models and current resource availability.
- **Bias Detection Module**: Implements ethical AI practices to detect and mitigate algorithmic bias in predictive models.
- **Real-time Incident Monitoring**: Visualizes incidents on an interactive map as they are detected.
- **Multi-Agent AI System**:
  - **Sentinel**: Continuously monitors and ingests raw data streams (simulated reports, social media, sensors).
  - **Analyst**: Processes raw text using LLMs (Groq API) to extract structured data (location, severity, type).
  - **Commander**: Makes strategic decisions to assign the nearest available patrol units to confirmed incidents.
- **Live Dashboard**: Displays system logs, active unit status, incident statistics, and predictive insights.
- **Resource Management**: Tracks patrol unit locations and availability in real-time.

## Architecture

The system follows a modular architecture:

1.  **Frontend**: Built with **React (Vite)** and **Tailwind CSS**. It provides a futuristic, responsive dashboard for command center operators.
2.  **Backend**: Powered by **FastAPI**. It orchestrates the AI agents and maintains the system state (incidents, units, logs).
3.  **AI Agents**:
    - `Sentinel`: The eyes and ears. Generates/ingests raw reports.
    - `Analyst`: The brain. Uses Large Language Models to interpret unstructured data.
    - `Commander`: The operational lead. Optimizes resource allocation based on proximity and incident severity.

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Leaflet (Map)
- **Backend**: Python, FastAPI, Uvicorn
- **AI/ML**: Groq API (Llama 3 / Mixtral) for text analysis
- **State Management**: In-memory (Python dictionaries for MVP)

## Practical Integration Roadmap

To transition Community Shield from a simulation to a real-world operational tool, the following integration roadmap is designed:

### 1. Sentinel: Real-World Ingestion

- **File Watcher (Immediate Implementation)**:
  - **Mechanism**: A dedicated directory (`server/data/input`) acts as a drop zone.
  - **Workflow**: Operators or automated scripts drop text files (e.g., `report_001.txt`) containing incident details. The Sentinel watches this folder, reads new files instantly, and processes them as live signals.
- **Social Media Listening**:
  - **Integration**: Connect to Twitter/X API v2.
  - **Function**: Filter for keywords (e.g., "accident", "gunshots", "help") within a specific geofence (e.g., Nairobi coordinates) to detect citizen-reported incidents in real-time.
- **SMS/WhatsApp Hotline**:
  - **Integration**: Twilio API.
  - **Function**: Allow citizens to report incidents via a dedicated WhatsApp number or SMS shortcode. These messages are pushed directly to the Sentinel's ingestion queue.

2.  **AI Analysis**:
    - The `Sentinel` forwards the raw text to the `Analyst`.
    - The `Analyst` (via Groq) parses: "Fire at Westlands Mall" -> **Type**: Fire, **Severity**: High, **Location**: Westlands Mall (-1.2684, 36.8111).
3.  **Strategic Decision**:
    - The `Commander` queries the live unit database.
    - It calculates travel time (using OSRM or Google Maps API) rather than just straight-line distance.
    - It dispatches "Unit Bravo" (2 mins away) and sends a notification to their mobile app.
4.  **Operational Visualization**:
    - The Command Center Dashboard flashes a "High Alert".
    - The map zooms to the incident.
    - A secure log entry is created: "Dispatch authorized by AI Commander at 14:00:05".

## Installation & Usage

### Prerequisites

- Node.js & npm
- Python 3.8+
- Groq API Key (for full Analyst functionality)

### Backend Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Unix
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend Setup

1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Use Cases

- **Urban Security**: Monitoring high-density city areas for rapid response.
- **Event Management**: Managing crowd safety during large public gatherings.
- **Emergency Response**: Coordinating multi-agency responses to natural disasters or accidents.
