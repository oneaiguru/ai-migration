/**
 * Mock Shift Template Service for demo build.
 */

import { realAuthService } from './realAuthService';
import { mockShiftTemplates } from '../data/mockData';

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  breakDuration: number;
  color: string;
  type: 'day' | 'night' | 'overtime';
  workPattern: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ShiftTemplateResponse {
  templates: ShiftTemplate[];
  totalCount: number;
  activeCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const templates: ShiftTemplate[] = [...mockShiftTemplates];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ensureAuth = () => {
  if (!realAuthService.getAuthToken()) {
    throw new Error('Demo authentication token is missing.');
  }
};

const validateTemplateData = (template: Partial<ShiftTemplate>) => {
  const errors: string[] = [];

  if (!template.name) {
    errors.push('Название шаблона обязательно');
  }

  if (!template.startTime || !template.endTime) {
    errors.push('Укажите время начала и окончания смены');
  }

  if (template.startTime && template.endTime && template.startTime === template.endTime) {
    errors.push('Время начала и окончания не могут совпадать');
  }

  if (template.name) {
    const duplicate = templates.find(t => t.name.toLowerCase() === template.name!.toLowerCase() && t.id !== template.id);
    if (duplicate) {
      errors.push('Шаблон с таким названием уже существует');
    }
  }

  return errors;
};

class MockShiftTemplateService {
  async checkApiHealth(): Promise<boolean> {
    return true;
  }

  async getAllTemplates(): Promise<ApiResponse<ShiftTemplateResponse>> {
    ensureAuth();
    return {
      success: true,
      data: {
        templates: clone(templates),
        totalCount: templates.length,
        activeCount: templates.filter(template => template.isActive).length
      }
    };
  }

  async createTemplate(template: Omit<ShiftTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<ApiResponse<ShiftTemplate>> {
    ensureAuth();
    const errors = validateTemplateData(template);
    if (errors.length) {
      return { success: false, error: errors.join(', ') };
    }

    const newTemplate: ShiftTemplate = {
      ...template,
      id: `mock-template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: realAuthService.getCurrentUser()?.email || 'demo@wfm'
    };

    templates.push(newTemplate);
    return { success: true, data: clone(newTemplate) };
  }

  async updateTemplate(id: string, updates: Partial<ShiftTemplate>): Promise<ApiResponse<ShiftTemplate>> {
    ensureAuth();
    const templateIndex = templates.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      return { success: false, error: 'Шаблон не найден' };
    }

    const errors = validateTemplateData({ ...templates[templateIndex], ...updates });
    if (errors.length) {
      return { success: false, error: errors.join(', ') };
    }

    templates[templateIndex] = {
      ...templates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return { success: true, data: clone(templates[templateIndex]) };
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    ensureAuth();
    const index = templates.findIndex(template => template.id === id);
    if (index === -1) {
      return { success: false, error: 'Шаблон не найден' };
    }

    templates.splice(index, 1);
    return { success: true };
  }

  async toggleTemplateStatus(id: string, isActive: boolean): Promise<ApiResponse<ShiftTemplate>> {
    return this.updateTemplate(id, { isActive });
  }

  async getTemplate(id: string): Promise<ApiResponse<ShiftTemplate>> {
    ensureAuth();
    const template = templates.find(item => item.id === id);
    if (!template) {
      return { success: false, error: 'Шаблон не найден' };
    }
    return { success: true, data: clone(template) };
  }

  async validateTemplate(template: Partial<ShiftTemplate>): Promise<ApiResponse<{ valid: boolean; errors: string[]; warnings: string[] }>> {
    ensureAuth();
    const errors = validateTemplateData(template);
    const warnings: string[] = [];

    if (template.type === 'night' && template.breakDuration && template.breakDuration < 30) {
      warnings.push('Для ночных смен рекомендуется перерыв не менее 30 минут');
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

  async getTemplateUsage(_id: string): Promise<ApiResponse<{ employeeCount: number; scheduleCount: number; canDelete: boolean }>> {
    ensureAuth();
    return {
      success: true,
      data: {
        employeeCount: 0,
        scheduleCount: 0,
        canDelete: true
      }
    };
  }

  async bulkUpdateTemplates(operations: Array<{ id: string; operation: 'activate' | 'deactivate' | 'delete' }>): Promise<ApiResponse<{ success: number; failed: number; errors: string[] }>> {
    ensureAuth();
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    operations.forEach(operation => {
      const template = templates.find(item => item.id === operation.id);
      if (!template) {
        failed += 1;
        errors.push(`Шаблон ${operation.id} не найден`);
        return;
      }

      if (operation.operation === 'delete') {
        const index = templates.findIndex(item => item.id === operation.id);
        if (index !== -1) {
          templates.splice(index, 1);
          success += 1;
        }
        return;
      }

      template.isActive = operation.operation === 'activate';
      success += 1;
    });

    return { success: true, data: { success, failed, errors } };
  }
}

export const realShiftTemplateService = new MockShiftTemplateService();
export default realShiftTemplateService;
