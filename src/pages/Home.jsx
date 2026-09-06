import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getToken, googleLoginUrl, fetchMe } from '../api'
import '../css/home.css';
import logo from "../images/logo_temp.png";

export default function Home() {
  const navigate = useNavigate()
  const [hasToken, setHasToken] = useState(false)
    const [nickname, setNickname] = useState('')

    useEffect(() => {
        const tokenExists = Boolean(getToken())

        setHasToken(tokenExists)

        if (tokenExists) {
            fetchMe()
                .then((me) => {
                    setNickname(me.nickname)
                })
                .catch(() => {
                    setNickname('')
                })
        }
    }, [])

    useEffect(() => {
        if (!hasToken) return

        const timer = setTimeout(() => {
            navigate('/map')
        }, 5000) //5000

        return () => clearTimeout(timer)
    }, [hasToken, navigate])

  return (

    <div className="screen_home">

      <div className={`screen ${hasToken ? 'home-welcome-screen' : ''}`}>
          <div className="screen-container">
          {!hasToken ? (
              <>
                  <img src={logo} alt="로고" className="home-logo" />
                  <h1>헝그리 워커</h1>
                  <div className="home-actions">
                      <a className="home-action home-login" href={googleLoginUrl()}>
                          이미 회원이신가요?{' '}
                          <span className="home-login-text">&nbsp;로그인 하기</span></a>
                      <a className="home-action home-google" href={googleLoginUrl()}>
                          <GoogleIcon/> Google 계정으로 회원 가입하기 </a>

                      <button className="home-action home-secondary" onClick={() => navigate('/map')}>
                          🗺️ 지도에서 맛집 보기
                      </button>
                  </div>
              </>
          ) : (
              <div className="home-welcome-content">
                  <svg width="500" height="150" viewBox="0 0 500 150">
                    {/* 곡선 경로 정의 (가이드라인 선 제거를 위해 fill, stroke 설정) */}
                  <path id="curvePath" d="M 50 150 Q 250 20 450 150" />

                  {/* 곡선을 따라 흐르는 텍스트 (SVG 전용 스타일 사용) */}
                  <text className="home-welcome-message">
                      <textPath href="#curvePath" startOffset="50%" textAnchor="middle">
                          환영합니다, {nickname || '사용자'}님!
                      </textPath>
                  </text>
              </svg>
                  <div className="home-welcome-animal">
                      <img src="../images/animal.png" alt="환영하는 동물"/>
                  </div>
              </div>
          )}
          </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: 999,
                background: '#fff',
                color: '#22281f',
                fontFamily: 'Fraunces, serif',
                fontWeight: 700,
                fontSize: 12,
            }}
            aria-hidden="true"
        >
      G
    </span>
    )
}
