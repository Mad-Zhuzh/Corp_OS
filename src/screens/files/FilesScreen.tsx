import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'
import { IconFolderOutline, IconDocumentOutline } from '@salutejs/plasma-icons'
import { useUserMode } from '../../context/UserModeContext'
import { useNavigate } from 'react-router-dom'
import {
  mockFiles,
  FILE_TYPE_LABELS,
  getRootFolders,
  getChildren,
  getAllFilesInFolder,
  getFolderPathString,
  type MockFile,
} from '../../data/filesMockData'

// ─── Shared types ─────────────────────────────────────────────────────────────

type TypeFilter = 'all' | MockFile['type']

// ─── FileTypeTag ──────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<MockFile['type'], { bg: string; fg: string }> = {
  pdf:  { bg: '#fee2e2', fg: '#b91c1c' },
  docx: { bg: '#dbeafe', fg: '#1d4ed8' },
  xlsx: { bg: '#dcfce7', fg: '#15803d' },
}

function FileTypeTag({ type }: { type: MockFile['type'] }) {
  const c = TYPE_COLORS[type]
  return (
    <TypeBadge style={{ background: c.bg, color: c.fg }}>
      {FILE_TYPE_LABELS[type]}
    </TypeBadge>
  )
}

const TypeBadge = styled.span`
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.4;
  white-space: nowrap;
`

// ─── Context menu ─────────────────────────────────────────────────────────────

interface CtxItem { label: string; danger?: boolean }

function CtxMenu({ items, onClose }: { items: CtxItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  return (
    <CtxMenuEl ref={ref}>
      {items.map(item => (
        <CtxMenuItemBtn key={item.label} $danger={!!item.danger}>
          {item.label}
        </CtxMenuItemBtn>
      ))}
    </CtxMenuEl>
  )
}

const CtxMenuEl = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 3px);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 200;
  min-width: 176px;
  overflow: hidden;
`

const CtxMenuItemBtn = styled.button<{ $danger: boolean }>`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.875rem;
  color: ${({ $danger }) => ($danger ? '#dc2626' : '#374151')};
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: ${({ $danger }) => ($danger ? '#fef2f2' : '#f8f9fa')}; }
`

// ─── More button (⋯) ─────────────────────────────────────────────────────────

const MoreWrap = styled.div`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
`

const MoreBtn = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  &:hover { background: #f0f2f5; color: #374151; }
`

// ─── TYPE FILTER TABS (shared) ────────────────────────────────────────────────

