import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

const pages = ['/', '/ngos', '/campaigns']
const labels = { '/': 'Home', '/ngos': 'NGOs', '/campaigns': 'Campaigns' }

export default function PageNav({ current }) {
  const navigate = useNavigate()
  const idx  = pages.indexOf(current)
  if (idx === -1) return null
  const prev = idx > 0 ? pages[idx - 1] : null
  const next = idx < pages.length - 1 ? pages[idx + 1] : null

  return (
    <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/10 max-w-7xl mx-auto px-4">
      {prev ? (
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate(prev)}
          className="flex items-center gap-2 text-slate-300 hover:text-emerald-200 transition-colors"
        >
          <FiArrowLeft />
          <span className="text-sm">{labels[prev]}</span>
        </motion.button>
      ) : <div />}

      <div className="flex gap-1.5">
        {pages.map(p => (
          <button
            key={p}
            onClick={() => navigate(p)}
          className={`w-2 h-2 rounded-full transition-all ${p === current ? 'bg-emerald-400 w-6' : 'bg-slate-500 hover:bg-slate-400'}`}
        />
      ))}
      </div>

      {next ? (
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => navigate(next)}
          className="flex items-center gap-2 text-slate-300 hover:text-emerald-200 transition-colors"
        >
          <span className="text-sm">{labels[next]}</span>
          <FiArrowRight />
        </motion.button>
      ) : <div />}
    </div>
  )
}
