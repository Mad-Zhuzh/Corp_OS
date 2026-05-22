export const taskServices: string[] = [
  'CRM',
  'Корпоративная почта',
  'Документооборот',
  'Аналитика',
  'Складская система',
]

export const taskDurations: string[] = [
  '1 день',
  '1 неделя',
  '1 месяц',
  'Постоянный доступ',
]

export interface ExpertTemplate {
  label: string
  service: string
  duration: string
  purpose: string
}

export const expertTemplates: ExpertTemplate[] = [
  { label: 'CRM на 1 неделю', service: 'CRM', duration: '1 неделя', purpose: 'Работа с клиентскими заявками' },
  { label: 'Почта постоянно', service: 'Корпоративная почта', duration: 'Постоянный доступ', purpose: 'Рабочая коммуникация с командой и подрядчиками' },
  { label: 'Аналитика на 1 месяц', service: 'Аналитика', duration: '1 месяц', purpose: 'Подготовка отчётности и анализ показателей' },
]

export interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'normal' | 'low'
  deadline: string
}

export interface AppNotification {
  id: string
  text: string
  time: string
  isRead: boolean
}

export interface QuickAction {
  id: string
  label: string
  command: string
}

export interface Section {
  id: string
  title: string
  descBasic: string
  descStandard: string
  count: number
}

export const tasks: Task[] = [
  { id: 't1', title: 'Согласовать заявку на командировку', description: 'Поездка в Москву 24–26 мая, раздел «Командировки»', priority: 'high', deadline: '22.05' },
  { id: 't2', title: 'Заполнить отчёт за апрель', description: 'Форма в системе документооборота, раздел «Отчётность»', priority: 'high', deadline: '23.05' },
  { id: 't3', title: 'Подписать акт выполненных работ', description: 'Акт по договору №148 с ООО «Техсервис»', priority: 'normal', deadline: '25.05' },
  { id: 't4', title: 'Ознакомиться с новой инструкцией', description: 'Обновлённая инструкция по информационной безопасности', priority: 'low', deadline: '30.05' },
  { id: 't5', title: 'Обновить контактные данные', description: 'Актуализировать телефон и email в корпоративном профиле', priority: 'low', deadline: '31.05' },
]

export const notifications: AppNotification[] = [
  { id: 'n1', text: 'Новая задача: согласовать заявку', time: '10 мин назад', isRead: false },
  { id: 'n2', text: 'Документ "Политика ИБ" обновлён', time: '1 ч назад', isRead: false },
  { id: 'n3', text: 'Заявка #1042 одобрена', time: '2 ч назад', isRead: true },
  { id: 'n4', text: 'Напоминание: отчёт до 23.05', time: 'Вчера', isRead: true },
]

export const quickActions: QuickAction[] = [
  { id: 'qa1', label: 'Создать заявку', command: 'new-request' },
  { id: 'qa2', label: 'Открыть документ', command: 'open-doc' },
  { id: 'qa3', label: 'Найти сервис', command: 'search-service' },
  { id: 'qa4', label: 'Команда', command: 'cmd' },
]

export type SearchCategory = 'document' | 'service' | 'action'

export interface SearchResult {
  id: string
  title: string
  category: SearchCategory
  description: string
  shortDesc: string
  alias: string
  route?: string
}

