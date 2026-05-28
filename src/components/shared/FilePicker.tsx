import { useState } from 'react'
import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'

const PrimaryButton = styled(Button)`
  && {
    background-color: #2F3A4C !important;
    color: #FFFFFF !important;
    &:hover { background-color: #1F2937 !important; }
  }
`

const SecondaryButton = styled(Button)`
  && {
    background-color: #E5E7EB !important;
    color: #2F3A4C !important;
    * { color: #2F3A4C !important; }
    &:hover {
      background-color: #D1D5DB !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.10);
      * { color: #2F3A4C !important; }
    }
  }
`
import { IconFolderOutline, IconBlankDocOutline } from '@salutejs/plasma-icons'
import {
  mockFiles,
  getChildren,
  getRootFolders,
  type MockFile,
  type MockFolder,
} from '../../data/filesMockData'
import type { UserMode } from '../../context/UserModeContext'

const DEFAULT_FOLDER = 'roga'

// ─── Design tokens ────────────────────────────────────────────────────────────

const c = {
  text:         '#1a1a1a',
  textSec:      '#4b5563',
  textTer:      '#9ca3af',
  accent:       '#6366f1',
  accentDark:   '#4338ca',
  accentBg:     '#eef2ff',
  accentBorder: '#c7d2fe',
  ok:           '#059669',
  okBg:         '#f0fdf4',
  okBorder:     '#bbf7d0',
  border:       '#e5e7eb',
  cardBg:       '#ffffff',
  inputBg:      '#f9fafb',
}

const EXT_COLOR: Record<string, { bg: string; fg: string }> = {
  pdf:  { bg: '#fee2e2', fg: '#b91c1c' },
  xlsx: { bg: '#dcfce7', fg: '#15803d' },
  docx: { bg: '#dbeafe', fg: '#1d4ed8' },
}

// ─── Styled components ────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const Dialog = styled.div`
  background: ${c.cardBg};
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  width: 720px;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const DialogHeader = styled.div`
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid ${c.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const DialogTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.01em;
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${c.textTer};
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.25rem;
  border-radius: 6px;
  transition: color 0.1s, background 0.1s;
  &:hover { color: ${c.text}; background: #f3f4f6; }
`

const Body = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  flex: 1;
  overflow: hidden;
`

const TreePanel = styled.div`
  border-right: 1px solid ${c.border};
  overflow-y: auto;
  padding: 0.75rem 0;
`

const TreeItem = styled.div<{ $depth: number; $active: boolean; $isFolder: boolean }>`
  padding: 0.4rem 1rem 0.4rem ${({ $depth }) => 0.75 + $depth * 1.125}rem;
  cursor: pointer;
  font-size: ${({ $isFolder }) => ($isFolder ? '0.875rem' : '0.8125rem')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${({ $active }) => ($active ? c.accent : c.text)};
  background: ${({ $active }) => ($active ? c.accentBg : 'transparent')};
  border-left: 2px solid ${({ $active }) => ($active ? c.accent : 'transparent')};
  transition: background 0.1s, color 0.1s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  &:hover {
    background: ${({ $active }) => ($active ? c.accentBg : '#f9fafb')};
    color: ${({ $active }) => ($active ? c.accent : c.text)};
  }
`

const FolderIcon = styled.span`font-size: 0.875rem;`

const FileListPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const FileListHeader = styled.div`
  padding: 0.75rem 1rem 0.5rem;
  border-bottom: 1px solid ${c.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-shrink: 0;
`

const FileCount = styled.div`
  font-size: 0.8125rem;
  color: ${c.textTer};
`

const SelectAllBtn = styled.button`
  background: none;
  border: 1px solid ${c.border};
  border-radius: 6px;
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
  color: ${c.textSec};
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.1s, color 0.1s;
  &:hover { border-color: ${c.accent}; color: ${c.accent}; }
`

const FileList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0.75rem;
`

const FileRow = styled.div<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ $checked }) => ($checked ? c.accentBg : 'transparent')};
  transition: background 0.1s;
  &:hover { background: ${({ $checked }) => ($checked ? c.accentBg : '#f9fafb')}; }
`

const Checkbox = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid ${({ $checked }) => ($checked ? c.accent : c.border)};
  background: ${({ $checked }) => ($checked ? c.accent : c.cardBg)};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.1s, background 0.1s;
`

const CheckMark = styled.span`
  color: white;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
`

const FileExtBadge = styled.span<{ $bg: string; $fg: string }>`
  padding: 0.1rem 0.375rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  flex-shrink: 0;
`

const FileName = styled.span`
  flex: 1;
  font-size: 0.875rem;
  color: ${c.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const FileMeta = styled.span`
  font-size: 0.75rem;
  color: ${c.textTer};
  flex-shrink: 0;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${c.textTer};
  font-size: 0.875rem;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
`

const Hint = styled.div`
  margin: 0.5rem 1rem 0;
  padding: 0.5rem 0.75rem;
  background: ${c.accentBg};
  border: 1px solid ${c.accentBorder};
  border-radius: 8px;
  font-size: 0.8125rem;
  color: ${c.accentDark};
  line-height: 1.4;
