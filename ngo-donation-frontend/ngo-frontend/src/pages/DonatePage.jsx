import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import emailjs from '@emailjs/browser'
import { FiDollarSign, FiPackage, FiShoppingBag, FiShoppingCart, FiCheck, FiCalendar, FiMapPin } from 'react-icons/fi'
import { donateMoney, donateGoods, getAllCampaigns, getAllNgos } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageNav from '../components/PageNav'
import { PAGE_BACKGROUNDS } from '../constants/imagery'
import moneyImg from '../assets/ngo/42.jpg'
import clothesImg from '../assets/ngo/23.jpg'
import foodImg from '../assets/ngo/25.jpg'
import groceryImg from '../assets/ngo/24.jpg'

const TYPES = [
  { key:'MONEY',   icon: FiDollarSign,  label:'Money',   color:'from-amber-500 to-yellow-500',  desc:'Instant, secure bank transfer', image: moneyImg },
  { key:'CLOTHES', icon: FiShoppingBag, label:'Clothes', color:'from-purple-500 to-indigo-500', desc:'Jackets, sweaters, blankets', image: clothesImg },
  { key:'FOOD',    icon: FiPackage,     label:'Food',    color:'from-rose-500 to-pink-500',      desc:'Rice, dal, oil, grains', image: foodImg },
  { key:'GROCERY', icon: FiShoppingCart, label:'Grocery', color:'from-sky-500 to-cyan-500',       desc:'Daily essentials & staples', image: groceryImg },
]

const AMOUNTS = [100, 250, 500, 1000, 2500, 5000]
const TIME_SLOTS = [
  '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30',
  '19:00'
].map((value) => {
  const [h, m] = value.split(':').map(Number)
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h >= 12 ? 'PM' : 'AM'
  return { value, label: `${hour12}:${m.toString().padStart(2, '0')} ${suffix}` }
})

// EmailJS config (set these in a local .env file)
const EJS_SERVICE  = import.meta.env.VITE_EJS_SERVICE_ID
const EJS_TEMPLATE = import.meta.env.VITE_EJS_TEMPLATE_ID
const EJS_DONATION_TEMPLATE = import.meta.env.VITE_EJS_DONATION_TEMPLATE_ID || EJS_TEMPLATE
const EJS_ADMIN_TEMPLATE = import.meta.env.VITE_EJS_ADMIN_TEMPLATE_ID || EJS_DONATION_TEMPLATE
const EJS_KEY      = import.meta.env.VITE_EJS_PUBLIC_KEY
const DEFAULT_THANKS_EMAIL = import.meta.env.VITE_DONATION_TEST_EMAIL || 'mokitha8166@gmail.com'
const DEFAULT_SENDER_NAME = import.meta.env.VITE_DONATION_SENDER_NAME || 'NGO Hub'
const ADMIN_NOTIFICATION_EMAIL = 'tejuconnect3241@gmail.com'
const ENABLE_ADMIN_EMAILJS = import.meta.env.VITE_ENABLE_ADMIN_EMAILJS === 'true'
const PLACEHOLDER_VALUES = new Set([
  'your_service_id',
  'your_template_id',
  'your_public_key',
  'template_XXXXXXX',
  'service_XXXXXXX',
  'XXXXXXXXXXXXXXX'
])
const isEmailConfigured =
  Boolean(EJS_SERVICE && EJS_DONATION_TEMPLATE && EJS_KEY) &&
  !PLACEHOLDER_VALUES.has(EJS_SERVICE) &&
  !PLACEHOLDER_VALUES.has(EJS_DONATION_TEMPLATE) &&
  !PLACEHOLDER_VALUES.has(EJS_KEY)

const resolveDonorId = (user) => {
  const candidates = [
    user?.donorId,
    user?.donor_id,
    user?.userId,
    user?.id,
  ]
  const found = candidates.find(v =>
    v !== undefined && v !== null && String(v).trim() !== ''
  )
  if (found === undefined) return null
  const num = Number(found)
  return Number.isFinite(num) ? num : found
}

