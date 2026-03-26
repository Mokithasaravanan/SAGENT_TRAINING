import emailjs from '@emailjs/browser'

const EJS_SERVICE  = import.meta.env.VITE_EJS_SERVICE_ID
const EJS_TEMPLATE = import.meta.env.VITE_EJS_TEMPLATE_ID
const EJS_KEY      = import.meta.env.VITE_EJS_PUBLIC_KEY
const DEFAULT_SENDER_NAME = import.meta.env.VITE_DONATION_SENDER_NAME || 'NGO Hub'
const DEFAULT_THANKS_EMAIL = import.meta.env.VITE_DONATION_TEST_EMAIL || 'mokitha8166@gmail.com'
const ADMIN_NOTIFICATION_EMAIL = 'tejuconnect3241@gmail.com'

const PLACEHOLDER_VALUES = new Set([
  'your_service_id',
  'your_template_id',
  'your_public_key',
  'template_XXXXXXX',
  'service_XXXXXXX',
  'XXXXXXXXXXXXXXX',
])

const isEmailConfigured =
  Boolean(EJS_SERVICE && EJS_TEMPLATE && EJS_KEY && ADMIN_NOTIFICATION_EMAIL) &&
  !PLACEHOLDER_VALUES.has(EJS_SERVICE) &&
  !PLACEHOLDER_VALUES.has(EJS_TEMPLATE) &&
  !PLACEHOLDER_VALUES.has(EJS_KEY)

export async function sendVolunteerCompletionNotification({
  volunteerName,
  taskId,
  status,
  pickupAddress,
  pickupTime,
  donorName,
  campaignTitle,
}) {
  if (!isEmailConfigured) return false
  const subject = `Volunteer Task ${taskId} Completed`
  const messageLines = [
    'Volunteer task completed ✅',
    '',
    `Volunteer: ${volunteerName || 'Volunteer'}`,
    `Task ID: ${taskId}`,
    `Status: ${status}`,
  ]
  if (donorName) messageLines.push(`Donor: ${donorName}`)
  if (campaignTitle) messageLines.push(`Campaign: ${campaignTitle}`)
  if (pickupAddress) messageLines.push(`Address: ${pickupAddress}`)
  if (pickupTime) {
    const time = new Date(pickupTime).toLocaleString('en-IN')
    messageLines.push(`Scheduled pickup: ${time}`)
  }
  const params = {
    to_email: ADMIN_NOTIFICATION_EMAIL,
    to_name: 'Admin',
    subject,
    message: messageLines.join('\n'),
    from_name: volunteerName || DEFAULT_SENDER_NAME,
    from_email: DEFAULT_THANKS_EMAIL,
    reply_to: DEFAULT_THANKS_EMAIL,
  }
  await emailjs.send(EJS_SERVICE, EJS_TEMPLATE, params, EJS_KEY)
  return true
}
