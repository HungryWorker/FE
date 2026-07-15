# HungryWorker FE (연동 테스트용)

구글 로그인 → 백엔드 저장 → DB 확인까지 눈으로 보기 위한 최소한의 React 앱입니다.

## 실행

```bash
npm install
npm run dev
```

기본적으로 `http://localhost:3000`에서 뜹니다. (백엔드 `application.yml`의
`app.oauth2.redirect-uri` 기본값이 `http://localhost:3000/oauth/callback`이라
포트를 3000으로 고정해뒀어요.)

## 사전 조건

1. 백엔드가 `http://localhost:8080`에서 떠 있어야 합니다 (colima/Docker 켜져 있어야 함).
2. 백엔드에 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET` 환경변수가 설정돼 있어야 합니다.
3. Google Cloud Console의 "승인된 리디렉션 URI"에
   `http://localhost:8080/login/oauth2/code/google`가 등록돼 있어야 합니다.

## 흐름

1. `/` 에서 "구글로 로그인" 클릭 → `http://localhost:8080/oauth2/authorization/google`로 이동
2. 구글 로그인 완료 → 백엔드가 `http://localhost:3000/oauth/callback?token=...`로 리다이렉트
3. `/oauth/callback`이 토큰을 `localStorage`에 저장하고 `/profile`로 이동
4. `/profile`이 `GET /api/users/me`를 호출해서 DB에 저장된 `id`, `nickname`을 화면에 표시

닉네임이 `배고픈{동물}#{4자리}` 형식으로 뜨면 회원가입 → DB 저장까지 정상 동작한 것입니다.

## 백엔드 API 주소를 바꾸고 싶다면

프로젝트 루트에 `.env` 파일을 만들어서:

```
VITE_API_BASE_URL=http://localhost:8080
```
