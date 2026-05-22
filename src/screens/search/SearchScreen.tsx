import { useState, useMemo } from 'react'
import type { ReactElement } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserMode, type UserMode } from '../../context/UserModeContext'
import {
  searchResults,
  searchSuggestions,
  type SearchResult,
  type SearchCategory,
} from '../../data/mockData'

// ─── Types ────────────────────────────────────────────────────────────────────

type ScreenState = 'empty' | 'typing' | 'results' | 'no-results'

type GroupedResults = Record<SearchCategory, SearchResult[]>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  document: 'Документы',
  service: 'Сервисы',
  action: 'Действия',
}

const CATEGORIES: SearchCategory[] = ['document', 'service', 'action']

function filterResults(query: string): SearchResult[] {
  if (query.length < 2) return []
  const q = query.toLowerCase()
  return searchResults.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.alias.toLowerCase().includes(q),
  )
}

function groupResults(results: SearchResult[]): GroupedResults {
  return {
    document: results.filter((r) => r.category === 'document'),
    service: results.filter((r) => r.category === 'service'),
    action: results.filter((r) => r.category === 'action'),
  }
}

function deriveState(query: string, results: SearchResult[]): ScreenState {
  if (query.length === 0) return 'empty'
  if (query.length === 1) return 'typing'
  return results.length > 0 ? 'results' : 'no-results'
}

// ─── Shared view props ────────────────────────────────────────────────────────

interface SearchViewProps {
  query: string
  setQuery: (q: string) => void
  screenState: ScreenState
  grouped: GroupedResults
  suggestions: string[]
  onOpen: (result: SearchResult) => void
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const PageTitle = styled.h1<{ $compact?: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '1.125rem' : '1.5rem')};
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

const SectionLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.625rem;
  margin-top: 1.25rem;

  &:first-child {
    margin-top: 0;
  }
`

const SuggestionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
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
  transition: background 0.12s ease, border-color 0.12s ease;

  &:hover {
    background: #e0e7ff;
    border-color: #a5b4fc;
    color: #3730a3;
  }
`

// ─── Basic mode ───────────────────────────────────────────────────────────────

const BasicWrapper = styled.div`
  max-width: 680px;
`

// TODO: заменить на TextField из @salutejs/plasma-web
const BasicInput = styled.input`
  width: 100%;
  height: 56px;
  padding: 0 1.25rem;
  font-size: 1.125rem;
  font-family: inherit;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  color: #1a1a1a;
  outline: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
  }
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

const BasicResultLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.3rem;
`

const BasicResultDesc = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
`

const EmptyStateBox = styled.div`
  margin-top: 2.5rem;
  text-align: center;
  color: #6b7280;
`

const EmptyTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`

const EmptyDesc = styled.div`
  font-size: 0.875rem;
  line-height: 1.55;
  margin-bottom: 1.25rem;
`

const TypingHint = styled.div`
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
`

