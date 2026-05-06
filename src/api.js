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
  if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
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

// Knowledge Base API functions
export async function getKnowledgeBase(category = null, division = null) {
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (division) params.append('division', division)
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await apiFetch(`/knowledge/${query}`)
  if (!res.ok) throw new Error('Failed to fetch knowledge base')
  return res.json()
}

export async function getKnowledgeBaseDetail(kbId) {
  const res = await apiFetch(`/knowledge/${kbId}`)
  if (!res.ok) throw new Error('Failed to fetch knowledge base detail')
  return res.json()
}

export async function createKnowledgeBase(data) {
  const res = await apiFetch('/knowledge/', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create knowledge base')
  return res.json()
}

export async function updateKnowledgeBase(kbId, data) {
  const res = await apiFetch(`/knowledge/${kbId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update knowledge base')
  return res.json()
}

export async function deleteKnowledgeBase(kbId) {
  const res = await apiFetch(`/knowledge/${kbId}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete knowledge base')
  return res.json()
}

export async function getOptions() {
  const res = await apiFetch('/options/')
  if (!res.ok) throw new Error('Failed to fetch options')
  return res.json()
}
