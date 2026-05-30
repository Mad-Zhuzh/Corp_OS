import { useState, useEffect, useCallback, type MouseEvent } from 'react'
import { track } from '../../utils/analytics'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { IconFolderOutline, IconEditOutline, IconDoneCircleOutline } from '@salutejs/plasma-icons'
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../../components/shared/buttons'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useUserMode } from '../../context/UserModeContext'
import { useOpenObjects } from '../../context/OpenObjectsContext'
import { FilePicker } from '../../components/shared/FilePicker'
import { mockFiles, type MockFile } from '../../data/filesMockData'
import { pluralAttachedFiles } from '../../utils/plural'

// ─── Shared design tokens ─────────────────────────────────────────────────────

const c = {
  text:          '#1a1a1a',
  textSec:       '#4b5563',
  textTer:       '#6b7280',
  accent:        '#4f46e5',
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

// ─── Wizard styled components ─────────────────────────────────────────────────
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

// ─── Folder-based request ─────────────────────────────────────────────────────

const FOLDER_REQ = {
  folderName: 'ООО Рога и Копыта',
  supplier:   'ООО "Рога и Копыта"',
  inn:        '7712345678',
  amount:     '485 000 ₽',
  purpose:    'Закупка офисного оборудования',
  delivery:   '30 рабочих дней',
  filesCount: 3,
  files: [
    { name: 'Коммерческое предложение.pdf', ext: 'PDF' },
    { name: 'Реквизиты поставщика.xlsx',    ext: 'XLSX' },
    { name: 'Обоснование закупки.docx',     ext: 'DOCX' },
  ],
}

const EXT_COLOR: Record<string, { bg: string; fg: string }> = {
  pdf:  { bg: '#fee2e2', fg: '#b91c1c' },
  xlsx: { bg: '#dcfce7', fg: '#15803d' },
  docx: { bg: '#dbeafe', fg: '#1d4ed8' },
}

// shared folder-flow styled components
const FlRoot = styled.div`max-width: 620px;`

const FlFileRow = styled.div`
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  background: ${c.okBg}; border: 1px solid ${c.okBorder}; border-radius: 8px;
  margin-bottom: 0.375rem;
`
const FlFileExt = styled.span<{ $bg: string; $fg: string }>`
  padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.6875rem; font-weight: 700;
  background: ${({ $bg }) => $bg}; color: ${({ $fg }) => $fg};
`
const FlFileName = styled.span`flex: 1; font-size: 0.875rem; color: ${c.text};`
const FlCheck = styled.span`font-size: 0.875rem; color: ${c.ok}; font-weight: 700;`

const FlDataCard = styled.div`
  background: ${c.cardBg}; border: 1px solid ${c.border}; border-radius: 12px;
  overflow: hidden;
`
const FlDataRow = styled.div`
  display: flex; gap: 1rem; padding: 0.625rem 1rem;
  border-bottom: 1px solid ${c.border};
  &:last-child { border-bottom: none; }
`
const FlDataKey = styled.div`font-size: 0.8125rem; color: ${c.textTer}; width: 140px; flex-shrink: 0;`
const FlDataVal = styled.div`font-size: 0.8125rem; color: ${c.text}; font-weight: 500;`

const FlInput = styled.input<{ $err?: boolean }>`
  width: 100%; height: 38px; padding: 0 0.75rem;
  border: 1px solid ${({ $err }) => ($err ? c.errBorder : c.border)};
  border-radius: 8px; background: ${c.inputBg}; color: ${c.text};
  font-size: 0.875rem; font-family: inherit; outline: none;
  &::placeholder { color: ${c.textTer}; }
  &:focus { border-color: ${c.accent}; background: ${c.cardBg}; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
`

const FlHint = styled.div`font-size: 0.8125rem; color: ${c.textTer}; line-height: 1.4; margin-top: 0.25rem;`
const FlInfoBanner = styled.div<{ $ok?: boolean }>`
  background: ${({ $ok }) => ($ok ? c.okBg : c.accentBg)};
  border: 1px solid ${({ $ok }) => ($ok ? c.okBorder : c.accentBorder)};
  border-radius: 10px; padding: 0.75rem 1rem;
  font-size: 0.875rem; color: ${({ $ok }) => ($ok ? c.ok : c.accentDark)};
  line-height: 1.5; margin-bottom: 1.25rem;
`

// ─── Shared: empty file drop zone ────────────────────────────────────────────

const FileDropZone = styled.div`
  border: 2px dashed ${c.border};
  border-radius: 12px;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  margin-bottom: 0.75rem;
  &:hover { border-color: ${c.accent}; background: ${c.accentBg}; }
`
const FileDropZoneText = styled.div`font-size: 0.875rem; color: ${c.textSec}; font-weight: 500;`

// ─── Shared: priority picker ──────────────────────────────────────────────────

const PRIORITIES = ['Обычный', 'Срочный', 'Критический'] as const
type Priority = typeof PRIORITIES[number]

interface ManualFormValues {
  supplier: string
  inn: string
  amount: string
  purpose: string
  deadline: string
  priority: Priority
  comment: string
}

function PriorityPicker({ value, onChange }: { value: Priority; onChange: (v: Priority) => void }) {
  return (
    <OptionsRow>
      {PRIORITIES.map(p => (
        <Opt key={p} $on={value === p} onClick={() => onChange(p)}>{p}</Opt>
      ))}
    </OptionsRow>
  )
}

// ─── Shared: deadline input with smart chips ──────────────────────────────────

const SuggestionRow = styled.div`display: flex; gap: 0.375rem; flex-wrap: wrap; margin-top: 0.375rem;`
const SuggestionChip = styled.button`
  background: ${c.accentBg}; border: 1px solid ${c.accentBorder}; border-radius: 16px;
  padding: 0.2rem 0.625rem; font-size: 0.75rem; font-family: inherit; color: ${c.accentDark};
  cursor: pointer; transition: background 0.1s;
  &:hover { background: ${c.accentBorder}; }
`

function getDeadlineSuggestions(input: string): string[] {
  const trimmed = input.trim()
  if (!/^\d+$/.test(trimmed)) return []
  const n = parseInt(trimmed)
  if (n <= 0) return []
  const days  = n === 1 ? 'день'   : n < 5  ? 'дня'   : 'дней'
  const hours = n === 1 ? 'час'    : n < 5  ? 'часа'  : 'часов'
  const weeks = n === 1 ? 'неделя' : n < 5  ? 'недели': 'недель'
  if (n === 1) return [`1 ${days}`, `1 ${weeks}`, `1 ${hours}`]
  if (n === 2) return [`2 ${days}`, `2 ${weeks}`, `2 ${hours}`]
  if (n === 3) return [`3 ${days}`, `30 дней`, `3 ${hours}`]
  if (n === 7) return [`7 ${days}`, `7 ${hours}`]
  return [`${n} ${days}`, `${n} ${hours}`]
}

interface DeadlineInputProps {
  value: string
  onChange: (v: string) => void
  $err?: boolean
  placeholder?: string
}

function DeadlineInput({ value, onChange, $err, placeholder }: DeadlineInputProps) {
  const suggestions = getDeadlineSuggestions(value)
  return (
    <div>
      <FlInput
        value={value}
        onChange={e => onChange(e.target.value)}
        $err={$err}
        placeholder={placeholder ?? 'например: 30 дней'}
      />
      {suggestions.length > 0 && (
        <SuggestionRow>
          {suggestions.map(s => (
            <SuggestionChip key={s} type="button" onClick={() => onChange(s)}>{s}</SuggestionChip>
          ))}
        </SuggestionRow>
      )}
    </div>
  )
}

// ─── Shared: success screen ───────────────────────────────────────────────────

const SuccessScreenWrap = styled.div`
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
`
const SuccessScreenTitle = styled.div`font-size: 1.5rem; font-weight: 700; color: ${c.ok};`
const SuccessScreenText  = styled.div`font-size: 0.9375rem; color: ${c.textSec}; line-height: 1.55; margin-bottom: 0.5rem;`

// ─── Basic entry: choose method ───────────────────────────────────────────────

const MethodGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 560px;
  margin-bottom: 1.5rem;
`

const MethodCard = styled.button`
  background: ${c.cardBg};
  border: 2px solid ${c.border};
  border-radius: 16px;
  padding: 1.5rem 1.25rem;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  &:hover {
    border-color: ${c.accent};
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
`

const MethodIcon = styled.div`display: flex; margin-bottom: 0.25rem;`
const MethodTitle = styled.div`font-size: 1rem; font-weight: 700; color: ${c.text};`
const MethodDesc = styled.div`font-size: 0.875rem; color: ${c.textSec}; line-height: 1.4;`

// ─── Basic folder wizard ──────────────────────────────────────────────────────

interface BasicFolderFlowProps {
  initialFiles: MockFile[]
  onReset: () => void
}

function BasicFolderFlow({ initialFiles, onReset }: BasicFolderFlowProps) {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<MockFile[]>(initialFiles)
  const [step, setStep]       = useState(1)
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<Priority>('Обычный')
  const [comment, setComment]   = useState('')
  const [stepErr, setStepErr]   = useState('')
  const [done, setDone]         = useState(false)

  function tryNext() {
    if (step === 3 && !deadline.trim()) { setStepErr('Укажите срок исполнения'); return }
    setStepErr('')
    setStep(s => s + 1)
  }

  if (done) {
    return (
      <FlRoot>
        <SuccessScreenWrap>
          <IconDoneCircleOutline size="m" color="#059669" />
          <SuccessScreenTitle>Заявка отправлена</SuccessScreenTitle>
          <SuccessScreenText>
            Ваша заявка передана в отдел закупок.<br /> Мы уведомим вас о результате.
          </SuccessScreenText>
          <ActRow style={{ marginTop: '0.5rem' }}>
            <PrimaryButton size="m" text="Создать ещё одну заявку" onClick={onReset} />
            <SecondaryButton size="m" text="На главную" onClick={() => navigate('/main')} />
          </ActRow>
        </SuccessScreenWrap>
      </FlRoot>
    )
  }

  return (
    <FlRoot>
      <StepMeta>Шаг {step} из 4</StepMeta>
      <StepBar><StepFill $pct={(step / 4) * 100} /></StepBar>

      {step === 1 && (
        <Card>
          <PageTitle $compact style={{ marginBottom: '0.75rem' }}>Добавьте файлы</PageTitle>
          {attachedFiles.length === 0 ? (
            <>
              <FileDropZone onClick={() => setPickerOpen(true)}>
                <IconFolderOutline size="m" color="#9ca3af" />
                <FileDropZoneText>Добавьте файлы</FileDropZoneText>
                <PrimaryButton size="s" text="Выбрать файлы" onClick={(e: MouseEvent) => { e.stopPropagation(); setPickerOpen(true) }} />
              </FileDropZone>
              <ActRow style={{ marginTop: '0.5rem' }}>
                <TertiaryButton size="m" text="Назад" onClick={onReset} />
              </ActRow>
            </>
          ) : (
            <>
              <FlInfoBanner>Файлы добавлены. Данные будут извлечены автоматически.</FlInfoBanner>
              {attachedFiles.map(f => {
                const col = EXT_COLOR[f.type] ?? { bg: '#f3f4f6', fg: '#374151' }
                return (
                  <FlFileRow key={f.id}>
                    <FlFileExt $bg={col.bg} $fg={col.fg}>{f.type.toUpperCase()}</FlFileExt>
                    <FlFileName>{f.name}</FlFileName>
                    <FlCheck>✓ добавлен</FlCheck>
                  </FlFileRow>
                )
              })}
              <ActRow>
                <PrimaryButton size="m" text="Далее" onClick={tryNext} />
                <SecondaryButton size="m" text="Изменить файлы" onClick={() => setPickerOpen(true)} />
                <TertiaryButton size="m" text="Назад" onClick={onReset} />
              </ActRow>
            </>
          )}
          <FilePicker
            isOpen={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onConfirm={files => { setAttachedFiles(files); setPickerOpen(false) }}
            mode="basic"
          />
        </Card>
      )}

      {step === 2 && (
        <Card>
          <PageTitle $compact style={{ marginBottom: '0.5rem' }}>Проверьте найденные данные</PageTitle>
          <FlInfoBanner $ok>Мы нашли поставщика, сумму и назначение. Проверьте перед отправкой.</FlInfoBanner>
          <FlDataCard>
            <FlDataRow><FlDataKey>Поставщик</FlDataKey><FlDataVal>{FOLDER_REQ.supplier}</FlDataVal></FlDataRow>
            <FlDataRow><FlDataKey>ИНН</FlDataKey><FlDataVal>{FOLDER_REQ.inn}</FlDataVal></FlDataRow>
            <FlDataRow><FlDataKey>Сумма</FlDataKey><FlDataVal>{FOLDER_REQ.amount}</FlDataVal></FlDataRow>
            <FlDataRow><FlDataKey>Назначение</FlDataKey><FlDataVal>{FOLDER_REQ.purpose}</FlDataVal></FlDataRow>
          </FlDataCard>
          <ActRow>
            <PrimaryButton size="m" text="Верно" onClick={tryNext} />
            <TertiaryButton size="m" text="Назад" onClick={() => { setStepErr(''); setStep(1) }} />
          </ActRow>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <PageTitle $compact style={{ marginBottom: '0.5rem' }}>Заполните недостающие поля</PageTitle>
          {stepErr && <BasicErrBox><BasicErrTitle>Заполните поле</BasicErrTitle><BasicErrDesc>{stepErr}</BasicErrDesc></BasicErrBox>}
          <FGroup>
            <FLabel $req>Срок исполнения</FLabel>
            <DeadlineInput value={deadline} onChange={v => { setDeadline(v); setStepErr('') }} $err={!!stepErr && !deadline.trim()} />
            <FlHint>Укажите ожидаемый срок</FlHint>
          </FGroup>
          <FGroup>
            <FLabel $req>Приоритет</FLabel>
            <PriorityPicker value={priority} onChange={setPriority} />
          </FGroup>
          <FGroup>
            <FLabel>Комментарий</FLabel>
            <Textarea placeholder="если нужно" value={comment} onChange={e => setComment(e.target.value)} />
            <FHint>Необязательно</FHint>
          </FGroup>
          <ActRow>
            <PrimaryButton size="m" text="Продолжить" onClick={tryNext} />
            <TertiaryButton size="m" text="Назад" onClick={() => { setStepErr(''); setStep(2) }} />
          </ActRow>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <PageTitle $compact style={{ marginBottom: '0.5rem' }}>Отправьте заявку</PageTitle>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: c.textSec }}>
            Всё готово. Заявка будет отправлена в отдел закупок.
          </div>
          <FlDataCard style={{ marginBottom: '1.25rem' }}>
            <FlDataRow><FlDataKey>Поставщик</FlDataKey><FlDataVal>{FOLDER_REQ.supplier}</FlDataVal></FlDataRow>
            <FlDataRow><FlDataKey>ИНН</FlDataKey><FlDataVal>{FOLDER_REQ.inn}</FlDataVal></FlDataRow>
            <FlDataRow><FlDataKey>Сумма</FlDataKey><FlDataVal>{FOLDER_REQ.amount}</FlDataVal></FlDataRow>
            <FlDataRow><FlDataKey>Назначение</FlDataKey><FlDataVal>{FOLDER_REQ.purpose}</FlDataVal></FlDataRow>
            <FlDataRow><FlDataKey>Срок</FlDataKey><FlDataVal>{deadline}</FlDataVal></FlDataRow>
            <FlDataRow><FlDataKey>Приоритет</FlDataKey><FlDataVal>{priority}</FlDataVal></FlDataRow>
            {comment && <FlDataRow><FlDataKey>Комментарий</FlDataKey><FlDataVal>{comment}</FlDataVal></FlDataRow>}
            <FlDataRow>
              <FlDataKey>Файлы</FlDataKey>
              <FlDataVal>
                <div>{pluralAttachedFiles(attachedFiles.length)}:</div>
                {attachedFiles.map(f => (
                  <div key={f.id} style={{ fontWeight: 400, color: '#6b7280', marginTop: '0.15rem' }}>{f.name}</div>
                ))}
              </FlDataVal>
            </FlDataRow>
          </FlDataCard>
          <ActRow>
            <PrimaryButton size="m" text="Отправить заявку" onClick={() => { track('task-completed', { mode: 'basic', method: 'folder' }); setDone(true) }} />
            <TertiaryButton size="m" text="Назад" onClick={() => setStep(3)} />
          </ActRow>
        </Card>
      )}
    </FlRoot>
  )
}

// ─── Basic manual flow (procurement form) ─────────────────────────────────────

interface BasicManualFlowProps {
  onReset: () => void
  initialValues: ManualFormValues
  onValuesChange: (v: ManualFormValues) => void
}

function BasicManualFlow({ onReset, initialValues, onValuesChange }: BasicManualFlowProps) {
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(initialValues.supplier)
  const [inn, setInn]           = useState(initialValues.inn)
  const [amount, setAmount]     = useState(initialValues.amount)
  const [purpose, setPurpose]   = useState(initialValues.purpose)
  const [deadline, setDeadline] = useState(initialValues.deadline)
  const [priority, setPriority] = useState<Priority>(initialValues.priority)
  const [comment, setComment]   = useState(initialValues.comment)
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({})
  const [done, setDone]         = useState(false)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    onValuesChange({ supplier, inn, amount, purpose, deadline, priority, comment })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier, inn, amount, purpose, deadline, priority, comment])

  function handleReview() {
    const errs: Record<string, string> = {}
    if (!supplier.trim()) errs.supplier = 'Заполните поле «Поставщик»'
    if (!inn.trim())      errs.inn      = 'Заполните поле «ИНН»'
    if (!amount.trim())   errs.amount   = 'Заполните поле «Сумма»'
    if (!purpose.trim())  errs.purpose  = 'Заполните поле «Назначение»'
    if (!deadline.trim()) errs.deadline = 'Заполните поле «Срок исполнения»'
    if (Object.keys(errs).length > 0) { setFieldErrs(errs); return }
    setFieldErrs({})
    setShowReview(true)
  }

  if (done) {
    return (
      <FlRoot>
        <SuccessScreenWrap>
          <IconDoneCircleOutline size="m" color="#059669" />
          <SuccessScreenTitle>Заявка отправлена</SuccessScreenTitle>
          <SuccessScreenText>
            Ваша заявка передана в отдел закупок.<br /> Мы уведомим вас о результате.
          </SuccessScreenText>
          <ActRow style={{ marginTop: '0.5rem' }}>
            <PrimaryButton size="m" text="Создать ещё одну заявку" onClick={onReset} />
            <SecondaryButton size="m" text="На главную" onClick={() => navigate('/main')} />
          </ActRow>
        </SuccessScreenWrap>
      </FlRoot>
    )
  }

  if (showReview) {
    return (
      <FlRoot>
        <StepMeta>Шаг 2 из 2</StepMeta>
        <StepBar><StepFill $pct={100} /></StepBar>
        <PageTitle $compact style={{ marginBottom: '0.5rem' }}>Проверьте данные перед отправкой</PageTitle>
        <FlDataCard style={{ marginBottom: '1.25rem' }}>
          <FlDataRow><FlDataKey>Поставщик</FlDataKey><FlDataVal>{supplier}</FlDataVal></FlDataRow>
          <FlDataRow><FlDataKey>ИНН</FlDataKey><FlDataVal>{inn}</FlDataVal></FlDataRow>
          <FlDataRow><FlDataKey>Сумма</FlDataKey><FlDataVal>{amount}</FlDataVal></FlDataRow>
          <FlDataRow><FlDataKey>Назначение</FlDataKey><FlDataVal>{purpose}</FlDataVal></FlDataRow>
          <FlDataRow><FlDataKey>Срок</FlDataKey><FlDataVal>{deadline}</FlDataVal></FlDataRow>
          <FlDataRow><FlDataKey>Приоритет</FlDataKey><FlDataVal>{priority}</FlDataVal></FlDataRow>
          {comment && <FlDataRow><FlDataKey>Комментарий</FlDataKey><FlDataVal>{comment}</FlDataVal></FlDataRow>}
        </FlDataCard>
        <ActRow>
          <PrimaryButton size="m" text="Отправить заявку" onClick={() => { track('task-completed', { mode: 'basic', method: 'manual' }); setDone(true) }} />
          <TertiaryButton size="m" text="Назад" onClick={() => setShowReview(false)} />
        </ActRow>
      </FlRoot>
    )
  }

  function clearErr(field: string, value: string) {
    if (value.trim()) setFieldErrs(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  return (
    <FlRoot>
      <StepMeta>Шаг 1 из 2</StepMeta>
      <StepBar><StepFill $pct={50} /></StepBar>
      <StepHint>Заполните данные о закупке. Все поля кроме комментария обязательны.</StepHint>
      <Card>
        <FGroup>
          <FLabel $req>Поставщик</FLabel>
          <FlInput $err={!!fieldErrs.supplier} placeholder="Название организации" value={supplier} onChange={e => { setSupplier(e.target.value); clearErr('supplier', e.target.value) }} />
          {fieldErrs.supplier && <FError>{fieldErrs.supplier}</FError>}
        </FGroup>
        <FGroup>
          <FLabel $req>ИНН</FLabel>
          <FlInput $err={!!fieldErrs.inn} placeholder="например: 7712345678" value={inn} onChange={e => { setInn(e.target.value); clearErr('inn', e.target.value) }} />
          {fieldErrs.inn && <FError>{fieldErrs.inn}</FError>}
        </FGroup>
        <FGroup>
          <FLabel $req>Сумма</FLabel>
          <FlInput $err={!!fieldErrs.amount} placeholder="например: 485 000 ₽" value={amount} onChange={e => { setAmount(e.target.value); clearErr('amount', e.target.value) }} />
          {fieldErrs.amount && <FError>{fieldErrs.amount}</FError>}
        </FGroup>
        <FGroup>
          <FLabel $req>Назначение</FLabel>
          <FlInput $err={!!fieldErrs.purpose} placeholder="например: Закупка офисного оборудования" value={purpose} onChange={e => { setPurpose(e.target.value); clearErr('purpose', e.target.value) }} />
          {fieldErrs.purpose && <FError>{fieldErrs.purpose}</FError>}
        </FGroup>
        <FGroup>
          <FLabel $req>Срок исполнения</FLabel>
          <DeadlineInput value={deadline} onChange={v => { setDeadline(v); clearErr('deadline', v) }} $err={!!fieldErrs.deadline} />
          {fieldErrs.deadline && <FError>{fieldErrs.deadline}</FError>}
        </FGroup>
        <FGroup>
          <FLabel $req>Приоритет</FLabel>
          <PriorityPicker value={priority} onChange={setPriority} />
        </FGroup>
        <FGroup>
          <FLabel>Комментарий</FLabel>
          <Textarea placeholder="Необязательно" value={comment} onChange={e => setComment(e.target.value)} />
        </FGroup>
        <ActRow>
          <PrimaryButton size="m" text="Проверить заявку" onClick={handleReview} />
          <TertiaryButton size="m" text="Назад" onClick={onReset} />
        </ActRow>
      </Card>
    </FlRoot>
  )
}

// ─── Standard folder flow ─────────────────────────────────────────────────────

const StdFolderLayout = styled.div`
  display: grid;
  grid-template-columns: 240px minmax(0, 520px);
  gap: 1.5rem;
  align-items: start;
  max-width: 840px;
`
const StdFolderFilesPanel = styled.div`
  background: ${c.cardBg}; border: 1px solid ${c.border}; border-radius: 12px; padding: 1rem;
`
const StdFolderFileCard = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.625rem; border: 1px solid ${c.border}; border-radius: 8px;
  margin-bottom: 0.375rem;
`
const StdSourceNote = styled.div`
  font-size: 0.6875rem; color: ${c.ok}; margin-top: 0.25rem;
  display: flex; align-items: center; gap: 0.25rem;
`
const StdLockedField = styled.div<{ $clickable?: boolean }>`
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; border: 1px solid ${c.border}; border-radius: 8px;
  background: #f9fafb; font-size: 0.875rem; color: ${c.text};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  &:hover { ${({ $clickable }) => $clickable ? `border-color: #a5b4fc; background: #f5f7ff;` : ''} }
`
const StdLockVal = styled.span`flex: 1; font-weight: 500;`
const StdEditBtn = styled.button`
  background: none; border: none; cursor: pointer; color: ${c.textTer}; padding: 0;
  font-size: 0.8125rem; transition: color 0.1s;
  &:hover { color: ${c.accent}; }
`

const FIELD_SOURCE: Record<string, string> = {
  supplier: 'Реквизиты поставщика.xlsx',
  inn:      'Реквизиты поставщика.xlsx',
  amount:   'Коммерческое предложение.pdf',
  purpose:  'Обоснование закупки.docx',
}

interface StandardFolderFlowProps {
  initialFiles: MockFile[]
  initialValues?: ManualFormValues
  onValuesChange?: (v: ManualFormValues) => void
}

function StandardFolderFlow({ initialFiles, initialValues, onValuesChange }: StandardFolderFlowProps) {
  const navigate = useNavigate()
  const { mode } = useUserMode()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<MockFile[]>(initialFiles)
  const hasFiles = attachedFiles.length > 0

  const [unlocked, setUnlocked]   = useState<Set<string>>(new Set())

  const emptyVals = {
    supplier: initialValues?.supplier ?? '',
    inn:      initialValues?.inn      ?? '',
    amount:   initialValues?.amount   ?? '',
    purpose:  initialValues?.purpose  ?? '',
  }
  const filledVals = { supplier: FOLDER_REQ.supplier, inn: FOLDER_REQ.inn, amount: FOLDER_REQ.amount, purpose: FOLDER_REQ.purpose }
  const [editVals, setEditVals]   = useState(initialFiles.length > 0 ? filledVals : emptyVals)
  const [deadline, setDeadline]   = useState(initialValues?.deadline ?? '')
  const [priority, setPriority]   = useState<Priority>(initialValues?.priority ?? 'Обычный')
  const [comment, setComment]     = useState(initialValues?.comment ?? '')
  const [preview, setPreview]     = useState(false)
  const [done, setDone]           = useState(false)
  const [deadlineErr, setDeadlineErr] = useState('')
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!onValuesChange) return
    onValuesChange({ supplier: editVals.supplier, inn: editVals.inn, amount: editVals.amount, purpose: editVals.purpose, deadline, priority, comment })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editVals.supplier, editVals.inn, editVals.amount, editVals.purpose, deadline, priority, comment])

  function handleNext() {
    const errs: Record<string, string> = {}
    if (!hasFiles) {
      autoFields.forEach(({ key, label }) => {
        if (!editVals[key].trim()) errs[key] = `Заполните поле «${label}»`
      })
    }
    const noDeadline = !deadline.trim()
    if (Object.keys(errs).length > 0 || noDeadline) {
      setFieldErrs(errs)
      setDeadlineErr(noDeadline ? 'Укажите срок исполнения' : '')
      return
    }
    setFieldErrs({})
    setDeadlineErr('')
    setPreview(true)
  }

  function toggle(field: string) {
    setUnlocked(prev => { const n = new Set(prev); n.has(field) ? n.delete(field) : n.add(field); return n })
  }

  const autoFields: { key: keyof typeof editVals; label: string }[] = [
    { key: 'supplier', label: 'Поставщик' },
    { key: 'inn',      label: 'ИНН' },
    { key: 'amount',   label: 'Сумма' },
    { key: 'purpose',  label: 'Назначение' },
  ]

  if (done) {
    return (
      <SuccessScreenWrap>
        <IconDoneCircleOutline size="m" color="#059669" />
        <SuccessScreenTitle>Заявка отправлена</SuccessScreenTitle>
        <SuccessScreenText>
          Ваша заявка передана в отдел закупок.<br /> Мы уведомим вас о результате.
        </SuccessScreenText>
        <ActRow style={{ marginTop: '1rem' }}>
          <PrimaryButton size="m" text="Создать ещё" onClick={() => { setDone(false); setPreview(false); setAttachedFiles([]); setEditVals(emptyVals); setDeadline(''); setComment('') }} />
          <SecondaryButton size="m" text="На главную" onClick={() => navigate('/main')} />
        </ActRow>
      </SuccessScreenWrap>
    )
  }

  if (preview) {
    return (
      <div style={{ maxWidth: 560 }}>
        <PageTitle $compact style={{ marginBottom: '1rem' }}>Проверьте заявку</PageTitle>
        <FlDataCard style={{ marginBottom: '1.25rem' }}>
          {autoFields.map(({ key, label }) => (
            <FlDataRow key={key}><FlDataKey>{label}</FlDataKey><FlDataVal>{editVals[key]}</FlDataVal></FlDataRow>
          ))}
          <FlDataRow><FlDataKey>Срок</FlDataKey><FlDataVal>{deadline}</FlDataVal></FlDataRow>
          <FlDataRow><FlDataKey>Приоритет</FlDataKey><FlDataVal>{priority}</FlDataVal></FlDataRow>
          {comment && <FlDataRow><FlDataKey>Комментарий</FlDataKey><FlDataVal>{comment}</FlDataVal></FlDataRow>}
          <FlDataRow>
            <FlDataKey>Файлы</FlDataKey>
            <FlDataVal>
              <div>{pluralAttachedFiles(attachedFiles.length)}:</div>
              {attachedFiles.map(f => (
                <div key={f.id} style={{ fontWeight: 400, color: '#6b7280', marginTop: '0.15rem' }}>{f.name}</div>
              ))}
            </FlDataVal>
          </FlDataRow>
        </FlDataCard>
        <ActRow>
          <PrimaryButton size="m" text="Отправить заявку" onClick={() => { track('task-completed', { mode, method: 'folder' }); setDone(true) }} />
          <TertiaryButton size="m" text="Назад" onClick={() => setPreview(false)} />
        </ActRow>
      </div>
    )
  }

  return (
    <>
      <FilePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={files => { setAttachedFiles(files); setEditVals(filledVals); setPickerOpen(false) }}
        mode="standard"
      />
      <StdFolderLayout>
        {/* Left: files */}
        <div>
          <StdFolderFilesPanel>
            <SecLabel>Файлы</SecLabel>
            {!hasFiles ? (
              <FileDropZone onClick={() => setPickerOpen(true)}>
                <IconFolderOutline size="m" color="#9ca3af" />
                <FileDropZoneText>Добавьте файлы для автозаполнения</FileDropZoneText>
                <SecondaryButton size="s" text="Выбрать файлы" onClick={(e: MouseEvent) => { e.stopPropagation(); setPickerOpen(true) }} />
              </FileDropZone>
            ) : (
              <>
                {attachedFiles.map(f => {
                  const col = EXT_COLOR[f.type] ?? { bg: '#f3f4f6', fg: '#374151' }
                  return (
                    <StdFolderFileCard key={f.id}>
                      <FlFileExt $bg={col.bg} $fg={col.fg}>{f.type.toUpperCase()}</FlFileExt>
                      <span style={{ fontSize: '0.8125rem', color: c.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{f.name}</span>
                    </StdFolderFileCard>
                  )
                })}
                <SecondaryButton size="xs" text="Добавить ещё" style={{ marginTop: '0.625rem', width: '100%' }} onClick={() => setPickerOpen(true)} />
                <div style={{ fontSize: '0.75rem', color: c.textTer, marginTop: '0.5rem' }}>
                  Данные извлечены автоматически
                </div>
              </>
            )}
          </StdFolderFilesPanel>
        </div>

        {/* Right: form */}
        <div>
          {hasFiles && mode !== 'expert' && (
            <FlInfoBanner>
              Поля заполнены автоматически из файлов. Проверьте и при необходимости отредактируйте.
            </FlInfoBanner>
          )}
          <Card>
            {autoFields.map(({ key, label }) => (
              <FGroup key={key}>
                <FLabel $req={!hasFiles} style={{ marginBottom: '0.375rem' }}>{label}</FLabel>
                {hasFiles && unlocked.has(key) ? (
                  <>
                    <FlInput
                      value={editVals[key]}
                      onChange={e => setEditVals(v => ({ ...v, [key]: e.target.value }))}
                    />
                    {mode !== 'expert' && <StdSourceNote>✓ Найдено в файле: {FIELD_SOURCE[key]}</StdSourceNote>}
                  </>
                ) : hasFiles ? (
                  <>
                    <StdLockedField $clickable={mode === 'expert'} onClick={mode === 'expert' ? () => toggle(key) : undefined}>
                      <StdLockVal>{editVals[key]}</StdLockVal>
                      {mode !== 'expert' && (
                        <StdEditBtn title="Редактировать" onClick={() => toggle(key)}>
                          <IconEditOutline size="xs" color="#9ca3af" />
                        </StdEditBtn>
                      )}
                    </StdLockedField>
                    {mode !== 'expert' && <StdSourceNote>✓ Найдено в файле: {FIELD_SOURCE[key]}</StdSourceNote>}
                  </>
                ) : (
                  <>
                    <FlInput
                      value={editVals[key]}
                      $err={!!fieldErrs[key]}
                      onChange={e => {
                        const val = e.target.value
                        setEditVals(v => ({ ...v, [key]: val }))
                        if (val.trim()) setFieldErrs(prev => { const n = { ...prev }; delete n[key]; return n })
                      }}
                      placeholder={label}
                    />
                    {fieldErrs[key] && <FError>{fieldErrs[key]}</FError>}
                  </>
                )}
              </FGroup>
            ))}

            <FGroup>
              <FLabel $req>Срок исполнения</FLabel>
              <DeadlineInput
                value={deadline}
                onChange={v => { setDeadline(v); if (v.trim()) setDeadlineErr('') }}
                $err={!!deadlineErr}
              />
              {deadlineErr && <FError>{deadlineErr}</FError>}
            </FGroup>
            <FGroup>
              <FLabel $req>Приоритет</FLabel>
              <PriorityPicker value={priority} onChange={setPriority} />
            </FGroup>
            <FGroup>
              <FLabel>Комментарий</FLabel>
              <Textarea placeholder="необязательно" value={comment} onChange={e => setComment(e.target.value)} />
            </FGroup>

            <ActRow>
              <PrimaryButton size="m" text="Далее" onClick={handleNext} />
            </ActRow>
          </Card>
        </div>
      </StdFolderLayout>
    </>
  )
}

// ─── Expert folder flow ───────────────────────────────────────────────────────

const ExpFlRoot = styled.div`max-width: 600px;`
const ExpFlTitle = styled.h1`
  font-size: 1.25rem; font-weight: 700; color: ${c.text};
  letter-spacing: -0.02em; margin-bottom: 1rem;
`
const ExpFlBtnRow = styled.div`display: flex; gap: 0.5rem; margin-top: 1rem; align-items: center;`
const ExpFlInlineInput = styled.div`flex: 1; min-width: 0;`

function ExpertFolderFlow() {
  const navigate = useNavigate()
  const [editOpen, setEditOpen]   = useState(false)
  const [editVals, setEditVals]   = useState({
    supplier: FOLDER_REQ.supplier, inn: FOLDER_REQ.inn,
    amount: FOLDER_REQ.amount,     purpose: FOLDER_REQ.purpose,
  })
  const [deadline, setDeadline]   = useState('')
  const [priority, setPriority]   = useState<Priority>('Обычный')
  const [comment, setComment]     = useState('')

  const hasRequired = deadline.trim().length > 0

  const editRows: { key: keyof typeof editVals; label: string }[] = [
    { key: 'supplier', label: 'Поставщик' },
    { key: 'inn',      label: 'ИНН' },
    { key: 'amount',   label: 'Сумма' },
    { key: 'purpose',  label: 'Назначение' },
  ]

  function submit() {
    track('task-completed', { mode: 'expert', method: 'folder' })
    navigate('/main', { state: { pendingToast: 'Заявка #1043 отправлена' } })
  }

  return (
    <ExpFlRoot>
      <ExpFlTitle>Заявка из папки «{FOLDER_REQ.folderName}»</ExpFlTitle>

      {/* Data table: read-only or inline-editable */}
      <FlDataCard style={{ marginBottom: '1rem' }}>
        {editRows.map(({ key, label }) => (
          <FlDataRow key={key}>
            <FlDataKey>{label}</FlDataKey>
            {editOpen
              ? <ExpFlInlineInput><FlInput value={editVals[key]} onChange={e => setEditVals(v => ({ ...v, [key]: e.target.value }))} /></ExpFlInlineInput>
              : <FlDataVal>{editVals[key]}</FlDataVal>
            }
          </FlDataRow>
        ))}
        <FlDataRow>
          <FlDataKey>Файлы</FlDataKey>
          <FlDataVal>
            <div>{pluralAttachedFiles(FOLDER_REQ.filesCount)}:</div>
            {FOLDER_REQ.files.map(f => (
              <div key={f.name} style={{ fontWeight: 400, color: '#6b7280', marginTop: '0.15rem' }}>{f.name}</div>
            ))}
          </FlDataVal>
        </FlDataRow>
      </FlDataCard>

      {/* Срок — always visible, required */}
      <FGroup>
        <FLabel $req>Срок исполнения</FLabel>
        <DeadlineInput value={deadline} onChange={setDeadline} />
      </FGroup>

      {/* Приоритет — always visible */}
      <FGroup>
        <FLabel>Приоритет</FLabel>
        <PriorityPicker value={priority} onChange={setPriority} />
      </FGroup>

      {/* Comment — only when editing */}
      {editOpen && (
        <FGroup style={{ marginTop: '0.75rem' }}>
          <FLabel>Комментарий</FLabel>
          <Textarea $compact placeholder="необязательно" value={comment} onChange={e => setComment(e.target.value)} />
        </FGroup>
      )}

      <ExpFlBtnRow>
        <PrimaryButton size="s" text="Отправить" disabled={!hasRequired} onClick={submit} />
        <SecondaryButton
          size="s"
          text={editOpen ? 'Готово' : 'Редактировать'}
          onClick={() => setEditOpen(v => !v)}
        />
        <Button view="clear" size="s" text="Отмена" onClick={() => navigate('/documents')} />
      </ExpFlBtnRow>
      {!hasRequired && (
        <div style={{ fontSize: '0.75rem', color: '#2F3A4C', marginTop: '0.375rem' }}>
          Укажите срок исполнения, чтобы отправить заявку
        </div>
      )}
    </ExpFlRoot>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type RootEntry = null | 'files' | 'manual'

export function TaskScreen() {
  const { mode } = useUserMode()
  const navigate = useNavigate()
  const location = useLocation()
  const { openObject } = useOpenObjects()
  const [searchParams] = useSearchParams()
  const isFolder = searchParams.get('source') === 'folder'
  const folderParam = searchParams.get('folder')

  // Entry chooser state (only used when isFolder is false)
  const [rootEntry, setRootEntry] = useState<RootEntry>(null)

  // Shared form values — preserved across mode switches
  const [formValues, setFormValues] = useState<ManualFormValues>({
    supplier: '', inn: '', amount: '', purpose: '',
    deadline: '', priority: 'Обычный', comment: '',
  })
  const handleFormChange = useCallback((v: ManualFormValues) => setFormValues(v), [])

  // Reset entry chooser on every navigation to this screen (including re-click of active nav item)
  useEffect(() => {
    setRootEntry(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  useEffect(() => {
    openObject({
      id: 'task-form',
      type: 'form',
      label: 'Новая заявка',
      fullLabel: 'Форма создания заявки на доступ',
      route: '/task',
    })
  }, [openObject])

  // source=folder: use files from that folder param directly
  if (isFolder) {
    const folderFiles = folderParam ? mockFiles.filter(f => f.folderId === folderParam) : []
    return (
      <>
        {mode === 'basic'    && <BasicFolderFlow initialFiles={folderFiles} onReset={() => navigate('/task')} />}
        {mode === 'standard' && <StandardFolderFlow initialFiles={folderFiles} />}
        {mode === 'expert'   && <ExpertFolderFlow />}
      </>
    )
  }

  // Standard/Expert: always show the combined form, regardless of what basic sub-flow was active
  if (mode === 'standard' || mode === 'expert') {
    return <StandardFolderFlow initialFiles={[]} initialValues={formValues} onValuesChange={handleFormChange} />
  }

  // Entry chooser (no source=folder param)
  if (rootEntry === null) {
    // Basic entry chooser
    return (
      <>
        <PageTitle style={{ marginBottom: '0.375rem' }}>Создание заявки</PageTitle>
        <PageSubtitle>Выберите, как вы хотите начать</PageSubtitle>
        <MethodGrid>
          <MethodCard onClick={() => { track('task-method-selected', { mode: 'basic', method: 'files' }); setRootEntry('files') }}>
            <MethodIcon><IconFolderOutline size="s" color="#4f46e5" /></MethodIcon>
            <MethodTitle>Из файлов</MethodTitle>
            <MethodDesc>Выберите документы — данные заполнятся автоматически</MethodDesc>
          </MethodCard>
          <MethodCard onClick={() => { track('task-method-selected', { mode: 'basic', method: 'manual' }); setRootEntry('manual') }}>
            <MethodIcon><IconEditOutline size="s" color="#4f46e5" /></MethodIcon>
            <MethodTitle>Заполнить вручную</MethodTitle>
            <MethodDesc>Введите все данные самостоятельно шаг за шагом</MethodDesc>
          </MethodCard>
        </MethodGrid>
      </>
    )
  }

  // files flow with picker-selected files (picker lives inside BasicFolderFlow step 1)
  if (rootEntry === 'files') {
    return <BasicFolderFlow initialFiles={[]} onReset={() => setRootEntry(null)} />
  }

  // Manual (basic only — standard/expert go directly to the file-based flow above)
  return <BasicManualFlow onReset={() => setRootEntry(null)} initialValues={formValues} onValuesChange={handleFormChange} />
}
