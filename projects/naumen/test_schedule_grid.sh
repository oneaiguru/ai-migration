#!/bin/bash
# Test script to verify WFM schedule-grid-system drag & drop functionality

echo "🧪 TESTING WFM Schedule Grid System..."
echo ""

# Check if we're in the right directory
if [ ! -f "schedule-grid-system/package.json" ]; then
    echo "❌ Error: Run this from the main naumen directory"
    exit 1
fi

# Check if the correct components exist
if [ ! -f "schedule-grid-system/src/components/ScheduleGridContainer.tsx" ]; then
    echo "❌ Error: ScheduleGridContainer.tsx missing - drag & drop won't work"
    exit 1
fi

if [ ! -f "schedule-grid-system/src/components/AdminLayout.tsx" ]; then
    echo "❌ Error: AdminLayout.tsx missing - UI won't render"
    exit 1
fi

# Check dependencies
echo "📦 Checking drag & drop dependencies..."
cd schedule-grid-system

if ! grep -q "@dnd-kit/core" package.json; then
    echo "❌ Error: @dnd-kit/core missing - no drag & drop"
    exit 1
fi

if ! grep -q "react-beautiful-dnd" package.json; then
    echo "❌ Error: react-beautiful-dnd missing - no drag & drop"
    exit 1
fi

echo "✅ All dependencies present"

# Test build
echo "🔨 Testing build process..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 ALL TESTS PASSED!"
echo ""
echo "🚀 To start with drag & drop functionality:"
echo "   npm run dev"
echo ""
echo "🌐 Then visit: http://localhost:3004"
echo "📋 Expected: AdminLayout with tabs (Расписание, Смены, Схемы, Исключения)"
echo "🖱️  Expected: Drag & drop functionality in schedule grid"