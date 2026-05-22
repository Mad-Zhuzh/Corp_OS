import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { IconAttentionCircleOutline } from '@salutejs/plasma-icons'
import { useNavigate } from 'react-router-dom'
import { useUserMode } from '../../context/UserModeContext'
import {
  tasks,
  notifications,
  quickActions,
  sections,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DeadlineStatus = 'overdue' | 'urgent' | 'later'

function getDeadlineStatus(deadline: string): DeadlineStatus {
  const [d, m] = deadline.split('.').map(Number)
  const now = new Date()
  const dl = new Date(now.getFullYear(), m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (dl < today) return 'overdue'
  if (dl <= tomorrow) return 'urgent'
  return 'later'
}

const STATUS_COLOR: Record<DeadlineStatus, string> = {
  overdue: c.red,
  urgent:  c.yellow,
  later:   c.textTer,
}

const STATUS_TEXT: Record<DeadlineStatus, string> = {
  overdue: 'Срочно',
  urgent:  'В работе',
  later:   'Плановая',
}

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

const BasicActionBlock = styled.div`
  background: #f9fafb;
  border: 1px solid ${c.border};
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`

const BasicActionCaption = styled.div`
  font-size: 0.8125rem;
  color: ${c.textTer};
  font-weight: 400;
  line-height: 1.4;
  margin-bottom: 0.2rem;
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
`

const BasicTaskItem = styled.div<{ $status: DeadlineStatus }>`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.125rem;
  border-bottom: 1px solid ${c.borderLight};
  background: ${c.cardBg};
  &:last-child { border-bottom: none; }
`

const BasicTaskStatus = styled.span<{ $status: DeadlineStatus }>`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ $status }) => STATUS_COLOR[$status]};
  white-space: nowrap;
  flex-shrink: 0;
`

const BasicTaskDot = styled.span<{ $status: DeadlineStatus }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $status }) => STATUS_COLOR[$status]};
`

const BasicTaskTitle = styled.span`
  flex: 1;
  font-size: 0.9375rem;
  color: ${c.text};
  line-height: 1.4;
`

const BasicTaskDate = styled.span<{ $status: DeadlineStatus }>`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ $status }) => STATUS_COLOR[$status]};
  white-space: nowrap;
  flex-shrink: 0;
`

const BasicHintBanner = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 12px;
  padding: 0.875rem 1.125rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`

const BasicHintIconWrap = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${c.yellow};
`

const BasicHintContent = styled.div`
  flex: 1;
  min-width: 0;
`

const BasicHintLabel = styled.div`
  font-size: 0.75rem;
  color: ${c.textTer};
  margin-bottom: 0.2rem;
`

const BasicHintText = styled.div`
  font-size: 0.875rem;
  color: ${c.textSec};
  line-height: 1.45;
`

function BasicView() {
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

      {/* Action block */}
      <BasicActionBlock>
        <div>
          <BasicActionCaption>Продолжите задачу</BasicActionCaption>
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
      </BasicActionBlock>

      {/* Task list */}
      <div>
        <SecLabel>В работе</SecLabel>
        <BasicTaskBlock>
          {topTasks.map((t: Task, idx) => {
            const status = getDeadlineStatus(t.deadline)
            const statusLabel =
              idx === 0 ? `Сегодня · ${t.deadline}` :
              idx === 1 ? `Скоро · ${t.deadline}` :
              STATUS_TEXT[status]
            return (
              <BasicTaskItem key={t.id} $status={status}>
                <BasicTaskDot $status={status} />
                <BasicTaskTitle>{t.title}</BasicTaskTitle>
                <BasicTaskStatus $status={status}>{statusLabel}</BasicTaskStatus>
                {idx >= 2 && (
                  <BasicTaskDate $status={status}>{t.deadline}</BasicTaskDate>
                )}
              </BasicTaskItem>
            )
          })}
        </BasicTaskBlock>
      </div>

      {/* Hint banner */}
      <BasicHintBanner>
        <BasicHintIconWrap>
          <IconAttentionCircleOutline size="xs" color="currentColor" />
        </BasicHintIconWrap>
        <BasicHintContent>
          <BasicHintLabel>Нужно проверить</BasicHintLabel>
          <BasicHintText>{hintText}</BasicHintText>
        </BasicHintContent>
        <Button
          view="secondary"
          size="s"
          text={hintAction}
          onClick={() => navigate(hintRoute)}
        />
      </BasicHintBanner>
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

const StdSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.625rem;
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
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 12px;
  overflow: hidden;
`

const StdTaskRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid ${c.borderLight};
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
  transition: box-shadow 0.12s;
  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
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
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 12px;
  overflow: hidden;
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

