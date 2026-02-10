'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance, Budget } from '@/lib/finance-context'
import { formatCurrency, getCategoryTotal, checkBudgetStatus, getMonthYearISO } from '@/lib/finance-utils'
import { Trash2, Plus, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function BudgetPlanning() {
  const { budgets, categories, transactions, currency, addBudget, updateBudget, deleteBudget } = useFinance()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const currentDate = new Date()
  const currentMonth = getMonthYearISO(currentDate.getFullYear(), currentDate.getMonth())

  const [formData, setFormData] = useState<Omit<Budget, 'id'>>({
    category: '',
    limit: 0,
    month: currentMonth,
  })

  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const budgetsWithStatus = useMemo(() => {
    return budgets
      .filter((b) => b.month === currentMonth)
      .map((budget) => {
        const spent = getCategoryTotal(transactions, budget.category, 'expense')
        const status = checkBudgetStatus(transactions, budget, spent)
        const percentage = (spent / budget.limit) * 100

        return {
          ...budget,
          spent,
          status,
          percentage: Math.min(percentage, 100),
          exceeded: spent > budget.limit,
        }
      })
  }, [budgets, transactions, currentMonth])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || formData.limit <= 0) {
      alert('Mohon isi semua field dengan benar')
      return
    }

    if (editingId) {
      updateBudget(editingId, formData)
      setEditingId(null)
    } else {
      addBudget(formData)
    }

    setFormData({
      category: '',
      limit: 0,
      month: currentMonth,
    })
    setOpen(false)
  }

  const handleEdit = (budget: Budget) => {
    setFormData({
      category: budget.category,
      limit: budget.limit,
      month: budget.month,
    })
    setEditingId(budget.id)
    setOpen(true)
  }

  const totalBudget = budgetsWithStatus.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgetsWithStatus.reduce((sum, b) => sum + b.spent, 0)

  const statusConfig = {
    safe: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    exceeded: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm font-medium text-blue-900">Total Budget</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {formatCurrency(totalBudget, currency)}
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-sm font-medium text-red-900">Total Digunakan</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {formatCurrency(totalSpent, currency)}
          </p>
          {totalBudget > 0 && (
            <p className="text-xs text-red-700 mt-2">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% dari budget
            </p>
          )}
        </Card>
      </div>

      {/* Add Budget Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Tambah Budget
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Budget' : 'Tambah Budget Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection */}
            <div>
              <Label>Kategori Pengeluaran</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Limit */}
            <div>
              <Label>Batas Budget ({currency})</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limit: parseFloat(e.target.value) || 0,
                  })
                }
                step="1000"
                min="0"
              />
            </div>

            {/* Month */}
            <div>
              <Label>Bulan</Label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              {editingId ? 'Update Budget' : 'Tambah Budget'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Budgets List */}
      <div className="space-y-4">
        {budgetsWithStatus.length === 0 ? (
          <Card className="p-8 text-center text-gray-500 bg-white border-gray-200">
            <p>Belum ada budget untuk bulan ini</p>
          </Card>
        ) : (
          budgetsWithStatus.map((budget) => {
            const { icon: StatusIcon, color, bg } = statusConfig[budget.status]
            const categoryData = categories.find((c) => c.name === budget.category)

            return (
              <Card
                key={budget.id}
                className={`p-4 border ${bg} transition-colors`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">
                        {categoryData?.icon || '📊'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {budget.category}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(budget.spent, currency)} dari{' '}
                          {formatCurrency(budget.limit, currency)}
                        </p>
                      </div>
                    </div>
                    <StatusIcon className={`w-5 h-5 ${color}`} />
                  </div>

                  {/* Progress */}
                  <Progress
                    value={budget.percentage}
                    className="h-2"
                  />

                  {/* Status Text */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      {budget.exceeded
                        ? `Melebihi ${formatCurrency(budget.spent - budget.limit, currency)}`
                        : `Sisa ${formatCurrency(budget.limit - budget.spent, currency)}`}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBudget(budget.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
