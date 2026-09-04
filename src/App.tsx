import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DirectorDashboard } from './pages/DirectorDashboard'
import { Home } from './pages/Home'
import { StudentDashboard } from './pages/StudentDashboard'
import { StudentLogin } from './pages/StudentLogin'
import { TeacherDashboard } from './pages/TeacherDashboard'
import { TeacherLogin } from './pages/TeacherLogin'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/enroll" element={<Navigate to="/" replace />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/director/dashboard" element={<DirectorDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
