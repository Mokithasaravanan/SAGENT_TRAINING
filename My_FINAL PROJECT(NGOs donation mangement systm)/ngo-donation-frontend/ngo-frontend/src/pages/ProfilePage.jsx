import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiShield, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [loading, navigate, user])

  if (!user) {
    return (
      <div className="page-section max-w-3xl mx-auto flex items-center justify-center">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-slate-700">Redirecting you to the login page…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-section max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">{user?.name || 'User'}</h1>
            <p className="text-sm text-slate-600">Role: {user?.role}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2 text-slate-700">
            <FiUser />
            <p className="text-sm font-semibold">Account Info</p>
          </div>
          <p className="text-xs text-slate-600">User ID: {user?.id}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2 text-slate-700">
            <FiMail />
            <p className="text-sm font-semibold">Email</p>
          </div>
          <p className="text-xs text-slate-600">{user?.email}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2 text-slate-700">
            <FiShield />
            <p className="text-sm font-semibold">Access Level</p>
          </div>
          <p className="text-xs text-slate-600">{user?.role} privileges enabled</p>
        </div>
      </div>
    </div>
  )
}