export const searchResults: SearchResult[] = [
  {
    id: 'sr1',
    title: 'Инструкция по информационной безопасности',
    category: 'document',
    description: 'Правила работы с корпоративными данными, системами и паролями',
    shortDesc: 'Правила работы с данными',
    alias: '/sec-policy',
  },
  {
    id: 'sr2',
    title: 'Политика удалённой работы',
    category: 'document',
    description: 'Условия и требования для работы вне офиса',
    shortDesc: 'Условия удалённой работы',
    alias: '/remote-policy',
  },
  {
    id: 'sr3',
    title: 'Шаблон заявления на отпуск',
    category: 'document',
    description: 'Готовый шаблон для оформления заявления на ежегодный отпуск',
    shortDesc: 'Шаблон для оформления отпуска',
    alias: '/leave-template',
  },
  {
    id: 'sr4',
    title: 'Заявка на доступ',
    category: 'service',
    description: 'Оформить заявку на доступ к корпоративному сервису или системе',
    shortDesc: 'Запрос доступа к системе',
    alias: '/access',
    route: '/task',
  },
  {
    id: 'sr5',
    title: 'Корпоративная почта',
    category: 'service',
    description: 'Настройка и управление корпоративной почтой',
    shortDesc: 'Настройка почты',
    alias: '/mail',
  },
  {
    id: 'sr6',
    title: 'Сервис командировок',
    category: 'service',
    description: 'Оформление командировочных документов и согласование поездок',
    shortDesc: 'Документы для командировки',
    alias: '/travel',
  },
  {
    id: 'sr7',
    title: 'Создать заявку на доступ',
    category: 'action',
    description: 'Быстро перейти к форме создания заявки на доступ к системе',
    shortDesc: 'Перейти к форме заявки',
    alias: '/access',
    route: '/task',
  },
  {
    id: 'sr8',
    title: 'Открыть мои задачи',
    category: 'action',
    description: 'Перейти к списку активных задач и согласований',
    shortDesc: 'Перейти к задачам',
    alias: '/tasks',
    route: '/main',
  },
  {
    id: 'sr9',
    title: 'Связаться с поддержкой',
    category: 'action',
    description: 'Написать в службу поддержки или открыть раздел «Помощь»',
    shortDesc: 'Написать в поддержку',
    alias: '/support',
  },
]

export const searchSuggestions: Record<'basic' | 'standard' | 'expert', string[]> = {
  basic: ['заявка на отпуск', 'инструкция', 'командировка', 'помощь'],
  standard: ['заявка', 'Политика ИБ', 'командировка'],
  expert: ['access', 'tasks', 'support'],
}

export type RequestStatus = 'approved' | 'pending' | 'rejected' | 'sent'

export interface MockRequest {
  id: string
  title: string
  status: RequestStatus
  date: string
}

export const mockRequests: MockRequest[] = [
  { id: '#1042', title: 'Доступ к Документообороту', status: 'approved', date: '20.05' },
  { id: '#1041', title: 'Доступ к Аналитике', status: 'pending', date: '19.05' },
  { id: '#1038', title: 'Доступ к CRM', status: 'rejected', date: '17.05' },
]

export const sections: Section[] = [
  {
    id: 'tasks',
    title: 'Мои задачи',
    descBasic: 'Посмотрите, что нужно сделать сегодня',
    descStandard: 'Активные задачи',
    count: 5,
  },
  {
    id: 'docs',
    title: 'Документы',
    descBasic: 'Найдите нужный документ или инструкцию',
    descStandard: 'Инструкции и файлы',
    count: 12,
  },
  {
    id: 'requests',
    title: 'Заявки',
    descBasic: 'Оформите или проверьте статус заявки',
    descStandard: 'Заявки и согласования',
    count: 2,
  },
  {
    id: 'help',
    title: 'Помощь',
    descBasic: 'Ответы на частые вопросы и поддержка',
    descStandard: 'FAQ и поддержка',
    count: 0,
  },
  {
    id: 'services',
    title: 'Сервисы',
    descBasic: 'Все корпоративные инструменты в одном месте',
    descStandard: 'Корпоративные инструменты',
    count: 18,
  },
  {
    id: 'calendar',
    title: 'Календарь',
    descBasic: 'Встречи, события и напоминания',
    descStandard: 'Встречи и события',
    count: 3,
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    descBasic: 'Важные сообщения и оповещения',
    descStandard: 'Сообщения системы',
    count: 4,
  },
  {
    id: 'profile',
    title: 'Профиль',
    descBasic: 'Ваши данные и настройки',
    descStandard: 'Настройки аккаунта',
    count: 0,
  },
]
