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

const BtnRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  const navigate = useNavigate()

  function handleSkip() {
    localStorage.setItem('corpOsOnboarded', '1')
    navigate('/main')
  }

  return (
    <>
      <PageTitle>Как начать работу в CorpOS</PageTitle>
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
        <BtnRow>
          <Button view="primary" size="m" text="Попробовать поиск" onClick={onDone} />
          <Button view="secondary" size="m" text="Пропустить" onClick={handleSkip} />
        </BtnRow>
        <ChangeModeLink onClick={onChangeMode}>Изменить режим</ChangeModeLink>
      </ActionRow>
    </>
  )
}

// ─── Standard tour ────────────────────────────────────────────────────────────

const StandardStepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`

const StandardStep = styled.div<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#eef2ff' : '#ffffff')};
  border: 1px solid ${({ $active }) => ($active ? '#a5b4fc' : '#e5e7eb')};
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: ${({ $active }) => $active ? '0 0 0 3px rgba(99,102,241,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'};
  cursor: default;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
`

const StandardStepNumber = styled.div<{ $active: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#c7d2fe' : '#e0e7ff')};
  line-height: 1;
  flex-shrink: 0;
  width: 1.75rem;
  transition: color 0.15s;
`

const StandardStepBody = styled.div`
  flex: 1;
`

const StandardStepTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`

const StandardStepDesc = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.55;
`

const StepAction = styled.div`
  margin-top: 0.75rem;
`

interface StandardStepDef {
  n: string
  title: string
  desc: string
  zone: HighlightZone
  action: { label: string; view: 'primary' | 'secondary'; nav: string } | null
}

const STANDARD_STEPS: StandardStepDef[] = [
  {
    n: '1',
    title: 'Разделы',
    desc: 'Используйте боковое меню, чтобы перейти к задачам, документам или сервисам.',
    zone: 'sidebar',
    action: null,
  },
  {
    n: '2',
    title: 'Файлы и документы',
    desc: 'Откройте последние документы или перейдите к файловой структуре.',
    zone: 'documents',
    action: { label: 'Открыть файлы', view: 'secondary', nav: '/documents' },
  },
  {
    n: '3',
    title: 'Поиск',
    desc: 'Найдите документ, раздел или действие по названию или смыслу.',
    zone: 'search',
    action: null,
  },
]

function StandardTour({ onChangeMode }: TourProps) {
  const { zone, setZone } = useTourHighlight()
  const navigate = useNavigate()

  function handleSkip() {
    localStorage.setItem('corpOsOnboarded', '1')
    navigate('/main')
  }

  return (
    <>
      <PageTitle>Как начать работу в CorpOS</PageTitle>
      <PageSubtitle>Несколько быстрых ориентиров для самостоятельной работы в системе.</PageSubtitle>
      <StandardStepList>
        {STANDARD_STEPS.map((s) => (
          <StandardStep
            key={s.n}
            $active={zone === s.zone}
            onMouseEnter={() => setZone(s.zone)}
            onMouseLeave={() => setZone(null)}
          >
            <StandardStepNumber $active={zone === s.zone}>{s.n}</StandardStepNumber>
            <StandardStepBody>
              <StandardStepTitle>{s.title}</StandardStepTitle>
              <StandardStepDesc>{s.desc}</StandardStepDesc>
              {s.action && (
                <StepAction>
                  <Button
                    view={s.action.view}
                    size="s"
                    text={s.action.label}
                    onClick={() => navigate(s.action!.nav)}
                  />
                </StepAction>
              )}
            </StandardStepBody>
          </StandardStep>
        ))}
      </StandardStepList>
      <ActionRow>
        <BtnRow>
          <Button view="primary" size="m" text="Попробовать поиск" onClick={() => navigate('/onboarding/search')} />
          <Button view="secondary" size="m" text="Пропустить" onClick={handleSkip} />
        </BtnRow>
        <ChangeModeLink onClick={onChangeMode}>Изменить режим</ChangeModeLink>
      </ActionRow>
    </>
  )
}

// ─── Expert tour ──────────────────────────────────────────────────────────────

const ExpertSubtitle = styled.p`
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.55;
  margin-bottom: 1.75rem;
`

const ExpertCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
`

const CapabilitiesLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1.25rem;
`

const ExpertFeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const ExpertFeature = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`

const ExpertFeatureTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
`

const ExpertFeatureDesc = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.55;
`

const ExpertActionRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 1.75rem;
`

const EXPERT_FEATURES = [
  {
    title: 'Глобальный поиск',
    desc: 'Находите документы, разделы и запускайте частые действия из строки поиска.',
  },
  {
    title: 'Быстрые действия',
    desc: 'Выполняйте типовые операции без лишних промежуточных шагов.',
  },
]

function ExpertTour({ onDone, onChangeMode }: TourProps) {
  return (
    <>
      <PageTitle>Вы работаете в экспертном режиме</PageTitle>
      <ExpertSubtitle>
        Интерфейс показывает меньше подсказок и оставляет больше контроля над задачами.
      </ExpertSubtitle>
      <ExpertCard>
        <CapabilitiesLabel>Доступно в этом режиме</CapabilitiesLabel>
        <ExpertFeatureList>
          {EXPERT_FEATURES.map((f, i) => (
            <ExpertFeature key={i}>
              <ExpertFeatureTitle>{f.title}</ExpertFeatureTitle>
              <ExpertFeatureDesc>{f.desc}</ExpertFeatureDesc>
            </ExpertFeature>
          ))}
        </ExpertFeatureList>
      </ExpertCard>
      <ExpertActionRow>
        <Button view="primary" size="m" text="Начать работу" onClick={onDone} />
        <ChangeModeLink onClick={onChangeMode}>Изменить режим</ChangeModeLink>
      </ExpertActionRow>
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function OnboardingTour() {
  const { mode } = useUserMode()
  const navigate = useNavigate()

  const handleDoneBasic = () => navigate('/onboarding/search')
  const handleDone = () => { localStorage.setItem('corpOsOnboarded', '1'); navigate('/main') }
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
