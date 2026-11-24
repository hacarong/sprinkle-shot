# sprinkle-shot

봇과 대전하는 1인칭 웹 FPS입니다. 브라우저에서 바로 실행되는 정적 클라이언트와, 멀티 플레이 준비용 WebSocket 서버로 구성됩니다.

## 구조

| 경로 | 내용 |
|---|---|
| `client/` | 게임 본체. `index.html`, `style.css`, `game.js` (Three.js r128은 CDN 로드) |
| `server/index.js` | 정적 파일 제공, `/healthz` 헬스체크, `/ws` 방 서버 |
| `server/rooms.js` | 방 입장·정원·퇴장 로직 |
| `test/` | 방 로직 단위 테스트, HTTP·WebSocket 통합 테스트 |
| `scripts/check.js` | 전체 JS 문법 검사 |
| `Dockerfile` | 배포 이미지 |
| `.github/workflows/ci.yml` | 문법 검사, 테스트, 컨테이너 빌드와 헬스체크 |
| `.github/workflows/deploy.yml` | 수동 배포(예비 경로) |

현재 게임은 싱글 플레이입니다. `/ws`는 방 입장과 상태 중계만 하는 골격이고, 클라이언트는 아직 연결하지 않습니다.

## 로컬 실행

Node 22 이상이 필요합니다.

```bash
npm ci
npm start        # http://localhost:8080
npm run dev      # 서버 파일 변경 시 자동 재시작
npm run lint     # 문법 검사
npm test         # 테스트
```

## 배포 (Railway)

기본 경로는 Railway의 GitHub 자동 배포입니다.

1. Railway에서 새 프로젝트 → GitHub 저장소 `hacarong/sprinkle-shot` 연결
2. 서비스 Settings → 배포 브랜치 `main` 확인
3. Settings → **Wait for CI** 켜기 (CI 통과 후에만 배포)
4. Settings → Healthcheck Path에 `/healthz` 입력
5. Settings → Networking에서 공개 도메인 생성

루트의 `Dockerfile`이 자동으로 사용됩니다. 포트는 Railway가 주입하는 `PORT`를 따릅니다.

※ `railway.json`·`railway.toml` 방식은 Railway에서 지원 중단 예정이라 사용하지 않습니다.

자동 배포가 동작하지 않으면 예비 경로를 씁니다. 저장소 시크릿 `RAILWAY_TOKEN`(프로젝트 토큰)과 변수 `RAILWAY_SERVICE`를 등록한 뒤, Actions 탭에서 "Deploy (수동 예비 경로)"를 실행합니다. 이 워크플로는 실제 토큰으로 검증하지 않았습니다.

## 다음 작업

- 성능: FPS·프레임 시간 표시, 고정 간격 시뮬레이션, 동적 해상도, AI 부하 분산, 프레임 제한 옵션(30·60·120·무제한)
- 구조: `game.js`를 시뮬레이션·렌더·사운드·UI·입력으로 분리, 맵 데이터화
- 맵 선택과 신규 맵
- 2~4인 협동 멀티: 서버 권위 시뮬레이션
