import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FiCrosshair, FiMapPin, FiNavigation, FiWifi, FiWifiOff } from 'react-icons/fi'
import GoogleMapCanvas from './GoogleMapCanvas'

export default function MapPanel({
  title = 'Live Map',
  subtitle,
  center = [13.0827, 80.2707],
  zoom = 6,
  markers = [],
  routes = [],
  directions = [],
  routeLegend = [],
  height = 320,
  enableLiveToggle = false,
  defaultLive = true,
  onLivePosition,
  showLegend = true,
}) {
  const [liveEnabled, setLiveEnabled] = useState(enableLiveToggle ? defaultLive : false)
  const [livePos, setLivePos] = useState(null)
  const watchIdRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!enableLiveToggle) return undefined
    if (!liveEnabled) {
      if (watchIdRef.current) navigator.geolocation?.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      return undefined
    }
    if (!navigator?.geolocation) return undefined
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setLivePos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 12000, timeout: 12000 }
    )
    return () => {
      if (watchIdRef.current) navigator.geolocation?.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [enableLiveToggle, liveEnabled])

  useEffect(() => {
    if (onLivePosition) onLivePosition(livePos)
  }, [livePos, onLivePosition])

  useEffect(() => {
    if (!livePos || !mapRef.current) return
    const map = mapRef.current
    map.panTo({ lat: livePos[0], lng: livePos[1] })
    if (map.getZoom() < 10) map.setZoom(10)
  }, [livePos])

  const mapMarkers = useMemo(() => {
    if (!livePos) return markers
    return [
      ...markers,
      {
        id: 'live-position',
        type: 'live',
        title: 'Live Position',
        subtitle: 'Tracking enabled',
        position: livePos,
      },
    ]
  }, [markers, livePos])

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

  const legendItems = [
    { key: 'ngo', label: 'NGO', color: 'bg-emerald-400' },
    { key: 'donor', label: 'Donor', color: 'bg-amber-400' },
    { key: 'volunteer', label: 'Volunteer', color: 'bg-blue-400' },
    { key: 'pickup', label: 'Pickup', color: 'bg-purple-400' },
  ]

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          {routeLegend.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              {routeLegend.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="h-0.5 w-6 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {enableLiveToggle && (
          <button
            type="button"
            onClick={() => setLiveEnabled(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${liveEnabled ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' : 'bg-slate-900/40 border-white/10 text-slate-300'}`}
          >
            {liveEnabled ? <FiWifi /> : <FiWifiOff />}
            {liveEnabled ? 'Live Tracking On' : 'Live Tracking Off'}
          </button>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height }}>
        <GoogleMapCanvas
          center={center}
          zoom={zoom}
          markers={mapMarkers}
          polylines={routes}
          directions={directions}
          options={mapOptions}
          mapTypeId="roadmap"
          onMapReady={(map) => { mapRef.current = map }}
          className="h-full w-full"
        />

        {enableLiveToggle && (
          <button
            type="button"
            onClick={() => {
              if (!livePos || !mapRef.current) return
              mapRef.current.panTo({ lat: livePos[0], lng: livePos[1] })
              if (mapRef.current.getZoom() < 10) mapRef.current.setZoom(10)
              setLiveEnabled(true)
            }}
            className="absolute top-3 right-3 z-[1000] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-lg border border-white/80 hover:bg-white transition-all"
            title="Center on live location"
          >
            <FiCrosshair />
            Center
          </button>
        )}

        {!markers.length && !livePos && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-slate-200/90 bg-slate-950/60 px-3 py-2 rounded-full border border-white/10">
              <FiMapPin /> No locations yet
            </div>
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
          {legendItems.map(item => (
            <div key={item.key} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            Live
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <FiNavigation className="text-emerald-400" />
        Powered by Google Maps
      </div>
    </div>
  )
}
