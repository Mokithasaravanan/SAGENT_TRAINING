import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiAlertTriangle, FiBarChart2, FiFlag, FiLayers, FiUsers } from 'react-icons/fi'
import {
  getAllCampaigns,
  getAllDonationRequests,
  getAllDonors,
  getAllUrgentNeeds,
  getAllVolunteers,
} from '../../services/api'
import { PAGE_BACKGROUNDS, ROLE_GALLERY } from '../../constants/imagery'
import StatCard from '../../components/StatCard'

const MONTHLY_SERIES = [32, 44, 28, 56, 62, 48, 72, 84, 64, 70, 88, 96]
const VOLUNTEER_SERIES = [6, 10, 14, 9, 16, 22, 20]

const extractArray = (res, keys = []) => {
  if (!res) return []
  if (Array.isArray(res)) return res
  const data = res?.data ?? res
  if (Array.isArray(data?.data)) return data.data
  for (const key of keys) {
    const value = data?.[key] ?? data?.data?.[key]
    if (Array.isArray(value)) return value
  }
  if (Array.isArray(data?.content)) return data.content
  return Array.isArray(data) ? data : []
}

const normalizeDonationType = (type) => {
  const t = String(type || '').toUpperCase().trim()
  if (!t) return ''
  if (t.includes('MONEY') || t.includes('CASH')) return 'MONEY'
  if (t.includes('CLOTH')) return 'CLOTHES'
  if (t.includes('FOOD')) return 'FOOD'
  if (t.includes('GROC')) return 'GROCERY'
  return t
}

const normalizeDonationStatus = (status) => {
  if (status === true || status === 1 || status === '1') return 'APPROVED'
  if (status === false || status === 0 || status === '0') return 'PENDING'
  const s = String(status || '').toUpperCase().trim()
  if (!s) return 'PENDING'
  if (s.includes('APPROV') || s === 'CONFIRMED' || s === 'ACTIVE') return 'APPROVED'
  if (s.includes('REJECT')) return 'REJECTED'
  if (s.includes('PEND') || s.includes('WAIT')) return 'PENDING'
  return s
}

const normalizeDonation = (d) => ({
  ...d,
  donationType: normalizeDonationType(
    d?.donationType ?? d?.type ?? d?.itemType ?? d?.category
  ),
  amount: d?.amount ?? d?.donationAmount ?? d?.value,
  status: normalizeDonationStatus(
    d?.status ??
    d?.approvalStatus ??
    d?.donationStatus ??
    d?.approved
  ),
})

const toNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export default function AdminDashboardPage() {
  const [campaigns, setCampaigns] = useState([])
  const [donors, setDonors] = useState([])
  const [donations, setDonations] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [urgentNeeds, setUrgentNeeds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [cRes, dRes, vRes, uRes, dnRes] = await Promise.allSettled([
          getAllCampaigns(),
          getAllDonors(),
          getAllVolunteers(),
          getAllUrgentNeeds(),
          getAllDonationRequests(),
        ])
        setCampaigns(cRes.status === 'fulfilled' ? cRes.value.data.data || [] : [])
        setDonors(dRes.status === 'fulfilled' ? dRes.value.data.data || [] : [])
        setVolunteers(vRes.status === 'fulfilled' ? vRes.value.data.data || [] : [])
        setUrgentNeeds(uRes.status === 'fulfilled' ? uRes.value.data.data || [] : [])
        const donationList = dnRes.status === 'fulfilled'
          ? extractArray(dnRes.value, ['donations', 'requests', 'items', 'results', 'data'])
          : []
        setDonations(Array.isArray(donationList) ? donationList.map(normalizeDonation) : [])
      } catch {
        setCampaigns([])
        setDonors([])
        setDonations([])
        setVolunteers([])
        setUrgentNeeds([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => String(c.status).toUpperCase() === 'ACTIVE').length
    const pendingCampaigns = campaigns.filter(c => String(c.status).toUpperCase() === 'PENDING').length
    const donationRaised = donations.reduce((sum, d) => {
      const amount = toNumber(
        d?.amount ??
        d?.donationAmount ??
        d?.value ??
        d?.donation?.amount ??
        d?.donation?.value ??
        0
      )
      return sum + amount
    }, 0)
    const totalRaised = donationRaised
    return {
      activeCampaigns,
      pendingCampaigns,
      totalRaised,
    }
  }, [campaigns, donations])

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-56">
        <img src={PAGE_BACKGROUNDS.adminOverview} alt="admin overview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="hero-card rounded-2xl p-6 max-w-3xl">
            <p className="text-xs text-emerald-200 uppercase tracking-wider mb-2">Operations Command</p>
            <h2 className="font-display text-3xl text-white font-bold">Unified Control for NGO Impact</h2>
            <p className="text-sm text-slate-200 mt-2">
              Monitor campaigns, donors, volunteers, and urgent needs from a single, secure workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Donations"
          value={`₹${Math.round(stats.totalRaised).toLocaleString()}`}
          icon={FiBarChart2}
          accent="emerald"
          caption="All campaigns combined"
        />
        <StatCard
          label="Active Campaigns"
          value={stats.activeCampaigns}
          icon={FiFlag}
          accent="blue"
          caption="Currently receiving funds"
        />
        <StatCard
          label="Pending Approvals"
          value={stats.pendingCampaigns}
          icon={FiLayers}
          accent="amber"
          caption="Require admin review"
        />
        <StatCard
          label="Volunteers Onboarded"
          value={volunteers.length}
          icon={FiUsers}
          accent="violet"
          caption="Ready for assignments"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Donation Flow</h3>
              <p className="text-xs text-slate-300">Monthly monetary & goods contributions</p>
            </div>
            <span className="text-xs text-emerald-200 bg-emerald-500/20 px-2.5 py-1 rounded-full">Last 12 months</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {MONTHLY_SERIES.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ duration: 0.8, delay: idx * 0.04 }}
                className="flex-1 rounded-lg bg-gradient-to-t from-emerald-500 to-teal-400/70"
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-3">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Volunteer Activity</h3>
              <p className="text-xs text-slate-300">Completed pickups & on-field tasks</p>
            </div>
            <span className="text-xs text-amber-200 bg-amber-500/20 px-2.5 py-1 rounded-full">Last 7 days</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {VOLUNTEER_SERIES.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${value * 4}px` }}
                  transition={{ duration: 0.7, delay: idx * 0.05 }}
                  className="w-full rounded-lg bg-gradient-to-t from-amber-500 to-orange-400"
                />
                <span className="text-[10px] text-slate-400">{['M','T','W','T','F','S','S'][idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Campaigns</h3>
          <div className="space-y-3">
            {(campaigns.slice(0, 4)).map((c, i) => (
              <motion.div
                key={c.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <p className="text-sm font-medium text-white">{c.title || 'Campaign'}</p>
                  <p className="text-xs text-slate-400">{c.ngoName || 'Partner NGO'}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200">
                  {c.status || 'ACTIVE'}
                </span>
              </motion.div>
            ))}
            {!loading && campaigns.length === 0 && (
              <div className="text-sm text-slate-400">No campaigns registered yet.</div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FiAlertTriangle className="text-rose-300" />
            <h3 className="text-lg font-semibold text-white">Urgent Alerts</h3>
          </div>
          <div className="space-y-3">
            {urgentNeeds.slice(0, 3).map((u, i) => (
              <motion.div
                key={u.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20"
              >
                <p className="text-sm font-semibold text-rose-100">{u.title}</p>
                <p className="text-xs text-rose-100/70 mt-1 line-clamp-2">{u.description}</p>
              </motion.div>
            ))}
            {!loading && urgentNeeds.length === 0 && (
              <div className="text-xs text-slate-400">No urgent alerts posted.</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFlag className="text-emerald-300" />
          <h3 className="text-lg font-semibold text-white">NGO Highlights</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {ROLE_GALLERY.admin.map((img, i) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden border border-white/10"
            >
              <img src={img} alt="ngo highlight" className="w-full h-40 object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
