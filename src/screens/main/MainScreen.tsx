import { useState } from 'react'
import styled, { css } from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { IconClose, IconDrag, IconSettingsOutline } from '@salutejs/plasma-icons'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useUserMode } from '../../context/UserModeContext'
import {
  tasks,
  notifications,
  quickActions,
  mockRequests,
  searchResults,
  type Task,
  type AppNotification,
} from '../../data/mockData'

// ─── Design tokens ────────────────────────────────────────────────────────────

const c = {
  text:        '#1a1a1a',
  textSec:     '#4b5563',
  textTer:     '#9ca3af',
  accent:      '#4f46e5',
  accentDark:  '#4338ca',
  accentBg:    '#eef2ff',
  accentBorder:'#c7d2fe',
  cardBg:      '#ffffff',
  border:      '#e5e7eb',
  borderLight: '#f3f4f6',
  red:         '#ef4444',
  redBg:       '#fef2f2',
  redBorder:   '#fecaca',
  yellow:      '#d97706',
  yellowBg:    '#fef9c3',
  yellowBorder:'#fde68a',
  green:       '#059669',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
}

// ─── Outlet context ───────────────────────────────────────────────────────────

interface OutletCtx {
  isEditMode: boolean
  showToast: (msg: string) => void
}

// ─── Edit mode widget wrapper ─────────────────────────────────────────────────

const WidgetWrapEl = styled.div<{ $edit: boolean }>`
  position: relative;
  ${({ $edit }) => $edit && css`
    &::after {
      content: '';
      position: absolute;
      inset: -3px;
      border: 1.5px dashed #6366f1;
      border-radius: 14px;
      pointer-events: none;
      z-index: 10;
    }
  `}
`

const WidgetToolbar = styled.div<{ $outside?: boolean; $bare?: boolean }>`
  position: absolute;
  top: ${({ $outside, $bare }) => ($outside ? '-26px' : $bare ? '0' : '6px')};
  right: 6px;
  display: flex;
  gap: 2px;
  z-index: 20;
`

const WidgetIconBtn = styled.button<{ $bare?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: ${({ $bare }) => ($bare ? 'transparent' : 'rgba(255, 255, 255, 0.92)')};
  color: #6366f1;
  cursor: pointer;
  padding: 0;
  transition: background 0.1s, color 0.1s;
  &:hover { background: rgba(99, 102, 241, 0.12); color: #4338ca; }
`

interface WidgetProps {
  edit: boolean
  settings?: boolean
  closeOnly?: boolean
  toolbarOutside?: boolean
  bare?: boolean
  toast: (msg: string) => void
  children: React.ReactNode
}

function WidgetWrap({ edit, settings, closeOnly, toolbarOutside, bare, toast, children }: WidgetProps) {
  const STUB = () => toast('Недоступно в демо-режиме')
  return (
    <WidgetWrapEl $edit={edit}>
      {edit && (
        <WidgetToolbar $outside={toolbarOutside} $bare={bare}>
          {!closeOnly && (
            <WidgetIconBtn $bare={bare} title="Переместить" onClick={STUB}>
              <IconDrag size="xs" color="currentColor" />
            </WidgetIconBtn>
          )}
          {settings && (
            <WidgetIconBtn $bare={bare} title="Настройки виджета" onClick={STUB}>
              <IconSettingsOutline size="xs" color="currentColor" />
            </WidgetIconBtn>
          )}
          <WidgetIconBtn $bare={bare} title="Удалить виджет" onClick={STUB}>
            <IconClose size="xs" color="currentColor" />
          </WidgetIconBtn>
        </WidgetToolbar>
      )}
      {children}
    </WidgetWrapEl>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_ROUTES: Record<string, string> = {
  'new-request':   '/task',
  'open-doc':      '/documents',
  'search-service':'/search',
  'cmd':           '/search',
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const SecLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.625rem;
`

// ─────────────────────────────────────────────────────────────────────────────
// BASIC — «Что мне делать?»
// ─────────────────────────────────────────────────────────────────────────────

const BasicRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 560px;
`

const BasicGreeting = styled.h1`
  font-size: 1.625rem;
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.02em;
`

const BasicCard = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 12px;
  padding: 1.125rem 1.375rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: box-shadow 200ms ease;
  &:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06); }
`

const BasicActionTitle = styled.div`
  font-size: 1rem;
  color: ${c.text};
  font-weight: 400;
  line-height: 1.4;
  margin-bottom: 0.15rem;
`

const BasicActionDesc = styled.div`
  font-size: 0.8125rem;
  color: ${c.textSec};
  font-weight: 400;
  line-height: 1.4;
`

const BasicTaskBlock = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 200ms ease;
  &:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06); }
