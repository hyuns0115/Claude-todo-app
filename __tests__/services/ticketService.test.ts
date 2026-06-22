/**
 * @jest-environment node
 */

jest.mock('@/server/db/schema', () => ({ tickets: {} }));
jest.mock('drizzle-orm', () => ({ min: jest.fn((col) => col), eq: jest.fn() }));

const mockReturning = jest.fn();
const mockValues = jest.fn(() => ({ returning: mockReturning }));
const mockInsert = jest.fn(() => ({ values: mockValues }));
const mockWhere = jest.fn();
const mockFrom = jest.fn(() => ({ where: mockWhere }));
const mockSelect = jest.fn(() => ({ from: mockFrom }));

jest.mock('@/server/db', () => ({
  db: {
    get select() { return mockSelect; },
    get insert() { return mockInsert; },
  },
}));

import { createTicket } from '../../src/server/services/ticketService';

describe('ticketService.createTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ returning: mockReturning });
  });

  describe('T005: 정상 생성', () => {
    it('빈 Backlog에 티켓을 생성하면 position=-1024로 저장한다', async () => {
      const now = new Date();
      const ticket = {
        id: 1, title: '첫 티켓', description: null, status: 'BACKLOG', priority: 'MEDIUM',
        position: -1024, plannedStartDate: null, dueDate: null,
        startedAt: null, completedAt: null, createdAt: now, updatedAt: now,
      };
      mockWhere.mockResolvedValueOnce([{ minPos: null }]);
      mockReturning.mockResolvedValueOnce([ticket]);

      const result = await createTicket({ title: '첫 티켓' });

      expect(result.status).toBe('BACKLOG');
      expect(result.position).toBe(-1024);
      expect(result.startedAt).toBeNull();
      expect(result.completedAt).toBeNull();
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('T006: position 계산', () => {
    it('빈 Backlog (minPos=null) → position = -1024', async () => {
      const ticket = { id: 1, title: 'T', description: null, status: 'BACKLOG', priority: 'MEDIUM', position: -1024, plannedStartDate: null, dueDate: null, startedAt: null, completedAt: null, createdAt: new Date(), updatedAt: new Date() };
      mockWhere.mockResolvedValueOnce([{ minPos: null }]);
      mockReturning.mockResolvedValueOnce([ticket]);

      const result = await createTicket({ title: 'T' });
      expect(result.position).toBe(-1024);
    });

    it('Backlog에 min=1024인 티켓 존재 → position = 0', async () => {
      const ticket = { id: 2, title: 'T', description: null, status: 'BACKLOG', priority: 'MEDIUM', position: 0, plannedStartDate: null, dueDate: null, startedAt: null, completedAt: null, createdAt: new Date(), updatedAt: new Date() };
      mockWhere.mockResolvedValueOnce([{ minPos: 1024 }]);
      mockReturning.mockResolvedValueOnce([ticket]);

      const result = await createTicket({ title: 'T' });
      expect(result.position).toBe(0);
    });

    it('Backlog에 min=-1024인 티켓 존재 → position = -2048', async () => {
      const ticket = { id: 3, title: 'T', description: null, status: 'BACKLOG', priority: 'MEDIUM', position: -2048, plannedStartDate: null, dueDate: null, startedAt: null, completedAt: null, createdAt: new Date(), updatedAt: new Date() };
      mockWhere.mockResolvedValueOnce([{ minPos: -1024 }]);
      mockReturning.mockResolvedValueOnce([ticket]);

      const result = await createTicket({ title: 'T' });
      expect(result.position).toBe(-2048);
    });
  });
});
