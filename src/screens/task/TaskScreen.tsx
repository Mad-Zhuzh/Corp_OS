import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { useNavigate } from 'react-router-dom'
import { useUserMode } from '../../context/UserModeContext'
import { useOpenObjects } from '../../context/OpenObjectsContext'
import {
  taskServices,
  taskDurations,
  expertTemplates,
  mockRequests,
  type ExpertTemplate,
  type RequestStatus,
  type MockRequest,
} from '../../data/mockData'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskState = 'filling' | 'error' | 'review' | 'success'

interface FormData {
  service: string
  purpose: string
  duration: string
  comment: string
}

interface FormErrors {
  service?: string
  purpose?: string
  duration?: string
}

// ─── Logic ────────────────────────────────────────────────────────────────────

const REQUEST_NUMBER = '#1043'

function validate(data: FormData): FormErrors {
  const e: FormErrors = {}
  if (!data.service) e.service = 'Выберите сервис'
  if (!data.purpose.trim()) e.purpose = 'Укажите цель доступа'
  if (!data.duration) e.duration = 'Выберите срок доступа'
  return e
}

function hasErrors(e: FormErrors): boolean {
  return Object.keys(e).length > 0
}

const STATUS_LABELS: Record<RequestStatus, { full: string; short: string }> = {
  approved: { full: 'Одобрена',        short: 'Одобрена' },
  pending:  { full: 'На согласовании', short: 'Ожидает' },
  rejected: { full: 'Отклонена',       short: 'Отклонена' },
  sent:     { full: 'Отправлена',      short: 'Отправлена' },
}

// ─── Shared design tokens ─────────────────────────────────────────────────────

const c = {
  text:          '#1a1a1a',
  textSec:       '#4b5563',
  textTer:       '#9ca3af',
  accent:        '#6366f1',
  accentDark:    '#4338ca',
  accentBg:      '#eef2ff',
  accentBorder:  '#c7d2fe',
  err:           '#dc2626',
  errBg:         '#fef2f2',
  errBorder:     '#fecaca',
  ok:            '#059669',
  okBg:          '#f0fdf4',
  okBorder:      '#bbf7d0',
  pendingBg:     '#fef9c3',
  pendingBorder: '#fde68a',
  pendingText:   '#92400e',
  sentBg:        '#eff6ff',
  sentBorder:    '#bfdbfe',
  sentText:      '#1d4ed8',
  cardBg:        '#ffffff',
  border:        '#e5e7eb',
  inputBg:       '#f9fafb',
}

// ─── Shared styled primitives ─────────────────────────────────────────────────


const PageTitle = styled.h1<{ $compact?: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '1.25rem' : '1.5rem')};
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.02em;
  margin-bottom: 0.375rem;
`

const PageSubtitle = styled.p`
  font-size: 0.9375rem;
  color: ${c.textSec};
  line-height: 1.55;
  margin-bottom: 1.75rem;
`

const SecLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
`

const Card = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`

const FGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
  &:last-of-type { margin-bottom: 0; }
`

