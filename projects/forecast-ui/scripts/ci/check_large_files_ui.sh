#!/usr/bin/env bash
set -euo pipefail

WARN=${1:-350}
BLOCK=${2:-500}

RED() { printf "\033[31m%s\033[0m\n" "$*"; }
YEL() { printf "\033[33m%s\033[0m\n" "$*"; }

STATUS=0
while IFS= read -r -d '' f; do
  LOC=$(wc -l < "$f" | tr -d ' ')
  if [ "$LOC" -ge "$BLOCK" ]; then
    if grep -q "@allow-large-file:" "$f"; then
      YEL "WAIVED: $f is $LOC lines (>= $BLOCK) but has allow-large-file tag"
    else
      RED "BLOCK: $f is $LOC lines (>= $BLOCK). Add // @allow-large-file:<ticket> or split."
      STATUS=1
    fi
  elif [ "$LOC" -ge "$WARN" ]; then
    YEL "WARN:  $f is $LOC lines (>= $WARN). Consider splitting."
  fi
done < <(find src -type f \( -name '*.tsx' -o -name '*.ts' \) -print0)

exit $STATUS