`

const Footer = styled.div`
  border-top: 1px solid ${c.border};
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
`

const FooterCount = styled.div`
  font-size: 0.875rem;
  color: ${c.textSec};
`

const FooterBtns = styled.div`
  display: flex;
  gap: 0.5rem;
`

// ─── Tree helpers ─────────────────────────────────────────────────────────────

interface TreeNode {
  folder: MockFolder
  depth: number
}

function flattenTree(parentId: string | null = null, depth = 0): TreeNode[] {
  const children = parentId === null ? getRootFolders() : getChildren(parentId)
  return children.flatMap(f => [{ folder: f, depth }, ...flattenTree(f.id, depth + 1)])
}

// ─── FilePicker component ─────────────────────────────────────────────────────

interface FilePickerProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedFiles: MockFile[]) => void
  mode: UserMode
}

export function FilePicker({ isOpen, onClose, onConfirm, mode }: FilePickerProps) {
  const [activeFolderId, setActiveFolderId] = useState<string>(DEFAULT_FOLDER)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const treeNodes = flattenTree()
  const folderFiles = mockFiles.filter(f => f.folderId === activeFolderId)

  function toggleFile(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAllInFolder() {
    const allSelected = folderFiles.every(f => selected.has(f.id))
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        folderFiles.forEach(f => next.delete(f.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        folderFiles.forEach(f => next.add(f.id))
        return next
      })
    }
  }

  function handleConfirm() {
    const files = mockFiles.filter(f => selected.has(f.id))
    onConfirm(files)
    onClose()
  }

  function handleClose() {
    onClose()
  }

  const allFolderSelected = folderFiles.length > 0 && folderFiles.every(f => selected.has(f.id))
  const selectedCount = selected.size

  if (!isOpen) return null

  return (
    <Overlay onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <Dialog>
        <DialogHeader>
          <DialogTitle>Выберите файлы</DialogTitle>
          <CloseBtn onClick={handleClose} aria-label="Закрыть">✕</CloseBtn>
        </DialogHeader>

        {mode === 'basic' && (
          <Hint>
            Откройте папку слева и отметьте нужные файлы. Можно выбрать всю папку сразу.
          </Hint>
        )}

        <Body>
          {/* Folder tree */}
          <TreePanel>
            {treeNodes.map(({ folder, depth }) => (
              <TreeItem
                key={folder.id}
                $depth={depth}
                $active={activeFolderId === folder.id}
                $isFolder={true}
                onClick={() => setActiveFolderId(folder.id)}
              >
                <FolderIcon>
                  <IconFolderOutline size="xs" color={activeFolderId === folder.id ? '#6366f1' : '#9ca3af'} />
                </FolderIcon>
                {folder.label}
              </TreeItem>
            ))}
          </TreePanel>

          {/* File list */}
          <FileListPanel>
            <FileListHeader>
              <FileCount>
                {folderFiles.length > 0
                  ? `${folderFiles.length} файл${folderFiles.length === 1 ? '' : folderFiles.length < 5 ? 'а' : 'ов'}`
                  : 'Файлов нет'}
              </FileCount>
              {folderFiles.length > 0 && (
                <SelectAllBtn onClick={selectAllInFolder}>
                  {allFolderSelected ? 'Снять выделение' : 'Выбрать всю папку'}
                </SelectAllBtn>
              )}
            </FileListHeader>

            <FileList>
              {folderFiles.length === 0 ? (
                <EmptyState>
                  <IconFolderOutline size="m" color="#d1d5db" />
                  <span>В этой папке нет файлов</span>
                </EmptyState>
              ) : (
                folderFiles.map(file => {
                  const col = EXT_COLOR[file.type] ?? { bg: '#f3f4f6', fg: '#374151' }
                  const isChecked = selected.has(file.id)
                  return (
                    <FileRow key={file.id} $checked={isChecked} onClick={() => toggleFile(file.id)}>
                      <Checkbox $checked={isChecked}>
                        {isChecked && <CheckMark>✓</CheckMark>}
                      </Checkbox>
                      <IconBlankDocOutline size="xs" color={col.fg} />
                      <FileExtBadge $bg={col.bg} $fg={col.fg}>{file.type.toUpperCase()}</FileExtBadge>
                      <FileName>{file.name}</FileName>
                      <FileMeta>{file.size}</FileMeta>
                    </FileRow>
                  )
                })
              )}
            </FileList>
          </FileListPanel>
        </Body>

        <Footer>
          <FooterCount>
            {selectedCount > 0
              ? `Выбрано: ${selectedCount} файл${selectedCount === 1 ? '' : selectedCount < 5 ? 'а' : 'ов'}`
              : 'Файлы не выбраны'}
          </FooterCount>
          <FooterBtns>
            <SecondaryButton size="m" text="Отмена" onClick={handleClose} />
            <PrimaryButton
              size="m"
              text={selectedCount > 0 ? `Добавить файлы (${selectedCount})` : 'Добавить файлы'}
              disabled={selectedCount === 0}
              onClick={handleConfirm}
            />
          </FooterBtns>
        </Footer>
      </Dialog>
    </Overlay>
  )
}
