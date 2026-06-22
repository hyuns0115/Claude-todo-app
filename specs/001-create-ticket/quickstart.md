# Quickstart: 티켓 생성 기능 검증

## Prerequisites

```bash
# DB가 실행 중이어야 함
# .env.local에 DATABASE_URL 설정 확인
echo $DATABASE_URL   # 또는
cat .env.local | grep DATABASE_URL

# 마이그레이션 적용 확인
npm run db:migrate
```

## 자동 테스트

```bash
# Route Handler 계층 검증 (TC-API-001-1 ~ TC-API-001-6)
npm test -- __tests__/api/tickets.test.ts

# 서비스 단위 테스트 (구현 후)
npm test -- __tests__/services/ticketService.test.ts

# 전체
npm test
```

## 수동 검증 (개발 서버)

```bash
npm run dev
```

### 시나리오 1: 정상 생성 (모든 필드)

```bash
curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API 설계 문서 작성",
    "description": "REST API 명세 정의",
    "priority": "HIGH",
    "plannedStartDate": "2026-06-20",
    "dueDate": "2026-12-31"
  }' | jq .
```

**Expected**: status=201, `status: "BACKLOG"`, `priority: "HIGH"`, `startedAt: null`, `completedAt: null`

### 시나리오 2: 최소 생성 (제목만)

```bash
curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title": "최소 티켓"}' | jq .
```

**Expected**: status=201, `priority: "MEDIUM"`, `description: null`

### 시나리오 3: position 맨 위 배치 확인

```bash
# 두 번 연속 생성 후 position 확인
curl -s -X POST http://localhost:3000/api/tickets \
  -d '{"title": "첫 번째"}' -H "Content-Type: application/json" | jq .position

curl -s -X POST http://localhost:3000/api/tickets \
  -d '{"title": "두 번째"}' -H "Content-Type: application/json" | jq .position
```

**Expected**: 첫 번째=-1024, 두 번째=-2048 (각각 맨 위 배치)

### 시나리오 4: 검증 에러

```bash
# 제목 없음
curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"description": "제목 없음"}' | jq .
```

**Expected**: status=400, `error.code: "VALIDATION_ERROR"`, `error.message: "제목을 입력해주세요"`

## 타입 체크

```bash
npx tsc --noEmit
```

**Expected**: 오류 없음
