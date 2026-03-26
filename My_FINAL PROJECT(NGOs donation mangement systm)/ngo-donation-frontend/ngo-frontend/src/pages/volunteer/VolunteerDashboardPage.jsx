import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiClock, FiMapPin, FiPlayCircle } from 'react-icons/fi'
import { PAGE_BACKGROUNDS, ROLE_GALLERY } from '../../constants/imagery'
import StatCard from '../../components/StatCard'
import MapPanel from '../../components/MapPanel'
import useVolunteerTasks from '../../hooks/useVolunteerTasks'

const formatAmount = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return `₹${amount.toLocaleString('en-IN')}`
}

const extractDonationMeta = (task) => {
  const donation = task?.donation || task?.donationDetails || task?.donationInfo || {}
  const campaign = task?.campaign || donation?.campaign || {}
  return {
    type: task?.donationType || task?.itemType || donation?.donationType || donation?.itemType,
    amount: task?.amount ?? task?.donationAmount ?? donation?.amount ?? donation?.donationAmount,
    items: task?.itemDescription || task?.items || donation?.itemDescription || donation?.items,
    campaignTitle: task?.campaignTitle || donation?.campaignTitle || campaign?.title,
  }
}

const donationSummary = (task) => {
  const meta = extractDonationMeta(task)
  const amount = formatAmount(meta.amount)
  if (meta.type && amount) return `${meta.type} • ${amount}`
  if (amount) return amount
  if (meta.type && meta.items) return `${meta.type} • ${meta.items}`
  if (meta.items) return meta.items
  if (meta.type) return meta.type
  return null
}

export default function VolunteerDashboardPage() {
  const { tasks } = useVolunteerTasks()

  const counts = useMemo(() => {
    const base = { ASSIGNED: 0, IN_PROGRESS: 0, COMPLETED: 0 }
    tasks.forEach(t => { base[t.status] = (base[t.status] || 0) + 1 })
    return base
  }, [tasks])

  const markers = tasks.slice(0, 4).map((t, idx) => ({
    id: t.id || idx,
    type: 'pickup',
    title: t.donorName || 'Pickup',
    subtitle: t.pickupAddress,
    position: [
      13.0827 + (idx % 2 === 0 ? 0.08 : -0.04),
      80.2707 + (idx % 3 === 0 ? 0.05 : -0.03),
    ],
  }))

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-52">
        <img src={PAGE_BACKGROUNDS.volunteerOverview} alt="volunteer overview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="hero-card rounded-2xl p-5 max-w-2xl">
            <p className="text-xs text-amber-200 uppercase tracking-wider mb-2">Volunteer Mission</p>
            <h2 className="font-display text-2xl text-white font-bold">Your work delivers real relief</h2>
            <p className="text-sm text-slate-200 mt-2">Track tasks, navigate pickups, and update statuses on the go.</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Assigned" value={counts.ASSIGNED} icon={FiClock} accent="amber" caption="Ready to start" />
        <StatCard label="In Progress" value={counts.IN_PROGRESS} icon={FiPlayCircle} accent="blue" caption="Active pickups" />
        <StatCard label="Completed" value={counts.COMPLETED} icon={FiCheckCircle} accent="emerald" caption="Delivered today" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MapPanel
          title="Nearby Pickups"
          subtitle="Live map of top pickup locations"
          markers={markers}
          center={[13.0827, 80.2707]}
          zoom={10}
          enableLiveToggle
          height={320}
        />

        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>
          <div className="space-y-3">
            {tasks.slice(0, 3).map((t, i) => {
              const summary = donationSummary(t)
              return (
                <motion.div
                  key={t.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white">{t.donorName || 'Donor'}</p>
                    <span className="text-xs text-amber-200 bg-amber-500/20 px-2.5 py-1 rounded-full">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  {summary && (
                    <p className="text-xs text-slate-400 mb-2 break-words">
                      {summary}
                    </p>
                  )}
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <FiMapPin className="text-amber-300 mt-0.5" />
                    <span>{t.pickupAddress}</span>
                  </div>
                </motion.div>
              )
            })}
            {tasks.length === 0 && (
              <div className="text-sm text-slate-400">No assignments yet. Stay on standby.</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Volunteer Field Moments</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {ROLE_GALLERY.volunteer.map((img, i) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden border border-white/10"
            >
              <img src={img} alt="volunteer moment" className="w-full h-40 object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
