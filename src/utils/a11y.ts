import type { KeyboardEvent } from 'react'

// Делает кастомный кликабельный элемент (div/li и т.п.) доступным с клавиатуры:
// добавляет роль кнопки, попадание в Tab-порядок и активацию по Enter/Space.
export function clickable(onActivate: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onActivate()
      }
    },
  }
}
