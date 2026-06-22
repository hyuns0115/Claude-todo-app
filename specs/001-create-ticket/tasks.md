---
description: "Task list for 티켓 생성 (POST /api/tickets)"
---

# Tasks: 티켓 생성 (POST /api/tickets)

**Input**: Design documents from `specs/001-create-ticket/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/post-tickets.md ✅

**Status**: ✅ 구현 완료 (2026-06-18) — 10개 테스트 전체 green

**구현 완료**: `ticketService.createTicket` Drizzle ORM 교체 완료.
Route Handler, Zod 스키마, 타입, API 테스트 모두 변경 없이 유지.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 다른 파일을 다루며 선행 의존성이 없어 병렬 실행 가능
- **[US1]**: User Story 1 — 새 티켓 정상 생성
- **[US2]**: User Story 2 — 잘못된 입력 거부 (검증 에러)

---

## Phase 1: Setup (베이스라인 확인)

**Purpose**: 구현 시작 전 현재 상태가 정상임을 확인한다

- [x] T001 기존 테스트 통과 확인: `npm test` → 6개 모두 green
- [x] T002 [P] TypeScript 타입 체크 확인: `npx tsc --noEmit` → 오류 0개

---

## Phase 2: Foundational (선행 조건)

**Purpose**: 서비스 레이어가 Drizzle을 사용하기 위한 전제 조건 확인

**⚠️ CRITICAL**: 이 단계 완료 후 User Story 구현 시작

- [x] T003 `src/server/db/index.ts` Drizzle 클라이언트 설정 확인 (기존 파일, 변경 없음)
- [x] T004 `src/server/db/schema.ts`에서 `tickets` 테이블 export 확인 (기존 파일, 변경 없음)

**Checkpoint**: DB 클라이언트 준비 완료 — User Story 구현 시작 가능

---

## Phase 3: User Story 1 — 새 티켓 정상 생성 (Priority: P1) 🎯 MVP

**Goal**: 유효한 요청으로 Backlog에 티켓을 생성하고 201 응답을 반환한다

**Independent Test**: `npm test -- __tests__/services/ticketService.test.ts` 통과 + curl로 201 응답 확인

### Tests (TDD Red 단계) ⚠️

> **NOTE: 이 테스트들을 먼저 작성하고 실패(Red)함을 확인한 후 구현으로 넘어간다**

- [X] T005 [P] [US1] `__tests__/services/ticketService.test.ts` 신규 작성 — `createTicket` 정상 생성 테스트
  - `db.select` mock → `[{ minPos: null }]` (빈 Backlog)
  - `db.insert().values().returning()` mock → 티켓 객체 반환
  - 검증: `status === 'BACKLOG'`, `position === -1024`, `startedAt === null`, `completedAt === null`
- [X] T006 [P] [US1] `__tests__/services/ticketService.test.ts` — position 계산 테스트
  - 빈 Backlog (minPos=null) → position = -1024
  - Backlog에 min=1024인 티켓 존재 → position = 0
  - Backlog에 min=-1024인 티켓 존재 → position = -2048

### Implementation (Green 단계)

- [X] T007 [US1] `src/server/services/ticketService.ts` 수정 — Drizzle ORM으로 교체
  - `ticketStore`, `nextId` in-memory store 제거
  - import 추가: `db` from `@/server/db`, `tickets` from `@/server/db/schema`, `min`, `eq` from `drizzle-orm`
  - `db.select({ minPos: min(tickets.position) }).from(tickets).where(eq(tickets.status, 'BACKLOG'))` 로 min position 조회
  - `position = minPos === null ? -1024 : minPos - 1024`
  - `db.insert(tickets).values({ title: input.title.trim(), description: input.description ?? null, status: 'BACKLOG', priority: input.priority ?? 'MEDIUM', position, plannedStartDate: input.plannedStartDate ?? null, dueDate: input.dueDate ?? null }).returning()` 로 저장

**Checkpoint**: User Story 1 — `npm test -- __tests__/services/ticketService.test.ts` 통과

---

## Phase 4: User Story 2 — 잘못된 입력 거부 (Priority: P1)

**Goal**: 6가지 검증 에러 케이스가 모두 400 + VALIDATION_ERROR로 거부된다

**Independent Test**: `npm test -- __tests__/api/tickets.test.ts` — TC-API-001-3~6 통과 (기존 테스트)

> **NOTE**: 검증 로직은 `createTicketSchema` (Zod)에서 처리하며 이미 구현되어 있다.
> Route Handler도 이미 올바르게 구현되어 있다. 별도 구현 없이 기존 테스트로 검증만 한다.

- [X] T008 [US2] 기존 API 테스트 TC-API-001-3~6 통과 확인: `npm test -- __tests__/api/tickets.test.ts`
  - T008-a: 제목 누락 → 400 "제목을 입력해주세요"
  - T008-b: 제목 200자 초과 → 400 "제목은 200자 이내로 입력해주세요"
  - T008-c: 과거 마감일 → 400 "종료예정일은 오늘 이후 날짜를 선택해주세요"
  - T008-d: 잘못된 우선순위 → 400 "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요"

**Checkpoint**: User Stories 1 AND 2 — 서비스 테스트 + API 테스트 모두 통과

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 코드 정리 및 Constitution 게이트 최종 확인

- [X] T009 `src/server/services/ticketService.ts` 불필요한 import 제거 및 코드 정리
- [X] T010 전체 테스트 실행: `npm test` → 전체 green 확인
- [X] T011 [P] TypeScript 최종 확인: `npx tsc --noEmit` → 오류 0개
- [X] T012 `quickstart.md` 시나리오 수동 검증 (개발 서버에서 curl 확인) — 선택사항

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Phase 1 완료 후 — 모든 User Story 블록
- **User Story 1 (Phase 3)**: Phase 2 완료 후 — Tests(T005~T006) 먼저, 이후 Implementation(T007)
- **User Story 2 (Phase 4)**: Phase 3 완료 후 — T007 없이는 API 테스트가 DB 오류로 실패할 수 있음
- **Polish (Phase 5)**: Phase 3 + 4 완료 후

### Within Each User Story

1. 테스트 작성 (T005~T006) → 실패 확인 (Red)
2. 구현 (T007) → 테스트 통과 확인 (Green)
3. 기존 API 테스트 확인 (T008)
4. 정리 (T009~T012)

### Parallel Opportunities

- T001, T002: 병렬 실행 가능
- T003, T004: 병렬 실행 가능
- T005, T006: 같은 파일이므로 순차 (T006은 T005 완료 후 동일 파일에 추가)
- T010, T011: 병렬 실행 가능

---

## Parallel Example: User Story 1

```bash
# Phase 1 병렬 실행
npm test &              # T001
npx tsc --noEmit &      # T002
wait

