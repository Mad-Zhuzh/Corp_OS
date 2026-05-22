import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { useNavigate } from 'react-router-dom'
import { useUserMode } from '../../context/UserModeContext'
import { useTourHighlight, type HighlightZone } from '../../context/TourHighlightContext'

// ─── Shared styles ────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  max-width: 720px;
`

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
`

const PageSubtitle = styled.p`
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.55;
  margin-bottom: 2rem;
`

const ActionRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 2rem;
`

const ChangeModeLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.1s;
  &:hover { color: #6b7280; }
`

// ─── Basic tour ───────────────────────────────────────────────────────────────

const BasicStepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 0.5rem;
`

const BasicStep = styled.div<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#eef2ff' : '#ffffff')};
  border: 1px solid ${({ $active }) => ($active ? '#a5b4fc' : '#e5e7eb')};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  box-shadow: ${({ $active }) => $active ? '0 0 0 3px rgba(99,102,241,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'};
  cursor: default;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
`

const StepNumber = styled.div<{ $active: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#c7d2fe' : '#e0e7ff')};
  line-height: 1;
  flex-shrink: 0;
  width: 2rem;
  transition: color 0.15s;
`

const StepBody = styled.div`
  flex: 1;
`

const StepTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.3rem;
`

const StepDesc = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.55;
`

interface BasicStepDef {
  n: string
  title: string
  desc: string
  zone: HighlightZone
}

const BASIC_STEPS: BasicStepDef[] = [
  {
    n: '1',
    title: 'Поиск',
    desc: 'Напишите, что нужно найти или сделать — обычными словами.',
    zone: 'search',
  },
  {
    n: '2',
    title: 'Разделы',
    desc: 'Используйте боковое меню, чтобы перейти к задачам, документам, заявкам или сервисам.',
    zone: 'sidebar',
  },
  {
    n: '3',
    title: 'Рабочая среда',
    desc: 'Здесь открываются задачи, документы, формы и результаты поиска.',
    zone: 'content',
  },
  {
    n: '4',
    title: 'Помощь',
    desc: 'Система подскажет следующий шаг, объяснит ошибки и поможет вернуться к задаче.',
    zone: 'help',
  },
]

interface TourProps {
  onDone: () => void
  onChangeMode: () => void
}

function BasicTour({ onDone, onChangeMode }: TourProps) {
  const { zone, setZone } = useTourHighlight()

  return (
    <>
      <PageTitle>Как ориентироваться в CorpOS</PageTitle>
      <PageSubtitle>
        Эти элементы помогут быстрее начать работу в системе.
      </PageSubtitle>
      <BasicStepList>
        {BASIC_STEPS.map((s) => (
          <BasicStep
            key={s.n}
            $active={zone === s.zone}
            onMouseEnter={() => setZone(s.zone)}
            onMouseLeave={() => setZone(null)}
          >
            <StepNumber $active={zone === s.zone}>{s.n}</StepNumber>
            <StepBody>
              <StepTitle>{s.title}</StepTitle>
              <StepDesc>{s.desc}</StepDesc>
            </StepBody>
          </BasicStep>
        ))}
      </BasicStepList>
      <ActionRow>
        <Button view="primary" size="m" text="Попробовать поиск" onClick={onDone} />
        <ChangeModeLink onClick={onChangeMode}>Изменить режим</ChangeModeLink>
      </ActionRow>
    </>
  )
}

// ─── Standard tour ────────────────────────────────────────────────────────────

const StandardStepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`

const StandardStep = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const StandardStepIndex = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f0f0f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6366f1;
  flex-shrink: 0;
`

const StandardStepTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
`

const STANDARD_STEPS = [
  { n: '1', title: 'Поиск и разделы' },
  { n: '2', title: 'Уведомления' },
  { n: '3', title: 'Заявки и сервисы' },
]

function StandardTour({ onDone, onChangeMode }: TourProps) {
  return (
    <>
      <PageTitle>Как ориентироваться в CorpOS</PageTitle>
      <PageSubtitle>Три области, которые вы будете использовать чаще всего.</PageSubtitle>
      <StandardStepList>
        {STANDARD_STEPS.map((s) => (
          <StandardStep key={s.n}>
            <StandardStepIndex>{s.n}</StandardStepIndex>
            <StandardStepTitle>{s.title}</StandardStepTitle>
          </StandardStep>
        ))}
      </StandardStepList>
      <ActionRow>
        <Button view="primary" size="m" text="Перейти к работе" onClick={onDone} />
        <ChangeModeLink onClick={onChangeMode}>Изменить режим</ChangeModeLink>
      </ActionRow>
    </>
  )
}

// ─── Expert tour ──────────────────────────────────────────────────────────────

const ExpertCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`

const ExpertDesc = styled.p`
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.55;
  margin-bottom: 1.25rem;
`

const CapabilitiesLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.625rem;
`

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const Chip = styled.div`
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #4338ca;
`

const EXPERT_CHIPS = ['Командный поиск', 'Быстрые действия', 'Компактная панель']

function ExpertTour({ onDone, onChangeMode }: TourProps) {
  return (
    <>
      <PageTitle>Вы работаете в экспертном режиме</PageTitle>
      <ExpertCard>
        <ExpertDesc>
          Поиск становится инструментом быстрого доступа к действиям и данным.
        </ExpertDesc>
        <CapabilitiesLabel>Доступно в этом режиме</CapabilitiesLabel>
        <ChipsRow>
          {EXPERT_CHIPS.map((chip) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </ChipsRow>
      </ExpertCard>
      <ActionRow>
        <Button view="primary" size="m" text="Перейти к работе" onClick={onDone} />
        <ChangeModeLink onClick={onChangeMode}>Изменить режим</ChangeModeLink>
      </ActionRow>
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function OnboardingTour() {
  const { mode } = useUserMode()
  const navigate = useNavigate()

  const handleDoneBasic = () => navigate('/onboarding/search')
  const handleDone = () => navigate('/main')
  const handleChangeMode = () => navigate('/onboarding/mode')

  return (
    <Wrapper>
      {mode === 'basic' && (
        <BasicTour onDone={handleDoneBasic} onChangeMode={handleChangeMode} />
      )}
      {mode === 'standard' && (
        <StandardTour onDone={handleDone} onChangeMode={handleChangeMode} />
      )}
      {mode === 'expert' && (
        <ExpertTour onDone={handleDone} onChangeMode={handleChangeMode} />
      )}
    </Wrapper>
  )
}
