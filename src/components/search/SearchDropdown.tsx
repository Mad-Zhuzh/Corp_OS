import { useMemo } from 'react'
import styled from 'styled-components'
import { useUserMode } from '../../context/UserModeContext'
import {
  searchResults,
  dropdownData,
  type SearchResult,
} from '../../data/mockData'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAT_LABEL: Record<string, string> = {
  document: 'Документ',
  service:  'Сервис',
  action:   'Действие',
  section:  'Раздел',
}

function getDropdownResults(query: string): SearchResult[] {
  if (query.length < 1) return []
  const q = query.toLowerCase()
  return searchResults
    .filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.alias.toLowerCase().includes(q),
    )
    .slice(0, 5)
}

// ─── Styled components ────────────────────────────────────────────────────────

const DropdownBox = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 400;
  overflow: hidden;
`

const DDSection = styled.div`
  padding: 0.375rem 0;
`

const DDLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.5rem 0.875rem 0.25rem;
`

const DDDivider = styled.div`
  height: 1px;
  background: #f0f2f5;
`

const DDRecentBtn = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f8f9fa; color: #1a1a1a; }
`

const DDActionBtn = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: #4f46e5;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f5f3ff; }
`

const DDEmpty = styled.div`
  padding: 0.875rem 0.875rem;
  font-size: 0.875rem;
  color: #9ca3af;
`

const DDAllResultsBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: #f8f9fa;
  border: none;
  border-top: 1px solid #e2e8f0;
  text-align: left;
  font-size: 0.8125rem;
  color: #6366f1;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #eef2ff; }
`

// Basic: row layout (кликабельная строка)
const DDCardBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f0f2f5;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f8f9fa; }
  &:last-of-type { border-bottom: none; }
`

const DDCardTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
`

const DDCardShortDesc = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
`

// Standard: row layout
const DDRowBtn = styled.button`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f0f2f5;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f8f9fa; }
  &:last-of-type { border-bottom: none; }
`

const DDRowTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a1a;
  flex: 1;
  text-align: left;
`

const DDRowMeta = styled.span`
  font-size: 0.8125rem;
  color: #6b7280;
  white-space: nowrap;
`

// Expert: dense list
const DDExpertBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f0f2f5;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f8f9fa; }
  &:last-of-type { border-bottom: none; }
`

const DDExpertLeft = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
`

const DDExpertTitle = styled.span`
  font-size: 0.8125rem;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const DDExpertType = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
`

const DDEnterBadge = styled.span`
  font-size: 0.6875rem;
  color: #9ca3af;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.1rem 0.375rem;
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  white-space: nowrap;
  flex-shrink: 0;
`

// ─── Props ────────────────────────────────────────────────────────────────────

interface SearchDropdownProps {
  query: string
  onQueryChange: (q: string) => void
  onResultSelect: (result: SearchResult) => void
  onAllResults: () => void
  onActionSelect: (nav: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchDropdown({
  query,
  onQueryChange,
  onResultSelect,
  onAllResults,
  onActionSelect,
}: SearchDropdownProps) {
  const { mode } = useUserMode()
  const data = dropdownData[mode]
  const instantResults = useMemo(() => getDropdownResults(query), [query])
  const hasQuery = query.length > 0

  return (
    <DropdownBox>
      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasQuery && mode === 'basic' && (
        <>
          <DDSection>
            <DDLabel>Можно искать обычными словами</DDLabel>
            {data.examples?.map(ex => (
              <DDRecentBtn key={ex} onClick={() => onQueryChange(ex)}>{ex}</DDRecentBtn>
            ))}
          </DDSection>
          <DDDivider />
          <DDSection>
            <DDLabel>Недавние запросы</DDLabel>
            {data.recent.map(r => (
              <DDRecentBtn key={r} onClick={() => onQueryChange(r)}>{r}</DDRecentBtn>
            ))}
          </DDSection>
        </>
      )}

      {!hasQuery && mode === 'standard' && (
        <>
          <DDSection>
            <DDLabel>Недавние запросы</DDLabel>
            {data.recent.map(r => (
              <DDRecentBtn key={r} onClick={() => onQueryChange(r)}>{r}</DDRecentBtn>
            ))}
          </DDSection>
          {data.actions && (
            <>
              <DDDivider />
              <DDSection>
                <DDLabel>Быстрые действия</DDLabel>
                {data.actions.map(a => (
                  <DDActionBtn key={a.label} onClick={() => onActionSelect(a.nav)}>{a.label}</DDActionBtn>
                ))}
              </DDSection>
            </>
          )}
        </>
      )}

      {!hasQuery && mode === 'expert' && (
        <>
          <DDSection>
            <DDLabel>Недавние</DDLabel>
            {data.recent.map(r => (
              <DDRecentBtn key={r} onClick={() => onQueryChange(r)}>{r}</DDRecentBtn>
            ))}
          </DDSection>
          {data.actions && (
            <>
              <DDDivider />
              <DDSection>
                <DDLabel>Действия</DDLabel>
                {data.actions.map(a => (
                  <DDActionBtn key={a.label} onClick={() => onActionSelect(a.nav)}>{a.label}</DDActionBtn>
                ))}
              </DDSection>
            </>
          )}
        </>
      )}

      {/* ── Instant suggestions ─────────────────────────────────────────── */}
      {hasQuery && instantResults.length > 0 && (
        <>
          {mode === 'basic' && instantResults.map(r => (
            <DDCardBtn key={r.id} onClick={() => onResultSelect(r)}>
              <DDCardTitle>{r.title}</DDCardTitle>
              <DDCardShortDesc>{r.shortDesc}</DDCardShortDesc>
            </DDCardBtn>
          ))}

          {mode === 'standard' && instantResults.map(r => (
            <DDRowBtn key={r.id} onClick={() => onResultSelect(r)}>
              <DDRowTitle>{r.title}</DDRowTitle>
              <DDRowMeta>{CAT_LABEL[r.category]} · {r.shortDesc}</DDRowMeta>
            </DDRowBtn>
          ))}

          {mode === 'expert' && instantResults.map((r, i) => (
            <DDExpertBtn key={r.id} onClick={() => onResultSelect(r)}>
              <DDExpertLeft>
                <DDExpertTitle>{r.title}</DDExpertTitle>
                <DDExpertType>— {CAT_LABEL[r.category]}</DDExpertType>
              </DDExpertLeft>
              {i === 0 && <DDEnterBadge>Enter</DDEnterBadge>}
            </DDExpertBtn>
          ))}
        </>
      )}

      {hasQuery && instantResults.length === 0 && (
        <DDEmpty>Ничего не найдено</DDEmpty>
      )}

      {/* ── All results link ─────────────────────────────────────────────── */}
      {hasQuery && (
        <DDAllResultsBtn onClick={onAllResults}>
          <span>Все результаты по запросу «{query}» →</span>
        </DDAllResultsBtn>
      )}
    </DropdownBox>
  )
}
