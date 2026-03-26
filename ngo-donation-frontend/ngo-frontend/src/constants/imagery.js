const NGO_GLOB = import.meta.glob('../assets/ngo/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const NGO_IMAGES = Object.entries(NGO_GLOB)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)

const mulberry32 = (seed) => () => {
  let t = seed += 0x6D2B79F5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const shuffleWithSeed = (items, seed) => {
  const out = [...items]
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    const temp = out[i]
    out[i] = out[j]
    out[j] = temp
  }
  return out
}

const SHUFFLED = shuffleWithSeed(NGO_IMAGES, 20260324)
const getImage = (idx) => SHUFFLED[idx] || SHUFFLED[idx % SHUFFLED.length] || ''

export const PAGE_BACKGROUNDS = {
  donorHome: getImage(0),
  campaigns: getImage(1),
  ngos: getImage(2),
  donate: getImage(3),
  history: getImage(4),
  contact: getImage(5),
  achievements: getImage(49),
  login: getImage(6),
  register: getImage(7),
  adminOverview: getImage(8),
  adminCampaigns: getImage(9),
  adminNgos: getImage(18),
  adminRequests: getImage(10),
  adminVolunteers: getImage(11),
  adminUrgent: getImage(12),
  adminReports: getImage(13),
  volunteerOverview: getImage(14),
  volunteerTasks: getImage(15),
  volunteerMap: getImage(16),
  volunteerSchedule: getImage(17),
}

export const CARD_IMAGES = {
  campaigns: [
    getImage(18),
    getImage(19),
    getImage(20),
    getImage(21),
    getImage(22),
    getImage(23),
  ],
  ngos: [
    getImage(24),
    getImage(25),
    getImage(26),
    getImage(27),
    getImage(28),
    getImage(29),
  ],
  donorStories: [
    getImage(30),
    getImage(31),
    getImage(32),
    getImage(33),
    getImage(34),
    getImage(35),
  ],
  contactStory: getImage(36),
}

export const ROLE_GALLERY = {
  donor: [getImage(37), getImage(38), getImage(39)],
  admin: [getImage(40), getImage(41), getImage(42)],
  volunteer: [
    getImage(43),
    getImage(44),
    getImage(45),
    getImage(46),
    getImage(47),
    getImage(48),
  ],
}
