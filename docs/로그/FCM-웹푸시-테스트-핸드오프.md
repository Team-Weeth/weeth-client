# FCM 웹 푸시 — 테스트 핸드오프

> 다른 세션/계정에서 이어서 **알림 수신 테스트**를 하기 위한 문서.
> 새 Claude 세션은 이 파일을 먼저 읽고 진행하면 됨.

- 작업 브랜치: `setting/WTH-537-FCM-푸시-알림-웹-설정`
- 관련 티켓: WTH-537
- 마지막 정리: 2026-10-19

---

## 0. 시작하기 (새 환경에서)

```bash
git fetch origin
git checkout setting/WTH-537-FCM-푸시-알림-웹-설정
pnpm install
```

> ⚠️ `.env`는 **git에 안 올라감(gitignore)**. 아래 2번대로 Firebase 값을 **다시 채워야** 함.

---

## 1. 현재 상태

### ✅ 완료 (웹 코드, 이 브랜치에 커밋됨)

| 커밋 | 내용 |
|------|------|
| `e7f24189` | FCM 기반 설정 (firebase SDK·config·SW·API·훅) |
| `04b45374` | 웹 푸시 로직 action 레이어 분리 |
| `a47a22ec` | 로그인 직후 토큰 자동 등록 |
| `8e54d928` | 마이페이지 고객지원 알림설정 토글 |
| `e39936f1` | 로그아웃 시 토큰 해제(revoke) 연결 |

### ⛔ 미완 / 선행 필요

1. **Firebase 콘솔 세팅** — 웹 앱(</>) 등록 + VAPID 키 생성 (아래 2번)
2. **`.env` 값 채우기** — `NEXT_PUBLIC_FIREBASE_*` 6개 (gitignore라 환경마다 필요)
3. **백엔드 발송 로직** — service account 기반 FCM 발송 (백엔드 담당, 아래 7번)
4. (테스트 편의) **포그라운드 수신 핸들러 미연결** — 아래 5번 "함정" 참고

---

## 2. 테스트 전제조건

### (a) Firebase 콘솔

1. Firebase 프로젝트 → **프로젝트 설정 → 내 앱 → 앱 추가 → 웹(</>)** 으로 **웹 앱 등록**
   - ⚠️ Android/iOS 앱만 있으면 웹 토큰이 유효하지 않음. **웹 앱 등록이 필수.**
2. 등록 후 나오는 config 6개 값 확보
3. **프로젝트 설정 → Cloud Messaging → 웹 푸시 인증서(Web Push certificates)** → 키 쌍 생성 → **VAPID 키** 확보

### (b) `.env` 채우기

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

> 값이 비어 있으면 `isFirebaseConfigured()`가 false → messaging이 null → **토큰 자체가 안 만들어짐**. 테스트 불가.

---

## 3. 테스트 절차 (백엔드 없이 가능)

### Step 1. 앱 실행 & 토큰 발급

```bash
pnpm dev
```

- **일반 Chrome 데스크톱**으로 `http://localhost:3000` 접속 (localhost는 web push 허용 secure context)
- 로그인 → 알림 권한 "허용" (또는 마이페이지 → 고객지원 → 알림설정 토글 ON)

### Step 2. FCM 토큰 확보

- DevTools → **Network 탭** → `notifications/tokens` 요청의 **payload에서 `token` 값 복사**
- (또는 테스트용 `console.log` 임시 추가 — 아래 5번 참고)

### Step 3. 발송 — 방법 A: Firebase 콘솔 "테스트 메시지"

> ⚠️ **"Next(다음)"로 캠페인 타겟(앱 선택) 화면 가지 말 것.** 거기선 앱만 고르게 돼 있음.

1. Cloud Messaging → 새 알림 만들기
2. **알림 제목·텍스트만 입력**
3. 오른쪽 **"테스트 메시지 전송(Send test message)"** 클릭
4. **FCM 토큰 붙여넣기** → 추가 → 테스트
   - → 붙여넣은 토큰으로 바로 발송됨 (앱/플랫폼 선택 불필요)

### Step 3. 발송 — 방법 B: curl (HTTP v1)

service account JSON으로 access token 발급 후:

```bash
curl -X POST "https://fcm.googleapis.com/v1/projects/<PROJECT_ID>/messages:send" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "<FCM_WEB_TOKEN>",
      "notification": { "title": "테스트", "body": "알림 테스트입니다" },
      "data": { "link": "/" }
    }
  }'
```

