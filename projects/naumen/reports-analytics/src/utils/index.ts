// Utility functions for reports and analytics

import { ChartConfiguration } from 'chart.js';
import { KPIMetric } from '../types';

// KPI Calculation formulas from the refined plan
export const calculateServiceLevel = (callsAnswered: number, totalCalls: number): number => {
  return (callsAnswered / totalCalls) * 100;
};

export const calculateScheduleAdherence = (actual: number, scheduled: number): number => {
  return Math.max(0, 100 - (Math.abs(actual - scheduled) / scheduled) * 100);
};

export const calculateMAPE = (errors: number[]): number => {
  return (errors.reduce((sum, err) => sum + Math.abs(err), 0) / errors.length) * 100;
};

export const calculateAbsenteeismRate = (absentDays: number, totalScheduledDays: number): number => {
  return (absentDays / totalScheduledDays) * 100;
};

export const calculateUtilizationRate = (productiveTime: number, totalTime: number): number => {
  return (productiveTime / totalTime) * 100;
};

// Chart configuration helpers
export const getLineChartConfig = (title: string): Partial<ChartConfiguration> => ({
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 12 } }
      },
    },
  },
});

export const getBarChartConfig = (title: string): Partial<ChartConfiguration> => ({
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 12 } }
      },
    },
  },
});

// Status helpers for KPI metrics
export const getKPIStatus = (value: number, target: number, higherIsBetter: boolean = true): KPIMetric['status'] => {
  const ratio = value / target;
  
  if (higherIsBetter) {
    if (ratio >= 1.1) return 'excellent';
    if (ratio >= 1.0) return 'good';
    if (ratio >= 0.9) return 'warning';
    return 'critical';
  } else {
    if (ratio <= 0.7) return 'excellent';
    if (ratio <= 0.8) return 'good';
    if (ratio <= 0.9) return 'warning';
    return 'critical';
  }
};

export const getStatusColor = (status: KPIMetric['status']): string => {
  const colors = {
    excellent: '#10b981',
    good: '#3b82f6',
    warning: '#f59e0b',
    critical: '#ef4444'
  };
  return colors[status];
};

export const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  const icons = {
    up: '↗',
    down: '↘',
    stable: '→'
  };
  return icons[trend];
};

// Date formatting utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Number formatting
export const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

// Color palettes for charts
export const chartColors = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af'],
  success: ['#10b981', '#059669', '#047857'],
  warning: ['#f59e0b', '#d97706', '#b45309'],
  danger: ['#ef4444', '#dc2626', '#b91c1c'],
  mixed: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
};