function StandardView() {
  const navigate = useNavigate()

  return (
    <StdRoot>
      <StdHeading>Сегодня в работе</StdHeading>

      <StdLayout>
        <StdLeft>
          {/* Active tasks */}
          <div>
            <StdSectionHeader>
              <StdSectionLabel>Активные задачи</StdSectionLabel>
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
            </StdSectionHeader>
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
          </div>

          {/* Recent documents */}
          <div>
            <StdSectionLabel style={{ marginBottom: '0.625rem' }}>Последние документы</StdSectionLabel>
            <StdDocsGrid>
              {recentDocs.map(doc => (
                <StdDocCard key={doc.id} onClick={() => navigate('/documents')}>
                  <StdDocLabel>Документ</StdDocLabel>
                  <StdDocTitle>{doc.title}</StdDocTitle>
                </StdDocCard>
              ))}
            </StdDocsGrid>
          </div>
        </StdLeft>

        {/* Notifications */}
        <div>
          <StdSectionLabel style={{ marginBottom: '0.625rem' }}>Уведомления</StdSectionLabel>
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
        </div>
      </StdLayout>
    </StdRoot>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERT — «Где мои рычаги управления?»
// ─────────────────────────────────────────────────────────────────────────────

const PRIORITY_STATUS: Record<Task['priority'], { label: string; color: string }> = {
  high:   { label: 'Срочно',   color: c.red },
  normal: { label: 'В работе', color: c.yellow },
  low:    { label: 'Плановая', color: c.textTer },
}

const expertMetricValues = {
  tasks:         sections.find(s => s.id === 'tasks')?.count ?? 0,
  docs:          sections.find(s => s.id === 'docs')?.count ?? 0,
  requests:      sections.find(s => s.id === 'requests')?.count ?? 0,
  notifications: sections.find(s => s.id === 'notifications')?.count ?? 0,
}

const ExpertRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 960px;
`

const ExpertHeading = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.02em;
  margin-bottom: 0;
`

const ExpertMetricsLine = styled.div`
  font-size: 0.8125rem;
  color: ${c.textSec};
`

const ExpertMetricNum = styled.span`
  font-weight: 700;
  color: ${c.accent};
`

const ExpertMainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 1.25rem;
  align-items: start;
`

const ExpertTaskHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`

const ExpertChipsRow = styled.div`
  display: flex;
  gap: 0.25rem;
`

const ExpertActionChip = styled.button`
  padding: 0.15rem 0.5rem;
  border: 1px solid ${c.border};
  border-radius: 20px;
  background: transparent;
  color: ${c.accent};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s, border-color 0.12s;
  &:hover {
    background: ${c.accentBg};
    border-color: ${c.accentBorder};
  }
`

const ExpertTable = styled.div`
  display: flex;
  flex-direction: column;
`

const ExpertTableHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px 64px;
  gap: 0.75rem;
  padding: 0.3rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid ${c.border};
`

const ExpertTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px 64px;
  gap: 0.75rem;
  padding: 0.45rem 0.75rem;
  align-items: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background: #dde4ff; }
`

const ExpertRowTitle = styled.span`
  font-size: 0.8125rem;
  color: ${c.text};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${ExpertTableRow}:hover & { font-weight: 500; }
`

const ExpertRowStatus = styled.span<{ $color: string }>`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ $color }) => $color};
  white-space: nowrap;
`

const ExpertRowDate = styled.span`
  font-size: 0.75rem;
  color: ${c.textTer};
`

const ExpertUpdatesPanel = styled.div`
  display: flex;
  flex-direction: column;
`

const ExpertUpdatesLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`

const ExpertUpdateItem = styled.div`
  font-size: 0.75rem;
  color: ${c.textSec};
  line-height: 1.5;
  padding: 0.3rem 0;
  border-bottom: 1px solid ${c.borderLight};
  &:last-child { border-bottom: none; }
`

function ExpertView() {
  const navigate = useNavigate()

  return (
    <ExpertRoot>
      <ExpertHeading>Рабочая сводка</ExpertHeading>

      <ExpertMetricsLine>
        <ExpertMetricNum>{expertMetricValues.tasks}</ExpertMetricNum>{' задач · '}
        <ExpertMetricNum>{expertMetricValues.docs}</ExpertMetricNum>{' документов · '}
        <ExpertMetricNum>{expertMetricValues.requests}</ExpertMetricNum>{' заявки · '}
        <ExpertMetricNum>{expertMetricValues.notifications}</ExpertMetricNum>{' уведомления'}
      </ExpertMetricsLine>

      <ExpertMainGrid>
        {/* Tasks table */}
        <div>
          <ExpertTaskHeader>
            <SecLabel style={{ marginBottom: 0 }}>Задачи</SecLabel>
            <ExpertChipsRow>
              {quickActions.filter(a => a.command !== 'cmd').map(a => (
                <ExpertActionChip
                  key={a.id}
                  onClick={() => navigate(ACTION_ROUTES[a.command] ?? '/main')}
                >
                  {a.label}
                </ExpertActionChip>
              ))}
            </ExpertChipsRow>
          </ExpertTaskHeader>
          <ExpertTable>
            <ExpertTableHead>
              <span>Название</span>
              <span>Статус</span>
              <span>Дата</span>
            </ExpertTableHead>
            {tasks.map((t: Task) => {
              const ps = PRIORITY_STATUS[t.priority]
              return (
                <ExpertTableRow key={t.id} onClick={() => navigate('/task')}>
                  <ExpertRowTitle title={t.title}>{t.title}</ExpertRowTitle>
                  <ExpertRowStatus $color={ps.color}>{ps.label}</ExpertRowStatus>
                  <ExpertRowDate>{t.deadline}</ExpertRowDate>
                </ExpertTableRow>
              )
            })}
          </ExpertTable>
        </div>

        {/* Updates sidebar */}
        <ExpertUpdatesPanel>
          <ExpertUpdatesLabel>Обновления</ExpertUpdatesLabel>
          {notifications.map((n: AppNotification) => (
            <ExpertUpdateItem key={n.id}>{n.text}</ExpertUpdateItem>
          ))}
        </ExpertUpdatesPanel>
      </ExpertMainGrid>
    </ExpertRoot>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function MainScreen() {
  const { mode } = useUserMode()

  return (
    <>
      {mode === 'basic'    && <BasicView />}
      {mode === 'standard' && <StandardView />}
      {mode === 'expert'   && <ExpertView />}
    </>
  )
}
