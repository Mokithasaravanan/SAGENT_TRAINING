import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCheck, FiClock, FiMapPin, FiPlay,
  FiRefreshCw, FiPackage, FiCalendar, FiDollarSign
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import useVolunteerTasks from '../../hooks/useVolunteerTasks'
import { SkeletonRow } from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import {
  assignVolunteerToPickup,
  claimPickupTask,
  getAllPickupRequests,
  getAllVolunteerTasks,
  getAvailablePickupRequests,
} from '../../services/api'

const STATUS_CFG = {
  ASSIGNED: {
    color:  'text-amber-200',
    bg:     'bg-amber-500/20',
    border: 'border-amber-400/30',
    icon:   FiClock,
    dot:    'bg-amber-400',
  },
  IN_PROGRESS: {
    color:  'text-blue-200',
    bg:     'bg-blue-500/20',
    border: 'border-blue-400/30',
    icon:   FiPlay,
    dot:    'bg-blue-400',
  },
  COMPLETED: {
    color:  'text-emerald-200',
    bg:     'bg-emerald-500/20',
    border: 'border-emerald-400/30',
    icon:   FiCheck,
    dot:    'bg-emerald-400',
  },
}

const NEXT_STATUS = {
  ASSIGNED:    'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
}

const NEXT_LABEL = {
  ASSIGNED:    'Start Pickup',
  IN_PROGRESS: 'Mark Complete',
}

const formatAmount = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return `₹${amount.toLocaleString('en-IN')}`
}

const normalizeId = (value) => (
  value === undefined || value === null ? null : String(value)
)

const normalizeApprovalStatus = (status) => {
  if (status === true || status === 1 || status === '1') return 'APPROVED'
  if (status === false || status === 0 || status === '0') return 'PENDING'
  const s = String(status || '').toUpperCase().trim()
  if (!s) return ''
  if (s.includes('APPROV') || s === 'CONFIRMED' || s === 'ACTIVE') return 'APPROVED'
  if (s.includes('REJECT')) return 'REJECTED'
  if (s.includes('PEND') || s.includes('WAIT')) return 'PENDING'
  return s
}

const resolveDonationApprovalStatus = (item) => {
  const pickup =
    item?.pickupRequest ||
    item?.pickup ||
    item?.request ||
    item?.pickupDetails ||
    item?.pickup_request ||
    item ||
    {}
  const donation =
    item?.donation ||
    item?.donationDetails ||
    item?.donationInfo ||
    pickup?.donation ||
    {}
  const statusRaw =
    item?.donationStatus ??
    item?.donation_status ??
    item?.approvalStatus ??
    item?.approval_status ??
    item?.approved ??
    pickup?.donationStatus ??
    pickup?.donation_status ??
    pickup?.approvalStatus ??
    pickup?.approval_status ??
    pickup?.approved ??
    donation?.status ??
    donation?.donationStatus ??
    donation?.donation_status ??
    donation?.approvalStatus ??
    donation?.approval_status ??
    donation?.approved
  return normalizeApprovalStatus(statusRaw)
}

const extractArray = (res, keys = []) => {
  if (!res) return []
  if (Array.isArray(res)) return res
  const data = res?.data ?? res
  if (Array.isArray(data?.data)) return data.data
  for (const key of keys) {
    const value = data?.[key] ?? data?.data?.[key]
    if (Array.isArray(value)) return value
  }
  if (Array.isArray(data?.content)) return data.content
  return Array.isArray(data) ? data : []
}

const resolveVolunteerId = (user) => {
  const candidates = [
    user?.volunteerId,
    user?.volunteer_id,
    user?.userId,
    user?.id,
    user?.email,
  ]
  const found = candidates.find(v =>
    v !== undefined && v !== null && String(v).trim() !== ''
  )
  if (found === undefined) return null
  const num = Number(found)
  return Number.isFinite(num) ? num : found
}

const getTaskPickupId = (task) => (
  task?.pickupRequestId ??
  task?.pickup_request_id ??
  task?.pickupRequest?.id ??
  task?.pickup?.id ??
  task?.pickupId ??
  task?.requestId ??
  task?.request?.id ??
  null
)

const getTaskVolunteerId = (task) => (
  task?.volunteerId ??
  task?.volunteer_id ??
  task?.volunteer?.id ??
  task?.user?.id ??
  null
)

