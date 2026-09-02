import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchNearbyRestaurants, searchRestaurants, getToken, } from '../api.js'
import '../css/SideBar.css'


export default function SideBar({onToggleSearch}) {
    return (
        <div
            className={'map-sidebar'}>
                    <button
                        className="map-sidebar-menu-btn"
                        id="home"
                        onClick={() => {
                            // 홈 기능
                        }}
                        aria-label="홈"
                    >
                        홈
                    </button>

                    <button
                        className="map-sidebar-menu-btn"
                        onClick={onToggleSearch}
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
        </div>
    )
}