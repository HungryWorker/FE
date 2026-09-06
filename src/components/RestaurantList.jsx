import { useState } from 'react'
import '../css/RestaurantList.css'
import RestaurantCard from './RestaurantCard'

export default function RestaurantList({
                                           restaurants = [],
                                           onSelect,
                                           onSearch,
                                       }) {
    const [search, setSearch] = useState('')
    const [showFilter, setShowFilter] = useState(false)

    // =========================
    // 검색
    // =========================

    const handleSearch = () => {
        onSearch?.(search)
    }

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // =========================
    // 렌더링
    // =========================

    return (
        <aside className="restaurant-list">

            {/* =========================
                검색창
            ========================= */}

            <div className="restaurant-search">

                <div className="restaurant-search-box">

                    <input
                        type="text"
                        placeholder="식당 이름 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />

                    <button
                        className="restaurant-search-btn"
                        type="button"
                        onClick={handleSearch}
                    >
                        🔍
                    </button>

                    <button
                        className="restaurant-filter-btn"
                        type="button"
                        aria-label="필터"
                        onClick={() => setShowFilter((prev) => !prev)}
                    >
                        ⚙️
                    </button>

                </div>

                {/* =========================
                    필터
                ========================= */}

                {showFilter && (
                    <div className="restaurant-filter-panel">

                        <button type="button">
                            ⭐ 평점 높은 순
                        </button>

                        <button type="button">
                            💵 가격 낮은 순
                        </button>

                        <button type="button">
                            💬 리뷰 많은 순
                        </button>

                    </div>
                )}

            </div>


            {/* =========================
                검색 결과
            ========================= */}

            {restaurants.length === 0 ? (

                <div className="restaurant-empty">
                    검색 결과가 없어요.
                </div>

            ) : (

                restaurants.map((restaurant) => {
                    console.log('식당 데이터:', restaurant)
                    console.log('식당 이름:', restaurant.name)
                    const key =
                        restaurant.id ??
                        restaurant.googlePlaceId

                    return (
                        <RestaurantCard
                            key={key}
                            restaurant={restaurant}
                            onSelect={onSelect}
                        />
                    )
                })
            )}

        </aside>
    )
}