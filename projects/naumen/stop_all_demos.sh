#!/bin/bash
# /Users/m/Documents/wfm/competitor/naumen/stop_all_demos.sh

echo "🛑 STOPPING ALL WFM DEMOS..."

# Kill all vite processes on our ports
pkill -f "vite.*3001" 2>/dev/null || true
pkill -f "vite.*3002" 2>/dev/null || true
pkill -f "vite.*3003" 2>/dev/null || true
pkill -f "vite.*3004" 2>/dev/null || true

echo "✅ All demos stopped (including Schedule Grid System)"
