import { useState } from 'react'
import styled from 'styled-components'
import { IconChevronCircleDownOutline } from '@salutejs/plasma-icons'
import { useUserMode } from '../../context/UserModeContext'

// ─── Tokens ───────────────────────────────────────────────────────────────────

const c = {
  text:        '#1a1a1a',
  textSec:     '#4b5563',
  textTer:     '#6b7280',
  accent:      '#4f46e5',
  accentBg:    '#eef2ff',
  accentBorder:'#c7d2fe',
  cardBg:      '#ffffff',
  border:      '#e5e7eb',
  borderLight: '#f3f4f6',
  green:       '#059669',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',
}

// ─── Layout ───────────────────────────────────────────────────────────────────

const Root = styled.div<{ $compact: boolean }>`
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? '1.75rem' : '2.25rem')};
`

const PageTitle = styled.h1<{ $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '1.375rem' : '1.625rem')};
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.02em;
  margin-bottom: ${({ $compact }) => ($compact ? '0' : '0.125rem')};
`

// ─── Section ──────────────────────────────────────────────────────────────────

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`

const SectionTitle = styled.h2<{ $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '0.9375rem' : '1.125rem')};
  font-weight: 700;
  color: ${c.text};
  letter-spacing: -0.01em;
`

const Card = styled.div<{ $compact: boolean }>`
  background: ${c.cardBg};
  border: 1px solid ${c.border};
  border-radius: ${({ $compact }) => ($compact ? '10px' : '14px')};
  padding: ${({ $compact }) => ($compact ? '1rem 1.25rem' : '1.25rem 1.5rem')};
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? '0.625rem' : '0.875rem')};
`

const Para = styled.p<{ $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '0.875rem' : '0.9375rem')};
  color: ${c.textSec};
  line-height: 1.6;
  margin: 0;
`

// ─── Mode chips in «Начало работы» ────────────────────────────────────────────

const ModeList = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? '0.5rem' : '0.75rem')};
`

const ModeItem = styled.div<{ $compact: boolean }>`
  display: flex;
  gap: ${({ $compact }) => ($compact ? '0.625rem' : '0.875rem')};
  align-items: flex-start;
`

const ModeDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
  margin-top: 0.4rem;
`

const ModeLabel = styled.span<{ $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '0.875rem' : '0.9375rem')};
  font-weight: 600;
  color: ${c.text};
  white-space: nowrap;
  min-width: ${({ $compact }) => ($compact ? '108px' : '128px')};
`

const ModeDesc = styled.span<{ $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '0.875rem' : '0.9375rem')};
  color: ${c.textSec};
  line-height: 1.5;
`

// ─── FAQ accordion ────────────────────────────────────────────────────────────

const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${c.border};
  border-radius: 12px;
  overflow: hidden;
`

const FaqItem = styled.div`
  border-bottom: 1px solid ${c.borderLight};
  &:last-child { border-bottom: none; }
`

const FaqBtn = styled.button<{ $open: boolean; $compact: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: ${({ $compact }) => ($compact ? '0.75rem 1rem' : '0.875rem 1.25rem')};
  background: ${({ $open }) => ($open ? c.accentBg : c.cardBg)};
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s;
  &:hover { background: ${({ $open }) => ($open ? c.accentBg : '#f8f9fa')}; }
`

const FaqQuestion = styled.span<{ $open: boolean; $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '0.875rem' : '0.9375rem')};
  font-weight: ${({ $open }) => ($open ? '600' : '500')};
  color: ${({ $open }) => ($open ? c.accent : c.text)};
  line-height: 1.4;
`

const FaqChevron = styled.span<{ $open: boolean }>`
  display: flex;
  flex-shrink: 0;
  color: ${({ $open }) => ($open ? c.accent : c.textTer)};
  transition: transform 0.2s ease;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
`

const FaqAnswer = styled.div<{ $compact: boolean }>`
  padding: ${({ $compact }) => ($compact ? '0 1rem 0.875rem' : '0 1.25rem 1rem')};
  font-size: ${({ $compact }) => ($compact ? '0.875rem' : '0.9375rem')};
  color: ${c.textSec};
  line-height: 1.6;
  background: ${c.cardBg};
`

// ─── Contacts ─────────────────────────────────────────────────────────────────

const ContactList = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? '0.375rem' : '0.5rem')};
`

const ContactRow = styled.div<{ $compact: boolean }>`
  display: flex;
  gap: ${({ $compact }) => ($compact ? '0.75rem' : '1rem')};
  align-items: baseline;
`

const ContactKey = styled.span<{ $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '0.8125rem' : '0.875rem')};
  font-weight: 600;
  color: ${c.text};
  min-width: ${({ $compact }) => ($compact ? '64px' : '72px')};
  flex-shrink: 0;
`

const ContactVal = styled.span<{ $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '0.8125rem' : '0.875rem')};
  color: ${c.textSec};
  line-height: 1.5;
`

const ContactNote = styled.div<{ $compact: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '0.75rem' : '0.8125rem')};
  color: ${c.textTer};
  margin-top: ${({ $compact }) => ($compact ? '0.375rem' : '0.5rem')};
