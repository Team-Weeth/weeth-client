# E2E 스냅샷 OS 불일치 (win32 vs linux)

## 증상

- CI(ubuntu-latest)에서 `toHaveScreenshot` 테스트가 실패하거나 스냅샷을 새로 생성
- `image-card-single-chromium-linux.png` 파일을 찾을 수 없다는 메시지
- 로컬(Windows)에서는 `*-win32.png`만 생성되어 커밋됨

## 원인

Playwright는 스냅샷 파일명에 OS 접미사를 자동으로 붙인다.

```
로컬(Windows): image-card-single-chromium-win32.png  ← 커밋됨
CI(Ubuntu):    image-card-single-chromium-linux.png  ← 없음
```

CI는 linux 파일을 찾지 못하면 새로 생성하거나 실패한다. linux 기준 파일이 없으면 회귀 감지가 불가능하다.

## 해결

`Update E2E Snapshots` GitHub Actions 워크플로우를 실행해 linux 스냅샷을 생성하고 자동 커밋한다.

1. GitHub → Actions → **Update E2E Snapshots** → Run workflow
2. 스냅샷을 업데이트할 브랜치 선택 후 실행
3. 워크플로우가 완료되면 `*-linux.png` 파일이 해당 브랜치에 자동 커밋됨

## 정책

- 스냅샷 업데이트는 **반드시 이 workflow를 통해** 수행한다 (로컬 win32 스냅샷 직접 커밋 금지)
- ImageCard 레이아웃 변경 후에는 이 workflow를 실행해 기준선을 갱신한다
- win32 스냅샷은 로컬 개발용으로 남겨두되, CI 비교 기준은 linux 스냅샷이다

## 참고

- `.github/workflows/e2e-update-snapshots.yml`
- Playwright 공식 문서: [Visual comparisons — Platform-specific snapshots](https://playwright.dev/docs/test-snapshots#platform-specific-snapshots)
