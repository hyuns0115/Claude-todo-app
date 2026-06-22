/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/tickets/route';

import { db } from '../../src/server/db';

beforeEach(() => {
  (db as unknown as { _resetStore: () => void })._resetStore?.();
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/tickets', () => {
  describe('TC-API-001-1: 모든 필드를 포함한 정상 생성', () => {
    it('201과 함께 생성된 티켓을 반환한다', async () => {
      const req = makeRequest({
        title: 'API 설계 문서 작성',
        description: 'REST API 엔드포인트와 요청/응답 형식을 정의한다',
        priority: 'HIGH',
        plannedStartDate: '2026-02-10',
        dueDate: '2026-12-31',
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.title).toBe('API 설계 문서 작성');
      expect(body.description).toBe('REST API 엔드포인트와 요청/응답 형식을 정의한다');
      expect(body.status).toBe('BACKLOG');
      expect(body.priority).toBe('HIGH');
      expect(body.plannedStartDate).toBe('2026-02-10');
      expect(body.dueDate).toBe('2026-12-31');
      expect(body.startedAt).toBeNull();
      expect(body.completedAt).toBeNull();
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });
  });

  describe('TC-API-001-2: 제목만으로 최소 생성', () => {
    it('201과 함께 priority가 MEDIUM인 티켓을 반환한다', async () => {
      const req = makeRequest({ title: '최소 티켓' });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.title).toBe('최소 티켓');
      expect(body.status).toBe('BACKLOG');
      expect(body.priority).toBe('MEDIUM');
      expect(body.description).toBeNull();
      expect(body.plannedStartDate).toBeNull();
      expect(body.dueDate).toBeNull();
      expect(body.startedAt).toBeNull();
      expect(body.completedAt).toBeNull();
    });
  });

  describe('TC-API-001-3: 제목 누락', () => {
    it('400과 함께 "제목을 입력해주세요" 메시지를 반환한다', async () => {
      const req = makeRequest({ description: '제목 없음' });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목을 입력해주세요');
    });
  });

  describe('TC-API-001-4: 제목 200자 초과', () => {
    it('400과 함께 "제목은 200자 이내로 입력해주세요" 메시지를 반환한다', async () => {
      const req = makeRequest({ title: 'a'.repeat(201) });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목은 200자 이내로 입력해주세요');
    });
  });

  describe('TC-API-001-5: 과거 마감일', () => {
    it('400과 함께 "종료예정일은 오늘 이후 날짜를 선택해주세요" 메시지를 반환한다', async () => {
      const req = makeRequest({ title: '유효한 제목', dueDate: '2020-01-01' });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('종료예정일은 오늘 이후 날짜를 선택해주세요');
    });
  });

  describe('TC-API-001-6: 잘못된 우선순위 값', () => {
    it('400과 함께 "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" 메시지를 반환한다', async () => {
      const req = makeRequest({ title: '유효한 제목', priority: 'URGENT' });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요');
    });
  });

  describe('TC-API-001-4: 빈 제목', () => {
    it('400과 함께 "제목을 입력해주세요" 메시지를 반환한다', async () => {
      const req = makeRequest({ title: '' });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목을 입력해주세요');
    });
  });

  describe('TC-API-001-5: 공백만 제목', () => {
    it('400과 함께 "제목을 입력해주세요" 메시지를 반환한다', async () => {
      const req = makeRequest({ title: '   ' });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('제목을 입력해주세요');
    });
  });

  describe('TC-API-001-7: 설명 1000자 초과', () => {
    it('400과 함께 "설명은 1000자 이내로 입력해주세요" 메시지를 반환한다', async () => {
      const req = makeRequest({ title: '유효한 제목', description: 'a'.repeat(1001) });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('설명은 1000자 이내로 입력해주세요');
    });
  });

  describe('TC-API-001-10: position 자동 할당', () => {
    it('나중에 생성된 티켓의 position이 더 작다 (맨 위 배치)', async () => {
      const first = await POST(makeRequest({ title: '첫 번째 티켓' }));
      const second = await POST(makeRequest({ title: '두 번째 티켓' }));

      const firstBody = await first.json();
      const secondBody = await second.json();

      expect(first.status).toBe(201);
      expect(second.status).toBe(201);
      expect(secondBody.position).toBeLessThan(firstBody.position);
    });
  });
});
