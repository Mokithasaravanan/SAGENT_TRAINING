import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiAward,
  FiTrendingUp,
  FiHeart,
  FiUsers,
  FiMapPin,
  FiCalendar,
  FiMail,
  FiStar,
} from 'react-icons/fi'
import { PAGE_BACKGROUNDS, CARD_IMAGES } from '../constants/imagery'
import StatCard from '../components/StatCard'

const LEADERBOARD = [
  { id: 1, name: 'Anitha R',  city: 'Chennai',    email: 'anitha.r@donors.org',  total: 250000, donations: 18, cause: 'Education',  lastDonation: '2026-02-18', since: '2019', tier: 'Platinum' },
  { id: 2, name: 'Karthik S', city: 'Coimbatore', email: 'karthik.s@donors.org', total: 185000, donations: 12, cause: 'Healthcare',  lastDonation: '2026-02-11', since: '2020', tier: 'Gold' },
  { id: 3, name: 'Priya M',   city: 'Madurai',    email: 'priya.m@donors.org',   total: 150000, donations: 14, cause: 'Nutrition',  lastDonation: '2026-02-02', since: '2021', tier: 'Gold' },
  { id: 4, name: 'Arun V',    city: 'Salem',      email: 'arun.v@donors.org',    total: 120000, donations: 9,  cause: 'Relief',     lastDonation: '2026-01-27', since: '2022', tier: 'Silver' },
  { id: 5, name: 'Deepa K',   city: 'Trichy',     email: 'deepa.k@donors.org',   total: 98000,  donations: 8,  cause: 'Women Care', lastDonation: '2026-01-19', since: '2022', tier: 'Silver' },
  { id: 6, name: 'Ramesh P',  city: 'Erode',      email: 'ramesh.p@donors.org',  total: 82000,  donations: 6,  cause: 'Education',  lastDonation: '2026-01-12', since: '2023', tier: 'Bronze' },
  { id: 7, name: 'Sanjana T', city: 'Vellore',    email: 'sanjana.t@donors.org', total: 76000,  donations: 7,  cause: 'Elder Care', lastDonation: '2026-01-05', since: '2023', tier: 'Bronze' },
  { id: 8, name: 'Imran A',   city: 'Chennai',    email: 'imran.a@donors.org',   total: 69000,  donations: 5,  cause: 'Clean Water',lastDonation: '2025-12-28', since: '2023', tier: 'Bronze' },
]

const TOP_DONORS = LEADERBOARD.slice(0, 3)

const CONTACT_DETAILS = [
  {
    label: 'Head Office',
    value: 'C–14 Qutab Institutional Area, New Delhi – 110016',
    meta: 'India',
  },
  {
    label: 'Email',
    value: 'helpageindia@sc',
    meta: '24/7 inbox',
  },
  {
    label: 'Phone & UPI',
    value: '+91 112 233 4455 · helpageindia@sc',
    meta: 'Support & donations',
  },
]

const tierStyles = {
  Platinum: 'bg-amber-500/15 text-amber-700 border-amber-400/30',
  Gold: 'bg-yellow-500/15 text-yellow-700 border-yellow-400/30',
  Silver: 'bg-slate-500/10 text-slate-700 border-slate-400/30',
  Bronze: 'bg-orange-500/10 text-orange-700 border-orange-400/30',
}

const maskEmail = (value) => {
  if (!value || !value.includes('@')) return value || ''
  const [name, domain] = value.split('@')
  const visible = name.slice(0, 2)
  const masked = `${visible}${'*'.repeat(Math.max(1, name.length - 2))}`
  return `${masked}@${domain}`
}

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

