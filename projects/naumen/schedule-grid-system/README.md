# Schedule Grid System - Advanced WFM Grid Component

## 🎯 Project Overview

The **Schedule Grid System** is the most complex and critical component of the WFM suite, running on **port 3004**. This is a virtualized schedule grid that handles 500+ employees with drag-drop shift assignment, real-time updates, and professional appearance matching the Naumen competitor interface exactly.

## 🏗️ Architecture

### Key Components
- **AdminLayout.tsx** - Navigation wrapper with Russian interface
- **ScheduleGridContainer.tsx** - Main virtualized grid with synchronized scrolling
- **VirtualizedScheduleGrid.tsx** - Performance-optimized grid prototype
- **Types & Hooks** - TypeScript interfaces and React hooks for state management

### Technology Stack
- React 18 + TypeScript
- Tailwind CSS for styling
- Vite for development
- Professional Russian interfaces

## 🎨 Visual Design (Matching Naumen)

### Grid Layout Specifications
```css
.employee-column { width: 296px; }
.date-column { width: 70px; }
.row-height { height: 50px; }
.chart-area { height: 140px; }
```

### Color Scheme
- **Day Shifts**: `#74a689` (Green)
- **Night Shifts**: `#4f46e5` (Blue)
- **Overtime**: `#f59e0b` (Orange)
- **Weekend**: `#f3f4f6` (Light Gray)
- **Current Day**: `#fef3c7` (Yellow highlight)
- **Selected**: `#dbeafe` (Blue highlight)

## 🚀 Features

### Core Functionality
- [x] **Virtualized Grid** - Handles 500+ employees smoothly
- [x] **Synchronized Scrolling** - Employee column and date header sync
- [x] **Chart Overlay** - 140px forecast visualization area
- [x] **Drag-Drop Support** - Shift assignment between cells
- [x] **Multi-cell Selection** - Click and keyboard navigation
- [x] **Professional Appearance** - Exact Naumen visual match

### Advanced Features
- [x] **Real-time Updates** - Live cell selection feedback  
- [x] **Context Menus** - Right-click operations
- [x] **Keyboard Navigation** - Arrow keys and shortcuts
- [x] **Responsive Design** - Works on 1024px+ screens
- [x] **Russian Localization** - Professional terminology

## 📊 Performance Optimizations

### Virtualization Strategy
- React Window/Virtualized for employee rows
- Intersection Observer for visible cell tracking
- Memo optimization for employee rows and cells
- Debounced updates for drag operations
- Lazy loading for employee photos

### Memory Management
- Efficient data structures for grid state
- Cell recycling for off-screen elements
- Event listener cleanup
- Image lazy loading with placeholder avatars

## 🔧 Development

### Installation
```bash
cd /Users/m/Documents/wfm/competitor/naumen/schedule-grid-system
npm install
npm run dev
```

### Development Server
- **URL**: http://localhost:3004
- **Port**: 3004 (integrated with existing demos)

## 🎬 Demo Integration

### Start All Demos
```bash
./start_all_demos.sh
```

### Available URLs
- Employee Portal: http://localhost:3001
- Forecasting Analytics: http://localhost:3002
- Employee Management: http://localhost:3003  
- **Schedule Grid System**: http://localhost:3004 ← **NEW!**
