import { createTicket } from '@/server/services/ticketService';
import { createTicketSchema } from '@/shared/validations/ticket';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = createTicketSchema.safeParse(body);

  if (!result.success) {
    const message = result.error.errors[0].message;
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 },
    );
  }

  const ticket = await createTicket(result.data);
  return NextResponse.json(ticket, { status: 201 });
}