const normalizePickup = (p) => {
  const pickupRequestId =
    p?.pickupRequestId ??
    p?.pickup_request_id ??
    p?.requestId ??
    p?.request_id ??
    p?.pickupId ??
    p?.id ??
    null
  const id = pickupRequestId ?? p?.id ?? null
  return {
    ...p,
    id,
    pickupRequestId,
    donorName: p?.donorName ?? p?.donor?.name ?? p?.donor?.fullName ?? p?.user?.name,
    pickupAddress: p?.pickupAddress ?? p?.address ?? p?.pickup_address ?? p?.location,
    pickupTime: p?.pickupTime ?? p?.pickup_time ?? p?.scheduledAt ?? p?.scheduleTime ?? p?.pickupDate,
    status: String(p?.status ?? p?.pickupStatus ?? p?.requestStatus ?? 'SCHEDULED').toUpperCase(),
  }
}

const isAvailableStatus = (status) => {
  const s = String(status || '').toUpperCase()
  return !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(s)
}

const extractDonationMeta = (task) => {
  const pickup =
    task?.pickupRequest ||
    task?.pickup ||
    task?.request ||
    task?.pickupDetails ||
    task?.pickup_request ||
    task ||
    {}
  const donation =
    task?.donation ||
    task?.donationDetails ||
    task?.donationInfo ||
    pickup?.donation ||
    {}
  const campaign =
    task?.campaign ||
    donation?.campaign ||
    pickup?.campaign ||
    {}
  const itemName = task?.itemName || pickup?.itemName || donation?.itemName
  const quantity = task?.quantity || pickup?.quantity || donation?.quantity
  const derivedItems =
    itemName && quantity ? `${quantity} ${itemName}` : null
  return {
    type:
      task?.donationType ||
      task?.itemType ||
      pickup?.donationType ||
      pickup?.itemType ||
      donation?.donationType ||
      donation?.itemType,
    amount:
      task?.amount ??
      task?.donationAmount ??
      pickup?.amount ??
      pickup?.donationAmount ??
      donation?.amount ??
      donation?.donationAmount,
    items:
      task?.itemDescription ||
      task?.items ||
      pickup?.itemDescription ||
      pickup?.items ||
      donation?.itemDescription ||
      donation?.items ||
      pickup?.description ||
      donation?.description ||
      derivedItems,
    campaignTitle:
      task?.campaignTitle ||
      donation?.campaignTitle ||
      pickup?.campaignTitle ||
      campaign?.title ||
      campaign?.name,
  }
}

