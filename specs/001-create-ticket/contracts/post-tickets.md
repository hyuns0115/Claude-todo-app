# Contract: POST /api/tickets

> Source: `docs/API_SPEC.md` §1

## Request

**Method**: `POST`
**Path**: `/api/tickets`
**Content-Type**: `application/json`

### Body Schema

```typescript
// src/shared/validations/ticket.ts — createTicketSchema
{
  title: string           // required, 1~200자, trim 후 비어있으면 거부
  description?: string    // optional, ≤1000자
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'   // optional, 기본값 MEDIUM
  plannedStartDate?: string  // optional, YYYY-MM-DD
  dueDate?: string           // optional, YYYY-MM-DD, 오늘 이후
}
```

### Example

```json
{
  "title": "API 설계 문서 작성",
  "description": "REST API 엔드포인트와 요청/응답 형식을 정의한다",
  "priority": "HIGH",
  "plannedStartDate": "2026-02-10",
  "dueDate": "2026-12-31"
}
```

---

## Response

### 201 Created

```typescript
{
  id: number
  title: string
  description: string | null
  status: 'BACKLOG'          // 항상 BACKLOG
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  position: number           // min(BACKLOG.position) - 1024
  plannedStartDate: string | null   // YYYY-MM-DD
  dueDate: string | null            // YYYY-MM-DD
  startedAt: null            // 항상 null
  completedAt: null          // 항상 null
  createdAt: string          // ISO 8601
  updatedAt: string          // ISO 8601
}
```

### 400 Bad Request

```typescript
{
  error: {
    code: 'VALIDATION_ERROR'
    message: string   // 사용자에게 표시 가능한 한국어 메시지
  }
}
```

| 조건 | message |
|------|---------|
| title 없음 또는 공백 | "제목을 입력해주세요" |
| title 200자 초과 | "제목은 200자 이내로 입력해주세요" |
| description 1000자 초과 | "설명은 1000자 이내로 입력해주세요" |
| priority 허용 외 값 | "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| dueDate 과거 날짜 | "종료예정일은 오늘 이후 날짜를 선택해주세요" |

---

## Implementation Checklist

- [ ] Route Handler: `app/api/tickets/route.ts` — POST 핸들러
- [ ] Validation: `createTicketSchema.safeParse(body)` 사용
- [ ] Service: `ticketService.createTicket(input)` — Drizzle ORM으로 교체
- [ ] Position: `min(BACKLOG.position) - 1024`, 빈 경우 -1024
- [ ] 응답: `NextResponse.json(ticket, { status: 201 })`
