import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { SearchDropdown } from '../search/SearchDropdown'
import { OpenObjectsProvider } from '../../context/OpenObjectsContext'
import { OpenObjectsBar } from '../shared/OpenObjectsBar'
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
  IconSearch,
  IconCardsGridOutline,
  IconWifiDefault,
  IconMailOutline,
  IconProfileOutline,
} from '@salutejs/plasma-icons'

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADER_H = 56

const RU_MONTHS   = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const RU_MON_GEN  = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const RU_DAYS_HDR = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
const RU_DAY_ABR  = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const offset   = firstDow === 0 ? 6 : firstDow - 1
  const days     = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
const SIDEBAR_BASIC = 240
const SIDEBAR_STD = 220
const SIDEBAR_MIN = 56

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItemDef {
  id: string
  label: string
  Icon: FC<IconProps>
  path: string
  badge?: number
}

const NAV_ITEMS: NavItemDef[] = [
  { id: 'main',      label: 'Рабочая среда',     Icon: IconHouseOutline,       path: '/main' },
  { id: 'tasks',     label: 'Задачи',            Icon: IconTaskHorizOutline,   path: '/tasks' },
  { id: 'documents', label: 'Файлы и документы', Icon: IconDocumentOutline,    path: '/documents' },
  { id: 'task',      label: 'Заявки',            Icon: IconDocumentAddOutline, path: '/task' },
  { id: 'projects',  label: 'Проекты',           Icon: IconFolderOutline,      path: '/projects' },
  { id: 'services',  label: 'Сервисы',           Icon: IconAppsOutline,        path: '/services' },
  { id: 'team',      label: 'Команда',           Icon: IconPeopleGroupOutline,  path: '/team' },
  { id: 'mail',      label: 'Почта',             Icon: IconMailOutline,         path: '/mail', badge: 2 },
  { id: 'settings',  label: 'Настройки',         Icon: IconSettingsOutline,    path: '/settings' },
  { id: 'help',      label: 'Помощь',            Icon: IconInfoCircleOutline,  path: '/help' },
]

// ─── Breadcrumb map ───────────────────────────────────────────────────────────

interface CrumbDef { section: string; sub?: string; sectionRoute?: string }

const CRUMBS: Record<string, CrumbDef> = {
  '/main':           { section: 'Рабочая среда' },
  '/search':         { section: 'Поиск' },
  '/task':           { section: 'Заявки', sub: 'Новая заявка' },
  '/tasks':          { section: 'Задачи' },
  '/documents':      { section: 'Файлы и документы' },
  '/document':       { section: 'Файлы и документы', sub: 'Шаблон заявления на отпуск', sectionRoute: '/documents' },
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
  basic:    '#6366f1',
  standard: '#3b82f6',
  expert:   '#8b5cf6',
}

const SEARCH_PH: Record<UserMode, string> = {
  basic:    'Что нужно найти или сделать?',
  standard: 'Поиск по системе',
  expert:   'Найти или выполнить действие',
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
  background: #F0F2F5;
  box-shadow: 0 1px 0 rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  padding: 0 1.5rem 0 1rem;
  gap: 0.75rem;
  z-index: 200;
  flex-shrink: 0;
`

const HeaderSpacer = styled.div`
  flex: 1;
  min-width: 0.5rem;
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

const SearchBox = styled.div<{ $highlighted?: boolean }>`
  width: 560px;
  flex-shrink: 0;
  position: relative;
  ${({ $highlighted }) => $highlighted && css`
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(99, 102, 241, 0.15);
      border-radius: 8px;
      pointer-events: none;
      z-index: 10;
    }
  `}
`

const SearchInputRow = styled.div`
  display: flex;
  align-items: center;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus-within {
    border-color: rgba(99,102,241,0.4);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }
`

const SearchInput = styled.input`
  flex: 1;
  height: 100%;
  padding: 0 0.5rem 0 0.75rem;
  border: none;
  background: transparent;
  color: #1a1a1a;
  font-size: 0.875rem;
  outline: none;
  font-family: inherit;
  &::placeholder { color: #9ca3af; }
`

const SearchIconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 0 7px 7px 0;
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
  &:hover { color: #6366f1; background: rgba(99,102,241,0.06); }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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
  padding: 0.25rem 0.625rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: ${({ $open }) => ($open ? '#d1d5db' : '#e5e7eb')};
  color: #1a1a1a;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s;
  height: 32px;
  &:hover { background: #d1d5db; }
`

const ModeDot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
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
  background: #4f46e5;
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
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
  user-select: none;
  &:hover { background: rgba(0,0,0,0.06); }
`

// ─── Header icon button (network, avatar wrapper) ────────────────────────────

const HdrIconBtn = styled.button`
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(0,0,0,0.06); }
`

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const TooltipWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const TooltipBox = styled.div`
  position: absolute;
  top: calc(100% + 7px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: #fff;
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 400;
`

// ─── Clock widget ─────────────────────────────────────────────────────────────

const ClockWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: default;
  padding: 0 0.25rem;
`

const ClockInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
`

const ClockTime = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
`

const ClockDate = styled.div`
  font-size: 0.6875rem;
  color: #6b7280;
`

const CalPopover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  padding: 0.875rem 1rem;
  z-index: 400;
  width: 220px;
`

const CalTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 0.625rem;
`

const CalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`

const CalHeadCell = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-align: center;
  padding: 0.125rem 0;
`

const CalDayCell = styled.div<{ $today?: boolean; $empty?: boolean }>`
  font-size: 0.75rem;
  text-align: center;
  padding: 0.2rem 0;
  border-radius: 50%;
  color: ${({ $today }) => ($today ? '#ffffff' : '#374151')};
  background: ${({ $today }) => ($today ? '#4f46e5' : 'transparent')};
  font-weight: ${({ $today }) => ($today ? '700' : '400')};
  visibility: ${({ $empty }) => ($empty ? 'hidden' : 'visible')};
`

// ─── Sidebar nav badge ────────────────────────────────────────────────────────

const NavBadge = styled.span<{ $floating?: boolean }>`
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  background: #4f46e5;
  color: #fff;
  font-size: 0.5625rem;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  ${({ $floating }) => $floating && css`
    position: absolute;
    top: -3px;
    right: -3px;
    min-width: 14px;
    height: 14px;
  `}
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
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease, min-width 0.2s ease;
  height: 100%;
  flex-shrink: 0;
  position: relative;
  ${({ $highlighted }) => $highlighted && css`
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(99, 102, 241, 0.14);
      pointer-events: none;
      z-index: 10;
    }
  `}
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
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#374151')};
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
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
  ${({ $highlighted }) =>
    $highlighted &&
    css`
      &::after {
        content: '';
        position: absolute;
        inset: 2px;
        background: rgba(99, 102, 241, 0.2);
        border-radius: 6px;
        pointer-events: none;
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
  position: relative;
  width: ${({ $basic }) => ($basic ? '24px' : '20px')};
`

const NavLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`

// ─── Content area ─────────────────────────────────────────────────────────────

const ContentArea = styled.div<{ $highlighted?: boolean; $editMode?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ $editMode }) => ($editMode ? '#c8cdd8' : 'linear-gradient(180deg, #F6F8FB 0%, #EEF2F7 100%)')};
  transition: background 0.2s;
  min-width: 0;
  position: relative;
  ${({ $highlighted }) => $highlighted && css`
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(99, 102, 241, 0.13);
      pointer-events: none;
      z-index: 10;
    }
  `}
`

const BcSpacer = styled.div`
  flex: 1;
`

const EditBtnWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`

const EditBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: 24px;
  padding: 0 0.5rem;
  border: 1px solid ${({ $active }) => ($active ? '#a5b4fc' : 'transparent')};
  border-radius: 6px;
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4f46e5' : '#6b7280')};
  font-size: 0.8125rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  &:hover { background: #eef2ff; border-color: #a5b4fc; color: #4f46e5; }
`

const EditMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 300;
  min-width: 180px;
`

const EditMenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s;
  &:hover { background: #f8f9fa; color: #4f46e5; }
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

const ContentScroll = styled.div<{ $fading?: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  opacity: ${({ $fading }) => ($fading ? 0 : 1)};
  transition: opacity 150ms ease;
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [modeOpen, setModeOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(mode === 'expert')
  const modeRef = useRef<HTMLDivElement>(null)
  const searchBoxRef = useRef<HTMLDivElement>(null)
  const [toastMsg, setToastMsg] = useState('')
  const processedKey = useRef('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editMenuOpen, setEditMenuOpen] = useState(false)
  const editMenuRef = useRef<HTMLDivElement>(null)
  const [fading, setFading] = useState(false)
  const prevModeRef = useRef(mode)
  const [now, setNow] = useState(() => new Date())
  const [clockHover, setClockHover] = useState(false)
  const [netHover, setNetHover] = useState(false)
  const [notifHover, setNotifHover] = useState(false)
  const [avatarHover, setAvatarHover] = useState(false)

  // content fade on mode change
  useEffect(() => {
    if (prevModeRef.current === mode) return
    prevModeRef.current = mode
    setFading(true)
    const t = setTimeout(() => setFading(false), 150)
    return () => clearTimeout(t)
  }, [mode])

  // clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // show pending toast passed via router state
  useEffect(() => {
    const state = location.state as { pendingToast?: string } | null
    if (state?.pendingToast && processedKey.current !== location.key) {
      processedKey.current = location.key
      setToastMsg(state.pendingToast)
      setTimeout(() => setToastMsg(''), 3800)
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

  // close search dropdown on outside click
  useEffect(() => {
    if (!searchOpen) return
    function handler(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [searchOpen])

  // close search dropdown on navigation
  useEffect(() => {
    setSearchOpen(false)
  }, [location.pathname])

  // close edit menu on outside click
  useEffect(() => {
    if (!editMenuOpen) return
    function handler(e: MouseEvent) {
      if (editMenuRef.current && !editMenuRef.current.contains(e.target as Node)) {
        setEditMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [editMenuOpen])

  // reset edit mode when leaving /main
  useEffect(() => {
    if (location.pathname !== '/main') {
      setIsEditMode(false)
      setEditMenuOpen(false)
    }
  }, [location.pathname])

  const sidebarWidth = collapsed ? SIDEBAR_MIN : mode === 'basic' ? SIDEBAR_BASIC : SIDEBAR_STD
  const unread = notifications.filter(n => !n.isRead).length
  const crumb = CRUMBS[location.pathname]

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3800)
  }

  function handleEditToggle() {
    const next = !isEditMode
    setIsEditMode(next)
    setEditMenuOpen(next)
  }

  function handleNavigateToResults() {
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setSearchOpen(false)
  }

  function handleResultSelect(result: { title: string; route?: string }) {
    setSearchOpen(false)
    const route = result.route ?? '/main'
    navigate(route, { state: { pendingToast: `Открыто: ${result.title}` } })
  }

  function handleActionSelect(nav: string) {
    setSearchOpen(false)
    navigate(nav)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleNavigateToResults()
    else if (e.key === 'Escape') {
      setSearchOpen(false)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  function handleModeSelect(m: UserMode) {
    setMode(m)
    setModeOpen(false)
  }

  return (
    <OpenObjectsProvider>
      <GlobalStyle />
      <ShellRoot>

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <HeaderEl>
          <Logo onClick={() => navigate('/main')}>CorpOS</Logo>

          <HeaderSpacer />

          <SearchBox ref={searchBoxRef} $highlighted={zone === 'search'}>
            <SearchInputRow>
              <SearchInput
                placeholder={SEARCH_PH[mode]}
                value={query}
                onChange={e => { setQuery(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
              />
              <SearchIconBtn
                onClick={handleNavigateToResults}
                title="Найти"
                tabIndex={-1}
              >
                <IconSearch size="xs" color="currentColor" />
              </SearchIconBtn>
            </SearchInputRow>
            {searchOpen && (
              <SearchDropdown
                query={query}
                onQueryChange={q => { setQuery(q) }}
                onResultSelect={handleResultSelect}
                onAllResults={handleNavigateToResults}
                onActionSelect={handleActionSelect}
                onDocOpen={() => {
                  setSearchOpen(false)
                  navigate('/main', { state: { pendingToast: 'Открываем документ на странице 6' } })
                }}
              />
            )}
          </SearchBox>

          <HeaderRight>
            {/* Clock */}
            <ClockWrap
              onMouseEnter={() => setClockHover(true)}
              onMouseLeave={() => setClockHover(false)}
            >
              <ClockInner>
                <ClockTime>
                  {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}
                </ClockTime>
                <ClockDate>
                  {RU_DAY_ABR[now.getDay()]}, {now.getDate()} {RU_MON_GEN[now.getMonth()]}
                </ClockDate>
              </ClockInner>
              {clockHover && (() => {
                const y = now.getFullYear(), m = now.getMonth()
                const cells = buildCalendarCells(y, m)
                return (
                  <CalPopover>
                    <CalTitle>{RU_MONTHS[m]} {y}</CalTitle>
                    <CalGrid>
                      {RU_DAYS_HDR.map(d => <CalHeadCell key={d}>{d}</CalHeadCell>)}
                      {cells.map((day, i) => (
                        <CalDayCell key={i} $today={day === now.getDate()} $empty={day === null}>
                          {day ?? ''}
                        </CalDayCell>
                      ))}
                    </CalGrid>
                  </CalPopover>
                )
              })()}
            </ClockWrap>

            {/* Network */}
            <TooltipWrap
              onMouseEnter={() => setNetHover(true)}
              onMouseLeave={() => setNetHover(false)}
            >
              <HdrIconBtn as="div" style={{ cursor: 'default' }}>
                <IconWifiDefault size="xs" color="#6b7280" />
              </HdrIconBtn>
              {netHover && <TooltipBox>Подключено к сети</TooltipBox>}
            </TooltipWrap>

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
            <TooltipWrap
              onMouseEnter={() => setNotifHover(true)}
              onMouseLeave={() => setNotifHover(false)}
            >
              <HdrIconBtn as="div">
                <IconBellOutline size="xs" color="#6b7280" />
              </HdrIconBtn>
              {notifHover && <TooltipBox>Центр уведомлений</TooltipBox>}
            </TooltipWrap>

            {/* Avatar */}
            <TooltipWrap
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
            >
              <AvatarBtn>
                <IconProfileOutline size="xs" color="currentColor" />
              </AvatarBtn>
              {avatarHover && <TooltipBox>Профиль</TooltipBox>}
            </TooltipWrap>
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
                    $highlighted={
                      (zone === 'help' && item.id === 'help') ||
                      (zone === 'documents' && item.id === 'documents')
                    }
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                  >
                    <NavIcon $basic={mode === 'basic'}>
                      <item.Icon size={mode === 'basic' ? 's' : 'xs'} color="currentColor" />
                      {collapsed && item.badge && <NavBadge $floating>{item.badge}</NavBadge>}
                    </NavIcon>
                    {!collapsed && <NavLabel>{item.label}</NavLabel>}
                    {!collapsed && item.badge && <NavBadge>{item.badge}</NavBadge>}
                  </NavBtn>
                )
              })}
            </SidebarNav>
          </SidebarEl>

          {/* ─── Content ──────────────────────────────────────────────────── */}
          <ContentArea $highlighted={zone === 'content'} $editMode={isEditMode}>
            {crumb && (
              <BreadcrumbBar>
                <BCItem $clickable onClick={() => navigate('/main')}>CorpOS</BCItem>
                <BCSep>/</BCSep>
                <BCItem $clickable={!!crumb.sub} onClick={crumb.sub ? () => navigate((crumb.sectionRoute ?? location.pathname.replace(/\/[^/]+$/, '')) || '/') : undefined}>
                  {crumb.section}
                </BCItem>
                {crumb.sub && (
                  <>
                    <BCSep>/</BCSep>
                    <BCItem $active>{crumb.sub}</BCItem>
                  </>
                )}
                {location.pathname === '/main' && (
                  <>
                    <BcSpacer />
                    <EditBtnWrap ref={editMenuRef}>
                      <EditBtn
                        $active={isEditMode}
                        onClick={handleEditToggle}
                        title={mode !== 'basic' ? 'Настроить рабочую среду' : undefined}
                      >
                        {mode === 'basic'    && <span>Настроить рабочую среду</span>}
                        {mode === 'standard' && <span>Настроить</span>}
                        <IconCardsGridOutline size="xs" color="currentColor" />
                      </EditBtn>
                      {editMenuOpen && (
                        <EditMenu>
                          <EditMenuItem>Добавить виджет</EditMenuItem>
                          <EditMenuItem>Персонализация</EditMenuItem>
                          <EditMenuItem>Сбросить расположение</EditMenuItem>
                          <EditMenuItem>Настройки интерфейса</EditMenuItem>
                        </EditMenu>
                      )}
                    </EditBtnWrap>
                  </>
                )}
              </BreadcrumbBar>
            )}

            <OpenObjectsBar />

            <ContentScroll $fading={fading}>
              <ContentInner>
                <Outlet context={{ isEditMode, showToast }} />
              </ContentInner>
            </ContentScroll>
          </ContentArea>

        </Body>

        <AppToast $visible={toastMsg.length > 0}>{toastMsg}</AppToast>

      </ShellRoot>
    </OpenObjectsProvider>
  )
}
