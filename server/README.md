# 평점 API (Railway)

로그인 없이 브라우저 `voterId` 기준, 덱당 1표. 목록에는 **평균**, 팝업에서는 **내 점수**를 매깁니다.

권장 도메인:

- 사이트: `https://samdeck.xyz`
- API: `https://api.samdeck.xyz`

## Railway 설정

1. 프로젝트에 **PostgreSQL** 추가
2. API용 서비스 추가 후 Root Directory를 `server` 로 지정
3. API 서비스 Variables:
   - `DATABASE_URL` = Postgres `DATABASE_URL` 참조
   - `CORS_ORIGINS` = `https://samdeck.xyz,https://serengrintf.github.io,http://localhost:5173`
4. Networking → Custom Domain에 **`api.samdeck.xyz`** 등록 (루트 `samdeck.xyz`는 사이트용)
5. 프론트:

```env
VITE_RATINGS_API_URL=https://api.samdeck.xyz
```

## 로컬 실행

```bash
cd server
npm install
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
npm run smoke
```

## API

- `GET /` — 안내 페이지
- `GET /health`
- `GET /ratings?deckIds=id1,id2` + 헤더 `X-Voter-Id`
- `PUT /ratings/:deckId` body `{ "score": 4 }` 또는 `{ "score": null }` + `X-Voter-Id`  
  (점수는 **1~5 정수**)