const FilterRow = styled.div`
  display: flex;
  gap: 0.25rem;
`

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => ($active ? '#6366f1' : '#e2e8f0')};
  background: ${({ $active }) => ($active ? '#eef2ff' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#6b7280')};
  font-size: 0.8125rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.1s;
  white-space: nowrap;
  &:hover { border-color: #a5b4fc; }
`

const TYPE_FILTERS: TypeFilter[] = ['all', 'pdf', 'docx', 'xlsx']
const TYPE_FILTER_LABEL: Record<TypeFilter, string> = { all: 'Все', pdf: 'PDF', docx: 'DOCX', xlsx: 'XLSX' }

// ─── BASIC ────────────────────────────────────────────────────────────────────

const BASIC_CTX: CtxItem[] = [
  { label: 'Скопировать ссылку' },
  { label: 'Отправить' },
  { label: 'Удалить', danger: true },
]

function BasicFiles() {
  const [showAllFolders, setShowAllFolders] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const navigate = useNavigate()
  const rootFolders = getRootFolders()
  const recentFiles = [...mockFiles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <BasicRoot>

      {/* Hint — visible without scrolling */}
      <BasicHint>
        Если не знаете, где лежит файл — используйте поиск сверху
      </BasicHint>

      {/* Folders */}
      <div>
        <BasicSectionRow>
          <BasicSectionTitle>Папки</BasicSectionTitle>
          <BasicAllFoldersLink onClick={() => setShowAllFolders(v => !v)}>
            {showAllFolders ? 'Скрыть' : 'Все папки →'}
          </BasicAllFoldersLink>
        </BasicSectionRow>

        {showAllFolders ? (
          <BasicFolderTree>
            {rootFolders.map(root => (
              <div key={root.id}>
                <BasicFolderTreeRoot>
                  <IconFolderOutline size="xs" color="#6366f1" />
                  {root.label}
                </BasicFolderTreeRoot>
                {getChildren(root.id).map(sub => (
                  <BasicFolderTreeSub key={sub.id}>
                    <IconFolderOutline size="xs" color="#9ca3af" />
                    {sub.label}
                  </BasicFolderTreeSub>
                ))}
              </div>
            ))}
          </BasicFolderTree>
        ) : (
          <BasicFolderGrid>
            {rootFolders.map(f => (
              <BasicFolderCard key={f.id}>
                <BasicFolderCardIcon>
                  <IconFolderOutline size="m" color="#6366f1" />
                </BasicFolderCardIcon>
                <BasicFolderCardTitle>{f.label}</BasicFolderCardTitle>
                <BasicFolderCardDesc>{f.description}</BasicFolderCardDesc>
              </BasicFolderCard>
            ))}
          </BasicFolderGrid>
        )}
      </div>

      {/* Recent files */}
      <div>
        <BasicSectionTitle>Последние файлы</BasicSectionTitle>
        <BasicFileList>
          {recentFiles.map(file => (
            <BasicFileRow key={file.id}>
              <BasicFileDocIcon>
                <IconDocumentOutline size="s" color="#9ca3af" />
              </BasicFileDocIcon>
              <BasicFileInfo>
                <BasicFileName>{file.name}</BasicFileName>
                <BasicFileMeta>{file.date} · {file.owner} · {file.size}</BasicFileMeta>
              </BasicFileInfo>
              <BasicFileActions>
                <Button view="secondary" size="s" text="Открыть" onClick={() => navigate('/document')} />
                <MoreWrap>
                  <MoreBtn
                    title="Ещё"
                    onClick={() => setOpenMenuId(openMenuId === file.id ? null : file.id)}
                  >
                    ⋯
                  </MoreBtn>
                  {openMenuId === file.id && (
                    <CtxMenu items={BASIC_CTX} onClose={() => setOpenMenuId(null)} />
                  )}
                </MoreWrap>
              </BasicFileActions>
            </BasicFileRow>
          ))}
          {recentFiles.length === 0 && (
            <BasicEmpty>
              Файлы не найдены. Попробуйте выбрать другую папку или изменить запрос.
            </BasicEmpty>
          )}
        </BasicFileList>
      </div>

    </BasicRoot>
  )
}

const BasicRoot = styled.div`
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`

const BasicHint = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  color: #0369a1;
  line-height: 1.5;
`

const BasicSectionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`

const BasicSectionTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
`

const BasicAllFoldersLink = styled.button`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6366f1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.1s;
  &:hover { color: #4338ca; }
`

const BasicFolderGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`

const BasicFolderCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover {
    border-color: #a5b4fc;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  }
`

const BasicFolderCardIcon = styled.div`
  display: flex;
  margin-bottom: 0.625rem;
`

const BasicFolderCardTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.3rem;
`

const BasicFolderCardDesc = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.45;
`

const BasicFolderTree = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
`

const BasicFolderTreeRoot = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
`

const BasicFolderTreeSub = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1.25rem 0.375rem 3.25rem;
  font-size: 0.875rem;
  color: #6b7280;
`

const BasicFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const BasicFileRow = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
`

const BasicFileDocIcon = styled.div`
  display: flex;
  flex-shrink: 0;
`

const BasicFileInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const BasicFileName = styled.div`
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.2rem;
`

const BasicFileMeta = styled.div`
  font-size: 0.8125rem;
  color: #9ca3af;
`

const BasicFileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`

const BasicEmpty = styled.div`
  padding: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #9ca3af;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
`

// ─── STANDARD ─────────────────────────────────────────────────────────────────

const EXPERT_CTX: CtxItem[] = [
  { label: 'Открыть' },
  { label: 'Переименовать' },
  { label: 'Переместить' },
  { label: 'Копировать ссылку' },
  { label: 'Удалить', danger: true },
]

const STD_CTX: CtxItem[] = [
  { label: 'Скопировать ссылку' },
  { label: 'Отправить' },
  { label: 'Переименовать' },
  { label: 'Удалить', danger: true },
]

function StandardFiles() {
  const navigate = useNavigate()
  const rootFolders = getRootFolders()
  const [selectedFolder, setSelectedFolder] = useState<string>('my')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['my']))
  const [treeWide, setTreeWide] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const folderFiles = getAllFilesInFolder(selectedFolder)
  const filtered = folderFiles.filter(f => {
    if (typeFilter !== 'all' && f.type !== typeFilter) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <StdRoot>

      {/* Left: folder tree */}
      <StdTreePanel
        $wide={treeWide}
        onMouseEnter={() => setTreeWide(true)}
        onMouseLeave={() => setTreeWide(false)}
      >
        <StdTreeHeader>Папки</StdTreeHeader>
        {rootFolders.map(root => {
          const isExp = expanded.has(root.id)
          const children = getChildren(root.id)
          const isRootActive = selectedFolder === root.id
          const fileCount = getAllFilesInFolder(root.id).length
          return (
            <div key={root.id}>
              <StdTreeRootRow>
                <StdTreeChevron
                  type="button"
                  onClick={() => toggleExpanded(root.id)}
                  aria-label={isExp ? 'Свернуть' : 'Развернуть'}
                >
                  {isExp ? '▾' : '›'}
                </StdTreeChevron>
                <StdTreeFolderBtn
                  type="button"
                  $active={isRootActive}
                  onClick={() => setSelectedFolder(root.id)}
                >
                  <IconFolderOutline size="xs" color={isRootActive ? '#4f46e5' : '#6b7280'} />
                  <span>{root.label}</span>
                  <StdTreeCount>{fileCount}</StdTreeCount>
                </StdTreeFolderBtn>
              </StdTreeRootRow>
              {isExp && children.map(sub => {
                const isSubActive = selectedFolder === sub.id
                const subCount = getAllFilesInFolder(sub.id).length
                return (
                  <StdTreeSubBtn
                    key={sub.id}
                    type="button"
                    $active={isSubActive}
                    onClick={() => setSelectedFolder(sub.id)}
                  >
                    <IconFolderOutline size="xs" color={isSubActive ? '#4f46e5' : '#9ca3af'} />
                    <span>{sub.label}</span>
                    <StdTreeCount>{subCount}</StdTreeCount>
                  </StdTreeSubBtn>
                )
              })}
            </div>
          )
        })}
      </StdTreePanel>

      {/* Right: files */}
      <StdMain>
        <StdTopBar>
          <StdSearchInput
            placeholder="Найти в текущей папке…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FilterRow>
            {TYPE_FILTERS.map(f => (
              <FilterTab key={f} $active={typeFilter === f} onClick={() => setTypeFilter(f)}>
                {TYPE_FILTER_LABEL[f]}
              </FilterTab>
            ))}
          </FilterRow>
        </StdTopBar>

        <StdTable>
          <StdTableHead>
            <StdHCell>Название</StdHCell>
            <StdHCell>Тип</StdHCell>
            <StdHCell>Дата</StdHCell>
            <StdHCell>Владелец</StdHCell>
            <StdHCell></StdHCell>
          </StdTableHead>
          {filtered.length === 0 ? (
            <StdEmpty>Файлы не найдены</StdEmpty>
          ) : filtered.map(file => (
            <StdRow key={file.id}>
              <StdFileNameCell>
                <IconDocumentOutline size="xs" color="#9ca3af" />
                <span title={file.name}>{file.name}</span>
              </StdFileNameCell>
              <StdCell><FileTypeTag type={file.type} /></StdCell>
              <StdCell>{file.date}</StdCell>
              <StdCell>{file.owner}</StdCell>
              <StdActionsCell>
                <Button view="secondary" size="s" text="Открыть" onClick={() => navigate('/document')} />
                <MoreWrap>
                  <MoreBtn
                    type="button"
                    title="Действия"
                    onClick={() => setOpenMenuId(openMenuId === file.id ? null : file.id)}
                  >
                    ⋯
                  </MoreBtn>
                  {openMenuId === file.id && (
                    <CtxMenu items={STD_CTX} onClose={() => setOpenMenuId(null)} />
                  )}
                </MoreWrap>
              </StdActionsCell>
            </StdRow>
          ))}
        </StdTable>
      </StdMain>

    </StdRoot>
  )
}

const StdRoot = styled.div`
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  min-height: 480px;
`

const StdTreePanel = styled.aside<{ $wide: boolean }>`
  width: ${({ $wide }) => ($wide ? '268px' : '196px')};
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: width 0.2s ease;
`

const StdTreeHeader = styled.div`
  padding: 0.625rem 1rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`

const StdTreeRootRow = styled.div`
  display: flex;
  align-items: center;
`

const StdTreeChevron = styled.button`
  width: 28px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.1s;
  &:hover { color: #374151; }
`

const StdTreeFolderBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem 0.5rem 0;
  border: none;
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#374151')};
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  span:first-of-type { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &:hover { background: ${({ $active }) => ($active ? '#eef2ff' : '#f8f9fa')}; }
`

const StdTreeSubBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.4rem 0.75rem 0.4rem 2.75rem;
  border: none;
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#6b7280')};
  font-size: 0.8125rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  span:first-of-type { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &:hover { background: ${({ $active }) => ($active ? '#eef2ff' : '#f8f9fa')}; }
`

const StdTreeCount = styled.span`
  margin-left: auto;
  font-size: 0.75rem;
  color: #9ca3af;
  flex-shrink: 0;
  padding-right: 0.25rem;
`

const StdMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const StdTopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const StdSearchInput = styled.input`
  flex: 1;
  height: 34px;
  padding: 0 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8f9fa;
  font-size: 0.875rem;
  color: #1a1a1a;
  outline: none;
  &::placeholder { color: #9ca3af; }
  &:focus { border-color: #a5b4fc; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
`

const StdTable = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`

const StdTableHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 68px 96px 120px 112px;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 11px 11px 0 0;
`

const StdHCell = styled.span`
  font-size: 0.6875rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const StdRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 68px 96px 120px 112px;
  padding: 0.625rem 1rem;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafafa; }
`

const StdFileNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  padding-right: 0.5rem;
  span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.875rem; color: #1a1a1a; }
`

const StdCell = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
`

const StdActionsCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  justify-content: flex-end;
`

const StdEmpty = styled.div`
  padding: 2.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #9ca3af;
`

// ─── EXPERT ───────────────────────────────────────────────────────────────────

function ExpertFiles() {
  const navigate = useNavigate()
  const rootFolders = getRootFolders()
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(rootFolders.map(f => f.id)))
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const baseFiles = selectedFolder ? getAllFilesInFolder(selectedFolder) : mockFiles
  const filtered = baseFiles.filter(f => {
    if (typeFilter !== 'all' && f.type !== typeFilter) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <ExpRoot>

      {/* Left: compact tree */}
      <ExpTree>
        <ExpTreeHeader>Файловая система</ExpTreeHeader>
        <ExpAllFilesBtn
          type="button"
          $active={selectedFolder === null}
          onClick={() => setSelectedFolder(null)}
        >
          / все файлы
          <ExpTreeCount>{mockFiles.length}</ExpTreeCount>
        </ExpAllFilesBtn>
        {rootFolders.map(root => {
          const isExp = expanded.has(root.id)
          const children = getChildren(root.id)
          const isActive = selectedFolder === root.id
          const count = getAllFilesInFolder(root.id).length
          return (
            <div key={root.id}>
              <ExpTreeRootRow>
                <ExpTreeToggle
                  type="button"
                  onClick={() => toggleExpanded(root.id)}
                >
                  {isExp ? '▾' : '›'}
                </ExpTreeToggle>
                <ExpTreeFolderBtn
                  type="button"
                  $active={isActive}
                  onClick={() => setSelectedFolder(root.id)}
                >
                  <IconFolderOutline size="xs" color={isActive ? '#4f46e5' : '#6b7280'} />
                  <ExpTreeFolderLabel>{root.label}</ExpTreeFolderLabel>
                  <ExpTreeCount>{count}</ExpTreeCount>
                </ExpTreeFolderBtn>
              </ExpTreeRootRow>
              {isExp && children.map(sub => {
                const isSubActive = selectedFolder === sub.id
                const subCount = getAllFilesInFolder(sub.id).length
                return (
                  <ExpTreeSubRow
                    key={sub.id}
                    type="button"
                    $active={isSubActive}
                    onClick={() => setSelectedFolder(sub.id)}
                  >
                    <IconFolderOutline size="xs" color={isSubActive ? '#4f46e5' : '#9ca3af'} />
                    <ExpTreeFolderLabel>{sub.label}</ExpTreeFolderLabel>
                    <ExpTreeCount>{subCount}</ExpTreeCount>
                  </ExpTreeSubRow>
                )
              })}
            </div>
          )
        })}
      </ExpTree>

      {/* Right: compact table */}
      <ExpMain>
        <ExpTopBar>
          <ExpSearchInput
            placeholder="Найти в текущей папке..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <ExpSep />
          {TYPE_FILTERS.map(f => (
            <ExpFilterBtn key={f} $active={typeFilter === f} onClick={() => setTypeFilter(f)}>
              {TYPE_FILTER_LABEL[f]}
            </ExpFilterBtn>
          ))}
          <ExpSep />
          <ExpFileCount>{filtered.length} файлов</ExpFileCount>
        </ExpTopBar>

        <ExpTable>
          <ExpTableHead>
            <ExpHCell>Название</ExpHCell>
            <ExpHCell>Путь</ExpHCell>
            <ExpHCell>Тип</ExpHCell>
            <ExpHCell>Владелец</ExpHCell>
            <ExpHCell>Обновлено</ExpHCell>
            <ExpHCell></ExpHCell>
          </ExpTableHead>
          {filtered.length === 0 ? (
            <ExpEmpty>No files</ExpEmpty>
          ) : filtered.map(file => (
            <ExpRow key={file.id} onDoubleClick={() => navigate('/document')} title="Двойной клик — открыть файл">
              <ExpFileNameCell>
                <IconDocumentOutline size="xs" color="#9ca3af" />
                <span title={file.name}>{file.name}</span>
              </ExpFileNameCell>
              <ExpPathCell title={getFolderPathString(file.folderId)}>
                {getFolderPathString(file.folderId)}
              </ExpPathCell>
              <ExpCell><FileTypeTag type={file.type} /></ExpCell>
              <ExpCell>{file.owner}</ExpCell>
              <ExpCell>{file.date}</ExpCell>
              <ExpActionsCell>
                <MoreWrap>
                  <MoreBtn
                    type="button"
                    title="Действия"
                    onClick={() => setOpenMenuId(openMenuId === file.id ? null : file.id)}
                  >
                    ⋯
                  </MoreBtn>
                  {openMenuId === file.id && (
                    <CtxMenu items={EXPERT_CTX} onClose={() => setOpenMenuId(null)} />
                  )}
                </MoreWrap>
              </ExpActionsCell>
            </ExpRow>
          ))}
        </ExpTable>
      </ExpMain>

    </ExpRoot>
  )
}

const ExpRoot = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  min-height: 480px;
`

const ExpTree = styled.aside`
  width: 196px;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`

const ExpTreeHeader = styled.div`
  padding: 0.5rem 0.875rem;
  font-size: 0.625rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`

const ExpAllFilesBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.375rem 0.875rem;
  border: none;
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#6b7280')};
  font-size: 0.8125rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.1s;
  &:hover { background: ${({ $active }) => ($active ? '#eef2ff' : '#f8f9fa')}; }
`

const ExpTreeRootRow = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f9fafb;
`

const ExpTreeToggle = styled.button`
  width: 22px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.1s;
  &:hover { color: #374151; }
`

const ExpTreeFolderBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem 0.375rem 0;
  border: none;
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#374151')};
  font-size: 0.8125rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: ${({ $active }) => ($active ? '#eef2ff' : '#f8f9fa')}; }
`

const ExpTreeSubRow = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.3rem 0.5rem 0.3rem 2.625rem;
  border: none;
  border-bottom: 1px solid #f9fafb;
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#6b7280')};
  font-size: 0.75rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: ${({ $active }) => ($active ? '#eef2ff' : '#f8f9fa')}; }
`

const ExpTreeFolderLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ExpTreeCount = styled.span`
  margin-left: auto;
  font-size: 0.6875rem;
  color: #9ca3af;
  flex-shrink: 0;
  padding-right: 0.25rem;
`

const ExpMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

const ExpTopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`

const ExpSearchInput = styled.input`
  width: 200px;
  height: 28px;
  padding: 0 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8f9fa;
  font-size: 0.8125rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: #1a1a1a;
  outline: none;
  &::placeholder { color: #9ca3af; }
  &:focus { border-color: #a5b4fc; background: #fff; }
`

const ExpSep = styled.div`
  width: 1px;
  height: 16px;
  background: #e2e8f0;
  flex-shrink: 0;
  margin: 0 0.1rem;
`

const ExpFilterBtn = styled.button<{ $active: boolean }>`
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  border: 1px solid ${({ $active }) => ($active ? '#6366f1' : '#e2e8f0')};
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#6b7280')};
  font-size: 0.6875rem;
  font-weight: ${({ $active }) => ($active ? '700' : '400')};
  cursor: pointer;
  transition: all 0.1s;
`

const ExpFileCount = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-left: 0.25rem;
  white-space: nowrap;
`

const ExpTable = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`

const ExpTableHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 62px 120px 100px 40px;
  padding: 0.375rem 0.875rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 7px 7px 0 0;
`

const ExpHCell = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.07em;
`

const ExpRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 62px 120px 100px 40px;
  padding: 0.375rem 0.875rem;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.1s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafafa; }
`

const ExpFileNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  padding-right: 0.5rem;
  span { font-size: 0.8125rem; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`

const ExpPathCell = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5rem;
`

const ExpCell = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
`

const ExpActionsCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: flex-end;
`


const ExpEmpty = styled.div`
  padding: 1.5rem;
  text-align: center;
  font-size: 0.8125rem;
  color: #9ca3af;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
`

// ─── Root ─────────────────────────────────────────────────────────────────────

export function FilesScreen() {
  const { mode } = useUserMode()
  return (
    <>
      {mode === 'basic'    && <BasicFiles />}
      {mode === 'standard' && <StandardFiles />}
      {mode === 'expert'   && <ExpertFiles />}
    </>
  )
}
