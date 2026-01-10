"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  InvestmentSummaryCards,
  PortfolioEvolutionChart,
  InvestmentsTable,
  AllocationCard,
  InvestmentModal,
} from "@/components/investimentos"
import type { Investment, InvestmentType } from "@/components/investimentos"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/hooks/use-store"
import { generateId } from "@/lib/utils"

// Default allocation targets
const allocationTargets: Record<InvestmentType, number> = {
  stocks: 40,
  bonds: 30,
  crypto: 10,
  real_estate: 10,
  funds: 10,
  other: 0,
}

export default function InvestimentosPage() {
  const { toast } = useToast()
  const {
    investments: storeInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment: deleteInvestmentStore,
  } = useStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)

  // Convert store investments to component format
  const investments: Investment[] = useMemo(() => {
    return storeInvestments.map(inv => ({
      id: inv.id,
      name: inv.name,
      type: inv.type as InvestmentType,
      institution: inv.institution || "",
      purchasePrice: inv.purchasePrice,
      currentPrice: inv.currentPrice,
      quantity: 1,
      purchaseDate: inv.purchaseDate,
      maturityDate: inv.maturityDate || undefined,
    }))
  }, [storeInvestments])

  // Calculate totals
  const totals = useMemo(() => {
    const totalInvested = investments.reduce(
      (sum, inv) => sum + inv.purchasePrice * inv.quantity,
      0
    )
    const totalCurrent = investments.reduce(
      (sum, inv) => sum + inv.currentPrice * inv.quantity,
      0
    )

    // Calculate by type
    const byType: Record<InvestmentType, number> = {
      stocks: 0,
      bonds: 0,
      crypto: 0,
      real_estate: 0,
      funds: 0,
      other: 0,
    }

    investments.forEach((inv) => {
      byType[inv.type] += inv.currentPrice * inv.quantity
    })

    return { totalInvested, totalCurrent, byType }
  }, [investments])

  // Distribution by type for summary cards
  const distributionByType = useMemo(() => {
    const typeLabels: Record<InvestmentType, { label: string; color: string }> = {
      stocks: { label: "Ações", color: "#3b82f6" },
      bonds: { label: "Renda Fixa", color: "#22c55e" },
      crypto: { label: "Cripto", color: "#f97316" },
      real_estate: { label: "FIIs", color: "#8b5cf6" },
      funds: { label: "Fundos", color: "#06b6d4" },
      other: { label: "Outros", color: "#64748b" },
    }

    return Object.entries(totals.byType)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({
        type,
        label: typeLabels[type as InvestmentType].label,
        value,
        color: typeLabels[type as InvestmentType].color,
      }))
      .sort((a, b) => b.value - a.value)
  }, [totals.byType])

  // Allocation data with targets
  const allocationData = useMemo(() => {
    const typeLabels: Record<InvestmentType, { label: string; color: string }> = {
      stocks: { label: "Ações", color: "#3b82f6" },
      bonds: { label: "Renda Fixa", color: "#22c55e" },
      crypto: { label: "Cripto", color: "#f97316" },
      real_estate: { label: "FIIs", color: "#8b5cf6" },
      funds: { label: "Fundos", color: "#06b6d4" },
      other: { label: "Outros", color: "#64748b" },
    }

    return Object.entries(totals.byType)
      .filter(([type]) => totals.byType[type as InvestmentType] > 0 || allocationTargets[type as InvestmentType] > 0)
      .map(([type, value]) => ({
        type,
        label: typeLabels[type as InvestmentType].label,
        value,
        color: typeLabels[type as InvestmentType].color,
        targetPercent: allocationTargets[type as InvestmentType],
      }))
  }, [totals.byType])

  // Monthly contribution - calculate from store or show 0
  const monthlyContribution = 0
  const monthlyTarget = 3000

  // Portfolio evolution data - empty when no data
  const portfolioEvolutionData = useMemo(() => {
    if (investments.length === 0) return []
    // Generate simple evolution based on current investments
    const totalValue = totals.totalCurrent
    const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return months.map((month, i) => ({
      date: month,
      total: Math.round(totalValue * (0.85 + (i * 0.03)))
    }))
  }, [investments.length, totals.totalCurrent])

  // Handlers
  const handleOpenCreate = () => {
    setEditingInvestment(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (investment: Investment) => {
    setEditingInvestment(investment)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    const investment = investments.find((i) => i.id === id)
    deleteInvestmentStore(id)
    toast({
      title: "Investimento excluído",
      description: `${investment?.name} foi removido da carteira.`,
    })
  }

  const handleSubmit = (data: Omit<Investment, "id">) => {
    if (modalMode === "create") {
      const newInvestment = {
        id: generateId(),
        name: data.name,
        type: data.type,
        institution: data.institution || "",
        purchasePrice: data.purchasePrice,
        currentPrice: data.currentPrice,
        profitability: ((data.currentPrice - data.purchasePrice) / data.purchasePrice) * 100,
        purchaseDate: data.purchaseDate,
        maturityDate: data.maturityDate,
        userId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addInvestment(newInvestment)
      toast({
        title: "Investimento adicionado",
        description: `${data.name} foi adicionado à sua carteira.`,
      })
    } else if (editingInvestment) {
      updateInvestment(editingInvestment.id, {
        name: data.name,
        type: data.type,
        institution: data.institution || "",
        purchasePrice: data.purchasePrice,
        currentPrice: data.currentPrice,
        profitability: ((data.currentPrice - data.purchasePrice) / data.purchasePrice) * 100,
        purchaseDate: data.purchaseDate,
        maturityDate: data.maturityDate,
        updatedAt: new Date(),
      })
      toast({
        title: "Investimento atualizado",
        description: `${data.name} foi atualizado com sucesso.`,
      })
    }
  }

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display">Investimentos</h1>
          <p className="text-callout text-secondary mt-1">
            Acompanhe sua carteira e evolução patrimonial
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Novo Investimento
        </Button>
      </div>

      {/* Summary Cards */}
      <InvestmentSummaryCards
        totalInvested={totals.totalInvested}
        totalCurrent={totals.totalCurrent}
        monthlyContribution={monthlyContribution}
        monthlyTarget={monthlyTarget}
        distributionByType={distributionByType}
      />

      {/* Evolution Chart */}
      <PortfolioEvolutionChart data={portfolioEvolutionData} />

      {/* Table and Allocation */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Investments Table */}
        <div className="lg:col-span-2">
          <InvestmentsTable
            investments={investments}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Allocation Card */}
        <div>
          <AllocationCard
            currentAllocation={allocationData}
            totalValue={totals.totalCurrent}
          />
        </div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        initialData={editingInvestment || undefined}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
