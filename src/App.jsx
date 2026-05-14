import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ClientBoard from './pages/ClientBoard.jsx'
import TaskDetail from './pages/TaskDetail.jsx'
import ClientPortal from './pages/ClientPortal.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public client portal — no auth required */}
      <Route path="/portal/:shareToken" element={<ClientPortal />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* App — protected, wrapped in shell */}
      <Route element={<AppShell />}>
        {/* Level 1 — all clients overview */}
        <Route path="/" element={<Dashboard />} />

        {/* Level 2 — client board (tasks + brain dump) */}
        <Route path="/client/:clientId" element={<ClientBoard />} />

        {/* Level 3 — task detail */}
        <Route path="/client/:clientId/task/:taskId" element={<TaskDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
