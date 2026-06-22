# Implementation Plan: 티켓 생성 (POST /api/tickets)

**Branch**: `001-create-ticket` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md) | **Status**: ✅ Implemented

**Input**: Feature specification from `specs/001-create-ticket/spec.md`

---

## Summary

새 티켓을 Backlog 맨 위에 생성하는 `POST /api/tickets` 엔드포인트 구현 완료.

**구현 완료**: `ticketService.createTicket`이 Drizzle ORM으로 교체되었다.
**테스트**: `npm test` 10개 전체 green (`api/tickets.test.ts` 6개 + `services/ticketService.test.ts` 4개).

---

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)

**Primary Dependencies**: Next.js 15 (App Router), Drizzle ORM 0.38, Zod 3, pg 8

**Storage**: PostgreSQL — `src/server/db/index.ts` (Drizzle + node-postgres Pool)

**Testing**: Jest 29 + React Testing Library, `@jest-environment node` for API tests

**Target Platform**: Vercel serverless (로컬 개발: node-postgres)

**Project Type**: web-service (Next.js App Router)

**Performance Goals**: API 응답 p95 < 300ms (TRD §10)

**Constraints**: TypeScript strict, Drizzle ORM만 사용 (raw SQL 금지), 레이어 경계 준수

**Scale/Scope**: MVP 단일 사용자, tickets 테이블 단일 엔티티

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. TypeScript Strict Mode | `tsc --noEmit` 오류 0개 | ✅ 통과 (기존 코드 오류 없음) |
| II. API Contract Fidelity | 응답이 `docs/API_SPEC.md` §1과 일치 | ✅ Route Handler 구조 일치 확인 |
| III. Unified Error Response | `{ error: { code, message } }` 형식만 사용 | ✅ Route Handler에서 동일 형식 사용 중 |
| IV. Zod Validation | 모든 요청에 `createTicketSchema.safeParse()` | ✅ 이미 구현됨 |
| V. Service Layer Separation | 비즈니스 로직이 `ticketService.ts`에만 존재 | ✅ Drizzle ORM 교체 완료, 10개 테스트 통과 |

**Post-design Re-check**: 5개 원칙 전체 통과 확정.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-create-ticket/
├── plan.md          # 이 파일
├── spec.md          # 기능 명세
├── research.md      # 기술 결정 근거
├── data-model.md    # 엔티티 및 검증 규칙
├── quickstart.md    # 검증 시나리오
├── contracts/
│   └── post-tickets.md   # API 계약 명세
└── checklists/
    └── requirements.md   # 스펙 품질 체크리스트
```

### Source Code

```text
app/
└── api/tickets/
    └── route.ts              # POST 핸들러 (기존, 구조 유지)

src/
├── server/
│   ├── db/
│   │   ├── index.ts          # Drizzle 클라이언트 (기존)
│   │   └── schema.ts         # tickets 테이블 (기존)
│   └── services/
│       └── ticketService.ts  # createTicket — Drizzle ORM ✅ 완료
└── shared/
    ├── types/
    │   └── index.ts          # Ticket, CreateTicketInput (기존, 변경 없음)
    └── validations/
        └── ticket.ts         # createTicketSchema (기존, 변경 없음)

__tests__/
├── api/
│   └── tickets.test.ts       # TC-API-001-1~6 (기존, 변경 없음)
└── services/
    └── ticketService.test.ts # 신규 — position 계산, Drizzle 호출 검증
```

**Structure Decision**: Next.js App Router 패턴. Route Handler가 얇은 진입점, 비즈니스 로직은 서비스 레이어에 집중.

---

## Implementation Steps

### ✅ Step 1 — 서비스 테스트 작성 (Red)

`__tests__/services/ticketService.test.ts` 신규 작성.
- `db`를 Jest mock으로 처리
- 검증 항목: position 계산(빈 Backlog → -1024, 비어있지 않음 → min-1024), Drizzle insert 호출 여부, 반환값 구조

### ✅ Step 2 — ticketService.createTicket Drizzle 교체 (Green)

`src/server/services/ticketService.ts` 수정:
- in-memory store(`ticketStore`, `nextId`) 제거
- `db`, `tickets`, `min`, `eq` import
- `db.select({ minPos: min(tickets.position) }).from(tickets).where(eq(tickets.status, 'BACKLOG'))` 로 min position 조회
- `position = minPos === null ? -1024 : minPos - 1024`
- `db.insert(tickets).values({...}).returning()` 로 저장 후 반환

### ✅ Step 3 — 타입 정합성 확인

- `ticketStore` 제거 후 `tsc --noEmit` 통과 확인
- 기존 API 테스트(`tickets.test.ts`) 계속 통과 확인

### ✅ Step 4 — Refactor

- 서비스 함수 시그니처 정리
- 불필요한 import 제거
