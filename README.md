# SentinelCrash AI - Accident Prevention & Response Platform

A full-stack web system for accident detection using **YOLOv5 + OpenCV** on uploaded road footage with end-to-end workflow:

1. **Detection Section:** CCTV/video upload, collision object detection, damage and severity classification, and speed alerts.
2. **Response Section:** authority notifications and detailed accident review summaries (time, place, footage, preventive/remedial measures).
3. **Analytics Section:** charts, observations table, survival rates, and historical summaries.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (dark minimalist responsive UI + animations + Chart.js)
- **Backend API:** Node.js + Express + Multer + UUID
- **ML Core:** Python + OpenCV + YOLOv5 (torch hub)
- **Data Stores:** PostgreSQL + MongoDB + local JSON fallback

## Folder Layout

- `frontend/` - modern responsive UI
- `backend/` - Node API and storage adapters
- `python-analyzer/` - YOLOv5/OpenCV video analysis pipeline
- `db/postgresql/` - SQL schema
- `db/mongodb/` - collection and index plan
- `docs/` - architecture and API docs

## Quick Start

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Install python dependencies

```bash
cd ../python-analyzer
python3 -m pip install -r requirements.txt
```

### 3) Run DBs (optional but recommended)

Configure:

- `POSTGRES_URL` (default `postgresql://postgres:postgres@localhost:5432/sentinelcrash`)
- `MONGO_URL` (default `mongodb://localhost:27017`)

If DBs are unavailable, app still works using `backend/data/records.json`.

### 4) Start the app

```bash
cd ../backend
npm start
```

Open `http://localhost:3000`.

## API Endpoints

- `POST /api/analyze` - upload video + metadata, run YOLO/OpenCV analysis
- `POST /api/authorities/alert` - alert authority and generate review summary
- `GET /api/reports/summary` - severity distribution and observations table data
- `GET /api/simulations` - previous sample simulation feed records

## Notes

- YOLOv5 loading uses `torch.hub`. If unavailable, analyzer falls back to OpenCV motion-based heuristics.
- Uploaded footage is served via `/uploads/<file>`.
- Designed for straightforward API integration across separate folders.
