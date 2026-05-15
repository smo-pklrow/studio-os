import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ClientBoard from './pages/ClientBoard.jsx'
import TaskDetail from './pages/TaskDetail.jsx'
import ClientPortal from './pages/ClientPortal.jsx'
import Login from './pages/Login.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public routes — no auth required */}
      <Route path="/portal/:shareToken" element={<ClientPortal />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes — wrapped in AppShell (auth guard + nav) */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/client/:clientId" element={<ClientBoard />} />
        <Route path="/client/:clientId/task/:taskId" element={<TaskDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
