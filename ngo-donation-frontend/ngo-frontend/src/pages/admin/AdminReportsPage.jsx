import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiBarChart2, FiFileText } from 'react-icons/fi'
import { generateReport, getAllReports } from '../../services/api'
import { PAGE_BACKGROUNDS } from '../../constants/imagery'
import { SkeletonRow } from '../../components/Skeleton'

const REPORT_TYPES = [
  { key: 'MONTHLY_SUMMARY', label: 'Monthly Summary', desc: 'Donation inflow, pickup stats, and trends' },
  { key: 'DONOR_REPORT', label: 'Donor Report', desc: 'Recurring donors and contribution analysis' },
  { key: 'CAMPAIGN_REPORT', label: 'Campaign Report', desc: 'Campaign performance and progress' },
  { key: 'VOLUNTEER_REPORT', label: 'Volunteer Report', desc: 'Task completion and field performance' },
]

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAllReports()
      setReports(res.data.data || [])
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleGenerate = async (type) => {
    try {
      await generateReport(type)
      toast.success('Report generated')
      load()
    } catch {
      toast.error('Failed to generate report')
    }
  }

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden h-48">
        <img src={PAGE_BACKGROUNDS.adminReports} alt="reports" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="hero-card rounded-2xl p-5 max-w-2xl">
            <p className="text-xs text-emerald-200 uppercase tracking-wider mb-2">Impact Reports</p>
            <h2 className="font-display text-2xl text-white font-bold">Generate accountable NGO metrics</h2>
            <p className="text-sm text-slate-200 mt-2">Export financial, operational, and impact analytics.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {REPORT_TYPES.map((report, i) => (
          <motion.button
            key={report.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerate(report.key)}
            className="glass-panel rounded-2xl p-5 text-left border border-white/10"
          >
            <FiBarChart2 className="text-emerald-300 mb-2" />
            <p className="text-sm font-semibold text-white">{report.label}</p>
            <p className="text-xs text-slate-400 mt-1">{report.desc}</p>
          </motion.button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <FiFileText className="text-emerald-300" />
          <h3 className="text-lg font-semibold text-white">Generated Reports</h3>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : reports.length === 0 ? (
          <div className="text-sm text-slate-400">No reports generated yet.</div>
        ) : (
          <div className="space-y-3">
            {reports.map((r, i) => (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{r.reportType}</p>
                  <p className="text-xs text-slate-400">
                    {r.generatedDate ? new Date(r.generatedDate).toLocaleDateString('en-IN') : 'Just now'}
                  </p>
                </div>
                <span className="text-xs text-emerald-200 bg-emerald-500/20 px-2.5 py-1 rounded-full">Ready</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
