# Data Model: 티켓 생성 (POST /api/tickets)

> 상세 스키마 정의: `docs/DATA_MODEL.md`
> Drizzle 스키마: `src/server/db/schema.ts`

---

## 관련 엔티티: Ticket

### 생성 시 입력 필드 (CreateTicketInput)

| 필드 | 타입 | 필수 | 제약 | 기본값 |
|------|------|------|------|--------|
| title | string | ✅ | 1~200자, trim 후 빈 문자열 불가 | — |
| description | string | ❌ | 최대 1000자 | null |
| priority | LOW\|MEDIUM\|HIGH | ❌ | enum | MEDIUM |
| plannedStartDate | string | ❌ | YYYY-MM-DD | null |
| dueDate | string | ❌ | YYYY-MM-DD, 오늘 이후 | null |

### 생성 시 시스템 설정 필드

| 필드 | 값 | 설명 |
|------|-----|------|
| status | `BACKLOG` | 항상 고정 |
| position | `min(BACKLOG.position) - 1024` | Backlog 맨 위 배치. 빈 경우 -1024 |
| startedAt | `null` | 시스템 관리 (TODO 이동 시 설정) |
| completedAt | `null` | 시스템 관리 (Done 이동 시 설정) |
| createdAt | `now()` | DB 자동 설정 |
| updatedAt | `now()` | DB 자동 설정 |

### 응답 필드 (Ticket)

생성 후 반환되는 전체 필드:

```
id, title, description, status, priority, position,
plannedStartDate, dueDate, startedAt, completedAt,
createdAt, updatedAt
```

---

## Position 계산 규칙

```
Backlog 티켓이 있을 때:
  newPosition = min(기존 Backlog position) - 1024

Backlog가 비어 있을 때:
  newPosition = -1024  (= 0 - 1024)
```

**예시**:

| 상황 | 기존 positions | 새 position |
|------|----------------|-------------|
| Backlog 비어 있음 | [] | -1024 |
| 티켓 1개 존재 | [1024] | 0 |
| 티켓 2개 존재 | [0, 1024] | -1024 |
| 티켓 3개 존재 | [-1024, 0, 1024] | -2048 |

---

## 검증 실패 → 에러 매핑

| 조건 | HTTP | code | message |
|------|------|------|---------|
| title 없음 | 400 | VALIDATION_ERROR | 제목을 입력해주세요 |
| title 공백만 | 400 | VALIDATION_ERROR | 제목을 입력해주세요 |
| title 201자 | 400 | VALIDATION_ERROR | 제목은 200자 이내로 입력해주세요 |
| description 1001자 | 400 | VALIDATION_ERROR | 설명은 1000자 이내로 입력해주세요 |
| priority 허용 외 값 | 400 | VALIDATION_ERROR | 우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요 |
| dueDate 과거 날짜 | 400 | VALIDATION_ERROR | 종료예정일은 오늘 이후 날짜를 선택해주세요 |
