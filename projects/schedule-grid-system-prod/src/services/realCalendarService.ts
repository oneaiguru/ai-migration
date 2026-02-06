/**
 * Mock Calendar Service for demo build.
 */

import { realAuthService } from './realAuthService';
import {
  buildCalendarResponse,
  mockCalendarEvents,
  mockCalendarView
} from '../data/mockData';

export interface CalendarEvent {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  type: 'shift' | 'vacation' | 'sick_leave' | 'training' | 'meeting' | 'personal';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  color?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurringRule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  metadata?: Record<string, any>;
}

export interface CalendarView {
  id: string;
  name: string;
  type: 'month' | 'week' | 'day' | 'agenda';
  startDate: string;
  endDate: string;
  employeeIds?: string[];
  eventTypes?: string[];
  showWeekends: boolean;
  timeZone?: string;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  view: CalendarView;
  statistics: {
    totalEvents: number;
    confirmedEvents: number;
    pendingEvents: number;
    conflicts: number;
  };
  conflicts?: Array<{
    id: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    eventIds: string[];
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const events: CalendarEvent[] = [...mockCalendarEvents];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ensureAuth = () => {
  if (!realAuthService.getAuthToken()) {
    throw new Error('Demo authentication token is missing.');
  }
};

const calculateStats = () => ({
  totalEvents: events.length,
  confirmedEvents: events.filter(event => event.status === 'confirmed').length,
  pendingEvents: events.filter(event => event.status === 'pending').length,
  conflicts: 0
});

const detectConflicts = (candidate: Partial<CalendarEvent>): string[] => {
  if (!candidate.startDate || !candidate.endDate) return [];
  return events
    .filter(event => event.employeeId === candidate.employeeId)
    .filter(event =>
      event.id !== candidate.id &&
      !(event.endDate < candidate.startDate || event.startDate > candidate.endDate)
    )
    .map(event => `conflict-with-${event.id}`);
};

class MockCalendarService {
  async checkApiHealth(): Promise<boolean> {
    return true;
  }

  async getCalendarEvents(view: Partial<CalendarView>): Promise<ApiResponse<CalendarResponse>> {
    ensureAuth();
    const response = buildCalendarResponse();
    const filtered = events.filter(event => {
      const withinRange = (!view.startDate || event.endDate >= view.startDate) && (!view.endDate || event.startDate <= view.endDate);
      const matchesEmployee = !view.employeeIds || view.employeeIds.length === 0 || view.employeeIds.includes(event.employeeId);
      const matchesType = !view.eventTypes || view.eventTypes.length === 0 || view.eventTypes.includes(event.type);
      return withinRange && matchesEmployee && matchesType;
    });

    response.events = clone(filtered);
    response.view = { ...mockCalendarView, ...view } as CalendarView;
    response.statistics = calculateStats();
    response.conflicts = [];

    return { success: true, data: response };
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<ApiResponse<CalendarEvent>> {
    ensureAuth();
    const conflicts = detectConflicts(event);
    const newEvent: CalendarEvent = {
      ...event,
      id: `mock-cal-${Date.now()}`,
      status: event.status ?? 'pending'
    };

    events.push(newEvent);

    return {
      success: true,
      data: {
        ...clone(newEvent),
        metadata: { conflicts }
      }
    };
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> {
    ensureAuth();
    const index = events.findIndex(event => event.id === id);
    if (index === -1) {
      return { success: false, error: 'Событие не найдено' };
    }

    const updated = { ...events[index], ...updates };
    const conflicts = detectConflicts({ ...updated, id });
    events[index] = updated;

    return { success: true, data: { ...clone(updated), metadata: { conflicts } } };
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    ensureAuth();
    const initialLength = events.length;
    const remaining = events.filter(event => event.id !== id);
    if (remaining.length === initialLength) {
      return { success: false, error: 'Событие не найдено' };
    }

    events.length = 0;
    events.push(...remaining);
    return { success: true };
  }

  async moveEvent(id: string, newStartDate: string, newEndDate: string): Promise<ApiResponse<CalendarEvent>> {
    return this.updateEvent(id, { startDate: newStartDate, endDate: newEndDate });
  }

  async confirmEvent(id: string): Promise<ApiResponse<CalendarEvent>> {
    return this.updateEvent(id, { status: 'confirmed' });
  }

  async cancelEvent(id: string, reason?: string): Promise<ApiResponse<CalendarEvent>> {
    return this.updateEvent(id, { status: 'cancelled', metadata: { reason } });
  }

  async checkConflicts(event: Partial<CalendarEvent>): Promise<ApiResponse<{ hasConflicts: boolean; conflicts: string[] }>> {
    ensureAuth();
    const conflicts = detectConflicts(event);
    return {
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts
      }
    };
  }

  async getAvailableSlots(): Promise<ApiResponse<{ slots: string[] }>> {
    ensureAuth();
    return {
      success: true,
      data: {
        slots: ['08:00-12:00', '12:00-16:00', '16:00-20:00']
      }
    };
  }
}

export const realCalendarService = new MockCalendarService();
export default realCalendarService;
