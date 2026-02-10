'use client'

import React, { useState } from 'react'
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
import { useFinance, Transaction } from '@/lib/finance-context'
import { formatCurrency } from '@/lib/finance-utils'
import { Trash2, Edit2, Plus } from 'lucide-react'

export function TransactionManager() {
  const { transactions, categories, currency, addTransaction, updateTransaction, deleteTransaction } = useFinance()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const filteredTransactions = transactions
    .filter((t) => filter === 'all' || t.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.description || formData.amount <= 0) {
      alert('Mohon isi semua field dengan benar')
      return
    }

    if (editingId) {
      updateTransaction(editingId, formData)
      setEditingId(null)
    } else {
      addTransaction(formData)
    }

    setFormData({
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setOpen(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      notes: transaction.notes || '',
    })
    setEditingId(transaction.id)
    setOpen(true)
  }

  const categoryOptions = categories
    .filter((c) => c.type === formData.type)
    .map((c) => ({ id: c.id, name: c.name, icon: c.icon }))

  return (
    <div className="space-y-6">
      {/* Filter and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
              className="capitalize"
            >
              {type === 'all' ? 'Semua' : type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </Button>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <Label>Tipe Transaksi</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as 'income' | 'expense',
                      category: '',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection */}
              <div>
                <Label>Kategori</Label>
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
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div>
                <Label>Jumlah ({currency})</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="1000"
                  min="0"
                />
              </div>

              {/* Description */}
              <div>
                <Label>Deskripsi</Label>
                <Input
                  placeholder="Contoh: Makan siang di restoran"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Date */}
              <div>
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              {/* Notes */}
              <div>
                <Label>Catatan (Opsional)</Label>
                <Input
                  placeholder="Tambahan informasi"
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                {editingId ? 'Update Transaksi' : 'Tambah Transaksi'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions List */}
      <Card className="bg-white border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Belum ada transaksi</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const category = categories.find(
                (c) => c.name === transaction.category
              )
              return (
                <div
                  key={transaction.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">
                      {category?.icon || (transaction.type === 'income' ? '📈' : '📉')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>
                          {new Date(transaction.date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-xs text-gray-500 mt-1">{transaction.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4">
                    <div
                      className={`text-right font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, currency)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
