export const CRITERIA = [
  {
    id: 'secretaryBypass',
    name: 'Обход секретаря',
    description: 'Менеджер успешно связался с ЛПР',
    maxScore: 3,
  },
  {
    id: 'greeting',
    name: 'Приветствие и установка контакта',
    description: 'Менеджер представился и назвал компанию',
    maxScore: 3,
  },
  {
    id: 'appointment',
    name: 'Назначение времени демонстрации',
    description: 'Менеджер предложил конкретное время для демо',
    maxScore: 3,
  },
  {
    id: 'contactUpdate',
    name: 'Актуализация контактов',
    description: 'Менеджер уточнил контактные данные',
    maxScore: 3,
  },
  {
    id: 'jobTitle',
    name: 'Должность и функционал',
    description: 'Менеджер выяснил роль и полномочия собеседника',
    maxScore: 3,
  },
  {
    id: 'needsDiscovery',
    name: 'Выявление потребностей',
    description: 'Менеджер задал вопросы о потребностях клиента',
    maxScore: 3,
  },
  {
    id: 'objectionHandling',
    name: 'Обработка возражений клиента',
    description: 'Менеджер адресовал возражения клиента',
    maxScore: 3,
  },
  {
    id: 'presentation',
    name: 'Презентация продукта',
    description: 'Менеджер представил продукт с учетом выявленных потребностей',
    maxScore: 3,
  },
] as const;

export function calculateScore(criteria: Record<string, number>): number {
  const total = Object.values(criteria).reduce((sum, score) => sum + score, 0);
  const max = Object.keys(criteria).length * 3;
  return Math.round((total / max) * 100);
}

export function getScoreColor(percent: number): 'good' | 'acceptable' | 'poor' {
  if (percent >= 72) return 'good';
  if (percent >= 40) return 'acceptable';
  return 'poor';
}
