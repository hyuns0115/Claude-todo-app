# Feature Specification: 티켓 생성 (POST /api/tickets)

**Feature Branch**: `001-create-ticket`

**Created**: 2026-06-18

**Status**: Implemented

**Source**: `docs/API_SPEC.md` — §1. POST /api/tickets, 관련 FR: FR-001

**구현 완료**: `src/server/services/ticketService.ts` (Drizzle ORM), `app/api/tickets/route.ts`, `src/shared/validations/ticket.ts`
**테스트**: `__tests__/api/tickets.test.ts` (TC-API-001-1~6 ✅), `__tests__/services/ticketService.test.ts` (4개 ✅)

---

## User Scenarios & Testing

### User Story 1 - 새 티켓 생성 (Priority: P1)

사용자가 Backlog에 새 티켓을 추가한다. 제목은 필수이며, 나머지 필드는 선택이다.

**Why this priority**: 티켓 생성은 칸반 보드의 핵심 진입점으로, 이 기능 없이는 다른 기능(수정·이동·완료·삭제)이 의미 없다.

**Independent Test**: 제목만 입력해 생성 요청을 보내면 201과 함께 `status: BACKLOG`, `priority: MEDIUM`인 티켓이 반환된다.

**Acceptance Scenarios**:

1. **Given** 유효한 제목(1~200자)만 포함한 요청, **When** POST /api/tickets, **Then** 201 + 티켓 전체 데이터 반환. `status=BACKLOG`, `priority=MEDIUM`, `startedAt=null`, `completedAt=null`
2. **Given** 모든 선택 필드(description, priority, plannedStartDate, dueDate) 포함 요청, **When** POST /api/tickets, **Then** 201 + 요청 값이 정확히 반영된 티켓 반환
3. **Given** Backlog에 기존 티켓이 있는 상태, **When** 새 티켓 생성, **Then** 새 티켓의 position이 기존 min(position) - 1024로 설정 (맨 위 배치)
4. **Given** Backlog가 비어 있는 상태, **When** 새 티켓 생성, **Then** position = -1024 (기본 min(0) - 1024)

---

### User Story 2 - 잘못된 입력 거부 (Priority: P1)

유효하지 않은 요청은 명확한 에러 메시지와 함께 거부된다.

**Why this priority**: 검증 실패 시 사용자에게 무엇을 고쳐야 하는지 즉시 알려야 사용성이 보장된다.

**Independent Test**: 제목 없이 요청하면 400 + `{ error: { code: "VALIDATION_ERROR", message: "제목을 입력해주세요" } }` 반환.

**Acceptance Scenarios**:

1. **Given** title 필드 없음, **When** POST /api/tickets, **Then** 400 + VALIDATION_ERROR + "제목을 입력해주세요"
2. **Given** title이 공백만(trim 후 빈 문자열), **When** POST /api/tickets, **Then** 400 + VALIDATION_ERROR + "제목을 입력해주세요"
3. **Given** title이 201자, **When** POST /api/tickets, **Then** 400 + VALIDATION_ERROR + "제목은 200자 이내로 입력해주세요"
4. **Given** description이 1001자, **When** POST /api/tickets, **Then** 400 + VALIDATION_ERROR + "설명은 1000자 이내로 입력해주세요"
5. **Given** priority가 "URGENT"(허용 외 값), **When** POST /api/tickets, **Then** 400 + VALIDATION_ERROR + "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요"
6. **Given** dueDate가 과거 날짜(예: 2020-01-01), **When** POST /api/tickets, **Then** 400 + VALIDATION_ERROR + "종료예정일은 오늘 이후 날짜를 선택해주세요"

---

### Edge Cases

- title이 정확히 200자이면 통과해야 한다
- description이 정확히 1000자이면 통과해야 한다
- dueDate가 오늘 날짜이면 통과해야 한다
- plannedStartDate는 과거 날짜도 허용된다 (제약 없음)
- priority 미전송 시 기본값 MEDIUM이 저장되어야 한다

---

## Requirements

### Functional Requirements

- **FR-001-1**: 시스템은 title, description, priority, plannedStartDate, dueDate를 받아 새 티켓을 생성해야 한다
- **FR-001-2**: 생성된 티켓의 status는 항상 `BACKLOG`이어야 한다
- **FR-001-3**: priority 미전송 시 `MEDIUM`을 기본값으로 저장해야 한다
- **FR-001-4**: position은 Backlog 칼럼의 `min(position) - 1024`로 설정해야 한다 (맨 위 배치)
- **FR-001-5**: createdAt, updatedAt은 생성 시각으로 자동 설정해야 한다
- **FR-001-6**: startedAt, completedAt은 null로 초기화해야 한다
- **FR-001-7**: title은 1~200자, trim 후 빈 문자열 불가
- **FR-001-8**: description은 최대 1000자 (선택)
- **FR-001-9**: priority는 LOW | MEDIUM | HIGH 중 하나 (선택)
- **FR-001-10**: plannedStartDate는 YYYY-MM-DD 형식 (선택, 날짜 제약 없음)
- **FR-001-11**: dueDate는 YYYY-MM-DD 형식, 오늘 이후 날짜만 허용 (선택)
- **FR-001-12**: 검증 실패 시 `{ error: { code: "VALIDATION_ERROR", message: "..." } }` 형식으로 400 반환

### Key Entities

- **Ticket**: id, title, description, status, priority, position, plannedStartDate, dueDate, startedAt, completedAt, createdAt, updatedAt

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 유효한 요청이 들어오면 1초 이내에 201 응답과 생성된 티켓 데이터를 반환한다
- **SC-002**: 모든 검증 에러 케이스(6가지)에 대해 API_SPEC.md에 정의된 메시지와 정확히 일치하는 응답을 반환한다
- **SC-003**: 새 티켓이 Backlog 맨 위(최소 position)에 배치된다
- **SC-004**: 기존 테스트 케이스 TC-API-001-1 ~ TC-API-001-6이 모두 통과한다

---

## Assumptions

- MVP이므로 인증 없이 누구나 티켓을 생성할 수 있다
- Backlog가 비어 있을 때 position 초기값은 `0 - 1024 = -1024`이다
- plannedStartDate는 dueDate보다 이전이어야 한다는 제약은 MVP에서 적용하지 않는다
- 에러 응답 시 첫 번째 검증 오류만 반환한다 (Zod errors[0])
