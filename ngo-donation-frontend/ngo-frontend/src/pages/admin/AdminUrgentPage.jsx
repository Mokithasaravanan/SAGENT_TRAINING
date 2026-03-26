import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiAlertTriangle, FiPlus, FiRefreshCw } from 'react-icons/fi'
import { createUrgentNeed, getAllUrgentNeeds } from '../../services/api'
import { PAGE_BACKGROUNDS } from '../../constants/imagery'
import { useAuth } from '../../context/AuthContext'
import { SkeletonRow } from '../../components/Skeleton'

export default function AdminUrgentPage() {
  const { user } = useAuth()
  const [urgentNeeds, setUrgentNeeds] = useState([])
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAllUrgentNeeds()
      setUrgentNeeds(res.data.data || [])
    } catch {
      setUrgentNeeds([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!user?.id) {
      toast.error('Login required')
      return
    }
    setSaving(true)
    try {
      await createUrgentNeed({ ...form, createdByAdminId: user.id })
      toast.success('Urgent need posted')
      setForm({ title: '', description: '' })
      load()
    } catch {
      toast.error('Failed to post urgent need')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img src={PAGE_BACKGROUNDS.adminUrgent} alt="urgent needs" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="hero-card rounded-2xl p-5 max-w-2xl">
            <p className="text-xs text-rose-200 uppercase tracking-wider mb-2">Urgent Needs</p>
            <h2 className="font-display text-2xl text-white font-bold">Alert donors to immediate priorities</h2>
            <p className="text-sm text-slate-200 mt-2">Post time-sensitive requests that appear on donor dashboards.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiPlus className="text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Create Urgent Banner</h3>
          </div>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title (e.g., URGENT: Flood Relief)"
              className="input-field"
            />
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the need, impact, and timeline"
              className="input-field resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiAlertTriangle />}
              Post Urgent Need
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-rose-300" />
              <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            </div>
            <button onClick={load} className="text-xs text-slate-300 flex items-center gap-1">
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : urgentNeeds.length === 0 ? (
            <div className="text-sm text-slate-400">No urgent alerts posted.</div>
          ) : (
            <div className="space-y-3">
              {urgentNeeds.map((u, i) => (
                <motion.div
                  key={u.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20"
                >
                  <p className="text-sm font-semibold text-rose-100">{u.title}</p>
                  <p className="text-xs text-rose-100/70 mt-2">{u.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
