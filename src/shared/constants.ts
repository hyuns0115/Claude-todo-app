import { TicketStatus, TicketPriority } from './types';

export const COLUMN_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.BACKLOG]: 'Backlog',
  [TicketStatus.TODO]: 'Todo',
  [TicketStatus.IN_PROGRESS]: 'In Progress',
  [TicketStatus.DONE]: 'Done',
};

export const COLUMN_ORDER: TicketStatus[] = [
  TicketStatus.BACKLOG,
  TicketStatus.TODO,
  TicketStatus.IN_PROGRESS,
  TicketStatus.DONE,
];

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: 'Low',
  [TicketPriority.MEDIUM]: 'Medium',
  [TicketPriority.HIGH]: 'High',
};

export const DONE_TICKET_RETENTION_HOURS = 24;
