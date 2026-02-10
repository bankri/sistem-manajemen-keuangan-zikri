'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance } from '@/lib/finance-context'
import {
  formatCurrency,
  getCategoryDistribution,
  getMonthlyData,
  getCategoryTotal,
} from '@/lib/finance-utils'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { Download } from 'lucide-react'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1']

export function Analytics() {
  const { transactions, categories, currency } = useFinance()
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const years = useMemo(() => {
    const minYear = transactions.length > 0
      ? new Date(transactions[0].date).getFullYear()
      : new Date().getFullYear()
    const maxYear = new Date().getFullYear()
    const years = []
    for (let y = minYear; y <= maxYear; y++) {
      years.push(y)
    }
    return years
  }, [transactions])

  const monthlyData = useMemo(() => {
    return getMonthlyData(transactions, selectedYear)
  }, [transactions, selectedYear])

  const expenseByCategory = useMemo(() => {
    return getCategoryDistribution(transactions, 'expense')
  }, [transactions])

  const incomeByCategory = useMemo(() => {
    return getCategoryDistribution(transactions, 'income')
  }, [transactions])

  const quarterlyData = useMemo(() => {
    const data = []
    for (let q = 0; q < 4; q++) {
      const startMonth = q * 3
      const endMonth = startMonth + 3
      const quarterTransactions = transactions.filter((t) => {
        const date = new Date(t.date)
        const month = date.getMonth()
        const year = date.getFullYear()
        return year === selectedYear && month >= startMonth && month < endMonth
      })

      const income = quarterTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const expense = quarterTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      data.push({
        quarter: `Q${q + 1}`,
        income,
        expense,
        balance: income - expense,
      })
    }
    return data
  }, [transactions, selectedYear])

  const chartData = period === 'month' ? monthlyData : period === 'quarter' ? quarterlyData : monthlyData

  const topExpenses = expenseByCategory.slice(0, 5)
  const topIncomes = incomeByCategory.slice(0, 5)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const handleExportCSV = () => {
    let csv = 'Tanggal,Tipe,Kategori,Deskripsi,Jumlah,Catatan\n'
    
    transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((t) => {
        csv += `${t.date},${t.type},${t.category},${t.description},${t.amount},${t.notes || ''}\n`
      })

    const element = document.createElement('a')
    element.setAttribute(
      'href',
      `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    )
    element.setAttribute('download', `laporan-keuangan-${new Date().toISOString().split('T')[0]}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="capitalize"
            >
              {p === 'month' ? 'Bulanan' : p === 'quarter' ? 'Triwulanan' : 'Tahunan'}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="p-6 bg-white border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Pemasukan vs Pengeluaran
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={period === 'quarter' ? 'quarter' : 'month'} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value, currency)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Expenses */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Top 5 Pengeluaran
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topExpenses}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
              >
                {topExpenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Incomes */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Top 5 Pemasukan
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topIncomes}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
              >
                {topIncomes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Summary */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Ringkasan Pengeluaran
          </h3>
          <div className="space-y-3">
            {expenseByCategory.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(cat.value, currency)}
                  </p>
                  <p className="text-xs text-gray-600">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(totalExpense, currency)}
              </span>
            </div>
          </div>
        </Card>

        {/* Income Summary */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Ringkasan Pemasukan
          </h3>
          <div className="space-y-3">
            {incomeByCategory.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(cat.value, currency)}
                  </p>
                  <p className="text-xs text-gray-600">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalIncome, currency)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
