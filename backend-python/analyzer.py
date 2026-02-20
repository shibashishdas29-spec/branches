#!/usr/bin/env python3
import argparse
import json
import os
from dataclasses import dataclass, asdict
from typing import List, Dict

import cv2
import numpy as np


@dataclass
class FrameDetection:
    frame_idx: int
    collision_score: float
    objects: List[str]


def load_yolo_model():
    weights_path = os.path.join(os.path.dirname(__file__), 'models', 'yolov5s.pt')
    if not os.path.exists(weights_path):
        return None
    try:
        import torch
        model = torch.hub.load('ultralytics/yolov5', 'custom', path=weights_path, force_reload=False)
        model.conf = 0.25
        return model
    except Exception:
        return None


def classify_damage(collision_peak: float):
    if collision_peak > 0.9:
        return 'Severe Structural Damage', 'Critical', 32
    if collision_peak > 0.65:
        return 'Major Exterior Damage', 'High', 58
    if collision_peak > 0.45:
        return 'Moderate Panel/Impact Damage', 'Moderate', 76
    return 'Minor or Near-Miss Damage', 'Low', 92


def estimate_speed_risk(motion_level: float):
    if motion_level > 25:
        return 'Very High'
    if motion_level > 16:
        return 'High'
    if motion_level > 10:
        return 'Moderate'
    return 'Low'


def analyze_video(video_path: str) -> Dict:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError('Unable to open video file')

    yolo_model = load_yolo_model()
    prev_gray = None
    frame_idx = 0
    sampled = []
    motion_scores = []

    tracked_objects = {'car', 'truck', 'bus', 'motorcycle', 'person'}

    while True:
      ok, frame = cap.read()
      if not ok:
          break

      if frame_idx % 5 != 0:
          frame_idx += 1
          continue

      gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
      gray = cv2.GaussianBlur(gray, (5, 5), 0)

      collision_score = 0.0
      if prev_gray is not None:
          flow = cv2.absdiff(gray, prev_gray)
          motion_level = float(np.mean(flow))
          motion_scores.append(motion_level)
          collision_score = min(1.0, motion_level / 30.0)

      labels = []
      if yolo_model is not None:
          results = yolo_model(frame[..., ::-1], size=640)
          detected = results.pandas().xyxy[0]['name'].tolist() if len(results.pandas().xyxy) else []
          labels = [d for d in detected if d in tracked_objects]

      sampled.append(FrameDetection(frame_idx=frame_idx, collision_score=collision_score, objects=list(set(labels))))

      prev_gray = gray
      frame_idx += 1

    cap.release()

    if not sampled:
        raise RuntimeError('No readable frames in video')

    collision_peak = max(d.collision_score for d in sampled)
    avg_motion = float(np.mean(motion_scores)) if motion_scores else 0.0
    damage_class, severity, survival_rate = classify_damage(collision_peak)
    speed_risk = estimate_speed_risk(avg_motion)

    top_detections = sorted(sampled, key=lambda x: x.collision_score, reverse=True)[:8]

    return {
        'severity': severity,
        'damage_class': damage_class,
        'survival_rate': survival_rate,
        'speed_risk': speed_risk,
        'detections': [asdict(t) for t in top_detections],
        'review_summary': (
            f'Collision peak score {collision_peak:.2f}; motion index {avg_motion:.2f}; '
            f'classified as {severity} severity with {damage_class}.'
        ),
    }


def main():
    parser = argparse.ArgumentParser(description='YOLOv5 + OpenCV accident analyzer')
    parser.add_argument('--video', required=True)
    parser.add_argument('--location', default='Unknown')
    parser.add_argument('--mode', default='live-upload')
    args = parser.parse_args()

    result = analyze_video(args.video)
    result['location'] = args.location
    result['mode'] = args.mode
    print(json.dumps(result))


if __name__ == '__main__':
    main()
