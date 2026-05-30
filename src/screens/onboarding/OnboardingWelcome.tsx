import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../../components/shared/buttons'
import { useUserMode } from '../../context/UserModeContext'
import { track } from '../../utils/analytics'

// ─── Styles ───────────────────────────────────────────────────────────────────

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  max-width: 580px;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Title = styled.h1`
  font-size: 1.625rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  line-height: 1.2;
`

const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.6;
`

const ModeHint = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.55;
`

const ModeHintTitle = styled.span`
  font-weight: 600;
  color: #374151;
`

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

export function OnboardingWelcome() {
  const navigate = useNavigate()
  const { setMode } = useUserMode()

  function handleSkip() {
    track('onboarding-skipped', { step: 'welcome' })
    localStorage.setItem('corpOsOnboarded', '1')
    setMode('standard')
    navigate('/main', {
      state: {
        pendingToast: 'Вы вошли в Стандартном режиме. Его можно изменить в верхней панели.',
      },
    })
  }

  return (
    <Root>
      <Header>
        <Title>Добро пожаловать в CorpOS</Title>
        <Subtitle>
          Система объединяет работу с файлами, документами, задачами и корпоративными сервисами в единой рабочей среде.
        </Subtitle>
      </Header>

      <ModeHint>
        <ModeHintTitle>Рекомендуем выбрать режим работы</ModeHintTitle>
        Он определяет количество подсказок, плотность интерфейса и доступ к быстрым действиям.<br />Режим можно изменить позже.
      </ModeHint>

      <Actions>
        <PrimaryButton
          size="m"
          text="Настроить режим"
          onClick={() => navigate('/onboarding/mode')}
        />
        <SkipLink onClick={handleSkip}>Пропустить настройку</SkipLink>
      </Actions>
    </Root>
  )
}
