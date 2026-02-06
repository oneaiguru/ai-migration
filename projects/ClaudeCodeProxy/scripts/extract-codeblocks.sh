#!/usr/bin/env bash
set -euo pipefail

# Extract fenced code blocks from a Markdown file into a target directory.
# Usage: scripts/extract-codeblocks.sh <markdown-file> <out-dir>
# Notes:
# - Writes files as block_0001.txt, block_0002.txt … by default.
# - If a fence info string contains 'filename=PATH', uses that PATH under out-dir.

in="${1:?markdown file}"
out="${2:-extracted}"
mkdir -p "$out"

awk -v OUT="$out" '
BEGIN{inblk=0; idx=0; fn=""}
/^```/ {
  if (!inblk) {
    inblk=1; idx++; fn="";
    # parse info string for filename=...
    match($0, /filename=([^ ]+)/, m);
    if (m[1] != "") {
      fn=m[1];
      gsub(/^["'\[]|["'\]]$/, "", fn);
    }
    next;
  } else {
    inblk=0;
    next;
  }
}
{
  if (inblk) {
    if (fn=="") {
      printf "%s\n", $0 >> sprintf("%s/block_%04d.txt", OUT, idx);
    } else {
      # ensure parent dirs
      cmd = sprintf("mkdir -p \"%s/%s\"", OUT, gensub(/\/[^\/]*$/, "", 1, fn)); system(cmd);
      printf "%s\n", $0 >> sprintf("%s/%s", OUT, fn);
    }
  }
}
' "$in"

echo "Extracted fenced blocks to $out/"

