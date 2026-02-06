import { EmployeeTask, TaskSource } from '../types/employee';

interface CreateTaskEntryOptions {
  createdAt?: Date;
  createdBy?: string;
}

export const createTaskEntry = (
  message: string,
  source: TaskSource,
  { createdAt, createdBy }: CreateTaskEntryOptions = {}
): EmployeeTask => {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `task-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return {
    id,
    message,
    createdAt: createdAt ?? new Date(),
    createdBy: createdBy ?? 'agent',
    source,
  };
};

export default createTaskEntry;
