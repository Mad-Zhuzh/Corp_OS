// ─── Single source document ───────────────────────────────────────────────────

export const SEARCH_DOC = {
  name:      'Положение о компенсациях сотрудникам.pdf',
  shortName: 'Положение о компенсациях сотрудникам',
  type:      'PDF',
  page:      6,
  section:   'Отдел кадров',
  fragment:  '...порядок компенсации проезда сотрудником до места работы определяется внутренним регламентом компании и подлежит возмещению в установленном размере...',
}

// ─── Trigger matching ─────────────────────────────────────────────────────────

export function isSearchMatch(query: string): boolean {
  return query.toLowerCase().includes('компенсаци')
}

export function isExpertMatch(query: string): boolean {
  return query.toLowerCase().includes('компенсаци')
}

export function isOperatorPrefix(query: string): boolean {
  return query.toLowerCase().trim() === 'тип:'
    || /^тип:[a-zа-яё]*$/i.test(query.trim())
}

// ─── Expert operators ─────────────────────────────────────────────────────────

export const EXPERT_OPERATORS = [
  { op: 'тип:pdf',  desc: 'искать только PDF' },
  { op: 'тип:docx', desc: 'искать только документы Word' },
  { op: 'тип:xlsx', desc: 'искать только таблицы' },
]

// ─── Empty-state suggestions (basic) ─────────────────────────────────────────

export const BASIC_EMPTY_SUGGESTIONS = ['компенсация проезда', 'отпускные', 'больничный']

// ─── Dropdown recent / examples (re-exported here for convenience) ─────────────

export const DD_RECENT: Record<'basic' | 'standard' | 'expert', string[]> = {
  basic:    ['политика ИБ', 'отчёт за апрель'],
  standard: ['политика ИБ', 'шаблон заявления'],
  expert:   ['политика ИБ', 'доступ'],
}

export const DD_EXAMPLES_BASIC = ['заявление на отпуск', 'доступ к системе', 'мои задачи']

export const DD_ACTIONS: Record<'standard' | 'expert', { label: string; nav: string }[]> = {
  standard: [
    { label: 'Создать заявку',       nav: '/task'  },
    { label: 'Открыть мои задачи',   nav: '/tasks' },
  ],
  expert: [
    { label: 'Создать заявку',       nav: '/task'  },
    { label: 'Открыть задачи',       nav: '/tasks' },
    { label: 'Написать в поддержку', nav: '/help'  },
  ],
}
