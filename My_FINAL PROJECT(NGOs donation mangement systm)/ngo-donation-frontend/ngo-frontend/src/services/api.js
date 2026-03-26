import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT token (skip auth endpoints to avoid stale-token 401s)
API.interceptors.request.use((config) => {
  const url = String(config?.url || '')
  const isAuthEndpoint =
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register')
  if (!isAuthEndpoint) {
    const token = localStorage.getItem('ngo_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


// Auth
export const registerUser  = (data) => API.post('/api/auth/register', data)
export const loginUser     = (data) => {
  const email = data?.email ?? data?.username ?? data?.userName ?? ''
  const password = data?.password ?? data?.pass ?? ''
  const payload = {
    ...data,
    email,
    username: data?.username ?? email,
    userName: data?.userName ?? email,
    password,
  }
  return API.post('/api/auth/login', payload)
}

// NGOs
export const getAllNgos     = (location) => API.get('/api/ngos', { params: location ? { location } : {} })
export const getNgoById    = (id)  => API.get(`/api/ngos/${id}`)
export const createNgo     = (data) => API.post('/api/ngos', data)

// Campaigns
export const getAllCampaigns   = ()   => API.get('/api/campaigns')
export const getCampaignById   = (id) => API.get(`/api/campaigns/${id}`)
export const createCampaign    = (data) => API.post('/api/campaigns', data)

// Donations
export const donateMoney       = (data) => API.post('/api/donations/money', data)
export const donateGoods       = (data) => API.post('/api/donations/goods', data)
export const getDonationHistory = (donorId) => API.get(`/api/donations/history/${donorId}`)

// Pickups
export const requestPickup     = (data) => API.post('/api/pickups/request', data)
export const getMyPickups      = (donorId) => API.get(`/api/pickups/${donorId}`)

// Volunteer
export const getMyTasks        = (volunteerId) => API.get(`/api/tasks/volunteer/${volunteerId}`)
export const updateTaskStatus  = (taskId, status) => API.put(`/api/tasks/updateStatus/${taskId}`, { status })

// Admin
export const approveCampaign   = (campaignId) => API.post('/api/admin/campaign/approve', { campaignId })
export const rejectCampaign    = (campaignId) => API.post('/api/admin/campaign/reject', { campaignId })
export const createUrgentNeed  = (data) => API.post('/api/admin/urgent-need', data)
export const getAllUrgentNeeds  = () => API.get('/api/admin/urgent-needs')
export const generateReport    = (type) => API.post(`/api/admin/reports/generate?type=${type}`)
export const getAllReports      = () => API.get('/api/admin/reports')
export const getAllDonors       = () => API.get('/api/admin/donors')
export const getAllVolunteers = () => API.get('/api/admin/volunteers')
export const getAllDonationRequests = () => API.get('/api/admin/donations')
export const approveDonation = (donationId) =>
  API.post('/api/admin/donations/approve', { donationId })
export const rejectDonation = (donationId) =>
  API.post('/api/admin/donations/reject', { donationId })
export const getAllNgoAdmins = () => API.get('/api/admin/ngo-admins')
export const createNgoAdmin = (data) => API.post('/api/admin/ngo-admins', data)
export const assignNgoAdminToNgo = (ngoAdminId, ngoId) =>
  API.post('/api/admin/ngo-admins/assign', { adminId: ngoAdminId, ngoId })

// Add these to your existing api.js
export const getAllPickupRequests = () => API.get('/api/admin/pickups')
export const assignVolunteerToPickup = (pickupRequestId, volunteerId) =>
  API.post(`/api/admin/assign-task?pickupRequestId=${pickupRequestId}&volunteerId=${volunteerId}`)
export const getAllVolunteerTasks = () => API.get('/api/admin/tasks')
export const getAvailablePickupRequests = () => API.get('/api/tasks/available')
export const claimPickupTask = (pickupRequestId, volunteerId) =>
  API.post('/api/tasks/claim', { pickupRequestId, volunteerId })

export default API
