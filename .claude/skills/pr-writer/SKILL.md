---
name: pr-writer
description: Analyzes code changes and generates a PR body following .github/pull_request_template.md format. Use for PR creation or PR update requests.
---

## Step 1. Analyze Changes
```bash
BASE_BRANCH=$(git remote show origin | sed -n '/HEAD branch/s/.*: //p')
git diff "origin/${BASE_BRANCH}"...HEAD --stat
git log "origin/${BASE_BRANCH}"...HEAD --oneline
git diff "origin/${BASE_BRANCH}"...HEAD
```

## Step 2. Extract Issue Number from Branch Name
```bash
git branch --show-current
# e.g. feat/WTH-42-button-component → issue #42
```

## Step 3. Determine PR Type

| Change | PR Type |
|--------|---------|
| New files, new feature | 새로운 기능 추가 |
| Bug fix | 버그 수정 |
| Refactor, restructure | 코드 리팩토링 |
| Typo, variable rename, tab size | 코드에 영향 없는 변경사항 |
| Comment add/edit | 주석 추가 및 수정 |
| README, md files | 문서 수정 |
| package.json, CI, etc. | 빌드/패키지 매니저 수정 |
| File/folder rename | 파일 혹은 폴더명 수정 |
| File/folder delete | 파일 혹은 폴더 삭제 |

## Step 4. Output

Fill [template.md](template.md) with analysis results.
Leave screenshot section with a placeholder for user to fill in.

## Step 5. PR Update

When updating an existing PR after additional commits, analyze only changes since last push:
```bash
LAST_PUSH=$(git rev-parse @{push} 2>/dev/null || git rev-parse origin/$(git branch --show-current) 2>/dev/null || echo "HEAD")
git diff "${LAST_PUSH}" --stat
git log "${LAST_PUSH}"..HEAD --oneline
git diff "${LAST_PUSH}"
```

Append under existing Key Changes with a separator:
```markdown
#### 🔄 추가 변경사항 (2차)

- change 1
- change 2
```

- Indicate which iteration (2nd, 3rd, ...).
- Update PR type checkboxes if changed.
