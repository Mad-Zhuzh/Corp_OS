import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import styled, { createGlobalStyle, css } from 'styled-components'
import { useUserMode, type UserMode } from '../../context/UserModeContext'
import { useTourHighlight } from '../../context/TourHighlightContext'
import { notifications } from '../../data/mockData'
import type { FC } from 'react'
import type { IconProps } from '@salutejs/plasma-icons'
import {
  IconHouseOutline,
  IconTaskHorizOutline,
  IconDocumentOutline,
  IconDocumentAddOutline,
  IconFolderOutline,
  IconAppsOutline,
  IconPeopleGroupOutline,
  IconSettingsOutline,
  IconBellOutline,
  IconPanelSidebarLOutline,
  IconPanelSidebarLFill,
  IconInfoCircleOutline,
} from '@salutejs/plasma-icons'

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADER_H = 56
const SIDEBAR_BASIC = 240
const SIDEBAR_STD = 220
const SIDEBAR_MIN = 56

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItemDef {
  id: string
  label: string
  Icon: FC<IconProps>
  path: string
}

const NAV_ITEMS: NavItemDef[] = [
  { id: 'main',      label: 'Рабочая среда',   Icon: IconHouseOutline,      path: '/main' },
  { id: 'tasks',     label: 'Задачи',          Icon: IconTaskHorizOutline,  path: '/tasks' },
  { id: 'documents', label: 'Файлы и документы', Icon: IconDocumentOutline,   path: '/documents' },
  { id: 'task',      label: 'Заявки',          Icon: IconDocumentAddOutline,path: '/task' },
  { id: 'projects',  label: 'Проекты',         Icon: IconFolderOutline,     path: '/projects' },
  { id: 'services',  label: 'Сервисы',         Icon: IconAppsOutline,       path: '/services' },
  { id: 'team',      label: 'Команда',         Icon: IconPeopleGroupOutline, path: '/team' },
  { id: 'settings',  label: 'Настройки',       Icon: IconSettingsOutline,   path: '/settings' },
  { id: 'help',      label: 'Помощь',          Icon: IconInfoCircleOutline, path: '/help' },
]

// ─── Breadcrumb map ───────────────────────────────────────────────────────────

interface CrumbDef { section: string; sub?: string }

const CRUMBS: Record<string, CrumbDef> = {
  '/main':           { section: 'Рабочая среда' },
  '/search':         { section: 'Поиск' },
  '/task':           { section: 'Заявки', sub: 'Новая заявка' },
  '/tasks':          { section: 'Задачи' },
  '/documents':      { section: 'Файлы и документы' },
  '/projects':       { section: 'Проекты' },
  '/services':       { section: 'Сервисы' },
  '/team':           { section: 'Команда' },
  '/settings':       { section: 'Настройки' },
  '/onboarding':        { section: 'Онбординг' },
  '/onboarding/mode':   { section: 'Онбординг', sub: 'Выбор режима' },
  '/onboarding/tour':   { section: 'Онбординг', sub: 'Обзор интерфейса' },
  '/onboarding/search': { section: 'Онбординг', sub: 'Первый поиск' },
  '/help':              { section: 'Помощь' },
}

// ─── Mode labels & colors ─────────────────────────────────────────────────────

const MODE_LABELS: Record<UserMode, string> = {
  basic:    'Базовый',
  standard: 'Стандартный',
  expert:   'Экспертный',
}

const MODE_COLORS: Record<UserMode, string> = {
  basic:    '#10b981',
  standard: '#3b82f6',
  expert:   '#8b5cf6',
}

const SEARCH_PH: Record<UserMode, string> = {
  basic:    'Что нужно найти или сделать?',
  standard: 'Поиск по системе',
  expert:   '> search...',
}

const MODES: UserMode[] = ['basic', 'standard', 'expert']

// ─── Global styles ────────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f0f2f5;
    color: #1a1a1a;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  h1, h2, h3, h4, h5, h6, p { margin: 0; font-family: inherit; }
  button, input, textarea, select { font-family: inherit; }
`

// ─── Shell structure ──────────────────────────────────────────────────────────

const ShellRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`

