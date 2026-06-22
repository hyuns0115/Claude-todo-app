import '@testing-library/jest-dom';

jest.mock('@/server/db/schema', () => ({ tickets: {} }));
jest.mock('drizzle-orm', () => ({ min: jest.fn((col: unknown) => col), eq: jest.fn() }));

jest.mock('@/server/db', () => {
  // 테스트마다 초기화되는 인메모리 스토어
  const store: { position: number | null } = { position: null };

  const mockWhere = jest.fn().mockImplementation(() =>
    Promise.resolve([{ minPos: store.position }])
  );
  const mockFrom = jest.fn(() => ({ where: mockWhere }));
  const mockSelect = jest.fn(() => ({ from: mockFrom }));
  const mockValues = jest.fn((vals: Record<string, unknown>) => ({
    returning: jest.fn().mockImplementation(() => {
      // insert 후 store 갱신
      const pos = vals.position as number;
      if (store.position === null || pos < store.position) {
        store.position = pos;
      }
      return Promise.resolve([{
        id: Math.floor(Math.random() * 1000) + 1,
        ...vals,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }),
  }));
  const mockInsert = jest.fn(() => ({ values: mockValues }));

  // beforeEach에서 store를 리셋할 수 있도록 노출
  const db = { select: mockSelect, insert: mockInsert };
  (db as unknown as { _resetStore: () => void })._resetStore = () => {
    store.position = null;
  };

  return { db };
});
