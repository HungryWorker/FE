export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

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
 * 공통 API 호출 함수
 *
 * JSON 요청:
 *   Content-Type: application/json
 *
 * FormData 요청:
 *   Content-Type을 직접 지정하지 않는다.
 *   브라우저가 multipart/form-data + boundary를 자동으로 설정한다.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
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
 * 주변 식당 조회
 */
export function fetchNearbyRestaurants({
                                         lat,
                                         lng,
                                         radius = 1500,
                                         maxPrice,
                                       } = {}) {
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
 * 식당 검색
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
    params.set('radius', String(radius))
  }

  return apiFetch(`/api/restaurants/search?${params.toString()}`)
}

/**
 * 식당 등록
 *
 * Backend:
 * POST /api/restaurants
 * Content-Type: multipart/form-data
 *
 * text fields:
 * - restaurantId
 * - name
 * - address
 * - latitude
 * - longitude
 * - breakTime
 * - categories
 * - tags
 * - menusJson
 *
 * file:
 * - photos
 */
export function createRestaurant({
                                   restaurantId,
                                   name,
                                   address,
                                   latitude,
                                   longitude,
                                   breakTime,
                                   categories = [],
                                   tags = [],
                                   menus = [],
                                   photos = [],
                                 }) {
  const formData = new FormData()

  if (restaurantId != null) {
    formData.append('restaurantId', String(restaurantId))
  }

  formData.append('name', name ?? '')
  formData.append('address', address ?? '')
  formData.append('latitude', String(latitude))
  formData.append('longitude', String(longitude))
  formData.append('breakTime', breakTime ?? '')

  categories.forEach((category) => {
    formData.append('categories', category)
  })

  tags.forEach((tag) => {
    formData.append('tags', tag)
  })

  formData.append('menusJson', JSON.stringify(menus))

  photos.forEach((photo) => {
    formData.append('photos', photo)
  })

  return apiFetch('/api/restaurants', {
    method: 'POST',
    body: formData,
  })
}