# Accident Prevention & Detection System

A full-stack, modular web platform for road accident detection from uploaded CCTV/video footage using YOLOv5 + OpenCV, with authority alert workflows and detailed accident review analytics.

## Architecture

- **Frontend** (`frontend/`): Responsive dark UI (HTML/CSS/JS), upload + analysis UX, authority alerts, analytics charts/tables.
- **Node.js API** (`backend-node/`): Upload handling, orchestration, report persistence, summary APIs.
- **Python AI Service** (`backend-python/`): YOLOv5/OpenCV video analysis for collision/accident signals and severity scoring.
- **Databases** (`database/`): PostgreSQL schema for structured reports, MongoDB collection model for event telemetry.
- **Shared** (`shared/`): Sample JSON payload contracts.

## Quick Start

### 1) Python service
```bash
cd backend-python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python analyzer.py --help
```

### 2) Node API + Frontend host
```bash
cd backend-node
npm install
npm run dev
```

The frontend is served from `http://localhost:8080`.

## Endpoints

- `POST /api/analyze` - Upload video and process accident detection
- `POST /api/alerts` - Notify authorities and persist intervention
- `GET /api/reports` - Fetch all accident reports
- `GET /api/summary` - Aggregate stats for dashboards

## Notes

- By default, if YOLO weights are unavailable the analyzer uses motion/impact heuristics with OpenCV and still returns structured output.
- Replace `backend-python/models/yolov5s.pt` with your custom model weights for production-grade precision.

## Folder Packaging

Each module is separated in dedicated folders for easy API integration and deployment:

- `frontend`
- `backend-node`
- `backend-python`
- `database`
- `shared`