// ─── Header ───────────────────────────────────────────────────────────────────

const HeaderEl = styled.header`
  height: ${HEADER_H}px;
  min-height: ${HEADER_H}px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 0.75rem;
  z-index: 200;
  flex-shrink: 0;
`

const Logo = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.025em;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  padding: 0 0.25rem;
`

const SearchBox = styled.div`
  flex: 1;
  max-width: 480px;
`

const SearchInput = styled.input<{ $highlighted?: boolean }>`
  width: 100%;
  height: 34px;
  padding: 0 0.75rem;
  border: 1px solid ${({ $highlighted }) => ($highlighted ? 'rgba(99,102,241,0.5)' : '#e2e8f0')};
  border-radius: 8px;
  background: #f8f9fa;
  color: #1a1a1a;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: ${({ $highlighted }) => ($highlighted ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none')};
  &::placeholder { color: #9ca3af; }
  &:focus {
    border-color: #a5b4fc;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
`

// ─── Mode switcher ────────────────────────────────────────────────────────────

const ModeWrapper = styled.div`
  position: relative;
`

const ModePill = styled.button<{ $open: boolean; $highlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  border: 1px solid ${({ $highlighted }) => ($highlighted ? 'rgba(99,102,241,0.5)' : '#e2e8f0')};
  border-radius: 20px;
  background: ${({ $open }) => ($open ? '#f0f2f5' : '#ffffff')};
  color: #1a1a1a;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s, border-color 0.2s, box-shadow 0.2s;
  height: 32px;
  box-shadow: ${({ $highlighted }) => ($highlighted ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none')};
  &:hover { background: #f0f2f5; border-color: #d1d5db; }
`

const ModeDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const ModeChevron = styled.span<{ $open: boolean }>`
  font-size: 0.625rem;
  color: #6b7280;
  margin-left: 1px;
  line-height: 1;
  display: inline-block;
  transition: transform 0.15s;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0)')};
`

const ModeMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  overflow: hidden;
  z-index: 300;
  min-width: 168px;
`

const ModeOption = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.875rem;
  background: ${({ $active }) => ($active ? '#f5f3ff' : 'transparent')};
  border: none;
  text-align: left;
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#1a1a1a')};
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: ${({ $active }) => ($active ? '#f5f3ff' : '#f8f9fa')}; }
`

const ModeMenuSep = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 0.25rem 0;
`

const ModeMenuLink = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.8125rem;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  &:hover { background: #f8f9fa; color: #4f46e5; }
`

// ─── Notification button ──────────────────────────────────────────────────────

const NotifBtn = styled.button`
  position: relative;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: #f0f2f5; }
`

const NotifBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  background: #ef4444;
  color: #fff;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AvatarBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #4f46e5;
  color: #ffffff;
  font-size: 0.6875rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.02em;
  transition: opacity 0.1s;
  user-select: none;
  &:hover { opacity: 0.85; }
`

// ─── Body ─────────────────────────────────────────────────────────────────────

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const SidebarEl = styled.aside<{ $width: number; $highlighted?: boolean }>`
  width: ${({ $width }) => $width}px;
  min-width: ${({ $width }) => $width}px;
  background: ${({ $highlighted }) => ($highlighted ? '#f5f6ff' : '#ffffff')};
  border-right: 1px solid ${({ $highlighted }) => ($highlighted ? 'rgba(99,102,241,0.3)' : '#e2e8f0')};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease, min-width 0.2s ease, background 0.2s, border-color 0.2s;
  height: 100%;
  flex-shrink: 0;
`

const CollapseBtn = styled.button<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-end')};
  width: 100%;
  height: 36px;
  padding: 0 ${({ $collapsed }) => ($collapsed ? '0' : '0.75rem')};
  border: none;
  background: transparent;
  color: #c4c9d4;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s;
  &:hover { color: #6b7280; }
`

const SidebarNav = styled.nav`
  flex: 1;
  padding: 0.375rem 0;
  overflow-y: auto;
  overflow-x: hidden;
`

const NavBtn = styled.button<{ $active: boolean; $collapsed: boolean; $basic: boolean; $highlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $basic }) => ($basic ? '0.75rem' : '0.625rem')};
  width: 100%;
  padding: ${({ $collapsed, $basic }) =>
    $collapsed ? '0.75rem 0' : $basic ? '0.625rem 0.75rem' : '0.5rem 0.75rem'};
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  border: none;
  background: ${({ $active, $highlighted }) =>
    $highlighted ? '#eef2ff' : $active ? '#eef2ff' : 'transparent'};
  color: ${({ $active, $highlighted }) =>
    $highlighted || $active ? '#4f46e5' : '#374151'};
  font-size: 0.875rem;
  font-weight: ${({ $active, $highlighted }) => ($active || $highlighted ? '600' : '400')};
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
  outline: ${({ $highlighted }) => ($highlighted ? '2px solid rgba(99,102,241,0.35)' : 'none')};
  outline-offset: -2px;
  border-radius: ${({ $highlighted }) => ($highlighted ? '6px' : '0')};
  position: relative;
  ${({ $active }) =>
    $active &&
    css`
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 6px;
        bottom: 6px;
        width: 3px;
        background: #4f46e5;
        border-radius: 0 2px 2px 0;
      }
    `}
  &:hover {
    background: ${({ $active }) => ($active ? '#eef2ff' : '#f8f9fa')};
  }
