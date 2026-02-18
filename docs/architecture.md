# Architecture Overview

## Processing Flow

1. User uploads CCTV/dashcam video from the web UI.
2. Node API stores file temporarily and sends it to Python analyzer.
3. Python analyzer:
   - Attempts YOLOv5 object detection (`torch.hub`)
   - Falls back to OpenCV motion-impact heuristics when YOLO unavailable
   - Produces severity, collision objects, speed alert, survival estimate, and measures
4. Node persists records to JSON and optionally PostgreSQL + MongoDB.
5. Dashboard updates charts/tables and supports authority dispatch summary generation.

## Storage Strategy

- PostgreSQL stores structured accident event rows for relational reporting.
- MongoDB stores flexible analysis and authority alert documents.
- Local JSON maintains offline-compatible operation.
