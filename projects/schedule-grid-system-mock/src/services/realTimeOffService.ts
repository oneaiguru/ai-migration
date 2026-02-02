/**
 * Mock Time Off Service for demo build.
 */

import { realAuthService } from './realAuthService';
import {
  buildTimeOffStatistics,
  mockTimeOffBalances,
  mockTimeOffRequests
} from '../data/mockData';

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'sick_leave' | 'personal' | 'unpaid' | 'maternity' | 'bereavement';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  isEmergency?: boolean;
  attachments?: string[];
}

export interface BalanceBucket {
  total: number;
  used: number;
  pending?: number;
  available: number;
}

export interface TimeOffBalance {
  employeeId: string;
  vacation: BalanceBucket;
  sickLeave: BalanceBucket;
  personal: BalanceBucket;
  year: number;
  lastUpdated: string;
}

export interface TimeOffCalendarResponse {
  requests: TimeOffRequest[];
  balances: TimeOffBalance[];
  statistics: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageApprovalTime: number;
  };
  conflicts?: Array<{
    id: string;
    description: string;
    affectedRequests: string[];
    severity: 'high' | 'medium' | 'low';
  }>;
}

export interface TimeOffPolicy {
  id: string;
  name: string;
  type: TimeOffRequest['type'];
  maxDaysPerRequest: number;
  maxDaysPerYear: number;
  minNoticeDays: number;
  requiresApproval: boolean;
  allowCarryover: boolean;
  carryoverLimit?: number;
  blackoutDates?: string[];
  rules: Array<{
    condition: string;
    action: string;
    message: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const requests: TimeOffRequest[] = [...mockTimeOffRequests];
const balances: TimeOffBalance[] = [...mockTimeOffBalances];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ensureAuth = () => {
  if (!realAuthService.getAuthToken()) {
    throw new Error('Demo authentication token is missing.');
  }
};

const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
  return !(aEnd < bStart || aStart > bEnd);
};

class MockTimeOffService {
  async checkApiHealth(): Promise<boolean> {
    return true;
  }

  async getTimeOffCalendar(startDate: string, endDate: string, employeeIds?: string[]): Promise<ApiResponse<TimeOffCalendarResponse>> {
    ensureAuth();
    const filtered = requests.filter(request => {
      const inRange = overlaps(request.startDate, request.endDate, startDate, endDate);
      const matchesEmployee = !employeeIds || employeeIds.length === 0 || employeeIds.includes(request.employeeId);
      return inRange && matchesEmployee;
    });

    return {
      success: true,
      data: {
        requests: clone(filtered),
        balances: clone(balances),
        statistics: buildTimeOffStatistics(),
        conflicts: []
      }
    };
  }

  async validateTimeOffRequest(request: Partial<TimeOffRequest>): Promise<ApiResponse<{ valid: boolean; errors: string[]; warnings: string[] }>> {
    ensureAuth();
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!request.type) errors.push('Тип отсутствия обязателен');
    if (!request.startDate || !request.endDate) errors.push('Укажите даты начала и окончания');
    if (request.startDate && request.endDate && request.startDate > request.endDate) {
      errors.push('Дата начала не может быть позже даты окончания');
    }

    if (request.isEmergency) {
      warnings.push('Заявка помечена как экстренная');
    }

    return {
      success: true,
      data: {
        valid: errors.length === 0,
        errors,
        warnings
      }
    };
  }

  async submitTimeOffRequest(request: Omit<TimeOffRequest, 'id' | 'submittedAt' | 'status'>): Promise<ApiResponse<TimeOffRequest>> {
    ensureAuth();
    const newRequest: TimeOffRequest = {
      ...request,
      id: `mock-timeoff-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    requests.push(newRequest);
    return { success: true, data: clone(newRequest) };
  }

  async updateTimeOffRequest(id: string, updates: Partial<TimeOffRequest>): Promise<ApiResponse<TimeOffRequest>> {
    ensureAuth();
    const index = requests.findIndex(item => item.id === id);
    if (index === -1) {
      return { success: false, error: 'Заявка не найдена' };
    }

    requests[index] = { ...requests[index], ...updates };
    return { success: true, data: clone(requests[index]) };
  }

  async cancelTimeOffRequest(id: string, reason?: string): Promise<ApiResponse<void>> {
    ensureAuth();
    const index = requests.findIndex(item => item.id === id);
    if (index === -1) {
      return { success: false, error: 'Заявка не найдена' };
    }

    requests[index].status = 'cancelled';
    requests[index].rejectionReason = reason;
    return { success: true };
  }

  async approveTimeOffRequest(id: string, comments?: string): Promise<ApiResponse<TimeOffRequest>> {
    ensureAuth();
    const index = requests.findIndex(item => item.id === id);
    if (index === -1) {
      return { success: false, error: 'Заявка не найдена' };
    }

    requests[index] = {
      ...requests[index],
      status: 'approved',
      approvedBy: realAuthService.getCurrentUser()?.email || 'manager@wfm.demo',
      approvedAt: new Date().toISOString(),
      reason: comments ?? requests[index].reason
    };

    return { success: true, data: clone(requests[index]) };
  }

  async rejectTimeOffRequest(id: string, reason: string): Promise<ApiResponse<TimeOffRequest>> {
    ensureAuth();
    const index = requests.findIndex(item => item.id === id);
    if (index === -1) {
      return { success: false, error: 'Заявка не найдена' };
    }

    requests[index] = {
      ...requests[index],
      status: 'rejected',
      rejectionReason: reason
    };

    return { success: true, data: clone(requests[index]) };
  }

  async getTimeOffPolicies(): Promise<ApiResponse<TimeOffPolicy[]>> {
    ensureAuth();
    const policies: TimeOffPolicy[] = [
      {
        id: 'policy-vacation',
        name: 'Стандартный оплачиваемый отпуск',
        type: 'vacation',
        maxDaysPerRequest: 21,
        maxDaysPerYear: 28,
        minNoticeDays: 14,
        requiresApproval: true,
        allowCarryover: true,
        carryoverLimit: 5,
        rules: [
          {
            condition: 'requested_days > available_days',
            action: 'warn',
            message: 'Недостаточно доступных дней отпуска'
          }
        ]
      }
    ];

    return { success: true, data: clone(policies) };
  }
}

export const realTimeOffService = new MockTimeOffService();
export default realTimeOffService;
