import { useState } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'

const PrimaryButton = styled(Button)`
  && {
    background-color: #201e2b !important;
    color: #FFFFFF !important;
    &:hover { background-color: #332f47 !important; }
  }
`

const TertiaryButton = styled(Button)`
  && {
    background-color: #F3F4F6 !important;
    color: #4B5563 !important;
    * { color: #4B5563 !important; }
    box-shadow: none !important;
    &:hover {
      background-color: #E5E7EB !important;
      color: #374151 !important;
      * { color: #374151 !important; }
    }
  }
`
import { useNavigate } from 'react-router-dom'
import { useUserMode, type UserMode } from '../../context/UserModeContext'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface ModeOption {
  id: UserMode
  title: string
  description: string
  features: string[]
  recommendDesc: string
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'basic',
    title: 'Базовый',
    description: 'Для новых сотрудников или пользователей, которым важны подсказки и пошаговые действия.',
    features: ['Крупные элементы', 'Подробные подсказки', 'Безопасное восстановление после ошибок'],
    recommendDesc: 'Подходит, если вы предпочитаете видимые подсказки, крупные элементы и пошаговые действия, чтобы уверенно освоиться в системе.',
  },
  {
    id: 'standard',
    title: 'Стандартный',
    description: 'Для пользователей, которые уверенно выполняют типовые задачи.',
    features: ['Полная структура', 'Контекстная помощь', 'Умеренная плотность интерфейса'],
    recommendDesc: 'Подходит, если вы уверенно выполняете типовые задачи и хотите получать подсказки только в нужных местах.',
  },
  {
    id: 'expert',
    title: 'Экспертный',
    description: 'Для опытных пользователей, которым важны скорость и прямой доступ к действиям.',
    features: ['Компактная панель', 'Быстрые действия', 'Минимум лишних подтверждений'],
    recommendDesc: 'Подходит, если вам важны скорость, компактный интерфейс и прямой доступ к действиям через поиск и команды.',
  },
]

interface Question {
  text: string
  options: string[]
}

const QUESTIONS: Question[] = [
  {
    text: 'Как вам удобнее начинать работу в новой системе?',
    options: [
      'Иду по видимым разделам и кнопкам',
      'Использую и разделы, и поиск',
      'Предпочитаю быстрый доступ через поиск или команды',
    ],
  },
  {
    text: 'Какая поддержка вам удобнее?',
    options: [
      'Подробные подсказки и пошаговые действия',
      'Подсказки только в сложных местах',
      'Минимум подсказок и лишних шагов',
    ],
  },
  {
    text: 'Какой вид интерфейса вам комфортнее?',
    options: [
      'Крупные элементы и меньше информации на экране',
      'Полная структура без лишней детализации',
      'Компактный вид и больше действий на экране',
    ],
  },
]

// Варианты дают 1, 2 или 3 балла. Итого: 3–4 → Базовый, 5–7 → Стандартный, 8–9 → Экспертный.
function calcRecommendation(answers: [number, number, number]): UserMode {
  const score = answers.reduce((sum, a) => sum + (a + 1), 0)
  if (score <= 4) return 'basic'
  if (score <= 7) return 'standard'
  return 'expert'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  max-width: 860px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  margin-bottom: 0.375rem;
`

const PageSubtitle = styled.p`
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.55;
`

// ─── Quiz banner ──────────────────────────────────────────────────────────────

const QuizBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.875rem 1.25rem;
`

const QuizBannerText = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
`

const QuizLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4f46e5;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.1s;
  &:hover { color: #4338ca; }
`

// ─── Quiz questions ───────────────────────────────────────────────────────────

const QuizBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const QuizProgress = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const QuestionText = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
`

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const OptionBtn = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${({ $selected }) => ($selected ? '#eef2ff' : '#ffffff')};
  border: 1.5px solid ${({ $selected }) => ($selected ? '#6374f1' : '#e5e7eb')};
  border-radius: 10px;
  font-size: 0.875rem;
  color: ${({ $selected }) => ($selected ? '#3730a3' : '#374151')};
  font-weight: ${({ $selected }) => ($selected ? '500' : '400')};
  text-align: left;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
  &:hover {
    border-color: ${({ $selected }) => ($selected ? '#6374f1' : '#a5b4fc')};
    background: ${({ $selected }) => ($selected ? '#eef2ff' : '#f8f9ff')};
  }
`

const Radio = styled.span<{ $selected: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? '#6374f1' : '#d1d5db')};
  background: ${({ $selected }) => ($selected ? '#6374f1' : 'transparent')};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.12s, background 0.12s;

  &::after {
    content: '';
    display: ${({ $selected }) => ($selected ? 'block' : 'none')};
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffffff;
  }
