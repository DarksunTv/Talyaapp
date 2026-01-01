import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// DISABLED FOR LOCAL DEVELOPMENT
// Authentication is skipped - re-enable for production
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],  // Empty matcher = middleware doesn't run
}
