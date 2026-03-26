import React from 'react'

export default function StatCard({ label, value, icon: Icon, accent = 'emerald', caption }) {
  const accentMap = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-200',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-200',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-200',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-200',
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-200',
  }

  return (
    <div className="rounded-2xl p-4 flex items-center gap-4 border border-white/40 bg-transparent">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${accentMap[accent] || accentMap.emerald}`}>
        {Icon && <Icon className="text-xl" />}
      </div>
      <div>
        <p className="text-xs text-slate-300 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-bold text-white mt-1">{value}</p>
        {caption && <p className="text-xs text-slate-400 mt-1">{caption}</p>}
      </div>
    </div>
  )
}