const resolveDonorEmail = (user, responseData) => (
  user?.email ||
  responseData?.donorEmail ||
  responseData?.email ||
  responseData?.user?.email ||
  DEFAULT_THANKS_EMAIL
)

const resolveDonorName = (user, responseData) => (
  user?.name ||
  user?.fullName ||
  responseData?.donorName ||
  responseData?.name ||
  responseData?.user?.name ||
  'Donor'
)

const toMaybeNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : value
}

const formatCurrency = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return `₹${amount.toLocaleString('en-IN')}`
}

const normalizePickupTime = (value) => {
  if (!value) return { iso: null, sql: null }
  let v = String(value)
  if (v.length === 16) v = `${v}:00`
  const iso = v.includes('T') ? v : v.replace(' ', 'T')
  const sql = v.includes('T') ? v.replace('T', ' ') : v
  return { iso, sql }
}

const parseItemInfo = (text) => {
  const raw = String(text || '').trim()
  if (!raw) return { quantity: 1, itemName: '' }
  const match = raw.match(/^(\d+)\s+(.+)$/)
  if (!match) return { quantity: 1, itemName: raw }
  const quantity = Number(match[1])
  const itemName = match[2]?.trim()
  if (!Number.isFinite(quantity) || !itemName) return { quantity: 1, itemName: raw }
  return { quantity, itemName }
}

const normalizeCampaignStatus = (status) => {
  if (status === true || status === 1 || status === '1') return 'ACTIVE'
  if (status === false || status === 0 || status === '0') return 'PENDING'
  const s = String(status || '').toUpperCase().trim()
  if (!s) return 'PENDING'
  if (s.includes('ACTIVE') || s.includes('APPROV')) return 'ACTIVE'
  if (s.includes('REJECT')) return 'REJECTED'
  if (s.includes('COMPLETE') || s.includes('DONE')) return 'COMPLETED'
  if (s.includes('PEND') || s.includes('WAIT')) return 'PENDING'
  return s
}

const normalizeCampaignType = (type) => {
  const t = String(type || '').toUpperCase().trim()
  if (!t) return ''
  if (t.includes('MONEY') || t.includes('CASH')) return 'MONEY'
  if (t.includes('CLOTH')) return 'CLOTHES'
  if (t.includes('FOOD')) return 'FOOD'
  if (t.includes('GROC')) return 'GROCERY'
  return t
}

const normalizeCampaign = (c) => ({
  ...c,
  id: c?.id ?? c?.campaignId ?? c?.campaign_id ?? c?._id,
  title: c?.title ?? c?.name ?? c?.campaignTitle ?? c?.campaign_name,
  donationType: normalizeCampaignType(c?.donationType ?? c?.type ?? c?.category),
  status: normalizeCampaignStatus(c?.status ?? c?.campaignStatus ?? c?.approvalStatus),
  ngoId: c?.ngoId ?? c?.ngo_id ?? c?.ngo?.id ?? c?.ngo?.ngoId,
  ngoName: c?.ngoName ?? c?.ngo?.name ?? c?.ngo?.title ?? c?.ngo?.ngoName,
})

const normalizeNgo = (n) => ({
  ...n,
  id: n?.id ?? n?.ngoId ?? n?.ngo_id ?? n?._id,
  name: n?.name ?? n?.ngoName ?? n?.title ?? n?.ngo_name,
  address: n?.address ?? n?.location ?? n?.ngoAddress,
})

const formatReceiptDate = (value) => {
  if (!value) return new Date().toLocaleString('en-IN')
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return new Date().toLocaleString('en-IN')
  return dt.toLocaleString('en-IN')
}

