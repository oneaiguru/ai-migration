// /Users/m/git/client/naumen/employee-management/src/types/employee.ts

// ========================
// COMPREHENSIVE TYPE DEFINITIONS ALIGNED WITH REAL WFM FIELDS
// ========================

export type EmployeeStatus = 'active' | 'inactive' | 'vacation' | 'terminated' | 'probation';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface EmployeePersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  photo?: string;
  dateOfBirth?: Date;
  address?: string;
  emergencyContact?: EmergencyContact;
}

export interface EmployeeCredentials {
  wfmLogin: string;
  externalLogins: string[];
  passwordSet: boolean;
  passwordLastUpdated?: Date;
}

export interface WorkSchemeAssignment {
  id: string;
  name: string;
  type?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface EmployeeOrgPlacement {
  orgUnit: string;
  office: string;
  timeZone: string;
  hourNorm: number;
  workScheme?: WorkSchemeAssignment;
  workSchemeHistory?: WorkSchemeAssignment[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  managerId: string;
  memberCount: number;
  targetUtilization: number;
}

export type EmployeeManager = {
  id: string;
  fullName: string;
} | string;

export interface EmployeeWorkInfo {
  position: string;
  team: Team;
  manager: EmployeeManager;
  hireDate: Date;
  contractType: 'full-time' | 'part-time' | 'contractor';
  salary?: number;
  workLocation: string;
  department: string;
}

export interface SkillAssignment {
  id: string;
  name: string;
  category: 'technical' | 'communication' | 'product' | 'language' | 'soft-skill';
  level: 1 | 2 | 3 | 4 | 5; // 1=Beginner, 5=Expert
  verified: boolean;
  lastAssessed: Date;
  assessor: string;
  certificationRequired: boolean;
  priority?: number;
  activeFrom?: Date;
  activeTo?: Date;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  scheduleChanges: boolean;
  announcements: boolean;
  reminders: boolean;
}

export interface EmployeePreferences {
  preferredShifts: string[];
  notifications: NotificationSettings;
  language: 'ru' | 'en' | 'ky';
  workingHours: {
    start: string;
    end: string;
  };
  schemePreferences?: string[];
}

export interface EmployeePerformance {
  averageHandleTime: number;
  callsPerHour: number;
  qualityScore: number;
  adherenceScore: number;
  customerSatisfaction: number;
  lastEvaluation: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expirationDate?: Date;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
}

export interface EmployeeMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  lastLogin?: Date;
  previousStatus?: EmployeeStatus;
}

export type TaskSource = 'manual' | 'bulk-edit' | 'system';

export interface EmployeeTask {
  id: string;
  message: string;
  createdAt: Date;
  createdBy: string;
  source: TaskSource;
}

export interface Employee {
  id: string;
  employeeId: string;
  status: EmployeeStatus;
  personalInfo: EmployeePersonalInfo;
  credentials: EmployeeCredentials;
  workInfo: EmployeeWorkInfo;
  orgPlacement: EmployeeOrgPlacement;
  skills: SkillAssignment[];
  reserveSkills: SkillAssignment[];
  tags: string[];
  preferences: EmployeePreferences;
  performance: EmployeePerformance;
  certifications: Certification[];
  metadata: EmployeeMetadata;
  personnelNumber?: string;
  actualAddress?: string;
  tasks?: EmployeeTask[];
}

export interface EmployeeFilters {
  search: string;
  team: string;
  status: string;
  skill: string;
  position: string;
  orgUnit?: string;
  showInactive: boolean;
  sortBy: 'name' | 'position' | 'team' | 'hireDate' | 'performance';
  sortOrder: 'asc' | 'desc';
}

export interface BulkAction {
  type: 'change-team' | 'bulk-edit' | 'export-selected' | 'deactivate' | 'activate';
  targetIds: string[];
  data?: unknown;
}

export interface ViewModes {
  current: 'grid' | 'table' | 'cards';
  available: string[];
}

export interface EmployeeStats {
  total: number;
  active: number;
  vacation: number;
  probation: number;
  inactive: number;
  terminated: number;
}

// Temporary alias to avoid breaking older components
export type Skill = SkillAssignment;
