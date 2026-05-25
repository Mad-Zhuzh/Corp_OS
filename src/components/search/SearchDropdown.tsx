import styled from 'styled-components'
import { useUserMode } from '../../context/UserModeContext'
import {
  SEARCH_DOC,
  EXPERT_OPERATORS,
  DD_RECENT,
  DD_EXAMPLES_BASIC,
  DD_ACTIONS,
  isSearchMatch,
  isExpertMatch,
  isOperatorPrefix,
  getFileResults,
  type MockFile,
} from '../../data/searchMockData'
import type { SearchResult } from '../../data/mockData'

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  pdf:  { bg: '#fee2e2', color: '#b91c1c' },
  docx: { bg: '#dbeafe', color: '#1d4ed8' },
  xlsx: { bg: '#dcfce7', color: '#15803d' },
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

const DDHint = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
  padding: 0.5rem 0.875rem 0.25rem;
  font-style: italic;
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
  padding: 0.875rem;
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

// ─── Basic: large card suggestion ─────────────────────────────────────────────

const DDBasicCard = styled.div`
  margin: 0.5rem 0.75rem;
  background: #f5f3ff;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  padding: 0.875rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
`

const DDBasicCardIcon = styled.div`
  width: 36px;
  height: 36px;
  background: #fee2e2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #b91c1c;
  flex-shrink: 0;
`

const DDBasicCardBody = styled.div`
  flex: 1;
  min-width: 0;
`

const DDBasicCardTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.125rem;
`

const DDBasicCardMeta = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
  margin-bottom: 0.625rem;
`

const DDBasicCardBtn = styled.button`
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s;
  &:hover { background: #4338ca; }
`

// ─── Standard: compact row ────────────────────────────────────────────────────

const DDRowBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f8f9fa; }
`

const DDRowIcon = styled.div`
  width: 24px;
  height: 24px;
  background: #fee2e2;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5625rem;
  font-weight: 700;
  color: #b91c1c;
  flex-shrink: 0;
`

const DDRowTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a1a;
  flex: 1;
`

const DDRowMeta = styled.span`
  font-size: 0.8125rem;
  color: #9ca3af;
  white-space: nowrap;
`

// ─── Expert: operator list ────────────────────────────────────────────────────

const DDOpRow = styled.button`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  width: 100%;
  padding: 0.4rem 0.875rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f5f3ff; }
`

const DDOpCode = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #4f46e5;
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  white-space: nowrap;
  width: 80px;
  flex-shrink: 0;
`

const DDOpDesc = styled.span`
  font-size: 0.8125rem;
  color: #6b7280;
`

const DDExpertRow = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: #f8f9fa; }
`

const DDExpertTitle = styled.span`
  font-size: 0.8125rem;
  color: #1a1a1a;
  flex: 1;
`

const DDExpertMeta = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
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

// ─── File result row (shared) ─────────────────────────────────────────────────

function FileRow({ file, onSelect }: { file: MockFile; onSelect: () => void }) {
  const s = TYPE_STYLE[file.type] ?? TYPE_STYLE.pdf
  return (
    <DDRowBtn onClick={onSelect}>
      <DDRowIcon style={{ background: s.bg, color: s.color }}>{file.type.toUpperCase()}</DDRowIcon>
      <DDRowTitle>{file.name}</DDRowTitle>
      <DDRowMeta>{file.date}</DDRowMeta>
    </DDRowBtn>
  )
}

