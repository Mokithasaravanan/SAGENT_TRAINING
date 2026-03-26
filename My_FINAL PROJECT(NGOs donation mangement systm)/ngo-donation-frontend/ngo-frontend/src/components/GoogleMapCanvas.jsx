import React, { useEffect, useRef, useState } from 'react'

const SCRIPT_ID = 'google-maps-sdk'
let loaderPromise = null

const loadGoogleMaps = (apiKey) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'))
  }
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps))
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')))
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.defer = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`
    script.onload = () => resolve(window.google.maps)
    script.onerror = () => reject(new Error('Google Maps failed to load'))
    document.head.appendChild(script)
  })

  return loaderPromise
}

const TILE_SIZE = 256
const MAX_LATITUDE = 85.05112878

const markerSvg = (color) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 24 32" fill="none">
  <path d="M12 0C6.48 0 2 4.48 2 10c0 6.25 7.5 14.5 9.38 16.52.34.37.9.37 1.24 0C14.5 24.5 22 16.25 22 10 22 4.48 17.52 0 12 0Z" fill="${color}"/>
  <circle cx="12" cy="10" r="4.5" fill="#FFFFFF"/>
</svg>`

const TYPE_COLORS = {
  ngo: '#10b981',
  donor: '#f59e0b',
  volunteer: '#3b82f6',
  pickup: '#a855f7',
  task: '#f97316',
  live: '#22d3ee',
  default: '#64748b',
}

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const normalizePosition = (position, fallback = { lat: 13.0827, lng: 80.2707 }) => {
  const toNumber = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  }
  if (!position) return fallback
  if (Array.isArray(position)) {
    const [lat, lng] = position
    const latNum = toNumber(lat)
    const lngNum = toNumber(lng)
    if (latNum === null || lngNum === null) return fallback
    return { lat: latNum, lng: lngNum }
  }
  if (typeof position === 'object' && position.lat !== undefined && position.lng !== undefined) {
    const latNum = toNumber(position.lat)
    const lngNum = toNumber(position.lng)
    if (latNum === null || lngNum === null) return fallback
    return { lat: latNum, lng: lngNum }
  }
  return fallback
}

const clampZoom = (zoom) => {
  const value = Math.round(Number(zoom))
  if (!Number.isFinite(value)) return 6
  return Math.min(18, Math.max(1, value))
}

const clampLatitude = (lat) => Math.min(MAX_LATITUDE, Math.max(-MAX_LATITUDE, lat))

const projectToWorld = (position, zoom) => {
  const lat = clampLatitude(position.lat)
  const lng = ((position.lng + 180) % 360 + 360) % 360 - 180
  const sin = Math.sin((lat * Math.PI) / 180)
  const x = (lng + 180) / 360
  const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)
  const scale = TILE_SIZE * Math.pow(2, zoom)
  return {
    x: x * scale,
    y: y * scale,
  }
}

