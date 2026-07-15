export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const TOKEN_KEY = 'hungryworker_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function googleLoginUrl() {
  return `${API_BASE_URL}/oauth2/authorization/google`
}

/**
 * 인증이 필요한 API 호출 공통 래퍼.
 * 401이 오면 토큰이 무효하다는 뜻이므로 지워서 다시 로그인하게 한다.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    clearToken()
    throw new Error('UNAUTHORIZED')
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `요청 실패 (status ${response.status})`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function fetchMe() {
  return apiFetch('/api/users/me')
}
