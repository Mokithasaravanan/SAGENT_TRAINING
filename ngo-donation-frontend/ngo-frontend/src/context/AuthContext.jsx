import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

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
  value?.assignedNgoId ??
  value?.assigned_ngo_id ??
  value?.assignedNgo?.id ??
  value?.assignedNgo?.ngoId ??
  value?.assignedNgo?.ngo_id ??
  value?.user?.ngoId ??
  value?.user?.ngo_id ??
  value?.user?.ngo?.id ??
  null
)

const resolveNgoName = (value) => (
  value?.ngoName ??
  value?.ngo?.name ??
  value?.ngo?.ngoName ??
  value?.ngo?.title ??
  value?.assignedNgo?.name ??
  value?.assignedNgoName ??
  value?.user?.ngoName ??
  value?.user?.ngo?.name ??
  value?.user?.assignedNgo?.name ??
  ''
)

const resolveRole = (value) => {
  const raw = Array.isArray(value?.roles)
    ? value.roles[0]
    : (value?.role ?? value?.user?.role)
  return raw ? String(raw).replace(/^ROLE_/, '').toUpperCase() : raw
}

const isDemoToken = (token) => token === 'demo-token'

const mergeUserWithToken = (userData, tokenVal) => {
  const payload = decodeJwtPayload(tokenVal)
  if (!payload) return userData
  const ngoId = resolveNgoId(userData) ?? resolveNgoId(payload)
  const ngoName = resolveNgoName(userData) || resolveNgoName(payload)
  const role = userData?.role || resolveRole(payload)
  return { ...userData, ngoId, ngoName, role }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const isGuestUser = (u, t) => {
    if (t === 'guest-token') return true
    const role = u?.role ? String(u.role).toUpperCase() : ''
    return Boolean(u?.isGuest || role === 'GUEST')
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('ngo_token')
    const savedUser  = localStorage.getItem('ngo_user')
    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser)
      if (isDemoToken(savedToken) || isGuestUser(parsedUser, savedToken)) {
        localStorage.removeItem('ngo_token')
        localStorage.removeItem('ngo_user')
      } else {
        setToken(savedToken)
        setUser(mergeUserWithToken(parsedUser, savedToken))
      }
    }
    setLoading(false)
  }, [])

  const login = (tokenVal, userData) => {
    const isTransientDemoLogin = isDemoToken(tokenVal)
    if (isGuestUser(userData, tokenVal)) {
      setToken(null)
      setUser(null)
      localStorage.removeItem('ngo_token')
      localStorage.removeItem('ngo_user')
      return
    }
    setToken(tokenVal)
    const mergedUser = mergeUserWithToken(userData, tokenVal)
    setUser(mergedUser)
    if (isTransientDemoLogin) {
      localStorage.removeItem('ngo_token')
      localStorage.removeItem('ngo_user')
    } else {
      localStorage.setItem('ngo_token', tokenVal)
      localStorage.setItem('ngo_user', JSON.stringify(mergedUser))
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('ngo_token')
    localStorage.removeItem('ngo_user')
  }

  const isLoggedIn = Boolean(token && user) && !isGuestUser(user, token)

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
