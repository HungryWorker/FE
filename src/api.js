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

/**
 * 주어진 좌표 주변의 음식점을 조회한다.
 * 백엔드 RestaurantController가 아직 없다면 404/401 등으로 실패할 수 있는데,
 * 그 경우에도 지도 화면 자체는 정상 동작해야 하므로 호출부에서 에러를 흡수한다.
 */
export function fetchNearbyRestaurants({ lat, lng, radius = 1500, maxPrice } = {}) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  })
  if (maxPrice) {
    params.set('maxPrice', String(maxPrice))
  }
  return apiFetch(`/api/restaurants/nearby?${params.toString()}`)
}

/**
 * 키워드로 음식점을 검색한다.
 * 백엔드에서 Google Places Text Search API를 호출한다.
 */
export function searchRestaurants({
                                    keyword,
                                    lat,
                                    lng,
                                    radius = 1500,
                                  } = {}) {
  const params = new URLSearchParams({
    keyword: String(keyword),
  })

  if (lat != null) {
    params.set('lat', String(lat))
  }

  if (lng != null) {
    params.set('lng', String(lng))
  }

  if (radius != null) {
    params.set('radiusMeters', String(radius))
  }

  return apiFetch(`/api/restaurants/search?${params.toString()}`)
}