// Employee Portal - Core TypeScript Types
// This file establishes the type system for the entire employee portal

// User and Authentication
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: string;
  team: {
    id: string;
    name: string;
    manager: string;
  };
  role: 'agent' | 'senior_agent' | 'team_lead';
  hireDate: Date;
  status: 'active' | 'inactive' | 'vacation';
  preferences: EmployeePreferences;
  skills: Skill[];
}

export interface EmployeePreferences {
  preferredShifts: ShiftType[];
  notifications: NotificationPreferences;
  language: 'ru' | 'en' | 'ky';
  timezone: string;
  autoAcceptExchanges: boolean;
}

export interface NotificationPreferences {
  scheduleChanges: boolean;
  shiftReminders: boolean;
  exchangeOffers: boolean;
  requestUpdates: boolean;
  emailDigest: boolean;
  pushNotifications: boolean;
}

// Schedule and Shifts
export interface PersonalShift {
  id: string;
  employeeId: string;
  date: Date;
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  duration: number;  // hours
  type: ShiftType;
  status: ShiftStatus;
  location?: string;
  description?: string;
  breaks: BreakPeriod[];
  isOvertime: boolean;
  createdAt: Date;
  modifiedAt?: Date;
}

export type ShiftType = 'regular' | 'overtime' | 'training' | 'meeting' | 'holiday';
export type ShiftStatus = 'scheduled' | 'confirmed' | 'modified' | 'cancelled' | 'completed';

export interface BreakPeriod {
  startTime: string;
  endTime: string;
  type: 'lunch' | 'short_break' | 'dinner';
  paid: boolean;
}

// Requests System
export interface Request {
  id: string;
  employeeId: string;
  type: RequestType;
  status: RequestStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  startDate: Date;
  endDate?: Date;
  reason: string;
  details?: any; // Type-specific details
  attachments?: string[];
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  approver?: {
    id: string;
    name: string;
    comments?: string;
  };
  history: RequestHistoryEntry[];
}

export type RequestType = 
  | 'time_off' 
  | 'vacation' 
  | 'sick_leave' 
  | 'personal_leave'
  | 'shift_change' 
  | 'overtime_request'
  | 'training_request'
  | 'schedule_adjustment';

export type RequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'pending_approval'
  | 'approved' 
  | 'rejected' 
  | 'cancelled'
  | 'expired';

export interface RequestHistoryEntry {
  timestamp: Date;
  action: string;
  actor: string;
  comments?: string;
}

export interface TimeOffRequest extends Request {
  type: 'time_off' | 'vacation' | 'sick_leave' | 'personal_leave';
  details: {
    timeOffType: string;
    halfDay?: boolean;
    emergencyContact?: string;
    medicalCertificate?: boolean;
  };
}

export interface ShiftChangeRequest extends Request {
  type: 'shift_change';
  details: {
    currentShift: PersonalShift;
    requestedShift: Partial<PersonalShift>;
    swapWithEmployee?: string;
    permanentChange: boolean;
  };
}

// Shift Exchange System
export interface ShiftOffer {
  id: string;
  offeringEmployee: {
    id: string;
    name: string;
    team: string;
    photo?: string;
  };
  shift: PersonalShift;
  reason?: string;
  wantedInReturn?: string;
  preferredSkills?: string[];
  status: OfferStatus;
  postedAt: Date;
  expiresAt: Date;
  interestedEmployees: EmployeeInterest[];
  messages: ExchangeMessage[];
}

export type OfferStatus = 'available' | 'pending' | 'completed' | 'cancelled' | 'expired';

export interface EmployeeInterest {
  employeeId: string;
  employeeName: string;
  message?: string;
  proposedExchange?: PersonalShift;
  timestamp: Date;
  status: 'interested' | 'accepted' | 'declined';
}

export interface ExchangeMessage {
  id: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Notifications
export interface Notification {
  id: string;
  employeeId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high';
  data?: any; // Additional notification data
}

export type NotificationType = 
  | 'schedule_change'
  | 'shift_reminder'
  | 'request_update'
  | 'exchange_offer'
  | 'exchange_interest'
  | 'system_announcement'
  | 'training_due'
  | 'policy_update';

// Reports and Analytics
export interface WorkingSummary {
  period: DateRange;
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  timeOffHours: number;
  utilizationRate: number;
  adherenceScore: number;
  lateArrivals: number;
  earlyDepartures: number;
}

export interface AttendanceRecord {
  date: Date;
  scheduledShift?: PersonalShift;
  actualStartTime?: string;
  actualEndTime?: string;
  status: AttendanceStatus;
  notes?: string;
}

export type AttendanceStatus = 
  | 'present' 
  | 'absent' 
  | 'late' 
  | 'early_departure'
  | 'overtime'
  | 'time_off'
  | 'holiday';

export interface TimeOffBalance {
  vacation: {
    total: number;
    used: number;
    remaining: number;
  };
  sick: {
    total: number;
    used: number;
    remaining: number;
  };
  personal: {
    total: number;
    used: number;
    remaining: number;
  };
}

// Skills and Competencies
export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certified: boolean;
  lastAssessed?: Date;
  expiresAt?: Date;
}

// Utility Types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface LoadingState {
  loading: boolean;
  error?: string;
  lastUpdated?: Date;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CalendarProps extends BaseComponentProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  shifts: PersonalShift[];
  viewMode: 'week' | 'month';
  minDate?: Date;
  maxDate?: Date;
}

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

// Export all types for easy importing
export type {
  Employee,
  PersonalShift,
  Request,
  ShiftOffer,
  Notification,
  WorkingSummary,
  AttendanceRecord,
  TimeOffBalance,
  Skill
};