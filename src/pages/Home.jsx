import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getToken, googleLoginUrl, fetchMe } from '../api'
import '../css/home.css';
import logo from "../image/logo_temp.png";

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
        }, 5000)

        return () => clearTimeout(timer)
    }, [hasToken, navigate])

  return (

    <div className="screen_home">
        <div>
            <img src={logo} alt="로고" className="logo_home" />
            <a className="btn-google_home" href={googleLoginUrl()}>
                <GoogleIcon/>
                Google 계정으로 로그인 하기
            </a>
        </div>
        {/*
      <div className="card">

        <p className="eyebrow">Hungry Worker</p>
        <h1>배고픈 우리를 위한 맛집 지도</h1>
        <p className="sub">
          구글 계정으로 로그인하면 서버에 회원 정보가 자동으로 저장됩니다.
          로그인 후 내 정보 화면에서 DB에 저장된 닉네임을 바로 확인할 수 있어요.
        </p>

        <a className="btn-google" href={googleLoginUrl()}>
          <GoogleIcon />
          Google 계정으로 로그인 하기
        </a>

          <button className="btn-secondary" onClick={() => navigate('/map')}>
              🗺️ 지도에서 맛집 보기
          </button>

        {hasToken && (
          <button className="btn-secondary" onClick={() => navigate('/profile')}>
            이미 로그인했어요, 내 정보 보기
          </button>
        )}
      </div>
      */}
    </div>

      <div className={`screen ${hasToken ? 'home-welcome-screen' : ''}`}>

          {!hasToken ? (
              <>
                  <div className="home-logo">로고</div>
                  <h1>회원 가입</h1>
                  <div className="home-actions">
                      <a className="home-action home-login" href={googleLoginUrl()}>
                          이미 회원이신가요?{' '}
                          <span className="home-login-text">로그인 하기</span></a>
                      <a className="home-action home-google" href={googleLoginUrl()}>
                          <GoogleIcon/> Google 계정으로 회원 가입하기 </a>
                      <button className="home-action home-secondary" onClick={() => navigate('/map')}>
                          🗺️ 지도에서 맛집 보기
                      </button>
                  </div>
              </>
          ) : (
              <div className="home-welcome-content">
                  <div className="home-welcome-message">
                      환영합니다, <strong>{nickname}!</strong>
                  </div>
                  <div className="home-welcome-animal">
                      <img src="../images/animal.png" alt="환영하는 동물"/>
                  </div>
              </div>
          )}
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
