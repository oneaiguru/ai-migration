/**
 * Mock Schedule Service for standalone demo builds.
 * Provides in-memory data and simple CRUD helpers without any backend calls.
 */

import { realAuthService } from './realAuthService';
import {
  buildScheduleResponse,
  mockScheduleEntries,
  mockScheduleEmployees,
  mockSchedulePeriod,
  mockScheduleStats
} from '../data/mockData';

export interface ScheduleData {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftTypeId: string;
  status: 'scheduled' | 'confirmed' | 'absent' | 'partial' | 'pending';
  duration: number;
  color?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  scheduledHours: number;
  plannedHours: number;
  photo?: string;
  skills: string[];
  isActive: boolean;
}

export interface ScheduleGridResponse {
  employees: Employee[];
  schedules: ScheduleData[];
  period: {
    startDate: string;
    endDate: string;
  };
  statistics: {
    totalEmployees: number;
    totalShifts: number;
    coveragePercentage: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const schedules: ScheduleData[] = [...mockScheduleEntries];
const employees: Employee[] = [...mockScheduleEmployees];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const recalculateStatistics = () => ({
  totalEmployees: employees.length,
  totalShifts: schedules.length,
  coveragePercentage: mockScheduleStats.coveragePercentage
});

const ensureAuth = () => {
  if (!realAuthService.getAuthToken()) {
    // Auth service always produces a token, but keep the guard for safety.
    throw new Error('Demo authentication token is missing.');
  }
};

class MockScheduleService {
  async checkApiHealth(): Promise<boolean> {
    return true;
  }

  async getCurrentSchedule(_startDate?: string, _endDate?: string): Promise<ApiResponse<ScheduleGridResponse>> {
    ensureAuth();
    const response = buildScheduleResponse();
    response.employees = clone(employees);
    response.schedules = clone(schedules);
    response.statistics = recalculateStatistics();
    response.period = { ...mockSchedulePeriod };
    return { success: true, data: response };
  }

  async updateSchedule(scheduleId: string, updates: Partial<ScheduleData>): Promise<ApiResponse<ScheduleData>> {
    ensureAuth();
    const index = schedules.findIndex(schedule => schedule.id === scheduleId);
    if (index === -1) {
      return { success: false, error: 'Schedule record not found' };
    }

    schedules[index] = {
      ...schedules[index],
      ...updates,
      duration: updates.duration ?? schedules[index].duration
    };

    return { success: true, data: clone(schedules[index]) };
  }

  async createSchedule(scheduleData: Omit<ScheduleData, 'id'>): Promise<ApiResponse<ScheduleData>> {
    ensureAuth();
    const newSchedule: ScheduleData = {
      ...scheduleData,
      id: `mock-schedule-${Date.now()}`
    };

    schedules.push(newSchedule);
    return { success: true, data: clone(newSchedule) };
  }

  async deleteSchedule(scheduleId: string): Promise<ApiResponse<void>> {
    ensureAuth();
    const initialLength = schedules.length;
    const remaining = schedules.filter(schedule => schedule.id !== scheduleId);

    if (remaining.length === initialLength) {
      return { success: false, error: 'Schedule record not found' };
    }

    schedules.length = 0;
    schedules.push(...remaining);
    return { success: true };
  }

  async getEmployeesWithStats(): Promise<ApiResponse<Employee[]>> {
    ensureAuth();
    return { success: true, data: clone(employees) };
  }

  async bulkUpdateSchedules(updates: Array<{ id: string; changes: Partial<ScheduleData> }>): Promise<ApiResponse<ScheduleData[]>> {
    ensureAuth();
    const updated: ScheduleData[] = [];

    updates.forEach(update => {
      const index = schedules.findIndex(schedule => schedule.id === update.id);
      if (index !== -1) {
        schedules[index] = {
          ...schedules[index],
          ...update.changes,
          duration: update.changes.duration ?? schedules[index].duration
        };
        updated.push(clone(schedules[index]));
      }
    });

    return { success: true, data: updated };
  }

  async validateScheduleMove(scheduleId: string, targetEmployeeId: string, targetDate: string): Promise<ApiResponse<{ valid: boolean; conflicts: string[] }>> {
    ensureAuth();
    const conflicts: string[] = [];

    const existing = schedules.find(schedule => schedule.id === scheduleId);
    if (!existing) {
      conflicts.push('shift_not_found');
    }

    const alreadyBooked = schedules.some(schedule => schedule.employeeId === targetEmployeeId && schedule.date === targetDate && schedule.id !== scheduleId);
    if (alreadyBooked) {
      conflicts.push('target_slot_taken');
    }

    return {
      success: true,
      data: {
        valid: conflicts.length === 0,
        conflicts
      }
    };
  }
}

export const realScheduleService = new MockScheduleService();
export default realScheduleService;
