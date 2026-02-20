#!/usr/bin/env bash
set -euo pipefail

for dir in frontend backend-node backend-python database shared; do
  zip -r "${dir}.zip" "$dir" >/dev/null
  echo "Created ${dir}.zip"
done
