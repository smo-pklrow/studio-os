import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ClientBoard from './pages/ClientBoard.jsx'
import TaskDetail from './pages/TaskDetail.jsx'
import ClientPortal from './pages/ClientPortal.jsx'
import Login from './pages/Login.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'
import { ToastProvider } from './components/shared/Toast.jsx'

export default function App() {
  return (
    <ToastProvider>
    <Routes>
      {/* Public routes — no auth required */}
      <Route path="/portal/:shareToken" element={<ClientPortal />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes — wrapped in AppShell (auth guard + nav) */}
      <Route element={<AppShell />}>
        <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="/client/:clientId" element={<ErrorBoundary><ClientBoard /></ErrorBoundary>} />
        <Route path="/client/:clientId/task/:taskId" element={<ErrorBoundary><TaskDetail /></ErrorBoundary>} />
        <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </ToastProvider>
  )
}
