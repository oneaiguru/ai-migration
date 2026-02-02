/**
 * Mock Optimization Service for demo build.
 */

import { realAuthService } from './realAuthService';
import {
  mockOptimizationConstraints,
  mockOptimizationScenarios,
  mockOptimizationConflicts,
  mockOptimizationRecommendations
} from '../data/mockData';

export interface OptimizationConstraint {
  id: string;
  type: 'skill' | 'preference' | 'rule' | 'cost' | 'coverage';
  name: string;
  description: string;
  weight: number;
  isActive: boolean;
  parameters: Record<string, any>;
}

export interface OptimizationScenario {
  id: string;
  name: string;
  constraints: OptimizationConstraint[];
  parameters: {
    targetCost?: number;
    minCoverage?: number;
    maxOvertime?: number;
    fairnessIndex?: number;
  };
  results?: {
    cost: number;
    coverage: number;
    fairness: number;
    conflicts: number;
    score: number;
    optimizationTime?: number;
    iterationsCompleted?: number;
  };
  status?: 'pending' | 'running' | 'completed' | 'failed';
  createdAt?: string;
  completedAt?: string;
}

export interface ScheduleConflict {
  id: string;
  type: 'skill_mismatch' | 'overtime' | 'coverage_gap' | 'preference_violation';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedEmployees: string[];
  suggestedResolution: string;
  estimatedImpact?: {
    costIncrease?: number;
    coverageDecrease?: number;
  };
}

export interface OptimizationRequest {
  scenarioId: string;
  constraints: OptimizationConstraint[];
  parameters: {
    algorithm?: 'genetic' | 'simulated_annealing' | 'linear_programming';
    iterations?: number;
    populationSize?: number;
    mutationRate?: number;
    eliteSize?: number;
    timeLimit?: number;
  };
  schedule: {
    startDate: string;
    endDate: string;
    employeeIds?: string[];
  };
}

export interface OptimizationResponse {
  scenario: OptimizationScenario;
  conflicts: ScheduleConflict[];
  recommendations: string[];
  performanceMetrics: {
    executionTime: number;
    iterationsCompleted: number;
    convergenceRate: number;
    memoryUsage: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

let scenarios: OptimizationScenario[] = [...mockOptimizationScenarios];
const constraints: OptimizationConstraint[] = [...mockOptimizationConstraints];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ensureAuth = () => {
  if (!realAuthService.getAuthToken()) {
    throw new Error('Demo authentication token is missing.');
  }
};

class MockOptimizationService {
  async checkApiHealth(): Promise<boolean> {
    return true;
  }

  async getAvailableConstraints(): Promise<ApiResponse<OptimizationConstraint[]>> {
    ensureAuth();
    return { success: true, data: clone(constraints) };
  }

  async getScenarios(): Promise<ApiResponse<OptimizationScenario[]>> {
    ensureAuth();
    return { success: true, data: clone(scenarios) };
  }

  async saveScenario(scenario: Omit<OptimizationScenario, 'id' | 'createdAt'>): Promise<ApiResponse<OptimizationScenario>> {
    ensureAuth();
    const newScenario: OptimizationScenario = {
      ...scenario,
      id: `mock-scenario-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    scenarios = [...scenarios, newScenario];
    return { success: true, data: clone(newScenario) };
  }

  async getCurrentConflicts(): Promise<ApiResponse<ScheduleConflict[]>> {
    ensureAuth();
    return { success: true, data: clone(mockOptimizationConflicts) };
  }

  async getAlgorithmOptions(): Promise<ApiResponse<{ algorithms: string[]; defaultParameters: Record<string, any> }>> {
    ensureAuth();
    return {
      success: true,
      data: {
        algorithms: ['genetic', 'simulated_annealing', 'linear_programming'],
        defaultParameters: {
          genetic: { iterations: 100, populationSize: 40, mutationRate: 0.1 },
          simulated_annealing: { iterations: 150, timeLimit: 45 },
          linear_programming: { timeLimit: 30 }
        }
      }
    };
  }

  async optimizeSchedule(request: OptimizationRequest): Promise<ApiResponse<OptimizationResponse>> {
    ensureAuth();
    const scenario = scenarios.find(item => item.id === request.scenarioId) || scenarios[0];
    const selectedScenario = scenario
      ? { ...scenario, status: 'completed', completedAt: new Date().toISOString() }
      : {
          id: request.scenarioId,
          name: 'Результат оптимизации',
          constraints: request.constraints,
          parameters: request.parameters,
          status: 'completed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        };

    const response: OptimizationResponse = {
      scenario: {
        ...selectedScenario,
        results: selectedScenario.results ?? {
          cost: 118000,
          coverage: 0.94,
          fairness: 0.89,
          conflicts: mockOptimizationConflicts.length,
          score: 0.92,
          optimizationTime: 38,
          iterationsCompleted: 72
        }
      },
      conflicts: clone(mockOptimizationConflicts),
      recommendations: clone(mockOptimizationRecommendations),
      performanceMetrics: {
        executionTime: 38,
        iterationsCompleted: 72,
        convergenceRate: 0.87,
        memoryUsage: 420
      }
    };

    return { success: true, data: response };
  }

  async resolveConflict(conflictId: string, resolution: string): Promise<ApiResponse<{ resolved: boolean; message: string }>> {
    ensureAuth();
    const conflict = mockOptimizationConflicts.find(item => item.id === conflictId);
    if (!conflict) {
      return { success: false, error: 'Конфликт не найден' };
    }

    return {
      success: true,
      data: {
        resolved: true,
        message: `Рекомендация применена: ${resolution}`
      }
    };
  }
}

export const realOptimizationService = new MockOptimizationService();
export default realOptimizationService;
