import { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  IconFileCheckOutline,
  IconDownload,
  IconClose,
  IconCopyOutline,
} from '@salutejs/plasma-icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../../components/shared/buttons'
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

// ─── Source documents (автозаполнение заявки) ──────────────────────────────────

type SourceDocKey = 'kp' | 'req' | 'basis'

interface SourceDocMeta {
  title: string
  meta:  string
  label: string
}

const SOURCE_DOCS: Record<SourceDocKey, SourceDocMeta> = {
  kp: {
    title: 'Коммерческое предложение',
    meta:  'PDF · ООО Рога и Копыта · 20.05.2026',
    label: 'Коммерческое предложение',
  },
  req: {
    title: 'Реквизиты поставщика',
    meta:  'XLSX · ООО Рога и Копыта · 20.05.2026',
    label: 'Реквизиты поставщика',
  },
  basis: {
    title: 'Обоснование закупки',
    meta:  'DOCX · Зиновьева О. · 19.05.2026',
    label: 'Обоснование закупки',
  },
}

function isSourceDocKey(v: string | null): v is SourceDocKey {
  return v === 'kp' || v === 'req' || v === 'basis'
}

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

// ─── Source-document layout & content ──────────────────────────────────────────

const DocField = styled.div`
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.9;
`

const DocFieldKey = styled.span`
  font-weight: 600;
  color: #1a1a1a;
`

const DocParagraph = styled.p`
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.7;
  margin-bottom: 1rem;
  &:last-child { margin-bottom: 0; }
`

// Highlight any of the given literal substrings (case-sensitive, exact)
function HighlightLiteral({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'g')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        terms.includes(part) ? <Highlight key={i}>{part}</Highlight> : part
      )}
    </>
  )
}

