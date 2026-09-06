import { useEffect, useState } from 'react'
import { getToken, fetchMe, searchRestaurants } from '../api'
import '../css/RestaurantCreatePopup.css'

export default function RestaurantCreatePopup({ onClose, onSubmit }) {
    const [restaurantName, setRestaurantName] = useState('')
    const [breakTime, setBreakTime] = useState('')

    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)

    const [categories, setCategories] = useState({
        rice: false,
        bread: false,
        noodles: false,
        soup: false,
        salad: false,
        coffee: false,
        australia: false,
        korea: true,
        japan: false,
        india: false,
        usa: false,
    })

    const [menus, setMenus] = useState([
        {
            name: '',
            price: '',
        },
    ])

    const [tags, setTags] = useState([])
    const [photos, setPhotos] = useState([])

    const [hasToken, setHasToken] = useState(false)
    const [nickname, setNickname] = useState('')

    const tagOptions = ['할랄', '비건', '온리 런치']

    const categoryLabels = {
        rice: '밥',
        bread: '빵',
        noodles: '면',
        soup: '탕',
        salad: '샐러드',
        coffee: '커피',
        australia: '호주',
        korea: '한식',
        japan: '일식',
        india: '인도',
        usa: '미국',
    }

    const toggleCategory = (category) => {
        setCategories(prev => ({
            ...prev,
            [category]: !prev[category],
        }))
    }

    const handleMenuChange = (index, field, value) => {
        setMenus(prev =>
            prev.map((menu, i) =>
                i === index
                    ? { ...menu, [field]: value }
                    : menu
            )
        )
    }

    const addMenu = () => {
        setMenus(prev => [
            ...prev,
            {
                name: '',
                price: '',
            },
        ])
    }

    const toggleTag = (tag) => {
        setTags(prev =>
            prev.includes(tag)
                ? prev.filter(item => item !== tag)
                : [...prev, tag]
        )
    }

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files || [])

        setPhotos(prev => [
            ...prev,
            ...files,
        ])

        e.target.value = ''
    }

    const handleRestaurantSearch = async () => {
        const keyword = restaurantName.trim()

        if (!keyword) {
            alert('식당 이름을 입력해주세요.')
            return
        }

        setSearching(true)
        setSearchResults([])

        try {
            const result = await searchRestaurants({
                keyword,
                radius: 1500,
            })

            setSearchResults(
                Array.isArray(result) ? result : []
            )
        } catch (error) {
            console.error('식당 검색 실패:', error)

            if (error.message === 'UNAUTHORIZED') {
                alert('로그인이 필요합니다.')
                return
            }

            alert(
                error.message ||
                '식당 검색에 실패했습니다. 잠시 후 다시 시도해주세요.'
            )
        } finally {
            setSearching(false)
        }
    }

    const handleSelectRestaurant = (restaurant) => {
        setSelectedRestaurant(restaurant)
        setRestaurantName(restaurant.name || '')
        setSearchResults([])
    }

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleRestaurantSearch()
        }
    }

    const handleSubmit = () => {
        if (!restaurantName.trim()) {
            alert('식당 이름을 입력해주세요.')
            return
        }

        if (!selectedRestaurant) {
            alert('식당 검색 후 검색 결과에서 식당을 선택해주세요.')
            return
        }

        const validMenus = menus.filter(
            menu =>
                menu.name.trim() !== '' &&
                String(menu.price).trim() !== ''
        )

        if (validMenus.length === 0) {
            alert('메뉴를 최소 1개 이상 입력해주세요.')
            return
        }

        const hasInvalidMenu = validMenus.some(
            menu =>
                Number.isNaN(Number(menu.price)) ||
                Number(menu.price) <= 0
        )

        if (hasInvalidMenu) {
            alert('메뉴 가격을 올바르게 입력해주세요.')
            return
        }

        if (photos.length < 2) {
            alert('사진을 최소 2장 업로드해주세요.')
            return
        }

        const selectedCategories = Object.entries(categories)
            .filter(([, checked]) => checked)
            .map(([key]) => categoryLabels[key])

        const data = {
            restaurantId: selectedRestaurant.id ?? null,
            name: selectedRestaurant.name || restaurantName.trim(),
            address: selectedRestaurant.address || '',
            latitude: selectedRestaurant.latitude ?? null,
            longitude: selectedRestaurant.longitude ?? null,
            breakTime: breakTime.trim(),
            categories: selectedCategories,
            menus: validMenus.map(menu => ({
                name: menu.name.trim(),
                price: Number(menu.price),
            })),
            tags,
            photos,
        }

        console.log('식당 등록 데이터:', data)

        if (onSubmit) {
            onSubmit(data)
        }
    }

    useEffect(() => {
        const tokenExists = Boolean(getToken())
        setHasToken(tokenExists)

        if (tokenExists) {
            fetchMe()
                .then(me => {
                    setNickname(me.nickname || '')
                })
                .catch(() => {
                    setNickname('')
                })
        }
    }, [])

    return (
        <div className="restaurant-create-overlay">

            <aside className="restaurant-create-popup">

                <button
                    className="restaurant-popup-close"
                    type="button"
                    onClick={onClose}
                    aria-label="닫기"
                >
                    ×
                </button>

                <h1 className="restaurant-create-title">
                    {nickname} 님
                </h1>

                <div className="create-search-row">
                    <input
                        type="text"
                        placeholder="식당 이름으로 검색"
                        value={restaurantName}
                        onChange={e => {
                            setRestaurantName(e.target.value)
                            setSelectedRestaurant(null)
                            setSearchResults([])
                        }}
                        onKeyDown={handleSearchKeyDown}
                    />

                    <button
                        type="button"
                        onClick={handleRestaurantSearch}
                        disabled={searching}
                    >
                        {searching ? '...' : '🔍'}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="restaurant-search-results">
                        {searchResults.map(restaurant => {
                            const key =
                                restaurant.id ??
                                restaurant.googlePlaceId

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className="restaurant-search-result"
                                    onClick={() =>
                                        handleSelectRestaurant(restaurant)
                                    }
                                >
                                    <strong>
                                        {restaurant.name || '이름 없음'}
                                    </strong>

                                    {restaurant.address && (
                                        <span>
                                            {restaurant.address}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}

                <div className="restaurant-create-info">
                    {selectedRestaurant ? (
                        <>
                            <strong>
                                {selectedRestaurant.name}
                            </strong>

                            {selectedRestaurant.address && (
                                <>
                                    {' · '}
                                    {selectedRestaurant.address}
                                </>
                            )}
                        </>
                    ) : (
                        '식당 이름으로 검색한 후 식당을 선택해주세요.'
                    )}
                </div>

                <input
                    className="create-full-input"
                    type="text"
                    placeholder="브레이크타임 작성하기 (선택)"
                    value={breakTime}
                    onChange={e =>
                        setBreakTime(e.target.value)
                    }
                />

                <section className="create-section">
                    <h2>카테고리</h2>

                    <div className="category-grid">

                        <Category
                            checked={categories.rice}
                            onClick={() => toggleCategory('rice')}
                            label="🍚 밥"
                        />

                        <Category
                            checked={categories.bread}
                            onClick={() => toggleCategory('bread')}
                            label="🥖 빵"
                        />

                        <Category
                            checked={categories.noodles}
                            onClick={() => toggleCategory('noodles')}
                            label="🍜 면"
                        />

                        <Category
                            checked={categories.soup}
                            onClick={() => toggleCategory('soup')}
                            label="🍲 탕"
                        />

                        <Category
                            checked={categories.salad}
                            onClick={() => toggleCategory('salad')}
                            label="🥗 샐러드"
                        />

                        <Category
                            checked={categories.coffee}
                            onClick={() => toggleCategory('coffee')}
                            label="☕ 커피"
                        />

                        <Category
                            checked={categories.australia}
                            onClick={() => toggleCategory('australia')}
                            label="🇦🇺"
                        />

                        <Category
                            checked={categories.korea}
                            onClick={() => toggleCategory('korea')}
                            label="🇰🇷"
                        />

                        <Category
                            checked={categories.japan}
                            onClick={() => toggleCategory('japan')}
                            label="🇯🇵"
                        />

                        <Category
                            checked={categories.india}
                            onClick={() => toggleCategory('india')}
                            label="🇮🇳"
                        />

                        <Category
                            checked={categories.usa}
                            onClick={() => toggleCategory('usa')}
                            label="🇺🇸"
                        />

                        <button
                            type="button"
                            className="category-add-button"
                        >
                            +
                        </button>

                    </div>
                </section>

                <section className="create-section">
                    <h2>메뉴 & 가격</h2>

                    {menus.map((menu, index) => (
                        <div
                            className="menu-price-row"
                            key={index}
                        >
                            <input
                                type="text"
                                placeholder="메뉴명 작성하기"
                                value={menu.name}
                                onChange={e =>
                                    handleMenuChange(
                                        index,
                                        'name',
                                        e.target.value
                                    )
                                }
                            />

                            <input
                                type="number"
                                placeholder="가격 작성하기"
                                value={menu.price}
                                onChange={e =>
                                    handleMenuChange(
                                        index,
                                        'price',
                                        e.target.value
                                    )
                                }
                            />

                            {index === 0 && (
                                <button
                                    type="button"
                                    className="menu-confirm-button"
                                    onClick={addMenu}
                                >
                                    확정
                                </button>
                            )}
                        </div>
                    ))}

                    <p className="create-description">
                        메뉴와 가격을 작성하고 확정을 누르면 이곳에 뜹니다.
                        여러개를 작성할 수도 있습니다.
                    </p>
                </section>

                <section className="create-section">
                    <h2>기타(선택)</h2>

                    <div className="tag-list">
                        {tagOptions.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                className={
                                    `create-tag ${
                                        tags.includes(tag)
                                            ? 'selected'
                                            : ''
                                    }`
                                }
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}

                        <button
                            type="button"
                            className="create-tag"
                        >
                            +
                        </button>
                    </div>

                    <p className="create-description">
                        해당되는 태그를 선택하세요.
                        만약 해당되는 태그가 없다면 +버튼을 눌러서 추가해주세요.
                    </p>
                </section>

                <section className="create-photo-section">

                    <label
                        htmlFor="restaurant-photo"
                        className="photo-upload-button"
                    >
                        사진 업로드 하기 (최소 2장)
                    </label>

                    <input
                        id="restaurant-photo"
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handlePhotoUpload}
                    />

                    {photos.length > 0 && (
                        <div className="photo-preview-list">
                            {photos.map((photo, index) => (
                                <div
                                    className="photo-preview"
                                    key={index}
                                >
                                    {photo.name}
                                </div>
                            ))}
                        </div>
                    )}

                </section>

                <div className="create-notice">
                    *안내사항을 위한 자리.<br />
                </div>

                <div className="create-button-row">

                    <button
                        type="button"
                        className="create-cancel-button"
                        onClick={onClose}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        className="create-submit-button"
                        onClick={handleSubmit}
                    >
                        등록
                    </button>

                </div>

            </aside>
        </div>
    )
}

function Category({ checked, onClick, label }) {
    return (
        <button
            type="button"
            className="category-item"
            onClick={onClick}
        >
            <span
                className={`category-checkbox ${
                    checked ? 'checked' : ''
                }`}
            >
                {checked ? '✓' : ''}
            </span>

            <span>{label}</span>
        </button>
    )
}