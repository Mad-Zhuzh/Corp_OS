import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useUserMode } from '../../context/UserModeContext'
import { useOpenObjects, type OpenObject } from '../../context/OpenObjectsContext'
import type { FC } from 'react'
import type { IconProps } from '@salutejs/plasma-icons'
import {
  IconTaskHorizOutline,
  IconEditOutline,
  IconBlankDocOutline,
  IconBlankOutline,
  IconSearch,
  IconClose,
} from '@salutejs/plasma-icons'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<OpenObject['type'], FC<IconProps>> = {
  task:     IconTaskHorizOutline,
  request:  IconEditOutline,
  document: IconBlankDocOutline,
  file:     IconBlankOutline,
  form:     IconEditOutline,
  search:   IconSearch,
}

const MAX_LABEL = 24

function truncate(s: string): string {
  return s.length > MAX_LABEL ? s.slice(0, MAX_LABEL) + '…' : s
}

// ─── Styled components ────────────────────────────────────────────────────────

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  flex-shrink: 0;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`

const BarLabel = styled.span`
  font-size: 0.8125rem;
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
  margin-right: 0.125rem;
`

const Chip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.25rem 0.2rem 0.5rem;
  border: 1px solid ${({ $active }) => ($active ? '#a5b4fc' : '#e5e7eb')};
  border-radius: 20px;
  background: ${({ $active }) => ($active ? '#eef2ff' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#4338ca' : '#374151')};
  font-size: 0.8125rem;
  font-weight: ${({ $active }) => ($active ? '500' : '400')};
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s;
  &:hover {
    background: ${({ $active }) => ($active ? '#eef2ff' : '#f3f4f6')};
    border-color: ${({ $active }) => ($active ? '#a5b4fc' : '#d1d5db')};
  }
`

const ChipLabel = styled.span`
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ChipClose = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  flex-shrink: 0;
  font-family: inherit;
  margin-left: 1px;
  transition: background 0.1s, color 0.1s;
  &:hover { background: rgba(0, 0, 0, 0.08); color: #374151; }
`

const Hint = styled.span`
  font-size: 0.8125rem;
  color: #9ca3af;
  white-space: nowrap;
  margin-left: 0.375rem;
  flex-shrink: 0;
`

// ─── Component ────────────────────────────────────────────────────────────────

export function OpenObjectsBar() {
  const { objects, activeId, closeObject, setActive } = useOpenObjects()
  const { mode } = useUserMode()
  const navigate = useNavigate()
  const [hintDismissed, setHintDismissed] = useState(false)

  if (objects.length < 1) return null

  function handleChipClick(obj: OpenObject) {
    setActive(obj.id)
    navigate(obj.route)
    if (!hintDismissed) setHintDismissed(true)
  }

  function handleClose(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    closeObject(id)
  }

  const showHint = mode === 'basic' && !hintDismissed

  return (
    <Bar>
      {mode === 'basic' && <BarLabel>В работе:</BarLabel>}
      {objects.map(obj => {
        const TypeIcon = TYPE_ICONS[obj.type]
        const label = truncate(obj.label)
        const isTruncated = obj.label.length > MAX_LABEL
        const isActive = obj.id === activeId

        return (
          <Chip
            key={obj.id}
            $active={isActive}
            onClick={() => handleChipClick(obj)}
            title={isTruncated ? obj.fullLabel : undefined}
          >
            <TypeIcon size="xs" color="currentColor" />
            <ChipLabel>{label}</ChipLabel>
            <ChipClose
              onClick={e => handleClose(e, obj.id)}
              title="Закрыть"
            >
              <IconClose size="xs" color="currentColor" />
            </ChipClose>
          </Chip>
        )
      })}
      {showHint && (
        <Hint>Можно вернуться к предыдущей задаче здесь</Hint>
      )}
    </Bar>
  )
}