`

const BasicTaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.125rem;
  border-bottom: 1px solid ${c.borderLight};
  background: ${c.cardBg};
  &:last-child { border-bottom: none; }
`

const BasicTaskDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $color }) => $color};
`

const BasicTaskTitle = styled.span`
  flex: 1;
  font-size: 0.9375rem;
  color: ${c.text};
  line-height: 1.4;
`

const BasicTaskMeta = styled.span<{ $color: string }>`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ $color }) => $color};
  white-space: nowrap;
  flex-shrink: 0;
`

const BasicHintText = styled.div`
  font-size: 0.875rem;
  color: ${c.textSec};
  line-height: 1.45;
`

interface ViewProps { isEditMode: boolean; showToast: (msg: string) => void }

function BasicView({ isEditMode, showToast }: ViewProps) {
  const navigate = useNavigate()

  const activeTask = tasks.find(t => t.priority === 'high')
  const topTasks = tasks.slice(0, 3)

  const pendingRequest = mockRequests.find(r => r.status === 'pending')
  const unreadCount = notifications.filter(n => !n.isRead).length
  const hintText = pendingRequest
    ? `Заявка ${pendingRequest.id} ожидает вашего согласования`
    : unreadCount > 0
      ? `У вас ${unreadCount} непрочитанных уведомления`
      : 'Вы недавно работали с документами'
  const hintRoute = pendingRequest ? '/task' : '/documents'
  const hintAction = pendingRequest ? 'Проверить' : 'Открыть'

  return (
    <BasicRoot>
      <BasicGreeting>Что важно сегодня</BasicGreeting>

      {/* Widget 1: продолжите задачу */}
      <WidgetWrap edit={isEditMode} toast={showToast}>
        <BasicCard>
          <SecLabel>Продолжите задачу</SecLabel>
          <div>
            <BasicActionTitle>
              {activeTask?.title ?? 'Можно начать работу'}
            </BasicActionTitle>
            {activeTask && (
              <BasicActionDesc>{activeTask.description}</BasicActionDesc>
            )}
          </div>
          <Button
            view="secondary"
            size="m"
            text="Продолжить →"
            onClick={() => navigate(activeTask ? '/task' : '/main')}
          />
        </BasicCard>
      </WidgetWrap>

      {/* Widget 2: в работе */}
      <WidgetWrap edit={isEditMode} toast={showToast}>
        <BasicCard>
          <SecLabel>В работе</SecLabel>
          <BasicTaskBlock>
            {topTasks.map((t: Task, idx) => {
              const meta =
                idx === 0 ? { label: `Сегодня · ${t.deadline}`, color: '#d97706' } :
                idx === 1 ? { label: `Скоро · ${t.deadline}`,   color: '#3b82f6' } :
                            { label: t.deadline,                 color: '#374151' }
              return (
                <BasicTaskItem key={t.id}>
                  <BasicTaskDot $color={meta.color} />
                  <BasicTaskTitle>{t.title}</BasicTaskTitle>
                  <BasicTaskMeta $color={meta.color}>{meta.label}</BasicTaskMeta>
                </BasicTaskItem>
              )
            })}
          </BasicTaskBlock>
        </BasicCard>
      </WidgetWrap>

      {/* Widget 3: нужно проверить */}
      <WidgetWrap edit={isEditMode} toast={showToast}>
        <BasicCard>
          <SecLabel>Нужно проверить</SecLabel>
          <BasicHintText>{hintText}</BasicHintText>
          <Button
            view="secondary"
            size="s"
            text={hintAction}
            onClick={() => navigate(hintRoute)}
          />
        </BasicCard>
      </WidgetWrap>
    </BasicRoot>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD — «Что происходит?»
// ─────────────────────────────────────────────────────────────────────────────

const StdRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const StdHeading = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.02em;
  margin-bottom: 0;
`

const StdSectionLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const StdCard = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 200ms ease;
  &:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06); }
`

const StdCardHeader = styled.div`
  padding: 0.75rem 1rem 0.5rem;
`

const StdChipsRow = styled.div`
  display: flex;
  gap: 0.375rem;
`

const StdActionChip = styled.button`
  padding: 0.2rem 0.625rem;
  border: 1px solid ${c.border};
  border-radius: 20px;
  background: transparent;
  color: ${c.accent};
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s, border-color 0.12s;
  &:hover {
    background: ${c.accentBg};
    border-color: ${c.accentBorder};
  }
`

const StdLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 272px;
  gap: 1.25rem;
  align-items: start;
`

const StdLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const StdTaskList = styled.div`
  display: flex;
  flex-direction: column;
`

const StdTaskRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid ${c.borderLight};
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background: #dde4ff; }
  &:last-child { border-bottom: none; }
`

const StdTaskDot = styled.span<{ $priority: Task['priority'] }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.35rem;
  background: ${({ $priority }) =>
    $priority === 'high' ? c.red : $priority === 'normal' ? c.yellow : c.textTer};
`

const StdTaskBody = styled.div`
  flex: 1;
  min-width: 0;
`

const StdTaskTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${c.text};
  line-height: 1.4;
  margin-bottom: 0.2rem;
`

const StdTaskDesc = styled.div`
  font-size: 0.8125rem;
  color: ${c.textTer};
  line-height: 1.4;
`

const StdTaskDate = styled.span`
  font-size: 0.8125rem;
  color: ${c.textTer};
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 0.1rem;
`

const StdDocsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
`

const StdDocCard = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 10px;
  padding: 0.75rem 0.875rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 200ms ease;
  &:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06); }
`

const StdDocLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.25rem;
`

const StdDocTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${c.text};
  line-height: 1.4;
`

const StdNotifPanel = styled.div`
  display: flex;
  flex-direction: column;
`

const StdNotifItem = styled.div<{ $unread: boolean }>`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${c.borderLight};
  background: ${c.cardBg};
  transition: background 0.1s;
  &:hover { background: #f8f9fa; }
  &:last-child { border-bottom: none; }
`

const StdNotifRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`

const StdNotifDot = styled.span<{ $unread: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $unread }) => ($unread ? c.accent : 'transparent')};
  flex-shrink: 0;
  margin-top: 0.3rem;
`

const StdNotifText = styled.div<{ $unread: boolean }>`
  font-size: 0.8125rem;
  color: ${({ $unread }) => ($unread ? c.text : c.textSec)};
  font-weight: ${({ $unread }) => ($unread ? '500' : '400')};
  line-height: 1.4;
`

const StdNotifTime = styled.div`
  font-size: 0.75rem;
  color: ${c.textTer};
  margin-top: 0.15rem;
