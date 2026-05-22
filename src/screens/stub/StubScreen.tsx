import styled from 'styled-components'

interface StubScreenProps {
  section: string
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  gap: 0.75rem;
  text-align: center;
`

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
`

const Title = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
`

const Subtitle = styled.div`
  font-size: 0.9375rem;
  color: #9ca3af;
`

export function StubScreen({ section }: StubScreenProps) {
  return (
    <Wrapper>
      <Icon>🚧</Icon>
      <Title>{section}</Title>
      <Subtitle>Раздел в разработке</Subtitle>
    </Wrapper>
  )
}
