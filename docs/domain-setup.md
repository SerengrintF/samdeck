# 도메인 연결 체크리스트 (samdeck.xyz = 사이트)

## A. Railway API → api.samdeck.xyz

1. Railway → samdeck 서비스 → Networking
2. 기존 `samdeck.xyz` 도메인 **삭제**
3. **+ Custom Domain** → `api.samdeck.xyz` 추가 (port 8080)
4. 가비아 DNS:
   - CNAME / 호스트 `api` / 값 `xxxx.up.railway.app.` (Railway 안내값, 끝 점)
   - TXT `_railway-verify` (Railway 안내값)
5. `https://api.samdeck.xyz/health` → `{"ok":true...}` 확인

## B. GitHub Pages → samdeck.xyz

1. GitHub → samdeck → Settings → Pages → Custom domain → `samdeck.xyz` 저장
2. 가비아 DNS (GitHub 안내 A레코드 4개):
   - `@` A → `185.199.108.153`
   - `@` A → `185.199.109.153`
   - `@` A → `185.199.110.153`
   - `@` A → `185.199.111.153`
   - (선택) `www` CNAME → `serengrintf.github.io.`
3. Pages에서 Enforce HTTPS 체크
4. 가비아에 남아 있는 루트(`@`) Railway CNAME은 **삭제**

## C. 변수

- GitHub Actions Variable: `VITE_RATINGS_API_URL` = `https://api.samdeck.xyz`
- Railway: `CORS_ORIGINS` = `https://samdeck.xyz,https://serengrintf.github.io,http://localhost:5173`

## D. 프론트 배포

코드 `base: '/'` 반영 후 Pages 재배포.
