import { useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useTourHighlight } from '../../context/TourHighlightContext'

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

export function OnboardingSearch() {
  const { setZone } = useTourHighlight()
  const navigate = useNavigate()

  useEffect(() => {
    setZone('search')
    return () => setZone(null)
  }, [setZone])

  return (
    <Root>
      <div>
        <StepLabel>Первое действие</StepLabel>
      </div>
      <Title>Попробуйте поиск</Title>
      <TaskCard>
        <TaskLabel>Задание</TaskLabel>
        <TaskText>Найдите документ «Инструкция по отпуску»</TaskText>
        <TaskHint>
          Введите название или несколько слов из него в строку поиска вверху страницы и нажмите Enter.
        </TaskHint>
      </TaskCard>
      <SkipLink onClick={() => { localStorage.setItem('corpOsOnboarded', '1'); navigate('/main') }}>
        Пропустить задание — перейти к работе
      </SkipLink>
    </Root>
  )
}
