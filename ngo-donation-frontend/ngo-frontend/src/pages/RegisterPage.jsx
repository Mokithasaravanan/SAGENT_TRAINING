import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff, FiHeart } from 'react-icons/fi'
import { registerUser } from '../services/api'
import { PAGE_BACKGROUNDS } from '../constants/imagery'

const Field = ({
  icon: Icon,
  label,
  type = 'text',
  name,
  placeholder,
  extra,
  value,
  onChange,
  isPassword,
  showPassword,
  onTogglePassword,
}) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
      <input
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input-field pl-10 ${extra || ''}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      )}
    </div>
  </div>
)

export default function RegisterPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', phone:'', address:'', role:'DONOR' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Fill all required fields'); return }
    setLoading(true)
    try {
      await registerUser(form)
      toast.success('Account created! Please login 🎉')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-10 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-sky-500/12 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-400/12 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'1.5s'}} />
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:`url('${PAGE_BACKGROUNDS.register}')`,
          backgroundSize:'cover',
          backgroundPosition:'center',
          opacity: 0.12,
        }}
      />

      <motion.div
        initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-dark rounded-3xl p-8 shadow-2xl shadow-black/50">
          <div className="text-center mb-7">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
              <FiHeart className="text-white text-xl" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Join the Mission</h1>
            <p className="text-slate-400 text-sm">
              Create your account to start donating. Join verified campaigns and track your impact easily.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              icon={FiUser}
              label="Full Name *"
              name="name"
              placeholder="Moki"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
            <Field
              icon={FiMail}
              label="Email *"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
            <Field
              icon={FiLock}
              label="Password *"
              name="password"
              placeholder="Min 6 characters"
              extra="pr-12"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              isPassword
              showPassword={showPwd}
              onTogglePassword={() => setShowPwd(s => !s)}
            />
            <Field
              icon={FiPhone}
              label="Phone"
              name="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
            <Field
              icon={FiMapPin}
              label="Address"
              name="address"
              placeholder="Chennai, Tamil Nadu"
              value={form.address}
              onChange={e => set('address', e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className="input-field">
                <option value="DONOR">Donor</option>
                <option value="VOLUNTEER">Volunteer</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              type="submit" disabled={loading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Create Account'}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
