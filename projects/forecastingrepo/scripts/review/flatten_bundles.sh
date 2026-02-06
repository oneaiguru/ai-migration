#!/usr/bin/env bash
set -euo pipefail

# Flatten review bundles (no subfolders) into reviewer-specific dirs
# Creates ~/Downloads/review_flat_<timestamp> with folders:
#   Pipeline_Reviewer, API_Reviewer, Eval_Backtest_Reviewer,
#   Config_Schema_Reviewer, UI_Reviewer, Coordinator_Docs

TS=${TS:-$(date +%Y%m%d_%H%M%S)}
SRC=${SRC:-$HOME/reviews}
UI_BUNDLE=${UI_BUNDLE:-}
INCLUDE_UI_BUNDLE=${INCLUDE_UI_BUNDLE:-0}
UI_COMP_ZIP=$(ls -1 "$SRC"/ui_components_bundle.zip "$SRC"/ui_components_bundle/ui_components_bundle*.zip 2>/dev/null | head -1 || true)
UI_CONF_ZIP=$(ls -1 "$SRC"/ui_config_bundle.zip "$SRC"/ui_config_bundle/ui_config_bundle*.zip 2>/dev/null | head -1 || true)
UI_SUPP_ZIP=$(ls -1 "$SRC"/ui_supporting_bundle.zip "$SRC"/ui_supporting_bundle/ui_supporting_bundle*.zip 2>/dev/null | head -1 || true)
OUTROOT=${OUTROOT:-$HOME/Downloads/review_flat_$TS}

mkdir -p "$OUTROOT"

flatten_zip() {
  local zip_path="$1"; shift
  local dest="$1"; shift
  if [[ ! -f "$zip_path" ]]; then
    echo "[skip] Missing zip: $zip_path" >&2
    return 0
  fi
  mkdir -p "$dest"
  local tmp
  tmp=$(mktemp -d)
  unzip -q "$zip_path" -d "$tmp"
  # Copy files, flattening subpaths by replacing '/' with '__'
  while IFS= read -r -d '' f; do
    rel="${f#$tmp/}"
    safe="${rel//\//__}"
    cp -f "$f" "$dest/$safe"
  done < <(find "$tmp" -type f -print0)
  rm -rf "$tmp"
  echo "[ok] Flattened $(basename "$zip_path") -> $dest"
}

# Resolve backend zips
PIPE_ZIP=$(ls -1 "$SRC"/pipeline_bundle.zip 2>/dev/null || true)
API_ZIP=$(ls -1 "$SRC"/api_bundle.zip 2>/dev/null || true)
EVAL_ZIP=$(ls -1 "$SRC"/eval_bundle.zip 2>/dev/null || true)
CONF_ZIP=$(ls -1 "$SRC"/config_bundle.zip 2>/dev/null || true)
REST_ZIP=$(ls -1 "$SRC"/rest_code_bundle.zip 2>/dev/null || true)

# Resolve latest UI bundle if not provided
if [[ -z "$UI_BUNDLE" ]]; then
  UI_BUNDLE=$(ls -1t "$HOME"/Downloads/ui_review_bundle_*.zip 2>/dev/null | head -1 || true)
fi

# Targets
DEST_PIPE="$OUTROOT/Pipeline_Reviewer"
DEST_API="$OUTROOT/API_Reviewer"
DEST_EVAL="$OUTROOT/Eval_Backtest_Reviewer"
DEST_CONF="$OUTROOT/Config_Schema_Reviewer"
DEST_UI_COMP="$OUTROOT/UI_Components_Reviewer"
DEST_UI_CONF="$OUTROOT/UI_Config_Reviewer"
DEST_UI_SUPP="$OUTROOT/UI_Supporting_Reviewer"
DEST_COORD="$OUTROOT/Coordinator_Docs"

mkdir -p "$DEST_COORD"

# Flatten each bundle
[[ -n "$PIPE_ZIP" ]] && flatten_zip "$PIPE_ZIP" "$DEST_PIPE" || true
[[ -n "$API_ZIP" ]] && flatten_zip "$API_ZIP" "$DEST_API" || true
[[ -n "$EVAL_ZIP" ]] && flatten_zip "$EVAL_ZIP" "$DEST_EVAL" || true
[[ -n "$CONF_ZIP" ]] && flatten_zip "$CONF_ZIP" "$DEST_CONF" || true

# UI bundle (optional combined pack)
if [[ "$INCLUDE_UI_BUNDLE" == "1" ]]; then
  if [[ -n "$UI_BUNDLE" && -f "$UI_BUNDLE" ]]; then
    flatten_zip "$UI_BUNDLE" "$OUTROOT/UI_All_Full_Bundle"
  else
    mkdir -p "$OUTROOT/UI_All_Full_Bundle"
    cat > "$OUTROOT/UI_All_Full_Bundle/README_UI_BUNDLE.txt" << EOF
No combined UI bundle zip was found.
Ask UI to run: ui/forecast-ui/scripts/make_ui_review_bundle.sh
Expected output: ~/Downloads/ui_review_bundle_YYYYMMDD_HHMMSS.zip
EOF
  fi
fi

if [[ -n "$UI_COMP_ZIP" && -f "$UI_COMP_ZIP" ]]; then
  flatten_zip "$UI_COMP_ZIP" "$DEST_UI_COMP"
fi

if [[ -n "$UI_CONF_ZIP" && -f "$UI_CONF_ZIP" ]]; then
  flatten_zip "$UI_CONF_ZIP" "$DEST_UI_CONF"
fi

if [[ -n "$UI_SUPP_ZIP" && -f "$UI_SUPP_ZIP" ]]; then
  flatten_zip "$UI_SUPP_ZIP" "$DEST_UI_SUPP"
fi

# Coordinator docs: copy key in-repo readmes and the trimmed pack (if exists)
cp -f "$HOME/reviews/README_REVIEW_BUNDLES.md" "$DEST_COORD/README_REVIEW_BUNDLES.md" 2>/dev/null || true
for f in \
  reviews/DEMO_FREEZE.md \
  reviews/README_STATUS.md \
  reviews/NOTES/api.md \
  docs/System/Review_Pack.md \
  docs/SOP/review-process.md \
  docs/SOP/roles-and-ownership.md \
  docs/SOP/task-files-workflow.md
do
  [[ -f "$f" ]] && cp -f "$f" "$DEST_COORD/$(basename "$f")"
done

# Also flatten rest_code bundle to Coordinator (optional) for reference
[[ -n "$REST_ZIP" ]] && flatten_zip "$REST_ZIP" "$DEST_COORD/rest_code_refs" || true

echo "\nDone. Reviewer folders are under: $OUTROOT"