export default function AchievementsPage() {
  const stats = useMemo(() => {
    const totalRaised = LEADERBOARD.reduce((sum, d) => sum + d.total, 0)
    const avgGift = Math.round(totalRaised / LEADERBOARD.length)
    const uniqueCities = new Set(LEADERBOARD.map(d => d.city)).size
    return [
      { label: 'Donors Honored', value: LEADERBOARD.length, icon: FiUsers, accent: 'emerald', caption: 'Lifetime champions' },
      { label: 'Total Raised', value: formatCurrency(totalRaised), icon: FiTrendingUp, accent: 'amber', caption: 'Across campaigns' },
      { label: 'Avg. Gift', value: formatCurrency(avgGift), icon: FiHeart, accent: 'rose', caption: 'Per donor' },
      { label: 'Cities', value: uniqueCities, icon: FiMapPin, accent: 'blue', caption: 'Tamil Nadu & beyond' },
    ]
  }, [])

  return (
    <div className="page-section max-w-7xl mx-auto space-y-10">
      <div className="relative rounded-3xl overflow-hidden h-56">
        <img
          src={PAGE_BACKGROUNDS.achievements || PAGE_BACKGROUNDS.donorHome}
          alt="achievements"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="max-w-2xl bg-white/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-white/60">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700 mb-2">Hall of Fame</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Donor <span className="text-emerald-700">Achievements</span>
              </h1>
              <p className="text-slate-700 text-sm">
                Recognizing the champions who consistently fuel life-changing NGO missions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
            caption={card.caption}
          />
        ))}
      </div>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">Top Donors</h2>
            <p className="text-sm text-slate-300">Highest lifetime contributions this season.</p>
          </div>
          <div className="text-xs text-slate-400">Updated monthly</div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {TOP_DONORS.map((donor, idx) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="glass rounded-3xl overflow-hidden border border-white/10"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={CARD_IMAGES.donorStories[idx % CARD_IMAGES.donorStories.length]}
                  alt={donor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/40">
                    Rank #{idx + 1}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full border ${tierStyles[donor.tier] || tierStyles.Bronze}`}>
                    {donor.tier}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{donor.name}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <FiMapPin /> {donor.city}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <FiAward />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-2xl bg-white/70 border border-white/60">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Total</p>
                    <p className="text-slate-900 font-semibold">{formatCurrency(donor.total)}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/70 border border-white/60">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Donations</p>
                    <p className="text-slate-900 font-semibold">{donor.donations}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/70 border border-white/60">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Top Cause</p>
                    <p className="text-slate-900 font-semibold">{donor.cause}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/70 border border-white/60">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Member Since</p>
                    <p className="text-slate-900 font-semibold">{donor.since}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">Leaderboard</h2>
            <p className="text-sm text-slate-300">Detailed donor impact and recognition.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <FiStar /> Top supporters
          </div>
        </div>
        <div className="glass rounded-3xl p-5 overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[60px_1.2fr_1fr_1fr_1fr_1fr] gap-4 text-[10px] uppercase tracking-wider text-slate-500 px-2 pb-3">
              <span>Rank</span>
              <span>Donor</span>
              <span>Email</span>
              <span>City</span>
              <span>Total</span>
              <span>Last Gift</span>
            </div>
            {LEADERBOARD.map((donor, idx) => (
              <div
                key={donor.id}
                className="grid grid-cols-[60px_1.2fr_1fr_1fr_1fr_1fr] gap-4 items-center px-2 py-3 border-t border-slate-200/60 text-sm text-slate-700"
              >
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-700 text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{donor.name}</p>
                  <p className="text-xs text-slate-500">{donor.cause} · {donor.donations} gifts</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <FiMail /> {maskEmail(donor.email)}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <FiMapPin /> {donor.city}
                </div>
                <div className="text-sm font-semibold text-emerald-700">{formatCurrency(donor.total)}</div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <FiCalendar /> {new Date(donor.lastDonation).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-200 mb-2">Next milestone</p>
            <h3 className="text-2xl font-display text-white font-bold">Become a hall-of-fame donor</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-xl">
              Donate to verified campaigns and earn recognition across the NGO Hub community.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary py-3 px-6 text-sm flex items-center gap-2">
              Sign In to Donate <FiHeart />
            </Link>
            <Link to="/campaigns" className="btn-outline py-3 px-6 text-sm">
              Explore Campaigns
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-display text-white font-bold">Contact Details</h2>
          <p className="text-sm text-slate-300">Reach HelpAge India for partnerships, donations, or queries.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {CONTACT_DETAILS.map((item) => (
            <div key={item.label} className="glass rounded-2xl p-5 border border-white/10">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-200 mb-2">{item.label}</p>
              <p className="text-sm text-slate-900 font-semibold">{item.value}</p>
              <p className="text-xs text-slate-500 mt-1">{item.meta}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
