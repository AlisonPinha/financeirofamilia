/**
 * Library exports for FamFinance
 *
 * This file provides centralized exports for all lib utilities
 */

// Core utilities
export { cn, calculatePercentage, generateId } from "./utils"

// Formatters
export {
  formatCurrency,
  formatCurrencyCompact,
  formatCurrencyWithSign,
  formatPercentage,
  formatPercentageWithSign,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  formatMonthYear,
  formatMesAno,
  parseMesAno,
  formatNumber,
  formatCompactNumber,
  formatTransactionType,
  formatInvestmentType,
  formatAccountType,
  formatCategoryGroup,
  formatGoalType,
} from "./formatters"

// Financial calculations
export {
  calculateBudgetRule,
  calculateGoalProgress,
  calculateInvestmentSummary,
  calculateMonthlyProjection,
  analyzeCategorySpending,
  calculateSavingsRate,
  calculateCompoundInterest,
  calculateTimeToGoal,
  type BudgetRuleResult,
  type GoalProgress,
  type InvestmentSummary,
  type MonthlyProjection,
  type CategoryAnalysis,
} from "./calculations"

// Alert services
export {
  checkCategoryBudget,
  checkBudgetRule,
  checkInvestmentGoal,
  checkInstallmentsDue,
  analyzeTransaction,
  runDailyChecks,
  type AlertCheckResult,
} from "./services/alert-service"

// Constants
export {
  TRANSACTION_TYPES,
  ACCOUNT_TYPES,
  INVESTMENT_TYPES,
  GOAL_STATUS,
  CATEGORY_COLORS,
  DEFAULT_CATEGORIES,
  CURRENCY_OPTIONS,
  DATE_FORMAT,
} from "./constants"

// Supabase client
export { createSupabaseBrowserClient, createSupabaseServerClient } from "./supabase"

// Auth helpers
export { getAuthenticatedUser, getSupabaseClient } from "./supabase/auth-helper"

// Logger
export { logger, withLogging } from "./logger"

// Rate limiting
export {
  checkRateLimit,
  rateLimitConfigs,
  getClientIP,
  type RateLimitResult,
} from "./rate-limit"

// Error monitoring
export {
  setUser,
  addBreadcrumb,
  captureException,
  captureMessage,
  initErrorMonitoring,
  withErrorCapture,
  createScope,
  ErrorBoundaryHandler,
} from "./error-monitor"
