import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiPhone, FiShield, FiMail, FiMapPin, FiRefreshCw, FiUsers } from 'react-icons/fi'
import { getAllVolunteers } from '../../services/api'

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState([])
  const [loading,    setLoading]    = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAllVolunteers()
      console.log('Volunteers API response:', res.data)
      const data = res.data.data || res.data || []
      setVolunteers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Volunteers fetch error:', err)
      toast.error('Failed to load volunteers')
      setVolunteers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-8">

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80"
          alt="volunteers"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-950/50" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 max-w-2xl border border-white/10">
            <p className="text-xs text-emerald-300 uppercase tracking-wider mb-2">
              Volunteer Operations
            </p>
            <h2 className="font-display text-2xl text-white font-bold">
              Coordinate the on-ground response team
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Track contact details and readiness for every volunteer.
            </p>
          </div>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiUsers className="text-emerald-400" />
          <p className="text-sm text-slate-400">
            {loading ? 'Loading...' : `${volunteers.length} volunteer${volunteers.length !== 1 ? 's' : ''} registered`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl
                     text-slate-400 hover:text-emerald-400 text-sm transition-all"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 w-full rounded-2xl" />
          ))}
        </div>

      ) : volunteers.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/5">
          <div className="text-5xl mb-4">🤝</div>
          <p className="text-white font-semibold text-lg mb-2">
            No volunteers registered yet
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Volunteers need to register via the app
          </p>

          {/* How to add volunteers guide */}
          <div className="max-w-sm mx-auto text-left bg-emerald-500/10
                          border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-emerald-400 text-xs font-semibold mb-3">
              ✅ How to add volunteers:
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <p>1️⃣ Open Postman</p>
              <p>2️⃣ POST /api/auth/register</p>
              <p className="bg-slate-800 rounded-lg p-2 font-mono text-xs text-emerald-300">
                {`{\n  "name": "Volunteer Sam",\n  "email": "vol@example.com",\n  "password": "pass123",\n  "role": "VOLUNTEER"\n}`}
              </p>
              <p>3️⃣ Click Refresh button above</p>
            </div>
          </div>
        </div>

      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {volunteers.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-2xl p-5 border border-white/10
                         hover:border-emerald-500/30 transition-all"
            >
              {/* Top row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br
                                from-emerald-500 to-teal-400 flex items-center
                                justify-center text-slate-950 font-bold text-lg
                                flex-shrink-0">
                  {v.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {v.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {v.email}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full
                                 bg-emerald-500/15 text-emerald-300
                                 border border-emerald-500/20 flex-shrink-0">
                  ACTIVE
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <FiPhone className="text-emerald-400 flex-shrink-0" />
                  <span>{v.phone || 'Phone not provided'}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <FiMail className="text-teal-400 flex-shrink-0" />
                  <span className="truncate">{v.email}</span>
                </div>

                {v.address && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <FiMapPin className="text-amber-400 flex-shrink-0" />
                    <span className="truncate">{v.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-400
                                pt-2 border-t border-white/5">
                  <FiShield className="text-emerald-400 flex-shrink-0" />
                  <span>Assigned to pickup & delivery operations</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
