import { useState } from 'react'
import '../css/RestaurantList.css'

export default function RestaurantList({ restaurants, onSelect, onSearch, setShowSearchPanel }) {
    const [search, setSearch] = useState('')
    const [showFilter, setShowFilter] = useState(false)

    // 식당별 현재 사진 / 리뷰 위치
    const [photoIndexes, setPhotoIndexes] = useState({})
    const [reviewIndexes, setReviewIndexes] = useState({})

    // if (!restaurants || restaurants.length === 0) {
    //     return null
    // }

    const filteredRestaurants = restaurants.filter((restaurant) =>
        restaurant.name
            ?.toLowerCase()
            .includes(search.toLowerCase())
    )

    // =========================
    // 사진 이동
    // =========================

    const movePhoto = (e, restaurantKey, total, direction) => {
        e.stopPropagation()

        setPhotoIndexes((prev) => {
            const current = prev[restaurantKey] ?? 0

            const next = Math.max(
                0,
                Math.min(current + direction, total - 1)
            )

            return {
                ...prev,
                [restaurantKey]: next,
            }
        })
    }

    // =========================
    // 리뷰 이동
    // =========================

    const moveReview = (e, restaurantKey, total, direction) => {
        e.stopPropagation()

        setReviewIndexes((prev) => {
            const current = prev[restaurantKey] ?? 0

            const next = Math.max(
                0,
                Math.min(current + direction, total - 1)
            )

            return {
                ...prev,
                [restaurantKey]: next,
            }
        })
    }

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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onSearch?.(search)
                            }
                        }}
                    />
                    <button className="restaurant-search-btn" onClick={() => onSearch?.(search)}>
                        🔍
                    </button>
                    <button
                        className="restaurant-filter-btn"
                        type="button"
                        onClick={() => setShowFilter((prev) => !prev)}
                        aria-label="필터"
                    >
                        ⚙️
                    </button>

                </div>

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

            {filteredRestaurants.length === 0 ? (

                <div className="restaurant-empty">
                    검색 결과가 없어요.
                </div>

            ) : (

                filteredRestaurants.map((restaurant) => {

                    const key =
                        restaurant.id ??
                        restaurant.googlePlaceId

                    const photos = Array.isArray(restaurant.photos)
                        ? restaurant.photos
                        : restaurant.photoUrl
                            ? [restaurant.photoUrl]
                            : []

                    const reviews = Array.isArray(restaurant.reviews)
                        ? restaurant.reviews
                        : []

                    const photoIndex =
                        photoIndexes[key] ?? 0

                    const reviewIndex =
                        reviewIndexes[key] ?? 0

                    return (

                        <article
                            className="restaurant-card"
                            key={key}
                            onClick={() => onSelect(restaurant)}
                        >

                            {/* =========================
                                사진
                            ========================= */}

                            <div className="restaurant-card-image">

                                {photos.length > 0 ? (

                                    <div className="restaurant-photo-list">

                                        {photos.map((photo, index) => (

                                            <img
                                                key={index}
                                                src={photo}
                                                alt={`${restaurant.name} 사진 ${index + 1}`}
                                                className={
                                                    index === photoIndex
                                                        ? 'active'
                                                        : ''
                                                }
                                            />

                                        ))}

                                    </div>

                                ) : (

                                    <span>🍽️</span>

                                )}


                                {/* 사진 왼쪽 화살표 */}

                                {photos.length > 1 &&
                                    photoIndex > 0 && (

                                        <button
                                            className="restaurant-photo-arrow restaurant-photo-arrow-left"
                                            type="button"
                                            aria-label="이전 사진"
                                            onClick={(e) =>
                                                movePhoto(
                                                    e,
                                                    key,
                                                    photos.length,
                                                    -1
                                                )
                                            }
                                        >
                                            ‹
                                        </button>

                                    )}


                                {/* 사진 오른쪽 화살표 */}

                                {photos.length > 1 &&
                                    photoIndex < photos.length - 1 && (

                                        <button
                                            className="restaurant-photo-arrow restaurant-photo-arrow-right"
                                            type="button"
                                            aria-label="다음 사진"
                                            onClick={(e) =>
                                                movePhoto(
                                                    e,
                                                    key,
                                                    photos.length,
                                                    1
                                                )
                                            }
                                        >
                                            ›
                                        </button>

                                    )}


                                {/* 저장 */}

                                <button
                                    className="restaurant-heart"
                                    type="button"
                                    aria-label={`${restaurant.name} 저장`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                >
                                    ♡
                                </button>

                            </div>


                            {/* =========================
                                식당 정보
                            ========================= */}

                            <div className="restaurant-card-content">

                                <div className="restaurant-category">
                                    🍽️ {restaurant.category || '음식점'}
                                </div>

                                <h3 className="restaurant-name">
                                    {restaurant.name}
                                </h3>


                                {/* =========================
                                    메타 정보
                                ========================= */}

                                <div className="restaurant-meta">

                                    <span>
                                        {restaurant.category || '음식점'}
                                    </span>

                                    <span>
                                        💬 {restaurant.reviewCount ?? 0}
                                    </span>

                                    <span>
                                        ⭐ {restaurant.rating ?? '-'}
                                    </span>

                                    <span>
                                        💵 {restaurant.priceLevel ?? '-'}$
                                    </span>

                                </div>


                                {/* =========================
                                    리뷰
                                ========================= */}

                                <div className="restaurant-review-list">

                                    {reviews.length > 0 ? (

                                        reviews.map((review, index) => (

                                            <div
                                                className={
                                                    `restaurant-review ${
                                                        index === reviewIndex
                                                            ? 'active'
                                                            : ''
                                                    }`
                                                }
                                                key={review.id ?? index}
                                            >

                                                💬 {
                                                review.comment ??
                                                review.text ??
                                                review
                                            }

                                            </div>

                                        ))

                                    ) : (

                                        <div className="restaurant-review active">
                                            💬 아직 등록된 리뷰가 없어요.
                                        </div>

                                    )}


                                    {/* 리뷰 왼쪽 화살표 */}

                                    {reviews.length > 1 &&
                                        reviewIndex > 0 && (

                                            <button
                                                className="restaurant-review-arrow restaurant-review-arrow-left"
                                                type="button"
                                                aria-label="이전 리뷰"
                                                onClick={(e) =>
                                                    moveReview(
                                                        e,
                                                        key,
                                                        reviews.length,
                                                        -1
                                                    )
                                                }
                                            >
                                                ‹
                                            </button>

                                        )}


                                    {/* 리뷰 오른쪽 화살표 */}

                                    {reviews.length > 1 &&
                                        reviewIndex < reviews.length - 1 && (

                                            <button
                                                className="restaurant-review-arrow restaurant-review-arrow-right"
                                                type="button"
                                                aria-label="다음 리뷰"
                                                onClick={(e) =>
                                                    moveReview(
                                                        e,
                                                        key,
                                                        reviews.length,
                                                        1
                                                    )
                                                }
                                            >
                                                ›
                                            </button>

                                        )}

                                </div>

                            </div>

                        </article>
                    )
                })
            )}

        </aside>
    )
}