const buildThanksMessage = ({
  donorName,
  donorEmail,
  donationType,
  amount,
  items,
  campaignTitle,
  ngoName,
  status,
  donationId,
  createdAt,
}) => {
  const lines = [
    'NGO Hub — Donation Receipt',
    '',
    `Receipt No: ${donationId || 'N/A'}`,
    `Date: ${formatReceiptDate(createdAt)}`,
    '',
    `Donor Name: ${donorName || 'Donor'}`,
    `Donor Email: ${donorEmail || 'N/A'}`,
  ]
  if (campaignTitle) lines.push(`Campaign: ${campaignTitle}`)
  if (ngoName) lines.push(`NGO: ${ngoName}`)
  if (donationType) lines.push(`Type: ${donationType}`)
  if (amount) lines.push(`Amount: ${amount}`)
  if (items) lines.push(`Items: ${items}`)
  if (status) lines.push(`Status: ${status}`)
  lines.push('', 'Thank you for supporting our mission. This receipt confirms your donation.')
  return lines.join('\n')
}

const buildAdminMessage = ({ donorName, donorEmail, donationType, amount, items, campaignTitle, ngoName }) => {
  const lines = [
    'Donation successful ✅',
    '',
    `Donor: ${donorName || 'Donor'}`,
    `Email: ${donorEmail || 'N/A'}`,
  ]
  if (campaignTitle) lines.push(`Campaign: ${campaignTitle}`)
  if (ngoName) lines.push(`NGO: ${ngoName}`)
  if (donationType) lines.push(`Type: ${donationType}`)
  if (amount) lines.push(`Amount: ${amount}`)
  if (items) lines.push(`Items: ${items}`)
  return lines.join('\n')
}

const sendThankYouEmail = async ({
  toEmail,
  donorName,
  donorEmail,
  donationType,
  amount,
  items,
  campaignTitle,
  ngoName,
  status,
  donationId,
  createdAt,
}) => {
  if (!isEmailConfigured || !toEmail) return false
  const subject = campaignTitle
    ? `Donation Receipt - ${campaignTitle}`
    : 'Donation Receipt - NGO Hub'
  const message = buildThanksMessage({
    donorName,
    donorEmail: donorEmail || toEmail,
    donationType,
    amount,
    items,
    campaignTitle,
    ngoName,
    status,
    donationId,
    createdAt,
  })
  const params = {
    to_email: toEmail,
    to_name: donorName || 'Donor',
    subject,
    message,
    from_name: DEFAULT_SENDER_NAME,
    from_email: DEFAULT_THANKS_EMAIL,
    reply_to: DEFAULT_THANKS_EMAIL,
    donor_name: donorName || 'Donor',
    donor_email: toEmail,
    name: donorName || 'Donor',
    email: toEmail,
    user_name: donorName || 'Donor',
    user_email: toEmail,
    campaign_title: campaignTitle || '',
    donation_type: donationType || '',
    amount: amount || '',
    items: items || '',
  }
  await emailjs.send(
    EJS_SERVICE,
    EJS_DONATION_TEMPLATE,
    params,
    EJS_KEY
  )
  return true
}

const sendAdminNotificationEmail = async ({
  donorEmail,
  donorName,
  donationType,
  amount,
  items,
  campaignTitle,
  ngoName,
}) => {
  if (!isEmailConfigured || !ADMIN_NOTIFICATION_EMAIL) return false
  const subject = campaignTitle
    ? `Donation successful - ${campaignTitle}`
    : 'Donation successful'
  const message = buildAdminMessage({
    donorName,
    donorEmail,
    donationType,
    amount,
    items,
    campaignTitle,
    ngoName,
  })
  const params = {
    to_email: ADMIN_NOTIFICATION_EMAIL,
    to_name: 'Admin',
    subject,
    message,
    from_name: DEFAULT_SENDER_NAME,
    from_email: DEFAULT_THANKS_EMAIL,
    reply_to: DEFAULT_THANKS_EMAIL,
    donor_name: donorName || 'Donor',
    donor_email: donorEmail || '',
    campaign_title: campaignTitle || '',
    donation_type: donationType || '',
    amount: amount || '',
    items: items || '',
    ngo_name: ngoName || '',
  }
  await emailjs.send(
    EJS_SERVICE,
    EJS_ADMIN_TEMPLATE,
    params,
    EJS_KEY
  )
  return true
}


