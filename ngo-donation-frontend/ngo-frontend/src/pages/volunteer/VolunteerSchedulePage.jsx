import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi'
import { PAGE_BACKGROUNDS } from '../../constants/imagery'
import useVolunteerTasks from '../../hooks/useVolunteerTasks'

const formatDay = (dateStr) => {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function VolunteerSchedulePage() {
  const { tasks } = useVolunteerTasks()

  const grouped = useMemo(() => {
    const map = {}
    tasks.forEach(task => {
      const key = task.pickupTime ? formatDay(task.pickupTime) : 'Unscheduled'
      map[key] = map[key] || []
      map[key].push(task)
    })
    return map
  }, [tasks])

  const days = Object.keys(grouped)

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img src={PAGE_BACKGROUNDS.volunteerSchedule} alt="volunteer schedule" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="hero-card rounded-2xl p-5 max-w-2xl">
            <p className="text-xs text-amber-200 uppercase tracking-wider mb-2">Weekly Schedule</p>
            <h2 className="font-display text-2xl text-white font-bold">Plan your week of pickups</h2>
            <p className="text-sm text-slate-200 mt-2">Stay prepared with a clear day-by-day agenda.</p>
          </div>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="text-sm text-slate-400">No scheduled tasks yet.</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {days.map((day, idx) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel rounded-2xl p-5 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-3 text-amber-200 text-sm font-semibold">
                <FiCalendar />
                {day}
              </div>
              <div className="space-y-3">
                {grouped[day].map(task => (
                  <div key={task.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-white font-semibold">{task.donorName || 'Donor'}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <FiMapPin className="text-amber-300" />
                      {task.pickupAddress}
                    </div>
                    {task.pickupTime && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <FiClock className="text-amber-300" />
                        {new Date(task.pickupTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
