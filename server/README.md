# 평점 API (Railway)

로그인 없이 브라우저 `voterId` 기준, 덱당 1표. 목록에는 **평균**, 팝업에서는 **내 점수**를 매깁니다.

## Railway 설정

1. 프로젝트에 **PostgreSQL** 추가
2. API용 서비스 추가 후 Root Directory를 `server` 로 지정 (모노레포인 경우)
3. API 서비스 Variables:
   - `DATABASE_URL` = Postgres 서비스의 `DATABASE_URL` 참조
   - `CORS_ORIGINS` = `http://localhost:5173,https://your-frontend.example` (쉼표 구분)
   - `PORT` = Railway가 자동 주입 (직접 안 넣어도 됨)
4. Settings → Networking → **Generate Domain** → Public URL 복사
5. 프론트 `.env` / `.env.local`:

```env
VITE_RATINGS_API_URL=https://YOUR-API.up.railway.app
```

## 로컬 실행

```bash
cd server
npm install
# 로컬 Postgres 또는 Railway Proxy URL
set DATABASE_URL=postgres://...
set CORS_ORIGINS=http://localhost:5173
set PGSSL=0
npm run dev
```

DB 없이 스모크만:

```bash
set MEMORY_STORE=1
set CORS_ORIGINS=http://localhost:5173
npm start
# 다른 터미널
npm run smoke
```

## API

- `GET /health`
- `GET /ratings?deckIds=id1,id2` + 헤더 `X-Voter-Id`
- `PUT /ratings/:deckId` body `{ "score": 4.5 }` 또는 `{ "score": null }` (삭제) + `X-Voter-Id`
