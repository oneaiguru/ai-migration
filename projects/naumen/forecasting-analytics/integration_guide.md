// Integration Guide for Manual Adjustment System
// Step-by-step instructions to integrate into ForecastingLayout.tsx

// ========================
// STEP 1: Add these imports to ForecastingLayout.tsx
// ========================

import AdjustmentGrid from './AdjustmentGrid';
import BulkAdjustments from './BulkAdjustments';
import DataValidator from './DataValidator';
import UndoRedoManager from './UndoRedoManager';

// ========================
// STEP 2: Update ForecastData interface
// ========================

interface ForecastData {
  id: string;              // ADD THIS
  timestamp: string;
  timeSlot: string;        // ADD THIS - format: "08:00-08:30"
  predicted: number;
  actual?: number;
  confidence: number;
  adjustment: number;      // ADD THIS - default: 0
  total: number;          // ADD THIS - predicted + adjustment
  requiredAgents: number;
  isWeekend: boolean;     // ADD THIS
  hour: number;           // ADD THIS
  dayOfWeek: number;      // ADD THIS
  locked?: boolean;       // ADD THIS - default: false
  validated?: boolean;    // ADD THIS - default: true
}

// ========================
// STEP 3: Add to ForecastingState
// ========================

interface ForecastingState {
  // ... existing properties
  selectedIntervals: string[];           // ADD THIS
  showAdjustmentTools: boolean;         // ADD THIS - default: false
}

// ========================
// STEP 4: Add these handlers to your component
// ========================

const handleAdjustmentChange = useCallback((intervalId: string, adjustment: number) => {
  setState(prev => ({
    ...prev,
    forecastData: prev.forecastData.map(item => 
      item.id === intervalId 
        ? { 
            ...item, 
            adjustment, 
            total: item.predicted + adjustment,
            requiredAgents: Math.ceil((item.predicted + adjustment) * 0.15)
          }
        : item
    )
  }));
}, []);

const toggleAdjustmentTools = () => {
  setState(prev => ({ ...prev, showAdjustmentTools: !prev.showAdjustmentTools }));
};