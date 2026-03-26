import React, { useMemo, useState } from 'react'
import { PAGE_BACKGROUNDS } from '../../constants/imagery'
import MapPanel from '../../components/MapPanel'
import useVolunteerTasks from '../../hooks/useVolunteerTasks'

const SAFE_BOUNDS = {
  latMin: 12.9,
  latMax: 13.2,
  lonMin: 80.1,
  lonMax: 80.23,
}

const hashToUnit = (value) => {
  const str = String(value || '')
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100000
  }
  return (hash % 1000) / 1000
}

const clamp = (num, min, max) => Math.min(max, Math.max(min, num))

export default function VolunteerMapPage() {
  const { tasks } = useVolunteerTasks()
  const [livePos, setLivePos] = useState(null)

  const markers = useMemo(() => {
    const taskMarkers = tasks.map((t, idx) => ({
      id: t.id || idx,
      type: 'pickup',
      title: t.donorName || 'Pickup',
      subtitle: t.pickupAddress,
      position: [
        clamp(
          SAFE_BOUNDS.latMin + (SAFE_BOUNDS.latMax - SAFE_BOUNDS.latMin)
            * hashToUnit(`${t.pickupAddress}|${t.donorName}|${t.id}|lat`),
          SAFE_BOUNDS.latMin,
          SAFE_BOUNDS.latMax
        ),
        clamp(
          SAFE_BOUNDS.lonMin + (SAFE_BOUNDS.lonMax - SAFE_BOUNDS.lonMin)
            * hashToUnit(`${t.pickupAddress}|${t.donorName}|${t.id}|lon`),
          SAFE_BOUNDS.lonMin,
          SAFE_BOUNDS.lonMax
        ),
      ],
    }))
    return taskMarkers
  }, [tasks])

  const routes = useMemo(() => {
    if (!livePos || markers.length === 0) return []
    return markers.slice(0, 2).map((m, i) => ({
      id: `route-${i}`,
      positions: [livePos, m.position],
      color: i === 0 ? '#22c55e' : '#38bdf8',
    }))
  }, [livePos, markers])

  const routeLegend = useMemo(() => (
    routes.map((route, i) => ({
      id: route.id,
      label: `Route to Pickup ${i + 1}`,
      color: route.color,
    }))
  ), [routes])

  const mapCenter = useMemo(() => (
    livePos || markers[0]?.position || [13.0827, 80.2707]
  ), [livePos, markers])

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img src={PAGE_BACKGROUNDS.volunteerMap} alt="volunteer map" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="hero-card rounded-2xl p-5 max-w-2xl">
            <p className="text-xs text-amber-200 uppercase tracking-wider mb-2">Live Navigation</p>
            <h2 className="font-display text-2xl text-white font-bold">Track donor locations in real time</h2>
            <p className="text-sm text-slate-200 mt-2">Use live tracking to optimize your pickup routes.</p>
          </div>
        </div>
      </div>

      <MapPanel
        title="Pickup Navigation Map"
        subtitle="Toggle live tracking to see your current location"
        markers={markers}
        routes={routes}
        routeLegend={routeLegend}
        center={mapCenter}
        zoom={10}
        enableLiveToggle
        onLivePosition={setLivePos}
        height={420}
      />
    </div>
  )
}