# Phase 3 TDD 순서 (순차)
# T005: 정상 생성 테스트 작성
# T006: position 계산 테스트 작성
# → npm test -- __tests__/services/ticketService.test.ts (Red 확인)
# T007: Drizzle 구현
# → npm test -- __tests__/services/ticketService.test.ts (Green 확인)
```

---

## Implementation Strategy

### MVP First (User Story 1만)

1. Phase 1: 베이스라인 확인
2. Phase 2: Foundational 확인
3. Phase 3: User Story 1 (TDD)
4. **STOP and VALIDATE**: `npm test -- __tests__/services/ticketService.test.ts`

### Full Delivery

1. Phase 1~2: 준비
2. Phase 3: US1 구현 + 검증
3. Phase 4: US2 기존 테스트 확인
4. Phase 5: 정리 + 전체 검증

---

## Notes

- [P] 태스크 = 다른 파일, 선행 의존성 없음
- [Story] 레이블은 User Story와의 추적성을 위한 것
- T007 구현 전 반드시 T005~T006 테스트가 실패(Red)임을 확인
- 기존 `app/api/tickets/route.ts`, `src/shared/validations/ticket.ts`, `src/shared/types/index.ts`는 변경 없음
- 기존 `__tests__/api/tickets.test.ts` TC-API-001-1~6은 변경하지 않음
