import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiSearch, FiMapPin, FiMail, FiPhone, FiHeart, FiExternalLink } from 'react-icons/fi'
import { getAllNgos } from '../services/api'
import { SkeletonCard } from '../components/Skeleton'
import PageNav from '../components/PageNav'
import { CARD_IMAGES, PAGE_BACKGROUNDS } from '../constants/imagery'

const MOCK_NGOS = [
  { id:1, name:'Hope Foundation',       address:'Anna Nagar, Chennai', description:'Empowering underprivileged communities with education and healthcare support across Tamil Nadu.', contactEmail:'hope@foundation.org', contactPhone:'9000000001' },
  { id:2, name:'Green Earth NGO',        address:'Coimbatore, TN',       description:'Environmental conservation and sustainable agriculture initiatives for rural farming communities.', contactEmail:'green@earth.org',      contactPhone:'9000000002' },
  { id:3, name:'Child First India',      address:'Madurai, TN',          description:'Child welfare, nutrition programs, and free education for street children and orphans.', contactEmail:'child@first.org',       contactPhone:'9000000003' },
  { id:4, name:'Senior Care Society',    address:'Trichy, TN',           description:'Comprehensive care, medical aid, and emotional support for elderly citizens living alone.', contactEmail:'senior@care.org',       contactPhone:'9000000004' },
  { id:5, name:'Women Empowerment Trust',address:'Salem, TN',            description:'Skill development, micro-finance, and leadership training programs for rural women.', contactEmail:'women@trust.org',       contactPhone:'9000000005' },
  { id:6, name:'Flood Relief Network',   address:'Cuddalore, TN',        description:'Emergency relief operations providing food, shelter, and medicine during natural disasters.', contactEmail:'flood@relief.org',      contactPhone:'9000000006' },
  { id:7, name:'Seva Health Mission',    address:'Vellore, TN',          description:'Community clinics, vaccination drives, and maternal health programs for underserved families.', contactEmail:'seva@health.org',       contactPhone:'9000000007' },
  { id:8, name:'Bright Future Trust',    address:'Erode, TN',            description:'Scholarships, after-school tutoring, and digital literacy for first-generation learners.', contactEmail:'bright@future.org',     contactPhone:'9000000008' },
  { id:9, name:'Clean Water Collective', address:'Thanjavur, TN',        description:'Safe drinking water projects, filtration units, and sanitation awareness in villages.', contactEmail:'water@collective.org',   contactPhone:'9000000009' },
  { id:10,name:'Urban Shelter Initiative',address:'Chennai, TN',         description:'Night shelters, skill training, and reintegration support for homeless families.', contactEmail:'shelter@initiative.org', contactPhone:'9000000010' },
  { id:11,name:'Nutrition for All',      address:'Tirunelveli, TN',      description:'Nutrition kits, community kitchens, and child growth monitoring in low-income areas.', contactEmail:'nutrition@forall.org',   contactPhone:'9000000011' },
  { id:12,name:'Rural Skills Academy',   address:'Karur, TN',            description:'Vocational training in tailoring, electrical work, and entrepreneurship for youth.', contactEmail:'skills@academy.org',     contactPhone:'9000000012' },
  { id:13,name:'Care & Compassion',      address:'Pudukkottai, TN',      description:'Disability support services, assistive devices, and inclusive education programs.', contactEmail:'care@compassion.org',   contactPhone:'9000000013' },
  { id:14,name:'Green Schools Project',  address:'Kanchipuram, TN',      description:'School gardens, eco-clubs, and waste management programs in government schools.', contactEmail:'green@schools.org',      contactPhone:'9000000014' },
  { id:15,name:'Women Safety Collective',address:'Hosur, TN',            description:'Legal aid, counseling, and self-defense workshops for women and girls.', contactEmail:'safety@collective.org',  contactPhone:'9000000015' },
  { id:16,name:'Disaster Response Unit', address:'Nagapattinam, TN',     description:'Rapid response teams for cyclones, floods, and community recovery planning.', contactEmail:'disaster@response.org',  contactPhone:'9000000016' },
  { id:17,name:'Little Steps Foundation',address:'Tiruppur, TN',         description:'Early childhood education, learning materials, and parent training workshops.', contactEmail:'little@steps.org',      contactPhone:'9000000017' },
  { id:18,name:'Food Security Alliance', address:'Dindigul, TN',         description:'Farmer support, nutrition education, and monthly ration drives for vulnerable families.', contactEmail:'food@alliance.org',     contactPhone:'9000000018' },
]

function NgoCard({ ngo, index }) {
  const img = CARD_IMAGES.ngos[index % CARD_IMAGES.ngos.length]
  return (
    <motion.div
      initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y:-6 }}
      className="glass rounded-2xl overflow-hidden group card-hover"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt={ngo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <h3 className="font-display text-lg font-bold text-slate-900">{ngo.name}</h3>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-1.5 mb-3">
          <FiMapPin className="text-emerald-400 text-sm mt-0.5 flex-shrink-0" />
          <span className="text-slate-600 text-xs">{ngo.address}</span>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{ngo.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <FiMail className="text-teal-400 text-xs flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate">{ngo.contactEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiPhone className="text-teal-400 text-xs flex-shrink-0" />
            <span className="text-xs text-slate-600">{ngo.contactPhone}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
            className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1.5"
            onClick={() => toast.success(`Donating to ${ngo.name}!`)}
          >
            <FiHeart className="text-xs" /> Donate
          </motion.button>
          <button className="p-2 glass rounded-xl text-slate-600 hover:text-emerald-700 transition-colors">
            <FiExternalLink className="text-sm" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function NgosPage() {
  const [ngos, setNgos]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    getAllNgos()
      .then(r => {
        const api = r.data.data || []
        if (api.length > 0) {
          setNgos(api)
          return
        }
        setNgos(MOCK_NGOS)
      })
      .catch(() => setNgos(MOCK_NGOS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = ngos.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.address?.toLowerCase().includes(search.toLowerCase())
  )
  const visible = filtered

  return (
    <div className="page-section max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-10 h-56">
        <img src={PAGE_BACKGROUNDS.ngos} alt="ngos" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="max-w-2xl bg-white/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-white/60">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Our <span className="text-emerald-700">NGO Partners</span>
              </h1>
              <p className="text-slate-700 text-sm">
                Trusted organisations making real impact. We partner with NGOs that report outcomes and use funds responsibly.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Search NGO or location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <p className="text-slate-500 text-sm mb-6">{visible.length} organisations found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((n,i) => <NgoCard key={n.id} ngo={n} index={i} />)}
          </div>
          {visible.length === 0 && (
            <div className="text-center py-16 text-slate-500">No NGOs found for "{search}"</div>
          )}
        </>
      )}

      <PageNav current="/ngos" />
    </div>
  )
}