`

const QuizNav = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`


// ─── Result ───────────────────────────────────────────────────────────────────

const ResultBlock = styled.div`
  background: #f6fef9;
  border: 1px solid #a7f3c0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
`

const ResultLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #16a34a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
`

const ResultMode = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`

const ResultDesc = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
`

const ResetLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8125rem;
  color: #9ca3af;
  cursor: pointer;
  margin-top: 0.5rem;
  display: block;
  transition: color 0.1s;
  &:hover { color: #6b7280; }
`

// ─── Cards ────────────────────────────────────────────────────────────────────

const CardsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`

const ModeCard = styled.div<{ $active: boolean }>`
  position: relative;
  background: ${({ $active }) => ($active ? '#eef2ff' : '#ffffff')};
  border: 2px solid ${({ $active }) => ($active ? '#6374f1' : '#e5e7eb')};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  box-shadow: ${({ $active }) =>
    $active ? '0 0 0 4px rgba(99, 102, 241, 0.12)' : '0 1px 3px rgba(0,0,0,0.06)'};

  &:hover {
    border-color: ${({ $active }) => ($active ? '#6374f1' : '#a5b4fc')};
    box-shadow: ${({ $active }) =>
      $active
        ? '0 0 0 4px rgba(99, 102, 241, 0.12)'
        : '0 3px 10px rgba(0,0,0,0.09)'};
  }
`

const RecommendBadge = styled.div`
  position: absolute;
  top: -11px;
  right: 10px;
  padding: 0.25rem 0.625rem;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #15803d;
  white-space: nowrap;
  text-align: center;
  pointer-events: none;
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
`

const CardTitle = styled.div<{ $active: boolean }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#4338ca' : '#1a1a1a')};
`

const ActiveBadge = styled.div`
  margin-left: auto;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6374f1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const CheckMark = styled.div`
  width: 6px;
  height: 10px;
  border-right: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: rotate(45deg) translate(-1px, -1px);
`

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin-bottom: 0.875rem;
`

const CardDescription = styled.p`
  font-size: 0.8125rem;
  color: #4b5563;
  line-height: 1.55;
  margin-bottom: 1rem;
`

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const FeatureItem = styled.li<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: ${({ $active }) => ($active ? '#3730a3' : '#6b7280')};
`

const FeatureDot = styled.span<{ $active: boolean }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $active }) => ($active ? '#6374f1' : '#d1d5db')};
`

// ─── Actions ──────────────────────────────────────────────────────────────────

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.875rem;
`

const SkipLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.1s;
  &:hover { color: #6b7280; }
`

// ─── Component ────────────────────────────────────────────────────────────────

type Answers = [number | null, number | null, number | null]
type Step = 1 | 2 | 3 | 'done'

