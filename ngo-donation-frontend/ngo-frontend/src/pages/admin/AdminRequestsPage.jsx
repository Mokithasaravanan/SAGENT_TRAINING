import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import emailjs from '@emailjs/browser'
import {
  FiClipboard, FiMapPin, FiRefreshCw,
  FiUserCheck, FiClock, FiPackage, FiUserPlus
} from 'react-icons/fi'
import {
  getAllPickupRequests,
  getAllDonationRequests,
  approveDonation,
  rejectDonation,
  getAllVolunteers,
  assignVolunteerToPickup,
} from '../../services/api'
import { SkeletonRow } from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'

// EmailJS config (set these in a local .env file)
const EJS_SERVICE  = import.meta.env.VITE_EJS_SERVICE_ID
const EJS_TEMPLATE = import.meta.env.VITE_EJS_TEMPLATE_ID
const EJS_DONATION_TEMPLATE = import.meta.env.VITE_EJS_DONATION_TEMPLATE_ID || EJS_TEMPLATE
const EJS_VOLUNTEER_TEMPLATE = import.meta.env.VITE_EJS_VOLUNTEER_TEMPLATE_ID || EJS_DONATION_TEMPLATE
const EJS_KEY      = import.meta.env.VITE_EJS_PUBLIC_KEY
const DEFAULT_SENDER_NAME = import.meta.env.VITE_DONATION_SENDER_NAME || 'NGO Hub'
const DEFAULT_SENDER_EMAIL = import.meta.env.VITE_DONATION_TEST_EMAIL || 'mokitha8166@gmail.com'
const PLACEHOLDER_VALUES = new Set([
  'your_service_id',
  'your_template_id',
  'your_public_key',
  'template_XXXXXXX',
  'service_XXXXXXX',
  'XXXXXXXXXXXXXXX'
])
const isEmailConfigured =
  Boolean(EJS_SERVICE && EJS_VOLUNTEER_TEMPLATE && EJS_KEY) &&
  !PLACEHOLDER_VALUES.has(EJS_SERVICE) &&
  !PLACEHOLDER_VALUES.has(EJS_VOLUNTEER_TEMPLATE) &&
  !PLACEHOLDER_VALUES.has(EJS_KEY)

