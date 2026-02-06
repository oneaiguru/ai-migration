import { nanoid } from 'nanoid';

export type AbsenteeismInterval = 'daily' | 'weekly';

export interface AbsenteeismRule {
  id: string;
  label: string;
  percent: number;
  appliesTo?: string;
}

export interface AbsenteeismProfile {
  id: string;
  name: string;
  interval: AbsenteeismInterval;
  horizonWeeks: number;
  exceptions: number;
  nextRun: string;
  updatedAt: string;
  createdBy: string;
  rules: AbsenteeismRule[];
}

export interface AbsenteeismMutationOptions {
  delayMs?: number;
}

export type AbsenteeismRuleInput = Omit<AbsenteeismRule, 'id'> & { id?: string };

const BASE_PROFILES: AbsenteeismProfile[] = [
  {
    id: 'default-profile',
    name: 'Базовый профиль call-центра',
    interval: 'weekly',
    horizonWeeks: 12,
    exceptions: 2,
    nextRun: '2025-11-04T05:00:00.000Z',
    updatedAt: '2025-10-18T10:00:00.000Z',
    createdBy: 'planner',
    rules: [
      { id: 'weekday', label: 'Пн–Пт', percent: 9.5, appliesTo: 'weekday' },
      { id: 'weekend', label: 'Сб–Вс', percent: 6.2, appliesTo: 'weekend' },
    ],
  },
  {
    id: 'training-gap',
    name: 'Сессия обучения декабрь',
    interval: 'daily',
    horizonWeeks: 6,
    exceptions: 4,
    nextRun: '2025-11-12T05:00:00.000Z',
    updatedAt: '2025-10-25T12:00:00.000Z',
    createdBy: 'hr_manager',
    rules: [
      { id: 'mon', label: 'Понедельник', percent: 14 },
      { id: 'wed', label: 'Среда', percent: 16 },
      { id: 'fri', label: 'Пятница', percent: 12 },
    ],
  },
  {
    id: 'seasonal',
    name: 'Сезон отпусков',
    interval: 'weekly',
    horizonWeeks: 20,
    exceptions: 6,
    nextRun: '2025-11-01T05:00:00.000Z',
    updatedAt: '2025-09-17T09:00:00.000Z',
    createdBy: 'resource_team',
    rules: [
      { id: 'peak', label: 'Недели 26-31', percent: 18, appliesTo: 'summer' },
      { id: 'off-peak', label: 'Остальные недели', percent: 8 },
    ],
  },
];

let profiles: AbsenteeismProfile[] = BASE_PROFILES.map((profile) => ({
  ...profile,
  rules: profile.rules.map((rule) => ({ ...rule })),
}));

const delay = (ms?: number) => new Promise((resolve) => setTimeout(resolve, ms ?? 200));

const cloneProfile = (profile: AbsenteeismProfile): AbsenteeismProfile => ({
  ...profile,
  rules: profile.rules.map((rule) => ({ ...rule })),
});

export const resetAbsenteeismProfiles = (): void => {
  profiles = BASE_PROFILES.map(cloneProfile);
};

export const loadAbsenteeismProfiles = async (
  options: AbsenteeismMutationOptions = {},
): Promise<AbsenteeismProfile[]> => {
  await delay(options.delayMs);
  return profiles.map(cloneProfile);
};

export interface AbsenteeismProfileInput {
  id?: string;
  name: string;
  interval: AbsenteeismInterval;
  horizonWeeks: number;
  exceptions: number;
  nextRun: string;
  rules: AbsenteeismRuleInput[];
}

export const upsertAbsenteeismProfile = async (
  input: AbsenteeismProfileInput,
  actor: string,
  options: AbsenteeismMutationOptions = {},
): Promise<AbsenteeismProfile[]> => {
  await delay(options.delayMs);
  const now = new Date().toISOString();
  const existingIndex = input.id ? profiles.findIndex((profile) => profile.id === input.id) : -1;
  const rules = input.rules.map((rule) => ({ ...rule, id: rule.id ?? nanoid(6) }));
  const nextProfile: AbsenteeismProfile = {
    id: input.id ?? nanoid(10),
    name: input.name,
    interval: input.interval,
    horizonWeeks: input.horizonWeeks,
    exceptions: input.exceptions,
    nextRun: input.nextRun,
    rules,
    updatedAt: now,
    createdBy: actor,
  };
  if (existingIndex >= 0) {
    profiles.splice(existingIndex, 1, nextProfile);
  } else {
    profiles.unshift(nextProfile);
  }
  return profiles.map(cloneProfile);
};

export const duplicateAbsenteeismProfile = async (
  id: string,
  actor: string,
  options: AbsenteeismMutationOptions = {},
): Promise<AbsenteeismProfile[]> => {
  await delay(options.delayMs);
  const profile = profiles.find((item) => item.id === id);
  if (!profile) {
    return profiles.map(cloneProfile);
  }
  const duplicated: AbsenteeismProfileInput = {
    name: `${profile.name} (копия)`,
    interval: profile.interval,
    horizonWeeks: profile.horizonWeeks,
    exceptions: profile.exceptions,
    nextRun: profile.nextRun,
    rules: profile.rules.map(({ id: _id, ...rest }) => rest),
  };
  return upsertAbsenteeismProfile(duplicated, actor, options);
};

export const deleteAbsenteeismProfile = async (
  id: string,
  options: AbsenteeismMutationOptions = {},
): Promise<AbsenteeismProfile[]> => {
  await delay(options.delayMs);
  profiles = profiles.filter((profile) => profile.id !== id);
  return profiles.map(cloneProfile);
};

export const findAbsenteeismProfile = (id: string): AbsenteeismProfile | undefined =>
  profiles.find((profile) => profile.id === id);
