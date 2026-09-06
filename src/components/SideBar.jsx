import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchNearbyRestaurants, searchRestaurants, getToken, } from '../api.js'
import '../css/SideBar.css'
import home from '../images/sidebar/home.png'
import hamburger from '../images/sidebar/hamburger.png'
import create from '../images/sidebar/create.png'

export default function SideBar({onToggleSearch, onToggleCreate}) {
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
                <img src={home} alt="home"/>
            </button>

            <button
                className="map-sidebar-menu-btn"
                        onClick={onToggleSearch}
                        aria-label="음식점 검색"
                    >
                <img src={hamburger} alt="hamburger"/>
                    </button>

                    <button
                        className="map-sidebar-menu-btn"
                        onClick={onToggleCreate}
                        aria-label="음식점 추가"
                    >
                        <img src={create} alt="create"/>
                    </button>
        </div>
    )
}