const FLabel = styled.label<{ $req?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${c.text};
  &::after {
    content: ${({ $req }) => ($req ? '" *"' : '""')};
    color: ${c.err};
  }
`

const FHint = styled.div`
  font-size: 0.8125rem;
  color: ${c.textTer};
  line-height: 1.4;
`

const FError = styled.div`
  font-size: 0.8125rem;
  color: ${c.err};
  font-weight: 500;
`

// TODO: заменить на TextField / TextArea из @salutejs/plasma-web
const Textarea = styled.textarea<{ $err?: boolean; $compact?: boolean }>`
  width: 100%;
  padding: ${({ $compact }) => ($compact ? '0.5rem 0.75rem' : '0.75rem 0.875rem')};
  min-height: ${({ $compact }) => ($compact ? '72px' : '96px')};
  border: 1px solid ${({ $err }) => ($err ? c.errBorder : c.border)};
  border-radius: ${({ $compact }) => ($compact ? '8px' : '10px')};
  background: ${({ $err }) => ($err ? c.errBg : c.inputBg)};
  color: ${c.text};
  font-size: ${({ $compact }) => ($compact ? '0.875rem' : '0.9375rem')};
  font-family: inherit;
  resize: vertical;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.12s, box-shadow 0.12s;
  &::placeholder { color: ${c.textTer}; }
  &:focus {
    border-color: ${({ $err }) => ($err ? c.err : c.accent)};
    background: ${c.cardBg};
    box-shadow: 0 0 0 3px ${({ $err }) => ($err ? 'rgba(220,38,38,0.1)' : 'rgba(99,102,241,0.1)')};
  }
`

const OptionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const Opt = styled.button<{ $on: boolean; $lg?: boolean }>`
  padding: ${({ $lg }) => ($lg ? '0.75rem 1.125rem' : '0.4rem 0.875rem')};
  border: 2px solid ${({ $on }) => ($on ? c.accent : c.border)};
  border-radius: ${({ $lg }) => ($lg ? '12px' : '8px')};
  background: ${({ $on }) => ($on ? c.accentBg : c.cardBg)};
  color: ${({ $on }) => ($on ? c.accentDark : c.text)};
  font-family: inherit;
  font-size: ${({ $lg }) => ($lg ? '0.9375rem' : '0.875rem')};
  font-weight: ${({ $on }) => ($on ? '600' : '400')};
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
  &:hover {
    border-color: ${({ $on }) => ($on ? c.accent : '#a5b4fc')};
    background: ${({ $on }) => ($on ? c.accentBg : '#f5f7ff')};
  }
`

const ActRow = styled.div`
  display: flex;
  gap: 0.625rem;
  align-items: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = styled.span<{ $status: RequestStatus }>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  flex-shrink: 0;
  white-space: nowrap;
  background: ${({ $status }) =>
    $status === 'approved' ? c.okBg :
    $status === 'pending'  ? c.pendingBg :
    $status === 'sent'     ? c.sentBg :
    c.errBg};
  color: ${({ $status }) =>
    $status === 'approved' ? c.ok :
    $status === 'pending'  ? c.pendingText :
    $status === 'sent'     ? c.sentText :
    c.err};
  border: 1px solid ${({ $status }) =>
    $status === 'approved' ? c.okBorder :
    $status === 'pending'  ? c.pendingBorder :
    $status === 'sent'     ? c.sentBorder :
    c.errBorder};
`

// ─── Review data grid ─────────────────────────────────────────────────────────

const RevGrid = styled.div`display: flex; flex-direction: column;`
const RevRow = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid ${c.border};
  &:last-child { border-bottom: none; }
`
const RevKey = styled.div`font-size: 0.8125rem; color: ${c.textTer}; width: 100px; flex-shrink: 0;`
const RevVal = styled.div`font-size: 0.8125rem; color: ${c.text}; font-weight: 500;`

function ReviewData({ form, dense }: { form: FormData; dense?: boolean }) {
  return (
    <RevGrid style={dense ? { gap: 0 } : {}}>
      <RevRow><RevKey>Сервис</RevKey><RevVal>{form.service}</RevVal></RevRow>
      <RevRow><RevKey>Цель</RevKey><RevVal>{form.purpose}</RevVal></RevRow>
      <RevRow><RevKey>Срок</RevKey><RevVal>{form.duration}</RevVal></RevRow>
      {form.comment && <RevRow><RevKey>Комментарий</RevKey><RevVal>{form.comment}</RevVal></RevRow>}
    </RevGrid>
  )
}

// ─── Success styled primitives (shared across views) ─────────────────────────

const SuccessBox = styled.div`
  background: ${c.okBg};
  border: 1px solid ${c.okBorder};
  border-radius: 16px;
  padding: 2rem 2.5rem;
  max-width: 520px;
`
const SuccessIcon = styled.div`font-size: 2rem; margin-bottom: 0.75rem;`
const SuccessTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${c.ok};
  margin-bottom: 0.5rem;
`
const SuccessDesc = styled.div`
  font-size: 0.9375rem;
  color: ${c.textSec};
  line-height: 1.55;
  margin-bottom: 1.5rem;
`
const ExpertSuccessCard = styled.div`
  background: ${c.okBg};
  border: 1px solid ${c.okBorder};
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  max-width: 440px;
`
const ExpertSuccessStatus = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${c.ok};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.5rem;
`
const ExpertSuccessTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.02em;
  margin-bottom: 0.375rem;
`
const ExpertSuccessNote = styled.div`
  font-size: 0.875rem;
  color: ${c.textSec};
  line-height: 1.5;
  margin-bottom: 1.25rem;
`

// ─── Basic: wizard ────────────────────────────────────────────────────────────

const BasicPageLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 560px) 260px;
  gap: 1.5rem;
  align-items: start;
  max-width: 900px;
`

// Basic right panel: requests list
const BasicReqList = styled.div`display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.375rem;`
const BasicReqItem = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 10px;
  padding: 0.625rem 0.875rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
`
const BasicReqItemBody = styled.div`flex: 1; min-width: 0;`
const BasicReqItemId = styled.div`font-size: 0.75rem; color: ${c.textTer};`
const BasicReqItemTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${c.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const ShowAllBtn = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0;
  font-size: 0.8125rem;
  color: ${c.accent};
  cursor: pointer;
  font-family: inherit;
  transition: color 0.1s;
  &:hover { color: ${c.accentDark}; text-decoration: underline; }
`

// Wizard styled components
const StepBar = styled.div`
  height: 4px; border-radius: 2px; background: ${c.border}; margin-bottom: 1.5rem; overflow: hidden;
`
const StepFill = styled.div<{ $pct: number }>`
  height: 100%; width: ${({ $pct }) => $pct}%; background: ${c.accent}; border-radius: 2px;
  transition: width 0.3s ease;
`
const StepMeta = styled.div`
  font-size: 0.8125rem; font-weight: 600; color: ${c.textTer};
  margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.06em;
`
const StepHint = styled.div`
  background: ${c.accentBg}; border: 1px solid ${c.accentBorder}; border-radius: 10px;
  padding: 0.75rem 1rem; font-size: 0.875rem; color: ${c.accentDark}; line-height: 1.5;
  margin-bottom: 1.25rem;
`
const BasicErrBox = styled.div`
  background: ${c.errBg}; border: 1px solid ${c.errBorder}; border-radius: 10px;
  padding: 1rem 1.25rem; margin-bottom: 1rem;
`
const BasicErrTitle = styled.div`font-size: 0.9375rem; font-weight: 700; color: ${c.err}; margin-bottom: 0.25rem;`
const BasicErrDesc = styled.div`font-size: 0.875rem; color: ${c.textSec};`

const CtxBox = styled.div`
  background: #f9fafb; border: 1px solid ${c.border}; border-radius: 10px;
  padding: 0.75rem 1rem; margin-bottom: 1rem;
`
const CtxLabel = styled.div`
  font-size: 0.6875rem; font-weight: 600; color: ${c.textTer};
  text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0.375rem;
`
const CtxRow = styled.div`font-size: 0.875rem; color: ${c.textSec}; line-height: 1.5;`
const CtxVal = styled.span`color: ${c.text}; font-weight: 500;`

const STEP_HINTS = [
  'Выберите систему, к которой нужен доступ для работы.',
  'Кратко опишите, зачем вам нужен этот доступ.',
  'Выберите срок. Комментарий необязателен.',
  'Проверьте данные перед отправкой. Если что-то не так — нажмите «Назад».',
]

interface BasicViewProps {
  form: FormData
  update: (u: Partial<FormData>) => void
  taskState: TaskState
  requests: MockRequest[]
  onSubmit: () => void
  onReset: () => void
  onGoToMain: () => void
}

function BasicTaskView({ form, update, taskState, requests, onSubmit, onReset, onGoToMain }: BasicViewProps) {
  const [step, setStep] = useState(1)
  const [stepErr, setStepErr] = useState('')
  const [showAll, setShowAll] = useState(false)

  function tryNext() {
    if (step === 1 && !form.service) { setStepErr('Нужно выбрать сервис'); return }
    if (step === 2 && !form.purpose.trim()) { setStepErr('Нужно заполнить цель доступа'); return }
    if (step === 3 && !form.duration) { setStepErr('Нужно выбрать срок доступа'); return }
    setStepErr('')
    setStep(s => s + 1)
  }

  function back() { setStepErr(''); setStep(s => s - 1) }

  const showCtx = step >= 2 && (!!form.service || (step >= 3 && !!form.purpose))
  const visibleRequests = showAll ? requests : requests.slice(0, 2)

  return (
    <BasicPageLayout>
      {/* Left: wizard or inline success */}
      <div>
        {taskState === 'success' ? (
          <SuccessBox>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Заявка {REQUEST_NUMBER} отправлена</SuccessTitle>
            <SuccessDesc>Статус можно проверить в списке заявок.</SuccessDesc>
            <ActRow>
              <Button view="primary" size="m" text="На главный экран" onClick={onGoToMain} />
              <Button view="secondary" size="m" text="Создать ещё одну" onClick={onReset} />
            </ActRow>
          </SuccessBox>
        ) : (
          <>
            <StepMeta>Шаг {step} из 4</StepMeta>
            <StepBar><StepFill $pct={(step / 4) * 100} /></StepBar>
            <StepHint>{STEP_HINTS[step - 1]}</StepHint>

            {showCtx && (
              <CtxBox>
                <CtxLabel>Вы уже выбрали</CtxLabel>
                {form.service && <CtxRow>Сервис: <CtxVal>{form.service}</CtxVal></CtxRow>}
                {step >= 3 && form.purpose && <CtxRow>Цель: <CtxVal>{form.purpose}</CtxVal></CtxRow>}
                {step >= 4 && form.duration && <CtxRow>Срок: <CtxVal>{form.duration}</CtxVal></CtxRow>}
              </CtxBox>
            )}

            {stepErr && (
              <BasicErrBox>
                <BasicErrTitle>Нужно заполнить поле</BasicErrTitle>
                <BasicErrDesc>{stepErr}</BasicErrDesc>
              </BasicErrBox>
            )}

            {step === 1 && (
              <Card>
                <FGroup>
                  <FLabel $req>Выберите сервис</FLabel>
                  <OptionsRow>
                    {taskServices.map(s => (
                      <Opt
                        key={s} $on={form.service === s} $lg
                        onClick={() => { update({ service: s }); setStepErr('') }}
                      >{s}</Opt>
                    ))}
                  </OptionsRow>
                </FGroup>
                <ActRow>
                  <Button view="primary" size="m" text="Далее" onClick={tryNext} />
                </ActRow>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <FGroup>
                  <FLabel $req>Цель доступа</FLabel>
                  <Textarea
                    placeholder="Например: работа с клиентскими заявками отдела продаж"
                    value={form.purpose}
                    onChange={e => {
                      update({ purpose: e.target.value })
                      if (e.target.value.trim()) setStepErr('')
                    }}
                    $err={!!stepErr}
                  />
                  <FHint>Укажите рабочую задачу, для которой нужен доступ</FHint>
                </FGroup>
                <ActRow>
                  <Button view="primary" size="m" text="Далее" onClick={tryNext} />
                  <Button view="secondary" size="m" text="Назад" onClick={back} />
                </ActRow>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <FGroup>
                  <FLabel $req>Срок доступа</FLabel>
                  <OptionsRow>
                    {taskDurations.map(d => (
                      <Opt
                        key={d} $on={form.duration === d}
                        onClick={() => { update({ duration: d }); setStepErr('') }}
                      >{d}</Opt>
                    ))}
                  </OptionsRow>
                </FGroup>
                <FGroup>
                  <FLabel>Комментарий</FLabel>
                  <Textarea
                    placeholder="Например: нужен доступ только к разделу отчётов"
                    value={form.comment}
                    onChange={e => update({ comment: e.target.value })}
                  />
                </FGroup>
                <ActRow>
                  <Button view="primary" size="m" text="Проверить заявку" onClick={tryNext} />
                  <Button view="secondary" size="m" text="Назад" onClick={back} />
                </ActRow>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <PageTitle $compact style={{ marginBottom: '1rem' }}>Проверьте данные</PageTitle>
                <ReviewData form={form} />
                <ActRow>
                  <Button view="primary" size="m" text="Отправить" onClick={onSubmit} />
                  <Button view="secondary" size="m" text="Назад" onClick={back} />
                </ActRow>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Right: requests panel */}
      <div>
        <SecLabel>Последние заявки</SecLabel>
        <BasicReqList>
          {visibleRequests.map(r => (
            <BasicReqItem key={r.id}>
              <BasicReqItemBody>
                <BasicReqItemId>{r.id}</BasicReqItemId>
                <BasicReqItemTitle>{r.title}</BasicReqItemTitle>
              </BasicReqItemBody>
              <StatusBadge $status={r.status}>{STATUS_LABELS[r.status].full}</StatusBadge>
            </BasicReqItem>
          ))}
        </BasicReqList>
        {requests.length > 2 && (
          <ShowAllBtn onClick={() => setShowAll(s => !s)}>
            {showAll ? '↑ Свернуть' : `Показать все (${requests.length})`}
          </ShowAllBtn>
        )}
      </div>
    </BasicPageLayout>
  )
}

// ─── Standard: two-column, inline success ────────────────────────────────────

const ErrSummary = styled.div`
  background: ${c.errBg}; border: 1px solid ${c.errBorder}; border-radius: 10px;
  padding: 0.875rem 1.125rem; margin-bottom: 1.5rem;
`
const ErrSummaryTitle = styled.div`font-size: 0.875rem; font-weight: 700; color: ${c.err}; margin-bottom: 0.375rem;`
const ErrSummaryList = styled.ul`
  margin: 0; padding-left: 1.25rem; font-size: 0.8125rem; color: ${c.err};
  li { margin-bottom: 0.2rem; }
`

const StandardPageLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 560px) 272px;
  gap: 1.5rem;
  align-items: start;
  max-width: 920px;
`
const ReqSidePanel = styled.div`
  background: ${c.cardBg}; border: 1px solid ${c.border}; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`
const ReqSideItem = styled.div`
  padding: 0.75rem 1rem; border-bottom: 1px solid ${c.border};
  &:last-child { border-bottom: none; }
`
const ReqSideItemTop = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 0.5rem; margin-bottom: 0.25rem;
`
const ReqSideItemTitle = styled.div`font-size: 0.8125rem; font-weight: 500; color: ${c.text}; flex: 1; min-width: 0;`
const ReqSideItemMeta = styled.div`font-size: 0.75rem; color: ${c.textTer};`

interface StdProps {
  form: FormData
  update: (u: Partial<FormData>) => void
  errors: FormErrors
  taskState: TaskState
  requests: MockRequest[]
  onReview: () => void
  onSubmit: () => void
  onEdit: () => void
  onReset: () => void
  onGoToMain: () => void
}

function StandardTaskView({ form, update, errors, taskState, requests, onReview, onSubmit, onEdit, onReset, onGoToMain }: StdProps) {
  const showErrors = taskState === 'error' && hasErrors(errors)

  const rightPanel = (
    <div>
      <SecLabel>Последние заявки</SecLabel>
      <ReqSidePanel>
        {requests.map(r => (
          <ReqSideItem key={r.id}>
            <ReqSideItemTop>
              <ReqSideItemTitle>{r.title}</ReqSideItemTitle>
              <StatusBadge $status={r.status}>{STATUS_LABELS[r.status].full}</StatusBadge>
            </ReqSideItemTop>
            <ReqSideItemMeta>{r.id} · {r.date}</ReqSideItemMeta>
          </ReqSideItem>
        ))}
      </ReqSidePanel>
    </div>
  )

  return (
    <StandardPageLayout>
      <div>
        {taskState === 'success' && (
          <SuccessBox>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Заявка {REQUEST_NUMBER} отправлена</SuccessTitle>
            <SuccessDesc>
              Подтверждение придёт на корпоративную почту. Статус можно проверить в списке заявок.
            </SuccessDesc>
            <ActRow>
              <Button view="primary" size="m" text="На главный экран" onClick={onGoToMain} />
              <Button view="secondary" size="m" text="Создать ещё одну" onClick={onReset} />
            </ActRow>
          </SuccessBox>
        )}

        {taskState === 'review' && (
          <>
            <PageTitle>Проверьте заявку</PageTitle>
            <PageSubtitle>Если что-то требует изменений — вернитесь к редактированию.</PageSubtitle>
            <Card>
              <ReviewData form={form} />
              <ActRow>
                <Button view="primary" size="m" text="Отправить" onClick={onSubmit} />
                <Button view="secondary" size="m" text="Редактировать" onClick={onEdit} />
              </ActRow>
            </Card>
          </>
        )}

        {(taskState === 'filling' || taskState === 'error') && (
          <>
            <PageTitle>Заявки</PageTitle>
            <PageSubtitle>Создайте новую заявку или проверьте статус существующих.</PageSubtitle>

            {showErrors && (
              <ErrSummary>
                <ErrSummaryTitle>Исправьте ошибки перед продолжением</ErrSummaryTitle>
                <ErrSummaryList>
                  {errors.service && <li>{errors.service}</li>}
                  {errors.purpose && <li>{errors.purpose}</li>}
                  {errors.duration && <li>{errors.duration}</li>}
                </ErrSummaryList>
              </ErrSummary>
            )}

            <Card>
              <FGroup>
                <FLabel $req>Сервис</FLabel>
                <OptionsRow>
                  {taskServices.map(s => (
                    <Opt key={s} $on={form.service === s} onClick={() => update({ service: s })}>{s}</Opt>
                  ))}
                </OptionsRow>
                {showErrors && errors.service && <FError>{errors.service}</FError>}
              </FGroup>

              <FGroup>
                <FLabel $req>Цель доступа</FLabel>
                <Textarea
                  placeholder="Например: работа с заявками клиентов"
                  value={form.purpose}
                  onChange={e => update({ purpose: e.target.value })}
                  $err={showErrors && !!errors.purpose}
                />
                <FHint>Укажите рабочую задачу, для которой нужен доступ</FHint>
                {showErrors && errors.purpose && <FError>{errors.purpose}</FError>}
              </FGroup>

              <FGroup>
                <FLabel $req>Срок доступа</FLabel>
                <OptionsRow>
                  {taskDurations.map(d => (
                    <Opt key={d} $on={form.duration === d} onClick={() => update({ duration: d })}>{d}</Opt>
                  ))}
                </OptionsRow>
                {showErrors && errors.duration && <FError>{errors.duration}</FError>}
              </FGroup>

              <FGroup>
                <FLabel>Комментарий</FLabel>
                <Textarea
                  placeholder="Необязательно"
                  value={form.comment}
                  onChange={e => update({ comment: e.target.value })}
                />
              </FGroup>

              <ActRow>
                <Button view="primary" size="m" text="Проверить заявку" onClick={onReview} />
              </ActRow>
            </Card>
          </>
        )}
      </div>
      {rightPanel}
    </StandardPageLayout>
  )
}

// ─── Expert: compact form + requests table ────────────────────────────────────

const ExpertWrapper = styled.div`max-width: 720px;`
const ExpertDivider = styled.div`height: 1px; background: ${c.border}; margin: 0.875rem 0 1rem;`
const ExpertReqTable = styled.div`display: flex; flex-direction: column;`
const ExpertReqRow = styled.div`
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.8125rem;
  &:hover { background: #f9fafb; }
`
const ExpertReqId = styled.span`color: ${c.textTer}; font-size: 0.75rem; width: 48px; flex-shrink: 0;`
const ExpertReqTitle = styled.span`flex: 1; color: ${c.text}; min-width: 0;`
const ExpertReqStatusText = styled.span<{ $status: RequestStatus }>`
  font-size: 0.75rem; font-weight: 500; width: 88px; flex-shrink: 0;
  color: ${({ $status }) =>
    $status === 'approved' ? c.ok :
    $status === 'pending'  ? c.pendingText :
    $status === 'sent'     ? c.sentText :
    c.err};
`
const ExpertReqDate = styled.span`font-size: 0.75rem; color: ${c.textTer}; flex-shrink: 0;`

const TemplateRow = styled.div`display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;`
const TemplateChip = styled.button`
  background: #f3f4f6; border: 1px solid ${c.border}; border-radius: 20px;
  padding: 0.3rem 0.875rem; font-size: 0.8125rem; font-family: inherit; color: #374151;
  cursor: pointer; transition: background 0.1s, border-color 0.1s;
  &:hover { background: ${c.accentBg}; border-color: ${c.accentBorder}; color: ${c.accentDark}; }
`
const ExpertGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;`
const ExpertFullRow = styled.div`margin-bottom: 1rem;`
const ExpertErrRow = styled.div`display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem;`
const ExpertRevCard = styled.div`
  background: ${c.cardBg}; border: 1px solid ${c.border}; border-radius: 10px;
  padding: 1rem 1.25rem; margin-bottom: 1.25rem;
`

function ExpertTaskView({ form, update, errors, taskState, requests, onReview, onSubmit, onEdit, onReset, onGoToMain }: StdProps) {
  const showErrors = taskState === 'error' && hasErrors(errors)

  function applyTemplate(tpl: ExpertTemplate) {
    update({ service: tpl.service, duration: tpl.duration, purpose: tpl.purpose })
  }

  return (
    <ExpertWrapper>
      {/* Requests table — always visible */}
      <SecLabel>Заявки</SecLabel>
      <ExpertReqTable>
        {requests.map(r => (
          <ExpertReqRow key={r.id}>
            <ExpertReqId>{r.id}</ExpertReqId>
            <ExpertReqTitle>{r.title}</ExpertReqTitle>
            <ExpertReqStatusText $status={r.status}>{STATUS_LABELS[r.status].short}</ExpertReqStatusText>
            <ExpertReqDate>{r.date}</ExpertReqDate>
          </ExpertReqRow>
        ))}
      </ExpertReqTable>

      <ExpertDivider />

      {/* Success */}
      {taskState === 'success' && (
        <ExpertSuccessCard>
          <ExpertSuccessStatus>Выполнено</ExpertSuccessStatus>
          <ExpertSuccessTitle>Заявка {REQUEST_NUMBER} создана</ExpertSuccessTitle>
          <ExpertSuccessNote>Статус можно проверить в списке заявок.</ExpertSuccessNote>
          <ActRow style={{ marginTop: 0 }}>
            <Button view="primary" size="s" text="На главный экран" onClick={onGoToMain} />
            <Button view="secondary" size="s" text="Создать ещё одну" onClick={onReset} />
          </ActRow>
        </ExpertSuccessCard>
      )}

      {/* Review */}
      {taskState === 'review' && (
        <>
          <PageTitle $compact>Проверить заявку</PageTitle>
          <ExpertRevCard>
            <ReviewData form={form} dense />
          </ExpertRevCard>
          <ActRow>
            <Button view="primary" size="s" text="Отправить" onClick={onSubmit} />
            <Button view="secondary" size="s" text="Назад" onClick={onEdit} />
          </ActRow>
        </>
      )}

      {/* Form */}
      {(taskState === 'filling' || taskState === 'error') && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <PageTitle $compact>Новая заявка</PageTitle>
          </div>

          <TemplateRow>
            {expertTemplates.map(t => (
              <TemplateChip key={t.label} onClick={() => applyTemplate(t)}>{t.label}</TemplateChip>
            ))}
          </TemplateRow>

          {showErrors && (
            <ExpertErrRow>
              {errors.service && <FError>{errors.service}</FError>}
              {errors.purpose && <FError>{errors.purpose}</FError>}
              {errors.duration && <FError>{errors.duration}</FError>}
            </ExpertErrRow>
          )}

          <Card style={{ padding: '1.25rem' }}>
            <ExpertGrid>
              <FGroup>
                <FLabel $req>Сервис</FLabel>
                <OptionsRow>
                  {taskServices.map(s => (
                    <Opt key={s} $on={form.service === s} onClick={() => update({ service: s })}>{s}</Opt>
                  ))}
                </OptionsRow>
                {showErrors && errors.service && <FError>{errors.service}</FError>}
              </FGroup>

              <FGroup>
                <FLabel $req>Срок</FLabel>
                <OptionsRow>
                  {taskDurations.map(d => (
                    <Opt key={d} $on={form.duration === d} onClick={() => update({ duration: d })}>{d}</Opt>
                  ))}
                </OptionsRow>
                {showErrors && errors.duration && <FError>{errors.duration}</FError>}
              </FGroup>
            </ExpertGrid>

            <ExpertFullRow>
              <FGroup>
                <FLabel $req>Цель</FLabel>
                <Textarea
                  $compact
                  placeholder="Например: работа с заявками клиентов"
                  value={form.purpose}
                  onChange={e => update({ purpose: e.target.value })}
                  $err={showErrors && !!errors.purpose}
                />
                {showErrors && errors.purpose && <FError>{errors.purpose}</FError>}
              </FGroup>
            </ExpertFullRow>

            <FGroup>
              <FLabel>Комментарий</FLabel>
              <Textarea
                $compact
                placeholder="Необязательно"
                value={form.comment}
                onChange={e => update({ comment: e.target.value })}
              />
            </FGroup>

            <ActRow>
              <Button view="primary" size="s" text="Отправить" onClick={onSubmit} />
              <Button view="secondary" size="s" text="Проверить" onClick={onReview} />
            </ActRow>
          </Card>
        </>
      )}
    </ExpertWrapper>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function TaskScreen() {
  const { mode } = useUserMode()
  const navigate = useNavigate()
  const { openObject } = useOpenObjects()

  useEffect(() => {
    openObject({
      id: 'task-form',
      type: 'form',
      label: 'Новая заявка',
      fullLabel: 'Форма создания заявки на доступ',
      route: '/task',
    })
  }, [openObject])

  const [form, setForm] = useState<FormData>({ service: '', purpose: '', duration: '', comment: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [taskState, setTaskState] = useState<TaskState>('filling')
  const [requests, setRequests] = useState<MockRequest[]>([...mockRequests])
  // Incrementing this key remounts BasicTaskView, resetting its local wizard state to step 1
  const [wizardKey, setWizardKey] = useState(0)

  function update(u: Partial<FormData>) {
    setForm(prev => ({ ...prev, ...u }))
    setErrors(prev => {
      if (!hasErrors(prev)) return prev
      const next: FormErrors = { ...prev }
      if ('service' in u && u.service) delete next.service
      if ('purpose' in u && (u.purpose ?? '').trim()) delete next.purpose
      if ('duration' in u && u.duration) delete next.duration
      return next
    })
  }

  function doReview() {
    const e = validate(form)
    if (hasErrors(e)) { setErrors(e); setTaskState('error') }
    else { setErrors({}); setTaskState('review') }
  }

  function doSubmit() {
    const e = validate(form)
    if (hasErrors(e)) { setErrors(e); setTaskState('error') }
    else {
      const newReq: MockRequest = {
        id: REQUEST_NUMBER,
        title: `Доступ к ${form.service}`,
        status: 'sent',
        date: 'Сегодня',
      }
      setRequests(prev => [newReq, ...prev])
      setErrors({})
      setTaskState('success')
    }
  }

  function doEdit() { setTaskState('filling') }

  function doReset() {
    setForm({ service: '', purpose: '', duration: '', comment: '' })
    setErrors({})
    setTaskState('filling')
    setWizardKey(k => k + 1)
  }

  const stdProps: StdProps = {
    form, update, errors, taskState, requests,
    onReview: doReview,
    onSubmit: doSubmit,
    onEdit: doEdit,
    onReset: doReset,
    onGoToMain: () => navigate('/main'),
  }

  return (
    <>
      {mode === 'basic' && (
        <BasicTaskView
          key={wizardKey}
          form={form}
          update={update}
          taskState={taskState}
          requests={requests}
          onSubmit={doSubmit}
          onReset={doReset}
          onGoToMain={() => navigate('/main')}
        />
      )}
      {mode === 'standard' && <StandardTaskView {...stdProps} />}
      {mode === 'expert' && <ExpertTaskView {...stdProps} />}
    </>
  )
}
