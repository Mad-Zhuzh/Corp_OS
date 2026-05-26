import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useOpenObjects } from '../../context/OpenObjectsContext'

// ─── Constants ────────────────────────────────────────────────────────────────

export const DOCUMENT_OBJECT_ID = '/document'

const VACATION_TITLE = 'Шаблон заявления на отпуск'
const VACATION_DATE  = '12.05.2026'
const VACATION_DEPT  = 'Отдел кадров'
const VACATION_LABEL = 'Шаблон заявления'

const COMP_TITLE  = 'Положение о компенсациях сотрудникам'
const COMP_DATE   = '01.03.2026'
const COMP_DEPT   = 'Отдел кадров'
const COMP_LABEL  = 'Положение о компенсациях'

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

const PageBadge = styled.span`
  display: inline-block;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  margin-left: 0.625rem;
  vertical-align: middle;
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

const DocSection = styled.div`
  margin-bottom: 1.25rem;
`

const DocSectionTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`

const DocText = styled.div`
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.8;
`

const Highlight = styled.mark`
  background: #fef08a;
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
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

// ─── Highlight helper ─────────────────────────────────────────────────────────

function HighlightedText({ text, term }: { text: string; term: string }) {
  if (!term) return <>{text}</>
  const regex = new RegExp(`(${term}\\w*)`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? <Highlight key={i}>{part}</Highlight> : part
      )}
    </>
  )
}

// ─── Compensation document content ───────────────────────────────────────────

function CompensationDoc({ page, highlight }: { page: number; highlight: string }) {
  return (
    <>
      <DocSubtitle>
        Положение о компенсациях сотрудникам
        {page > 1 && <PageBadge>Страница {page}</PageBadge>}
      </DocSubtitle>

      <DocSection>
        <DocSectionTitle>§ 1. Общие положения</DocSectionTitle>
        <DocText>
          <HighlightedText
            text="Настоящее положение устанавливает порядок и условия компенсации расходов сотрудников компании, понесённых в ходе исполнения трудовых обязанностей."
            term={highlight}
          />
        </DocText>
      </DocSection>

      <DocSection>
        <DocSectionTitle>§ 4. Компенсация транспортных расходов</DocSectionTitle>
        <DocText>
          <HighlightedText
            text="Порядок компенсации проезда сотрудником до места работы определяется внутренним регламентом компании и подлежит возмещению в установленном размере. Компенсация выплачивается ежемесячно на основании предоставленных документов, подтверждающих транспортные расходы."
            term={highlight}
          />
        </DocText>
      </DocSection>

      <DocSection>
        <DocSectionTitle>§ 5. Размер компенсации</DocSectionTitle>
        <DocText>
          <HighlightedText
            text="Предельный размер компенсации транспортных расходов устанавливается приказом генерального директора и пересматривается не реже одного раза в год. Конкретный размер компенсации определяется исходя из фактически понесённых расходов, но не более установленного лимита."
            term={highlight}
          />
        </DocText>
      </DocSection>
    </>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentScreen() {
  const { openObject, closeObject, objects } = useOpenObjects()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [toastMsg, setToastMsg] = useState('')

  const pageParam      = searchParams.get('page')
  const highlightParam = searchParams.get('highlight') ?? ''
  const isCompDoc      = pageParam !== null

  const title  = isCompDoc ? COMP_TITLE  : VACATION_TITLE
  const date   = isCompDoc ? COMP_DATE   : VACATION_DATE
  const dept   = isCompDoc ? COMP_DEPT   : VACATION_DEPT
  const label  = isCompDoc ? COMP_LABEL  : VACATION_LABEL
  const pageNo = pageParam ? parseInt(pageParam, 10) : 1

  useEffect(() => {
    openObject({
      id:        DOCUMENT_OBJECT_ID,
      type:      'document',
      label,
      fullLabel: title,
      route:     isCompDoc
        ? `/document?page=${pageNo}${highlightParam ? `&highlight=${highlightParam}` : ''}`
        : DOCUMENT_OBJECT_ID,
    })
  }, [openObject, label, title])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  return (
    <Wrapper>
      <DocTitle>
        {title}
        {isCompDoc && <PageBadge>Стр. {pageNo}</PageBadge>}
      </DocTitle>
      <DocMeta>Документ · Обновлён {date} · {dept}</DocMeta>

      <DocCard>
        {isCompDoc ? (
          <CompensationDoc page={pageNo} highlight={highlightParam} />
        ) : (
          <>
            <DocSubtitle>Заявление на ежегодный оплачиваемый отпуск</DocSubtitle>
            <DocText>
              Прошу предоставить мне ежегодный оплачиваемый отпуск
              с ______ по ______ продолжительностью ___ календарных дней.
            </DocText>
          </>
        )}
      </DocCard>

      <ActRow>
        <Button
          view="secondary"
          size="m"
          text="Скачать"
          onClick={() => showToast('Документ скачан')}
        />
        {!isCompDoc && (
          <Button
            view="secondary"
            size="m"
            text="Использовать шаблон"
            onClick={() => showToast('Шаблон добавлен')}
          />
        )}
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
