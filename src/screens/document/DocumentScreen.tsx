import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { useNavigate } from 'react-router-dom'
import { useOpenObjects } from '../../context/OpenObjectsContext'

// ─── Constants ────────────────────────────────────────────────────────────────

export const DOCUMENT_OBJECT_ID = '/document'

const DOC_TITLE    = 'Шаблон заявления на отпуск'
const DOC_DATE     = '12.05.2026'
const DOC_DEPT     = 'Отдел кадров'
const DOC_LABEL    = 'Шаблон заявления' // 17 chars, fits in 24

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  max-width: 680px;
`

const DocTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
`

const DocMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
`

const DocCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
`

const DocSubtitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 1.5rem;
`

const DocText = styled.div`
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.8;
`

const ActRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const LocalToast = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: #ffffff;
  font-size: 0.875rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
  z-index: 600;
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.25s ease;
`

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentScreen() {
  const { openObject, closeObject, objects } = useOpenObjects()
  const navigate = useNavigate()
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    openObject({
      id:        DOCUMENT_OBJECT_ID,
      type:      'document',
      label:     DOC_LABEL,
      fullLabel: DOC_TITLE,
      route:     DOCUMENT_OBJECT_ID,
    })
  }, [openObject])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  return (
    <Wrapper>
      <DocTitle>{DOC_TITLE}</DocTitle>
      <DocMeta>Документ · Обновлён {DOC_DATE} · {DOC_DEPT}</DocMeta>

      <DocCard>
        <DocSubtitle>Заявление на ежегодный оплачиваемый отпуск</DocSubtitle>
        <DocText>
          Прошу предоставить мне ежегодный оплачиваемый отпуск
          с ______ по ______ продолжительностью ___ календарных дней.
        </DocText>
      </DocCard>

      <ActRow>
        <Button
          view="secondary"
          size="m"
          text="Скачать"
          onClick={() => showToast('Документ скачан')}
        />
        <Button
          view="secondary"
          size="m"
          text="Использовать шаблон"
          onClick={() => showToast('Шаблон добавлен')}
        />
        <Button
          view="secondary"
          size="m"
          text="Закрыть"
          onClick={() => {
            closeObject(DOCUMENT_OBJECT_ID)
            if (objects.length <= 1) navigate('/documents')
          }}
        />
      </ActRow>

      <LocalToast $visible={toastMsg.length > 0}>{toastMsg}</LocalToast>
    </Wrapper>
  )
}
