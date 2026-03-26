import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiCalendar, FiTrendingUp, FiFlag, FiFilter } from 'react-icons/fi'
import { getAllCampaigns } from '../services/api'
import { SkeletonCard } from '../components/Skeleton'
import PageNav from '../components/PageNav'
import { CARD_IMAGES, PAGE_BACKGROUNDS } from '../constants/imagery'

const MOCK_CAMPAIGNS = [
  { id:1, title:'Winter Clothes Drive',        description:'Collecting warm clothes for homeless people in Chennai during winter season.', donationType:'CLOTHES', targetAmount:50000, collectedAmount:32000, startDate:'2025-01-01', endDate:'2025-03-31', status:'ACTIVE',  ngoName:'Hope Foundation' },
  { id:2, title:'Flood Relief Fund',           description:'Emergency monetary aid for families displaced by floods in Cuddalore district.', donationType:'MONEY',   targetAmount:200000,collectedAmount:145000,startDate:'2025-01-05', endDate:'2025-02-28', status:'ACTIVE',  ngoName:'Flood Relief Network' },
  { id:3, title:'Mid-Day Meal Program',        description:'Providing nutritious meals to 500 school children from underprivileged backgrounds.', donationType:'FOOD',    targetAmount:75000, collectedAmount:75000, startDate:'2024-12-01', endDate:'2025-01-31', status:'COMPLETED', ngoName:'Child First India' },
  { id:4, title:'Grocery for Elderly',         description:'Monthly grocery kits for 200 senior citizens living alone without family support.', donationType:'GROCERY', targetAmount:40000, collectedAmount:18000, startDate:'2025-02-01', endDate:'2025-04-30', status:'ACTIVE',  ngoName:'Senior Care Society' },
  { id:5, title:'Books for Future',            description:'Collecting textbooks and stationery for government school students in rural TN.', donationType:'CLOTHES', targetAmount:30000, collectedAmount:5000,  startDate:'2025-02-10', endDate:'2025-05-10', status:'PENDING', ngoName:'Child First India' },
  { id:6, title:'Women Skill Development',     description:'Funding sewing machines and raw materials for women entrepreneurs in Salem.', donationType:'MONEY',   targetAmount:120000,collectedAmount:60000, startDate:'2025-01-20', endDate:'2025-06-20', status:'ACTIVE',  ngoName:'Women Empowerment Trust' },
]

// Always include this extra highlight campaign in the list even if the API returns data
const FEATURED_CAMPAIGN = { id:9999, title:'Clean Water for Villages', description:'Installing community water filters in drought-prone villages to provide safe drinking water.', donationType:'MONEY', targetAmount:90000, collectedAmount:25000, startDate:'2025-02-15', endDate:'2025-05-31', status:'ACTIVE', ngoName:'Aqua Hope' }

const TYPE_COLORS = {
  MONEY:   'bg-amber-400/15 text-amber-400 border-amber-400/20',
  CLOTHES: 'bg-purple-400/15 text-purple-400 border-purple-400/20',
  FOOD:    'bg-rose-400/15 text-rose-400 border-rose-400/20',
  GROCERY: 'bg-blue-400/15 text-blue-400 border-blue-400/20',
}

const STATUS_COLORS = {
  ACTIVE:    'bg-emerald-400/15 text-emerald-400',
  PENDING:   'bg-amber-400/15 text-amber-400',
  COMPLETED: 'bg-slate-400/15 text-slate-400',
  REJECTED:  'bg-rose-400/15 text-rose-400',
}

function ProgressBar({ collected, target }) {
  const pct = Math.min(100, Math.round((collected / target) * 100)) || 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600">₹{collected?.toLocaleString() || 0} raised</span>
        <span className="text-emerald-400 font-medium">{pct}%</span>
      </div>
      <div className="h-2 bg-emerald-900/40 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
        />
      </div>
      <p className="text-xs text-slate-500">Goal: ₹{target?.toLocaleString()}</p>
    </div>
  )
}