export default function DonatePage() {
  const { user } = useAuth()
  const [step, setStep]           = useState(1)
  const [donationType, setType]   = useState('MONEY')
  const [campaigns, setCampaigns] = useState([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [ngos, setNgos] = useState([])
  const [loadingNgos, setLoadingNgos] = useState(true)
  const [form, setForm]           = useState({
    campaignId:'', ngoId:'', amount:'', itemDescription:'',
    pickupAddress:'', pickupDate:'', pickupDateIso:'', pickupSlot:'', pickupTime:''
  })
  const [loading, setLoading]     = useState(false)
  const [donated, setDonated]     = useState(null)

  useEffect(() => {
    setLoadingCampaigns(true)
    getAllCampaigns()
      .then(r => {
        const payload = Array.isArray(r?.data?.data)
          ? r.data.data
          : Array.isArray(r?.data)
            ? r.data
            : []
        const normalized = payload.map(normalizeCampaign).filter(c => c?.id)
        setCampaigns(normalized)
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoadingCampaigns(false))
  }, [])

  useEffect(() => {
    setLoadingNgos(true)
    getAllNgos()
      .then(r => {
        const payload = Array.isArray(r?.data?.data)
          ? r.data.data
          : Array.isArray(r?.data)
            ? r.data
            : []
        const normalized = payload.map(normalizeNgo).filter(n => n?.id && n?.name)
        setNgos(normalized)
      })
      .catch(() => setNgos([]))
      .finally(() => setLoadingNgos(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setCampaign = (campaignId) => {
    const selected = campaigns.find(c => String(c.id) === String(campaignId))
    setForm(f => ({
      ...f,
      campaignId,
      ngoId: selected?.ngoId ?? f.ngoId ?? '',
    }))
  }
  const setNgo = (ngoId) => setForm(f => ({ ...f, ngoId }))

  const toIsoDate = (raw) => {
    if (!raw) return ''
    const trimmed = String(raw).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [dd, mm, yyyy] = trimmed.split('-')
      return `${yyyy}-${mm}-${dd}`
    }
    return ''
  }

  const setPickupDate = (v) => setForm(f => {
    const iso = toIsoDate(v)
    return {
      ...f,
      pickupDate: v,
      pickupDateIso: iso,
      pickupTime: iso && f.pickupSlot ? `${iso}T${f.pickupSlot}:00` : ''
    }
  })
  const setPickupSlot = (v) => setForm(f => ({
    ...f,
    pickupSlot: v,
    pickupTime: f.pickupDateIso && v ? `${f.pickupDateIso}T${v}:00` : ''
  }))

  const selectedCampaign = campaigns.find(c => String(c.id) === String(form.campaignId)) || null
  const selectedNgo = ngos.find(n => String(n.id) === String(form.ngoId)) || null
  const filteredCampaigns = campaigns.filter(c => {
    const matchesType = donationType ? c.donationType === donationType : true
    return matchesType && c.status === 'ACTIVE'
  })

  const queueEmailNotifications = ({
    responseData,
    amountLabel,
    itemsLabel,
    donationId,
    ngoName,
  }) => {
    const donorEmail = resolveDonorEmail(user, responseData)
    const donorName = resolveDonorName(user, responseData)
    const campaignTitle = responseData?.campaignTitle || selectedCampaign?.title
    const status = responseData?.status
    const run = async () => {
      try {
        const sent = await sendThankYouEmail({
          toEmail: donorEmail,
          donorName,
          donorEmail,
          donationType,
          amount: amountLabel,
          items: itemsLabel,
          campaignTitle,
          ngoName,
          status,
          donationId,
          createdAt: responseData?.createdAt,
        })
        if (sent) toast.success('Thank-you email sent! 📧')

        if (ENABLE_ADMIN_EMAILJS) {
          await sendAdminNotificationEmail({
            donorEmail,
            donorName,
            donationType,
            amount: amountLabel,
            items: itemsLabel,
            campaignTitle,
            ngoName,
          })
        }
      } catch (emailErr) {
        console.error('Thank-you email error:', emailErr)
        const errText = emailErr?.text || emailErr?.message || emailErr?.status
        toast.error(`Could not send thank-you email${errText ? `: ${errText}` : ''}`)
      }
    }
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(() => void run())
    } else {
      setTimeout(() => void run(), 0)
    }
  }

  const handleDonate = async () => {
    const requiresCampaign = donationType === 'GROCERY'
    if (requiresCampaign && !form.campaignId) {
      toast.error('Grocery donations must be tied to a campaign')
      return
    }
    if (!form.campaignId && !form.ngoId) {
      toast.error('Please select a campaign or an NGO')
      return
    }
    if (donationType === 'MONEY' && !form.amount)          { toast.error('Enter donation amount'); return }
    if (donationType !== 'MONEY' && !form.itemDescription) { toast.error('Describe your items'); return }
    if (donationType !== 'MONEY') {
      if (!form.pickupAddress || !form.pickupTime) {
        toast.error('Address and time are required for goods donations')
        return
      }
    }
    const donorId = resolveDonorId(user)
    if (!donorId) {
      toast.error('Please login again to continue your donation')
      return
    }
    setLoading(true)
    try {
      const resolvedNgoId = form.campaignId
        ? selectedCampaign?.ngoId
        : form.ngoId
      const payload = {
        donorId,
        donor_id: donorId,
        userId: donorId,
        donationType,
        itemType: donationType,
      }
      if (resolvedNgoId) {
        payload.ngoId = toMaybeNumber(resolvedNgoId)
      }
      if (form.campaignId) {
        payload.campaignId = toMaybeNumber(form.campaignId)
        payload.campaign_id = toMaybeNumber(form.campaignId)
        payload.campaignTitle = selectedCampaign?.title
        payload.campaignName = selectedCampaign?.title
      }
      let res
      if (donationType === 'MONEY') {
        res = await donateMoney({ ...payload, amount: Number(form.amount) })
      } else {
        const resolvedPickupTime =
          (form.pickupDateIso && form.pickupSlot)
            ? `${form.pickupDateIso}T${form.pickupSlot}:00`
            : form.pickupTime
        const { iso, sql } = normalizePickupTime(resolvedPickupTime)
        const itemInfo = parseItemInfo(form.itemDescription)
        const itemName = itemInfo.itemName || form.itemDescription
        const quantity = Number.isFinite(itemInfo.quantity) && itemInfo.quantity > 0
          ? itemInfo.quantity
          : 1
        const goodsPayload = {
          ...payload,
          amount: 0,
          itemDescription: form.itemDescription,
          items: form.itemDescription,
          description: form.itemDescription,
          itemName,
          item_name: itemName,
          quantity,
          qty: quantity,
          type: donationType,
          category: donationType,
          pickupAddress: form.pickupAddress,
          pickup_address: form.pickupAddress,
          address: form.pickupAddress,
          location: form.pickupAddress,
        }
        if (iso || resolvedPickupTime) {
          goodsPayload.pickupTime = iso || resolvedPickupTime
          goodsPayload.pickup_time = sql || resolvedPickupTime
          goodsPayload.scheduledAt = iso || resolvedPickupTime
          goodsPayload.scheduleTime = iso || resolvedPickupTime
          goodsPayload.pickupDate = iso || resolvedPickupTime
        }
        res = await donateGoods(goodsPayload)
      }
      const responseData = res?.data?.data ?? res?.data ?? {}
      setDonated({
        ...responseData,
        donationType: responseData?.donationType || donationType,
        campaignTitle: responseData?.campaignTitle || selectedCampaign?.title,
        ngoName: responseData?.ngoName || selectedCampaign?.ngoName || selectedNgo?.name,
      })
      setStep(3)
      toast.success('Donation submitted! 🎉')
      if (responseData?.adminEmailSent) {
        toast.success('Admin notification email sent!')
      }
      const amountLabel = formatCurrency(responseData?.amount ?? form.amount)
      const itemsLabel = responseData?.itemDescription || form.itemDescription
      const donationId = responseData?.id || responseData?.donationId
      const ngoName = responseData?.ngoName || selectedCampaign?.ngoName || selectedNgo?.name
      queueEmailNotifications({
        responseData,
        amountLabel,
        itemsLabel,
        donationId,
        ngoName,
      })
    } catch (err) {
      console.error('Donation error:', err.response?.data || err)
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message
      toast.error(serverMessage || 'Donation failed. Please try again.')
    } finally { setLoading(false) }
  }

  // Step 3 - Success screen
  if (step === 3 && donated) return (
    <div className="page-section max-w-lg mx-auto flex items-center justify-center min-h-[70vh]">
      <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} className="glass rounded-3xl p-10 text-center w-full">
        <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:0.6 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/40">
          <FiCheck className="text-white text-3xl" />
        </motion.div>
        <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">Thank You! ❤️</h2>
        <p className="text-slate-600 mb-6">Your donation has been received and will make a real difference.</p>
        <div className="glass rounded-2xl p-4 text-left space-y-2 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Donation Summary</p>
          {donated.campaignTitle && (
            <p className="text-sm text-slate-900">
              <span className="text-slate-600">Campaign: </span>{donated.campaignTitle}
            </p>
          )}
          <p className="text-sm text-slate-900"><span className="text-slate-600">Type: </span>{donated.donationType}</p>
          {donated.amount && <p className="text-sm text-amber-400 font-semibold">₹{Number(donated.amount).toLocaleString()}</p>}
          {donated.itemDescription && <p className="text-sm text-slate-700 italic">"{donated.itemDescription}"</p>}
          <p className="text-xs text-emerald-700">Status: {donated.status}</p>
        </div>
        <button onClick={() => {
          setStep(1)
          setDonated(null)
          setForm({ campaignId:'', ngoId:'', amount:'', itemDescription:'', pickupAddress:'', pickupDate:'', pickupDateIso:'', pickupSlot:'', pickupTime:'' })
        }} className="btn-primary w-full">
          Donate Again
        </button>
      </motion.div>
    </div>
  )

  const hasCampaigns = filteredCampaigns.length > 0
  const hasNgos = ngos.length > 0
  const requiresCampaignForType = donationType === 'GROCERY'
  const isCampaignDonation = Boolean(form.campaignId)
  const canDonate =
    !loadingCampaigns &&
    !loadingNgos &&
    (hasCampaigns || (!requiresCampaignForType && hasNgos))

  return (
    <div className="page-section max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden mb-10 h-52">
        <img src={PAGE_BACKGROUNDS.donate} alt="donate" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="max-w-2xl bg-white/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-white/60">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Make a <span className="gradient-text">Donation</span></h1>
              <p className="text-slate-700 text-sm">
                Every contribution changes a life. We connect your donation to verified NGO needs quickly and transparently.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10">
        {[1,2].map(s => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= s ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'glass text-slate-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step > s ? 'bg-emerald-500 text-white' : step === s ? 'border-2 border-emerald-400 text-emerald-400' : 'border border-slate-600 text-slate-600'}`}>
                {step > s ? <FiCheck /> : s}
              </div>
              {s === 1 ? 'Choose Type' : 'Fill Details'}
            </div>
            {s < 2 && <div className={`h-px w-8 ${step > s ? 'bg-emerald-500' : 'bg-emerald-900/60'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}>
            <div className="text-center mb-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/80">Step 1 of 2</p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100 mt-2">
                Choose Your Impact Lane
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2">
                Pick a donation type and we’ll guide you through the details.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {TYPES.map(t => {
                const isSelected = donationType === t.key
                return (
                  <motion.button key={t.key} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => {
                      setType(t.key)
                      setStep(2)
                      setForm(f => ({ ...f, campaignId:'', ngoId:'' }))
                    }}
                    className={`group relative text-left rounded-3xl p-[1.5px] transition-all h-full
                      ${isSelected ? 'shadow-2xl shadow-emerald-500/30' : 'shadow-lg shadow-slate-950/40 hover:shadow-xl hover:shadow-slate-950/50'}`}
                  >
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${t.color} ${isSelected ? 'opacity-80' : 'opacity-40'} transition-opacity`} />
                    <div className="relative rounded-[calc(1.5rem-1px)] overflow-hidden min-h-[180px] sm:min-h-[210px]">
                      <img
                        src={t.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/10" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent" />
                      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg`}>
                            <t.icon className="text-white text-xl" />
                          </div>
                          {isSelected && (
                            <span className="text-[10px] uppercase tracking-widest text-emerald-100 bg-emerald-500/30 border border-emerald-300/40 px-2.5 py-1 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1">{t.label}</h3>
                          <p className="text-slate-200 text-sm leading-relaxed">{t.desc}</p>
                          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-200/80">
                            <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-slate-300/70'}`} />
                            {isSelected ? 'Continue to details' : 'Tap to choose'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
            <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                {(() => { const t = TYPES.find(x => x.key === donationType); return (
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                    <t.icon className="text-white" />
                  </div>
                )})()}
                <div>
                  <h3 className="font-semibold text-slate-900">Donate {TYPES.find(t => t.key === donationType)?.label}</h3>
                  <p className="text-xs text-slate-600">Fill in the details below</p>
                </div>
                <button onClick={() => setStep(1)} className="ml-auto text-xs text-slate-500 hover:text-slate-300 underline">Change type</button>
              </div>

              {/* Campaign or NGO selection */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Select Campaign</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${!form.campaignId ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/30'}`}>
                      <input
                        type="radio"
                        name="campaign"
                        value=""
                        checked={!form.campaignId}
                        onChange={() => setCampaign('')}
                        className="mt-1 accent-emerald-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">No campaign selected</p>
                        <p className="text-xs text-slate-600">Donate directly to an NGO instead.</p>
                      </div>
                    </label>
                    {filteredCampaigns.map(c => (
                      <label
                        key={c.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${String(form.campaignId) === String(c.id) ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 hover:border-white/30'}`}
                      >
                        <input
                          type="radio"
                          name="campaign"
                          value={c.id}
                          checked={String(form.campaignId) === String(c.id)}
                          onChange={e => setCampaign(e.target.value)}
                          className="mt-1 accent-emerald-500"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                          <p className="text-xs text-slate-600">{c.ngoName ? `${c.ngoName} · ` : ''}{c.donationType}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {loadingCampaigns && (
                    <p className="text-xs text-slate-500 mt-2">Loading campaigns...</p>
                  )}
                  {!loadingCampaigns && !hasCampaigns && (
                    <p className="text-xs text-amber-400 mt-2">
                      ⚠️ No active {donationType.toLowerCase()} campaigns right now.
                      {requiresCampaignForType ? ' Grocery donations need a campaign.' : ' You can still donate directly to an NGO.'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Or Select NGO</label>
                  <div className={`space-y-2 max-h-64 overflow-y-auto pr-1 ${form.campaignId ? 'opacity-60 pointer-events-none' : ''}`}>
                    <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${!form.ngoId ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/30'}`}>
                      <input
                        type="radio"
                        name="ngo"
                        value=""
                        checked={!form.ngoId}
                        onChange={() => setNgo('')}
                        className="mt-1 accent-emerald-500"
                        disabled={Boolean(form.campaignId)}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {form.campaignId ? 'NGO auto-assigned by campaign' : 'No NGO selected'}
                        </p>
                        <p className="text-xs text-slate-600">
                          {form.campaignId ? 'Campaign selection decides the NGO.' : 'Pick a trusted NGO below.'}
                        </p>
                      </div>
                    </label>
                    {ngos.map(n => (
                      <label
                        key={n.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${String(form.ngoId) === String(n.id) ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 hover:border-white/30'}`}
                      >
                        <input
                          type="radio"
                          name="ngo"
                          value={n.id}
                          checked={String(form.ngoId) === String(n.id)}
                          onChange={e => setNgo(e.target.value)}
                          className="mt-1 accent-emerald-500"
                          disabled={Boolean(form.campaignId)}
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{n.name}</p>
                          <p className="text-xs text-slate-600">{n.address || 'Verified NGO partner'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {loadingNgos && (
                    <p className="text-xs text-slate-500 mt-2">Loading NGOs...</p>
                  )}
                  {!loadingNgos && !hasNgos && (
                    <p className="text-xs text-amber-400 mt-2">
                      ⚠️ No NGOs available right now. Ask admin to add NGOs.
                    </p>
                  )}
                  {form.campaignId && selectedCampaign?.ngoName && (
                    <p className="text-xs text-emerald-700 mt-2">Campaign NGO: {selectedCampaign.ngoName}</p>
                  )}
                </div>
              </div>

              {donationType === 'MONEY' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Amount (₹) *</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {AMOUNTS.map(a => (
                      <button key={a} type="button" onClick={() => set('amount', String(a))}
                        className={`py-2 rounded-xl text-sm font-medium border transition-all ${form.amount === String(a) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700' : 'border-black/10 text-slate-700 hover:border-black/20 hover:text-slate-900'}`}>
                        ₹{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                    <input type="number" placeholder="Or enter custom amount" value={form.amount} onChange={e => set('amount', e.target.value)} className="input-field pl-8" />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Item Description *</label>
                    <textarea
                      placeholder={donationType === 'CLOTHES'
                        ? 'e.g. 10 winter jackets, 5 sweaters, good condition'
                        : donationType === 'GROCERY'
                          ? 'e.g. 10 kg rice, 5 kg sugar, soaps, toothpaste'
                          : 'e.g. 20 kg rice, 10 kg dal, 5 litres oil – packed'}
                      value={form.itemDescription} onChange={e => set('itemDescription', e.target.value)}
                      rows={3} className="input-field resize-none" />
                  </div>
                  <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                    <p className="text-teal-400 text-xs font-medium mb-3">
                      {isCampaignDonation ? '📦 Schedule Pickup (Required)' : '📍 Donor Address & Time (Required)'}
                    </p>
                    <div className="space-y-3">
                      <div className="relative">
                        <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                        <input type="text" placeholder={isCampaignDonation ? 'Pickup address' : 'Donor address'} value={form.pickupAddress} onChange={e => set('pickupAddress', e.target.value)} className="input-field pl-10" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                          <input
                            type="date"
                            value={form.pickupDateIso}
                            onChange={e => setPickupDate(e.target.value)}
                            className="input-field pl-10"
                          />
                        </div>
                        <div className="relative">
                          <select
                            value={form.pickupSlot}
                            onChange={e => setPickupSlot(e.target.value)}
                            className="input-field"
                          >
                            <option value="">Select time</option>
                            {TIME_SLOTS.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleDonate} disabled={loading || !canDonate}
                  className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '❤️ Submit Donation'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <PageNav current="/donate" />
    </div>
  )
}
