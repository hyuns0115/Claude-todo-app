import { Ticket, CreateTicketInput } from '@/shared/types';

export const fetchTickets = async (): Promise<Ticket[]> => {
  const res = await fetch('/api/tickets');
  if (!res.ok) throw new Error('티켓 목록을 불러오지 못했습니다');
  return res.json();
};

export const createTicket = async (input: CreateTicketInput): Promise<Ticket> => {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message ?? '티켓 생성에 실패했습니다');
  }
  return res.json();
};

export const updateTicket = async (
  id: number,
  data: Partial<Pick<Ticket, 'title' | 'description' | 'priority' | 'plannedStartDate' | 'dueDate'>>,
): Promise<Ticket> => {
  const res = await fetch(`/api/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message ?? '티켓 수정에 실패했습니다');
  }
  return res.json();
};

export const deleteTicket = async (id: number): Promise<void> => {
  const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message ?? '티켓 삭제에 실패했습니다');
  }
};

export const completeTicket = async (id: number): Promise<Ticket> => {
  const res = await fetch(`/api/tickets/${id}/complete`, { method: 'PATCH' });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message ?? '티켓 완료 처리에 실패했습니다');
  }
  return res.json();
};

export const reorderTickets = async (tickets: { id: number; status: string; position: number }[]): Promise<void> => {
  const res = await fetch('/api/tickets/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tickets }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message ?? '티켓 순서 변경에 실패했습니다');
  }
};
