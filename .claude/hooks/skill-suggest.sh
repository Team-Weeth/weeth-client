#!/bin/bash
# UserPromptSubmit hook — 프롬프트 키워드 기반 스킬 자동 제안

input=$(cat)
prompt=$(echo "$input" | jq -r '.prompt // ""' | tr '[:upper:]' '[:lower:]')

suggestions=()

# /code-review
if echo "$prompt" | grep -qE "코드 리뷰|리뷰|pr|풀 리퀘|pull request|review|diff|변경사항 확인"; then
  suggestions+=("  → /code-review   PR/커밋 코드 리뷰")
fi

# /write-tests
if echo "$prompt" | grep -qE "테스트|test|jest|rtl|testing library|단위 테스트|검증"; then
  suggestions+=("  → /write-tests   Jest + RTL 테스트 코드 작성")
fi

# /commit
if echo "$prompt" | grep -qE "커밋|commit|staged|스테이징|변경 저장"; then
  suggestions+=("  → /commit        Conventional Commits 커밋 메시지 작성")
fi

# /figma-to-component
if echo "$prompt" | grep -qE "figma|피그마|디자인|컴포넌트 변환|ui 구현|화면 구현"; then
  suggestions+=("  → /figma-to-component   Figma → React 컴포넌트 변환")
fi

# /pr-writer
if echo "$prompt" | grep -qE "pr 작성|pr 내용|풀리퀘 설명|pr description|pr body"; then
  suggestions+=("  → /pr-writer     PR 본문 자동 작성")
fi

# 매칭된 스킬이 있을 때만 출력
if [ ${#suggestions[@]} -gt 0 ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "💡 관련 스킬 제안"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for s in "${suggestions[@]}"; do
    echo "$s"
  done
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

exit 0
