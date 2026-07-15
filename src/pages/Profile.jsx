import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken, fetchMe } from '../api'

export default function Profile() {
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then(setMe)
      .catch((e) => {
        if (e.message === 'UNAUTHORIZED') {
          navigate('/', { replace: true })
          return
        }
        setError('내 정보를 불러오지 못했습니다. 서버가 켜져 있는지 확인해주세요.')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  function handleLogout() {
    clearToken()
    navigate('/', { replace: true })
  }

  return (
    <div className="screen">
      <div className="card">
        <p className="eyebrow">DB 연동 확인</p>

        {loading && (
          <>
            <div className="spinner" />
            <p className="state-text">불러오는 중...</p>
          </>
        )}

        {!loading && error && <p className="error-text">{error}</p>}

        {!loading && me && (
          <>
            <span className="badge">
              <span className="dot" />
              {me.nickname}
            </span>
            <div style={{ marginBottom: 24 }}>
              <div className="field">
                <span className="field-label">user_id</span>
                <span className="field-value">{me.id}</span>
              </div>
              <div className="field">
                <span className="field-label">nickname</span>
                <span className="field-value">{me.nickname}</span>
              </div>
            </div>
            <p className="sub" style={{ marginBottom: 12 }}>
              이 정보가 보인다면 구글 로그인 → 서버 저장 → DB 조회까지 전체 흐름이 정상 동작하는 겁니다.
            </p>
          </>
        )}

        <button className="btn-secondary" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  )
}
