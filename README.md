# 천하결전 · 장수 조합

보유 장수(·전법)로 **세트를 추천**하는 가벼운 웹 앱입니다.

## 시즌

현재 데이터는 **시즌 2(S2)** 입니다.

- 시즌 목록: `src/data/seasons.ts` (`enabled: true` 로 열기)
- 새 시즌: `src/data/decks/s3/` 추가 후 `decks/index.ts`에 합치기

## 구성 규칙

1. **1덱** = 장수 3명, 각 장수 전법 2칸 (필수 → 대체 풀)
2. **전법은 세트 안에서 1회만** 착용
3. **1세트** = 장수·전법이 **서로 겹치지 않는 덱 5개**
4. 병법은 덱에 표시 (겹침 검사는 전법·장수만)

## 데이터 파일 구조

```
src/data/
  seasons.ts          # 시즌 on/off
  normalize.ts        # 표기 정규화 (띄어쓰기 등)
  helpers.ts          # mem() · 장수 메타 · 목록 자동 수집
  generals.ts         # 보유 장수 (덱에서 자동)
  skills.ts           # 보유 전법 (덱에서 자동)
  doctrines.ts        # 병법 (덱에서 자동)
  decks/
    index.ts          # 전체 합본
    s2/
      index.ts
      tier1.ts         # ← S2 1티어 덱 추가 위치
      tier2.ts         # ← S2 2티어 덱 추가 위치
```

### 덱 추가 방법

`src/data/decks/s2/tier1.ts` (또는 `tier2.ts`) 배열에:

```ts
{
  id: 's2-t1-unique-id',
  name: '장수A·장수B·장수C',
  season: 'S2',
  tier: 1,
  members: [
    mem('장수A', '필수1', '필수2', ['대체1', '대체2'], ['병법1', '병법2', '병법3']),
    mem('장수B', '...', '...', [...], [...]),
    mem('장수C', '...', '...', [...], [...]),
  ],
},
```

새 장수는 `helpers.ts`의 `GENERAL_META`에 진영만 추가하면 됩니다.

## 실행

```bash
npm install
npm run dev
```

## 공개 사이트

GitHub Pages: https://serengrintf.github.io/samdeck/

`main` 브랜치에 push하면 Actions가 자동 배포합니다.

## 이용자 평균 평점 (선택)

Railway PostgreSQL + API 배포 후, GitHub 저장소 **Settings → Secrets and variables → Actions → Variables**에
`VITE_RATINGS_API_URL`을 넣거나 로컬 `.env.local`에 설정합니다. 자세한 내용은 [`server/README.md`](server/README.md).

```env
# .env.local
VITE_RATINGS_API_URL=https://your-api.up.railway.app
```

API가 없거나 실패해도 앱은 동작하며, 팝업의 내 점수는 로컬에 저장됩니다.
