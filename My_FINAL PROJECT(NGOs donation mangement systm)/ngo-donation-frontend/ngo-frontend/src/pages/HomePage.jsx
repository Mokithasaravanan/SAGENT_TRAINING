import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiArrowUpRight,
  FiFlag,
  FiHeart,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiUsers,
  FiActivity,
  FiGift,
  FiFileText,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { getAllCampaigns, getAllNgos, getAllUrgentNeeds, getDonationHistory } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CARD_IMAGES, ROLE_GALLERY } from '../constants/imagery'
import heroImage23 from '../assets/ngo/21.jpg'
import MapPanel from '../components/MapPanel'
import PageNav from '../components/PageNav'
import StatCard from '../components/StatCard'
import { SkeletonCard } from '../components/Skeleton'

const MOCK_CAMPAIGNS = [
  { id:1, title:'Warm Meals for Chennai', description:'Daily meals for 500 families in need.', donationType:'FOOD', targetAmount:80000, collectedAmount:42000, status:'ACTIVE', ngoName:'Hope Kitchens' },
  { id:2, title:'School Kit Drive', description:'Backpacks and stationery for rural students.', donationType:'CLOTHES', targetAmount:65000, collectedAmount:34000, status:'ACTIVE', ngoName:'Bright Futures' },
  { id:3, title:'Emergency Medical Aid', description:'Critical care support for underserved villages.', donationType:'MONEY', targetAmount:120000, collectedAmount:90000, status:'ACTIVE', ngoName:'Heal India' },
]

const MOCK_NGOS = [
  { id: 1, name: 'Hope Foundation', city: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'ngo' },
  { id: 2, name: 'Seva Health Mission', city: 'Vellore', lat: 12.9165, lng: 79.1325, type: 'ngo' },
  { id: 3, name: 'Child First India', city: 'Madurai', lat: 9.9252, lng: 78.1198, type: 'ngo' },
  { id: 4, name: 'Green Earth NGO', city: 'Coimbatore', lat: 11.0168, lng: 76.9558, type: 'ngo' },
]

const DONATION_TYPES = [
  { key: 'MONEY', label: 'Money Donation', desc: 'Fast, secure contributions', icon: FiHeart, accent: 'from-emerald-500 to-teal-400' },
  { key: 'FOOD', label: 'Food Supplies', desc: 'Meals, grains, essentials', icon: FiPackage, accent: 'from-amber-500 to-orange-400' },
  { key: 'CLOTHES', label: 'Clothing Kits', desc: 'Warmth for families', icon: FiShoppingBag, accent: 'from-blue-500 to-indigo-400' },
]

const HOW_IT_WORKS = [
  { title: 'Explore Verified Campaigns', desc: 'Browse active drives and NGO needs curated by our team.', icon: FiFlag },
  { title: 'Choose Donation Type', desc: 'Give money instantly or schedule a pickup for goods.', icon: FiGift },
  { title: 'Coordinate With Volunteers', desc: 'We assign the right NGO and volunteer team for pickup.', icon: FiTruck },
  { title: 'Track & Receive Receipt', desc: 'Get confirmations, receipts, and real impact updates.', icon: FiCheckCircle },
]

const DONATION_FLOW = {
  money: [
    'Pick a campaign or NGO you want to support.',
    'Enter a donation amount and confirm.',
    'Receive an instant receipt by email.',
    'Track status updates from the NGO.',
  ],
  goods: [
    'Describe items and choose a pickup time.',
    'Volunteer is assigned for pickup.',
    'Pickup & basic quality checks are completed.',
    'Delivery confirmation is shared with you.',
  ],
}

const CAUSES = [
  { title: 'Disaster Relief', desc: 'Emergency kits, blankets, food packets for crisis zones.', icon: FiFlag },
  { title: 'Hunger & Nutrition', desc: 'Monthly groceries and cooked meals for families.', icon: FiPackage },
  { title: 'Clothing & Shelter', desc: 'Warm clothes, bedding, and hygiene kits.', icon: FiShoppingBag },
  { title: 'Education Support', desc: 'School supplies, uniforms, and mentorship programs.', icon: FiUsers },
  { title: 'Health & Care', desc: 'Medical aid, medicines, and elder care.', icon: FiActivity },
  { title: 'Local NGO Drives', desc: 'Verified NGOs across your district and city.', icon: FiMapPin },
]