function BasicSearchView({ query, setQuery, screenState, grouped, suggestions, onOpen }: SearchViewProps) {
  return (
    <BasicWrapper>
      <PageTitle>Что вы хотите найти?</PageTitle>
      <PageSubtitle>Можно написать обычными словами, например: «заявка на отпуск»</PageSubtitle>

      <BasicInput
        placeholder="Начните вводить запрос..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {screenState === 'empty' && (
        <>
          <SectionLabel style={{ marginTop: '1.25rem' }}>Примеры запросов</SectionLabel>
          <SuggestionsRow>
            {suggestions.map((s) => (
              <SuggestionChip key={s} onClick={() => setQuery(s)}>{s}</SuggestionChip>
            ))}
          </SuggestionsRow>
        </>
      )}

      {screenState === 'typing' && (
        <TypingHint>Продолжайте вводить — результаты появятся после двух символов</TypingHint>
      )}

      {screenState === 'results' && (
        <div style={{ marginTop: '1.5rem' }}>
          {CATEGORIES.map((cat) => {
            const items = grouped[cat]
            if (items.length === 0) return null
            return (
              <BasicResultGroup key={cat}>
                <SectionLabel style={{ marginTop: 0 }}>{CATEGORY_LABELS[cat]}</SectionLabel>
                {items.map((r) => (
                  <BasicResultCard key={r.id}>
                    <BasicResultBody>
                      <BasicResultLabel>Что это</BasicResultLabel>
                      <BasicResultTitle>{r.title}</BasicResultTitle>
                      <BasicResultDesc>{r.description}</BasicResultDesc>
                    </BasicResultBody>
                    <Button
                      size="s"
                      view="secondary"
                      text="Открыть"
                      onClick={() => onOpen(r)}
                    />
                  </BasicResultCard>
                ))}
              </BasicResultGroup>
            )
          })}
        </div>
      )}

      {screenState === 'no-results' && (
        <EmptyStateBox>
          <EmptyTitle>Ничего не найдено</EmptyTitle>
          <EmptyDesc>
            Попробуйте написать проще или выберите раздел «Помощь»
          </EmptyDesc>
          <Button view="primary" size="m" text="Открыть помощь" onClick={() => setQuery('')} />
        </EmptyStateBox>
      )}
    </BasicWrapper>
  )
}

// ─── Standard mode ────────────────────────────────────────────────────────────

const StandardWrapper = styled.div`
  max-width: 720px;
`

// TODO: заменить на TextField из @salutejs/plasma-web
const StandardInput = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 0.875rem;
  font-size: 0.9375rem;
  font-family: inherit;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #a5b4fc;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`

const StandardResultsGrid = styled.div`
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

function StandardSearchView({ query, setQuery, screenState, grouped, suggestions, onOpen }: SearchViewProps) {
  return (
    <StandardWrapper>
      <PageTitle>Глобальный поиск</PageTitle>

      <StandardInput
        placeholder="Введите запрос..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {screenState === 'empty' && (
        <SuggestionsRow>
          {suggestions.map((s) => (
            <SuggestionChip key={s} onClick={() => setQuery(s)}>{s}</SuggestionChip>
          ))}
        </SuggestionsRow>
      )}

      {screenState === 'typing' && (
        <SuggestionsRow>
          {suggestions.map((s) => (
            <SuggestionChip key={s} onClick={() => setQuery(s)}>{s}</SuggestionChip>
          ))}
        </SuggestionsRow>
      )}

      {screenState === 'results' && (
        <div style={{ marginTop: '1.25rem' }}>
          {CATEGORIES.map((cat) => {
            const items = grouped[cat]
            if (items.length === 0) return null
            return (
              <div key={cat}>
                <SectionLabel>{CATEGORY_LABELS[cat]}</SectionLabel>
                <StandardResultsGrid>
                  {items.map((r) => (
                    <StandardResultRow key={r.id}>
                      <StandardResultTitle>{r.title}</StandardResultTitle>
                      <StandardResultMeta>{r.shortDesc}</StandardResultMeta>
                      <Button size="xs" view="secondary" text="Открыть" onClick={() => onOpen(r)} />
                    </StandardResultRow>
                  ))}
                </StandardResultsGrid>
              </div>
            )
          })}
        </div>
      )}

      {screenState === 'no-results' && (
        <EmptyStateBox style={{ textAlign: 'left', marginTop: '1.5rem' }}>
          <EmptyTitle>Ничего не найдено по запросу «{query}»</EmptyTitle>
          <EmptyDesc>Попробуйте изменить запрос или выбрать пример ниже</EmptyDesc>
          <SuggestionsRow>
            {suggestions.map((s) => (
              <SuggestionChip key={s} onClick={() => setQuery(s)}>{s}</SuggestionChip>
            ))}
          </SuggestionsRow>
        </EmptyStateBox>
      )}
    </StandardWrapper>
  )
}

// ─── Expert mode ──────────────────────────────────────────────────────────────

const ExpertWrapper = styled.div`
  max-width: 800px;
