import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Home } from './pages/Home'
import { StudentDashboard } from './pages/StudentDashboard'
import { StudentEnroll } from './pages/StudentEnroll'
import { StudentLogin } from './pages/StudentLogin'
import { TeacherDashboard } from './pages/TeacherDashboard'
import { TeacherLogin } from './pages/TeacherLogin'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/enroll" element={<StudentEnroll />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