function CampaignCard({ campaign, index }) {
  const img = CARD_IMAGES.campaigns[index % CARD_IMAGES.campaigns.length]
  return (
    <motion.div
      initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y:-5 }}
      className="glass rounded-2xl overflow-hidden group card-hover flex flex-col min-h-[430px]"
    >
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        <img src={img} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/20 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TYPE_COLORS[campaign.donationType] || TYPE_COLORS.MONEY}`}>
            {campaign.donationType}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[campaign.status]}`}>
            {campaign.status}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-base font-bold text-slate-900 mb-1.5 line-clamp-1">{campaign.title}</h3>
        <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">{campaign.description}</p>

        <div className="mb-4">
          <ProgressBar collected={campaign.collectedAmount} target={campaign.targetAmount} />
        </div>

        <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <FiCalendar className="text-teal-400" />
            <span>{new Date(campaign.endDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiFlag className="text-emerald-400" />
            <span className="truncate">{campaign.ngoName}</span>
          </div>
        </div>

        <div className="mt-auto">
          {campaign.status === 'ACTIVE' && (
            <motion.button
              whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={() => toast.success(`Redirecting to donate to ${campaign.title}`)}
              className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
            >
              <FiTrendingUp className="text-sm" /> Contribute Now
            </motion.button>
          )}
          {campaign.status === 'COMPLETED' && (
            <div className="w-full py-2 text-center text-sm text-slate-500 glass rounded-xl h-[44px] flex items-center justify-center">Goal Achieved!</div>
          )}
          {campaign.status === 'PENDING' && (
            <div className="w-full py-2 text-center text-xs text-amber-400 bg-amber-400/10 rounded-xl h-[44px] flex items-center justify-center">Awaiting Approval</div>
          )}
          {campaign.status === 'REJECTED' && (
            <div className="w-full py-2 text-center text-xs text-rose-400 bg-rose-400/10 rounded-xl h-[44px] flex items-center justify-center">Rejected</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('ALL')

  useEffect(() => {
    getAllCampaigns()
      .then(r => {
        const api = r.data.data || []
        const desired = 9 // show a fuller grid and include extra mock campaigns
        const filler = MOCK_CAMPAIGNS
          .filter(m => !api.some(a => a.id === m.id || a.title === m.title))
          .slice(0, Math.max(0, desired - api.length))
        const merged = api.length ? [FEATURED_CAMPAIGN, ...api, ...filler] : [FEATURED_CAMPAIGN, ...(filler.length ? filler : MOCK_CAMPAIGNS)]
        // De-duplicate by title, prioritizing stronger statuses (ACTIVE > PENDING > COMPLETED > REJECTED)
        const rank = { ACTIVE:0, PENDING:1, COMPLETED:2, REJECTED:3 }
        const byPriority = [...merged].sort((a,b) => (rank[a.status] ?? 4) - (rank[b.status] ?? 4))
        const seen = new Set()
        const unique = []
        for (const c of byPriority) {
          const key = (c.title || '').toLowerCase()
          if (seen.has(key)) continue
          seen.add(key)
          unique.push(c)
        }
        setCampaigns(unique.length ? unique : MOCK_CAMPAIGNS)
      })
      .catch(() => setCampaigns(MOCK_CAMPAIGNS))
      .finally(() => setLoading(false))
  }, [])

  const statuses = ['ALL', 'ACTIVE', 'PENDING', 'COMPLETED']
  const filtered = filter === 'ALL' ? campaigns : campaigns.filter(c => c.status === filter)

  return (
    <div className="page-section max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-10 h-56">
        <img src={PAGE_BACKGROUNDS.campaigns} alt="campaigns" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="max-w-2xl bg-white/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-white/60">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Active <span className="text-emerald-700">Campaigns</span>
              </h1>
              <p className="text-slate-700 text-sm">
                Choose a cause that moves your heart. Each campaign is vetted and progress is updated regularly.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <FiFilter className="text-slate-300" />
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all
              ${filter === s
                ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-200'
                : 'border-white/15 text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/5'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <p className="text-slate-300 text-sm mb-6">{filtered.length} campaigns</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c,i) => <CampaignCard key={c.id} campaign={c} index={i} />)}
          </div>
        </>
      )}

      <PageNav current="/campaigns" />
    </div>
  )
}
