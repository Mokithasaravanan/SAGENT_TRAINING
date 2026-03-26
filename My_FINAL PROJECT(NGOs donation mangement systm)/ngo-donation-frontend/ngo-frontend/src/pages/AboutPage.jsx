import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShield,
  FiUsers,
  FiAward,
  FiFileText,
  FiTrendingUp,
  FiBell,
  FiMapPin,
  FiMail,
  FiPhone,
  FiHeart,
} from 'react-icons/fi'
import { PAGE_BACKGROUNDS } from '../constants/imagery'

const SECTIONS = [
  {
    key: 'overview',
    label: 'Overview',
    icon: FiShield,
    heading: 'Serving the elder cause for over four decades',
    body: [
      "HelpAge India is a secular, not-for-profit organisation in India, registered under the Societies’ Registration Act of 1860. Set up in 1978, the organisation works for the cause and care of disadvantaged older persons to improve their quality of life.",
      "It runs healthcare, agecare, livelihood, disaster response and awareness initiatives throughout the country and advocates strongly for the elder cause. It became the first and only Indian organization to be honoured with the UN Population Award 2020 for its exemplary work in the field of ageing and population issues.",
    ],
    highlight: "Motto: Fighting isolation, poverty and neglect.",
  },
  {
    key: 'governing',
    label: 'Governing Body',
    icon: FiUsers,
    heading: 'Guiding with experience and purpose',
    body: [
      'Members come from public service, corporate leadership, philanthropy, and social service.',
      'They guide and assist the HelpAge team so elders can live a healthy and dignified life.',
    ],
    list: [
      'Mr. Kiran Karnik — Chairperson',
      'Ms. Rumjhum Chatterjee — Vice Chairperson',
      'Mr. Kaushik Dutta — Hon. Treasurer',
      'Mr. J. C. Luther — Member',
      'Mr. Arun Seth — Member',
      'Ms. Radhika Bharat Ram — Member',
      'Ms. Gita Nayyar — Member',
      'Mr. Sanjeev Kapur — Member',
      'Mr. Amarjeet Sinha — Member',
      'Mr. Tarun Rai — Member',
      'Mr. Rohit Prasad — Chief Executive Officer',
    ],
  },
  {
    key: 'executive',
    label: 'Executive Committee',
    icon: FiTrendingUp,
    heading: 'Senior leadership from the Head Office in New Delhi',
    list: [
      'Mr. Rohit Prasad — Chief Executive Officer',
      'Mr. Prateep Chakraborty — Chief Operating Officer',
      'Mr. Vijay Naugain — Country Head, HR & OD',
      'Dr. Ritu Rana — Mission Head, Healthcare',
      'Ms. Anupama Datta — Head, Policy Research & Advocacy',
      'Mr. Kunal Kishore — Mission Head, Agecare',
      'Mr. Girish Mishra — Mission Head, Livelihoods & Resilience',
      'Ms. Sonali Sharma — Head, Communications',
      'Mr. Kanchan Sen — Country Head, Resource Mobilisation & Marketing',
      'Mr. Gulshan Sharma — Chief Financial Officer',
      'Prof. Anil Krishnan — Director, Institute of Age Care Research',
    ],
  },
  {
    key: 'state',
    label: 'State Leadership',
    icon: FiMapPin,
    heading: 'State offices across India',
    list: [
      'Mr. Alok Kumar Verma — Bihar & Jharkhand',
      'Mr. Anoop Pant — Uttar Pradesh',
      'Ms. Bharati Chakra — Odisha',
      'Mr. Biju Mathew — Kerala',
      'Mr. Chaitanya Upadhyay — Uttarakhand',
      'Dr. Rajesh Kumar — Himachal Pradesh & Ladakh',
      'Mr. Edwin Babu Solomon — Tamil Nadu',
      'Mr. M. Prakashan — Karnataka',
      'Mr. Nileshkumar Nalvaya — Gujarat & Rajasthan',
      'Ms. Sanskriti Khare — Madhya Pradesh',
      'Mr. Subhankar Biswas — Chhattisgarh',
      'Ms. Thokchom Rojibala Devi — Delhi-NCR',
      'Mr. Yetendra Yadav Vonteru — Andhra Pradesh & Telangana',
      'Ms. Priyanjali Chakraborty — West Bengal & North East',
    ],
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: FiFileText,
    heading: 'Explore in-depth resources',
    body: [
      'Annual Reports, Newsletters, Information Brochure, Financials, Audited Accounts, FCRA',
      'Research: R&D Journal, Research Contributions, Research Reports',
    ],
  },
  {
    key: 'awards',
    label: 'Awards',
    icon: FiAward,
    heading: 'Recognised for excellence',
    list: [
      'United Nations Population Award 2020',
      'Vayoshreshtha Samman (National Award for Senior Citizens)',
      'CRISIL VO1A grading for excellence in operations & financial transparency (2022)',
    ],
  },
  {
    key: 'news',
    label: 'Recent News',
    icon: FiBell,
    heading: 'Latest updates and milestones',
    list: [
      'June 17, 2025 — HelpAge India report calls for strengthening intergenerational bonds',
      'April 24, 2025 — Focus on the plight of vulnerable elderly women',
      'October 25, 2024 — #SabKiDiwali campaign launch',
    ],
  },
  {
    key: 'contact',
    label: 'Contact & Support',
    icon: FiHeart,
    heading: 'Stay connected',
    body: [
      'HelpAge India, C–14 Qutab Institutional Area, New Delhi – 110016',
      'Email: helpageindia@sc',
      'UPI / VPA ID: helpageindia@sc',
    ],
  },
]

export default function AboutPage() {
  const [active, setActive] = useState('overview')
  const current = useMemo(
    () => SECTIONS.find(s => s.key === active) || SECTIONS[0],
    [active]
  )

  return (
    <div className="page-section max-w-6xl mx-auto space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-56">
        <img
          src={PAGE_BACKGROUNDS.contact}
          alt="about"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="max-w-2xl bg-white/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-white/60">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700 mb-2">About Us</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                HelpAge India
              </h1>
              <p className="text-slate-700 text-sm">
                A transparent look into our mission, leadership, programmes and recognitions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="glass rounded-3xl p-4 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 px-2">Select Section</p>
          {SECTIONS.map((section) => (
            <label
              key={section.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer ${
                active === section.key
                  ? 'border-emerald-400/60 bg-emerald-500/10'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <input
                type="radio"
                name="about-section"
                value={section.key}
                checked={active === section.key}
                onChange={() => setActive(section.key)}
                className="accent-emerald-500"
              />
              <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center text-emerald-600">
                <section.icon />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{section.label}</p>
                <p className="text-[11px] text-slate-500">Tap to view details</p>
              </div>
            </label>
          ))}
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-200 flex items-center justify-center">
                  <current.icon />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">Section</p>
                  <h2 className="text-2xl font-display text-white font-bold">{current.heading}</h2>
                </div>
              </div>

              {current.highlight && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 text-sm">
                  {current.highlight}
                </div>
              )}

              {current.body && (
                <div className="space-y-3 text-sm text-slate-200/90 leading-relaxed">
                  {current.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              )}

              {current.list && (
                <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-200/90">
                  {current.list.map(item => (
                    <div key={item} className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {current.key === 'contact' && (
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200 flex items-center gap-2">
                    <FiMapPin /> New Delhi – 110016
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200 flex items-center gap-2">
                    <FiMail /> helpageindia@sc
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200 flex items-center gap-2">
                    <FiPhone /> UPI: helpageindia@sc
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
