# revert된 머지를 다시 통합할 때 대량 충돌 (revert의 revert)

## 증상

- `develop → main` 머지 시 마이페이지 관련 파일 전체에서 충돌이 대량 발생
- 대부분 `modify/delete` 충돌 (한쪽은 파일을 지웠는데 다른 쪽은 계속 수정)
- 파일 하나하나 잡아도 끝이 안 보임

## 상황 (2026-07 릴리즈 v1.1.0)

- main에서 마이페이지 개선뷰 PR(#137)이 아직 릴리즈 불가 판단 → `722c9ebf Revert "Merge PR #137"`로 되돌림
- 그 상태로 릴리즈 브랜치를 만들어 main에 반영 (마이페이지 제외한 나머지만)
- 이후 develop에는 #137이 **그대로 살아있고**, 그 위에 마이페이지 QA(#156, #157)가 계속 쌓임
- 릴리즈 시점에 `develop → main` 머지 시도 → 마이페이지 파일 전면 충돌

## 원인

**머지 커밋을 revert하면, 나중에 같은 브랜치를 다시 머지해도 그 변경이 되살아나지 않는다.**

Git 3-way 머지는 공통조상(merge-base) 기준으로 비교한다.

```text
merge-base:  #137 내용 있음 (양쪽의 공통 조상)
main 쪽:     #137 revert로 내용 삭제됨
develop 쪽:  #137 유지 + 그 위에 QA로 대폭 수정
```

→ base엔 있고 / main은 삭제 / develop은 수정 = 파일마다 `modify/delete` 충돌 폭발.
이건 실수가 아니라 revert된 머지를 재통합할 때 나타나는 **구조적 현상**이다.

## 해결 — revert의 revert (Git 공식 방식)

되돌린 커밋을 **다시 되돌려서** 변경을 복원한 뒤 머지하면, 양쪽 출발점이 같아져 충돌이 사라진다.

```bash
# main에서 시작하는 릴리즈 브랜치 생성 (main 직계 자손 → 나중에 PR 충돌 0)
git switch -c release/vX.Y.Z origin/main

# 1) revert를 다시 revert → #137 복원
git revert --no-edit 722c9ebf
#   (이 단계에서 이후 hotfix가 같은 파일을 건드렸다면 소규모 충돌 → 최신 버전 우선으로 통과)

# 2) develop 머지 → 마이페이지 충돌 소멸, 남는 충돌은 최신(develop) 버전으로 해결
git merge --no-edit origin/develop
git checkout --theirs <충돌파일>   # develop이 정본인 파일
git add <충돌파일> && git commit --no-edit
```

## 검증 (머지 후 반드시)

```bash
# 1) 브랜치 트리가 develop과 동일한지 (비어있으면 내용 100% 일치)
git diff --stat origin/develop HEAD

# 2) main의 직계 자손인지 (PR 충돌 없음 보장)
git merge-base --is-ancestor origin/main HEAD && echo OK
```

- 결과: `release/v1.1.0` = develop 내용 100% 동일 + main 직계 자손 → PR #162 충돌 0으로 머지

## 정책 / 교훈

- **릴리즈에서 특정 PR만 빼야 할 때 `Revert Merge`는 최후의 수단.** 되돌린 브랜치를 나중에 다시 통합할 것을 반드시 염두에 둘 것.
- 재통합 시엔 파일별로 충돌을 잡지 말고 **먼저 `revert의 revert`로 근본 원인부터 제거**한다.
- 릴리즈 브랜치는 **main에서 분기 → develop 머지** 순서로 만들면 트리는 develop과 같으면서 main 직계 자손이라 PR이 항상 클린하다.

## 참고

- PR #162 (release/v1.1.0 → main)
- 되돌렸던 커밋: `722c9ebf Revert "Merge PR #137 마이페이지 개선뷰"`
- Git 공식 문서: [How to revert a faulty merge (revert-a-faulty-merge.txt)](https://github.com/git/git/blob/master/Documentation/howto/revert-a-faulty-merge.txt)