const TRUST_PILLARS = [
  { title: 'Verified NGOs', desc: 'Every NGO is screened and approved before listing.', icon: FiShield },
  { title: 'Receipts & Reports', desc: 'Auto receipts + periodic impact summaries.', icon: FiFileText },
  { title: 'Volunteer Network', desc: 'Trained volunteers handle pickup and logistics.', icon: FiUsers },
  { title: 'Live Status Updates', desc: 'Track donation status with clear milestones.', icon: FiCheckCircle },
]

const FAQS = [
  { q: 'Do I need to login to explore?', a: 'No. You can browse campaigns and NGO details without signing in.' },
  { q: 'How do goods donations work?', a: 'Add items, choose pickup time, and a volunteer will collect them.' },
  { q: 'Will I get a receipt?', a: 'Yes, a receipt is sent instantly to your email after donation.' },
  { q: 'Can I donate to a specific NGO?', a: 'Yes. Choose any NGO or campaign from the list.' },
]

const toRad = (deg) => (deg * Math.PI) / 180
const distanceKm = (a, b) => {
  const R = 6371
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export default function HomePage() {
  const { user, isLoggedIn } = useAuth()
  const blockDonorUi = user?.role === 'ADMIN' || user?.role === 'VOLUNTEER'
  const isDonor = user?.role === 'DONOR'
  const isGuest = !isLoggedIn
  const donateLink = isLoggedIn ? (isDonor ? '/donate' : '/') : '/login'
  const [campaigns, setCampaigns] = useState([])
  const [ngos, setNgos] = useState([])
  const [urgentNeeds, setUrgentNeeds] = useState([])
  const [history, setHistory] = useState([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [livePos, setLivePos] = useState(null)
  const roundedLivePos = useMemo(() => (
    livePos ? [Number(livePos[0].toFixed(4)), Number(livePos[1].toFixed(4))] : null
  ), [livePos])

  useEffect(() => {
    const loadCampaigns = async () => {
      setLoadingCampaigns(true)
      try {
        const res = await getAllCampaigns()
        const all = res.data.data || []
        const active = all.filter(c => String(c.status).toUpperCase() === 'ACTIVE')
        setCampaigns(active.length ? active.slice(0, 6) : MOCK_CAMPAIGNS)
      } catch {
        setCampaigns(MOCK_CAMPAIGNS)
      } finally {
        setLoadingCampaigns(false)
      }
    }
    loadCampaigns()
  }, [])

  useEffect(() => {
    getAllNgos()
      .then(res => setNgos(res.data.data || MOCK_NGOS))
      .catch(() => setNgos(MOCK_NGOS))
  }, [])

  useEffect(() => {
    getAllUrgentNeeds()
      .then(res => setUrgentNeeds(res.data.data || []))
      .catch(() => setUrgentNeeds([]))
  }, [])

  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true)
      try {
        if (isLoggedIn && user?.role === 'DONOR') {
          const res = await getDonationHistory(user.id)
          setHistory(res.data.data || [])
        } else {
          setHistory([])
        }
      } catch {
        setHistory([])
      } finally {
        setLoadingHistory(false)
      }
    }
    loadHistory()
  }, [isLoggedIn, user])

  const stats = useMemo(() => {
    const activeCampaigns = campaigns.length
    const activeNgos = ngos.length
    const donations = history.length
    return { activeCampaigns, activeNgos, donations }
  }, [campaigns, ngos, history])

  const heroImage = heroImage23

  const publicStatCards = [
    { label: 'Active Campaigns', value: stats.activeCampaigns, icon: FiFlag, accent: 'emerald', caption: 'Verified and open' },
    { label: 'Verified NGOs', value: stats.activeNgos, icon: FiShield, accent: 'blue', caption: 'Across your region' },
    { label: 'Donation Options', value: 4, icon: FiGift, accent: 'amber', caption: 'Money & goods' },
  ]

  const donorStatCards = [
    { label: 'Active Campaigns', value: stats.activeCampaigns, icon: FiFlag, accent: 'emerald', caption: 'Verified and open' },
    { label: 'Nearby NGOs', value: stats.activeNgos, icon: FiMapPin, accent: 'blue', caption: 'Across your region' },
    { label: 'Your Donations', value: stats.donations, icon: FiHeart, accent: 'amber', caption: 'Total contributions' },
  ]

  const statCards = isLoggedIn && isDonor ? donorStatCards : publicStatCards
  const storyGallery = isLoggedIn && isDonor
    ? ROLE_GALLERY.donor
    : CARD_IMAGES.campaigns.slice(0, 3)

  const markers = useMemo(() => {
    const ngoMarkers = ngos.map(n => {
      const lat = Number(n.lat ?? n.latitude ?? 13.08)
      const lng = Number(n.lng ?? n.longitude ?? 80.27)
      return {
        id: `ngo-${n.id}`,
        type: 'ngo',
        title: n.name,
        subtitle: n.city,
        position: [lat, lng],
      }
    })
    const donorMarkers = (history.length ? history.slice(0, 2) : [{ id: 'd1' }, { id: 'd2' }]).map((d, idx) => ({
      id: `donor-${d.id || idx}`,
      type: 'donor',
      title: d.campaignTitle || 'Local Donor',
      subtitle: d.city || 'Recent contribution',
      position: [
        13.0827 + ((idx % 2) ? 0.06 : -0.04),
        80.2707 + ((idx % 2) ? -0.05 : 0.04),
      ],
    }))
    return [...ngoMarkers, ...donorMarkers]
  }, [ngos, history])

  const nearestNgos = useMemo(() => {
    if (!livePos) return []
    return ngos
      .map(n => {
        const lat = Number(n.lat ?? n.latitude ?? 13.08)
        const lng = Number(n.lng ?? n.longitude ?? 80.27)
        return { ...n, distance: distanceKm(livePos, [lat, lng]) }
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
  }, [livePos, ngos])

  const mapDirections = useMemo(() => {
    if (!roundedLivePos) return []
    const colors = ['#2563eb', '#f59e0b', '#10b981']
    return nearestNgos.map((ngo, idx) => {
      const lat = Number(ngo.lat ?? ngo.latitude ?? 13.08)
      const lng = Number(ngo.lng ?? ngo.longitude ?? 80.27)
      return {
        id: `ngo-route-${ngo.id || idx}`,
        origin: roundedLivePos,
        destination: [lat, lng],
        color: colors[idx % colors.length],
        weight: 7,
        opacity: 0.95,
        zIndex: 9,
        mode: 'DRIVING',
      }
    })
  }, [roundedLivePos, nearestNgos])

  return (
    <div className="page-section max-w-7xl mx-auto space-y-12">
      <div className="relative rounded-3xl overflow-hidden shadow-[0_25px_80px_-40px_rgba(0,0,0,0.65)]">
        <img src={heroImage} alt="home hero" className="w-full h-[360px] object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-8">
          <div className="hero-card rounded-3xl p-6 max-w-3xl">
            <p className="text-xs text-emerald-200 uppercase tracking-wider mb-2">
              {isGuest ? 'Welcome to DonateHope' : 'Donor Dashboard'}
            </p>
            <h1 className="font-display text-4xl text-white font-bold leading-tight">
              {isGuest ? (
                <>Give Hope.<br />Change Lives.</>
              ) : (
                <>Every act of giving<br /> creates measurable change</>
              )}
            </h1>
            <p className="text-sm text-slate-200 mt-3">
              {isGuest
                ? 'Explore verified NGOs, understand the full donation flow, and decide where your support matters most.'
                : 'Support verified campaigns, schedule pickups, and see transparent progress in one unified place.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              {user?.role === 'ADMIN' ? (
                <Link to="/admin" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
                  Go to Admin Console <FiArrowUpRight />
                </Link>
              ) : user?.role === 'VOLUNTEER' ? (
                <Link to="/volunteer" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
                  Go to Volunteer Desk <FiArrowUpRight />
                </Link>
              ) : isGuest ? (
                <>
                  <Link to="/campaigns" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
                    Explore Campaigns <FiArrowUpRight />
                  </Link>
                  <Link to="/login" className="btn-outline py-2.5 px-5 text-sm">
                    Sign In to Donate
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/donate" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
                    Donate Now <FiArrowUpRight />
                  </Link>
                  <Link to="/campaigns" className="btn-outline py-2.5 px-5 text-sm">
                    Explore Campaigns
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {urgentNeeds.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/20">
          <div className="flex items-center gap-2 text-rose-200 text-sm font-semibold mb-3">
            <FiFlag />
            Urgent Needs
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {urgentNeeds.slice(0, 2).map((u, idx) => (
              <motion.div
                key={u.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20"
              >
                <p className="text-sm font-semibold text-rose-100">{u.title}</p>
                <p className="text-xs text-rose-100/70 mt-1">{u.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
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

      {!blockDonorUi && (
        <section id="how-it-works" className="space-y-4">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">How It Works</h2>
            <p className="text-sm text-slate-300">
              A simple, transparent flow from discovery to delivery. No sign-in needed to explore.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-500/20">
                  <step.icon />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{step.desc}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mt-4">Step {i + 1}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!blockDonorUi && (
        <section className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-200 flex items-center justify-center">
                <FiHeart />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Money Donation Flow</h3>
                <p className="text-xs text-slate-300">Fast and secure contributions</p>
              </div>
            </div>
            <div className="space-y-3">
              {DONATION_FLOW.money.map((item, idx) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-200/90">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-200 flex items-center justify-center text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-panel rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-200 flex items-center justify-center">
                <FiTruck />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Goods Donation Flow</h3>
                <p className="text-xs text-slate-300">Pickup and delivery handled for you</p>
              </div>
            </div>
            <div className="space-y-3">
              {DONATION_FLOW.goods.map((item, idx) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-200/90">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-200 flex items-center justify-center text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {!blockDonorUi && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">Who You Help</h2>
            <p className="text-sm text-slate-300">Choose causes and NGOs that match your heart.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAUSES.map((cause, i) => (
              <motion.div
                key={cause.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5 border border-white/10"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white mb-3">
                  <cause.icon />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{cause.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{cause.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">Active Campaigns</h2>
            <p className="text-sm text-slate-300">Support the most urgent causes right now.</p>
          </div>
          <Link to="/campaigns" className="text-sm text-emerald-200 hover:text-emerald-100">View all</Link>
        </div>

        {loadingCampaigns ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {campaigns.slice(0, 3).map((c, i) => {
              const collected = Number(c.collectedAmount || c.currentAmount || c.targetAmount * 0.45)
              const target = Number(c.targetAmount || 1)
              const pct = Math.min(100, Math.round((collected / target) * 100))
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl overflow-hidden border border-white/10"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img src={CARD_IMAGES.campaigns[i % CARD_IMAGES.campaigns.length]} alt={c.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/20 to-transparent" />
                    <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200">
                      {c.donationType}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{c.title}</h3>
                      <p className="text-xs text-slate-600">{c.ngoName}</p>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>₹{collected.toLocaleString()} raised</span>
                        <span className="text-emerald-600 font-semibold">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-emerald-900/20 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Link to={donateLink} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      Contribute now <FiArrowUpRight />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <MapPanel
          title="Nearby NGOs"
          subtitle="Switch on live tracking to find the closest NGO drives"
          markers={markers}
          directions={mapDirections}
          center={[13.0827, 80.2707]}
          zoom={7}
          enableLiveToggle
          onLivePosition={setLivePos}
          height={360}
        />

        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Closest to You</h3>
          {nearestNgos.length === 0 ? (
            <div className="text-sm text-slate-400">Enable live tracking to see distance.</div>
          ) : (
            <div className="space-y-3">
              {nearestNgos.map((ngo, idx) => (
                <div key={ngo.id || idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm font-semibold text-white">{ngo.name}</p>
                  <p className="text-xs text-slate-400">{ngo.city}</p>
                  <p className="text-xs text-emerald-200 mt-1">{ngo.distance.toFixed(1)} km away</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {!blockDonorUi && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">Choose Donation Type</h2>
            <p className="text-sm text-slate-300">Pick the form of help that suits you best.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {DONATION_TYPES.map((type, i) => (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5 border border-white/10"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.accent} flex items-center justify-center text-white mb-3`}>
                  <type.icon />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{type.label}</h3>
                <p className="text-xs text-slate-600 mt-1">{type.desc}</p>
                <Link to={donateLink} className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1 mt-3">
                  Start now <FiArrowUpRight />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!blockDonorUi && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">NGO Stories in Action</h2>
            <p className="text-sm text-slate-300">Snapshots from our partner NGOs on the field.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {ROLE_GALLERY.donor.map((img, i) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl overflow-hidden border border-white/10"
              >
                <img src={img} alt="ngo story" className="w-full h-44 object-cover" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!blockDonorUi && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">Your Recent Impact</h2>
            <p className="text-sm text-slate-300">Quick glance at your last contributions.</p>
          </div>
          {loadingHistory ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : history.length === 0 ? (
            <div className="text-sm text-slate-400">No donations yet. Your first contribution is just a click away.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {history.slice(0, 3).map((d, i) => (
                <motion.div
                  key={d.id || i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl overflow-hidden border border-white/10"
                >
                  <div className="relative h-32">
                    <img src={CARD_IMAGES.donorStories[i % CARD_IMAGES.donorStories.length]} alt="impact" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-slate-900">{d.campaignTitle || 'Donation'}</p>
                    <p className="text-xs text-slate-600">{d.donationType} · {new Date(d.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {!blockDonorUi && (
        <section className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">Trust & Transparency</h2>
            <p className="text-sm text-slate-300">Every donation is verified, tracked, and reported.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_PILLARS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-200 flex items-center justify-center mb-3">
                  <item.icon />
                </div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-300 mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!blockDonorUi && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-display text-white font-bold">Frequently Asked</h2>
            <p className="text-sm text-slate-300">Clear answers before you donate.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {FAQS.map((item) => (
              <div key={item.q} className="glass rounded-2xl p-5 border border-white/10">
                <p className="text-sm font-semibold text-slate-900">{item.q}</p>
                <p className="text-xs text-slate-600 mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!blockDonorUi && (
        <section className="relative overflow-hidden rounded-3xl p-8 glass-panel border border-white/10">
          <div className="absolute -top-20 right-0 w-72 h-72 bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-0 w-72 h-72 bg-sky-400/20 blur-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-200 mb-2">Ready to help?</p>
              <h2 className="text-3xl font-display text-white font-bold">Start your first donation today</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-xl">
                Browse campaigns, choose a trusted NGO, and donate in minutes. Your impact begins here.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isLoggedIn && isDonor ? (
                <Link to="/donate" className="btn-primary py-3 px-6 text-sm flex items-center gap-2">
                  Donate Now <FiArrowUpRight />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-primary py-3 px-6 text-sm flex items-center gap-2">
                    Sign In to Donate <FiArrowUpRight />
                  </Link>
                  <Link to="/register" className="btn-outline py-3 px-6 text-sm">
                    Create Account
                  </Link>
                </>
              )}
              <Link to="/campaigns" className="btn-outline py-3 px-6 text-sm">
                Browse Campaigns
              </Link>
            </div>
          </div>
        </section>
      )}

      {!blockDonorUi && <PageNav current="/" />}
    </div>
  )
}
