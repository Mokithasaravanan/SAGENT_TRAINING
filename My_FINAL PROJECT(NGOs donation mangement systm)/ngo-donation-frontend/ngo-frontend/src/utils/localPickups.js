const STORAGE_KEY = 'ngo_local_pickups'

const safeParse = (raw) => {
  if (!raw) return []
  try { return JSON.parse(raw) || [] } catch { return [] }
}

const read = () => {
  if (typeof window === 'undefined') return []
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

const write = (list) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export const getLocalPickups = () => read()

export const addLocalPickup = (pickup) => {
  const list = read()
  const id = pickup.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const next = {
    ...pickup,
    id,
    status: pickup.status || 'ASSIGNED',
    createdAt: pickup.createdAt || new Date().toISOString(),
  }
  write([next, ...list])
  return next
}

export const updateLocalPickup = (pickupId, updates) => {
  const list = read()
  let updated = null
  const nextList = list.map(p => {
    if (String(p.id) !== String(pickupId)) return p
    updated = { ...p, ...updates }
    return updated
  })
  if (updated) write(nextList)
  return updated
}
