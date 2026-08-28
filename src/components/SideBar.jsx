import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchNearbyRestaurants, searchRestaurants, getToken, } from '../api.js'
import RestaurantList from './RestaurantList.jsx'
import RestaurantPopup from './RestaurantPopup.jsx'
import '../css/SideBar.css'


export default function SideBar( {
    restaurants,
        restaurantsLoading,
        onlyUnder15,
        setOnlyUnder15,
        onSelectRestaurant,
        onSearch,
}) {
    const [showSearchPanel, setShowSearchPanel] = useState(false)

    return (
        <div
            className={'map-sidebar'}>
                <>
                    <button
                        className="map-sidebar-menu-btn"
                        onClick={() => {
                            // 홈 기능
                        }}
                        aria-label="홈"
                    >
                        홈
                    </button>

                    <button
                        className="map-sidebar-menu-btn"
                        onClick={() => setShowSearchPanel(true)}
                        aria-label="음식점 검색"
                    >
                        =
                    </button>

                    <button
                        className="map-sidebar-menu-btn"
                        onClick={() => {
                            // 음식점 추가 기능
                        }}
                        aria-label="음식점 추가"
                    >
                        +
                    </button>
                </>


            <div
                className={`map-search-panel ${
        showSearchPanel ? 'visible' : 'hidden'
    }`}
            >
                <div className="map-search-header">
                    <button
                        className="map-search-back"
                        onClick={() => {
                            setShowSearchPanel(false)}
                        }
                    >
                        ←
                    </button>

                    <strong>음식점 검색</strong>
                </div>

                <RestaurantList
                    restaurants={restaurants}
                    onSelect={onSelectRestaurant}
                    onSearch={onSearch}
                />
            </div>
        </div>
    )
}