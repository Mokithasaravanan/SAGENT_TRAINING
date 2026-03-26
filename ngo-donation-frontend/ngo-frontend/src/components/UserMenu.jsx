import React, { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserMenu({ theme = 'dark' }) {
  const { user, logout, isLoggedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const roleDashboard = user?.role === 'ADMIN'
    ? '/admin'
    : user?.role === 'VOLUNTEER'
      ? '/volunteer'
      : '/'

  const menuClass = theme === 'light'
    ? 'bg-white border border-black/10 text-slate-800'
    : 'bg-slate-900/95 border border-white/10 text-slate-100'

  if (!isLoggedIn) {
    const ghostBtn = theme === 'light'
      ? 'text-slate-700 hover:bg-slate-100'
      : 'text-slate-200 hover:bg-white/10'
    const primaryBtn = theme === 'light'
      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
      : 'bg-emerald-500 text-white hover:bg-emerald-400'

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/login')}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${ghostBtn}`}
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${primaryBtn}`}
        >
          Register
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${theme === 'light' ? 'bg-white/80 text-slate-800' : 'bg-white/10 text-slate-100'}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
          {isLoggedIn ? (user?.name?.[0]?.toUpperCase() || 'U') : <FiUser />}
        </div>
        <span className="text-sm font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
        <FiChevronDown className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden ${menuClass}`}>
          <button
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/10 transition-all"
          >
            <FiUser /> My Profile
          </button>
          <button
            onClick={() => { setOpen(false); navigate(roleDashboard) }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/10 transition-all"
          >
            <FiSettings /> Dashboard
          </button>
          <button
            onClick={() => { setOpen(false); logout(); navigate('/login') }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-200 hover:bg-rose-500/10 transition-all"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </div>
  )
}
