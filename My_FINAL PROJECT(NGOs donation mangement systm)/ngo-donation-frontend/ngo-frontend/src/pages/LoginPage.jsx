import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiHeart, FiArrowRight } from 'react-icons/fi'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PAGE_BACKGROUNDS } from '../constants/imagery'

export default function LoginPage() {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()
  const DEMO_USERS = [
    { id: 1, email: 'admin@ngo.com',     password: 'admin123',    role: 'ADMIN',     name: 'admin' },
    { id: 2, email: 'john@example.com',  password: 'password123', role: 'DONOR',     name: 'john' },
    { id: 3, email: 'volunteer@example.com', password: 'password123', role: 'VOLUNTEER', name: 'volunteer' },
  ]
  const demoMatch = () => DEMO_USERS.find(u =>
    String(u.email).toLowerCase() === String(form.email).toLowerCase() &&
    String(u.password) === String(form.password)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill all fields'); return }
    setLoading(true)
    try {
      const res = await loginUser(form)
      const payload = res?.data?.data ?? res?.data ?? {}
      const token =
        payload.token ||
        payload.accessToken ||
        payload.jwt ||
        payload.jwtToken
      const rawRole = Array.isArray(payload.roles)
        ? payload.roles[0]
        : (payload.role || payload.user?.role)
      const role = rawRole ? String(rawRole).replace(/^ROLE_/, '').toUpperCase() : rawRole
      const email = payload.email || payload.user?.email || form.email
      const userId =
        payload.userId ||
        payload.id ||
        payload.user?.id ||
        payload.user?.userId
      const volunteerId =
        payload.volunteerId ||
        payload.volunteer_id ||
        payload.user?.volunteerId ||
        payload.user?.volunteer_id
      const ngoId =
        payload.ngoId ||
        payload.ngo_id ||
        payload.ngo?.id ||
        payload.ngo?.ngoId ||
        payload.ngo?.ngo_id ||
        payload.assignedNgoId ||
        payload.assigned_ngo_id ||
        payload.assignedNgo?.id ||
        payload.user?.ngoId ||
        payload.user?.ngo_id ||
        payload.user?.ngo?.id ||
        payload.user?.ngo?.ngoId ||
        payload.user?.assignedNgoId ||
        payload.user?.assignedNgo?.id
      const ngoName =
        payload.ngoName ||
        payload.ngo?.name ||
        payload.ngo?.ngoName ||
        payload.ngo?.title ||
        payload.assignedNgo?.name ||
        payload.assignedNgoName ||
        payload.user?.ngoName ||
        payload.user?.ngo?.name ||
        payload.user?.assignedNgo?.name
      if (!token) throw new Error('Login response missing token')
      login(token, {
        id: userId,
        userId,
        volunteerId,
        ngoId,
        ngoName,
        email,
        role,
        name: email?.split('@')[0] || 'user',
      })
      toast.success('Welcome back! 🎉')
      const target = role === 'ADMIN' ? '/admin' : role === 'VOLUNTEER' ? '/volunteer' : '/'
      navigate(target)
    } catch (err) {
      const demo = demoMatch()
      if (demo) {
        login('demo-token', { id: demo.id, email: demo.email, role: demo.role, name: demo.name })
        toast.success('Welcome back! (demo)')
        const target = demo.role === 'ADMIN' ? '/admin' : demo.role === 'VOLUNTEER' ? '/volunteer' : '/'
        navigate(target)
      } else {
        const msg = err.response?.data?.message || err.message || 'Invalid email or password'
        toast.error(msg)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/12 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/12 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'2s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      {/* BG image overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${PAGE_BACKGROUNDS.login}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.12,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="glass-dark rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 items-center justify-center mb-4 shadow-lg shadow-emerald-500/30"
            >
              <FiHeart className="text-white text-2xl" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">Welcome Back</h1>
            <p className="text-slate-400 text-sm">
              Sign in to continue spreading kindness. Your dashboard keeps every NGO impact in view.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field pl-10 pr-12"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Forgot password?</button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><FiArrowRight /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