### Step 4. 수신 확인

- **백그라운드** (탭 비활성 / 최소화 / 다른 탭) → 서비스워커 `onBackgroundMessage` → **시스템 알림** 뜸 ✅ (가장 확실)
- **포그라운드** (해당 탭 활성) → `onMessage` → ⚠️ 현재 핸들러 미연결, 아래 5번 참고

---

## 4. 파일 맵

| 파일 | 역할 |
|------|------|
| `src/lib/firebase/config.ts` | Firebase 앱 초기화, config/VAPID, `isFirebaseConfigured()` |
| `src/lib/firebase/messaging.ts` | `getMessagingInstance()` (`isSupported()` 가드) |
| `src/lib/push/webPush.ts` | 권한요청/토큰발급·등록/조건부등록/해제 (plain 함수) |
| `src/lib/push/preference.ts` | 알림 사용 의도 localStorage 저장 |
| `src/lib/push/platform.ts` | `isNativeApp()`, `getPushPlatform()` |
| `src/lib/apis/notification.ts` | 토큰 등록/해제 API |
| `src/hooks/useFcmToken.ts` | `enable`/`disable` + 포그라운드 수신 훅 |
| `src/components/notification/FcmAutoRegister.tsx` | 로그인 직후 자동 등록 (인증/메인 레이아웃에 마운트) |
| `src/components/mypage/NotificationSettingItem.tsx` | 마이페이지 알림설정 토글 |
| `public/firebase-messaging-sw.js` | 백그라운드 수신 SW (config는 쿼리스트링 주입, importScripts 버전 `12.19.0`) |

---

## 5. 알려진 함정 / 주의

- **포그라운드 수신이 화면에 안 뜸**: `useFcmToken`의 `onForegroundMessage`를 아무 데도 연결 안 함. 또 `useFcmToken`은 마이페이지에서만 마운트됨 → 다른 페이지에선 포그라운드 구독 자체가 없음. **백그라운드(SW)는 정상 동작.**
  - 테스트 편의를 위해 (dev 전용) ① 토큰 `console.log` ② 포그라운드 → 토스트 를 임시로 붙이면 편함. (아직 미적용)
- **Capacitor 네이티브 WebView에서는 web push 안 됨** (특히 iOS WKWebView). → 네이티브 푸시는 추후 `@capacitor/push-notifications` 경로. 지금 테스트는 **일반 Chrome**으로.
- **iOS Safari**는 PWA 설치 상태에서만 web push 지원. 지금은 Chrome 데스크톱/안드로이드로 테스트.
- **빌드타임 config**: `next.config.ts`/`.env` 변경은 dev 서버 **재시작** 후 반영.
- **서비스워커 스코프**: `/firebase-cloud-messaging-push-scope` (루트의 MSW와 충돌 방지). MSW는 `NEXT_PUBLIC_API_MOCKING=enabled`일 때만 구동.

---

## 6. 백엔드에 요청/확인할 정보

1. **Firebase 프로젝트 일치** — BE service account와 FE 웹 config가 **같은 프로젝트**여야 함. 누가 프로젝트를 소유하고 config/VAPID(또는 콘솔 접근권)를 공유할지. dev/prod 프로젝트 분리 여부.
2. **발송 페이로드 규격** — `notification` 필드 vs `data`-only 중 무엇을 보내는지. **클릭 이동 경로 필드명** (현재 SW는 `data.link` 가정). title/body/icon 출처.
3. **토큰 API 동작** — `platform` enum(`WEB`/`ANDROID`/`IOS`), 중복 토큰 처리, `UNREGISTERED`(만료) 토큰 정리 여부.
4. **발송 트리거** — 어떤 이벤트에 푸시가 나가는지 (공지/댓글/출석 등).

---

## 7. 백엔드 API 규격 (이미 구현됨)

```
POST /api/v4/notifications/tokens
body: { "token": "<fcm-token>", "platform": "WEB" }

POST /api/v4/notifications/tokens/revoke
body: { "token": "<fcm-token>" }
```

- 인증: access token 쿠키 필요 (프런트는 `/api/proxy` 경유 — `apiClient.post('/notifications/tokens', ...)`)
- 읽음 처리로 보이는 엔드포인트: `PATCH /api/v4/clubs/{clubId}/notifications/read-all` (연동 범위 확인 필요)