`

const recentDocs = searchResults.filter(r => r.category === 'document').slice(0, 3)

function StandardView({ isEditMode, showToast }: ViewProps) {
  const navigate = useNavigate()

  return (
    <StdRoot>
      {/* Widget: заголовок — только Close, без подложки */}
      <WidgetWrap edit={isEditMode} closeOnly bare toast={showToast}>
        <StdHeading>Сегодня в работе</StdHeading>
      </WidgetWrap>

      {/* Widget: быстрые действия — без подложки */}
      <WidgetWrap edit={isEditMode} settings bare toast={showToast}>
        <StdChipsRow>
          {quickActions.filter(a => a.command !== 'cmd').map(a => (
            <StdActionChip
              key={a.id}
              onClick={() => navigate(ACTION_ROUTES[a.command] ?? '/main')}
            >
              {a.label}
            </StdActionChip>
          ))}
        </StdChipsRow>
      </WidgetWrap>

      <StdLayout>
        <StdLeft>
          {/* Widget: активные задачи */}
          <WidgetWrap edit={isEditMode} toast={showToast}>
            <StdCard>
              <StdCardHeader>
                <StdSectionLabel>Активные задачи</StdSectionLabel>
              </StdCardHeader>
              <StdTaskList>
                {tasks.map((t: Task) => (
                  <StdTaskRow key={t.id}>
                    <StdTaskDot $priority={t.priority} />
                    <StdTaskBody>
                      <StdTaskTitle>{t.title}</StdTaskTitle>
                      <StdTaskDesc>{t.description}</StdTaskDesc>
                    </StdTaskBody>
                    <StdTaskDate>{t.deadline}</StdTaskDate>
                  </StdTaskRow>
                ))}
              </StdTaskList>
            </StdCard>
          </WidgetWrap>

          {/* Widget: последние документы */}
          <WidgetWrap edit={isEditMode} toast={showToast}>
            <StdCard style={{ padding: '0.75rem 1rem 1rem' }}>
              <StdSectionLabel style={{ marginBottom: '0.625rem' }}>Последние документы</StdSectionLabel>
              <StdDocsGrid>
                {recentDocs.map(doc => (
                  <StdDocCard key={doc.id} onClick={() => navigate('/documents')}>
                    <StdDocLabel>Документ</StdDocLabel>
                    <StdDocTitle>{doc.title}</StdDocTitle>
                  </StdDocCard>
                ))}
              </StdDocsGrid>
            </StdCard>
          </WidgetWrap>
        </StdLeft>

        {/* Widget: уведомления */}
        <WidgetWrap edit={isEditMode} toast={showToast}>
          <StdCard>
            <StdCardHeader>
              <StdSectionLabel>Уведомления</StdSectionLabel>
            </StdCardHeader>
            <StdNotifPanel>
              {notifications.map((n: AppNotification) => (
                <StdNotifItem key={n.id} $unread={!n.isRead}>
                  <StdNotifRow>
                    <StdNotifDot $unread={!n.isRead} />
                    <div>
                      <StdNotifText $unread={!n.isRead}>{n.text}</StdNotifText>
                      <StdNotifTime>{n.time}</StdNotifTime>
                    </div>
                  </StdNotifRow>
                </StdNotifItem>
              ))}
            </StdNotifPanel>
          </StdCard>
        </WidgetWrap>
      </StdLayout>
    </StdRoot>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERT — «Где мои рычаги управления?»
// ─────────────────────────────────────────────────────────────────────────────

type WorkItemType = 'task' | 'request' | 'document'
type WorkFilter   = 'all' | WorkItemType | 'priority'

interface WorkItem {
  id:         string
  title:      string
  type:       WorkItemType
  status:     string
  deadline:   string
  isPriority: boolean
}

interface MailItem {
  id:     string
  sender: string
  subject:string
  status: string
  time:   string
  unread: boolean
}

const WORK_ITEMS: WorkItem[] = [
  { id: 'w1', title: 'Согласовать заявку на командировку',         type: 'request',  status: 'На согласовании', deadline: 'Сегодня', isPriority: true  },
  { id: 'w2', title: 'Шаблон заявления на отпуск',                 type: 'document', status: 'Недавно открыт',  deadline: 'Сегодня', isPriority: true  },
  { id: 'w3', title: 'Заявка #1041',                               type: 'request',  status: 'Требует проверки',deadline: 'Завтра',  isPriority: true  },
  { id: 'w4', title: 'Заполнить отчёт за апрель',                  type: 'task',     status: 'В работе',        deadline: '28.05',   isPriority: false },
  { id: 'w5', title: 'Политика ИБ',                                type: 'document', status: 'Обновлён',        deadline: '29.05',   isPriority: false },
]

const MAIL_ITEMS: MailItem[] = [
  { id: 'm1', sender: 'Иванова С.',  subject: 'Re: Согласование командировки',            status: 'Ожидает ответа', time: '10:24', unread: true  },
  { id: 'm2', sender: 'HR-отдел',    subject: 'Напоминание: обновите данные',              status: 'Информация',     time: '09:15', unread: true  },
  { id: 'm3', sender: 'IT-сервис',   subject: 'Заявка #1041 одобрена',                    status: 'Выполнено',      time: 'Вчера', unread: false },
  { id: 'm4', sender: 'Петров А.',   subject: 'Договор с подрядчиком — финальная версия', status: 'На проверке',    time: 'Вчера', unread: false },
]

const EXPERT_QUICK_ACTIONS = [
  { label: 'Создать заявку', route: '/task'     },
  { label: 'Открыть задачи', route: '/tasks'    },
  { label: 'В проекты',      route: '/projects' },
  { label: 'Почта (2)',      route: '/main'     },
]

const WORK_FILTERS: { key: WorkFilter; label: string }[] = [
  { key: 'all',      label: 'Все'          },
  { key: 'task',     label: 'Задачи'       },
  { key: 'request',  label: 'Заявки'       },
  { key: 'document', label: 'Документы'    },
  { key: 'priority', label: 'Приоритетные' },
]

const TYPE_LABELS: Record<WorkItemType, string> = {
  task:     'Задача',
  request:  'Заявка',
  document: 'Документ',
}

const TYPE_COLOR: Record<WorkItemType, string> = {
  request:  '#7c3aed',
  document: '#1d4ed8',
  task:     '#c2410c',
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const ExpertRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1040px;
`

const ExpertActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
`

const ExpertActionLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8125rem;
  color: ${c.accent};
  cursor: pointer;
  font-family: inherit;
  transition: color 0.1s;
  &:hover { color: ${c.accentDark}; text-decoration: underline; }
`

const ExpertGrid = styled.div`
  display: grid;
  grid-template-columns: 65fr 35fr;
  gap: 2rem;
  align-items: start;
`

const ExpertLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const ExpertRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const ExpertBlockLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`

const ExpertFiltersRow = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`

const ExpertFilterChip = styled.button<{ $active: boolean }>`
  padding: 0.15rem 0.5rem;
  border: 1px solid ${({ $active }) => ($active ? c.accentBorder : c.border)};
  border-radius: 20px;
  background: ${({ $active }) => ($active ? c.accentBg : 'transparent')};
  color: ${({ $active }) => ($active ? c.accent : c.textSec)};
  font-size: 0.75rem;
  font-weight: ${({ $active }) => ($active ? '500' : '400')};
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s, border-color 0.1s;
  &:hover {
    background: ${({ $active }) => ($active ? c.accentBg : c.borderLight)};
    border-color: ${({ $active }) => ($active ? c.accentBorder : c.border)};
  }
`

const ExpertWorkTable = styled.div`
  display: flex;
  flex-direction: column;
`

const ExpertWorkHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 76px 110px 62px;
  gap: 0.75rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid ${c.border};
`

const ExpertWorkRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 76px 110px 62px;
  gap: 0.75rem;
  padding: 0.4rem 0.5rem;
  align-items: center;
  border-radius: 4px;
  cursor: default;
  transition: background 0.12s;
  &:hover { background: #dde4ff; }
`

const ExpertWorkTitle = styled.span`
  font-size: 0.8125rem;
  color: ${c.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${ExpertWorkRow}:hover & { font-weight: 500; }
`

const ExpertTypeBadge = styled.span<{ $type: WorkItemType }>`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ $type }) => TYPE_COLOR[$type]};
  white-space: nowrap;
`

const ExpertStatusCell = styled.span`
  font-size: 0.75rem;
  color: ${c.textSec};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ExpertDeadlineCell = styled.span<{ $urgent: boolean }>`
  font-size: 0.75rem;
  color: ${({ $urgent }) => ($urgent ? c.accent : c.textTer)};
  font-weight: ${({ $urgent }) => ($urgent ? '500' : '400')};
  white-space: nowrap;