`

const ExpertInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 0.875rem;
  margin-bottom: 0.75rem;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
  }
`

const ExpertPrompt = styled.span`
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 600;
  user-select: none;
`

// TODO: заменить на TextField из @salutejs/plasma-web
const ExpertInput = styled.input`
  flex: 1;
  height: 38px;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  font-size: 0.875rem;
  color: #1a1a1a;

  &::placeholder {
    color: #9ca3af;
  }
`

const ExpertSuggestions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const ExpertCmd = styled.button`
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  font-size: 0.75rem;
  color: #6366f1;
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background: #eef2ff;
    border-color: #a5b4fc;
  }
`

const ExpertTable = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
`

const ExpertTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 80px 60px;
  gap: 0.75rem;
  padding: 0.3rem 0.5rem 0.3rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #f1f5f9;
`

const ExpertTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 80px 60px;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid #f8fafc;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.1s ease;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`

const ExpertRowTitle = styled.div`
  font-size: 0.8125rem;
  color: #1a1a1a;
`

const ExpertRowMeta = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
`

const ExpertRowAlias = styled.div`
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  font-size: 0.75rem;
  color: #6366f1;
`

const ExpertRowCat = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`

const ExpertNoResults = styled.div`
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  font-size: 0.8125rem;
  color: #9ca3af;
  margin-top: 1rem;
`

function ExpertSearchView({ query, setQuery, screenState, grouped, suggestions, onOpen }: SearchViewProps) {
  const allResults = CATEGORIES.flatMap((cat) => grouped[cat])

  return (
    <ExpertWrapper>
      <PageTitle $compact>Поиск / команда</PageTitle>

      <ExpertInputRow>
        <ExpertPrompt>&gt;</ExpertPrompt>
        <ExpertInput
          placeholder="команда или поисковый запрос..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </ExpertInputRow>

      {(screenState === 'empty' || screenState === 'typing') && (
        <ExpertSuggestions>
          {suggestions.map((s) => (
            <ExpertCmd key={s} onClick={() => setQuery(s)}>/{s}</ExpertCmd>
          ))}
        </ExpertSuggestions>
      )}

      {screenState === 'results' && (
        <ExpertTable>
          <ExpertTableHeader>
            <span>Название</span>
            <span>Описание</span>
            <span>Команда</span>
            <span>Тип</span>
          </ExpertTableHeader>
          {allResults.map((r) => (
            <ExpertTableRow key={r.id} onClick={() => onOpen(r)}>
              <ExpertRowTitle>{r.title}</ExpertRowTitle>
              <ExpertRowMeta>{r.shortDesc}</ExpertRowMeta>
              <ExpertRowAlias>{r.alias}</ExpertRowAlias>
              <ExpertRowCat>{CATEGORY_LABELS[r.category]}</ExpertRowCat>
            </ExpertTableRow>
          ))}
        </ExpertTable>
      )}

      {screenState === 'no-results' && (
        <ExpertNoResults>// нет результатов для «{query}»</ExpertNoResults>
      )}
    </ExpertWrapper>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const VIEW_MAP: Record<UserMode, (props: SearchViewProps) => ReactElement> = {
  basic: BasicSearchView,
  standard: StandardSearchView,
  expert: ExpertSearchView,
}

export function SearchScreen() {
  const { mode } = useUserMode()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const results = useMemo(() => filterResults(query), [query])
  const grouped = useMemo(() => groupResults(results), [results])
  const screenState = useMemo(() => deriveState(query, results), [query, results])
  const suggestions = searchSuggestions[mode]

  const handleOpen = (result: SearchResult) => {
    if (result.route) navigate(result.route)
  }

  const View = VIEW_MAP[mode]

  return (
    <View
      query={query}
      setQuery={setQuery}
      screenState={screenState}
      grouped={grouped}
      suggestions={suggestions}
      onOpen={handleOpen}
    />
  )
}
