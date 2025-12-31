import { NextResponse } from 'next/server'

/**
 * Standard API response helpers
 */

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      error: {
        message,
        code: code ?? `ERR_${status}`,
      },
    },
    { status }
  )
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401, 'ERR_UNAUTHORIZED')
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403, 'ERR_FORBIDDEN')
}

export function notFoundResponse(message = 'Not found') {
  return errorResponse(message, 404, 'ERR_NOT_FOUND')
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      error: {
        message: 'Validation failed',
        code: 'ERR_VALIDATION',
        details: errors,
      },
    },
    { status: 422 }
  )
}

export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 500, 'ERR_SERVER')
}