`

const ExpertMailTable = styled.div`
  display: flex;
  flex-direction: column;
`

const ExpertMailHead = styled.div`
  display: grid;
  grid-template-columns: 10px 78px 1fr 90px 44px 20px;
  gap: 0.625rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid ${c.border};
`

const ExpertMailRow = styled.div`
  display: grid;
  grid-template-columns: 10px 78px 1fr 90px 44px 20px;
  gap: 0.625rem;
  padding: 0.4rem 0.5rem;
  align-items: center;
  border-radius: 4px;
  cursor: default;
  transition: background 0.12s;
  &:hover { background: #dde4ff; }
`

const ExpertMailDot = styled.span<{ $unread: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $unread }) => ($unread ? c.accent : 'transparent')};
  display: inline-block;
`

const ExpertMailSender = styled.span<{ $unread: boolean }>`
  font-size: 0.8125rem;
  font-weight: ${({ $unread }) => ($unread ? '600' : '400')};
  color: ${c.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ExpertMailSubject = styled.span`
  font-size: 0.8125rem;
  color: ${c.textSec};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ExpertMailStatus = styled.span`
  font-size: 0.75rem;
  color: ${c.textTer};
  white-space: nowrap;
`

const ExpertMailTime = styled.span`
  font-size: 0.75rem;
  color: ${c.textTer};
  text-align: right;
  white-space: nowrap;
`


const ExpertRightList = styled.div`
  display: flex;
  flex-direction: column;
`

const ExpertRightItem = styled.div`
  font-size: 0.8125rem;
  color: ${c.textSec};
  line-height: 1.5;
  padding: 0.2rem 0;
`

const ExpertMeetingTime = styled.span`
  font-weight: 600;
  color: ${c.accent};
`

const ExpertCard = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 200ms ease;
  &:hover { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06); }
`

const ExpertMailClose = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${c.textTer};
  transition: color 0.1s;
  &:hover { color: ${c.textSec}; }
`

// ─── Component ────────────────────────────────────────────────────────────────

