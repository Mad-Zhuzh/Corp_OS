import { useEffect } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserMode } from '../../context/UserModeContext'
import { useOpenObjects } from '../../context/OpenObjectsContext'
import {
  SEARCH_DOC,
  BASIC_EMPTY_SUGGESTIONS,
  isSearchMatch,
  isExpertMatch,
  getFileResults,
  type MockFile,
} from '../../data/searchMockData'

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  pdf:  { bg: '#fee2e2', color: '#b91c1c' },
  docx: { bg: '#dbeafe', color: '#1d4ed8' },
  xlsx: { bg: '#dcfce7', color: '#15803d' },
}

// ─── Shared tokens ────────────────────────────────────────────────────────────

const c = {
  text:         '#1a1a1a',
  textSec:      '#4b5563',
  textTer:      '#9ca3af',
  accent:       '#4f46e5',
  accentDark:   '#4338ca',
  accentBg:     '#eef2ff',
  accentBorder: '#c7d2fe',
  border:       '#e5e7eb',
  cardBg:       '#ffffff',
}

// ─── Shared styled primitives ─────────────────────────────────────────────────

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.02em;
  margin-bottom: 0.375rem;
`

const PageSubtitle = styled.p`
  font-size: 0.9375rem;
  color: ${c.textSec};
  margin-bottom: 1.5rem;
`

const SuggestionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`

const SuggestionChip = styled.button`
  background: #f3f4f6;
  border: 1px solid ${c.border};
  border-radius: 20px;
  padding: 0.3rem 0.875rem;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s, border-color 0.12s;
  &:hover { background: #e0e7ff; border-color: #a5b4fc; color: #3730a3; }
`

const FilterChip = styled.button<{ $active: boolean; $compact?: boolean }>`
  padding: ${({ $compact }) => ($compact ? '0.2rem 0.625rem' : '0.3rem 0.875rem')};
  border: 1px solid ${({ $active }) => ($active ? '#a5b4fc' : c.border)};
  border-radius: 20px;
  background: ${({ $active }) => ($active ? c.accentBg : c.cardBg)};
  color: ${({ $active }) => ($active ? '#4338ca' : '#374151')};
  font-size: ${({ $compact }) => ($compact ? '0.8125rem' : '0.875rem')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s, border-color 0.12s;
  &:hover {
    background: ${({ $active }) => ($active ? c.accentBg : '#f3f4f6')};
    border-color: ${({ $active }) => ($active ? '#a5b4fc' : '#d1d5db')};
  }
`

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`

// ─── PDF icon badge ───────────────────────────────────────────────────────────

const PdfIconLg = styled.div`
  width: 52px;
  height: 52px;
  background: #fee2e2;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #b91c1c;
  flex-shrink: 0;
`

const PdfIconSm = styled.div`
  width: 32px;
  height: 32px;
  background: #fee2e2;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  color: #b91c1c;
  flex-shrink: 0;
`

// ─── File result rows ─────────────────────────────────────────────────────────

const FileResultRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.12s;
  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07); }
`

const FileIconBadge = styled.div<{ $bg: string; $color: string }>`
  width: 32px;
  height: 32px;
  background: ${({ $bg }) => $bg};
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`

const FileResultName = styled.div`
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${c.text};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const FileResultMeta = styled.div`
  font-size: 0.8125rem;
  color: ${c.textSec};
  white-space: nowrap;
`

const FileResultsSection = styled.div`
  margin-top: 1.25rem;
`

const SectionLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${c.textTer};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`

const FileResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

function FileRow({ file, onClick }: { file: MockFile; onClick: () => void }) {
  const s = TYPE_STYLE[file.type] ?? TYPE_STYLE.pdf
  return (
    <FileResultRow onClick={onClick}>
      <FileIconBadge $bg={s.bg} $color={s.color}>{file.type.toUpperCase()}</FileIconBadge>
      <FileResultName>{file.name}</FileResultName>
      <FileResultMeta>{file.date}</FileResultMeta>
    </FileResultRow>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BASIC
// ─────────────────────────────────────────────────────────────────────────────

const BasicWrapper = styled.div`
  max-width: 640px;
`

const BasicResultCard = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.accentBorder};
  border-radius: 14px;
  padding: 1.375rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1.125rem;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.08);
  margin-bottom: 1rem;
`

const BasicResultBody = styled.div`
  flex: 1;
  min-width: 0;
`

const BasicResultTitle = styled.div`
  font-size: 1.0625rem;
  font-weight: 700;
  color: ${c.text};
  margin-bottom: 0.25rem;
`

const BasicResultMeta = styled.div`
  font-size: 0.875rem;
  color: ${c.textSec};
  margin-bottom: 0.75rem;
`

const BasicFragment = styled.div`
  background: #f8f9fa;
  border-left: 3px solid ${c.accent};
  border-radius: 0 8px 8px 0;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: ${c.textSec};
  line-height: 1.55;
  margin-bottom: 0.875rem;
  font-style: italic;
