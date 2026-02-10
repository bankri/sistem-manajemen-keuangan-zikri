'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  notes?: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export interface Budget {
  id: string
  category: string
  limit: number
  month: string
}

interface FinanceContextType {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  currency: string
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void
  deleteCategory: (id: string) => void
  addBudget: (budget: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, budget: Omit<Budget, 'id'>) => void
  deleteBudget: (id: string) => void
  setCurrency: (currency: string) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Gaji', type: 'income', icon: '💼', color: '#10b981' },
  { id: '2', name: 'Bonus', type: 'income', icon: '🎉', color: '#3b82f6' },
  { id: '3', name: 'Investasi', type: 'income', icon: '📈', color: '#8b5cf6' },
  { id: '4', name: 'Makanan', type: 'expense', icon: '🍔', color: '#f59e0b' },
  { id: '5', name: 'Transportasi', type: 'expense', icon: '🚗', color: '#06b6d4' },
  { id: '6', name: 'Hiburan', type: 'expense', icon: '🎬', color: '#ec4899' },
  { id: '7', name: 'Kesehatan', type: 'expense', icon: '⚕️', color: '#ef4444' },
  { id: '8', name: 'Belanja', type: 'expense', icon: '🛍️', color: '#a78bfa' },
  { id: '9', name: 'Utilitas', type: 'expense', icon: '💡', color: '#fbbf24' },
  { id: '10', name: 'Tagihan', type: 'expense', icon: '📄', color: '#64748b' },
]

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currency, setCurrency] = useState('IDR')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance_transactions')
    const savedCategories = localStorage.getItem('finance_categories')
    const savedBudgets = localStorage.getItem('finance_budgets')
    const savedCurrency = localStorage.getItem('finance_currency')

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
    if (savedCategories) setCategories(JSON.parse(savedCategories))
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets))
    if (savedCurrency) setCurrency(savedCurrency)
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('finance_transactions', JSON.stringify(transactions))
    }
  }, [transactions, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('finance_categories', JSON.stringify(categories))
    }
  }, [categories, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('finance_budgets', JSON.stringify(budgets))
    }
  }, [budgets, isLoaded])

  useEffect(() => {
    localStorage.setItem('finance_currency', currency)
  }, [currency])

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions([...transactions, newTransaction])
  }

  const updateTransaction = (id: string, transaction: Omit<Transaction, 'id'>) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...transaction, id } : t))
    )
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    }
    setCategories([...categories, newCategory])
  }

  const updateCategory = (id: string, category: Omit<Category, 'id'>) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...category, id } : c))
    )
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
    }
    setBudgets([...budgets, newBudget])
  }

  const updateBudget = (id: string, budget: Omit<Budget, 'id'>) => {
    setBudgets(budgets.map((b) => (b.id === id ? { ...budget, id } : b)))
  }

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id))
  }

  const value: FinanceContextType = {
    transactions,
    categories,
    budgets,
    currency,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    setCurrency,
  }

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider')
  }
  return context
}
