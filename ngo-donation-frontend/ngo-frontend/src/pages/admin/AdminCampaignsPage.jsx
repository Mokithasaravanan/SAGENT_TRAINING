import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiCheck, FiClock, FiFlag, FiRefreshCw, FiX } from 'react-icons/fi'
import { approveCampaign, getAllCampaigns, rejectCampaign } from '../../services/api'
import { PAGE_BACKGROUNDS } from '../../constants/imagery'
import { useAuth } from '../../context/AuthContext'
import { SkeletonRow } from '../../components/Skeleton'

export default function AdminCampaignsPage() {
  const { user, logout } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)

  const normalizeId = (value) => (
    value === undefined || value === null ? null : String(value)
  )

  const normalizeNameKey = (value) => String(value || '').trim().toLowerCase()

  const decodeJwtPayload = (token) => {
    try {
      if (!token || typeof token !== 'string') return null
      const parts = token.split('.')
      if (parts.length < 2) return null
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, '=')
      const json = atob(padded)
      return JSON.parse(json)
    } catch (_) {
      return null
    }
  }

  const resolveNgoId = (value) => (
    value?.ngoId ??
    value?.ngo_id ??
    value?.ngoID ??
    value?.ngo?.id ??
    value?.ngo?.ngoId ??
    value?.ngo?.ngo_id ??
    value?.ngo?.ngoID ??
    value?.assignedNgoId ??
    value?.assignedNgo?.id ??
    value?.assignedNgo?.ngoId ??
    value?.campaign?.ngoId ??
    value?.campaign?.ngo?.id ??
    null
  )

  const resolveNgoName = (value) => (
    value?.ngoName ??
    value?.ngo?.name ??
    value?.ngo?.ngoName ??
    value?.ngo?.title ??
    value?.assignedNgo?.name ??
    value?.assignedNgoName ??
    value?.campaign?.ngoName ??
    value?.campaign?.ngo?.name ??
    value?.campaignTitle ??
    value?.title ??
    ''
  )

  const tokenPayload = decodeJwtPayload(localStorage.getItem('ngo_token'))
  const tokenNgoId = normalizeId(resolveNgoId(tokenPayload))
  const tokenNgoName = normalizeNameKey(resolveNgoName(tokenPayload))

  const userNgoId = normalizeId(resolveNgoId(user)) || tokenNgoId
  const userNgoName = normalizeNameKey(resolveNgoName(user)) || tokenNgoName

  const normalizeRole = (role) => {
    const raw = Array.isArray(role) ? role[0] : role
    return String(raw || '')
      .replace(/^ROLE_/, '')
      .trim()
      .toUpperCase()
  }

  const userRole = normalizeRole(user?.role)
  const tokenRole = normalizeRole(tokenPayload?.role || tokenPayload?.roles)
  const effectiveRole = userRole || tokenRole
  const isAdminRole = ['ADMIN', 'SUPER_ADMIN'].includes(effectiveRole)
  const isNgoAdmin = Boolean(userNgoId || userNgoName || (effectiveRole && !isAdminRole && effectiveRole.includes('NGO')))

  const matchesNgoScope = (campaign) => {
    if (!isNgoAdmin) return true
    const campaignNgoId = normalizeId(resolveNgoId(campaign))
    if (userNgoId && campaignNgoId) return userNgoId === campaignNgoId
    const campaignNgoName = normalizeNameKey(resolveNgoName(campaign) || campaign?.ngoName)
    if (userNgoName && campaignNgoName) return userNgoName === campaignNgoName
    return false
  }

  const visibleCampaigns = isNgoAdmin ? campaigns.filter(matchesNgoScope) : campaigns

  const handleAuthError = (e) => {
    const status = e?.response?.status
    if (status === 401 || status === 403) {
      toast.error('Admin access required. Please login again.')
      logout()
      return true
    }
    return false
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getAllCampaigns()
      setCampaigns(res.data.data || [])
    } catch (e) {
      if (!handleAuthError(e)) toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleApprove = async (id) => {
    try {
      await approveCampaign(id)
      toast.success('Campaign approved')
      loadData()
    } catch (e) {
      if (!handleAuthError(e)) toast.error('Approval failed')
    }
  }

  const handleReject = async (id) => {
    try {
      await rejectCampaign(id)
      toast.success('Campaign rejected')
      loadData()
    } catch (e) {
      if (!handleAuthError(e)) toast.error('Rejection failed')
    }
  }

  const statusBadge = (status) => {
    const map = {
      ACTIVE: 'bg-emerald-500/20 text-emerald-200',
      PENDING: 'bg-amber-500/20 text-amber-200',
      REJECTED: 'bg-rose-500/20 text-rose-200',
      COMPLETED: 'bg-slate-500/20 text-slate-200',
    }
    return map[status] || map.PENDING
  }

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img src={PAGE_BACKGROUNDS.adminCampaigns} alt="campaign management" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="hero-card rounded-2xl p-5 max-w-2xl">
            <p className="text-xs text-emerald-200 uppercase tracking-wider mb-2">Campaign Approvals</p>
            <h2 className="font-display text-2xl text-white font-bold">Review, approve, and launch campaigns</h2>
            <p className="text-sm text-slate-200 mt-2">Ensure every campaign meets verification standards before going live.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <FiFlag />
          {visibleCampaigns.length} total campaigns
        </div>
        <button onClick={loadData} className="flex items-center gap-2 text-xs text-slate-200 bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : visibleCampaigns.length === 0 ? (
        <div className="text-sm text-slate-400">No campaigns available.</div>
      ) : (
        <div className="space-y-3">
          {visibleCampaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-2xl p-4 border border-white/10"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{c.title}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
                    <span className="text-xs text-slate-400">{c.donationType}</span>
                  </div>
                  <p className="text-xs text-slate-400">{c.ngoName} · Target ₹{Number(c.targetAmount || 0).toLocaleString()}</p>
                </div>
                {String(c.status).toUpperCase() === 'PENDING' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(c.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(c.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
                    >
                      <FiX /> Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-lg">
                    <FiClock /> No action required
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
