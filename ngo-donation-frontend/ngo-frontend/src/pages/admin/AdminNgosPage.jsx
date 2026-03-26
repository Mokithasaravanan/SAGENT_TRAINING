import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import emailjs from '@emailjs/browser'
import {
  FiHome,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
} from 'react-icons/fi'
import {
  assignNgoAdminToNgo,
  createNgo,
  createNgoAdmin,
  getAllNgos,
  getAllNgoAdmins,
} from '../../services/api'
import { PAGE_BACKGROUNDS } from '../../constants/imagery'
import { SkeletonRow } from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'

const EMPTY_NGO = {
  name: '',
  address: '',
  location: '',
  contactEmail: '',
  contactPhone: '',
  description: '',
}

const EMPTY_ADMIN = {
  name: '',
  email: '',
  phone: '',
  password: '',
  ngoId: '',
}

const HIDDEN_ADMIN_EMAILS = new Set([
  'mokithaconnect@gmail.com',
])

const HIDDEN_NGO_NAMES = new Set([
  'health society found',
])

// EmailJS config (set these in a local .env file)
const EJS_SERVICE  = import.meta.env.VITE_EJS_SERVICE_ID
const EJS_TEMPLATE = import.meta.env.VITE_EJS_TEMPLATE_ID
const EJS_NGO_ADMIN_TEMPLATE = import.meta.env.VITE_EJS_NGO_ADMIN_TEMPLATE_ID || EJS_TEMPLATE
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
  Boolean(EJS_SERVICE && EJS_NGO_ADMIN_TEMPLATE && EJS_KEY) &&
  !PLACEHOLDER_VALUES.has(EJS_SERVICE) &&
  !PLACEHOLDER_VALUES.has(EJS_NGO_ADMIN_TEMPLATE) &&
  !PLACEHOLDER_VALUES.has(EJS_KEY)

const normalizeKey = (value) => String(value || '').trim().toLowerCase()
const isHiddenNgoName = (name) => HIDDEN_NGO_NAMES.has(normalizeKey(name))
const isHiddenAdminEmail = (email) => HIDDEN_ADMIN_EMAILS.has(normalizeKey(email))
const isHiddenAdmin = (admin) =>
  isHiddenAdminEmail(admin?.email) || isHiddenNgoName(admin?.ngoName)

const buildNgoAdminMessage = ({ adminName, ngoName }) => {
  const lines = [
    `Hi ${adminName || 'Admin'},`,
    '',
    ngoName
      ? `You have been assigned as the NGO Admin for ${ngoName}.`
      : 'You have been assigned as an NGO Admin.',
    'Please log in to NGO Hub to manage the NGO.',
    '',
    'If you have any questions, please contact the NGO Hub team.',
  ]
  return lines.join('\n')
}

const sendNgoAdminAssignEmail = async ({ toEmail, adminName, ngoName }) => {
  if (!isEmailConfigured || !toEmail) return false
  const subject = ngoName
    ? `You are now the NGO Admin for ${ngoName}`
    : 'You have been assigned as an NGO Admin'
  const message = buildNgoAdminMessage({ adminName, ngoName })
  const params = {
    to_email: toEmail,
    to_name: adminName || 'Admin',
    subject,
    message,
    from_name: DEFAULT_SENDER_NAME,
    from_email: DEFAULT_SENDER_EMAIL,
    reply_to: DEFAULT_SENDER_EMAIL,
    admin_name: adminName || 'Admin',
    admin_email: toEmail,
    ngo_name: ngoName || '',
  }
  await emailjs.send(
    EJS_SERVICE,
    EJS_NGO_ADMIN_TEMPLATE,
    params,
    EJS_KEY
  )
  return true
}

