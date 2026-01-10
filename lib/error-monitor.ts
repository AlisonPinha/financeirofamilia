/**
 * Error Monitoring - Lightweight error tracking
 *
 * This module provides error tracking that can be easily replaced with
 * Sentry or other error monitoring services later.
 *
 * To integrate Sentry:
 * 1. npm install @sentry/nextjs
 * 2. Replace captureException/captureMessage with Sentry.captureException/captureMessage
 * 3. Initialize Sentry in sentry.client.config.ts and sentry.server.config.ts
 */

import { logger } from "./logger"

interface ErrorContext {
  user?: { id: string; email?: string }
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  level?: "fatal" | "error" | "warn" | "info"
}

interface BreadcrumbData {
  category?: string
  message: string
  data?: Record<string, unknown>
  level?: "debug" | "info" | "warning" | "error"
}

// In-memory breadcrumb trail (last 50 events)
const breadcrumbs: BreadcrumbData[] = []
const MAX_BREADCRUMBS = 50

// User context for current session
let currentUser: { id: string; email?: string } | null = null

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string } | null): void {
  currentUser = user
}

/**
 * Add a breadcrumb for context in error reports
 */
export function addBreadcrumb(data: BreadcrumbData): void {
  breadcrumbs.push({
    ...data,
    level: data.level || "info",
  })

  // Keep only last MAX_BREADCRUMBS
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift()
  }
}

/**
 * Capture an exception
 */
export function captureException(
  error: Error | unknown,
  context?: ErrorContext
): string {
  const errorId = generateErrorId()
  const errorObject = error instanceof Error ? error : new Error(String(error))

  // Log the error with full context
  logger.error(errorObject.message, {
    errorId,
    name: errorObject.name,
    stack: errorObject.stack,
    user: context?.user ?? currentUser ?? undefined,
    tags: context?.tags,
    extra: context?.extra,
    breadcrumbs: breadcrumbs.slice(-10), // Last 10 breadcrumbs
  })

  // In production, this would send to Sentry or similar service
  // Sentry.captureException(error, { extra: { errorId, ...context } })

  return errorId
}

/**
 * Capture a message (for non-exception errors)
 */
export function captureMessage(
  message: string,
  context?: ErrorContext
): string {
  const errorId = generateErrorId()
  const level = context?.level ?? "info"

  logger[level === "fatal" ? "error" : level](message, {
    errorId,
    user: context?.user ?? currentUser ?? undefined,
    tags: context?.tags,
    extra: context?.extra,
    breadcrumbs: breadcrumbs.slice(-5),
  })

  return errorId
}

/**
 * Generate unique error ID for tracking
 */
function generateErrorId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `err_${timestamp}_${random}`
}

/**
 * Initialize error monitoring (call at app start)
 */
export function initErrorMonitoring(options?: {
  dsn?: string
  environment?: string
  release?: string
}): void {
  // Log initialization
  logger.info("Error monitoring initialized", {
    environment: options?.environment ?? process.env.NODE_ENV,
    release: options?.release ?? process.env.NEXT_PUBLIC_APP_VERSION,
    hasDsn: !!options?.dsn,
  })

  // In production with Sentry:
  // Sentry.init({
  //   dsn: options?.dsn,
  //   environment: options?.environment,
  //   release: options?.release,
  //   tracesSampleRate: 0.1,
  // })
}

/**
 * Wrap an async function with error capturing
 */
export function withErrorCapture<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Omit<ErrorContext, "extra">
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      captureException(error, {
        ...context,
        extra: { args },
      })
      throw error
    }
  }
}

/**
 * Create scoped error context
 */
export function createScope(
  scopeContext: ErrorContext
): {
  captureException: (error: Error | unknown, extra?: ErrorContext) => string
  captureMessage: (message: string, extra?: ErrorContext) => string
  addBreadcrumb: (data: BreadcrumbData) => void
} {
  return {
    captureException: (error, extra) =>
      captureException(error, { ...scopeContext, ...extra }),
    captureMessage: (message, extra) =>
      captureMessage(message, { ...scopeContext, ...extra }),
    addBreadcrumb,
  }
}

// Export for React Error Boundary usage
export class ErrorBoundaryHandler {
  static handleError(error: Error, errorInfo: { componentStack: string }): void {
    captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
      tags: {
        type: "react-error-boundary",
      },
    })
  }
}