`

const NavIcon = styled.span<{ $basic: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $basic }) => ($basic ? '24px' : '20px')};
`

const NavLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`

// ─── Content area ─────────────────────────────────────────────────────────────

const ContentArea = styled.div<{ $highlighted?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ $highlighted }) => ($highlighted ? '#eef2ff' : '#f0f2f5')};
  min-width: 0;
  transition: background 0.2s;
  outline: ${({ $highlighted }) => ($highlighted ? '2px solid rgba(99,102,241,0.25)' : 'none')};
  outline-offset: -3px;
`

const BreadcrumbBar = styled.div`
  height: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  gap: 0.375rem;
  flex-shrink: 0;
`

const BCItem = styled.span<{ $clickable?: boolean; $active?: boolean }>`
  font-size: 0.8125rem;
  color: ${({ $active }) => ($active ? '#1a1a1a' : '#6b7280')};
  font-weight: ${({ $active }) => ($active ? '500' : '400')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: color 0.1s;
  ${({ $clickable }) =>
    $clickable &&
    css`
      &:hover { color: #4f46e5; }
    `}
`

const BCSep = styled.span`
  font-size: 0.75rem;
  color: #d1d5db;
  user-select: none;
`

const ContentScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`

const ContentInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

// ─── Toast ────────────────────────────────────────────────────────────────────

const AppToast = styled.div<{ $visible: boolean }>`
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
  z-index: 500;
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.25s ease;
`

// ─── Component ────────────────────────────────────────────────────────────────

export function AppLayout() {
  const { mode, setMode } = useUserMode()
  const { zone } = useTourHighlight()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [modeOpen, setModeOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(mode === 'expert')
  const modeRef = useRef<HTMLDivElement>(null)
  const [toastMsg, setToastMsg] = useState('')
  const processedKey = useRef('')

  // show pending toast passed via router state
  useEffect(() => {
    const state = location.state as { pendingToast?: string } | null
    if (state?.pendingToast && processedKey.current !== location.key) {
      processedKey.current = location.key
      setToastMsg(state.pendingToast)
      const t = setTimeout(() => setToastMsg(''), 3800)
      return () => clearTimeout(t)
    }
  }, [location.key])

  // auto-adjust sidebar when mode changes
  useEffect(() => {
    setCollapsed(mode === 'expert')
  }, [mode])

  // close mode dropdown on outside click
  useEffect(() => {
    if (!modeOpen) return
    function handler(e: MouseEvent) {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setModeOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [modeOpen])

  const sidebarWidth = collapsed ? SIDEBAR_MIN : mode === 'basic' ? SIDEBAR_BASIC : SIDEBAR_STD
  const unread = notifications.filter(n => !n.isRead).length
  const crumb = CRUMBS[location.pathname]

  function handleSearch() {
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setQuery('')
  }

  function handleModeSelect(m: UserMode) {
    setMode(m)
    setModeOpen(false)
  }

  return (
    <>
      <GlobalStyle />
      <ShellRoot>

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <HeaderEl>
          <Logo onClick={() => navigate('/main')}>CorpOS</Logo>

          <SearchBox>
            <SearchInput
              $highlighted={zone === 'search'}
              placeholder={SEARCH_PH[mode]}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </SearchBox>

          <HeaderRight>
            {/* Mode switcher */}
            <ModeWrapper ref={modeRef}>
              <ModePill $open={modeOpen} $highlighted={zone === 'mode'} onClick={() => setModeOpen(v => !v)}>
                <ModeDot $color={MODE_COLORS[mode]} />
                {MODE_LABELS[mode]}
                <ModeChevron $open={modeOpen}>▾</ModeChevron>
              </ModePill>
              {modeOpen && (
                <ModeMenu>
                  {MODES.map(m => (
                    <ModeOption key={m} $active={m === mode} onClick={() => handleModeSelect(m)}>
                      <ModeDot $color={MODE_COLORS[m]} />
                      {MODE_LABELS[m]}
                    </ModeOption>
                  ))}
                  <ModeMenuSep />
                  <ModeMenuLink onClick={() => { setModeOpen(false); navigate('/onboarding/mode') }}>
                    Подробнее о режимах
                  </ModeMenuLink>
                </ModeMenu>
              )}
            </ModeWrapper>

            {/* Notifications */}
            <NotifBtn title="Уведомления">
              <IconBellOutline size="xs" color="currentColor" />
              {unread > 0 && <NotifBadge>{unread}</NotifBadge>}
            </NotifBtn>

            {/* Avatar */}
            <AvatarBtn title="Профиль пользователя">ОЗ</AvatarBtn>
          </HeaderRight>
        </HeaderEl>

        {/* ─── Body ───────────────────────────────────────────────────────── */}
        <Body>

          {/* ─── Sidebar ──────────────────────────────────────────────────── */}
          <SidebarEl $width={sidebarWidth} $highlighted={zone === 'sidebar'}>
            <CollapseBtn
              $collapsed={collapsed}
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Развернуть панель' : 'Свернуть панель'}
            >
              {collapsed
                ? <IconPanelSidebarLFill    size={mode === 'basic' ? 's' : 'xs'} color="currentColor" />
                : <IconPanelSidebarLOutline size={mode === 'basic' ? 's' : 'xs'} color="currentColor" />
              }
            </CollapseBtn>

            <SidebarNav>
              {NAV_ITEMS.map(item => {
                const active = location.pathname === item.path
                return (
                  <NavBtn
                    key={item.id}
                    $active={active}
                    $collapsed={collapsed}
                    $basic={mode === 'basic'}
                    $highlighted={zone === 'help' && item.id === 'help'}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                  >
                    <NavIcon $basic={mode === 'basic'}>
                      <item.Icon size={mode === 'basic' ? 's' : 'xs'} color="currentColor" />
                    </NavIcon>
                    {!collapsed && <NavLabel>{item.label}</NavLabel>}
                  </NavBtn>
                )
              })}
            </SidebarNav>
          </SidebarEl>

          {/* ─── Content ──────────────────────────────────────────────────── */}
          <ContentArea $highlighted={zone === 'content'}>
            {crumb && (
              <BreadcrumbBar>
                <BCItem $clickable onClick={() => navigate('/main')}>CorpOS</BCItem>
                <BCSep>/</BCSep>
                <BCItem $clickable={!!crumb.sub} onClick={crumb.sub ? () => navigate(location.pathname.replace(/\/[^/]+$/, '') || '/') : undefined}>
                  {crumb.section}
                </BCItem>
                {crumb.sub && (
                  <>
                    <BCSep>/</BCSep>
                    <BCItem $active>{crumb.sub}</BCItem>
                  </>
                )}
              </BreadcrumbBar>
            )}

            <ContentScroll>
              <ContentInner>
                <Outlet />
              </ContentInner>
            </ContentScroll>
          </ContentArea>

        </Body>

        <AppToast $visible={toastMsg.length > 0}>{toastMsg}</AppToast>

      </ShellRoot>
    </>
  )
}
