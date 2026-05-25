export type FileType = 'pdf' | 'docx' | 'xlsx'

export interface MockFile {
  id: string
  name: string
  type: FileType
  folderId: string
  date: string
  owner: string
  size: string
}

export interface MockFolder {
  id: string
  label: string
  description: string
  parentId: string | null
}

export const mockFolders: MockFolder[] = [
  // Root
  { id: 'my',           label: 'Мои документы',   description: 'Личные файлы и черновики',          parentId: null },
  { id: 'dept',         label: 'Отдел',            description: 'Документы вашего подразделения',    parentId: null },
  { id: 'projects',     label: 'Проекты',          description: 'Файлы по текущим проектам',         parentId: null },
  { id: 'instructions', label: 'Общие инструкции', description: 'Политики, регламенты и инструкции', parentId: null },
  // Мои документы
  { id: 'my-drafts',     label: 'Черновики',         description: '', parentId: 'my' },
  { id: 'my-reports',    label: 'Отчёты',             description: '', parentId: 'my' },
  { id: 'my-statements', label: 'Заявления',          description: '', parentId: 'my' },
  { id: 'roga',          label: 'ООО Рога и Копыта',  description: '', parentId: 'my' },
  // Отдел
  { id: 'dept-hr',      label: 'HR',      description: '', parentId: 'dept' },
  { id: 'dept-it',      label: 'IT',      description: '', parentId: 'dept' },
  { id: 'dept-finance', label: 'Финансы', description: '', parentId: 'dept' },
  // Проекты
  { id: 'proj-alpha',   label: 'Alpha',  description: '', parentId: 'projects' },
  { id: 'proj-beta',    label: 'Beta',   description: '', parentId: 'projects' },
  { id: 'proj-archive', label: 'Архив',  description: '', parentId: 'projects' },
  // Общие инструкции
  { id: 'instr-security',   label: 'Безопасность', description: '', parentId: 'instructions' },
  { id: 'instr-reglaments', label: 'Регламенты',   description: '', parentId: 'instructions' },
  { id: 'instr-templates',  label: 'Шаблоны',      description: '', parentId: 'instructions' },
]

export const mockFiles: MockFile[] = [
  { id: 'f1', name: 'Инструкция по информационной безопасности.pdf', type: 'pdf',  folderId: 'instr-security',   date: '01.04.2026', owner: 'ИБ-отдел',      size: '520 КБ' },
  { id: 'f2', name: 'Политика удалённой работы.docx',                type: 'docx', folderId: 'dept-hr',          date: '15.03.2026', owner: 'HR-отдел',      size: '67 КБ'  },
  { id: 'f3', name: 'Шаблон заявления на отпуск.docx',              type: 'docx', folderId: 'instr-templates',  date: '10.02.2026', owner: 'HR-отдел',      size: '28 КБ'  },
  { id: 'f4', name: 'Регламент командировок.pdf',                    type: 'pdf',  folderId: 'dept-finance',     date: '20.03.2026', owner: 'Финансы',       size: '112 КБ' },
  { id: 'f5', name: 'Отчёт за апрель 2026.xlsx',                    type: 'xlsx', folderId: 'my-reports',       date: '19.05.2026', owner: 'Зиновьева О.', size: '84 КБ'  },
  { id: 'f6', name: 'Протокол совещания 14.05.docx',                 type: 'docx', folderId: 'proj-alpha',       date: '14.05.2026', owner: 'Иванова С.',    size: '45 КБ'  },
  { id: 'f7', name: 'ТЗ проект Цифровой портал.pdf',                 type: 'pdf',  folderId: 'proj-beta',        date: '05.05.2026', owner: 'Козлов Д.',     size: '340 КБ' },
  { id: 'f8', name: 'Коммерческое предложение.pdf',                  type: 'pdf',  folderId: 'roga',             date: '20.05.2026', owner: 'Зиновьева О.', size: '218 КБ' },
  { id: 'f9', name: 'Реквизиты поставщика.xlsx',                     type: 'xlsx', folderId: 'roga',             date: '20.05.2026', owner: 'Зиновьева О.', size: '44 КБ'  },
  { id: 'f10', name: 'Обоснование закупки.docx',                     type: 'docx', folderId: 'roga',             date: '19.05.2026', owner: 'Зиновьева О.', size: '31 КБ'  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getRootFolders(): MockFolder[] {
  return mockFolders.filter(f => f.parentId === null)
}

export function getChildren(parentId: string): MockFolder[] {
  return mockFolders.filter(f => f.parentId === parentId)
}

export function getFolderById(id: string): MockFolder | undefined {
  return mockFolders.find(f => f.id === id)
}

export function getAllFilesInFolder(folderId: string): MockFile[] {
  const direct = mockFiles.filter(f => f.folderId === folderId)
  const childFiles = getChildren(folderId).flatMap(c => getAllFilesInFolder(c.id))
  return [...direct, ...childFiles]
}

export function getFolderPathString(folderId: string): string {
  const path: string[] = []
  let current = getFolderById(folderId)
  while (current) {
    path.unshift(current.label)
    current = current.parentId ? getFolderById(current.parentId) : undefined
  }
  return path.join(' / ')
}

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  pdf:  'PDF',
  docx: 'DOCX',
  xlsx: 'XLSX',
}