const buildIcon = (maps, color) => ({
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg(color))}`,
  scaledSize: new maps.Size(36, 48),
  anchor: new maps.Point(18, 48),
  labelOrigin: new maps.Point(18, 12),
})

const parseDashArray = (dashArray) => {
  if (!dashArray) return null
  const parts = String(dashArray).trim().split(/\s+/).map(Number).filter(Number.isFinite)
  if (parts.length === 0) return null
  if (parts.length === 1) return { dash: parts[0], gap: parts[0] }
  return { dash: parts[0], gap: parts[1] }
}

const buildInfoHtml = (marker) => {
  const title = escapeHtml(marker.title || 'Location')
  const subtitle = marker.subtitle ? `<div>${escapeHtml(marker.subtitle)}</div>` : ''
  return `<div style="font-size:12px;line-height:1.35;color:#334155;">
    <div style="font-weight:600">${title}</div>
    ${subtitle}
  </div>`
}

function FallbackMapCanvas({
  center,
  zoom,
  markers,
  polylines,
  directions,
  className,
  style,
  onReady,
}) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return undefined
    const update = () => {
      const { offsetWidth, offsetHeight } = containerRef.current
      setSize({ width: offsetWidth, height: offsetHeight })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const zoomLevel = clampZoom(zoom)
  const normalizedCenter = normalizePosition(center)
  const worldCenter = projectToWorld(normalizedCenter, zoomLevel)
  const topLeft = {
    x: worldCenter.x - size.width / 2,
    y: worldCenter.y - size.height / 2,
  }

  const tiles = []
  const tileCount = Math.pow(2, zoomLevel)
  const xStart = Math.floor(topLeft.x / TILE_SIZE)
  const yStart = Math.floor(topLeft.y / TILE_SIZE)
  const xEnd = Math.floor((topLeft.x + size.width) / TILE_SIZE)
  const yEnd = Math.floor((topLeft.y + size.height) / TILE_SIZE)
  const subdomains = ['a', 'b', 'c']

  for (let x = xStart; x <= xEnd; x += 1) {
    for (let y = yStart; y <= yEnd; y += 1) {
      if (y < 0 || y >= tileCount) continue
      const wrappedX = ((x % tileCount) + tileCount) % tileCount
      const sub = subdomains[Math.abs(x + y) % subdomains.length]
      const left = x * TILE_SIZE - topLeft.x
      const top = y * TILE_SIZE - topLeft.y
      tiles.push({
        key: `${zoomLevel}-${wrappedX}-${y}`,
        url: `https://${sub}.tile.openstreetmap.org/${zoomLevel}/${wrappedX}/${y}.png`,
        left,
        top,
      })
    }
  }

  const projectToLocal = (position) => {
    const world = projectToWorld(position, zoomLevel)
    return {
      x: world.x - topLeft.x,
      y: world.y - topLeft.y,
    }
  }

  const mapLines = [
    ...polylines,
    ...directions.map((line, idx) => ({
      id: line.id || `direction-${idx}`,
      positions: [line.origin ?? line.from ?? line.start, line.destination ?? line.to ?? line.end],
      color: line.color || '#2563eb',
      weight: line.weight || 5,
      opacity: line.opacity ?? 0.7,
      dashArray: line.dashArray,
    })),
  ].filter(line => Array.isArray(line.positions) && line.positions.length >= 2)

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} style={style}>
      <div className="absolute inset-0 bg-slate-900/10" />
      {tiles.map(tile => (
        <img
          key={tile.key}
          src={tile.url}
          alt=""
          className="absolute"
          style={{
            left: `${tile.left}px`,
            top: `${tile.top}px`,
            width: TILE_SIZE,
            height: TILE_SIZE,
          }}
          loading="lazy"
          draggable={false}
        />
      ))}

      {size.width > 0 && size.height > 0 && mapLines.length > 0 && (
        <svg className="absolute inset-0" width={size.width} height={size.height}>
          {mapLines.map((line) => {
            const stroke = line.color || '#22c55e'
            const weight = line.weight || 4
            const opacity = line.opacity ?? 0.8
            const dash = parseDashArray(line.dashArray)
            const points = line.positions
              .map((pos) => {
                const point = projectToLocal(normalizePosition(pos))
                return `${point.x},${point.y}`
              })
              .join(' ')
            return (
              <polyline
                key={line.id}
                points={points}
                fill="none"
                stroke={stroke}
                strokeWidth={weight}
                strokeOpacity={opacity}
                strokeDasharray={dash ? `${dash.dash} ${dash.gap}` : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          })}
        </svg>
      )}

      {markers.map((marker) => {
        const position = normalizePosition(marker.position)
        const color = marker.color || TYPE_COLORS[marker.type] || TYPE_COLORS.default
        const point = projectToLocal(position)
        const iconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg(color))}`
        return (
          <div
            key={marker.id}
            className="absolute select-none"
            style={{
              left: `${point.x}px`,
              top: `${point.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
            title={marker.title || marker.subtitle || 'Location'}
          >
            <img src={iconUrl} alt="" width={30} height={40} draggable={false} />
          </div>
        )
      })}

      {onReady && (
        <div className="absolute inset-0 pointer-events-none opacity-0" aria-hidden />
      )}
    </div>
  )
}