`

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODES_INFO = [
  {
    color: '#4f46e5',
    label: 'Базовый',
    desc: 'Пошаговые подсказки, мастера для заполнения форм, развёрнутые сообщения об ошибках. Подходит, если вы впервые работаете с системой.',
  },
  {
    color: '#3b82f6',
    label: 'Стандартный',
    desc: 'Привычный интерфейс без лишних пояснений. Форма заявки открывается сразу, поиск работает с автодополнением.',
  },
  {
    color: '#8b5cf6',
    label: 'Экспертный',
    desc: 'Компактный интерфейс, клавиатурная навигация, операторы поиска, минимум подтверждений.',
  },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Как найти документ или раздел?',
    a: 'Используйте строку поиска в верхней части экрана. Можно писать обычным языком — например, «заявление на отпуск» или «инструкция по закупкам». В экспертном режиме доступны операторы фильтрации: введите тип:pdf чтобы искать только среди PDF-файлов.',
  },
  {
    q: 'Как создать заявку?',
    a: 'Перейдите в раздел «Заявки» через боковое меню. В базовом режиме запустится пошаговый мастер. В стандартном и экспертном режимах форма открывается сразу. Если прикрепить файл, система автоматически заполнит поля из него.',
  },
  {
    q: 'Как сменить режим интерфейса?',
    a: 'Нажмите на кнопку режима в правом верхнем углу экрана. В выпадающем меню выберите нужный вариант. Смена происходит мгновенно, открытые задачи и документы сохраняются.',
  },
  {
    q: 'Что делать, если что-то пошло не так при заполнении формы?',
    a: 'Система покажет, что именно нужно исправить и почему. Уже введённые данные не сбрасываются.',
  },
  {
    q: 'Почему некоторые разделы меню недоступны?',
    a: 'Часть разделов системы находится в разработке и будет добавлена в следующих версиях. Основные рабочие сценарии — поиск, заявки и документы — доступны в полном объёме.',
  },
  {
    q: 'Как вернуться к онбордингу?',
    a: 'Пройти онбординг повторно можно через раздел «Настройки» → «Режим и обучение». Это не сбрасывает ваши данные.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function HelpScreen() {
  const { mode } = useUserMode()
  const compact = mode !== 'basic'
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <Root $compact={compact}>
      <PageTitle $compact={compact}>Помощь</PageTitle>

      {/* ── Начало работы ─────────────────────────────────────────────── */}
      <Section>
        <SectionTitle $compact={compact}>Начало работы</SectionTitle>
        <Card $compact={compact}>
          <Para $compact={compact}>
            CorpOS адаптируется под ваш уровень опыта. При первом входе система предложит
            выбрать режим работы — или определит его автоматически по ответам на три вопроса.
            Режим можно сменить в любой момент через кнопку в правом верхнем углу,
            не теряя данных и контекста.
          </Para>
          <ModeList $compact={compact}>
            {MODES_INFO.map(m => (
              <ModeItem key={m.label} $compact={compact}>
                <ModeDot $color={m.color} />
                <ModeLabel $compact={compact}>{m.label}</ModeLabel>
                <ModeDesc $compact={compact}>{m.desc}</ModeDesc>
              </ModeItem>
            ))}
          </ModeList>
        </Card>
      </Section>

      {/* ── Частые вопросы ────────────────────────────────────────────── */}
      <Section>
        <SectionTitle $compact={compact}>Частые вопросы</SectionTitle>
        <FaqList>
          {FAQ.map((item, i) => (
            <FaqItem key={i}>
              <FaqBtn
                $open={openFaq === i}
                $compact={compact}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <FaqQuestion $open={openFaq === i} $compact={compact}>
                  {item.q}
                </FaqQuestion>
                <FaqChevron $open={openFaq === i}>
                  <IconChevronCircleDownOutline size="xs" color="currentColor" />
                </FaqChevron>
              </FaqBtn>
              {openFaq === i && (
                <FaqAnswer $compact={compact}>{item.a}</FaqAnswer>
              )}
            </FaqItem>
          ))}
        </FaqList>
      </Section>

      {/* ── Контакты поддержки ────────────────────────────────────────── */}
      <Section>
        <SectionTitle $compact={compact}>Контакты поддержки</SectionTitle>
        <Card $compact={compact}>
          <ContactList $compact={compact}>
            <ContactRow $compact={compact}>
              <ContactKey $compact={compact}>Телефон</ContactKey>
              <ContactVal $compact={compact}>8-800-100-00-00 (бесплатно, пн–пт 9:00–18:00)</ContactVal>
            </ContactRow>
            <ContactRow $compact={compact}>
              <ContactKey $compact={compact}>Email</ContactKey>
              <ContactVal $compact={compact}>support@corp-os.ru</ContactVal>
            </ContactRow>
          </ContactList>
          <ContactNote $compact={compact}>
            Время ответа — в течение одного рабочего дня.
          </ContactNote>
        </Card>
      </Section>
    </Root>
  )
}
