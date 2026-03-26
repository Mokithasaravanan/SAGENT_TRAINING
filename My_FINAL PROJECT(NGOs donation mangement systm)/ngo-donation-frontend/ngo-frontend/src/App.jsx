import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import VolunteerLayout from './components/VolunteerLayout'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import HomePage       from './pages/HomePage'
import NgosPage       from './pages/NgosPage'
import CampaignsPage  from './pages/CampaignsPage'
import DonatePage     from './pages/DonatePage'
import HistoryPage    from './pages/HistoryPage'
import ContactPage    from './pages/ContactPage'
import AchievementsPage from './pages/AchievementsPage'
import AboutPage from './pages/AboutPage'
import ProfilePage    from './pages/ProfilePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCampaignsPage from './pages/admin/AdminCampaignsPage'
import AdminNgosPage from './pages/admin/AdminNgosPage'
import AdminRequestsPage from './pages/admin/AdminRequestsPage'
import AdminVolunteersPage from './pages/admin/AdminVolunteersPage'
import AdminUrgentPage from './pages/admin/AdminUrgentPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import VolunteerDashboardPage from './pages/volunteer/VolunteerDashboardPage'
import VolunteerTasksPage from './pages/volunteer/VolunteerTasksPage'
import VolunteerMapPage from './pages/volunteer/VolunteerMapPage'
import VolunteerSchedulePage from './pages/volunteer/VolunteerSchedulePage'
import AIChatbot from './components/AIChatbot'
const PrivateRoute = ({ children, roles }) => {
  const { isLoggedIn, user } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />
  return children
}

const RootRedirect = () => {
  const { isLoggedIn, user } = useAuth()
  if (!isLoggedIn) return <HomePage />
  if (user?.role === 'ADMIN') {
    if (user?.ngoId) return <Navigate to="/admin/requests" replace />
    return <Navigate to="/admin" replace />
  }
  if (user?.role === 'VOLUNTEER') return <Navigate to="/volunteer" replace />
  return <HomePage />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#fb7185', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<RootRedirect />} />
              <Route path="ngos"      element={<NgosPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="contact"   element={<ContactPage />} />
              <Route path="donate" element={
                <PrivateRoute roles={['DONOR']}>
                  <DonatePage />
                </PrivateRoute>
              }/>
              <Route path="history" element={
                <PrivateRoute roles={['DONOR']}>
                  <HistoryPage />
                </PrivateRoute>
              }/>
              <Route path="profile" element={
                <PrivateRoute roles={['DONOR','ADMIN','VOLUNTEER']}>
                  <ProfilePage />
                </PrivateRoute>
              }/>
            </Route>
            <Route path="/admin" element={
              <PrivateRoute roles={['ADMIN']}>
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route index element={<AdminDashboardPage />} />
              <Route path="campaigns" element={<AdminCampaignsPage />} />
              <Route path="ngos" element={<AdminNgosPage />} />
              <Route path="requests" element={<AdminRequestsPage />} />
              <Route path="volunteers" element={<AdminVolunteersPage />} />
              <Route path="urgent" element={<AdminUrgentPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>
            <Route path="/volunteer" element={
              <PrivateRoute roles={['VOLUNTEER','ADMIN']}>
                <VolunteerLayout />
              </PrivateRoute>
            }>
              <Route index element={<VolunteerDashboardPage />} />
              <Route path="tasks" element={<VolunteerTasksPage />} />
              <Route path="map" element={<VolunteerMapPage />} />
              <Route path="schedule" element={<VolunteerSchedulePage />} />
            </Route>
            <Route path="/volunteerpage" element={<Navigate to="/volunteer" replace />} />
            <Route path="/volunteer-page" element={<Navigate to="/volunteer" replace />} />
          </Routes>
          <AIChatbot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
