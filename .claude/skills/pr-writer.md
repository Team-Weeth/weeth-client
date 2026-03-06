# PR Writer

코드 변경사항을 분석해 `.github/pull_request_template.md` 형식에 맞는 PR 본문을 생성합니다.
PR 작성 또는 PR 업데이트 요청 시 이 스킬을 사용합니다.

## Step 1. 변경사항 파악
```bash
BASE_BRANCH=$(git remote show origin | sed -n '/HEAD branch/s/.*: //p')
git diff "origin/${BASE_BRANCH}"...HEAD --stat
git log "origin/${BASE_BRANCH}"...HEAD --oneline
git diff "origin/${BASE_BRANCH}"...HEAD
```

## Step 2. 브랜치명에서 이슈번호 추출
```bash
git branch --show-current
# 예: feat/WTH-42-button-component → 이슈 #42
```

## Step 3. PR 유형 판단

| 변경 내용               | PR 유형                   |
| ----------------------- | ------------------------- |
| 새 파일 생성, 새 기능   | 새로운 기능 추가          |
| 버그 수정, 오동작 해결  | 버그 수정                 |
| 리팩토링, 구조 변경     | 코드 리팩토링             |
| 오타, 변수명, 탭 사이즈 | 코드에 영향 없는 변경사항 |
| 주석 추가/수정          | 주석 추가 및 수정         |
| README, md 파일         | 문서 수정                 |
| package.json, CI 등     | 빌드/패키지 매니저 수정   |
| 파일/폴더 이름 변경     | 파일 혹은 폴더명 수정     |
| 파일/폴더 삭제          | 파일 혹은 폴더 삭제       |

## Step 4. 출력

분석 결과를 아래 템플릿에 채워서 출력합니다.
스크린샷 섹션은 사용자가 직접 추가해야 하므로 안내 문구만 남깁니다.
```markdown
## ✅ PR 유형

어떤 변경 사항이 있었나요?

- [x] 새로운 기능 추가
- [ ] 버그 수정
- [ ] 코드에 영향을 주지 않는 변경사항(오타 수정, 탭 사이즈 변경, 변수명 변경)
- [ ] 코드 리팩토링
- [ ] 주석 추가 및 수정
- [ ] 문서 수정
- [ ] 빌드 부분 혹은 패키지 매니저 수정
- [ ] 파일 혹은 폴더명 수정
- [ ] 파일 혹은 폴더 삭제

---

### 📌 관련 이슈번호

- Closed #이슈번호

---

### ✅ Key Changes

- 변경사항 1
- 변경사항 2

---

### 📸 스크린샷 or 실행영상

<!-- 이해하기 쉽도록 스크린샷을 첨부해주세요. -->

---

## 🎸 기타 사항 or 추가 코멘트
```

## Step 5. PR 업데이트

이미 PR이 올라간 상태에서 추가 커밋 후 PR 업데이트 요청을 보내면, 마지막 푸시 이후 변경사항을 분석해 추가 변경사항만 출력합니다.
```bash
# 마지막 푸시 이후 변경사항 확인
LAST_PUSH=$(git rev-parse @{push} 2>/dev/null || git merge-base origin/$(git branch --show-current) HEAD)
git diff "${LAST_PUSH}" --stat
git log "${LAST_PUSH}"..HEAD --oneline
git diff "${LAST_PUSH}"
```

기존 Key Changes 아래에 구분선과 함께 추가합니다:
```markdown
#### 🔄 추가 변경사항 (2차)

- 추가 변경사항 1
- 추가 변경사항 2
```

- 몇 차 수정인지 표시합니다 (2차, 3차, ...).
- PR 유형이 달라졌으면 체크박스도 업데이트합니다.