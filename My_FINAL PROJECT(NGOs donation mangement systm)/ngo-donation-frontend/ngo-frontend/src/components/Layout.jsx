import React, { useMemo, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import UserMenu from './UserMenu'
import { PAGE_BACKGROUNDS } from '../constants/imagery'
import {
  FiHome, FiHeart, FiGlobe, FiFlag, FiClock, FiMail, FiAward, FiInfo,
  FiMenu, FiX,
  FiLogOut, FiMoon, FiSun, FiChevronRight
} from 'react-icons/fi'

const navItems = [
  { to: '/',          label: 'Home',       icon: FiHome,   roles: ['all'] },
  { to: '/ngos',      label: 'NGOs',       icon: FiGlobe,  roles: ['all'] },
  { to: '/campaigns', label: 'Campaigns',  icon: FiFlag,   roles: ['all'] },
  { to: '/about',     label: 'About Us',   icon: FiInfo,   roles: ['all'], visibility: 'public' },
  { to: '/achievements', label: 'Achievements', icon: FiAward, roles: ['all'] },
  { to: '/donate',    label: 'Donate',     icon: FiHeart,  roles: ['DONOR'] },
  { to: '/history',   label: 'History',    icon: FiClock,  roles: ['DONOR'] },
  { to: '/contact',   label: 'Contact',    icon: FiMail,   roles: ['DONOR'] },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, isLoggedIn } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const pageBg = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/ngos')) return PAGE_BACKGROUNDS.ngos
    if (path.startsWith('/campaigns')) return PAGE_BACKGROUNDS.campaigns
    if (path.startsWith('/contact')) return PAGE_BACKGROUNDS.contact
    if (path.startsWith('/donate')) return PAGE_BACKGROUNDS.donate
    if (path.startsWith('/history')) return PAGE_BACKGROUNDS.history
    if (path.startsWith('/achievements')) return PAGE_BACKGROUNDS.achievements || PAGE_BACKGROUNDS.donorHome
    if (path.startsWith('/about')) return PAGE_BACKGROUNDS.contact
    if (path.startsWith('/profile')) return PAGE_BACKGROUNDS.donorHome
    return PAGE_BACKGROUNDS.donorHome
  }, [location.pathname])

  const visibleItems = navItems.filter(item => {
    if (item.visibility === 'public') return !isLoggedIn
    if (item.visibility === 'private') return isLoggedIn && item.roles?.includes(user?.role)
    return item.roles.includes('all') || (user && item.roles.includes(user.role))
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 nav-dark">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-black/30">
              <FiHeart className="text-white text-lg" />
            </div>
            <span className="font-display text-xl font-bold text-white">NGO Hub</span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {visibleItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                   `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                   ${isActive
                     ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-400/30'
                     : 'text-slate-200 hover:text-cyan-100 hover:bg-cyan-500/10'}`
                }
              >
                <item.icon className="text-base" />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-all">
              {dark ? <FiSun /> : <FiMoon />}
            </button>

            <UserMenu theme="dark" />

            {/* Mobile menu toggle */}
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10">
              <FiMenu className="text-xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 z-50 glass-dark border-r border-black/10 md:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                      <FiHeart className="text-white" />
                    </div>
                    <span className="font-display text-xl font-bold gradient-text">NGO Hub</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-black/5">
                    <FiX />
                  </button>
                </div>

                {isLoggedIn && (
                  <div className="mb-6 p-3 rounded-xl bg-slate-900/5 border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center font-bold text-white">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-600">{user?.role}</p>
                    </div>
                  </div>
                )}

                <nav className="space-y-1">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                         ${isActive
                           ? 'bg-slate-900/5 text-slate-900 border border-slate-200'
                           : 'text-slate-700 hover:text-slate-900 hover:bg-black/5'}`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="text-base" />
                        {item.label}
                      </div>
                      <FiChevronRight className="text-xs opacity-50" />
                    </NavLink>
                  ))}
                </nav>

                {isLoggedIn && (
                  <button onClick={handleLogout} className="mt-6 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-500/10 transition-all">
                    <FiLogOut />
                    Logout
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main
        className="flex-1 relative z-10 page-bg"
        style={{ '--page-bg': `url('${pageBg}')` }}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 py-6 text-center text-sm text-slate-400">
        <span className="font-display">NGO Hub</span> — Built for humanity
      </footer>
    </div>
  )
}
