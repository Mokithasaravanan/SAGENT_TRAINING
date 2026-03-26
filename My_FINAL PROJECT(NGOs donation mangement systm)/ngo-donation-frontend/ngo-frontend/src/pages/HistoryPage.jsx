import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiDollarSign, FiPackage, FiShoppingBag, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { getDonationHistory, getMyPickups } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { SkeletonRow } from '../components/Skeleton'
import PageNav from '../components/PageNav'
import { PAGE_BACKGROUNDS } from '../constants/imagery'
import GoogleMapCanvas from '../components/GoogleMapCanvas'

const TYPE_CFG = {
  MONEY:   { icon: FiDollarSign, color:'text-amber-400',   bg:'bg-amber-400/10' },
  CLOTHES: { icon: FiShoppingBag,color:'text-purple-400',  bg:'bg-purple-400/10' },
  FOOD:    { icon: FiPackage,    color:'text-rose-400',    bg:'bg-rose-400/10' },
  GROCERY: { icon: FiPackage,    color:'text-blue-400',    bg:'bg-blue-400/10' },
}

const MAP_MARKER_COLORS = {
  donor: '#E53935',
  ngo: '#22C55E',
  live: '#1E88E5',
}

const NGO_POINTS = [
  { id:'ngo-1', name:'Hope Foundation',       city:'Chennai',      lat:13.0827, lng:80.2707 },
  { id:'ngo-2', name:'Green Earth NGO',       city:'Coimbatore',   lat:11.0168, lng:76.9558 },
  { id:'ngo-3', name:'Child First India',     city:'Madurai',      lat:9.9252,  lng:78.1198 },
  { id:'ngo-4', name:'Senior Care Society',   city:'Trichy',       lat:10.7905, lng:78.7047 },
  { id:'ngo-5', name:'Seva Health Mission',   city:'Vellore',      lat:12.9165, lng:79.1325 },
  { id:'ngo-6', name:'Disaster Response Unit',city:'Nagapattinam', lat:10.7672, lng:79.8423 },
]

const toRad = (deg) => (deg * Math.PI) / 180
const distanceKm = (a, b) => {
  const R = 6371
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return 2 * R * Math.asin(Math.sqrt(h))
}