export default function VolunteerTasksPage() {
  const { user } = useAuth()
  const { tasks, loading, updating, updateStatus, refresh } =
    useVolunteerTasks()
  const [available, setAvailable] = useState([])
  const [availableLoading, setAvailableLoading] = useState(true)
  const [claiming, setClaiming] = useState(null)
  const [approvalInfo, setApprovalInfo] = useState({ has: false, hidden: 0 })

  const loadAvailable = useCallback(async () => {
    setAvailableLoading(true)
    setApprovalInfo({ has: false, hidden: 0 })
    try {
      let pickups = []
      let usedFallback = false
      try {
        const res = await getAvailablePickupRequests()
        pickups = extractArray(res, [
          'pickups',
          'requests',
          'pickupRequests',
          'items',
          'results',
          'available',
          'data',
        ])
      } catch (err) {
        usedFallback = true
      }

      if (usedFallback) {
        const [pr, tr] = await Promise.allSettled([
          getAllPickupRequests(),
          getAllVolunteerTasks(),
        ])
        const pickupRes = pr.status === 'fulfilled' ? pr.value : null
        const taskRes = tr.status === 'fulfilled' ? tr.value : null
        const allPickups = pickupRes
          ? extractArray(pickupRes, ['pickups', 'requests', 'pickupRequests', 'items', 'results'])
          : []
        const tasksRaw = taskRes
          ? extractArray(taskRes, ['tasks', 'volunteerTasks', 'data'])
          : []
        const taskMap = {}
        if (Array.isArray(tasksRaw)) {
          tasksRaw.forEach(task => {
            const pickupId = getTaskPickupId(task)
            const key = normalizeId(pickupId)
            if (key && !taskMap[key]) taskMap[key] = task
          })
        }
        pickups = Array.isArray(allPickups)
          ? allPickups.filter(p => {
            const key = normalizeId(p?.pickupRequestId ?? p?.id)
            const assigned =
              p?.volunteerId ??
              p?.volunteer_id ??
              p?.assignedVolunteerId ??
              p?.assignedVolunteer?.id ??
              getTaskVolunteerId(taskMap[key])
            const status = String(p?.status ?? p?.pickupStatus ?? p?.requestStatus ?? 'SCHEDULED').toUpperCase()
            return !assigned && isAvailableStatus(status)
          })
          : []
      }

      const normalized = (Array.isArray(pickups) ? pickups.map(normalizePickup) : [])
        .filter(p => isAvailableStatus(p.status))
        .filter(p => {
          const assigned =
            p?.volunteerId ??
            p?.volunteer_id ??
            p?.assignedVolunteerId ??
            p?.assignedVolunteer?.id
          return !assigned
        })
      const withApproval = normalized.map(p => ({
        ...p,
        donationApproval: resolveDonationApprovalStatus(p),
      }))
      const hasApprovalInfo = withApproval.some(p => p.donationApproval)
      const approvedOnly = hasApprovalInfo
        ? withApproval.filter(p => p.donationApproval === 'APPROVED')
        : withApproval
      setApprovalInfo({
        has: hasApprovalInfo,
        hidden: hasApprovalInfo ? Math.max(withApproval.length - approvedOnly.length, 0) : 0,
      })
      setAvailable(approvedOnly)
    } catch (err) {
      console.error('Available tasks error:', err)
      setAvailable([])
    } finally {
      setAvailableLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAvailable()
    const interval = setInterval(loadAvailable, 20000)
    return () => clearInterval(interval)
  }, [loadAvailable])

  const handleClaim = async (pickupId) => {
    if (!pickupId) {
      toast.error('Pickup not available yet')
      return
    }
    const volunteerId = resolveVolunteerId(user)
    if (!volunteerId) {
      toast.error('Please login again to select a task')
      return
    }
    setClaiming(pickupId)
    try {
      try {
        await claimPickupTask(pickupId, volunteerId)
      } catch (err) {
        await assignVolunteerToPickup(pickupId, volunteerId)
      }
      toast.success('Task assigned to you')
      await refresh()
      await loadAvailable()
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data || err.message
      toast.error(serverMessage || 'Failed to assign task')
    } finally {
      setClaiming(null)
    }
  }

  const refreshAll = () => {
    refresh()
    loadAvailable()
  }

  const tasksWithApproval = tasks.map(t => ({
    ...t,
    donationApproval: resolveDonationApprovalStatus(t),
  }))
  const tasksHaveApproval = tasksWithApproval.some(t => t.donationApproval)
  const visibleTasks = tasksHaveApproval
    ? tasksWithApproval.filter(t => t.donationApproval === 'APPROVED')
    : tasksWithApproval
  const pending   = visibleTasks.filter(t => t.status !== 'COMPLETED')
  const completed = visibleTasks.filter(t => t.status === 'COMPLETED')
  const hasHiddenTasks = tasks.length > 0 && visibleTasks.length === 0 && tasksHaveApproval

  return (
    <div className="space-y-8">

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80"
          alt="volunteer tasks"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-950/50" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5
                          max-w-2xl border border-white/10">
            <p className="text-xs text-amber-300 uppercase tracking-wider mb-2">
              Available & Assigned Tasks
            </p>
            <h2 className="font-display text-2xl text-white font-bold">
              Pick a task and update progress
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Choose available pickups or manage your assigned ones.
            </p>
          </div>
        </div>
      </div>

      {/* Stats + Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm text-slate-400">
              {pending.length} pending
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-400">
              {completed.length} completed
            </span>
          </div>
        </div>

        <button
          onClick={refreshAll}
          disabled={loading || availableLoading}
          className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl
                     text-slate-400 hover:text-emerald-400 text-sm transition-all"
        >
          <FiRefreshCw className={loading || availableLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Available Tasks */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Available Volunteer Tasks</h3>
            <p className="text-xs text-slate-400">Select a pickup once admin approval is done.</p>
          </div>
          <div className="text-xs text-slate-400">
            {availableLoading ? 'Loading...' : `${available.length} available`}
          </div>
        </div>

        {availableLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : available.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {approvalInfo.has
              ? 'No approved tasks yet. Waiting for admin approval.'
              : 'No available tasks right now. Check back soon.'}
            {approvalInfo.has && approvalInfo.hidden > 0 && (
              <div className="text-xs text-slate-500 mt-2">
                {approvalInfo.hidden} pickup{approvalInfo.hidden !== 1 ? 's' : ''} pending approval.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {available.map((task, i) => {
              const meta = extractDonationMeta(task)
              const amount = formatAmount(meta.amount)
              const hasMeta = meta.type || amount || meta.items || meta.campaignTitle
              const taskId = task?.pickupRequestId ?? task?.id ?? null
              const taskKey = taskId ?? i
              const statusLabel = String(task.status || 'AVAILABLE').replace('_', ' ')
              const isClaiming = taskId && claiming === taskId
              const canClaim = !!taskId
              return (
                <motion.div
                  key={taskKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-2xl p-5 border border-white/10 hover:bg-white/5 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                          {statusLabel}
                        </span>
                        <span className="text-xs text-slate-500">
                          Pickup #{taskId || '—'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mb-2">
                        {task.donorName || 'Donor Pickup'}
                      </p>
                      {hasMeta ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                          {meta.type && (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              {meta.type}
                            </span>
                          )}
                          {amount && (
                            <span className="flex items-center gap-1 text-amber-200">
                              <FiDollarSign className="text-amber-300" />
                              {amount}
                            </span>
                          )}
                          {meta.items && (
                            <span className="w-full text-slate-300 break-words">
                              Items: {meta.items}
                            </span>
                          )}
                          {meta.campaignTitle && (
                            <span className="w-full text-slate-500">
                              Campaign: {meta.campaignTitle}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic mb-2">
                          Donation details not provided
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-xs text-slate-300 mb-2">
                        <FiMapPin className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{task.pickupAddress || 'Address not provided'}</span>
                      </div>
                      {task.pickupTime && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <FiCalendar className="text-teal-400 flex-shrink-0" />
                          <span>
                            {new Date(task.pickupTime).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClaim(taskId)}
                      disabled={isClaiming || !canClaim}
                      className="btn-primary py-2.5 px-5 text-sm flex items-center justify-center gap-2 flex-shrink-0 min-w-[160px]"
                    >
                      {isClaiming ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        canClaim ? 'Select This Task' : 'Unavailable'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>

      ) : visibleTasks.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/5">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-white font-semibold text-lg mb-2">
            {hasHiddenTasks ? 'Waiting for admin approval' : 'No tasks assigned yet'}
          </p>
          <p className="text-slate-400 text-sm">
            {hasHiddenTasks
              ? 'Pickups will appear after donations are approved.'
              : 'Admin will assign pickup tasks to you soon!'}
          </p>
          <button
            onClick={refresh}
            className="mt-4 btn-primary py-2 px-6 text-sm"
          >
            Check Again
          </button>
        </div>

      ) : (
        <div className="space-y-6">

          {/* Pending Tasks */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400
                             uppercase tracking-wider mb-3">
                🔴 Active Tasks ({pending.length})
              </h3>
              <div className="space-y-4">
                <AnimatePresence>
                  {pending.map((task, i) => {
                    const status = String(task.status || 'ASSIGNED').toUpperCase()
                    const cfg  = STATUS_CFG[status] ||
                                 STATUS_CFG.ASSIGNED
                    const next = NEXT_STATUS[status]
                    const meta = extractDonationMeta(task)
                    const amount = formatAmount(meta.amount)
                    const hasMeta = meta.type || amount || meta.items || meta.campaignTitle

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.05 }}
                        className={`glass-panel rounded-2xl p-5 border ${cfg.border}
                                    hover:bg-white/5 transition-all`}
                      >
                        <div className="flex flex-col lg:flex-row
                                        lg:items-center gap-4">
                          <div className="flex-1">
                            {/* Status badge + Task ID */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`flex items-center gap-1.5
                                px-2.5 py-1 rounded-full text-xs font-medium
                                ${cfg.bg} ${cfg.color}`}>
                                <div className={`w-1.5 h-1.5 rounded-full
                                                ${cfg.dot} animate-pulse`} />
                                {status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-500">
                                Task #{task.id}
                              </span>
                            </div>

                            {/* Donor name */}
                            <p className="text-sm font-semibold text-white mb-2">
                              <FiPackage className="inline mr-1
                                                    text-amber-400" />
                              {task.donorName || 'Donor Pickup'}
                            </p>

                            {hasMeta ? (
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                                {meta.type && (
                                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                                    {meta.type}
                                  </span>
                                )}
                                {amount && (
                                  <span className="flex items-center gap-1 text-amber-200">
                                    <FiDollarSign className="text-amber-300" />
                                    {amount}
                                  </span>
                                )}
                                {meta.items && (
                                  <span className="w-full text-slate-300 break-words">
                                    Items: {meta.items}
                                  </span>
                                )}
                                {meta.campaignTitle && (
                                  <span className="w-full text-slate-500">
                                    Campaign: {meta.campaignTitle}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 italic mb-2">
                                Donation details not provided
                              </div>
                            )}

                            {/* Address */}
                            <div className="flex items-start gap-2
                                            text-xs text-slate-300 mb-2">
                              <FiMapPin className="text-amber-400
                                                   mt-0.5 flex-shrink-0" />
                              <span>{task.pickupAddress ||
                                     'Address not provided'}</span>
                            </div>

                            {/* Time */}
                            {task.pickupTime && (
                              <div className="flex items-center gap-2
                                              text-xs text-slate-400">
                                <FiCalendar className="text-teal-400
                                                        flex-shrink-0" />
                                <span>
                                  {new Date(task.pickupTime)
                                    .toLocaleString('en-IN', {
                                      day:    'numeric',
                                      month:  'short',
                                      year:   'numeric',
                                      hour:   '2-digit',
                                      minute: '2-digit',
                                    })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action button */}
                          {next && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                updateStatus(task.id, status)}
                              disabled={updating === task.id}
                              className="btn-primary py-2.5 px-5 text-sm
                                         flex items-center justify-center
                                         gap-2 flex-shrink-0 min-w-[140px]"
                            >
                              {updating === task.id ? (
                                <div className="w-4 h-4 border-2
                                  border-white/30 border-t-white
                                  rounded-full animate-spin" />
                              ) : (
                                <>
                                  <cfg.icon className="text-xs" />
                                  {NEXT_LABEL[status]}
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400
                             uppercase tracking-wider mb-3">
                ✅ Completed Tasks ({completed.length})
              </h3>
              <div className="space-y-3">
                {completed.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-panel rounded-2xl p-4 border
                               border-emerald-500/20 opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center gap-1.5
                            px-2.5 py-1 rounded-full text-xs font-medium
                            bg-emerald-500/20 text-emerald-300">
                            <FiCheck className="text-xs" />
                            COMPLETED
                          </span>
                          <span className="text-xs text-slate-500">
                            Task #{task.id}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">
                          {task.donorName || 'Donor Pickup'}
                        </p>
                        {(() => {
                          const meta = extractDonationMeta(task)
                          const amount = formatAmount(meta.amount)
                          const hasMeta = meta.type || amount || meta.items || meta.campaignTitle
                          if (!hasMeta) {
                            return (
                              <p className="text-xs text-slate-500 italic mt-1">
                                Donation details not provided
                              </p>
                            )
                          }
                          return (
                            <div className="mt-1 space-y-1 text-xs text-slate-400">
                              {meta.type && (
                                <div className="text-slate-300">{meta.type}</div>
                              )}
                              {amount && (
                                <div className="text-amber-200">{amount}</div>
                              )}
                              {meta.items && (
                                <div className="text-slate-400 break-words">
                                  Items: {meta.items}
                                </div>
                              )}
                              {meta.campaignTitle && (
                                <div className="text-slate-500">
                                  Campaign: {meta.campaignTitle}
                                </div>
                              )}
                            </div>
                          )
                        })()}
                        <div className="flex items-center gap-1.5
                                        text-xs text-slate-500 mt-1">
                          <FiMapPin className="text-slate-600" />
                          <span>{task.pickupAddress}</span>
                        </div>
                      </div>
                      <div className="text-xs text-emerald-300
                                      bg-emerald-500/15 px-3 py-2
                                      rounded-xl flex-shrink-0">
                        ✅ Done
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
