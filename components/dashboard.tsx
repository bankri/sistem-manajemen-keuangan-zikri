'use client'

import React, { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { useFinance } from '@/lib/finance-context'
import {
  formatCurrency,
  getTotalIncome,
  getTotalExpense,
  getBalance,
  getMonthlyData,
  getCategoryDistribution,
} from '@/lib/finance-utils'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react'

export function Dashboard() {
  const { transactions, currency } = useFinance()
  const currentDate = new Date()

  const stats = useMemo(() => {
    const income = getTotalIncome(transactions)
    const expense = getTotalExpense(transactions)
    const balance = getBalance(transactions)
    return { income, expense, balance }
  }, [transactions])

  const monthlyData = useMemo(() => {
    return getMonthlyData(transactions, currentDate.getFullYear())
  }, [transactions])

  const expenseDistribution = useMemo(() => {
    return getCategoryDistribution(
      transactions,
      'expense',
      { year: currentDate.getFullYear(), month: currentDate.getMonth() }
    )
  }, [transactions])

  const incomeDistribution = useMemo(() => {
    return getCategoryDistribution(
      transactions,
      'income',
      { year: currentDate.getFullYear(), month: currentDate.getMonth() }
    )
  }, [transactions])

  const StatCard = ({
    title,
    amount,
    icon: Icon,
    color,
  }: {
    title: string
    amount: number
    icon: React.ReactNode
    color: string
  }) => (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color}`}>
            {formatCurrency(amount, currency)}
          </p>
        </div>
        <div
          className={`p-3 rounded-lg ${
            color.includes('text-green')
              ? 'bg-green-100'
              : color.includes('text-red')
                ? 'bg-red-100'
                : 'bg-blue-100'
          }`}
        >
          {Icon}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Total"
          amount={stats.balance}
          icon={<Wallet className="text-blue-600 w-6 h-6" />}
          color="text-blue-600"
        />
        <StatCard
          title="Total Pemasukan"
          amount={stats.income}
          icon={<ArrowUpRight className="text-green-600 w-6 h-6" />}
          color="text-green-600"
        />
        <StatCard
          title="Total Pengeluaran"
          amount={stats.expense}
          icon={<ArrowDownLeft className="text-red-600 w-6 h-6" />}
          color="text-red-600"
        />
        <StatCard
          title="Pertumbuhan"
          amount={stats.balance > 0 ? (stats.balance / (stats.income || 1)) * 100 : 0}
          icon={<TrendingUp className="text-purple-600 w-6 h-6" />}
          color="text-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Tren Bulanan
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
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

        {/* Distribution Pie Charts */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white border-gray-200">
            <h3 className="text-sm font-semibold mb-4 text-gray-900">
              Pengeluaran
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {expenseDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'][
                          index % 5
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, currency)}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 bg-white border-gray-200">
            <h3 className="text-sm font-semibold mb-4 text-gray-900">
              Pemasukan
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={incomeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {incomeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#6366f1'][
                          index % 5
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, currency)}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  )
}
