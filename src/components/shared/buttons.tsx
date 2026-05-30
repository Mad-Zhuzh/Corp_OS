import styled from 'styled-components'
import { Button } from '@salutejs/plasma-web'

// Единый набор кнопок поверх Plasma-темы.
// Цвета сознательно не из стандартной палитры Plasma (см. допущение в гл. 3 ВКР).

export const PrimaryButton = styled(Button)`
  && {
    background-color: #282538 !important;
    color: #ffffff !important;
    &:hover { background-color: #332f47 !important; }
  }
`

export const SecondaryButton = styled(Button)`
  && {
    background-color: #e5e7eb !important;
    color: #282538 !important;
    * { color: #282538 !important; }
    &:hover {
      background-color: #d1d5db !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.10);
      * { color: #282538 !important; }
    }
  }
`

export const TertiaryButton = styled(Button)`
  && {
    background-color: #f3f4f6 !important;
    color: #4b5563 !important;
    * { color: #4b5563 !important; }
    box-shadow: none !important;
    &:hover {
      background-color: #e5e7eb !important;
      color: #374151 !important;
      * { color: #374151 !important; }
    }
  }
`
