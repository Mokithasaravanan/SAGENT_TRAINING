import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import emailjs from '@emailjs/browser'
import {
  FiMail, FiUser, FiMessageSquare,
  FiPhone, FiMapPin, FiSend,
  FiFacebook, FiTwitter, FiInstagram
} from 'react-icons/fi'
import PageNav from '../components/PageNav'
import { CARD_IMAGES, PAGE_BACKGROUNDS } from '../constants/imagery'

// EmailJS config (set these in a local .env file)
const EJS_SERVICE  = import.meta.env.VITE_EJS_SERVICE_ID
const EJS_TEMPLATE = import.meta.env.VITE_EJS_TEMPLATE_ID
const EJS_KEY      = import.meta.env.VITE_EJS_PUBLIC_KEY
const PLACEHOLDER_VALUES = new Set([
  'your_service_id',
  'your_template_id',
  'your_public_key',
  'template_XXXXXXX',
  'service_XXXXXXX',
  'XXXXXXXXXXXXXXX'
])
const isEmailConfigured =
  Boolean(EJS_SERVICE && EJS_TEMPLATE && EJS_KEY) &&
  !PLACEHOLDER_VALUES.has(EJS_SERVICE) &&
  !PLACEHOLDER_VALUES.has(EJS_TEMPLATE) &&
  !PLACEHOLDER_VALUES.has(EJS_KEY)

export default function ContactPage() {
  const formRef = useRef()
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: ''
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim())    { toast.error('Please enter your name'); return }
    if (!form.email.trim())   { toast.error('Please enter your email'); return }
    if (!form.message.trim()) { toast.error('Please enter a message'); return }

    setSending(true)

    if (!isEmailConfigured) {
      // Demo mode for sample keys — simulate success without sending
      setTimeout(() => {
        toast.success('Demo mode: message saved (not sent).')
        setSent(true)
        setForm({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSent(false), 4000)
        setSending(false)
      }, 600)
      return
    }

    try {
      await emailjs.send(
        EJS_SERVICE,
        EJS_TEMPLATE,
        {
          from_name:  form.name,
          from_email: form.email,
          subject:    form.subject || 'No Subject',
          message:    form.message,
          to_email:   'mokitha8166@gmail.com',
        },
        EJS_KEY
      )

      toast.success('Message sent successfully! 📨 Check your inbox!')
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSent(false), 5000)

    } catch (error) {
      console.error('EmailJS Error:', error)
      toast.error('Failed to send. Please check EmailJS configuration.')
    } finally {
      setSending(false)
    }
  }

  const contacts = [
    { icon: FiMail,   label: 'Email',   value: 'mokitha8166@gmail.com',  color: 'text-teal-400' },
    { icon: FiPhone,  label: 'Phone',   value: '+91 90000 00000',         color: 'text-emerald-400' },
    { icon: FiMapPin, label: 'Address', value: 'Chennai, Tamil Nadu',     color: 'text-amber-400' },
  ]

  const socials = [
    { icon: FiFacebook,  color: 'hover:text-blue-400' },
    { icon: FiTwitter,   color: 'hover:text-sky-400' },
    { icon: FiInstagram, color: 'hover:text-rose-400' },
  ]

  return (
    <div className="page-section max-w-6xl mx-auto">

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 h-52">
        <img
          src={PAGE_BACKGROUNDS.contact}
          alt="contact"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-slate-300 text-sm">We'd love to hear from you 💚</p>
          </motion.div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* Contact Form — 3 cols */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="glass rounded-2xl p-7">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-6">
              Send us a message 📬
            </h2>

            {/* Success Banner */}
            {sent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 text-sm font-medium"
              >
                ✅ Message sent! Check mokitha8166@gmail.com inbox!
              </motion.div>
            )}


            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

              {/* Name + Email row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                    Your Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                    <input
                      type="text"
                      name="from_name"
                      placeholder="Moki"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                    Your Email *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                    <input
                      type="email"
                      name="from_email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="How can we help you?"
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                  Message *
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-3.5 top-4 text-slate-500 text-sm" />
                  <textarea
                    name="message"
                    placeholder="Write your message here…"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    rows={5}
                    className="input-field pl-10 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={sending}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FiSend />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Contact Info — 2 cols */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          {/* Contact Details */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-5">
              Contact Info
            </h3>
            <div className="space-y-4">
              {contacts.map(c => (
                <div key={c.label} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${c.color}`}>
                    <c.icon className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wider">{c.label}</p>
                    <p className="text-sm text-slate-900">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Follow Us</h3>
            <div className="flex gap-3">
              {socials.map((s, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-600 ${s.color} transition-colors`}
                >
                  <s.icon className="text-sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Map Image */}
          <div className="glass rounded-2xl overflow-hidden">
            <img
              src={CARD_IMAGES.contactStory}
              alt="location"
              className="w-full h-40 object-cover opacity-60"
            />
            <div className="p-4">
              <p className="text-xs text-slate-600 text-center">
                📍 Chennai, Tamil Nadu, India
              </p>
            </div>
          </div>

          {/* EmailJS Status */}
          {isEmailConfigured ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-emerald-700 text-xs font-medium mb-1">
                ✅ Email Integration Active
              </p>
              <p className="text-slate-600 text-xs">
                Messages sent to mokitha8166@gmail.com
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <p className="text-amber-800 text-xs font-medium mb-1">
                ⚠️ Email Integration Demo Mode
              </p>
              <p className="text-slate-600 text-xs">
                Replace the sample values in `.env` to enable real emails.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <PageNav current="/contact" />
    </div>
  )
}
