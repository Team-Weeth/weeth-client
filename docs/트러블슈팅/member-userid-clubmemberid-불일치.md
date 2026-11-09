# 게시판 작성자 프로필 조회 실패 — userId / clubMemberId 식별자 불일치

## 증상

게시글 상세에서 작성자(게시글/댓글/대댓글)를 클릭하면 멤버 상세 모달이 뜨지만,
항상 아래 에러로 조회에 실패한다.

```json
{ "code": 21103, "message": "동아리 멤버가 아닙니다.", "data": null }
```

- 발생 위치: `/clubs/{clubId}/board/{boardId}/{postId}` 작성자 클릭 시
- 호출 API: `GET /clubs/{clubId}/members/{clubMemberId}` (멤버 상세)
- 관련 커밋: `f8959060 feat: 게시판 작성자 클릭 시 프로필 조회 모달 연결`

## 원인

**프론트가 `userId`를 `clubMemberId` 자리에 넘기고 있다.** (추정 아님 — 응답으로 확정)

- 게시글/댓글의 `author`는 백엔드 스펙상 `UserInfo` DTO이고, 그 `id`는 **"사용자 ID"(`userId`)** 다.
  - 방증: `src/lib/board.ts`에서 `comment.author.id === currentUserId`(= 로그인 유저 userId)로 비교한다.
- 멤버 상세 엔드포인트의 path 파라미터는 **`clubMemberId`(멤버 ID)** 다.
- 도메인상 **User ≠ Member** — 한 User가 클럽마다 다른 `clubMemberId`를 가진다. (`docs/아키텍처/도메인-용어집.md`)
- 따라서 `userId`를 `clubMemberId`로 넘기면 해당 멤버를 못 찾고 `21103`으로 거절된다.

### 프론트 단독 수정이 불가능한 이유

작성자에 대해 프론트가 가진 식별자는 `author.id`(= `userId`) 하나뿐인데,
`userId → clubMemberId`로 변환해줄 수 있는 API가 없다.

| 엔드포인트 | 응답 DTO | userId | clubMemberId | 용도 |
|---|---|:---:|:---:|---|
| `GET /clubs/{clubId}/members` | `ClubMemberPublicResponse` | ❌ | ✅ | 멤버 목록 |
| `GET /clubs/{clubId}/members/{clubMemberId}` | `ClubMemberDetailResponse` | ❌ | ✅ | 멤버 상세 |
| `GET /clubs/{clubId}/members/me` (getMyMemberInfo) | `ClubMemberProfileResponse` | ✅ | ✅ | **내 정보 전용** |
| getMyMemberSummary | `ClubMemberSummaryResponse` | ✅ | ❌ | **내 정보 전용** |

- 멤버 목록 응답에 `userId`가 없어 `author.id`로 매칭할 키가 없다.
- `userId`+`clubMemberId`를 둘 다 주는 건 "내 정보" 엔드포인트뿐이라 타인에게 못 쓴다.
- 이름(name) 매칭은 동명이인에서 깨지므로 채택 불가.

## 해결 (백엔드 요청 필요)

아래 중 하나면 해결된다. **①을 권장.**

- **① (권장) 게시판 author DTO(`UserInfo`)에 `clubMemberId` 추가**
  - 프론트는 `author.clubMemberId`를 그대로 멤버 상세 조회에 사용 → 추가 API 호출 0회.
  - 영향 범위: 게시글 상세/목록, 댓글, 대댓글의 author 응답.
- **② userId로 멤버를 조회하는 엔드포인트 신설**
  - 예: `GET /clubs/{clubId}/members/by-user/{userId}` 또는 멤버 상세에 `userId` 조회 옵션.
  - 프론트는 author 클릭 → userId로 조회 (호출 1회 추가).
- **③ (차선) 멤버 목록 응답에 `userId` 추가**
  - 프론트가 목록을 받아 `userId === author.id`로 clubMemberId를 찾음.
  - 전체 목록 로딩/페이지네이션 비용이 들고 탈퇴 멤버는 조회 불가 → 권장하지 않음.

### 백엔드 요청문 (복붙용)

> **제목**: 게시판 작성자 프로필 조회를 위한 `clubMemberId` 노출 요청
>
> 게시글 상세에서 작성자를 클릭하면 멤버 상세(`GET /clubs/{clubId}/members/{clubMemberId}`)를 띄우려 합니다.
> 그런데 게시글/댓글의 `author`(= `UserInfo`)에는 `userId`만 있고 `clubMemberId`가 없어,
> 현재 `userId`를 넘기면 `21103 동아리 멤버가 아닙니다`로 실패합니다.
> 프론트에는 userId→clubMemberId 변환 수단이 없습니다(멤버 목록 응답에도 userId 없음).
>
> **요청**: 게시판 author 응답에 `clubMemberId`를 포함해 주세요.
> (댓글/대댓글 author 포함) 어려우면 userId로 멤버를 조회하는 엔드포인트도 대안입니다.

## 참고

- 관련 코드: `src/app/(private)/[clubId]/(main)/board/(with-nav)/[boardId]/[postId]/PostDetailContent.tsx`,
  `src/components/member/MemberDetailModal.tsx`, `src/hooks/member/useMemberDetailQuery.ts`, `src/lib/board.ts`
- 도메인 용어집: `docs/아키텍처/도메인-용어집.md` (User / Member 구분)
