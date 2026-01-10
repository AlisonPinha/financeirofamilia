/**
 * Rate Limiting In-Memory para APIs
 *
 * Limitação simples baseada em IP para prevenir abuse.
 * Em produção com múltiplas instâncias, considerar usar Redis (Upstash).
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimit = new Map<string, RateLimitRecord>()

// Configurações padrão
const DEFAULT_WINDOW_MS = 60 * 1000 // 1 minuto
const DEFAULT_MAX_REQUESTS = 100 // 100 requests por minuto

// Limpar registros antigos periodicamente (evitar memory leak)
const CLEANUP_INTERVAL_MS = 60 * 1000 // 1 minuto
const MAX_RECORDS = 10000

let lastCleanup = Date.now()

function cleanupOldRecords() {
  const now = Date.now()

  // Só limpar se passou tempo suficiente
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return
  }

  lastCleanup = now

  // Limpar registros expirados
  const entries = Array.from(rateLimit.entries())
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimit.delete(key)
    }
  }

  // Se ainda tiver muitos registros, limpar os mais antigos
  if (rateLimit.size > MAX_RECORDS) {
    const allEntries = Array.from(rateLimit.entries())
    allEntries.sort((a, b) => a[1].resetTime - b[1].resetTime)

    const toDelete = allEntries.slice(0, allEntries.length - MAX_RECORDS)
    for (const [key] of toDelete) {
      rateLimit.delete(key)
    }
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Verifica se um identificador (IP, userId) pode fazer uma requisição
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now()

  // Limpar registros antigos
  cleanupOldRecords()

  const record = rateLimit.get(identifier)

  // Novo registro ou expirado
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    rateLimit.set(identifier, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    }
  }

  // Limite atingido
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // Incrementar contador
  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Configurações de rate limit por tipo de endpoint
 */
export const rateLimitConfigs = {
  // APIs sensíveis (auth, OCR)
  strict: { maxRequests: 20, windowMs: 60 * 1000 }, // 20/min

  // APIs normais (CRUD)
  normal: { maxRequests: 100, windowMs: 60 * 1000 }, // 100/min

  // APIs de leitura (GET)
  read: { maxRequests: 200, windowMs: 60 * 1000 }, // 200/min
}

/**
 * Helper para extrair IP da request
 */
export function getClientIP(request: Request): string {
  // Em produção (Vercel), o IP real está no header x-forwarded-for
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    // Pode ter múltiplos IPs, pegar o primeiro (cliente original)
    const firstIP = forwardedFor.split(",")[0]
    return firstIP?.trim() ?? "anonymous"
  }

  // Fallback para x-real-ip (outros proxies)
  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  // Fallback genérico
  return "anonymous"
}
