import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchNearbyRestaurants, getToken } from '../api'
import RestaurantList from '../components/RestaurantList'
import RestaurantPopup from '../components/RestaurantPopup'
import '../css/Mapview.css'

// 위치 권한이 없거나 실패했을 때 대체로 보여줄 중심 좌표 (서울시청)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }
const SEARCH_RADIUS_M = 1500
// 지도 중심이 이만큼(m) 이상 움직이면 "이 위치에서 다시 검색" 버튼을 보여준다
const MOVE_THRESHOLD_M = 250

function toRad(deg) {
  return (deg * Math.PI) / 180
}

// 두 좌표 사이의 거리(m)를 구하는 하버사인 공식
function distanceMeters(a, b) {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

const userIcon = L.divIcon({
  className: 'hw-user-icon',
  html: '<span class="hw-user-pulse"></span><span class="hw-user-dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function restaurantIcon(isSelected) {
  const fill = isSelected ? '#d9a441' : '#b5533c'
  return L.divIcon({
    className: 'hw-restaurant-icon',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.3 0 0 6.2 0 13.8 0 23.8 12.1 34.4 13 35.2c.6.5 1.4.5 2 0 .9-.8 13-11.4 13-21.4C28 6.2 21.7 0 14 0z" fill="${fill}"/>
      <circle cx="14" cy="13.5" r="6" fill="#fff"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  })
}

// 지도를 드래그/줌 하면 현재 중심 좌표를 부모로 올려보낸다
function MapMoveWatcher({ onMoved }) {
  useMapEvents({
    moveend: (event) => {
      const center = event.target.getCenter()
      onMoved({ lat: center.lat, lng: center.lng })
    },
  })
  return null
}

// "내 위치로" 버튼을 눌렀을 때만 지도를 부드럽게 이동시킨다
function FlyToOnRequest({ target, requestId }) {
  const map = useMap()
  useEffect(() => {
    if (target && requestId) {
      map.flyTo([target.lat, target.lng], 16, { duration: 0.8 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])
  return null
}

export default function MapView() {
  const navigate = useNavigate()
  const isLoggedIn = Boolean(getToken())

  const [position, setPosition] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [locating, setLocating] = useState(true)
  const [locateNotice, setLocateNotice] = useState(null)

  const [searchCenter, setSearchCenter] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [showResearch, setShowResearch] = useState(false)

  // const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  //더미데이터
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,

      name: '김치찌개 맛집',
      category: '한식',

      latitude: 37.5668,
      longitude: 126.9784,

      registeredAt: '8월 24일',

      photos: [
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
        'https://images.unsplash.com/photo-1547592180-85f173990554',
        'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f',
      ],

      address: '서울특별시 종로구 종로 123',

      businessHours: '11:00 ~ 21:00',
      breakTime: '15:00 ~ 17:00',

      cheapestMenu: '김치찌개',
      cheapestPrice: 8,

      tags: [
        '밥',
        '한식',
        '혼밥',
        '가성비',
      ],

      rating: 4.7,
      totalScore: 4.7,

      taste: 4.8,
      portion: 4.5,
      value: 4.7,
      hygiene: 4.6,

      reviewCount: 128,

      reviews: [
        {
          id: 1,
          nickname: '맛있는거좋아',
          profileImage: null,
          comment: '국물이 진하고 고기가 푸짐해서 정말 맛있었어요!',
          date: '8월 20일',
        },
        {
          id: 2,
          nickname: '혼밥러',
          profileImage: null,
          comment: '혼자 먹기에도 좋고 가격도 괜찮았습니다.',
          date: '8월 18일',
        },
        {
          id: 3,
          nickname: '먹보',
          profileImage: null,
          comment: '양이 꽤 많아요. 다음에도 또 올 것 같아요.',
          date: '8월 15일',
        },
      ],
    }
  ])
  const [restaurantsLoading, setRestaurantsLoading] = useState(false)
  const [restaurantsError, setRestaurantsError] = useState(null)
  const [needsLogin, setNeedsLogin] = useState(false)

  const [onlyUnder15, setOnlyUnder15] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [flyRequest, setFlyRequest] = useState(null)

  // 최초 진입: 브라우저 GPS로 내 위치를 요청
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocateNotice('이 브라우저는 위치 확인을 지원하지 않아요. 서울 중심으로 보여드릴게요.')
      setPosition(DEFAULT_CENTER)
      setSearchCenter(DEFAULT_CENTER)
      setMapCenter(DEFAULT_CENTER)
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(coords)
        setAccuracy(pos.coords.accuracy)
        setSearchCenter(coords)
        setMapCenter(coords)
        setLocating(false)
      },
      () => {
        setLocateNotice(
          '위치 권한이 없어서 서울 중심으로 보여드릴게요. 브라우저 설정에서 위치 권한을 허용하면 내 주변으로 이동해요.'
        )
        setPosition(DEFAULT_CENTER)
        setSearchCenter(DEFAULT_CENTER)
        setMapCenter(DEFAULT_CENTER)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  // searchCenter 또는 $15 필터가 바뀔 때마다 실제 검색을 실행하는 단일 지점.
  // 이벤트 핸들러들은 searchCenter/mapCenter만 갱신하고, 실제 fetch는 항상 여기서만 일어난다.
  // useEffect(() => {
  //   if (!searchCenter) return
  //
  //   let cancelled = false
  //   setRestaurantsLoading(true)
  //   setRestaurantsError(null)
  //   setNeedsLogin(false)
  //
  //   fetchNearbyRestaurants({
  //     lat: searchCenter.lat,
  //     lng: searchCenter.lng,
  //     radius: SEARCH_RADIUS_M,
  //     maxPrice: onlyUnder15 ? 15 : undefined,
  //   })
  //     .then((list) => {
  //       if (cancelled) return
  //       setRestaurants(Array.isArray(list) ? list : [])
  //       setShowResearch(false)
  //     })
  //     .catch((e) => {
  //       if (cancelled) return
  //       if (e.message === 'UNAUTHORIZED') {
  //         setNeedsLogin(true)
  //       } else {
  //         setRestaurantsError('주변 음식점을 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
  //       }
  //       setRestaurants([])
  //     })
  //     .finally(() => {
  //       if (!cancelled) setRestaurantsLoading(false)
  //     })
  //
  //   return () => {
  //     cancelled = true
  //   }
  // }, [searchCenter, onlyUnder15])

  function handleMapMoved(center) {
    setMapCenter(center)
    if (searchCenter && distanceMeters(searchCenter, center) > MOVE_THRESHOLD_M) {
      setShowResearch(true)
    }
  }

  function handleResearch() {
    if (mapCenter) setSearchCenter(mapCenter)
  }

  function handleLocateMe() {
    if (!('geolocation' in navigator)) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(coords)
        setAccuracy(pos.coords.accuracy)
        setLocating(false)
        setFlyRequest(Date.now())
        setSearchCenter(coords)
        setMapCenter(coords)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  if (locating || !position) {
    return (
      <div className="map-loading-screen">
        <div className="spinner" />
        <p className="state-text">내 주변 위치를 확인하는 중이에요...</p>
      </div>
    )
  }

  return (
      <div className="map-screen">
        <header className="map-topbar">
          <button className="map-icon-btn" onClick={() => navigate('/')} aria-label="홈으로">
            ←
          </button>
          <div className="map-topbar-title">
            <span className="map-topbar-eyebrow">내 주변</span>
            <strong>맛집 지도</strong>
          </div>
          <button
              className="map-icon-btn"
              onClick={() => navigate(isLoggedIn ? '/profile' : '/')}
              aria-label="내 정보"
          >
            👤
          </button>
        </header>

        <div className="map-banner-stack">
          {locateNotice && <div className="map-banner">{locateNotice}</div>}
          {needsLogin && (
              <div className="map-banner map-banner-action">
                <span>로그인하면 주변 음식점을 볼 수 있어요</span>
                <button className="map-banner-link" onClick={() => navigate('/')}>
                  로그인하러 가기
                </button>
              </div>
          )}
          {restaurantsError && <div className="map-banner map-banner-error">{restaurantsError}</div>}
        </div>

        <MapContainer
            center={[position.lat, position.lng]}
            zoom={16}
            zoomControl={false}
            className="map-container"
        >
          <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
          />
          <ZoomControl position="bottomright"/>

          <Marker position={[position.lat, position.lng]} icon={userIcon}/>
          {accuracy && (
              <Circle
                  center={[position.lat, position.lng]}
                  radius={accuracy}
                  pathOptions={{color: '#d9a441', fillColor: '#d9a441', fillOpacity: 0.12, weight: 1}}
              />
          )}

          {restaurants.map((r) => {
            const key = r.id ?? r.googlePlaceId
            if (typeof r.latitude !== 'number' || typeof r.longitude !== 'number') return null
            return (
                <Marker
                    key={key}
                    position={[r.latitude, r.longitude]}
                    icon={restaurantIcon(selectedId === key)}
                    eventHandlers={{
                      click: () => {
                        setSelectedId(key)
                        setSelectedRestaurant(r)
                      },
                    }}
                >
                  <Popup>
                    <div className="map-popup">
                      <strong>{r.name}</strong>
                      {r.address && <p>{r.address}</p>}
                      <div className="map-popup-meta">
                        {typeof r.rating === 'number' && <span>⭐ {r.rating}</span>}
                        {r.priceLevel != null && <span>💵 {r.priceLevel}</span>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
            )
          })}

          <MapMoveWatcher onMoved={handleMapMoved}/>
          <FlyToOnRequest target={position} requestId={flyRequest}/>
        </MapContainer>

        <div className="restaurant-panel">
          <RestaurantList
              restaurants={restaurants}
              onSelect={setSelectedRestaurant}
          />
          {selectedRestaurant && (
              <RestaurantPopup
                  restaurant={selectedRestaurant}
                  onClose={() => setSelectedRestaurant(null)}
              />
          )}

        </div>
        {showResearch && (
            <button className="map-research-btn" onClick={handleResearch}>
              이 위치에서 다시 검색
            </button>
        )}

        <button className="map-locate-btn" onClick={handleLocateMe} aria-label="내 위치로 이동">
          ⦿
        </button>

        <div className="map-bottom-panel">
          <label className="map-filter-toggle">
            <input
                type="checkbox"
                checked={onlyUnder15}
                onChange={(e) => setOnlyUnder15(e.target.checked)}
            />
            <span>$15 이하만 보기</span>
          </label>

          <div className="map-result-count">
            {restaurantsLoading ? '검색 중...' : `주변 음식점 ${restaurants.length}곳`}
          </div>
        </div>
      </div>
  )
}
