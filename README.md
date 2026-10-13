# Risense (리센스)

> 팀 프로젝트(팀플)에서 발생하는 리스크를 조기에 발견하고 관리하는 웹 서비스

졸업프로젝트1 팀 과제로 진행 중인 프로젝트입니다.

## 소개

조별 과제를 하다 보면 "누가 얼마나 하고 있는지", "어떤 작업이 막혀 있는지", "마감까지 무리는 없는지" 파악하기 어렵습니다.
**Risense**는 정기 체크인과 작업 현황을 바탕으로 팀의 리스크를 점수화하여, 문제를 미리 알아챌 수 있도록 돕는 대시보드형 서비스입니다.

## 주요 기능

- **리스크 진단** — 작업 진행도, 체크인 참여율, 지연 여부를 종합해 리스크 점수와 등급(안정 / 관찰 / 주의 / 위험 / 심각)을 산출
- **정기 체크인** — 지정한 요일·시간마다 팀원이 작업 현황을 업데이트, 완료/지각/누락 자동 집계
- **작업 보드** — 작업 크기(S/M/L/XL), 담당자, 선행 작업, 진행 상태 관리
- **팀원 참여 현황** — 구성원별 작업량, 체크인율, 상태 라벨로 참여도 한눈에 파악
- **타임라인 & 최종 리포트** — 프로젝트 진행 이력과 종료 시 결과 리포트 제공
- **팀장 / 팀원 분리 흐름** — 역할에 따라 다른 화면과 권한 제공

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** (빌드 / 개발 서버)
- **React Router** (라우팅)
- **Tailwind CSS 4** + **Radix UI** (UI)
- **Recharts** (차트 / 시각화)
- **Lucide** (아이콘)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── pages/        # 화면 단위 페이지 (대시보드, 체크인, 작업 보드 등)
├── components/   # 재사용 컴포넌트 (RiskBadge, RiskGauge, UI 등)
├── data/         # 샘플 데이터
├── types/        # 공통 도메인 타입 정의
└── App.tsx       # 라우팅 정의
```

## 인증 API

회원가입·로그인·내 정보 조회는 배포된 Risense 서버에 연결되어 있습니다. 개발 서버는 `/api`를 백엔드로 프록시합니다.

- `npm run test:auth`: 인증 API/입력 검증/세션 테스트 (Node 24+)

## 프로젝트 API — 1차 연결

- `GET /api/projects`: 로그인한 사용자의 프로젝트 목록, 역할·상태 필터
- `POST /api/projects`: 프로젝트 생성 후 서버가 반환한 ID의 상세로 이동
- `GET /api/projects/{projectId}`: `/projects/:projectId`에서 상세 조회, 새로고침 가능
- `npm run test:projects`: 요청 형식, 인증, 응답 검증, 오류 처리 테스트 (Node 24+)

2026-10-08의 배포 Swagger와 테스트 계정의 실제 목록·상세 응답으로 확인했습니다. 생성 흐름은 테스트 응답으로 검증하며 공유 서버에 테스트 프로젝트를 추가하지 않습니다.

생성 요청은 `title`, `className`, `deadline`, `checkinTime`(HH:mm:ss), `checkinFrequency`(1~7), `checkinDays`(MON~SUN)를 보냅니다. 주기와 선택 요일 수가 일치해야 합니다. 목록은 배열을 직접 반환하고 상세·생성은 ProjectResponse를 직접 반환합니다. 응답의 `LEADER/CO_LEADER/MEMBER`, `IN_PROGRESS/DONE/CLOSED`를 화면용 한국어로 표시합니다.

프로젝트 유형 선택 UI는 유지하며, 현재 서버에 저장되지 않는다는 안내를 표시합니다. 실제 프로젝트 목록의 위험 점수 영역은 연동 대기로 표시하고 샘플 점수를 실제 프로젝트에 임의 배정하지 않습니다. 기존 데모 화면 이동도 샘플 데이터임을 명시하여 유지합니다. 프로젝트 선택·생성 후에는 실제 상세 화면으로 이동합니다. 프로젝트 설정·종료는 ID 기반 경로에서 연결했으며, 팀 관리는 프로젝트별 경로에서 연결했고, 작업 관리도 프로젝트별 경로에서 연결했습니다. 기존 `/dashboard`, `/member-home`, `/settings` 등은 여전히 샘플 화면입니다. 실제 프로젝트 상세에서 샘플 화면으로 연결하지 않습니다.

1. **완료:** 프로젝트 목록·생성·상세, 로딩·빈 목록·재시도, 401 시 로그인 복귀
2. **완료:** 프로젝트 설정 수정·종료
3. **완료:** 초대 링크·가입 요청·승인·팀원 역할
4. **완료:** 작업·템플릿·담당자·하위 작업·선행 작업·산출물.

체크인·이슈 API는 2026-10-10 배포 명세에 추가됐으며 다음 연결 단계입니다. 위험 점수·리스크 분석·리포트는 계속 보류합니다.


## 프로젝트 API — 2차 연결

상세 화면의 **프로젝트 설정**에서 `/projects/:projectId/settings`로 이동합니다. 서버에서 불러온 설정을 `PUT /api/projects/{projectId}`에 모두 전달하며, 실제 성공 응답을 받은 뒤에만 저장 완료를 표시합니다. 수정은 LEADER/CO_LEADER이면서 IN_PROGRESS 상태에서 가능합니다. 요일 개수·주기 일치를 검증하고, 오류가 발생해도 입력값을 유지합니다. 403/404/409는 편집을 잠그고 최신 상태 재조회를 제공합니다.

종료 화면 `/projects/:projectId/close`는 확인 체크 후 `POST /api/projects/{projectId}/close`를 본문 없이 보냅니다. 성공하면 프로젝트 목록으로 이동해 최신 상태를 조회합니다. 상세 상단의 프로젝트 목록 버튼은 항상 목록으로 이동하며, 종료된 프로젝트 상세에서는 설정 버튼을 숨깁니다. 팀원은 종료할 수 없고 이미 종료된 프로젝트는 버튼을 비활성화합니다. API 설명상 DONE도 종료 요청이 가능하며 최종 판단은 서버 응답을 따릅니다. 재개 API는 없습니다.

수정·종료의 성공 응답 스키마는 Swagger에 명시되지 않아 응답 본문에 의존하지 않습니다. 2xx(빈 응답 포함)를 처리하며, 종료 후 실제 목록을 다시 조회합니다. 브라우저 테스트 응답으로 저장 후 재조회, 400/409, 종료 실패·재시도, 중복 제출 방지와 역할별 직접 URL 접근을 검증합니다. 공유 서버의 프로젝트를 수정하거나 종료하는 테스트는 하지 않습니다.

기존 초대·팀원 관리 UI는 유지합니다. 실제 프로젝트 설정의 초대 링크와 팀원 관리 버튼은 3차 연결에서 활성화했습니다. 종료 전 작업 요약도 영역은 유지하되 작업 API 연결 대기이며, 점수·통계와 리포트는 사용자 요청으로 보류합니다. `/settings`, `/close-project`는 기존 샘플 미리보기로 유지하며 실제 저장·종료 요청을 하지 않습니다.


## 팀 관리 API — 3차 연결

2026-10-09 배포 Swagger와 실제 테스트 계정의 읽기 응답을 기준으로 연결했습니다. 일부 GET 성공 스키마가 Swagger에 없어 팀원, 가입 상태, 현재 초대 링크, 공개 초대 미리보기의 실제 응답을 확인했습니다.

- `/projects/:projectId/invite`: 초대 링크 발급·복사·재생성·비활성화, 승인 대기·참여 팀원 조회
- `/projects/:projectId/members`: 가입 승인·거절, 역할 변경, 확인 후 내보내기
- `/join?token=...`: 로그인 없이 프로젝트 이름·초대 만료 확인 → 로그인 후 원래 초대로 복귀 → 가입 요청 → 서버 가입 상태 확인
- 프로젝트 상세와 설정에서 위 경로에 접근합니다. 기존 `/invite-team`, `/members`는 샘플 미리보기 경로입니다.

초대 링크는 POST `/api/projects/{id}/invite-links`에 `{expiresInHours:168}`을 보내고 응답 token으로 현재 프론트 주소의 초대 URL을 만듭니다. 현재 링크는 GET `.../invite-links/current`, 비활성화는 DELETE `.../invite-links/{inviteId}`입니다. 재생성·비활성화에는 확인 단계가 있고 복사 성공은 Clipboard API가 성공했을 때만 표시합니다. 공개 GET `/api/invites/{token}`에는 인증 헤더를 보내지 않습니다.

가입 요청은 POST `/api/invites/{token}/join`이고 별도 본문은 없습니다. GET `/api/projects/{id}/membership`으로 PENDING/APPROVED/REJECTED/REMOVED를 조회합니다. 승인 대기 화면의 새로고침 버튼으로 서버 상태를 확인하며, 거절·내보내기 후에도 유효한 초대 링크에서 재신청할 수 있으며, 일반 팀원의 승인 대기 상태로 전환됩니다. 서버 알림이나 자동 승인 알림은 아직 구현하지 않았습니다.

팀원·대기 목록은 GET `.../members`, `.../join-requests`를 사용합니다. 승인·거절은 POST `.../members/{memberId}/approve|reject`, 역할은 PATCH `.../members/{memberId}/role`에 `{role:LEADER|CO_LEADER|MEMBER}`, 내보내기는 DELETE `.../members/{memberId}`입니다. 경로에 쓰는 ID는 사용자 ID(userId)가 아니라 프로젝트 가입 ID(id)입니다. 마지막 팀장 보호와 공동 팀장의 제거 범위를 UI에 반영하며 최종 권한은 서버가 검증합니다. 변경 후 목록과 현재 프로젝트 권한을 다시 조회합니다.

명세에 없는 이메일은 표시하지 않습니다. 작업 개수·체크인 통계·참여 요약은 영역을 유지하고 연결 대기 또는 통계 보류로 표시합니다. 프로젝트 유형 저장과 점수·통계 구현도 이전 상태를 유지합니다.

`npm run test:team`으로 HTTP 메서드·ID·요청 필드·비인증 미리보기·오류 처리를 검증합니다. 브라우저 테스트 응답으로 발급/재생성/비활성화, 승인, 역할 변경, 내보내기, 로그인 복귀, 대기 상태 복원, 만료 링크와 권한 제한을 검증했습니다. 실제 서버에서는 읽기만 확인했으며 공유 초대 링크와 팀원 상태를 변경하지 않았습니다.


## 작업 관리 API — 4차 연결 (1차)

2026-10-09 Swagger와 실제 작업·템플릿·담당자 이력 응답을 확인했습니다.

- `/projects/:projectId/tasks`: 서버 작업 목록, 미배정·막힘·취소 필터, 마감일·진행률 정렬, 작업 생성과 템플릿 미리보기/추가
- `/projects/:projectId/tasks/:taskId`: 실제 상세·설정 수정·확인 후 취소, 담당자 교체/전체 해제와 변경 이력, 하위 작업 생성·수정·삭제·완료 표시
- 프로젝트 상세의 **작업 보드** 버튼으로 접근합니다. 기존 `/task-board`, `/task/:id`, `/my-task/:id`, 작업 온보딩 등은 샘플 미리보기로 유지합니다.

작업 생성/수정은 `title`, `size`, `dueDate`, `sortOrder`만 전송합니다. 날짜를 비우면 null로 마감일을 제거하고, 수정 시 sortOrder는 null로 기존 순서를 유지합니다. 숫자 순서 입력 대신 작업 보드의 손잡이를 드래그해 순서를 변경합니다. 설정 변경으로 진행률·상태를 바꾸지 않습니다. 템플릿 종류와 작업 구성은 서버에서 조회하며, 반복 호출 시 작업이 추가되므로 명시적 확인과 중복 제출 방지를 적용합니다. 작업 취소는 기록을 보존합니다. 복구 API가 없어 복구 UI는 연결 대기로 유지합니다.

담당자는 `memberIds`(userId 아님) 전체 목록을 PUT으로 전송하며 빈 배열은 모두 해제합니다. 하위 작업은 제목·담당자 member ID·순서를 보내고 완료 표시는 `{completed:boolean}`만 PATCH로 전송합니다. 관리자 또는 해당 하위 작업 담당자만 완료 표시할 수 있습니다. 하위 작업 생성·수정·삭제·완료 후 부모 상세까지 다시 조회하여 서버가 계산한 진행률·상태를 표시합니다. 프론트에서 진행률이나 자동 완료 상태를 임의 계산하지 않습니다. 완료·종료 프로젝트와 취소 작업은 쓰기 UI를 잠급니다.

`useApiAction`은 팀 관리에서 사용하던 중복 제출 방지·오류 처리 로직을 공용으로 분리한 것입니다. 기존 `useTeamAction`은 호환 별칭으로 유지합니다.

**4차 후속 연결 (2026-10-10):** 성공 응답 스키마가 추가되어 선행 작업 목록 조회/최종 ID 목록 저장(빈 배열로 전체 해제), 산출물 링크 조회/등록/수정/삭제를 연결했습니다. 산출물 소유자는 `createdByMemberId`를 현재 사용자의 프로젝트 멤버 ID와 비교합니다. HTTP/HTTPS 링크만 열고 새 탭에 `noopener noreferrer`를 적용합니다. 후속 작업은 프로젝트 내 작업별 선행 목록을 조회하여 역으로 찾습니다. 작업 수에 비례한 조회 요청이 발생하므로 추후 서버 일괄 관계 조회 API가 추가되면 교체할 수 있습니다.

서버 전달 정책은 하위 작업 완료율 자동 계산이지만 Swagger 완료 API 설명에는 이전 문구가 남아 있고 `Child`에는 실제 완료자 필드가 없습니다. 기존 명세의 관리자/해당 하위 작업 담당자 권한을 유지하고, 완료자 필드를 추측해 표시하지 않습니다. 실제 서버 자동 계산·완료자 기록 검증은 별도 확인이 필요합니다. 공유 서버 데이터는 검증 목적으로 변경하지 않습니다.

점수·리스크 분석과 프로젝트 유형 저장은 보류합니다. 체크인·이슈 연결은 다음 단계입니다.

`npm run test:tasks`로 요청/응답, member ID 사용, 하위 작업 완료 요청, 오류 전파를 검증합니다. 브라우저 테스트 응답으로 작업 생성·수정·담당자 저장·템플릿 추가·하위 작업 CRUD/완료·취소·역할 제한을 검증했습니다. 실제 서버에서는 목록·상세·관련 목록 조회만 수행했습니다.


작업 순서 이동은 관리자만 전체·기본 순서·취소 제외 상태에서 사용할 수 있습니다. 손잡이는 마우스/터치 포인터와 키보드 위·아래 키를 지원합니다. 드롭 즉시 화면의 순서를 바꾸고 저장 요청을 시작합니다. 저장 중에는 추가 순서 이동을 잠그고 화면은 유지합니다. 저장 직전 최신 목록의 순서를 확인하고, 변경된 작업만 기존 설정과 새 sortOrder를 PUT으로 보냅니다. 현재 일괄 순서 저장 API가 없어 여러 요청은 원자적이지 않습니다. 중간 실패 시 서버 목록을 다시 조회하여 실제 저장된 순서로 맞춥니다. 조회마저 실패하면 이전 화면으로 복원하고 최신 상태를 불러올 때까지 편집을 잠급니다. 하위 작업 순서 이동에도 동일한 방식을 적용합니다. 취소된 작업은 재정렬 요청에서 제외합니다.

## Check-in integration: current round and first submission

Project detail links to `/projects/:projectId/checkin`. The existing `/checkin` route remains a sample. The new page uses the deployed Current/Round/Target/TaskSnapshot/Submission schemas added on 2026-10-10.

GET `.../checkins/current` controls round availability and submit permissions. Targets with an excludedReason are displayed separately; every remaining target is submitted, even without edits. POST `.../checkins/{roundId}/submission` sends expectedRevision=0, each target's version and current issue revision, plus optional issueContent/requestToTeam/nextAction. Progress and task status are read-only server values.

The request key and payload are retained for explicit retries after network/5xx errors; edits are locked while the outcome is uncertain. Conflicts require reloading current state. There are no automatic mutation retries. Submission success is followed by a read of the server's submission snapshot. Timely editing is connected via PUT with the current submission revision and a new request key. The edit button rechecks the current server state before opening; only ON_TIME with canEdit=true can edit. History, team status, cumulative submission rate and separate issue resolution remain the next stages.

`npm run test:checkins` and browser fixtures cover unchanged submissions, exclusions, duplicate clicks, identical retries, conflicts, no round, closed windows and late submissions. Live server checks are read-only.

The history GET `/checkins/mine` currently has no success schema; live responses for the test account are `{items:[],nextBeforeRoundId:null}`. Item structure is pending confirmation, so a history UI is not fabricated. Eligibility guidance reflects the confirmed policy: assignee changes after check-in opens apply to the next check-in.

## Check-in overview and task issues

Project detail → team check-in overview (`/projects/:projectId/checkin-status`) uses GET summary and the current check-in's status. Cumulative percentage is derived from server submitted/eligible counts; no eligible entries displays no aggregate instead of a misleading 0%. Member rows now use the documented MemberStatus schema and display stored submission snapshots.

Task detail displays GET issue, then confirms PATCH issue/resolve with the observed expectedRevision. Administrators and main-task assignees can resolve outside the check-in window; CLOSED projects disable resolution. Conflicts use existing action error/lock handling. `npm run test:checkin-overview` checks contracts; browser fixtures verify resolution and role/project restrictions. No live mutations were used for verification.


## Check-in history and member submissions (2026-10-13)

Project detail and the check-in page link to `/projects/:projectId/checkin-history`. GET mine uses limit=20 and the server nextBeforeRoundId cursor for next/previous pages. Empty, loading, error/retry and missing submissions are handled. History and team member rows expand the submission snapshot (progress, issue, team request and next action), never the current task data. Team overview displays current check-in members, departure indicator and saved submissions. API contract tests and browser fixtures cover pagination and snapshots. Live data presentation still needs acceptance testing with real submitted records.
