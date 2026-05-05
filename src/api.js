export const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

let onUnauthorized = () => {
  localStorage.clear()
  window.location.href = '/'
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

function getToken() {
  return localStorage.getItem('access_token')
}

export async function apiFetch(path, options = {}) {
  const headers = { ...options.headers }
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`
      return fetch(`${BASE_URL}${path}`, { ...options, headers })
    } else {
      localStorage.clear()
      onUnauthorized()
      return res
    }
  }

  return res
}

async function tryRefresh() {
  const refresh_token = localStorage.getItem('refresh_token')
  if (!refresh_token) return false

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  })

  if (!res.ok) return false

  const data = await res.json()
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  return true
}
