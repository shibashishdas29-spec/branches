#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="wordpress-local"
OUT_DIR="dist"
ZIP_NAME="local-wp-accident-prevention-import.zip"

if [[ ! -d "$ROOT_DIR/wp-content" ]]; then
  echo "Missing $ROOT_DIR/wp-content"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/local-site.sql" ]]; then
  echo "Missing $ROOT_DIR/local-site.sql"
  exit 1
fi

mkdir -p "$OUT_DIR"
TMP_DIR="$(mktemp -d)"
cp -R "$ROOT_DIR/wp-content" "$TMP_DIR/wp-content"
cp "$ROOT_DIR/local-site.sql" "$TMP_DIR/local-site.sql"

(
  cd "$TMP_DIR"
  zip -r "$OLDPWD/$OUT_DIR/$ZIP_NAME" wp-content local-site.sql >/dev/null
)

rm -rf "$TMP_DIR"
echo "Created $OUT_DIR/$ZIP_NAME"