function DonationRow({ d, i }) {
  const cfg = TYPE_CFG[d.donationType] || TYPE_CFG.MONEY
  const status = String(d.status || '').toUpperCase()
  const isApproved = ['CONFIRMED', 'APPROVED', 'ACTIVE'].includes(status)
  const isRejected = status.includes('REJECT')
  const statusClass = isApproved
    ? 'bg-emerald-400/10 text-emerald-400'
    : isRejected
      ? 'bg-rose-400/10 text-rose-400'
      : 'bg-amber-400/10 text-amber-400'
  return (
    <motion.div
      initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
      transition={{ delay: i * 0.06 }}
      className="flex items-center gap-4 p-4 glass rounded-xl hover:bg-black/5 transition-all"
    >
      <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
        <cfg.icon className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{d.campaignTitle || 'Donation'}</p>
        <p className="text-xs text-slate-500">
          {d.amount ? `₹${Number(d.amount).toLocaleString()}` : d.itemDescription || d.donationType}
          {' · '}{new Date(d.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
        </p>
      </div>
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {isApproved ? <FiCheckCircle className="text-xs" /> : <FiAlertCircle className="text-xs" />}
        {status || d.status}
      </div>
    </motion.div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [history,  setHistory]  = useState([])
  const [pickups,  setPickups]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('donations')
  const [livePos,  setLivePos]  = useState(null)
  const mapRef                = useRef(null)
  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    scrollwheel: false,
    gestureHandling: 'cooperative',
  }), [])

  useEffect(() => {
    const load = async () => {
      try {
        const [hr, pr] = await Promise.allSettled([
          getDonationHistory(user.id),
          getMyPickups(user.id),
        ])
        setHistory(hr.status==='fulfilled' ? (hr.value.data.data || []) : [])
        const apiPickups = pr.status==='fulfilled' ? pr.value.data.data || [] : []
        setPickups(apiPickups)
      } catch {
        setHistory([])
        setPickups([])
      }
      finally { setLoading(false) }
    }
    load()
  }, [user])

  useEffect(() => {
    if (!navigator?.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      pos => setLivePos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  useEffect(() => {
    if (!livePos || !mapRef.current) return
    mapRef.current.panTo({ lat: livePos[0], lng: livePos[1] })
  }, [livePos])

  const totalMoney = history.filter(d=>d.donationType==='MONEY').reduce((s,d)=>s+Number(d.amount||0),0)
  const goodsCount = history.filter(d=>d.donationType!=='MONEY').length
  const mapCenter = [13.0827, 80.2707]
  const donorsForMap = history.map((d, i) => {
    const lat = Number(d.lat) || mapCenter[0] + ((i % 3) - 1) * 0.03
    const lng = Number(d.lng) || mapCenter[1] + ((Math.floor(i / 3) % 3) - 1) * 0.03
    return {
      id: d.id || i,
      name: d.donorName || 'Anonymous Donor',
      city: d.city || 'Chennai',
      lat,
      lng,
      donationType: d.donationType,
      amount: d.amount,
      itemDescription: d.itemDescription,
      campaignTitle: d.campaignTitle,
      createdAt: d.createdAt,
      status: d.status,
    }
  })
  const nearestNgos = useMemo(() => {
    if (!livePos) return []
    const base = livePos
    return NGO_POINTS
      .map(n => ({ ...n, distance: distanceKm(base, [n.lat, n.lng]) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
  }, [livePos])

  const mapMarkers = useMemo(() => {
    const donorMarkers = donorsForMap.map((d) => ({
      id: `donor-${d.id}`,
      position: [d.lat, d.lng],
      title: d.name,
      subtitle: `${d.campaignTitle || 'Donation'} · ${d.city}`,
      color: MAP_MARKER_COLORS.donor,
    }))
    const ngoMarkers = nearestNgos.map((n) => ({
      id: `ngo-${n.id}`,
      position: [n.lat, n.lng],
      title: n.name,
      subtitle: `${n.city} · ${n.distance.toFixed(1)} km away`,
      color: MAP_MARKER_COLORS.ngo,
    }))
    const liveMarker = livePos ? [{
      id: 'live-position',
      position: livePos,
      title: 'Your live location',
      subtitle: 'Tracking enabled',
      color: MAP_MARKER_COLORS.live,
    }] : []
    return [...donorMarkers, ...ngoMarkers, ...liveMarker]
  }, [donorsForMap, nearestNgos, livePos])

  const mapPolylines = useMemo(() => {
    if (!livePos) return []
    const hope = NGO_POINTS.find(n => String(n.name).toLowerCase().includes('hope foundation'))
    const hopeId = hope?.id

    return nearestNgos.map((n) => ({
      id: `route-${n.id}`,
      positions: [livePos, [n.lat, n.lng]],
      color: n.id === hopeId ? '#f59e0b' : '#3b82f6',
      weight: n.id === hopeId ? 8 : 6,
      opacity: 0.8,
      zIndex: n.id === hopeId ? 10 : 8,
    }))
  }, [livePos, nearestNgos])

  return (
    <div className="page-section max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-10 h-48">
        <img src={PAGE_BACKGROUNDS.history} alt="history" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="max-w-2xl bg-white/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-white/60">
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">My <span className="text-emerald-700">Donation History</span></h1>
              <p className="text-slate-700 text-sm">
                Track your impact over time. See verified records of every donation and pickup you’ve supported.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label:'Total Donations', value: history.length, color:'text-emerald-400' },
          { label:'Money Donated',   value: `₹${totalMoney.toLocaleString()}`, color:'text-amber-400' },
          { label:'Goods Donated',   value: goodsCount, color:'text-purple-400' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
            className="glass rounded-2xl p-4 text-center">
            <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Donor trace */}
      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="glass rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Donor Trace Map</h2>
              <p className="text-xs text-slate-500">Approximate locations when exact address is unavailable.</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 h-72">
            <GoogleMapCanvas
              center={mapCenter}
              zoom={7}
              markers={mapMarkers}
              polylines={mapPolylines}
              mapTypeId="hybrid"
              options={mapOptions}
              onMapReady={(map) => { mapRef.current = map }}
              className="h-full w-full"
            />
            <button
              type="button"
              onClick={() => {
                if (!livePos || !mapRef.current) return
                mapRef.current.panTo({ lat: livePos[0], lng: livePos[1] })
                if (mapRef.current.getZoom() < 10) mapRef.current.setZoom(10)
              }}
              title="Center on live location"
              className="absolute top-3 right-3 z-[1000] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-lg border border-white/80 hover:bg-white transition-all"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Live Location
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="glass rounded-2xl p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Donor Activity Summary</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 h-72">
            <div className="h-full overflow-auto">
              <table className="w-full text-sm">
              <thead className="bg-white/5 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Donor</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Amount / Items</th>
                  <th className="text-left px-4 py-3 font-medium">City</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {donorsForMap.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={5}>No donor activity yet.</td>
                  </tr>
                ) : (
                  donorsForMap.map(d => (
                    <tr key={d.id} className="border-t border-white/5 text-slate-700">
                      <td className="px-4 py-3">{d.name}</td>
                      <td className="px-4 py-3">{d.donationType}</td>
                      <td className="px-4 py-3">
                        {d.amount ? `₹${Number(d.amount).toLocaleString()}` : (d.itemDescription || 'N/A')}
                      </td>
                      <td className="px-4 py-3">{d.city}</td>
                      <td className="px-4 py-3">
                        {new Date(d.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['donations','pickups'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize
              ${tab===t ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-700' : 'glass text-slate-700 hover:text-slate-900'}`}>
            {t === 'donations' ? `Donations (${history.length})` : `Pickups (${pickups.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <SkeletonRow key={i} />)}</div>
      ) : tab === 'donations' ? (
        <div className="space-y-3">
          {history.length === 0
            ? <div className="text-center py-12 text-slate-600">No donations yet. <a href="/donate" className="text-emerald-700">Donate now →</a></div>
            : history.map((d,i) => <DonationRow key={d.id} d={d} i={i} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {pickups.length === 0
            ? <div className="text-center py-12 text-slate-600">No pickup requests scheduled yet.</div>
            : pickups.map((p,i) => (
              <motion.div key={p.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                className="flex items-center gap-4 p-4 glass rounded-xl">
                <div className="w-11 h-11 rounded-xl bg-teal-400/10 flex items-center justify-center flex-shrink-0">
                  <FiClock className="text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{p.pickupAddress}</p>
                  <p className="text-xs text-slate-500">{new Date(p.pickupTime).toLocaleString('en-IN')}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                  ${p.status==='COMPLETED' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                  {p.status}
                </span>
              </motion.div>
            ))}
        </div>
      )}

      <PageNav current="/history" />
    </div>
  )
}
