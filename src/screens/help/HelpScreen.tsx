import styled from 'styled-components'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 560px;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.02em;
`

const Description = styled.p`
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.6;
`

export function HelpScreen() {
  return (
    <Root>
      <Title>Помощь</Title>
      <Description>
        Здесь будут инструкции, ответы на частые вопросы и подсказки по работе с CorpOS.
      </Description>
    </Root>
  )
}
