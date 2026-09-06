import { useEffect, useRef, useState } from 'react'
import '../css/RestaurantPopup.css'
import { getToken } from '../api'

/*
 * 별점을 ★★★★☆ 형태의 문자열로 변환.
 * 0~5 범위를 벗어나거나 값이 없으면 0으로 처리한다.
 */
function renderStars(score) {
    const rounded = Math.min(
        5,
        Math.max(0, Math.round(Number(score) || 0))
    )

    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded)
}

// 리뷰 세부 별점 4항목 메타데이터
const DETAIL_SCORE_META = [
    {
        key: 'tasteScore',
        label: '맛',
        icon: '🍽️',
    },
    {
        key: 'portionScore',
        label: '양',
        icon: '🍚',
    },
    {
        key: 'valueScore',
        label: '값',
        icon: '💰',
    },
    {
        key: 'hygieneScore',
        label: '위생',
        icon: '🧼',
    },
]

export default function RestaurantPopup({
                                            restaurant,
                                            onClose,
                                        }) {
    const photosRef = useRef(null)
    const commentInputRef = useRef(null)
    const fileInputRef = useRef(null)

    const [photoIndex, setPhotoIndex] = useState(0)

    // 댓글
    const [commentText, setCommentText] = useState('')

    // 댓글 사진
    const [commentImages, setCommentImages] = useState([])

    // 기존 댓글
    const [reviews, setReviews] = useState([])

    // 사용자가 입력하는 세부 평점
    const [userScores, setUserScores] = useState({
        taste: 0,
        portion: 0,
        value: 0,
        hygiene: 0,
    })

    useEffect(() => {
        // 아래 ③의 코드
    }, [
        restaurant?.id,
        restaurant?.googlePlaceId,
    ])

    if (!restaurant) return null

    const photos = Array.isArray(restaurant.photos)
        ? restaurant.photos
        : restaurant.photoUrl
            ? [restaurant.photoUrl]
            : []

    const tags = Array.isArray(restaurant.tags)
        ? restaurant.tags
        : []

    const totalScore =
        restaurant.totalScore ??
        restaurant.rating ??
        0

    /*
     * 식당 변경 시 초기화
     */
    useEffect(() => {
        setPhotoIndex(0)
        setCommentText('')
        setCommentImages([])

        setUserScores({
            taste: 0,
            portion: 0,
            value: 0,
            hygiene: 0,
        })

        if (photosRef.current) {
            photosRef.current.scrollLeft = 0
        }

        if (commentInputRef.current) {
            commentInputRef.current.style.height = 'auto'
        }

        const loadReviews = async () => {
            const restaurantId =
                restaurant?.id ??
                restaurant?.googlePlaceId

            if (!restaurantId) {
                setReviews([])
                return
            }

            try {
                const token = getToken()

                const response = await fetch(
                    `/api/restaurants/${restaurantId}/reviews`,
                    {
                        headers: {
                            ...(token
                                ? {
                                    Authorization: `Bearer ${token}`,
                                }
                                : {}),
                        },
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    console.error(
                        '리뷰 불러오기 실패:',
                        response.status
                    )

                    setReviews([])
                    return
                }

                const data = await response.json()

                console.log(
                    '리뷰 불러오기 성공:',
                    data
                )

                setReviews(
                    Array.isArray(data)
                        ? data
                        : []
                )
            } catch (error) {
                console.error(
                    '리뷰 불러오기 오류:',
                    error
                )

                setReviews([])
            }
        }

        loadReviews()
    }, [
        restaurant?.id,
        restaurant?.googlePlaceId,
    ])

    /*
     * 메인 사진 스크롤
     */
    const handlePhotoScroll = () => {
        if (!photosRef.current) return

        const container = photosRef.current
        const width = container.clientWidth

        if (!width) return

        const index = Math.round(
            container.scrollLeft / width
        )

        setPhotoIndex(
            Math.max(
                0,
                Math.min(
                    index,
                    photos.length - 1
                )
            )
        )
    }

    /*
     * 메인 사진 이동
     */
    const movePhoto = (direction) => {
        if (!photosRef.current) return

        const nextIndex =
            photoIndex + direction

        if (
            nextIndex < 0 ||
            nextIndex >= photos.length
        ) {
            return
        }

        photosRef.current.scrollTo({
            left:
                nextIndex *
                photosRef.current.clientWidth,
            behavior: 'smooth',
        })

        setPhotoIndex(nextIndex)
    }

    /*
     * 댓글 입력
     * 글자가 많아지면 자동으로 높이 증가
     */
    const handleCommentChange = (e) => {
        const value = e.target.value

        setCommentText(value)

        const textarea = e.target

        textarea.style.height = 'auto'
        textarea.style.height =
            `${textarea.scrollHeight}px`
    }

    /*
     * 댓글 사진 추가
     */
    const handleCommentImages = (e) => {
        const files = Array.from(
            e.target.files || []
        )

        if (!files.length) return

        const imageFiles = files.filter(
            (file) =>
                file.type.startsWith('image/')
        )

        const newImages =
            imageFiles.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            }))

        setCommentImages((prev) => [
            ...prev,
            ...newImages,
        ])

        e.target.value = ''
    }

    /*
     * 댓글 사진 삭제
     */
    const removeCommentImage = (index) => {
        setCommentImages((prev) => {
            const target = prev[index]

            if (target?.url) {
                URL.revokeObjectURL(
                    target.url
                )
            }

            return prev.filter(
                (_, i) => i !== index
            )
        })
    }

    /*
     * 별점 선택
     *
     * 1 클릭 → 1점
     * 같은 별 다시 클릭 → 0.5점
     * 0.5점 상태에서 다시 클릭 → 0점
     */
    const handleScoreClick = (
        type,
        starIndex
    ) => {
        setUserScores((prev) => {
            const current = prev[type]

            let nextScore

            if (current === starIndex) {
                nextScore =
                    starIndex - 0.5
            } else if (
                current === starIndex - 0.5
            ) {
                nextScore = 0
            } else {
                nextScore = starIndex
            }

            return {
                ...prev,
                [type]: Math.max(
                    0,
                    nextScore
                ),
            }
        })
    }

    /*
     * 댓글 등록
     */
    const handleSubmitComment = async () => {
        const text =
            commentText.trim()

        const hasScore =
            Object.values(userScores)
                .some((score) => score > 0)

        // 아무것도 입력하지 않았으면 등록하지 않음
        if (
            !text &&
            commentImages.length === 0 &&
            !hasScore
        ) {
            return
        }

        const restaurantId =
            restaurant.id ??
            restaurant.googlePlaceId

        const formData = new FormData()

        formData.append(
            'content',
            text
        )

        formData.append(
            'tasteScore',
            String(userScores.taste)
        )

        formData.append(
            'portionScore',
            String(userScores.portion)
        )

        formData.append(
            'valueScore',
            String(userScores.value)
        )

        formData.append(
            'hygieneScore',
            String(userScores.hygiene)
        )

        commentImages.forEach((item) => {
            formData.append(
                'images',
                item.file
            )
        })

        try {
            const token = getToken()

            const response = await fetch(
                `/api/restaurants/${restaurantId}/reviews`,
                {
                    method: 'POST',
                    headers: {
                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`,
                            }
                            : {}),
                    },
                    body: formData,
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                const errorText =
                    await response.text()

                console.error(
                    '리뷰 등록 실패:',
                    response.status,
                    errorText
                )

                return
            }

            const result =
                await response.json()

            console.log(
                '리뷰 등록 성공:',
                result
            )

            // 새 리뷰를 화면에 바로 추가
            setReviews((prev) => [
                result,
                ...prev,
            ])

        } catch (error) {
            console.error(
                '리뷰 등록 중 오류:',
                error
            )

            return
        }

        /*
         * 입력창 초기화
         */
        setCommentText('')

        /*
         * 미리보기 URL 제거
         */
        commentImages.forEach((item) => {
            if (item.url) {
                URL.revokeObjectURL(
                    item.url
                )
            }
        })

        setCommentImages([])

        /*
         * 별점 초기화
         */
        setUserScores({
            taste: 0,
            portion: 0,
            value: 0,
            hygiene: 0,
        })

        /*
         * textarea 높이 초기화
         */
        if (
            commentInputRef.current
        ) {
            commentInputRef.current.style.height =
                'auto'
        }
    }

    /*
     * 리뷰 추천 / 비추천
     */
    const handleReaction = async (
        reviewId,
        type
    ) => {
        const token = getToken()

        if (!token) {
            alert('로그인 후 이용할 수 있어요.')
            return
        }

        try {
            const response = await fetch(
                `/api/reviews/${reviewId}/reaction`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type':
                            'application/json',
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        type,
                    }),
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                console.error(
                    '리뷰 반응 처리 실패:',
                    response.status
                )

                return
            }

            const summary = await response.json()

            console.log('리뷰 반응 결과:', summary)

            // 해당 리뷰만 최신 상태로 갱신
            setReviews((prev) =>
                prev.map((review) =>
                    review.id === reviewId
                        ? {
                            ...review,
                            likeCount:
                            summary.likeCount,
                            dislikeCount:
                            summary.dislikeCount,
                            myReaction:
                            summary.myReaction,
                        }
                        : review
                )
            )

        } catch (error) {
            console.error(
                '리뷰 반응 처리 중 오류:',
                error
            )
        }
    }

    const canSubmit =
        commentText.trim() ||
        commentImages.length > 0 ||
        Object.values(userScores)
            .some((score) => score > 0)

    return (
        <aside className="restaurant-popup">

            {/* =================================================
                상단 액션
            ================================================= */}

            <div className="restaurant-popup-actions">

                <button
                    className="restaurant-popup-save"
                    type="button"
                    aria-label="식당 저장"
                    title="식당 저장"
                >
                    ♡
                </button>

                <button
                    className="restaurant-popup-close"
                    type="button"
                    onClick={onClose}
                    aria-label="닫기"
                >
                    ×
                </button>

            </div>


            {/* =================================================
                식당 헤더
            ================================================= */}

            <div className="restaurant-popup-header">

                <h2>
                    {restaurant.name}
                </h2>

                <div className="restaurant-popup-category">
                    🍽️ {restaurant.category || '음식점'}
                </div>

                <div className="restaurant-total-rating">

                    <div className="restaurant-stars">
                        {renderStars(totalScore)}
                    </div>

                    <strong>
                        {Number(totalScore).toFixed(1)}
                    </strong>

                    <span>/ 5</span>

                </div>

                {restaurant.registeredAt && (
                    <div className="restaurant-registered-date">
                        등록일 {restaurant.registeredAt}
                    </div>
                )}

            </div>


            {/* =================================================
                메인 사진
            ================================================= */}

            {photos.length > 0 && (
                <div className="restaurant-popup-photo-wrapper">

                    <div
                        className="restaurant-popup-photos"
                        ref={photosRef}
                        onScroll={handlePhotoScroll}
                    >
                        {photos.map(
                            (photo, index) => (
                                <img
                                    key={index}
                                    src={photo}
                                    alt={`${restaurant.name} 사진 ${index + 1}`}
                                />
                            )
                        )}
                    </div>

                    {photos.length > 1 &&
                        photoIndex > 0 && (
                            <button
                                type="button"
                                className="restaurant-photo-arrow restaurant-photo-arrow-left"
                                onClick={() =>
                                    movePhoto(-1)
                                }
                                aria-label="이전 사진"
                            >
                                ‹
                            </button>
                        )}

                    {photos.length > 1 &&
                        photoIndex <
                        photos.length - 1 && (
                            <button
                                type="button"
                                className="restaurant-photo-arrow restaurant-photo-arrow-right"
                                onClick={() =>
                                    movePhoto(1)
                                }
                                aria-label="다음 사진"
                            >
                                ›
                            </button>
                        )}

                </div>
            )}


            {/* =================================================
                기본 정보
            ================================================= */}

            <div className="restaurant-popup-info">

                {restaurant.address && (
                    <div className="restaurant-info-row">
                        <span className="restaurant-info-label">
                            📍 주소
                        </span>

                        <span>
                            {restaurant.address}
                        </span>
                    </div>
                )}

                {restaurant.businessHours && (
                    <div className="restaurant-info-row">
                        <span className="restaurant-info-label">
                            🕐 영업시간
                        </span>

                        <span>
                            {restaurant.businessHours}
                        </span>
                    </div>
                )}

                {restaurant.breakTime && (
                    <div className="restaurant-info-row">
                        <span className="restaurant-info-label">
                            ☕ 브레이크타임
                        </span>

                        <span>
                            {restaurant.breakTime}
                        </span>
                    </div>
                )}

                {restaurant.cheapestMenu && (
                    <div className="restaurant-info-row">
                        <span className="restaurant-info-label">
                            🍴 가장 저렴한 메뉴
                        </span>

                        <span>
                            {restaurant.cheapestMenu}

                            {restaurant.cheapestPrice != null &&
                                ` $${restaurant.cheapestPrice}`}
                        </span>
                    </div>
                )}

            </div>


            {/* =================================================
                태그
            ================================================= */}

            {tags.length > 0 && (
                <div className="restaurant-tags">

                    {tags.map(
                        (tag, index) => (
                            <span
                                className="restaurant-tag"
                                key={index}
                            >
                                {tag}
                            </span>
                        )
                    )}

                </div>
            )}


            {/* =================================================
                리뷰 작성 영역
            ================================================= */}

            <section className="restaurant-review-section">

                <div className="restaurant-review-title">

                    <h3>
                        댓글
                        <span>
                            {reviews.length}
                        </span>
                    </h3>

                </div>


                {/* =================================================
                    사용자 별점
                ================================================= */}

                <div className="restaurant-user-score-list">

                    <ScorePicker
                        label="맛"
                        score={userScores.taste}
                        onSelect={(star) =>
                            handleScoreClick(
                                'taste',
                                star
                            )
                        }
                    />

                    <ScorePicker
                        label="양"
                        score={userScores.portion}
                        onSelect={(star) =>
                            handleScoreClick(
                                'portion',
                                star
                            )
                        }
                    />

                    <ScorePicker
                        label="값"
                        score={userScores.value}
                        onSelect={(star) =>
                            handleScoreClick(
                                'value',
                                star
                            )
                        }
                    />

                    <ScorePicker
                        label="위생"
                        score={userScores.hygiene}
                        onSelect={(star) =>
                            handleScoreClick(
                                'hygiene',
                                star
                            )
                        }
                    />

                </div>


                {/* =================================================
                    댓글 입력
                ================================================= */}

                <div className="restaurant-comment-form">

                    <div className="restaurant-comment-input-box">

                        <textarea
                            ref={commentInputRef}
                            className="restaurant-comment-input"
                            value={commentText}
                            onChange={
                                handleCommentChange
                            }
                            placeholder="이 식당에 대한 댓글을 남겨주세요."
                            rows={1}
                        />

                        <div className="restaurant-comment-input-actions">

                            <button
                                type="button"
                                className="restaurant-comment-photo-btn"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                aria-label="사진 추가"
                                title="사진 추가"
                            >
                                📷
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={
                                    handleCommentImages
                                }
                            />

                            <button
                                type="button"
                                className="restaurant-comment-submit"
                                onClick={
                                    handleSubmitComment
                                }
                                disabled={!canSubmit}
                            >
                                등록
                            </button>

                        </div>

                    </div>


                    {/* 첨부 이미지 */}

                    {commentImages.length > 0 && (
                        <div className="restaurant-comment-images">

                            {commentImages.map(
                                (image, index) => (
                                    <div
                                        className="restaurant-comment-image"
                                        key={`${image.url}-${index}`}
                                    >

                                        <img
                                            src={image.url}
                                            alt={`첨부 사진 ${index + 1}`}
                                        />

                                        <button
                                            type="button"
                                            className="restaurant-comment-image-remove"
                                            onClick={() =>
                                                removeCommentImage(
                                                    index
                                                )
                                            }
                                            aria-label="사진 삭제"
                                        >
                                            ×
                                        </button>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>


                {/* =================================================
                    기존 댓글
                ================================================= */}

                <div className="restaurant-comments">

                    {reviews.length > 0 ? (

                        reviews.map(
                            (review, index) => {

                                const reviewKey =
                                    review.id ?? index

                                const hasDetailScores =
                                    DETAIL_SCORE_META.some(
                                        (meta) =>
                                            review[meta.key] != null
                                    )

                                return (
                                    <div
                                        className="restaurant-comment"
                                        key={reviewKey}
                                    >

                                        {/* 프로필 */}

                                        <div className="restaurant-comment-profile">

                                            {review.profileImage ? (
                                                <img
                                                    src={
                                                        review.profileImage
                                                    }
                                                    alt={
                                                        review.nickname ||
                                                        '사용자'
                                                    }
                                                />
                                            ) : (
                                                <div className="restaurant-comment-avatar">
                                                    👤
                                                </div>
                                            )}

                                        </div>


                                        {/* 리뷰 내용 */}

                                        <div className="restaurant-comment-body">

                                            <strong>
                                                {review.nickname ||
                                                    '익명'}
                                            </strong>


                                            {/* 총점 */}

                                            {review.rating != null &&
                                                review.rating > 0 && (
                                                    <div className="restaurant-comment-rating">

                                                        <span className="restaurant-comment-rating-stars">
                                                            {renderStars(
                                                                review.rating
                                                            )}
                                                        </span>

                                                        <b className="restaurant-comment-rating-number">
                                                            {Number(
                                                                review.rating
                                                            ).toFixed(1)}
                                                        </b>

                                                    </div>
                                                )}


                                            {/* 세부 별점 */}

                                            {hasDetailScores && (
                                                <div className="restaurant-comment-detail-scores">

                                                    {DETAIL_SCORE_META.map(
                                                        (meta) => {

                                                            const value =
                                                                review[
                                                                    meta.key
                                                                    ]

                                                            if (
                                                                value ==
                                                                null ||
                                                                value <= 0
                                                            ) {
                                                                return null
                                                            }

                                                            return (
                                                                <span
                                                                    className="restaurant-comment-score-chip"
                                                                    key={
                                                                        meta.key
                                                                    }
                                                                >

                                                                    <span className="restaurant-comment-score-chip-icon">
                                                                        {
                                                                            meta.icon
                                                                        }
                                                                    </span>

                                                                    <span className="restaurant-comment-score-chip-label">
                                                                        {
                                                                            meta.label
                                                                        }
                                                                    </span>

                                                                    <span className="restaurant-comment-score-chip-stars">
                                                                        {renderStars(
                                                                            value
                                                                        )}
                                                                    </span>

                                                                    <span className="restaurant-comment-score-chip-value">
                                                                        {Number(
                                                                            value
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                    </span>

                                                                </span>
                                                            )
                                                        }
                                                    )}

                                                </div>
                                            )}


                                            {/* 댓글 텍스트 */}

                                            {(
                                                review.content ??
                                                review.comment ??
                                                review.text
                                            ) && (
                                                <p>
                                                    {review.content ??
                                                        review.comment ??
                                                        review.text}
                                                </p>
                                            )}


                                            {/* 날짜 */}

                                            {(
                                                review.date ||
                                                review.createdAt
                                            ) && (
                                                <span className="restaurant-comment-date">
                                                    {review.date ||
                                                        review.createdAt}
                                                </span>
                                            )}


                                            {/* 리뷰 사진 */}

                                            {Array.isArray(
                                                    review.imageUrls
                                                ) &&
                                                review.imageUrls.length >
                                                0 && (
                                                    <div className="restaurant-comment-review-images">

                                                        {review.imageUrls.map(
                                                            (
                                                                imageUrl,
                                                                imageIndex
                                                            ) => (
                                                                <img
                                                                    key={
                                                                        imageIndex
                                                                    }
                                                                    src={
                                                                        imageUrl
                                                                    }
                                                                    alt={`리뷰 사진 ${imageIndex + 1}`}
                                                                />
                                                            )
                                                        )}

                                                    </div>
                                                )}


                                            {/* 도움돼요 / 도움 안돼요 */}

                                            {review.id != null && (
                                                <div className="restaurant-comment-reactions">

                                                    {review.mine ? (
                                                        <>
                <span className="restaurant-comment-reaction-count">
                    👍 {review.likeCount ?? 0}
                </span>

                                                            <span className="restaurant-comment-reaction-count">
                    👎 {review.dislikeCount ?? 0}
                </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={
                                                                    `restaurant-comment-reaction-btn ${
                                                                        review.myReaction === 'LIKE'
                                                                            ? 'active-like'
                                                                            : ''
                                                                    }`
                                                                }
                                                                onClick={() =>
                                                                    handleReaction(
                                                                        review.id,
                                                                        'LIKE'
                                                                    )
                                                                }
                                                                aria-label="도움이 됐어요"
                                                            >
                                                                👍 도움돼요{' '}
                                                                {review.likeCount ?? 0}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className={
                                                                    `restaurant-comment-reaction-btn ${
                                                                        review.myReaction === 'DISLIKE'
                                                                            ? 'active-dislike'
                                                                            : ''
                                                                    }`
                                                                }
                                                                onClick={() =>
                                                                    handleReaction(
                                                                        review.id,
                                                                        'DISLIKE'
                                                                    )
                                                                }
                                                                aria-label="도움이 안됐어요"
                                                            >
                                                                👎{' '}
                                                                {review.dislikeCount ?? 0}
                                                            </button>
                                                        </>
                                                    )}

                                                </div>
                                            )}

                                        </div>

                                    </div>
                                )
                            }
                        )

                    ) : (
                        <div className="restaurant-no-comments">
                            아직 등록된 댓글이 없어요.
                        </div>
                    )}

                </div>

            </section>

        </aside>
    )
}


/* =========================================================
   사용자 별점 선택기
========================================================= */

function ScorePicker({
                         label,
                         score,
                         onSelect,
                     }) {
    return (
        <div className="restaurant-user-score-row">

            <span className="restaurant-user-score-label">
                {label}
            </span>

            <div className="restaurant-score-picker">

                {[1, 2, 3, 4, 5].map(
                    (star) => {

                        let type = 'empty'

                        if (
                            score >= star
                        ) {
                            type = 'full'
                        } else if (
                            score >=
                            star - 0.5
                        ) {
                            type = 'half'
                        }

                        return (
                            <button
                                key={star}
                                type="button"
                                className={`restaurant-picker-star ${type}`}
                                onClick={() =>
                                    onSelect(star)
                                }
                                aria-label={`${label} ${star}점`}
                            >
                                ★
                            </button>
                        )
                    }
                )}

            </div>

            <span className="restaurant-user-score-number">
                {score.toFixed(1)}
            </span>

        </div>
    )
}