export default function AdminNgosPage() {
  const { logout } = useAuth()
  const [ngos, setNgos] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingNgo, setSavingNgo] = useState(false)
  const [savingAdmin, setSavingAdmin] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [ngoForm, setNgoForm] = useState(EMPTY_NGO)
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN)
  const [selectedNgo, setSelectedNgo] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState('')

  const handleAuthError = (e) => {
    const status = e?.response?.status
    if (status === 401 || status === 403) {
      toast.error('Admin access required. Please login again.')
      logout()
      return true
    }
    return false
  }

  const getErrorMessage = (err, fallback) => {
    const status = err?.response?.status
    const serverMessage =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message
    if (status && serverMessage) return `${fallback} (HTTP ${status}): ${serverMessage}`
    if (status) return `${fallback} (HTTP ${status})`
    return serverMessage ? `${fallback}: ${serverMessage}` : fallback
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

  const normalizeNgo = (n) => ({
    ...n,
    id: n?.id ?? n?.ngoId ?? n?.ngo_id ?? n?._id ?? n?.uuid,
    name: n?.name ?? n?.ngoName ?? n?.title ?? 'NGO',
    address: n?.address ?? n?.location ?? n?.city ?? '',
    description: n?.description ?? n?.about ?? n?.details ?? '',
    contactEmail: n?.contactEmail ?? n?.contact_email ?? n?.email ?? '',
    contactPhone: n?.contactPhone ?? n?.contact_phone ?? n?.phone ?? n?.mobile ?? '',
    location: n?.location ?? n?.city ?? n?.state ?? '',
  })

  const normalizeAdmin = (a) => ({
    ...a,
    id:
      a?.id ??
      a?.adminId ??
      a?.userId ??
      a?.user?.id ??
      a?._id ??
      a?.uuid,
    name: a?.name ?? a?.fullName ?? a?.user?.name ?? a?.email ?? 'Admin',
    email: a?.email ?? a?.user?.email ?? '',
    phone: a?.phone ?? a?.mobile ?? a?.user?.phone ?? '',
    ngoId: a?.ngoId ?? a?.ngo?.id ?? a?.assignedNgoId ?? a?.assignedNgo?.id,
    ngoName: a?.ngoName ?? a?.ngo?.name ?? a?.assignedNgo?.name ?? '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [ngoRes, adminRes] = await Promise.allSettled([
        getAllNgos(),
        getAllNgoAdmins(),
      ])

      if (ngoRes.status === 'fulfilled') {
        const raw = extractArray(ngoRes.value, ['ngos', 'items', 'results'])
        setNgos(raw.map(normalizeNgo).filter((ngo) => !isHiddenNgoName(ngo.name)))
      } else {
        setNgos([])
        if (!handleAuthError(ngoRes.reason)) {
          toast.error(getErrorMessage(ngoRes.reason, 'Failed to load NGOs'))
        }
      }

      if (adminRes.status === 'fulfilled') {
        const raw = extractArray(adminRes.value, ['admins', 'ngoAdmins', 'users', 'items', 'results'])
        setAdmins(raw.map(normalizeAdmin).filter((admin) => !isHiddenAdmin(admin)))
      } else {
        setAdmins([])
        if (!handleAuthError(adminRes.reason)) {
          toast.error(getErrorMessage(adminRes.reason, 'Failed to load NGO admins'))
        }
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error('Failed to load data')
      }
      setNgos([])
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreateNgo = async () => {
    if (!ngoForm.name.trim()) {
      toast.error('NGO name is required')
      return
    }
    setSavingNgo(true)
    try {
      const payload = {
        name: ngoForm.name.trim(),
        description: ngoForm.description.trim(),
        contactEmail: ngoForm.contactEmail.trim(),
        contactPhone: ngoForm.contactPhone.trim(),
        address: ngoForm.address.trim(),
      }
      await createNgo(payload)
      toast.success('NGO created')
      setNgoForm(EMPTY_NGO)
      await load()
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data || err.message
      if (!handleAuthError(err)) toast.error(serverMessage || 'Failed to create NGO')
    } finally {
      setSavingNgo(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
      toast.error('Name, email, and password are required')
      return
    }
    if (!adminForm.ngoId) {
      toast.error('Select an NGO for this admin')
      return
    }
    setSavingAdmin(true)
    try {
      const adminEmail = adminForm.email.trim()
      const adminName = adminForm.name.trim() || adminEmail
      const selectedNgoForAdmin = ngos.find(n => String(n.id) === String(adminForm.ngoId))
      const ngoName = selectedNgoForAdmin?.name || ''
      const payload = {
        name: adminName,
        email: adminEmail,
        phone: adminForm.phone.trim(),
        password: adminForm.password,
        ngoId: Number(adminForm.ngoId),
      }
      await createNgoAdmin(payload)
      toast.success('NGO admin created')
      try {
        const sent = await sendNgoAdminAssignEmail({
          toEmail: adminEmail,
          adminName,
          ngoName,
        })
        if (sent) toast.success('Admin assignment email sent')
      } catch (emailErr) {
        console.error('Admin email error:', emailErr)
        const errText = emailErr?.text || emailErr?.message || emailErr?.status
        toast.error(`Could not send admin email${errText ? `: ${errText}` : ''}`)
      }
      setAdminForm(EMPTY_ADMIN)
      await load()
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data || err.message
      if (!handleAuthError(err)) toast.error(serverMessage || 'Failed to create NGO admin')
    } finally {
      setSavingAdmin(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedAdmin) {
      toast.error('Select an NGO admin')
      return
    }
    if (!selectedNgo) {
      toast.error('Select an NGO')
      return
    }
    setAssigning(true)
    try {
      await assignNgoAdminToNgo(selectedAdmin, selectedNgo)
      toast.success('NGO admin assigned')
      setSelectedAdmin('')
      setSelectedNgo('')
      await load()
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data || err.message
      if (!handleAuthError(err)) toast.error(serverMessage || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  const adminOptions = admins.filter(a => a?.id !== undefined && a?.id !== null && String(a.id) !== '')
  const ngoOptions = ngos.filter(n => n?.id !== undefined && n?.id !== null && String(n.id) !== '')

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img src={PAGE_BACKGROUNDS.adminNgos} alt="ngo management" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="hero-card rounded-2xl p-5 max-w-2xl">
            <p className="text-xs text-emerald-200 uppercase tracking-wider mb-2">NGO Directory</p>
            <h2 className="font-display text-2xl text-white font-bold">Add NGOs and assign NGO admins</h2>
            <p className="text-sm text-slate-200 mt-2">Manage verified partners and keep admin responsibilities clear.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiPlus className="text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Add NGO</h3>
          </div>
          <div className="space-y-3">
            <input
              value={ngoForm.name}
              onChange={(e) => setNgoForm(f => ({ ...f, name: e.target.value }))}
              placeholder="NGO name"
              className="input-field"
            />
            <input
              value={ngoForm.address}
              onChange={(e) => setNgoForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Address"
              className="input-field"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={ngoForm.location}
                onChange={(e) => setNgoForm(f => ({ ...f, location: e.target.value }))}
                placeholder="City / Region"
                className="input-field"
              />
              <input
                value={ngoForm.contactPhone}
                onChange={(e) => setNgoForm(f => ({ ...f, contactPhone: e.target.value }))}
                placeholder="Contact phone"
                className="input-field"
              />
            </div>
            <input
              value={ngoForm.contactEmail}
              onChange={(e) => setNgoForm(f => ({ ...f, contactEmail: e.target.value }))}
              placeholder="Contact email"
              className="input-field"
            />
            <textarea
              rows={4}
              value={ngoForm.description}
              onChange={(e) => setNgoForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description"
              className="input-field resize-none"
            />
            <button
              onClick={handleCreateNgo}
              disabled={savingNgo}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {savingNgo ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiHome className="text-sm" />
                  Create NGO
                </>
              )}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiHome className="text-emerald-300" />
              <h3 className="text-lg font-semibold text-white">Existing NGOs</h3>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : ngos.length === 0 ? (
            <div className="text-sm text-slate-400">No NGOs added yet.</div>
          ) : (
            <div className="space-y-3">
              {ngos.map((ngo, i) => (
                <motion.div
                  key={ngo.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{ngo.name}</p>
                      <p className="text-xs text-slate-400">{ngo.address || ngo.location || 'Address pending'}</p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {ngo.contactEmail && (
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <FiMail className="text-emerald-300 flex-shrink-0" />
                        <span className="truncate">{ngo.contactEmail}</span>
                      </div>
                    )}
                    {ngo.contactPhone && (
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <FiPhone className="text-teal-300 flex-shrink-0" />
                        <span>{ngo.contactPhone}</span>
                      </div>
                    )}
                    {ngo.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <FiMapPin className="text-amber-300 flex-shrink-0" />
                        <span>{ngo.location}</span>
                      </div>
                    )}
                  </div>
                  {ngo.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{ngo.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiUserPlus className="text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Add NGO Admin</h3>
          </div>
          <div className="space-y-3">
            <input
              value={adminForm.name}
              onChange={(e) => setAdminForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
              className="input-field"
            />
            <input
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              className="input-field"
            />
            <input
              value={adminForm.phone}
              onChange={(e) => setAdminForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone"
              className="input-field"
            />
            <input
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Temporary password"
              className="input-field"
            />
            <select
              value={adminForm.ngoId}
              onChange={(e) => setAdminForm(f => ({ ...f, ngoId: e.target.value }))}
              className="input-field"
            >
              <option value="">Assign NGO</option>
              {ngoOptions.map((ngo, i) => (
                <option key={ngo.id || ngo.name || i} value={ngo.id}>
                  {ngo.name}{ngo.location ? ` • ${ngo.location}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400">
              Each NGO can have only one admin. Choose the NGO while creating the admin.
            </p>
            <button
              onClick={handleCreateAdmin}
              disabled={savingAdmin}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {savingAdmin ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiUsers className="text-sm" />
                  Create NGO Admin
                </>
              )}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiUserCheck className="text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Assign NGO Admin</h3>
          </div>
          <div className="space-y-3">
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="input-field"
            >
              <option value="">Select admin</option>
              {adminOptions.map((admin, i) => (
                <option key={admin.id || admin.email || i} value={admin.id}>
                  {admin.email || admin.name || 'Admin'}
                </option>
              ))}
            </select>
            <select
              value={selectedNgo}
              onChange={(e) => setSelectedNgo(e.target.value)}
              className="input-field"
            >
              <option value="">Select NGO</option>
              {ngoOptions.map((ngo, i) => (
                <option key={ngo.id || ngo.name || i} value={ngo.id}>
                  {ngo.name}{ngo.location ? ` • ${ngo.location}` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={assigning || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {assigning ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiUserCheck className="text-sm" />
                  Assign Admin
                </>
              )}
            </button>
            <p className="text-xs text-slate-400">
              Reassigning an admin will update their NGO scope immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiUsers className="text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">NGO Admin Directory</h3>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : admins.length === 0 ? (
          <div className="text-sm text-slate-400">No NGO admins available.</div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin, i) => {
              const isAssigned = Boolean(admin.ngoId)
              return (
                <motion.div
                  key={admin.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-sm">
                      {admin.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
                      <p className="text-xs text-slate-400 truncate">{admin.email || 'Email not provided'}</p>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full border ${
                        isAssigned
                          ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-200 border-amber-500/30'
                      }`}
                    >
                      {isAssigned ? 'ASSIGNED' : 'UNASSIGNED'}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <FiMail className="text-emerald-300 flex-shrink-0" />
                      <span className="truncate">{admin.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="text-teal-300 flex-shrink-0" />
                      <span>{admin.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <FiMapPin className="text-amber-300 flex-shrink-0" />
                      <span>{admin.ngoName || 'Not assigned to an NGO yet'}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