export default function GoogleMapCanvas({
  center = [13.0827, 80.2707],
  zoom = 7,
  markers = [],
  polylines = [],
  directions = [],
  mapTypeId = 'roadmap',
  options = {},
  className = '',
  style,
  onMapReady,
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const mapsRef = useRef(null)
  const markersRef = useRef([])
  const polylinesRef = useRef([])
  const directionsRef = useRef([])
  const directionsCacheRef = useRef(new Map())
  const directionsBatchRef = useRef(0)
  const infoWindowRef = useRef(null)
  const [status, setStatus] = useState(apiKey ? 'loading' : 'missing')
  const [fallbackCenter, setFallbackCenter] = useState(() => normalizePosition(center))
  const [fallbackZoom, setFallbackZoom] = useState(() => (zoom ?? 6))
  const fallbackZoomRef = useRef(fallbackZoom)
  const fallbackApiRef = useRef(null)

  useEffect(() => {
    let active = true
    if (!apiKey) {
      setStatus('missing')
      return undefined
    }

    setStatus('loading')
    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!active) return
        mapsRef.current = maps
        if (!mapRef.current && containerRef.current) {
          const normalizedCenter = normalizePosition(center)
          mapRef.current = new maps.Map(containerRef.current, {
            center: normalizedCenter,
            zoom,
            mapTypeId,
            ...options,
          })
          if (onMapReady) onMapReady(mapRef.current)
        }
        setStatus('ready')
      })
      .catch(() => {
        if (!active) return
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [apiKey])

  useEffect(() => {
    setFallbackCenter(normalizePosition(center))
  }, [center])

  useEffect(() => {
    if (zoom === undefined || zoom === null) return
    setFallbackZoom(zoom)
  }, [zoom])

  useEffect(() => {
    fallbackZoomRef.current = fallbackZoom
  }, [fallbackZoom])

  useEffect(() => {
    if (!fallbackApiRef.current) {
      fallbackApiRef.current = {
        panTo: (pos) => setFallbackCenter(normalizePosition(pos)),
        setZoom: (z) => {
          const value = Number(z)
          if (Number.isFinite(value)) setFallbackZoom(value)
        },
        getZoom: () => fallbackZoomRef.current,
      }
    }
    if (onMapReady && (status === 'missing' || status === 'error')) {
      onMapReady(fallbackApiRef.current)
    }
  }, [onMapReady, status])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setOptions({ mapTypeId, ...options })
  }, [mapTypeId, options])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setCenter(normalizePosition(center))
  }, [center])

  useEffect(() => {
    if (!mapRef.current || zoom === undefined || zoom === null) return
    mapRef.current.setZoom(zoom)
  }, [zoom])

  useEffect(() => {
    if (status !== 'ready') return undefined
    const map = mapRef.current
    const maps = mapsRef.current
    if (!map || !maps) return undefined

    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    const infoWindow = infoWindowRef.current || new maps.InfoWindow()
    infoWindowRef.current = infoWindow

    markersRef.current = markers.map((marker) => {
      const position = normalizePosition(marker.position)
      const color = marker.color || TYPE_COLORS[marker.type] || TYPE_COLORS.default
      const icon = marker.icon ? marker.icon : buildIcon(maps, color)

      const mapMarker = new maps.Marker({
        position,
        map,
        title: marker.title || '',
        icon,
        zIndex: marker.zIndex,
      })

      if (marker.label) {
        mapMarker.setLabel(marker.label)
      }

      if (marker.infoHtml || marker.title || marker.subtitle) {
        mapMarker.addListener('click', () => {
          const content = marker.infoHtml || buildInfoHtml(marker)
          infoWindow.setContent(content)
          infoWindow.open({ map, anchor: mapMarker })
        })
      }

      return mapMarker
    })

    return () => {
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
    }
  }, [markers, status])

  useEffect(() => {
    if (status !== 'ready') return undefined
    const map = mapRef.current
    const maps = mapsRef.current
    if (!map || !maps) return undefined

    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []

    polylinesRef.current = polylines.map((line) => {
      const strokeColor = line.color || '#22c55e'
      const strokeWeight = line.weight || 4
      const strokeOpacity = line.opacity ?? 0.8
      const path = (line.positions || []).map((p) => normalizePosition(p))
      const dash = parseDashArray(line.dashArray)

      const opts = {
        path,
        map,
        strokeColor,
        strokeWeight,
        strokeOpacity,
        zIndex: line.zIndex,
      }

      if (dash) {
        const repeat = `${dash.dash + dash.gap}px`
        opts.strokeOpacity = 0
        opts.icons = [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            strokeColor,
            scale: Math.max(1, strokeWeight),
          },
          offset: '0',
          repeat,
        }]
      }

      return new maps.Polyline(opts)
    })

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null))
      polylinesRef.current = []
    }
  }, [polylines, status])

  useEffect(() => {
    if (status !== 'ready') return undefined
    const map = mapRef.current
    const maps = mapsRef.current
    if (!map || !maps) return undefined

    directionsRef.current.forEach((p) => p.setMap(null))
    directionsRef.current = []

    if (!directions.length) return undefined

    const service = new maps.DirectionsService()
    const batchId = directionsBatchRef.current + 1
    directionsBatchRef.current = batchId
    let cancelled = false

    const getTravelMode = (mode) => {
      const value = String(mode || 'DRIVING').toUpperCase()
      if (value === 'WALKING') return maps.TravelMode.WALKING
      if (value === 'BICYCLING') return maps.TravelMode.BICYCLING
      if (value === 'TRANSIT') return maps.TravelMode.TRANSIT
      return maps.TravelMode.DRIVING
    }

    const drawPath = (path, line) => {
      const color = line.color || '#2563eb'
      const weight = line.weight || 6
      const opacity = line.opacity ?? 0.9
      const polyline = new maps.Polyline({
        path,
        map,
        strokeColor: color,
        strokeWeight: weight,
        strokeOpacity: opacity,
        zIndex: line.zIndex,
      })
      directionsRef.current.push(polyline)
    }

    directions.forEach((line) => {
      const origin = normalizePosition(line.origin ?? line.from ?? line.start)
      const destination = normalizePosition(line.destination ?? line.to ?? line.end)
      const mode = getTravelMode(line.mode)
      const cacheKey = `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}|${mode}`
      const cached = directionsCacheRef.current.get(cacheKey)
      if (cached) {
        drawPath(cached, line)
        return
      }

      service.route(
        { origin, destination, travelMode: mode, provideRouteAlternatives: false },
        (result, statusResult) => {
          if (cancelled || directionsBatchRef.current !== batchId) return
          if (statusResult === 'OK' && result?.routes?.length) {
            const path = result.routes[0].overview_path
            directionsCacheRef.current.set(cacheKey, path)
            drawPath(path, line)
          }
        }
      )
    })

    return () => {
      cancelled = true
      directionsRef.current.forEach((p) => p.setMap(null))
      directionsRef.current = []
    }
  }, [directions, status])

  const overlayText = status === 'missing'
    ? 'Google Maps API key missing. Add VITE_GOOGLE_MAPS_API_KEY to .env.'
    : status === 'error'
      ? 'Unable to load Google Maps.'
      : status === 'loading'
        ? 'Loading map...'
        : null
  const showFallback = status === 'missing' || status === 'error'
  const fallbackNote = status === 'missing'
    ? 'Using OpenStreetMap fallback (Google Maps key missing).'
    : status === 'error'
      ? 'Using OpenStreetMap fallback (Google Maps failed to load).'
      : null

  return (
    <div className={`relative ${className}`} style={style}>
      {showFallback ? (
        <FallbackMapCanvas
          center={fallbackCenter}
          zoom={fallbackZoom}
          markers={markers}
          polylines={polylines}
          directions={directions}
          className="h-full w-full"
          onReady={onMapReady}
        />
      ) : (
        <div ref={containerRef} className="h-full w-full" />
      )}
      {overlayText && !showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-xs text-slate-100">
          {overlayText}
        </div>
      )}
      {showFallback && fallbackNote && (
        <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-slate-700 shadow">
          {fallbackNote}
        </div>
      )}
      {showFallback && (
        <div className="absolute bottom-2 right-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-600 shadow">
          © OpenStreetMap contributors
        </div>
      )}
    </div>
  )
}
