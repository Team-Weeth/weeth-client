# ADR-008: 서비스 피드백 A/B를 유저 단위 % Split으로 전환

- **status**: accepted
- **date**: 2026-11-24
- **관련**: [[WTH-67]], [[WTH-66]], [[ADR-002-data-fetching-strategy]]

## 맥락

서비스 피드백 A/B(A안 FAB + 채팅형 / B안 서비스 설정 + 폼형)는 `club_feedback_fab_enabled` 플래그를 `club:{clubId}` identity로 조회하고 있었다. 배정 단위가 동아리이므로 유저 단위로 나누려면 Flagsmith에서 유저마다 trait을 넣어야 하는 문제가 있었다(WTH-66).

요구사항:

- 같은 동아리 안에서도 유저별로 A안/B안이 달라야 한다.
- 같은 유저는 기기/동아리가 달라도 항상 같은 그룹을 봐야 한다.
- 운영 DB 접근이나 배정 스크립트 없이 자동으로 돌아가야 한다.

## 결정

Flagsmith `% Split` 세그먼트를 `user:{userId}` identity로 조회하여 유저 단위 50:50 배정을 한다.

구체적으로:

1. 새 플래그 `feedback_fab_enabled`를 생성하고, `% Split = 50` 세그먼트를 override로 건다.
2. `getClubFeatures(clubId, userId)` 시그니처를 확장하여, 유저 스코프 플래그(`USER_SCOPED_FLAGS`)는 `user:{userId}` identity로 별도 조회한다.
3. 기존 동아리 플래그와 유저 플래그를 `Promise.all`로 병렬 조회 후 합친다.
4. `assign_feedback_group.py` 배정 스크립트와 `feedback_assignment` 테이블은 만들지 않는다.

## 이유

- Flagsmith `% Split`은 identity 문자열의 해시로 결정론적 배정을 하므로, 같은 userId면 항상 같은 그룹이 된다.
- 신규 가입자도 자동 배정되어 운영 개입이 필요 없다.
- 기존 `club:` identity 플래그 조회 구조를 그대로 유지하면서 `user:` identity를 추가하는 것이므로 변경 범위가 작다.
- `ClubFeatures` 타입과 `useClubFeatures()` 소비처는 수정 없이 유지된다.

## 대안 / 트레이드오프

- **대안: 스크립트로 동아리별 정확한 반반 배정 (WTH-66 원안)**
  - 동아리 내에서 정확히 50:50을 보장할 수 있다.
  - 안 고른 이유: 배정 스크립트 개발, 운영 DB 접근, 신규 가입자 재배정 필요. 운영 비용이 크다.

- **대안: 기존 `club_feedback_fab_enabled` 키 재사용**
  - 안 고른 이유: 동아리 세그먼트 override가 남아 있을 수 있고, `DevFlagPanel` 등이 `club:` identity로 같은 키를 조회해서 결과가 섞인다.

- **이 결정의 단점**
  - 해시 기반이라 소규모 동아리에서는 한쪽으로 쏠릴 수 있다 (예: 16명 동아리 5:11).
  - 핵심 지표인 피드백 제출자 비율을 **전체 유저 기준**으로 비교하므로 감수한다. 동아리별 비교는 참고용으로만 본다.
  - 동아리→유저 단위 전환 시 기존 유저 절반 정도는 보던 화면이 바뀐다. 실험 데이터는 prod 전환일부터 따로 집계해야 한다.

## 영향

- `src/flags/club-features/definitions.ts`: `feedbackFabEnabled` 키 변경 + `USER_SCOPED_FLAGS` 추가
- `src/flags/club-features/server.ts`: `getClubFeatures(clubId, userId?)` 시그니처 확장, 유저/동아리 identity 분리 조회
- `src/app/(private)/[clubId]/(main)/layout.tsx`: 대시보드 응답의 `userInfo.id`를 `getClubFeatures`에 전달
- `.claude/rules/feature-flag.md`: 유저 단위 플래그 조회 방식 문서화
- `src/flags/club-features/__tests__/server.test.ts`: 분리 조회 테스트 추가
- Flagsmith: 기존 `club_feedback_fab_enabled` 플래그 및 세그먼트 정리 (전환 완료 후)
