import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { track } from '../../utils/analytics'
import { pluralResults } from '../../utils/plural'
import { clickable } from '../../utils/a11y'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PrimaryButton, SecondaryButton } from '../../components/shared/buttons'
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

type StdFilterKey = 'all' | 'documents' | 'services' | 'actions'

const STD_FILTERS: { key: StdFilterKey; label: string }[] = [
  { key: 'all',       label: 'Все' },
  { key: 'documents', label: 'Документы' },
  { key: 'services',  label: 'Сервисы' },
  { key: 'actions',   label: 'Действия' },
]

// ─── Shared tokens ────────────────────────────────────────────────────────────

const c = {
  text:         '#1a1a1a',
  textSec:      '#4b5563',
  textTer:      '#6b7280',
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
  margin-bottom: 0.875rem;
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

function FileRow({ file, onClick, showOpenBtn }: { file: MockFile; onClick: () => void; showOpenBtn?: boolean }) {
  const s = TYPE_STYLE[file.type] ?? TYPE_STYLE.pdf
  return (
    <FileResultRow {...(showOpenBtn ? { style: { cursor: 'default' } } : clickable(onClick))}>
      <FileIconBadge $bg={s.bg} $color={s.color}>{file.type.toUpperCase()}</FileIconBadge>
      <FileResultName>{file.name}</FileResultName>
      <FileResultMeta>{file.date}</FileResultMeta>
      {showOpenBtn && (
        <SecondaryButton size="s" text="Открыть" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClick() }} />
      )}
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
  color: ${c.textSec};
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
  color: ${c.textSec};
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  margin-bottom: 1.25rem;
`

const ExpertResultRow = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem 0.5rem;
  border-radius: 6px;
  transition: background 0.1s;
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  &:hover { background: ${({ $active }) => ($active ? '#eef2ff' : '#f8f9fa')}; }
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

  // ── Keyboard navigation (expert mode) ──────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(-1)
  const kbItemsRef  = useRef<{ action: () => void }[]>([])
  const activeIdxRef = useRef(-1)

  // ── Category filter (standard mode) ─────────────────────────────────────────
  const [stdFilter, setStdFilter] = useState<StdFilterKey>('all')

  useEffect(() => {
    setActiveIndex(-1); activeIdxRef.current = -1
    setStdFilter('all')
  }, [query])

  useEffect(() => {
    if (mode !== 'expert') return
    function handler(e: KeyboardEvent) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        const delta = e.key === 'ArrowDown' ? 1 : -1
        const next = Math.max(-1, Math.min(activeIdxRef.current + delta, kbItemsRef.current.length - 1))
        activeIdxRef.current = next
        setActiveIndex(next)
      } else if (e.key === 'Enter') {
        const idx = activeIdxRef.current
        if (idx >= 0 && idx < kbItemsRef.current.length) {
          e.preventDefault()
          e.stopPropagation()
          kbItemsRef.current[idx].action()
        }
      } else if (e.key === 'Escape') {
        activeIdxRef.current = -1
        setActiveIndex(-1)
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [mode])

  useEffect(() => {
    if (!query) return
    localStorage.setItem('corpOsOnboarded', '1')
    const hasResults = isSearchMatch(query) || getFileResults(query).length > 0
    track('search-executed', { mode, has_results: hasResults ? 1 : 0 })
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

  function fileClickHandler(file: MockFile): () => void {
    return file.id === 'f3' ? () => navigate('/document') : () => {}
  }

  // ── No query ────────────────────────────────────────────────────────────────
  if (!query) {
    return (
      <div style={{ maxWidth: 640 }}>
        <PageTitle>Поиск</PageTitle>
        <PageSubtitle>Введите запрос в строку поиска выше</PageSubtitle>
      </div>
    )
  }

  // ── BASIC ────────────────────────────────────────────────────────────────────
  if (mode === 'basic') {
    const matched  = isSearchMatch(query)
    const fileRes  = getFileResults(query)
    const anyResult = matched || fileRes.length > 0
    const total    = (matched ? 1 : 0) + fileRes.length
    return (
      <BasicWrapper>
        <PageTitle>Результаты поиска</PageTitle>
        {anyResult && (
          <PageSubtitle>
            Найдено {pluralResults(total)} по запросу «{query}»
          </PageSubtitle>
        )}

        {matched && (
          <>
            <BasicResultCard>
              <PdfIconLg>PDF</PdfIconLg>
              <BasicResultBody>
                <BasicResultTitle>{SEARCH_DOC.shortName}</BasicResultTitle>
                <BasicResultMeta>PDF · Страница {SEARCH_DOC.page} · {SEARCH_DOC.section}</BasicResultMeta>
                <BasicFragment>{SEARCH_DOC.fragment}</BasicFragment>
                <PrimaryButton size="m" text={`Открыть на странице ${SEARCH_DOC.page}`} onClick={handleDocOpen} />
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
                <FileRow key={f.id} file={f} onClick={fileClickHandler(f)} showOpenBtn />
              ))}
            </FileResultsList>
          </FileResultsSection>
        )}

        {!anyResult && (
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
              Ничего не нашлось. Попробуйте написать иначе.
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

    // Результаты этого экрана — документы и файлы (тоже документы).
    // Категории «Сервисы» и «Действия» в текущих данных пусты.
    const docsActive = stdFilter === 'all' || stdFilter === 'documents'
    const showDoc    = matched && docsActive
    const visibleFiles = docsActive ? fileRes : []
    const visibleCount = (showDoc ? 1 : 0) + visibleFiles.length

    return (
      <StandardWrapper>
        <PageTitle style={{ marginBottom: '1.25rem' }}>Результаты поиска</PageTitle>
        <PageSubtitle>
          {total > 0
            ? `Найдено ${pluralResults(total)} по запросу «${query}»`
            : `По запросу «${query}» ничего не найдено`}
        </PageSubtitle>

        {total > 0 && (
          <FiltersRow>
            {STD_FILTERS.map(f => (
              <FilterChip
                key={f.key}
                $active={stdFilter === f.key}
                onClick={() => setStdFilter(f.key)}
              >
                {f.label}
              </FilterChip>
            ))}
          </FiltersRow>
        )}

        {showDoc && (
          <StandardResultRow style={{ marginBottom: '0.5rem' }}>
            <PdfIconSm>PDF</PdfIconSm>
            <StandardResultBody>
              <StandardResultTitle>{SEARCH_DOC.shortName}</StandardResultTitle>
              <StandardResultMeta>PDF · Страница {SEARCH_DOC.page} · {SEARCH_DOC.section}</StandardResultMeta>
              <StandardFragment>{SEARCH_DOC.fragment}</StandardFragment>
            </StandardResultBody>
            <StandardResultActions>
              <SecondaryButton size="s" text="Открыть" onClick={handleDocOpen} />
            </StandardResultActions>
          </StandardResultRow>
        )}

        {visibleFiles.length > 0 && (
          <FileResultsList style={{ marginTop: showDoc ? '0.5rem' : 0 }}>
            {visibleFiles.map(f => (
              <FileRow key={f.id} file={f} onClick={fileClickHandler(f)} />
            ))}
          </FileResultsList>
        )}

        {total > 0 && visibleCount === 0 && (
          <div style={{ fontSize: '0.875rem', color: c.textSec }}>
            В категории «{STD_FILTERS.find(f => f.key === stdFilter)?.label}» ничего не найдено.
          </div>
        )}

        {total === 0 && (
          <div style={{ fontSize: '0.875rem', color: c.textSec }}>
            Попробуйте изменить запрос или проверить написание.
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

  // Build keyboard-navigable items and sync ref
  const kbItems: { action: () => void }[] = []
  if (matched) kbItems.push({ action: handleDocOpen })
  fileRes.forEach(f => kbItems.push({ action: fileClickHandler(f) }))
  kbItemsRef.current = kbItems

  const compDocKbIdx  = matched ? 0 : -1
  const fileKbIdxBase = matched ? 1 : 0

  return (
    <ExpertWrapper>
      <PageTitle>Результаты поиска</PageTitle>

      <ExpertMeta>
        {typeFilter
          ? `тип:${typeFilter}${term ? ` · ${term}` : ''} · найдено ${total}`
          : `«${query}» · найдено ${total}`}
      </ExpertMeta>

      {matched && (
        <ExpertResultRow $active={activeIndex === compDocKbIdx} onClick={handleDocOpen} style={{ cursor: 'pointer' }}>
          <ExpertResultTop>
            <PdfIconSm>PDF</PdfIconSm>
            <ExpertResultTitle>{SEARCH_DOC.name}</ExpertResultTitle>
            <ExpertResultFileMeta>PDF · страница {SEARCH_DOC.page}</ExpertResultFileMeta>
            <Button view="clear" size="xs" text={`Открыть на стр.${SEARCH_DOC.page}`} onClick={e => { e.stopPropagation(); handleDocOpen() }} />
          </ExpertResultTop>
          <ExpertResultFragment>{SEARCH_DOC.fragment}</ExpertResultFragment>
        </ExpertResultRow>
      )}

      {fileRes.map((f, i) => {
        const s = TYPE_STYLE[f.type] ?? TYPE_STYLE.pdf
        return (
          <ExpertResultRow
            key={f.id}
            $active={activeIndex === fileKbIdxBase + i}
            onClick={fileClickHandler(f)}
            style={{ cursor: f.id === 'f3' ? 'pointer' : 'default' }}
          >
            <ExpertResultTop>
              <PdfIconSm style={{ background: s.bg, color: s.color, fontSize: '0.5625rem' }}>{f.type.toUpperCase()}</PdfIconSm>
              <ExpertResultTitle>{f.name}</ExpertResultTitle>
              <ExpertResultFileMeta>{f.type.toUpperCase()} · {f.date}</ExpertResultFileMeta>
            </ExpertResultTop>
          </ExpertResultRow>
        )
      })}

      {total === 0 && (
        <div style={{ fontSize: '0.8125rem', color: c.textSec }}>
          Уточните:  {' '}
          <button
            onClick={() => navigate(`/search?q=${encodeURIComponent(`тип:pdf ${query}`)}`)}
            style={{
              background: c.accentBg,
              border: `1px solid ${c.accentBorder}`,
              borderRadius: '12px',
              padding: '0.1rem 0.5rem',
              fontSize: '0.8125rem',
              color: c.accentDark,
              fontFamily: 'SF Mono, Consolas, monospace',
              cursor: 'pointer',
            }}
          >
            тип:pdf {query}
          </button>
        </div>
      )}

      {total > 0 && <ExpertHint>↑↓ выбор · Enter открыть · Esc закрыть</ExpertHint>}
    </ExpertWrapper>
  )
}
