// Черновик заявки, переживающий навигацию (например, открытие документа-источника
// и возврат через чипс). Хранится в sessionStorage — переживает размонтирование
// экрана формы, но не остаётся между сессиями браузера.

export interface TaskDraftData {
  rootEntry?: 'files' | 'manual'
  attachedFileIds?: string[]
  supplier?: string
  inn?: string
  amount?: string
  purpose?: string
  deadline?: string
  priority?: string
  comment?: string
  step?: number
}

const KEY = 'corpos-task-draft'

export function loadTaskDraft(): TaskDraftData {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as TaskDraftData) : {}
  } catch {
    return {}
  }
}

export function saveTaskDraft(patch: TaskDraftData): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...loadTaskDraft(), ...patch }))
  } catch {
    /* noop */
  }
}

export function clearTaskDraft(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
