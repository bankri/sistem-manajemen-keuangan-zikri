'use client'

import React, { useState } from 'react'
import { FinanceProvider } from '@/lib/finance-context'
import { Dashboard } from '@/components/dashboard'
import { TransactionManager } from '@/components/transaction-manager'
import { BudgetPlanning } from '@/components/budget-planning'
import { Analytics } from '@/components/analytics'
import { Settings } from '@/components/settings'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
} from 'lucide-react'

type NavItem = 'dashboard' | 'transactions' | 'budget' | 'analytics' | 'settings'

export function AppComponent() {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: Array<{ id: NavItem; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transaksi', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'budget', label: 'Budget', icon: <PieChart className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analitik', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Pengaturan', icon: <SettingsIcon className="w-5 h-5" /> },
  ]

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return <TransactionManager />
      case 'budget':
        return <BudgetPlanning />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Keuangan Pribadi</h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-1">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeNav === item.id ? 'default' : 'ghost'}
                    onClick={() => setActiveNav(item.id)}
                    className="gap-2"
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <nav className="md:hidden border-t border-gray-200 py-4 space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeNav === item.id ? 'default' : 'ghost'}
                    onClick={() => {
                      setActiveNav(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className="w-full justify-start gap-2"
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </nav>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-600">
              Kelola Keuangan Pribadi Anda dengan Mudah
            </p>
          </div>
        </footer>
      </div>
    </FinanceProvider>
  )
}