function SourceDocContent({ docKey }: { docKey: SourceDocKey }) {
  if (docKey === 'kp') {
    return (
      <>
        <DocSubtitle>Коммерческое предложение №КП-2026-047</DocSubtitle>
        <DocField><DocFieldKey>Поставщик:</DocFieldKey> ООО "Рога и Копыта"</DocField>
        <DocField><DocFieldKey>Предмет поставки:</DocFieldKey> Офисное оборудование</DocField>
        <DocField>
          <DocFieldKey>Сумма:</DocFieldKey>{' '}
          <HighlightLiteral text="485 000 ₽ (в т.ч. НДС 20%: 80 833 ₽)" terms={['485 000 ₽']} />
        </DocField>
        <DocField><DocFieldKey>Срок поставки:</DocFieldKey> 30 рабочих дней с момента подписания договора</DocField>
        <DocField><DocFieldKey>Условия оплаты:</DocFieldKey> 50% аванс, 50% по факту поставки</DocField>
      </>
    )
  }

  if (docKey === 'req') {
    const orgTerms = ['ООО "Рога и Копыта"', '7712345678']
    return (
      <>
        <DocSubtitle>Реквизиты поставщика</DocSubtitle>
        <DocField>
          <DocFieldKey>Полное наименование:</DocFieldKey>{' '}
          <HighlightLiteral text={'ООО "Рога и Копыта"'} terms={orgTerms} />
        </DocField>
        <DocField>
          <DocFieldKey>ИНН:</DocFieldKey>{' '}
          <HighlightLiteral text="7712345678" terms={orgTerms} />
        </DocField>
        <DocField><DocFieldKey>КПП:</DocFieldKey> 771201001</DocField>
        <DocField><DocFieldKey>ОГРН:</DocFieldKey> 1187746123456</DocField>
        <DocField><DocFieldKey>Юридический адрес:</DocFieldKey> г. Москва, ул. Тверская, д. 1</DocField>
        <DocField><DocFieldKey>Расчётный счёт:</DocFieldKey> 40702810500000012345</DocField>
        <DocField><DocFieldKey>Банк:</DocFieldKey> ПАО Сбербанк</DocField>
        <DocField><DocFieldKey>БИК:</DocFieldKey> 044525225</DocField>
      </>
    )
  }

  // basis
  const purposeTerm = ['Закупка офисного оборудования']
  return (
    <>
      <DocSubtitle>Обоснование необходимости закупки офисного оборудования</DocSubtitle>
      <DocParagraph>
        <DocFieldKey>Цель закупки:</DocFieldKey> оснащение рабочих мест сотрудников
        нового офиса компании.
      </DocParagraph>
      <DocParagraph>
        <DocFieldKey>Назначение:</DocFieldKey>{' '}
        <HighlightLiteral
          text="Закупка офисного оборудования (компьютеры, мониторы, периферия) для 12 рабочих мест."
          terms={purposeTerm}
        />
      </DocParagraph>
      <DocParagraph>
        <DocFieldKey>Обоснование цены:</DocFieldKey> коммерческое предложение
        получено от ООО "Рога и Копыта", цена соответствует рыночному уровню
        по данным анализа 3 поставщиков.
      </DocParagraph>
      <DocParagraph><DocFieldKey>Ответственный:</DocFieldKey> Зиновьева О.А.</DocParagraph>
      <DocParagraph><DocFieldKey>Дата:</DocFieldKey> 19.05.2026</DocParagraph>
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
  const docParam       = searchParams.get('doc')
  const sourceDocKey   = isSourceDocKey(docParam) ? docParam : null
  const sourceDoc      = sourceDocKey ? SOURCE_DOCS[sourceDocKey] : null
  const isCompDoc      = !sourceDoc && pageParam !== null

  const title  = sourceDoc ? sourceDoc.title : isCompDoc ? COMP_TITLE  : VACATION_TITLE
  const date   = isCompDoc ? COMP_DATE   : VACATION_DATE
  const dept   = isCompDoc ? COMP_DEPT   : VACATION_DEPT
  const label  = sourceDoc ? sourceDoc.label : isCompDoc ? COMP_LABEL  : VACATION_LABEL
  const pageNo = pageParam ? parseInt(pageParam, 10) : 1

  useEffect(() => {
    openObject({
      id:        DOCUMENT_OBJECT_ID,
      type:      'document',
      label,
      fullLabel: title,
      route:     sourceDocKey
        ? `/document?doc=${sourceDocKey}`
        : isCompDoc
          ? `/document?page=${pageNo}${highlightParam ? `&highlight=${highlightParam}` : ''}`
          : DOCUMENT_OBJECT_ID,
    })
  }, [openObject, label, title])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // ─── Source document view ────────────────────────────────────────────────────
  if (sourceDoc && sourceDocKey) {
    return (
      <Wrapper>
        <DocTitle>{sourceDoc.title}</DocTitle>
        <DocMeta>{sourceDoc.meta}</DocMeta>

        <DocCard>
          <SourceDocContent docKey={sourceDocKey} />
        </DocCard>

        <ActRow>
          <PrimaryButton
            size="m"
            text="Скопировать"
            contentLeft={<IconCopyOutline size="xs" color="currentColor" />}
            onClick={() => showToast('Документ скопирован в буфер обмена')}
          />
          <TertiaryButton
            size="m"
            text="Закрыть"
            contentLeft={<IconClose size="xs" color="currentColor" />}
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
        {!isCompDoc && (
          <PrimaryButton
            size="m"
            text="Использовать шаблон"
            contentLeft={<IconFileCheckOutline size="xs" color="currentColor" />}
            onClick={() => showToast('Шаблон добавлен')}
          />
        )}
        {isCompDoc
          ? <PrimaryButton
              size="m"
              text="Скачать"
              contentLeft={<IconDownload size="xs" color="currentColor" />}
              onClick={() => showToast('Документ скачан')}
            />
          : <SecondaryButton
              size="m"
              text="Скачать"
              contentLeft={<IconDownload size="xs" color="currentColor" />}
              onClick={() => showToast('Документ скачан')}
            />
        }
        <TertiaryButton
          size="m"
          text="Закрыть"
          contentLeft={<IconClose size="xs" color="currentColor" />}
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
