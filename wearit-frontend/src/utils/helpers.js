export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function isAdmin() {
  const token = getToken()
  if (!token) return false
  const payload = decodeToken(token)
  return payload?.role === 'admin'
}

export function isAuthenticated() {
  return !!getToken()
}

export function getUserId() {
  const token = getToken()
  if (!token) return null
  const payload = decodeToken(token)
  return payload?.user_id
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function truncate(str, len = 100) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}