function ExpertView({ isEditMode, showToast }: ViewProps) {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<WorkFilter>('all')
  const [mailItems, setMailItems] = useState(MAIL_ITEMS)

  const filteredItems = WORK_ITEMS.filter(item => {
    if (activeFilter === 'all')      return true
    if (activeFilter === 'priority') return item.isPriority
    return item.type === activeFilter
  })

  const isUrgent = (d: string) => d === 'Сегодня' || d === 'Завтра'
  const deleteMail = (id: string) => setMailItems(prev => prev.filter(m => m.id !== id))

  return (
    <ExpertRoot>
      {/* Widget: быстрые действия — иконки над рамкой */}
      <WidgetWrap edit={isEditMode} settings bare toolbarOutside toast={showToast}>
        <ExpertActionsRow>
          {EXPERT_QUICK_ACTIONS.map(a => (
            <ExpertActionLink key={a.label} onClick={() => navigate(a.route)}>
              {a.label}
            </ExpertActionLink>
          ))}
        </ExpertActionsRow>
      </WidgetWrap>

      <ExpertGrid>
        {/* ── Left column ────────────────────────────────────────────── */}
        <ExpertLeft>

          {/* Widget: почта */}
          <WidgetWrap edit={isEditMode} settings toast={showToast}>
          <ExpertCard>
            <ExpertBlockLabel>Почта</ExpertBlockLabel>
            <ExpertMailTable>
              <ExpertMailHead>
                <span />
                <span>Отправитель</span>
                <span>Тема</span>
                <span>Статус</span>
                <span>Время</span>
                <span />
              </ExpertMailHead>
              {mailItems.map(item => (
                <ExpertMailRow key={item.id}>
                  <ExpertMailDot $unread={item.unread} />
                  <ExpertMailSender $unread={item.unread}>{item.sender}</ExpertMailSender>
                  <ExpertMailSubject>{item.subject}</ExpertMailSubject>
                  <ExpertMailStatus>{item.status}</ExpertMailStatus>
                  <ExpertMailTime>{item.time}</ExpertMailTime>
                  <ExpertMailClose onClick={() => deleteMail(item.id)} title="Удалить">
                    <IconClose size="xs" color="currentColor" />
                  </ExpertMailClose>
                </ExpertMailRow>
              ))}
            </ExpertMailTable>
          </ExpertCard>
          </WidgetWrap>

          {/* Widget: очередь работы */}
          <WidgetWrap edit={isEditMode} settings toast={showToast}>
          <ExpertCard>
            <ExpertBlockLabel>Очередь работы</ExpertBlockLabel>
            <ExpertFiltersRow>
              {WORK_FILTERS.map(f => (
                <ExpertFilterChip
                  key={f.key}
                  $active={activeFilter === f.key}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {f.label}
                </ExpertFilterChip>
              ))}
            </ExpertFiltersRow>
            <ExpertWorkTable>
              <ExpertWorkHead>
                <span>Объект</span>
                <span>Тип</span>
                <span>Статус</span>
                <span>Срок</span>
              </ExpertWorkHead>
              {filteredItems.map(item => (
                <ExpertWorkRow key={item.id}>
                  <ExpertWorkTitle title={item.title}>{item.title}</ExpertWorkTitle>
                  <ExpertTypeBadge $type={item.type}>{TYPE_LABELS[item.type]}</ExpertTypeBadge>
                  <ExpertStatusCell>{item.status}</ExpertStatusCell>
                  <ExpertDeadlineCell $urgent={isUrgent(item.deadline)}>{item.deadline}</ExpertDeadlineCell>
                </ExpertWorkRow>
              ))}
            </ExpertWorkTable>
          </ExpertCard>
          </WidgetWrap>

        </ExpertLeft>

        {/* ── Right column ───────────────────────────────────────────── */}
        <ExpertRight>

          <WidgetWrap edit={isEditMode} settings toast={showToast}>
          <ExpertCard>
            <ExpertBlockLabel>Встречи</ExpertBlockLabel>
            <ExpertRightList>
              <ExpertRightItem><ExpertMeetingTime>14:30</ExpertMeetingTime> — Синхронизация по проекту</ExpertRightItem>
              <ExpertRightItem><ExpertMeetingTime>16:00</ExpertMeetingTime> — Обсуждение заявки</ExpertRightItem>
            </ExpertRightList>
          </ExpertCard>
          </WidgetWrap>

          <WidgetWrap edit={isEditMode} settings toast={showToast}>
          <ExpertCard>
            <ExpertBlockLabel>На согласовании</ExpertBlockLabel>
            <ExpertRightList>
              <ExpertRightItem>Заявка #1041</ExpertRightItem>
              <ExpertRightItem>Договор с подрядчиком</ExpertRightItem>
              <ExpertRightItem>Командировка в Москву</ExpertRightItem>
            </ExpertRightList>
          </ExpertCard>
          </WidgetWrap>

          <WidgetWrap edit={isEditMode} settings toast={showToast}>
          <ExpertCard>
            <ExpertBlockLabel>Уведомления</ExpertBlockLabel>
            <ExpertRightList>
              <ExpertRightItem>Заявка #1042 одобрена</ExpertRightItem>
              <ExpertRightItem>Политика ИБ обновлена</ExpertRightItem>
              <ExpertRightItem>Новый комментарий в задаче</ExpertRightItem>
            </ExpertRightList>
          </ExpertCard>
          </WidgetWrap>

        </ExpertRight>
      </ExpertGrid>
    </ExpertRoot>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function MainScreen() {
  const { mode } = useUserMode()
  const ctx = useOutletContext<OutletCtx | null>()
  const isEditMode = ctx?.isEditMode ?? false
  const showToast  = ctx?.showToast  ?? (() => {})

  return (
    <>
      {mode === 'basic'    && <BasicView    isEditMode={isEditMode} showToast={showToast} />}
      {mode === 'standard' && <StandardView isEditMode={isEditMode} showToast={showToast} />}
      {mode === 'expert'   && <ExpertView   isEditMode={isEditMode} showToast={showToast} />}
    </>
  )
}
