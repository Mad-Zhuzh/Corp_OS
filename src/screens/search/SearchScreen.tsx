import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserMode } from '../../context/UserModeContext'
import { useOpenObjects } from '../../context/OpenObjectsContext'
import {
  searchResults,
  searchSuggestions,
  type SearchResult,
  type SearchCategory,
} from '../../data/mockData'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterKey = 'all' | SearchCategory

type GroupedResults = Record<SearchCategory, SearchResult[]>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  document: 'Документы',
  service:  'Сервисы',
  action:   'Действия',
  section:  'Разделы',
}

const ALL_CATEGORIES: SearchCategory[] = ['document', 'service', 'action', 'section']

const FILTERS_BASIC: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'Все' },
  { key: 'document', label: 'Документы' },
  { key: 'service',  label: 'Сервисы' },
  { key: 'action',   label: 'Действия' },
]

const FILTERS_STANDARD = FILTERS_BASIC

const FILTERS_EXPERT: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'Все' },
  { key: 'document', label: 'Документы' },
  { key: 'action',   label: 'Действия' },
]

function filterResults(query: string): SearchResult[] {
  if (query.length < 1) return []
  const q = query.toLowerCase()
  return searchResults.filter(
    r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.alias.toLowerCase().includes(q),
  )
}

function groupResults(results: SearchResult[]): GroupedResults {
  return {
    document: results.filter(r => r.category === 'document'),
    service:  results.filter(r => r.category === 'service'),
    action:   results.filter(r => r.category === 'action'),
    section:  results.filter(r => r.category === 'section'),
  }
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  margin-bottom: 0.375rem;
`

const PageSubtitle = styled.p`
  font-size: 0.9375rem;
  color: #4b5563;
  margin-bottom: 1.25rem;
`

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

const FilterChip = styled.button<{ $active: boolean; $compact?: boolean }>`
  padding: ${({ $compact }) => ($compact ? '0.2rem 0.625rem' : '0.3rem 0.875rem')};
  border: 1px solid ${({ $active }) => ($active ? '#a5b4fc' : '#e5e7eb')};
  border-radius: 20px;
  background: ${({ $active }) => ($active ? '#eef2ff' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#4338ca' : '#374151')};
  font-size: ${({ $compact }) => ($compact ? '0.8125rem' : '0.875rem')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  &:hover {
    background: ${({ $active }) => ($active ? '#eef2ff' : '#f3f4f6')};
    border-color: ${({ $active }) => ($active ? '#a5b4fc' : '#d1d5db')};
  }
`

const SectionLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.625rem;
  margin-top: 1.25rem;
  &:first-child { margin-top: 0; }
`

const EmptyBox = styled.div`
  margin-top: 2rem;
`

const SuggestionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`

const SuggestionChip = styled.button`
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 0.3rem 0.875rem;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s, border-color 0.12s;
  &:hover { background: #e0e7ff; border-color: #a5b4fc; color: #3730a3; }
`

// ─── Basic mode ───────────────────────────────────────────────────────────────

const BasicWrapper = styled.div`
  max-width: 680px;
`

const BasicResultGroup = styled.div`
  margin-bottom: 1.5rem;
`

const BasicResultCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.125rem 1.25rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`

const BasicResultBody = styled.div`
  flex: 1;
`

const BasicResultTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`

const BasicResultDesc = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
`

// ─── Standard mode ────────────────────────────────────────────────────────────

const StandardWrapper = styled.div`
  max-width: 720px;
`

const StandardResultsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
`

const StandardResultRow = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
`

const StandardResultTitle = styled.div`
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
`

const StandardResultMeta = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
  flex: 1;
`

// ─── Expert mode ──────────────────────────────────────────────────────────────

const ExpertWrapper = styled.div`
  max-width: 800px;
`

const ExpertHint = styled.div`
  font-size: 0.8125rem;
  color: #9ca3af;
  margin-bottom: 1rem;
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
`

const ExpertTable = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
`

const ExpertTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 100px 80px;
  gap: 0.75rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #e5e7eb;
`

const ExpertTableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 100px 80px;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid #f8fafc;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.1s;
  &:hover { background: #f8fafc; }
  &:last-child { border-bottom: none; }
`

const ExpertCell = styled.div<{ $muted?: boolean; $small?: boolean }>`
  font-size: ${({ $small }) => ($small ? '0.75rem' : '0.8125rem')};
  color: ${({ $muted }) => ($muted ? '#6b7280' : '#1a1a1a')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

// ─── Root ─────────────────────────────────────────────────────────────────────

export function SearchScreen() {
  const { mode } = useUserMode()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { openObject } = useOpenObjects()

  const suggestions = searchSuggestions[mode]

  const results = useMemo(() => filterResults(query), [query])
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  useEffect(() => { setActiveFilter('all') }, [query])

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

  const filteredResults = useMemo(
    () => activeFilter === 'all' ? results : results.filter(r => r.category === activeFilter),
    [results, activeFilter],
  )

  const grouped = useMemo(() => groupResults(filteredResults), [filteredResults])

  function handleOpen(result: SearchResult) {
    const route = result.route ?? '/main'
    navigate(route, { state: { pendingToast: `Открыто: ${result.title}` } })
  }

  // ── No query ────────────────────────────────────────────────────────────────
  if (!query) {
    return (
      <div style={{ maxWidth: 680 }}>
        <PageTitle>Результаты поиска</PageTitle>
        <PageSubtitle>Введите запрос в строку поиска выше</PageSubtitle>
      </div>
    )
  }

  const subtitle = `По запросу «${query}» найдено ${results.length} результатов.`

  // ── Basic ────────────────────────────────────────────────────────────────────
  if (mode === 'basic') {
    return (
      <BasicWrapper>
        <PageTitle>Результаты поиска</PageTitle>
        <PageSubtitle>{subtitle}</PageSubtitle>

        <FiltersRow>
          {FILTERS_BASIC.map(f => (
            <FilterChip
              key={f.key}
              $active={activeFilter === f.key}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </FilterChip>
          ))}
        </FiltersRow>

        {filteredResults.length === 0 ? (
          <EmptyBox>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              Ничего не нашлось
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
              Попробуйте:
            </div>
            <SuggestionsRow>
              {suggestions.slice(0, 3).map(s => (
                <SuggestionChip key={s} onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}>{s}</SuggestionChip>
              ))}
            </SuggestionsRow>
          </EmptyBox>
        ) : (
          <div>
            {ALL_CATEGORIES.map(cat => {
              const items = grouped[cat]
              if (items.length === 0) return null
              return (
                <BasicResultGroup key={cat}>
                  <SectionLabel>{CATEGORY_LABELS[cat]}</SectionLabel>
                  {items.map(r => (
                    <BasicResultCard key={r.id}>
                      <BasicResultBody>
                        <BasicResultTitle>{r.title}</BasicResultTitle>
                        <BasicResultDesc>{r.description}</BasicResultDesc>
                      </BasicResultBody>
                      <Button size="s" view="secondary" text="Открыть" onClick={() => handleOpen(r)} />
                    </BasicResultCard>
                  ))}
                </BasicResultGroup>
              )
            })}
          </div>
        )}
      </BasicWrapper>
    )
  }

  // ── Standard ─────────────────────────────────────────────────────────────────
  if (mode === 'standard') {
    return (
      <StandardWrapper>
        <PageTitle>Результаты поиска</PageTitle>
        <PageSubtitle>{subtitle}</PageSubtitle>

        <FiltersRow>
          {FILTERS_STANDARD.map(f => (
            <FilterChip
              key={f.key}
              $active={activeFilter === f.key}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </FilterChip>
          ))}
        </FiltersRow>

        {filteredResults.length === 0 ? (
          <EmptyBox>
            <div style={{ fontSize: '0.9375rem', color: '#6b7280' }}>По запросу ничего не найдено</div>
          </EmptyBox>
        ) : (
          <div>
            {ALL_CATEGORIES.map(cat => {
              const items = grouped[cat]
              if (items.length === 0) return null
              return (
                <div key={cat}>
                  <SectionLabel>{CATEGORY_LABELS[cat]}</SectionLabel>
                  <StandardResultsGroup>
                    {items.map(r => (
                      <StandardResultRow key={r.id}>
                        <StandardResultTitle>{r.title}</StandardResultTitle>
                        <StandardResultMeta>{r.shortDesc}</StandardResultMeta>
                        <Button size="xs" view="secondary" text="Открыть" onClick={() => handleOpen(r)} />
                      </StandardResultRow>
                    ))}
                  </StandardResultsGroup>
                </div>
              )
            })}
          </div>
        )}
      </StandardWrapper>
    )
  }

  // ── Expert ───────────────────────────────────────────────────────────────────
  return (
    <ExpertWrapper>
      <PageTitle>Результаты поиска</PageTitle>
      <PageSubtitle>{subtitle}</PageSubtitle>

      <FiltersRow>
        {FILTERS_EXPERT.map(f => (
          <FilterChip
            key={f.key}
            $active={activeFilter === f.key}
            $compact
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </FilterChip>
        ))}
      </FiltersRow>

      <ExpertHint>↑↓ выбор результата · Enter открыть · Esc вернуться</ExpertHint>

      {filteredResults.length === 0 ? (
        <EmptyBox>
          <div style={{ fontSize: '0.8125rem', color: '#9ca3af', fontFamily: 'SF Mono, Consolas, monospace' }}>
            Не найдено
          </div>
        </EmptyBox>
      ) : (
        <ExpertTable>
          <ExpertTableHeader>
            <span>Название</span>
            <span>Описание</span>
            <span>Тип</span>
            <span></span>
          </ExpertTableHeader>
          {filteredResults.map(r => (
            <ExpertTableRow key={r.id} onClick={() => handleOpen(r)}>
              <ExpertCell>{r.title}</ExpertCell>
              <ExpertCell $muted>{r.shortDesc}</ExpertCell>
              <ExpertCell $muted $small>{CATEGORY_LABELS[r.category]}</ExpertCell>
              <Button size="xs" view="clear" text="Открыть" onClick={e => { e.stopPropagation(); handleOpen(r) }} />
            </ExpertTableRow>
          ))}
        </ExpertTable>
      )}
    </ExpertWrapper>
  )
}
