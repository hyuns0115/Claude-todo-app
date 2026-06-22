import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

export function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const message = result.error.errors[0].message;
  return {
    success: false,
    response: NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 },
    ),
  };
}
