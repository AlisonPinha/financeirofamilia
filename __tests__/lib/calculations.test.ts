import { describe, it, expect } from "vitest"
import {
  calculateBudgetRule,
  calculateGoalProgress,
  calculateInvestmentSummary,
  calculateSavingsRate,
  calculateCompoundInterest,
  calculateTimeToGoal,
} from "@/lib/calculations"
import type { Goal, Investment } from "@/types"

describe("calculateBudgetRule", () => {
  it("should calculate correct percentages for ideal 50-30-20 distribution", () => {
    const income = 10000
    const spending = {
      essentials: 5000, // 50%
      lifestyle: 3000, // 30%
      investments: 2000, // 20%
    }

    const result = calculateBudgetRule(income, spending)

    expect(result.essentials.percentage).toBe(50)
    expect(result.lifestyle.percentage).toBe(30)
    expect(result.investments.percentage).toBe(20)
    expect(result.essentials.deviation).toBe(0)
    expect(result.lifestyle.deviation).toBe(0)
    expect(result.investments.deviation).toBe(0)
    expect(result.score).toBe(100)
  })

  it("should penalize overspending on essentials", () => {
    const income = 10000
    const spending = {
      essentials: 7000, // 70% - over by 20%
      lifestyle: 3000,
      investments: 0,
    }

    const result = calculateBudgetRule(income, spending)

    expect(result.essentials.percentage).toBe(70)
    expect(result.essentials.deviation).toBe(20)
    expect(result.score).toBeLessThan(100)
  })

  it("should handle zero income", () => {
    const income = 0
    const spending = {
      essentials: 0,
      lifestyle: 0,
      investments: 0,
    }

    const result = calculateBudgetRule(income, spending)

    expect(result.essentials.percentage).toBe(0)
    expect(result.lifestyle.percentage).toBe(0)
    expect(result.investments.percentage).toBe(0)
    // Score is penalized for not meeting 20% investment goal
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

describe("calculateGoalProgress", () => {
  it("should calculate correct percentage", () => {
    const goal: Goal = {
      id: "1",
      userId: "user1",
      name: "Emergency Fund",
      description: "6 months expenses",
      type: "savings",
      targetAmount: 10000,
      currentAmount: 5000,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = calculateGoalProgress(goal)

    expect(result.percentage).toBe(50)
    expect(result.remaining).toBe(5000)
  })

  it("should cap percentage at 100", () => {
    const goal: Goal = {
      id: "1",
      userId: "user1",
      name: "Goal",
      type: "savings",
      targetAmount: 1000,
      currentAmount: 1500, // Over target
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = calculateGoalProgress(goal)

    expect(result.percentage).toBe(100)
    expect(result.remaining).toBe(0)
  })

  it("should calculate days remaining for deadline", () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const goal: Goal = {
      id: "1",
      userId: "user1",
      name: "Goal",
      type: "savings",
      targetAmount: 1000,
      currentAmount: 500,
      deadline: tomorrow,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = calculateGoalProgress(goal)

    expect(result.daysRemaining).toBe(1)
  })

  it("should handle zero target amount", () => {
    const goal: Goal = {
      id: "1",
      userId: "user1",
      name: "Goal",
      type: "savings",
      targetAmount: 0,
      currentAmount: 0,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = calculateGoalProgress(goal)

    expect(result.percentage).toBe(0)
    expect(result.remaining).toBe(0)
  })
})

describe("calculateInvestmentSummary", () => {
  it("should calculate total values correctly", () => {
    const investments: Investment[] = [
      {
        id: "1",
        userId: "user1",
        name: "Tesouro Direto",
        type: "bonds",
        purchasePrice: 5000,
        currentPrice: 5500,
        quantity: 1,
        purchaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        userId: "user1",
        name: "Ações",
        type: "stocks",
        purchasePrice: 3000,
        currentPrice: 2800,
        quantity: 10,
        purchaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const result = calculateInvestmentSummary(investments)

    expect(result.totalInvested).toBe(8000)
    expect(result.totalValue).toBe(8300)
    expect(result.totalProfit).toBe(300)
    expect(result.totalProfitability).toBeCloseTo(3.75, 1)
  })

  it("should handle empty investments", () => {
    const result = calculateInvestmentSummary([])

    expect(result.totalInvested).toBe(0)
    expect(result.totalValue).toBe(0)
    expect(result.totalProfit).toBe(0)
    expect(result.allocation).toHaveLength(0)
  })

  it("should calculate allocation percentages", () => {
    const investments: Investment[] = [
      {
        id: "1",
        userId: "user1",
        name: "Investment 1",
        type: "bonds",
        purchasePrice: 1000,
        currentPrice: 5000,
        quantity: 1,
        purchaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        userId: "user1",
        name: "Investment 2",
        type: "stocks",
        purchasePrice: 1000,
        currentPrice: 5000,
        quantity: 1,
        purchaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const result = calculateInvestmentSummary(investments)

    expect(result.allocation).toHaveLength(2)
    result.allocation.forEach((alloc) => {
      expect(alloc.percentage).toBe(50)
    })
  })
})

describe("calculateSavingsRate", () => {
  it("should calculate correct savings rate", () => {
    expect(calculateSavingsRate(10000, 8000)).toBe(20)
    expect(calculateSavingsRate(10000, 5000)).toBe(50)
    expect(calculateSavingsRate(10000, 10000)).toBe(0)
  })

  it("should handle zero income", () => {
    expect(calculateSavingsRate(0, 100)).toBe(0)
  })

  it("should not return negative", () => {
    expect(calculateSavingsRate(1000, 1500)).toBe(0)
  })
})

describe("calculateCompoundInterest", () => {
  it("should calculate compound interest without monthly deposit", () => {
    const result = calculateCompoundInterest(1000, 1, 12) // 1% monthly for 12 months

    // Should be approximately 1000 * (1.01)^12 = 1126.83
    expect(result).toBeCloseTo(1126.83, 0)
  })

  it("should calculate with monthly deposits", () => {
    const result = calculateCompoundInterest(0, 0.5, 12, 100) // 0.5% monthly, R$100/month

    // Total after 12 months with compound interest
    expect(result).toBeGreaterThan(1200) // More than simple sum due to interest
  })

  it("should return principal for zero rate and no deposits", () => {
    expect(calculateCompoundInterest(1000, 0, 12, 0)).toBe(1000)
  })
})

describe("calculateTimeToGoal", () => {
  it("should calculate time with monthly deposits only", () => {
    const months = calculateTimeToGoal(0, 1200, 100, 0)
    expect(months).toBe(12) // 1200 / 100 = 12 months
  })

  it("should calculate faster with interest", () => {
    const withoutInterest = calculateTimeToGoal(0, 1200, 100, 0)
    const withInterest = calculateTimeToGoal(0, 1200, 100, 1)

    // With 1% interest, should reach goal faster or equal
    expect(withInterest).toBeLessThanOrEqual(withoutInterest)
  })

  it("should return Infinity when impossible", () => {
    expect(calculateTimeToGoal(0, 1000, 0, 0)).toBe(Infinity)
  })

  it("should consider initial value", () => {
    const fromZero = calculateTimeToGoal(0, 1000, 100, 0)
    const from500 = calculateTimeToGoal(500, 1000, 100, 0)

    expect(from500).toBeLessThan(fromZero)
  })
})
