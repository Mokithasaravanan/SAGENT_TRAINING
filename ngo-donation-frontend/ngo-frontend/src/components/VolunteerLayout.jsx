import React, { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiCalendar, FiCheckSquare, FiLogOut, FiMap, FiMenu, FiUsers, FiX
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import UserMenu from './UserMenu'
import { PAGE_BACKGROUNDS } from '../constants/imagery'

const NAV_ITEMS = [
  { to: '/volunteer', label: 'Dashboard', icon: FiUsers },
  { to: '/volunteer/tasks', label: 'My Tasks', icon: FiCheckSquare },
  { to: '/volunteer/map', label: 'Live Map', icon: FiMap },
  { to: '/volunteer/schedule', label: 'Schedule', icon: FiCalendar },
]

const TITLE_MAP = {
  '/volunteer': 'Volunteer Overview',
  '/volunteer/tasks': 'Volunteer Tasks',
  '/volunteer/map': 'Live Navigation',
  '/volunteer/schedule': 'Weekly Schedule',
}

export default function VolunteerLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const pageTitle = useMemo(() => TITLE_MAP[location.pathname] || 'Volunteer Desk', [location.pathname])
  const pageBg = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/volunteer/tasks')) return PAGE_BACKGROUNDS.volunteerTasks
    if (path.startsWith('/volunteer/map')) return PAGE_BACKGROUNDS.volunteerMap
    if (path.startsWith('/volunteer/schedule')) return PAGE_BACKGROUNDS.volunteerSchedule
    return PAGE_BACKGROUNDS.volunteerOverview
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = ({ onNavigate }) => (
    <div className="h-full flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <FiUsers className="text-white text-lg" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Volunteer</p>
            <p className="text-xs text-amber-200/80">Field Operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${isActive ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}`
            }
          >
            <item.icon className="text-base" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-6">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || 'V'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name || 'Volunteer'}</p>
              <p className="text-xs text-slate-400">On-duty</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-200 bg-rose-500/15 hover:bg-rose-500/25 transition-all"
          >
            <FiLogOut className="text-xs" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="hidden lg:flex w-72 sidebar-surface">
        <Sidebar />
      </aside>

      <div className="flex-1 min-w-0 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-10 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute top-1/3 -left-16 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <FiMenu />
              </button>
              <div>
                <p className="text-sm text-amber-200/80">Volunteer Desk</p>
                <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <FiMap className="text-amber-300" />
                Route assistance ready
              </div>
              <UserMenu theme="dark" />
            </div>
          </div>
        </header>

        <main
          className="relative z-10 px-6 py-6 page-bg"
          style={{ '--page-bg': `url('${pageBg}')` }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="fixed left-0 top-0 h-full w-72 z-50 sidebar-surface lg:hidden"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-amber-300" />
                  <span className="text-white font-semibold">Volunteer</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                  <FiX />
                </button>
              </div>
              <Sidebar onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
