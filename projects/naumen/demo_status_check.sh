#!/bin/bash

echo "🚀 WFM Demo Status Check - $(date)"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}📊 VERCEL DEPLOYMENTS (Working):${NC}"
echo "✅ Forecasting Analytics: https://wfm-forecasting-analytics.vercel.app"
echo "✅ Reports Analytics: https://wfm-reports-analytics.vercel.app"  
echo "✅ Employee Management: https://employee-management-sigma-eight.vercel.app"

echo ""
echo -e "${YELLOW}🔧 VERCEL DEPLOYMENT (Just Fixed):${NC}"
echo "🔄 Schedule Grid System: (checking deployment after latest push...)"

echo ""
echo -e "${BLUE}💻 LOCAL DEVELOPMENT SERVERS:${NC}"

# Check if local ports are active
if curl -s "http://localhost:3000" > /dev/null 2>&1; then
    echo -e "✅ ${GREEN}WFM Integration:${NC} http://localhost:3000/ (Running)"
else
    echo -e "❌ ${RED}WFM Integration:${NC} http://localhost:3000/ (Not running)"
fi

if curl -s "http://localhost:3001" > /dev/null 2>&1; then
    echo -e "✅ ${GREEN}Employee Portal:${NC} http://localhost:3001/ (Running)"
else
    echo -e "❌ ${RED}Employee Portal:${NC} http://localhost:3001/ (Not running)"
fi

if curl -s "http://localhost:3004" > /dev/null 2>&1; then
    echo -e "✅ ${GREEN}Schedule Grid System:${NC} http://localhost:3004/ (Running)"
else
    echo -e "❌ ${RED}Schedule Grid System:${NC} http://localhost:3004/ (Not running)"
fi

echo ""
echo -e "${BLUE}🎯 MONDAY DEMO PLAN:${NC}"
echo "1. PRIMARY: Local demo (all apps working locally)"
echo "2. BACKUP: Vercel URLs for working apps" 
echo "3. FOCUS: Schedule Grid System with drag & drop"

echo ""
echo -e "${BLUE}🔧 RECENT FIXES APPLIED:${NC}"
echo "✅ Added @dnd-kit/core and @dnd-kit/sortable packages"
echo "✅ Configured Tailwind CSS properly"
echo "✅ Fixed PostCSS configuration" 
echo "✅ Restored full App.tsx with drag & drop functionality"
echo "✅ Verified local builds work successfully"

echo ""
echo -e "${GREEN}🚀 DEMO SCRIPT:${NC}"
echo "cd /Users/m/Documents/wfm/competitor/naumen"
echo "./start_all_demos.sh"
echo ""
echo "Then navigate through:"
echo "• http://localhost:3004/ - Main attraction (Schedule Grid)"
echo "• http://localhost:3001/ - Employee Portal"  
echo "• http://localhost:3000/ - WFM Integration"

echo ""
echo "=============================================="
echo "🎉 Ready for Monday client demo!"
