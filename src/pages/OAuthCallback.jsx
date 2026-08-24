import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setToken } from '../api'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setError('로그인 응답에 토큰이 없습니다. 백엔드 리다이렉트 설정을 확인해주세요.')
      return
    }

    setToken(token)
    navigate('/', { replace: true })
  }, [searchParams, navigate])

  return (
    <div className="screen">
      <div className="card">
        {error ? (
          <>
            <p className="error-text">{error}</p>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              처음으로
            </button>
          </>
        ) : (
          <>
            <div className="spinner" />
            <p className="state-text">로그인 처리 중이에요...</p>
          </>
        )}
      </div>
    </div>
  )
}