`

const BasicNote = styled.div`
  font-size: 0.8125rem;
  color: ${c.textTer};
  margin-top: 0.25rem;
`

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD
// ─────────────────────────────────────────────────────────────────────────────

const StandardWrapper = styled.div`
  max-width: 720px;
`

const StandardResultRow = styled.div`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: 10px;
  padding: 0.875rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`

const StandardResultBody = styled.div`
  flex: 1;
  min-width: 0;
`

const StandardResultTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${c.text};
  margin-bottom: 0.2rem;
`

const StandardResultMeta = styled.div`
  font-size: 0.8125rem;
  color: ${c.textSec};
  margin-bottom: 0.5rem;
`

const StandardFragment = styled.div`
  font-size: 0.8125rem;
  color: ${c.textTer};
  font-style: italic;
  line-height: 1.5;
`

const StandardResultActions = styled.div`
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  padding-top: 0.125rem;
`

// ─────────────────────────────────────────────────────────────────────────────
// EXPERT
// ─────────────────────────────────────────────────────────────────────────────

const ExpertWrapper = styled.div`
  max-width: 800px;
`

const ExpertMeta = styled.div`
  font-size: 0.8125rem;
  color: ${c.textTer};
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  margin-bottom: 1.25rem;
`

const ExpertResultRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem 0.5rem;
  border-radius: 6px;
  transition: background 0.1s;
  &:hover { background: #f8f9fa; }
`

const ExpertResultTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`

const ExpertResultTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${c.text};
  flex: 1;
`

const ExpertResultFileMeta = styled.span`
  font-size: 0.8125rem;
  color: ${c.textTer};
  white-space: nowrap;
`

const ExpertResultFragment = styled.div`
  font-size: 0.8125rem;
  color: ${c.textTer};
  font-style: italic;
  padding-left: 2.375rem;
  line-height: 1.5;
`

const ExpertHint = styled.div`
  font-size: 0.75rem;
  color: ${c.textTer};
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  margin-top: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${c.border};
`

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SearchScreen() {
  const { mode } = useUserMode()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { openObject } = useOpenObjects()

  useEffect(() => {
    if (!query) return
    localStorage.setItem('corpOsOnboarded', '1')
    openObject({
      id: `search-${query}`,
      type: 'search',
      label: `Поиск: «${query}»`,
      fullLabel: `Результаты поиска по запросу «${query}»`,
      route: `/search?q=${encodeURIComponent(query)}`,
    })
  }, [query, openObject])

  function handleDocOpen() {
    navigate(`/document?page=${SEARCH_DOC.page}&highlight=компенсация`)
  }

  // ── No query ────────────────────────────────────────────────────────────────
  if (!query) {
    return (
      <div style={{ maxWidth: 640 }}>
        <PageTitle>
          {mode === 'basic' ? 'Результаты поиска' : mode === 'standard' ? 'Глобальный поиск' : 'Поиск и действия'}
        </PageTitle>
        <PageSubtitle>Введите запрос в строку поиска выше</PageSubtitle>
      </div>
    )
  }

  // ── BASIC ────────────────────────────────────────────────────────────────────
  if (mode === 'basic') {
    const matched  = isSearchMatch(query)
    const fileRes  = getFileResults(query)
    const anyResult = matched || fileRes.length > 0
    return (
      <BasicWrapper>
        <PageTitle>Результаты поиска</PageTitle>
        {matched && <PageSubtitle>Похоже, это то что вам нужно</PageSubtitle>}

        {matched && (
          <>
            <BasicResultCard>
              <PdfIconLg>PDF</PdfIconLg>
              <BasicResultBody>
                <BasicResultTitle>{SEARCH_DOC.shortName}</BasicResultTitle>
                <BasicResultMeta>PDF · Страница {SEARCH_DOC.page} · {SEARCH_DOC.section}</BasicResultMeta>
                <BasicFragment>{SEARCH_DOC.fragment}</BasicFragment>
                <Button view="primary" size="m" text={`Открыть на странице ${SEARCH_DOC.page}`} onClick={handleDocOpen} />
              </BasicResultBody>
            </BasicResultCard>
            <BasicNote>Мы нашли этот документ по смыслу вашего запроса</BasicNote>
          </>
        )}

        {fileRes.length > 0 && (
          <FileResultsSection>
            {matched && <SectionLabel>Файлы</SectionLabel>}
            <FileResultsList>
              {fileRes.map(f => (
                <FileRow key={f.id} file={f} onClick={() => navigate(`/document?page=1`)} />
              ))}
            </FileResultsList>
          </FileResultsSection>
        )}

        {!anyResult && (
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
              Ничего не нашлось. Попробуйте написать иначе:
            </div>
            <SuggestionsRow>
              {BASIC_EMPTY_SUGGESTIONS.map(s => (
                <SuggestionChip key={s} onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}>{s}</SuggestionChip>
              ))}
            </SuggestionsRow>
          </div>
        )}
      </BasicWrapper>
    )
  }

  // ── STANDARD ─────────────────────────────────────────────────────────────────
  if (mode === 'standard') {
    const matched  = isSearchMatch(query)
    const fileRes  = getFileResults(query)
    const total    = (matched ? 1 : 0) + fileRes.length
    const FILTERS  = [
      { key: 'all', label: 'Все' },
      { key: 'documents', label: 'Документы' },
      { key: 'services', label: 'Сервисы' },
      { key: 'actions', label: 'Действия' },
    ]
    return (
      <StandardWrapper>
        <PageTitle>Глобальный поиск</PageTitle>
        <PageSubtitle>
          {total > 0
            ? `Найдено ${total} ${total === 1 ? 'результат' : 'результата'} по запросу «${query}»`
            : `По запросу «${query}» ничего не найдено`}
        </PageSubtitle>

        <FiltersRow>
          {FILTERS.map(f => (
            <FilterChip key={f.key} $active={f.key === 'all'} onClick={() => {}}>
              {f.label}
            </FilterChip>
          ))}
        </FiltersRow>

        {matched && (
          <StandardResultRow style={{ marginBottom: '0.5rem' }}>
            <PdfIconSm>PDF</PdfIconSm>
            <StandardResultBody>
              <StandardResultTitle>{SEARCH_DOC.shortName}</StandardResultTitle>
              <StandardResultMeta>PDF · Страница {SEARCH_DOC.page} · {SEARCH_DOC.section}</StandardResultMeta>
              <StandardFragment>{SEARCH_DOC.fragment}</StandardFragment>
            </StandardResultBody>
            <StandardResultActions>
              <Button view="secondary" size="s" text="Открыть" onClick={handleDocOpen} />
            </StandardResultActions>
          </StandardResultRow>
        )}

        {fileRes.length > 0 && (
          <FileResultsList style={{ marginTop: matched ? '0.5rem' : 0 }}>
            {fileRes.map(f => (
              <FileRow key={f.id} file={f} onClick={() => navigate('/document?page=1')} />
            ))}
          </FileResultsList>
        )}

        {total === 0 && (
          <div style={{ fontSize: '0.9375rem', color: c.textSec }}>
            По запросу ничего не найдено
          </div>
        )}
      </StandardWrapper>
    )
  }

  // ── EXPERT ────────────────────────────────────────────────────────────────────
  const matched   = isExpertMatch(query)
  const fileRes   = getFileResults(query)
  const total     = (matched ? 1 : 0) + fileRes.length
  const { typeFilter, term } = (() => {
    const m = /^тип:(\S+)\s*(.*)/i.exec(query.trim())
    if (m) return { typeFilter: m[1].toLowerCase(), term: m[2].trim() }
    return { typeFilter: null as null, term: query.trim() }
  })()

  return (
    <ExpertWrapper>
      <PageTitle>Поиск и действия</PageTitle>

      <ExpertMeta>
        {typeFilter
          ? `тип:${typeFilter}${term ? ` · ${term}` : ''} · найдено ${total}`
          : `«${query}» · найдено ${total}`}
      </ExpertMeta>

      {matched && (
        <ExpertResultRow>
          <ExpertResultTop>
            <PdfIconSm>PDF</PdfIconSm>
            <ExpertResultTitle>{SEARCH_DOC.name}</ExpertResultTitle>
            <ExpertResultFileMeta>PDF · страница {SEARCH_DOC.page}</ExpertResultFileMeta>
            <Button view="clear" size="xs" text={`Открыть на стр.${SEARCH_DOC.page}`} onClick={handleDocOpen} />
          </ExpertResultTop>
          <ExpertResultFragment>{SEARCH_DOC.fragment}</ExpertResultFragment>
        </ExpertResultRow>
      )}

      {fileRes.map(f => {
        const s = TYPE_STYLE[f.type] ?? TYPE_STYLE.pdf
        return (
          <ExpertResultRow key={f.id} onClick={() => navigate('/document?page=1')} style={{ cursor: 'pointer' }}>
            <ExpertResultTop>
              <PdfIconSm style={{ background: s.bg, color: s.color, fontSize: '0.5625rem' }}>{f.type.toUpperCase()}</PdfIconSm>
              <ExpertResultTitle>{f.name}</ExpertResultTitle>
              <ExpertResultFileMeta>{f.type.toUpperCase()} · {f.date}</ExpertResultFileMeta>
            </ExpertResultTop>
          </ExpertResultRow>
        )
      })}

      {total === 0 && (
        <div style={{ fontSize: '0.8125rem', color: c.textTer, fontFamily: 'SF Mono, Consolas, monospace' }}>
          Не найдено. Попробуйте тип:pdf [запрос]
        </div>
      )}

      {total > 0 && <ExpertHint>↑↓ выбор · Enter открыть · Esc закрыть</ExpertHint>}
    </ExpertWrapper>
  )
}
