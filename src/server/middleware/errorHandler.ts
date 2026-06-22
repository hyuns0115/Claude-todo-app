import { NextResponse } from 'next/server';

export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'TICKET_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

export function errorResponse(
  code: AppErrorCode,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function notFound(message = '티켓을 찾을 수 없습니다'): NextResponse {
  return errorResponse('TICKET_NOT_FOUND', message, 404);
}

export function internalError(message = '서버 오류가 발생했습니다'): NextResponse {
  return errorResponse('INTERNAL_SERVER_ERROR', message, 500);
}