export default function AdminRequestsPage() {
  const { user } = useAuth()
  const [donations,  setDonations]  = useState([])
  const [requests,   setRequests]   = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [donationAction, setDonationAction] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState('')
  const [selectedPickup, setSelectedPickup] = useState('')

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
    value?.assignedNgo?.ngo_id ??
    value?.assignedNgo?.ngoID ??
    value?.campaign?.ngoId ??
    value?.campaign?.ngo_id ??
    value?.campaign?.ngoID ??
    value?.campaign?.ngo?.id ??
    value?.campaign?.ngo?.ngoId ??
    value?.campaign?.ngo?.ngo_id ??
    value?.campaign?.ngo?.ngoID ??
    null
  )

  const resolveNgoName = (value) => (
    value?.ngoName ??
    value?.ngo?.name ??
    value?.ngo?.ngoName ??
    value?.ngo?.title ??
    value?.ngo?.organizationName ??
    value?.organizationName ??
    value?.orgName ??
    value?.assignedNgo?.name ??
    value?.assignedNgo?.ngoName ??
    value?.assignedNgoName ??
    value?.campaign?.ngoName ??
    value?.campaign?.ngo?.name ??
    value?.campaign?.title ??
    value?.campaign?.name ??
    value?.campaignTitle ??
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

  const normalizeDonationStatus = (status) => {
    if (status === true || status === 1 || status === '1') return 'APPROVED'
    if (status === false || status === 0 || status === '0') return 'PENDING'
    const s = String(status || '').toUpperCase().trim()
    if (!s) return 'PENDING'
    if (s.includes('APPROV') || s === 'CONFIRMED' || s === 'ACTIVE') return 'APPROVED'
    if (s.includes('REJECT')) return 'REJECTED'
    if (s.includes('PEND') || s.includes('WAIT')) return 'PENDING'
    return s
  }

  const normalizeDonationType = (type) => {
    const t = String(type || '').toUpperCase().trim()
    if (!t) return ''
    if (t.includes('MONEY') || t.includes('CASH')) return 'MONEY'
    if (t.includes('CLOTH')) return 'CLOTHES'
    if (t.includes('FOOD')) return 'FOOD'
    if (t.includes('GROC')) return 'GROCERY'
    return t
  }

  const normalizeDonation = (d) => {
    const donationType = normalizeDonationType(
      d?.donationType ?? d?.type ?? d?.itemType ?? d?.category
    )
    return {
      ...d,
      id: d?.id ?? d?.donationId ?? d?.donation_id ?? d?._id,
      donorName: d?.donorName ?? d?.donor?.name ?? d?.user?.name ?? d?.donor?.fullName,
      campaignTitle: d?.campaignTitle ?? d?.campaign?.title ?? d?.campaign?.name ?? d?.campaignName,
      ngoId: normalizeId(resolveNgoId(d)),
      ngoName: resolveNgoName(d),
      donationType,
      amount: d?.amount ?? d?.donationAmount ?? d?.value,
      message:
        d?.message ??
        d?.itemDescription ??
        d?.items ??
        d?.description,
      requestedAt: d?.requestedAt ?? d?.createdAt ?? d?.created_at ?? d?.date,
      status: normalizeDonationStatus(
        d?.status ??
        d?.approvalStatus ??
        d?.donationStatus ??
        d?.approved
      ),
    }
  }

  const matchesNgoScope = (donation) => {
    if (!isNgoAdmin) return true
    const donationNgoId = normalizeId(resolveNgoId(donation))
    if (userNgoId && donationNgoId) return userNgoId === donationNgoId
    const donationNgoName = normalizeNameKey(resolveNgoName(donation) || donation?.campaignTitle)
    if (userNgoName && donationNgoName) return userNgoName === donationNgoName
    return false
  }

  const displayDonorName = (name) => {
    const raw = String(name || '').trim()
    if (!raw) return 'Jhon Doe'
    const lower = raw.toLowerCase()
    if (lower.includes('admin')) return 'Jhon Doe'
    if (lower === 'user') return 'Jhon Doe'
    return raw
  }

  const formatDateTime = (value) => {
    if (!value) return ''
    const dt = new Date(value)
    if (Number.isNaN(dt.getTime())) return String(value)
    return dt.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const buildVolunteerMessage = ({ volunteerName, pickupId, donorName, pickupAddress, pickupTime, campaignTitle }) => {
    const lines = [
      `Hi ${volunteerName || 'Volunteer'},`,
      '',
      'You have been assigned a new pickup task. ✅',
    ]
    if (pickupId) lines.push(`Pickup ID: #${pickupId}`)
    if (campaignTitle) lines.push(`Campaign: ${campaignTitle}`)
    if (donorName) lines.push(`Donor: ${donorName}`)
    if (pickupAddress) lines.push(`Address: ${pickupAddress}`)
    if (pickupTime) lines.push(`Scheduled: ${formatDateTime(pickupTime)}`)
    lines.push('', 'Please log in to NGO Hub to view details and start the pickup.')
    return lines.join('\n')
  }

  const sendVolunteerAssignEmail = async ({
    toEmail,
    volunteerName,
    pickupId,
    donorName,
    pickupAddress,
    pickupTime,
    campaignTitle,
  }) => {
    if (!isEmailConfigured || !toEmail) return false
    const subject = pickupId
      ? `New Pickup Assigned (#${pickupId})`
      : 'New Pickup Assigned'
    const message = buildVolunteerMessage({
      volunteerName,
      pickupId,
      donorName,
      pickupAddress,
      pickupTime,
      campaignTitle,
    })
    const params = {
      to_email: toEmail,
      to_name: volunteerName || 'Volunteer',
      subject,
      message,
      from_name: DEFAULT_SENDER_NAME,
      from_email: DEFAULT_SENDER_EMAIL,
      reply_to: DEFAULT_SENDER_EMAIL,
      volunteer_name: volunteerName || 'Volunteer',
      volunteer_email: toEmail,
      pickup_id: pickupId || '',
      donor_name: donorName || '',
      pickup_address: pickupAddress || '',
      pickup_time: pickupTime || '',
      campaign_title: campaignTitle || '',
    }
    await emailjs.send(
      EJS_SERVICE,
      EJS_VOLUNTEER_TEMPLATE,
      params,
      EJS_KEY
    )
    return true
  }

  const normalizeVolunteer = (v) => ({
    ...v,
    id: v?.id ?? v?.volunteerId ?? v?.volunteer_id ?? v?.userId ?? v?.user?.id ?? v?._id,
    name:
      v?.name ??
      v?.fullName ??
      v?.user?.name ??
      v?.username ??
      v?.email ??
      'Volunteer',
    phone: v?.phone ?? v?.mobile ?? v?.contact ?? v?.user?.phone,
    email: v?.email ?? v?.user?.email,
  })

  const donationStatusBadge = (status) => {
    const map = {
      APPROVED: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
      REJECTED: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
      PENDING:  'bg-amber-500/20 text-amber-200 border-amber-500/30',
    }
    return map[status] || map.PENDING
  }

  const donationTypeBadge = (type) => {
    if (type === 'MONEY') return 'bg-amber-500/15 text-amber-200 border-amber-500/30'
    return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
  }

  const formatDate = (value) => {
    if (!value) return '-'
    const dt = new Date(value)
    if (Number.isNaN(dt.getTime())) return String(value)
    return dt.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const normalizeApiPickup = (p) => {
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
      donationId: p?.donationId ?? p?.donation_id ?? p?.donation?.id,
      status: String(p?.status ?? p?.pickupStatus ?? p?.requestStatus ?? 'SCHEDULED').toUpperCase(),
      localOnly: false,
      localId: null,
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [dr, pr, vr] = await Promise.allSettled([
        getAllDonationRequests(),
        isNgoAdmin ? Promise.resolve({ data: { data: [] } }) : getAllPickupRequests(),
        isNgoAdmin ? Promise.resolve({ data: { data: [] } }) : getAllVolunteers(),
      ])
      const donationRes = dr.status === 'fulfilled' ? dr.value : null
      const pickupRes = pr.status === 'fulfilled' ? pr.value : null
      const volunteerRes = vr.status === 'fulfilled' ? vr.value : null

      const pickups = !isNgoAdmin && pickupRes
        ? extractArray(pickupRes, ['pickups', 'requests', 'pickupRequests', 'items', 'results'])
        : []
      const donationList = donationRes
        ? extractArray(donationRes, ['donations', 'requests', 'items', 'results', 'data'])
        : []
      const volunteerList = !isNgoAdmin && volunteerRes
        ? extractArray(volunteerRes, ['volunteers', 'items', 'results', 'data'])
        : []

      const apiPickups = Array.isArray(pickups) ? pickups.map(normalizeApiPickup) : []
      setRequests(apiPickups)
      const mappedDonations = Array.isArray(donationList) ? donationList.map(normalizeDonation) : []
      setDonations(isNgoAdmin ? mappedDonations.filter(matchesNgoScope) : mappedDonations)
      setVolunteers(Array.isArray(volunteerList) ? volunteerList.map(normalizeVolunteer) : [])
      if (!isNgoAdmin && pr.status === 'rejected') {
        console.warn('Pickup load error:', pr.reason)
        toast.error('Failed to load pickup data')
      }
      if (!isNgoAdmin && vr.status === 'rejected') {
        console.warn('Volunteer load error:', vr.reason)
        toast.error('Failed to load volunteers')
      }
      if (dr.status === 'rejected') {
        console.warn('Donation load error:', dr.reason)
      }
    } catch (err) {
      console.error('Load error:', err)
      toast.error('Failed to load data')
      setRequests([])
      setDonations([])
      setVolunteers([])
    } finally {
      setLoading(false)
    }
  }, [isNgoAdmin])

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  const handleApproveDonation = async (donationId) => {
    if (!donationId) return
    setDonationAction(donationId)
    try {
      await approveDonation(donationId)
      toast.success('Donation approved')
      setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: 'APPROVED' } : d))
      await load()
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data || err.message
      toast.error(serverMessage || 'Approval failed')
    } finally {
      setDonationAction(null)
    }
  }

  const handleRejectDonation = async (donationId) => {
    if (!donationId) return
    setDonationAction(donationId)
    try {
      await rejectDonation(donationId)
      toast.success('Donation rejected')
      await load()
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data || err.message
      toast.error(serverMessage || 'Rejection failed')
    } finally {
      setDonationAction(null)
    }
  }

  const handleAssignVolunteer = async () => {
    if (!selectedPickup) {
      toast.error('Select a pickup request')
      return
    }
    if (!selectedVolunteer) {
      toast.error('Select a volunteer')
      return
    }
    setAssigning(true)
    try {
      await assignVolunteerToPickup(selectedPickup, selectedVolunteer)
      toast.success('Volunteer assigned')
      try {
        const volunteer = volunteers.find(v => String(v.id) === String(selectedVolunteer))
        const pickup = requests.find(r => String(r.id) === String(selectedPickup))
        const campaignTitle =
          pickup?.campaignTitle ||
          pickup?.campaign?.title ||
          pickup?.campaign?.name
        const sent = await sendVolunteerAssignEmail({
          toEmail: volunteer?.email,
          volunteerName: volunteer?.name,
          pickupId: pickup?.id,
          donorName: pickup?.donorName,
          pickupAddress: pickup?.pickupAddress,
          pickupTime: pickup?.pickupTime,
          campaignTitle,
        })
        if (sent) toast.success('Volunteer email sent')
      } catch (emailErr) {
        console.error('Volunteer email error:', emailErr)
        const errText = emailErr?.text || emailErr?.message || emailErr?.status
        toast.error(`Could not send volunteer email${errText ? `: ${errText}` : ''}`)
      }
      setSelectedPickup('')
      setSelectedVolunteer('')
      await load()
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data || err.message
      toast.error(serverMessage || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  const statusBadge = (status) => {
    const map = {
      SCHEDULED:   'bg-amber-500/20 text-amber-200 border-amber-500/30',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
      COMPLETED:   'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
      CANCELLED:   'bg-rose-500/20 text-rose-200 border-rose-500/30',
    }
    return map[status] || map.SCHEDULED
  }

  const pendingDonations = donations.filter(d => d.status === 'PENDING')
  const pending   = requests.filter(r => r.status !== 'COMPLETED')
  const completed = requests.filter(r => r.status === 'COMPLETED')
  const donationStatusMap = donations.reduce((acc, d) => {
    const key = normalizeId(d?.id)
    if (key) acc[key] = d.status
    return acc
  }, {})
  const getDonationStatusForPickup = (req) => {
    const donationId =
      req?.donationId ??
      req?.donation_id ??
      req?.donation?.id ??
      null
    const key = normalizeId(donationId)
    return key ? donationStatusMap[key] : null
  }

  const assignablePickups = requests
    .filter(req => {
      const assigned =
        req?.volunteerId ??
        req?.volunteer_id ??
        req?.assignedVolunteerId ??
        req?.assignedVolunteer?.id
      return !assigned
    })
    .filter(req => {
      const status = getDonationStatusForPickup(req)
      return status ? status === 'APPROVED' : true
    })

  return (
    <div className="space-y-8">

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80"
          alt="donation requests"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-950/50" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5
                          max-w-2xl border border-white/10">
            <p className="text-xs text-emerald-300 uppercase tracking-wider mb-2">
              Donation Requests
            </p>
            <h2 className="font-display text-2xl text-white font-bold">
              Approve or reject donations
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Volunteer tasks are created after approval.
            </p>
          </div>
        </div>
      </div>

      {/* Donation Requests */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Donation Requests</h3>
            <p className="text-xs text-slate-400">Approve or reject new donations. Tasks are created after approval.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">
              {loading
                ? 'Loading...'
                : `${donations.length} request${donations.length !== 1 ? 's' : ''}`}
            </div>
            {!loading && pendingDonations.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-300">
                  {pendingDonations.length} pending
                </span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No donation requests yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Campaign</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Message</th>
                  <th className="text-left px-4 py-3 font-medium">Requested</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d, i) => {
                  const amount = Number(d.amount)
                  const amountLabel =
                    Number.isFinite(amount) && amount > 0
                      ? `₹${amount.toLocaleString('en-IN')}`
                      : (d.donationType === 'MONEY' ? 'N/A' : 'Items')
                  const typeLabel = d.donationType === 'MONEY' ? 'MONETARY' : 'GOODS'
                  const isPending = d.status === 'PENDING'
                  const isActing = donationAction === d.id
                  const messageLabel = d.message
                    ? d.message
                    : (d.donationType === 'MONEY' ? 'Monetary donation' : 'Goods donation')
                  return (
                    <tr key={d.id || i} className="border-t border-white/5 text-slate-200">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">{displayDonorName(d.donorName)}</td>
                      <td className="px-4 py-3">{d.campaignTitle || d.ngoName || 'NGO Donation'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] border ${donationTypeBadge(d.donationType)}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-200">{amountLabel}</td>
                      <td className="px-4 py-3 max-w-[280px] truncate text-slate-300">
                        {messageLabel}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatDate(d.requestedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] border ${donationStatusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveDonation(d.id)}
                              disabled={isActing}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold
                                         bg-emerald-500/20 text-emerald-200
                                         border border-emerald-500/30
                                         hover:bg-emerald-500/30 transition-all
                                         disabled:opacity-50"
                            >
                              {isActing ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectDonation(d.id)}
                              disabled={isActing}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold
                                         bg-rose-500/15 text-rose-200
                                         border border-rose-500/30
                                         hover:bg-rose-500/25 transition-all
                                         disabled:opacity-50"
                            >
                              {isActing ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isNgoAdmin && (
        <>
          {/* Assign Volunteer */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Assign Volunteer to Pickup</h3>
                <p className="text-xs text-slate-400">Assign approved pickup requests to available volunteers.</p>
              </div>
              <div className="text-xs text-slate-400">
                {assignablePickups.length} pickup{assignablePickups.length !== 1 ? 's' : ''} ready
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-2">Pickup Request</label>
                <select
                  value={selectedPickup}
                  onChange={e => setSelectedPickup(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select pickup</option>
                  {assignablePickups.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.pickupAddress || 'No address'}
                    </option>
                  ))}
                </select>
                {!loading && assignablePickups.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">No approved pickup requests waiting for assignment.</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-2">Volunteer</label>
                <select
                  value={selectedVolunteer}
                  onChange={e => setSelectedVolunteer(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select volunteer</option>
                  {volunteers.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name || v.email || 'Volunteer'}
                    </option>
                  ))}
                </select>
                {!loading && volunteers.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">No volunteers available yet.</p>
                )}
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAssignVolunteer}
                  disabled={assigning || loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiUserPlus className="text-sm" />
                      Assign Volunteer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats + Refresh */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <FiClipboard className="text-emerald-400" />
                <span>
                  {loading
                    ? 'Loading...'
                    : `${requests.length} total request${requests.length !== 1 ? 's' : ''}`}
                </span>
              </div>
              {!loading && pending.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-amber-300">
                    {pending.length} pending
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 text-xs text-slate-300
                         bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10
                         transition-all disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </>
      )}

      {!isNgoAdmin && (
        <>
          {/* Loading */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
            </div>

          /* Empty state */
          ) : requests.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-white/5">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-white font-semibold text-lg mb-2">
                No pickup requests yet
              </p>
              <p className="text-slate-400 text-sm mb-4">
                When donors donate goods and schedule pickups,
                they will appear here.
              </p>
              <div className="max-w-xs mx-auto text-left bg-emerald-500/10
                              border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-emerald-400 text-xs font-semibold mb-2">
                  ✅ How to create pickup requests:
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  1️⃣ Login as Donor<br/>
                  2️⃣ Donate page → Clothes / Food / Grocery<br/>
                  3️⃣ Fill pickup address + date & time<br/>
                  4️⃣ Submit → appears here instantly ✅
                </p>
              </div>
            </div>

          ) : (
            <div className="space-y-6">

          {/* ── Pending Requests ── */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400
                             uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Pending Requests ({pending.length})
              </h3>

              <div className="space-y-4">
                {pending.map((req, i) => {
                  const donationStatus = getDonationStatusForPickup(req) || 'PENDING'
                  const isApproved = donationStatus === 'APPROVED'
                  const isRejected = donationStatus === 'REJECTED'
                  const donationId = req?.donationId ?? null
                  const isPendingDonation = donationStatus === 'PENDING' && !!donationId
                  const isActing = donationId && donationAction === donationId

                  return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-panel rounded-2xl p-5 border border-amber-500/20
                               hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                      {/* Left — Donor + Pickup Info */}
                      <div className="flex-1">
                        {/* Donor info */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br
                                          from-emerald-500 to-teal-400 flex items-center
                                          justify-center text-slate-950 font-bold text-sm
                                          flex-shrink-0">
                            {req.donorName?.[0]?.toUpperCase() || 'D'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {req.donorName || 'Donor'}
                            </p>
                            <p className="text-xs text-slate-500">
                              Pickup #{req.id}
                            </p>
                          </div>
                          <span className={`ml-auto text-xs px-2.5 py-1
                                           rounded-full border ${statusBadge(req.status)}`}>
                            {req.status}
                          </span>
                        </div>

                        {/* Pickup address */}
                        <div className="flex items-start gap-2 text-xs
                                        text-slate-300 mb-2">
                          <FiMapPin className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{req.pickupAddress || 'Address not provided'}</span>
                        </div>

                        {/* Pickup time */}
                        {req.pickupTime && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <FiClock className="text-teal-400 flex-shrink-0" />
                            <span>
                              {new Date(req.pickupTime).toLocaleString('en-IN', {
                                day:    'numeric',
                                month:  'short',
                                year:   'numeric',
                                hour:   '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}

                        {/* Donation info */}
                        {req.donationId && (
                          <div className="flex items-center gap-2 text-xs
                                          text-slate-500 mt-1.5">
                            <FiPackage className="text-slate-600 flex-shrink-0" />
                            <span>Donation #{req.donationId} · {donationStatus}</span>
                          </div>
                        )}
                      </div>

                      {/* Right — Approval & Task Status */}
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <label className="text-xs text-slate-400 uppercase
                                          tracking-wider flex items-center gap-1">
                          <FiUserCheck className="text-emerald-400" />
                          Approval & Task
                        </label>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px]
                                     border ${donationStatusBadge(donationStatus)}`}
                        >
                          {donationStatus}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {isApproved && 'Volunteer task will appear automatically.'}
                          {isRejected && 'Donation rejected — no volunteer task.'}
                          {!isApproved && !isRejected && 'Waiting for admin approval.'}
                        </div>
                        {isPendingDonation && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleApproveDonation(donationId)}
                              disabled={isActing}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold
                                         bg-emerald-500/20 text-emerald-200
                                         border border-emerald-500/30
                                         hover:bg-emerald-500/30 transition-all
                                         disabled:opacity-50"
                            >
                              {isActing ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectDonation(donationId)}
                              disabled={isActing}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold
                                         bg-rose-500/15 text-rose-200
                                         border border-rose-500/30
                                         hover:bg-rose-500/25 transition-all
                                         disabled:opacity-50"
                            >
                              {isActing ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )})}
              </div>
            </div>
          )}

          {/* ── Completed Requests ── */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400
                             uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Completed ({completed.length})
              </h3>

              <div className="space-y-3">
                {completed.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-panel rounded-2xl p-4 border border-emerald-500/20
                               opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br
                                      from-emerald-500 to-teal-400 flex items-center
                                      justify-center text-slate-950 font-bold
                                      text-sm flex-shrink-0">
                        {req.donorName?.[0]?.toUpperCase() || 'D'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          {req.donorName || 'Donor'}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs
                                        text-slate-400 mt-0.5">
                          <FiMapPin className="text-slate-600" />
                          <span>{req.pickupAddress}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs
                                      text-emerald-300 bg-emerald-500/10
                                      px-3 py-1.5 rounded-xl border
                                      border-emerald-500/20 flex-shrink-0">
                        <FiUserCheck className="text-xs" />
                        Completed ✅
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