function ExpertFileRow({ file, onSelect }: { file: MockFile; onSelect: () => void }) {
  const s = TYPE_STYLE[file.type] ?? TYPE_STYLE.pdf
  return (
    <DDExpertRow onClick={onSelect}>
      <DDRowIcon style={{ background: s.bg, color: s.color }}>{file.type.toUpperCase()}</DDRowIcon>
      <DDExpertTitle>{file.name}</DDExpertTitle>
      <DDExpertMeta>{file.date}</DDExpertMeta>
    </DDExpertRow>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SearchDropdownProps {
  query: string
  onQueryChange: (q: string) => void
  onResultSelect: (result: SearchResult) => void
  onAllResults: () => void
  onActionSelect: (nav: string) => void
  onDocOpen?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchDropdown({
  query,
  onQueryChange,
  onAllResults,
  onActionSelect,
  onDocOpen,
}: SearchDropdownProps) {
  const { mode } = useUserMode()
  const hasQuery = query.length > 0
  const recent = DD_RECENT[mode]

  // ── BASIC ──────────────────────────────────────────────────────────────────
  if (mode === 'basic') {
    const matched   = hasQuery && isSearchMatch(query)
    const fileRes   = hasQuery ? getFileResults(query) : []
    const anyResult = matched || fileRes.length > 0
    return (
      <DropdownBox>
        {!hasQuery && (
          <>
            <DDSection>
              <DDLabel>Можно искать обычными словами</DDLabel>
              {DD_EXAMPLES_BASIC.map(ex => (
                <DDRecentBtn key={ex} onClick={() => onQueryChange(ex)}>{ex}</DDRecentBtn>
              ))}
            </DDSection>
            <DDDivider />
            <DDSection>
              <DDLabel>Недавние запросы</DDLabel>
              {recent.map(r => (
                <DDRecentBtn key={r} onClick={() => onQueryChange(r)}>{r}</DDRecentBtn>
              ))}
            </DDSection>
          </>
        )}

        {hasQuery && matched && (
          <>
            <DDHint>Кажется, вы ищете документ о компенсациях</DDHint>
            <DDBasicCard>
              <DDBasicCardIcon>PDF</DDBasicCardIcon>
              <DDBasicCardBody>
                <DDBasicCardTitle>{SEARCH_DOC.shortName}</DDBasicCardTitle>
                <DDBasicCardMeta>Документ · страница {SEARCH_DOC.page}</DDBasicCardMeta>
                <DDBasicCardBtn onClick={onDocOpen}>Открыть нужное место</DDBasicCardBtn>
              </DDBasicCardBody>
            </DDBasicCard>
          </>
        )}

        {hasQuery && fileRes.length > 0 && (
          <DDSection>
            {matched && <DDDivider />}
            <DDLabel>Файлы</DDLabel>
            {fileRes.map(f => (
              <FileRow key={f.id} file={f} onSelect={onAllResults} />
            ))}
          </DDSection>
        )}

        {hasQuery && !anyResult && (
          <DDEmpty>Ничего не найдено. Попробуйте написать иначе.</DDEmpty>
        )}

        {hasQuery && (
          <DDAllResultsBtn onClick={onAllResults}>
            <span>Все результаты по запросу «{query}» →</span>
          </DDAllResultsBtn>
        )}
      </DropdownBox>
    )
  }

  // ── STANDARD ───────────────────────────────────────────────────────────────
  if (mode === 'standard') {
    const matched   = hasQuery && isSearchMatch(query)
    const fileRes   = hasQuery ? getFileResults(query) : []
    const anyResult = matched || fileRes.length > 0
    const actions   = DD_ACTIONS.standard
    return (
      <DropdownBox>
        {!hasQuery && (
          <>
            <DDSection>
              <DDLabel>Недавние запросы</DDLabel>
              {recent.map(r => (
                <DDRecentBtn key={r} onClick={() => onQueryChange(r)}>{r}</DDRecentBtn>
              ))}
            </DDSection>
            <DDDivider />
            <DDSection>
              <DDLabel>Быстрые действия</DDLabel>
              {actions.map(a => (
                <DDActionBtn key={a.label} onClick={() => onActionSelect(a.nav)}>{a.label}</DDActionBtn>
              ))}
            </DDSection>
          </>
        )}

        {hasQuery && matched && (
          <DDRowBtn onClick={onAllResults}>
            <DDRowIcon>PDF</DDRowIcon>
            <DDRowTitle>{SEARCH_DOC.shortName}</DDRowTitle>
            <DDRowMeta>страница {SEARCH_DOC.page}</DDRowMeta>
          </DDRowBtn>
        )}

        {hasQuery && fileRes.length > 0 && fileRes.map(f => (
          <FileRow key={f.id} file={f} onSelect={onAllResults} />
        ))}

        {hasQuery && !anyResult && (
          <DDEmpty>Ничего не найдено</DDEmpty>
        )}

        {hasQuery && (
          <DDAllResultsBtn onClick={onAllResults}>
            <span>Все результаты по запросу «{query}» →</span>
          </DDAllResultsBtn>
        )}
      </DropdownBox>
    )
  }

  // ── EXPERT ─────────────────────────────────────────────────────────────────
  const isOpPrefix = hasQuery && isOperatorPrefix(query)
  const matched    = hasQuery && isExpertMatch(query)
  const fileRes    = hasQuery && !isOpPrefix ? getFileResults(query) : []
  const anyResult  = matched || fileRes.length > 0
  const actions    = DD_ACTIONS.expert

  return (
    <DropdownBox>
      {!hasQuery && (
        <>
          <DDSection>
            <DDLabel>Недавние</DDLabel>
            {recent.map(r => (
              <DDRecentBtn key={r} onClick={() => onQueryChange(r)}>{r}</DDRecentBtn>
            ))}
          </DDSection>
          <DDDivider />
          <DDSection>
            <DDLabel>Действия</DDLabel>
            {actions.map(a => (
              <DDActionBtn key={a.label} onClick={() => onActionSelect(a.nav)}>{a.label}</DDActionBtn>
            ))}
          </DDSection>
        </>
      )}

      {isOpPrefix && (
        <DDSection>
          <DDLabel>Доступные операторы:</DDLabel>
          {EXPERT_OPERATORS.map(o => (
            <DDOpRow key={o.op} onClick={() => onQueryChange(o.op + ' ')}>
              <DDOpCode>{o.op}</DDOpCode>
              <DDOpDesc>{o.desc}</DDOpDesc>
            </DDOpRow>
          ))}
        </DDSection>
      )}

      {hasQuery && !isOpPrefix && matched && (
        <DDExpertRow onClick={onAllResults}>
          <DDRowIcon>PDF</DDRowIcon>
          <DDExpertTitle>{SEARCH_DOC.name}</DDExpertTitle>
          <DDExpertMeta>стр. {SEARCH_DOC.page}</DDExpertMeta>
          <DDEnterBadge>Enter</DDEnterBadge>
        </DDExpertRow>
      )}

      {hasQuery && !isOpPrefix && fileRes.map(f => (
        <ExpertFileRow key={f.id} file={f} onSelect={onAllResults} />
      ))}

      {hasQuery && !isOpPrefix && !anyResult && (
        <DDEmpty>Не найдено</DDEmpty>
      )}

      {hasQuery && !isOpPrefix && (
        <DDAllResultsBtn onClick={onAllResults}>
          <span>Все результаты по запросу «{query}» →</span>
        </DDAllResultsBtn>
      )}
    </DropdownBox>
  )
}
