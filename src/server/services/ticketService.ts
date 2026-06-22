import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { CreateTicketInput, Ticket, TicketPriority, TicketStatus } from '@/shared/types';
import { eq, min } from 'drizzle-orm';

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const [{ minPos }] = await db
    .select({ minPos: min(tickets.position) })
    .from(tickets)
    .where(eq(tickets.status, TicketStatus.BACKLOG));

  const position = minPos === null ? -1024 : minPos - 1024;

  const [row] = await db
    .insert(tickets)
    .values({
      title: input.title.trim(),
      description: input.description ?? null,
      status: TicketStatus.BACKLOG,
      priority: input.priority ?? TicketPriority.MEDIUM,
      position,
      plannedStartDate: input.plannedStartDate ?? null,
      dueDate: input.dueDate ?? null,
    })
    .returning();

  return row as unknown as Ticket;
}