export function OnboardingModeSelect() {
  const { mode, setMode } = useUserMode()
  const navigate = useNavigate()

  const [quizOpen, setQuizOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [answers, setAnswers] = useState<Answers>([null, null, null])
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null)
  const [recommended, setRecommended] = useState<UserMode | null>(null)

  function handleOpenQuiz() {
    setQuizOpen(true)
    setStep(1)
    setAnswers([null, null, null])
    setPendingAnswer(null)
    setRecommended(null)
  }

  function handleResetQuiz() {
    setQuizOpen(false)
    setAnswers([null, null, null])
    setPendingAnswer(null)
    setRecommended(null)
  }

  function handleSelectOption(i: number) {
    setPendingAnswer(i)
  }

  function handleNext() {
    if (pendingAnswer === null) return
    if (step === 1) {
      setAnswers([pendingAnswer, null, null])
      setStep(2)
      setPendingAnswer(null)
    } else if (step === 2) {
      setAnswers([answers[0], pendingAnswer, null])
      setStep(3)
      setPendingAnswer(null)
    } else if (step === 3) {
      const full: [number, number, number] = [answers[0]!, answers[1]!, pendingAnswer]
      setAnswers(full)
      const rec = calcRecommendation(full)
      setRecommended(rec)
      setMode(rec)
      setStep('done')
      setPendingAnswer(null)
    }
  }

  function handleBack() {
    if (step === 2) {
      setStep(1)
      setPendingAnswer(answers[0])
      setAnswers([null, null, null])
    } else if (step === 3) {
      setStep(2)
      setPendingAnswer(answers[1])
      setAnswers([answers[0], null, null])
    }
  }

  function handleSkip() {
    localStorage.setItem('corpOsOnboarded', '1')
    setMode('standard')
    navigate('/main', {
      state: {
        pendingToast: 'Вы вошли в Стандартном режиме. Его можно изменить в верхней панели.',
      },
    })
  }

  const stepNum = step !== 'done' ? step : null
  const currentQuestion = stepNum !== null ? QUESTIONS[stepNum - 1] : null

  return (
    <Wrapper>
      <div>
        <PageTitle>Выберите удобный режим интерфейса</PageTitle>
        <PageSubtitle>
          Режим определяет количество подсказок, плотность интерфейса и доступ к быстрым действиям.
        </PageSubtitle>
      </div>

      {/* ─── Quiz ─────────────────────────────────────────────────────── */}
      {!quizOpen ? (
        <QuizBanner>
          <QuizBannerText>
            Не уверены, какой режим выбрать? Ответьте на 3 коротких вопроса — система порекомендует стартовый режим.
          </QuizBannerText>
          <QuizLink onClick={handleOpenQuiz}>Помочь с выбором</QuizLink>
        </QuizBanner>
      ) : (
        <QuizBlock>
          {step !== 'done' && currentQuestion && (
            <>
              <QuizProgress>Вопрос {stepNum} из 3</QuizProgress>
              <QuestionText>{currentQuestion.text}</QuestionText>
              <OptionsList>
                {currentQuestion.options.map((opt, i) => (
                  <OptionBtn
                    key={i}
                    $selected={pendingAnswer === i}
                    onClick={() => handleSelectOption(i)}
                  >
                    <Radio $selected={pendingAnswer === i} />
                    {opt}
                  </OptionBtn>
                ))}
              </OptionsList>
              <QuizNav>
                <PrimaryButton
                  size="s"
                  text="Далее"
                  disabled={pendingAnswer === null}
                  onClick={handleNext}
                />
                {step > 1 && (
                  <TertiaryButton size="s" text="Назад" onClick={handleBack} />
                )}
              </QuizNav>
            </>
          )}

          {step === 'done' && recommended && (
            <ResultBlock>
              <ResultLabel>Рекомендуемый режим</ResultLabel>
              <ResultMode>{MODE_OPTIONS.find(o => o.id === recommended)?.title}</ResultMode>
              <ResultDesc>{MODE_OPTIONS.find(o => o.id === recommended)?.recommendDesc}</ResultDesc>
              <ResetLink onClick={handleResetQuiz}>Пройти заново</ResetLink>
            </ResultBlock>
          )}
        </QuizBlock>
      )}

      {/* ─── Cards: показываем только если опрос не открыт или уже завершён ── */}
      {(!quizOpen || step === 'done') && <CardsRow>
        {MODE_OPTIONS.map((opt) => {
          const isActive = mode === opt.id
          const isRecommended = recommended === opt.id
          return (
            <ModeCard
              key={opt.id}
              $active={isActive}
              onClick={() => setMode(opt.id)}
            >
              {isRecommended && <RecommendBadge>Рекомендовано</RecommendBadge>}

              <CardHeader>
                <CardTitle $active={isActive}>{opt.title}</CardTitle>
                {isActive && (
                  <ActiveBadge>
                    <CheckMark />
                  </ActiveBadge>
                )}
              </CardHeader>

              <Divider />

              <CardDescription>{opt.description}</CardDescription>

              <FeatureList>
                {opt.features.map((f) => (
                  <FeatureItem key={f} $active={isActive}>
                    <FeatureDot $active={isActive} />
                    {f}
                  </FeatureItem>
                ))}
              </FeatureList>
            </ModeCard>
          )
        })}
      </CardsRow>}

      {/* ─── Actions ──────────────────────────────────────────────────── */}
      <Actions>
        {(!quizOpen || step === 'done') && (
          <PrimaryButton
            size="m"
            text="Продолжить"
            onClick={() => navigate('/onboarding/tour')}
          />
        )}
        <SkipLink onClick={handleSkip}>Пропустить настройку</SkipLink>
      </Actions>
    </Wrapper>
  )
}
