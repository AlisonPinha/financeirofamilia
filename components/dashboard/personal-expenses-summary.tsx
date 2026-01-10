"use client"

import { Home } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, cn } from "@/lib/utils"

interface MemberExpense {
  id: string
  name: string
  avatar?: string | null
  personalExpense: number
}

interface PersonalExpensesSummaryProps {
  members: MemberExpense[]
  householdExpense: number
  totalExpense: number
  className?: string
}

export function PersonalExpensesSummary({
  members,
  householdExpense,
  totalExpense,
  className,
}: PersonalExpensesSummaryProps) {
  const householdPercentage = totalExpense > 0 ? (householdExpense / totalExpense) * 100 : 0
  const totalPersonalExpenses = members.reduce((sum, m) => sum + m.personalExpense, 0)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Home className="h-4 w-4" />
          Despesas Casa vs Pessoal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Household Expenses */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Home className="h-4 w-4 text-blue-500" />
              </div>
              <span className="font-medium">Casa (Compartilhado)</span>
            </div>
            <span className="font-semibold text-blue-600">{formatCurrency(householdExpense)}</span>
          </div>
          <Progress
            value={householdPercentage}
            className="h-2"
            indicatorClassName="bg-blue-500"
          />
          <p className="text-xs text-muted-foreground text-right">
            {householdPercentage.toFixed(1)}% do total
          </p>
        </div>

        {/* Personal Expenses by Member */}
        <div className="space-y-3 pt-2 border-t">
          <p className="text-sm font-medium text-muted-foreground">Despesas Pessoais</p>
          {members.map((member) => {
            const percentage = totalExpense > 0 ? (member.personalExpense / totalExpense) * 100 : 0
            return (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || undefined} alt={member.name} />
                      <AvatarFallback className="text-xs bg-purple-500/10 text-purple-600">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-sm">{member.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">(Pessoal)</span>
                    </div>
                  </div>
                  <span className="font-semibold text-purple-600">{formatCurrency(member.personalExpense)}</span>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  indicatorClassName="bg-purple-500"
                />
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Pessoais</span>
            <span className="font-medium text-purple-600">{formatCurrency(totalPersonalExpenses)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Casa</span>
            <span className="font-medium text-blue-600">{formatCurrency(householdExpense)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-2 border-t">
            <span>Total Geral</span>
            <span className="text-rose-500">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
