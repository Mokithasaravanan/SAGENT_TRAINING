const API_BASE = process.env.NGO_API_BASE || 'http://localhost:8081'
const TOKEN = process.env.NGO_TOKEN || ''

const NGOs = [
  {
    name: 'Green Earth Foundation',
    description: 'NGO focused on environmental conservation and tree plantation drives',
    address: 'T. Nagar, Chennai, Tamil Nadu',
    contactEmail: 'greenearth@foundation.org',
    contactPhone: '9111111111',
  },
  {
    name: 'Smile India Trust',
    description: 'NGO providing education and scholarships to underprivileged children',
    address: 'Adyar, Chennai, Tamil Nadu',
    contactEmail: 'smileindia@trust.org',
    contactPhone: '9222222222',
  },
  {
    name: 'Care And Share Society',
    description: 'NGO supporting elderly care and old age home facilities',
    address: 'Velachery, Chennai, Tamil Nadu',
    contactEmail: 'careshare@society.org',
    contactPhone: '9333333333',
  },
  {
    name: 'Food For All',
    description: 'NGO working to eliminate hunger by distributing free meals daily',
    address: 'Tambaram, Chennai, Tamil Nadu',
    contactEmail: 'foodforall@ngo.org',
    contactPhone: '9444444444',
  },
  {
    name: 'Health First NGO',
    description: 'NGO offering free medical camps and health awareness programs',
    address: 'Porur, Chennai, Tamil Nadu',
    contactEmail: 'healthfirst@ngo.org',
    contactPhone: '9555555555',
  },
]

const headers = {
  'Content-Type': 'application/json',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
}

const readBody = async (res) => {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const extractArray = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.data?.data)) return payload.data.data
  if (Array.isArray(payload.data?.ngos)) return payload.data.ngos
  return []
}

const main = async () => {
  const listRes = await fetch(`${API_BASE}/api/ngos`, { headers })
  const listPayload = await readBody(listRes)
  const existing = extractArray(listPayload)
  const existingNames = new Set(existing.map(n => String(n.name || '').toLowerCase().trim()))

  const created = []
  const skipped = []
  const failed = []

  for (const ngo of NGOs) {
    const key = String(ngo.name).toLowerCase().trim()
    if (existingNames.has(key)) {
      skipped.push(ngo.name)
      continue
    }
    try {
      const res = await fetch(`${API_BASE}/api/ngos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ngo),
      })
      const payload = await readBody(res)
      if (!res.ok) {
        failed.push({ name: ngo.name, status: res.status, error: payload })
        continue
      }
      created.push(ngo.name)
    } catch (err) {
      failed.push({ name: ngo.name, error: err?.message || String(err) })
    }
  }

  console.log('Created:', created)
  console.log('Skipped (already existed):', skipped)
  if (failed.length) {
    console.log('Failed:', failed)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
