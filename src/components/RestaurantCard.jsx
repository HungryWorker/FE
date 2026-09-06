import { useState } from 'react'

export default function RestaurantCard({
                                           restaurant,
                                           onSelect,
                                       }) {
    // =========================
    // 현재 사진 / 리뷰 위치
    // =========================

    const [photoIndex, setPhotoIndex] = useState(0)
    const [reviewIndex, setReviewIndex] = useState(0)


    // =========================
    // 사진 / 리뷰 데이터
    // =========================

    const photos = Array.isArray(restaurant.photos)
        ? restaurant.photos
        : restaurant.photoUrl
            ? [restaurant.photoUrl]
            : []

    const reviews = Array.isArray(restaurant.reviews)
        ? restaurant.reviews
        : []


    if (!restaurant) {
        return null
    }
    // =========================
    // 사진 이동
    // =========================

    const movePhoto = (e, direction) => {
        e.stopPropagation()

        setPhotoIndex((current) => {
            const next = Math.max(
                0,
                Math.min(
                    current + direction,
                    photos.length - 1
                )
            )

            return next
        })
    }


    // =========================
    // 리뷰 이동
    // =========================

    const moveReview = (e, direction) => {
        e.stopPropagation()

        setReviewIndex((current) => {
            const next = Math.max(
                0,
                Math.min(
                    current + direction,
                    reviews.length - 1
                )
            )

            return next
        })
    }


    // =========================
    // 카드
    // =========================

    return (
        <article
            className="restaurant-card"
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


                {/* =========================
                    사진 왼쪽 화살표
                ========================= */}

                {photos.length > 1 &&
                    photoIndex > 0 && (

                        <button
                            className="restaurant-photo-arrow restaurant-photo-arrow-left"
                            type="button"
                            aria-label="이전 사진"
                            onClick={(e) =>
                                movePhoto(e, -1)
                            }
                        >
                            ‹
                        </button>

                    )}


                {/* =========================
                    사진 오른쪽 화살표
                ========================= */}

                {photos.length > 1 &&
                    photoIndex < photos.length - 1 && (

                        <button
                            className="restaurant-photo-arrow restaurant-photo-arrow-right"
                            type="button"
                            aria-label="다음 사진"
                            onClick={(e) =>
                                movePhoto(e, 1)
                            }
                        >
                            ›
                        </button>

                    )}


                {/* =========================
                    저장
                ========================= */}

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


                    {/* =========================
                        리뷰 왼쪽 화살표
                    ========================= */}

                    {reviews.length > 1 &&
                        reviewIndex > 0 && (

                            <button
                                className="restaurant-review-arrow restaurant-review-arrow-left"
                                type="button"
                                aria-label="이전 리뷰"
                                onClick={(e) =>
                                    moveReview(e, -1)
                                }
                            >
                                ‹
                            </button>

                        )}


                    {/* =========================
                        리뷰 오른쪽 화살표
                    ========================= */}

                    {reviews.length > 1 &&
                        reviewIndex < reviews.length - 1 && (

                            <button
                                className="restaurant-review-arrow restaurant-review-arrow-right"
                                type="button"
                                aria-label="다음 리뷰"
                                onClick={(e) =>
                                    moveReview(e, 1)
                                }
                            >
                                ›
                            </button>

                        )}

                </div>

            </div>

        </article>
    )
}