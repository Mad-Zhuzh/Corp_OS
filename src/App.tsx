import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { MainScreen } from './screens/main/MainScreen'
import { SearchScreen } from './screens/search/SearchScreen'
import { OnboardingWelcome } from './screens/onboarding/OnboardingWelcome'
import { OnboardingModeSelect } from './screens/onboarding/OnboardingModeSelect'
import { OnboardingTour } from './screens/onboarding/OnboardingTour'
import { TaskScreen } from './screens/task/TaskScreen'
import { StubScreen } from './screens/stub/StubScreen'
import { FilesScreen } from './screens/files/FilesScreen'
import { HelpScreen } from './screens/help/HelpScreen'
import { DocumentScreen } from './screens/document/DocumentScreen'

function RootRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    const done = localStorage.getItem('corpOsOnboarded')
    navigate(done ? '/main' : '/onboarding', { replace: true })
  }, [navigate])
  return null
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/main" element={<MainScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/task" element={<TaskScreen />} />
        <Route path="/onboarding" element={<OnboardingWelcome />} />
        <Route path="/onboarding/mode" element={<OnboardingModeSelect />} />
        <Route path="/onboarding/tour" element={<OnboardingTour />} />
        <Route path="/tasks" element={<StubScreen section="Задачи" />} />
        <Route path="/documents" element={<FilesScreen />} />
        <Route path="/document" element={<DocumentScreen />} />
        <Route path="/projects" element={<StubScreen section="Проекты" />} />
        <Route path="/services" element={<StubScreen section="Сервисы" />} />
        <Route path="/team" element={<StubScreen section="Команда" />} />
        <Route path="/settings" element={<StubScreen section="Настройки" />} />
        <Route path="/mail" element={<StubScreen section="Почта" />} />
        <Route path="/help" element={<HelpScreen />} />
      </Route>
    </Routes>
  )
}

export default App
