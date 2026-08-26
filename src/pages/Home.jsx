import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, googleLoginUrl } from '../api'
import '../css/home.css';
import logo from "../image/logo_temp.png";

export default function Home() {
  const navigate = useNavigate()
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    setHasToken(Boolean(getToken()))
  }, [])

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
