import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
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

const STATUS_BG: Record<DeadlineStatus, string> = {
  overdue: c.redBg,
  urgent:  c.yellowBg,
  later:   '#f9fafb',
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
  background: ${c.accentBg};
  border: 1.5px solid ${c.accentBorder};
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`

const BasicActionLabel = styled.div`
  font-size: 0.8125rem;
  color: ${c.accentDark};
  font-weight: 500;
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
  background: ${({ $status }) => ($status === 'later' ? c.cardBg : STATUS_BG[$status])};
  &:last-child { border-bottom: none; }
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
    ? `Заявка ${pendingRequest.id} ожидает согласования`
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
        <BasicActionLabel>
          {activeTask
            ? `Незавершённая задача: ${activeTask.title}`
            : 'Можно начать работу'}
        </BasicActionLabel>
        <Button
          view="secondary"
          size="m"
          text="Продолжить →"
          onClick={() => navigate(activeTask ? '/task' : '/main')}
        />
      </BasicActionBlock>

      {/* Today's tasks */}
      <div>
        <SecLabel>Что важно сегодня</SecLabel>
        <BasicTaskBlock>
          {topTasks.map((t: Task) => {
            const status = getDeadlineStatus(t.deadline)
            return (
              <BasicTaskItem key={t.id} $status={status}>
                <BasicTaskDot $status={status} />
                <BasicTaskTitle>{t.title}</BasicTaskTitle>
                <BasicTaskDate $status={status}>{t.deadline}</BasicTaskDate>
              </BasicTaskItem>
            )
          })}
        </BasicTaskBlock>
      </div>

      {/* Hint banner */}
      <BasicHintBanner>
        <BasicHintText>💡 {hintText}</BasicHintText>
        <Button
          view="secondary"
          size="xs"
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

const StdActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

// Tasks list
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

// Documents row
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

// Notifications sidebar
const StdNotifPanel = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 12px;
  overflow: hidden;
`

const StdNotifItem = styled.div<{ $unread: boolean }>`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${c.borderLight};
  background: ${({ $unread }) => ($unread ? c.accentBg : c.cardBg)};
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
      <StdActions>
        {quickActions.filter(a => a.command !== 'cmd').map(a => (
          <Button
            key={a.id}
            size="s"
            view="secondary"
            text={a.label}
            onClick={() => navigate(ACTION_ROUTES[a.command] ?? '/main')}
          />
        ))}
      </StdActions>

      <StdLayout>
        <StdLeft>
          {/* Active tasks */}
          <div>
            <SecLabel>Активные задачи</SecLabel>
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
            <SecLabel>Последние документы</SecLabel>
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
          <SecLabel>Уведомления</SecLabel>
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

const EXPERT_METRIC_IDS = ['tasks', 'docs', 'requests', 'notifications'] as const

const EXPERT_METRIC_LABELS: Record<string, string> = {
  tasks:         'Задачи',
  docs:          'Документы',
  requests:      'Заявки',
  notifications: 'Уведомления',
}

const EXPERT_METRIC_ROUTES: Record<string, string> = {
  tasks:         '/tasks',
  docs:          '/documents',
  requests:      '/task',
  notifications: '/main',
}

const PRIORITY_STATUS: Record<Task['priority'], { label: string; color: string }> = {
  high:   { label: 'Срочно',   color: c.red },
  normal: { label: 'В работе', color: c.yellow },
  low:    { label: 'Плановая', color: c.textTer },
}

const ExpertRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
`

const ExpertActions = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
`

const ExpertMetricsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 10px;
  overflow: hidden;
`

const ExpertMetricItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.625rem 1rem;
  border: none;
  border-right: 1px solid ${c.border};
  background: transparent;
  cursor: pointer;
  transition: background 0.1s;
  &:last-child { border-right: none; }
  &:hover { background: ${c.accentBg}; }
`

const ExpertMetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${c.accent};
  letter-spacing: -0.02em;
  line-height: 1.2;
`

const ExpertMetricLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 500;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 0.125rem;
`

const ExpertDivider = styled.div`
  height: 1px;
  background: ${c.border};
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
  transition: background 0.1s;
  &:hover { background: #eef2ff; }
`

const ExpertRowTitle = styled.span`
  font-size: 0.8125rem;
  color: ${c.text};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const expertMetrics = sections.filter(s => EXPERT_METRIC_IDS.includes(s.id as typeof EXPERT_METRIC_IDS[number]))

function ExpertView() {
  const navigate = useNavigate()

  return (
    <ExpertRoot>
      <ExpertActions>
        {quickActions.filter(a => a.command !== 'cmd').map(a => (
          <Button
            key={a.id}
            size="xs"
            view="secondary"
            text={a.label}
            onClick={() => navigate(ACTION_ROUTES[a.command] ?? '/main')}
          />
        ))}
      </ExpertActions>

      {/* Metrics row */}
      <ExpertMetricsRow>
        {expertMetrics.map(s => (
          <ExpertMetricItem
            key={s.id}
            onClick={() => navigate(EXPERT_METRIC_ROUTES[s.id] ?? '/main')}
            title={EXPERT_METRIC_LABELS[s.id]}
          >
            <ExpertMetricValue>{s.count}</ExpertMetricValue>
            <ExpertMetricLabel>{EXPERT_METRIC_LABELS[s.id]}</ExpertMetricLabel>
          </ExpertMetricItem>
        ))}
      </ExpertMetricsRow>

      <ExpertDivider />

      {/* Tasks table */}
      <div>
        <SecLabel>Задачи</SecLabel>
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
