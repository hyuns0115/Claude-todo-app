# Research: 티켓 생성 (POST /api/tickets)

## 현황 분석

기존 코드에서 이미 구현된 부분과 교체/수정이 필요한 부분을 분리한다.

---

### Decision 1: Zod 스키마 재사용 여부

**Decision**: 기존 `src/shared/validations/ticket.ts`의 `createTicketSchema`를 그대로 사용한다.

**Rationale**: API_SPEC.md의 검증 규칙(제목 1~200자, 공백 불가, description 1000자, priority enum, dueDate 오늘 이후)을 이미 정확히 구현하고 있다. 기존 테스트 TC-API-001-1~6도 이 스키마를 기준으로 통과 중이다.

**Alternatives considered**: 수정 없이 유지 vs 재작성 — 재작성 이유 없음.

---

### Decision 2: ticketService.createTicket 구현 방식

**Decision**: 기존 in-memory store(`ticketStore`, `nextId`)를 제거하고 Drizzle ORM으로 교체한다.

**Rationale**: in-memory store는 테스트용 임시 구현이다. 서버 재시작 시 데이터가 소실되고, Vercel serverless 환경에서는 인스턴스 간 상태를 공유할 수 없다.

**구현 패턴**:
```
1. db.select({ minPos: min(tickets.position) })
     .from(tickets)
     .where(eq(tickets.status, 'BACKLOG'))
   → minPos가 null(빈 Backlog)이면 -1024, 아니면 minPos - 1024

2. db.insert(tickets)
     .values({ title, description, status: 'BACKLOG', priority, position, ... })
     .returning()
```

**Alternatives considered**: `orderBy(asc(tickets.position)).limit(1)` → min() aggregate가 더 명시적이고 쿼리 1개로 처리 가능.

---

### Decision 3: 빈 Backlog의 position 초기값

**Decision**: Backlog가 비어 있을 때 position = **-1024** (0 - 1024).

**Rationale**: API_SPEC.md 응답 예시에서 첫 번째 티켓의 position이 -1024로 표시된다. 또한 spec.md Assumption에도 "Backlog가 비어 있을 때 position 초기값은 0 - 1024 = -1024"로 명시되어 있다.

**현재 버그**: 기존 in-memory 코드는 빈 Backlog에서 `0`을 반환한다 → **수정 필요**.

**수정**: `minPos === null ? -1024 : minPos - 1024`

---

### Decision 4: Route Handler 변경 여부

**Decision**: `app/api/tickets/route.ts`의 POST 핸들러 구조는 유지한다.

**Rationale**: 이미 올바른 패턴(Zod 검증 → 서비스 호출 → 응답 반환)을 따르고 있다. 서비스 함수명(`createTicket`)과 스키마(`createTicketSchema`)도 일치한다.

**Alternatives considered**: 변경 없음.

---

### Decision 5: 테스트 전략

**Decision**: 기존 `__tests__/api/tickets.test.ts`의 TC-API-001-1~6을 그대로 유지한다. 서비스 단위 테스트는 `__tests__/services/ticketService.test.ts`에 별도 작성한다.

**Rationale**: 기존 API 테스트는 Route Handler 계층을 검증하고, 서비스 테스트는 비즈니스 로직(position 계산 등)을 검증한다. 두 계층의 책임이 다르다.

**DB 모킹 전략**: 서비스 테스트에서 Drizzle `db`를 Jest mock으로 처리하여 실제 DB 없이 실행한다.
