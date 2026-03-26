import { useState, useEffect, useCallback } from 'react'
import { getMyTasks, updateTaskStatus } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { sendVolunteerCompletionNotification } from '../services/messaging'

const normalizeId = (value) => (
  value === undefined || value === null ? null : String(value)
)

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

const normalizeTask = (task) => {
  if (!task) return null
  const pickup =
    task?.pickupRequest ||
    task?.pickup ||
    task?.request ||
    task?.pickupDetails ||
    task?.pickup_request ||
    {}
  const donation =
    task?.donation ||
    task?.donationDetails ||
    task?.donationInfo ||
    pickup?.donation ||
    {}
  const id =
    task?.id ??
    task?.taskId ??
    task?.task_id ??
    task?.pickupRequestId ??
    task?.requestId ??
    pickup?.id ??
    null
  const statusRaw =
    task?.status ??
    task?.pickupStatus ??
    task?.requestStatus ??
    pickup?.status ??
    'ASSIGNED'
  const status = String(statusRaw).toUpperCase()
  const pickupTime =
    task?.pickupTime ??
    task?.pickup_time ??
    pickup?.pickupTime ??
    pickup?.pickup_time ??
    pickup?.scheduledAt ??
    pickup?.scheduleTime ??
    pickup?.pickupDate
  const pickupAddress =
    task?.pickupAddress ??
    task?.pickup_address ??
    pickup?.pickupAddress ??
    pickup?.address ??
    pickup?.pickup_address ??
    pickup?.location
  const donorName =
    task?.donorName ??
    task?.donor?.name ??
    pickup?.donorName ??
    pickup?.donor?.name ??
    pickup?.user?.name ??
    donation?.donor?.name

  return {
    ...task,
    id,
    status,
    pickupTime,
    pickupAddress,
    donorName,
    donation,
  }
}

const getCandidateVolunteerIds = (user) => {
  const ids = [
    user?.userId,
    user?.id,
    user?.volunteerId,
    user?.volunteer_id,
    user?.email,
  ].filter(Boolean)
  const normalized = ids.map(normalizeId).filter(Boolean)
  return [...new Set(normalized)]
}

export default function useVolunteerTasks() {
  const { user } = useAuth()
  const [tasks,    setTasks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState(null)

  const load = useCallback(async () => {
    const candidateIds = getCandidateVolunteerIds(user)
    if (candidateIds.length === 0) {
      setTasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      let collected = []
      let lastError = null
      let hadSuccess = false

      for (const id of candidateIds) {
        try {
          const res = await getMyTasks(id)
          hadSuccess = true
          const data = extractArray(res, [
            'tasks',
            'volunteerTasks',
            'items',
            'results',
            'content',
            'data',
          ])
          if (data.length > 0) {
            collected = data
            break
          }
          if (collected.length === 0) collected = data
        } catch (err) {
          lastError = err
        }
      }

      if (!hadSuccess && lastError) throw lastError

      const normalized = collected
        .map(normalizeTask)
        .filter(Boolean)
      setTasks(normalized)
    } catch (err) {
      console.error('Tasks fetch error:', err)
      toast.error('Failed to load tasks')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.userId, user?.volunteerId, user?.email])

  // Load on mount + auto refresh every 15 seconds
  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  const updateStatus = async (taskId, currentStatus) => {
    const NEXT = {
      ASSIGNED:    'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
    }
    const nextStatus = NEXT[currentStatus]
    if (!nextStatus) return

    setUpdating(taskId)
    try {
      await updateTaskStatus(taskId, nextStatus)
      toast.success(`Task marked as ${nextStatus.replace('_', ' ')}! ✅`)
      // Update locally immediately
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: nextStatus } : t
      ))
      if (nextStatus === 'COMPLETED') {
        const task = tasks.find(t => t.id === taskId) || {}
        const meta = {
          volunteerName: user?.name || user?.fullName || user?.email,
          taskId,
          status: nextStatus,
          pickupAddress: task.pickupAddress,
          pickupTime: task.pickupTime,
          donorName: task.donorName,
          campaignTitle: task?.donation?.campaignTitle || task?.campaignTitle,
        }
        try {
          await sendVolunteerCompletionNotification(meta)
          toast.success('Admin notified of task completion')
        } catch (mailErr) {
          console.error('Volunteer notification error:', mailErr)
          toast.error('Could not notify admin')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  return { tasks, loading, updating, updateStatus, refresh: load }
}
