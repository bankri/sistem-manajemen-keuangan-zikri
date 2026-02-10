import { Transaction, Budget } from './finance-context'

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getTotalExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpense(transactions)
}

export function getTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getFullYear() === year && date.getMonth() === month
  })
}

export function getTransactionsByCategory(
  transactions: Transaction[],
  category: string,
  type?: 'income' | 'expense'
): Transaction[] {
  return transactions.filter(
    (t) => t.category === category && (!type || t.type === type)
  )
}

export function getCategoryTotal(
  transactions: Transaction[],
  category: string,
  type?: 'income' | 'expense'
): number {
  return getTransactionsByCategory(transactions, category, type).reduce(
    (sum, t) => sum + t.amount,
    0
  )
}

export function getMonthlyData(
  transactions: Transaction[],
  year: number
): Array<{
  month: string
  income: number
  expense: number
  balance: number
}> {
  const data = []

  for (let month = 0; month < 12; month++) {
    const monthTransactions = getTransactionsByMonth(transactions, year, month)
    const income = getTotalIncome(monthTransactions)
    const expense = getTotalExpense(monthTransactions)

    data.push({
      month: new Date(year, month).toLocaleDateString('id-ID', {
        month: 'short',
      }),
      income,
      expense,
      balance: income - expense,
    })
  }

  return data
}

export function getCategoryDistribution(
  transactions: Transaction[],
  type: 'income' | 'expense',
  month?: { year: number; month: number }
): Array<{
  name: string
  value: number
  percentage: number
}> {
  let filtered = transactions.filter((t) => t.type === type)

  if (month) {
    filtered = getTransactionsByMonth(
      filtered,
      month.year,
      month.month
    )
  }

  const categoryMap = new Map<string, number>()

  filtered.forEach((t) => {
    const current = categoryMap.get(t.category) || 0
    categoryMap.set(t.category, current + t.amount)
  })

  const total = Array.from(categoryMap.values()).reduce((sum, v) => sum + v, 0)

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

export function checkBudgetStatus(
  transactions: Transaction[],
  budget: Budget,
  spent: number
): 'safe' | 'warning' | 'exceeded' {
  const percentage = (spent / budget.limit) * 100

  if (percentage > 100) return 'exceeded'
  if (percentage > 80) return 'warning'
  return 'safe'
}

export function getMonthYear(date: Date): string {
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function getMonthYearISO(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}
