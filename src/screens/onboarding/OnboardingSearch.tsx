import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useTourHighlight } from '../../context/TourHighlightContext'
import { useUserMode } from '../../context/UserModeContext'
import { track } from '../../utils/analytics'
import { PrimaryButton } from '../../components/shared/buttons'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  max-width: 480px;
`

const StepLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const Title = styled.h1`
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  line-height: 1.25;
`

const TaskCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const TaskLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const TaskText = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
`

const TaskHint = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
`

const SkipLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  color: #9ca3af;
  cursor: pointer;
  text-align: left;
  transition: color 0.1s;
  &:hover { color: #6b7280; }
`

const SuccessCard = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

const SuccessTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #059669;
  line-height: 1.3;
`

const SuccessText = styled.div`
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 0.25rem;
`

export function OnboardingSearch() {
  const { setZone } = useTourHighlight()
  const { mode } = useUserMode()
  const navigate = useNavigate()

  const [docOpened, setDocOpened] = useState(
    () => localStorage.getItem('corpOsSearchDone') === '1'
  )

  useEffect(() => {
    setZone('search')
    return () => setZone(null)
  }, [setZone])

  // detect flag set by AppLayout in another tab (edge-case) or programmatically
  useEffect(() => {
    if (docOpened) return
    function onStorage(e: StorageEvent) {
      if (e.key === 'corpOsSearchDone' && e.newValue === '1') setDocOpened(true)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [docOpened])

  // poll once on focus — catches the case where user navigated to /document
  // and pressed Back (flag already in localStorage when component re-mounts)
  useEffect(() => {
    if (docOpened) return
    function onFocus() {
      if (localStorage.getItem('corpOsSearchDone') === '1') setDocOpened(true)
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [docOpened])

  function finish() {
    track('onboarding-completed', { step: 'search', mode })
    localStorage.setItem('corpOsOnboarded', '1')
    localStorage.removeItem('corpOsSearchDone')
    navigate('/main')
  }

  function skip() {
    track('onboarding-skipped', { step: 'search', mode })
    localStorage.setItem('corpOsOnboarded', '1')
    localStorage.removeItem('corpOsSearchDone')
    navigate('/main')
  }

  return (
    <Root>
      <div>
        <StepLabel>Первое действие</StepLabel>
      </div>
      <Title>Попробуйте поиск</Title>

      {docOpened ? (
        <SuccessCard>
          <SuccessTitle>Отлично! Вы нашли нужный документ.</SuccessTitle>
          <SuccessText>
            Теперь вы знаете, как искать информацию в CorpOS.
          </SuccessText>
          <PrimaryButton size="m" text="Перейти к работе" onClick={finish} />
        </SuccessCard>
      ) : (
        <>
          <TaskCard>
            <TaskLabel>Задание</TaskLabel>
            <TaskText>Найдите документ «Шаблон заявления на отпуск»</TaskText>
            <TaskHint>
              Введите название или несколько слов из него в строку поиска вверху страницы и нажмите Enter.
            </TaskHint>
          </TaskCard>
          <SkipLink onClick={skip}>
            Пропустить задание — перейти к работе
          </SkipLink>
        </>
      )}
    </Root>
  )
}
