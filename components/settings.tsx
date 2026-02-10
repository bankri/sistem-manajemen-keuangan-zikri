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
import { useFinance, Category } from '@/lib/finance-context'
import { Trash2, Plus, Edit2 } from 'lucide-react'

const ICON_EMOJIS = [
  '💼', '🎉', '📈', '💰',
  '🍔', '🚗', '🎬', '⚕️',
  '🛍️', '💡', '📄', '💳',
  '✈️', '🏠', '📚', '⚽',
  '🎵', '🎮', '📱', '🍕',
]

export function Settings() {
  const { categories, currency, addCategory, updateCategory, deleteCategory, setCurrency } =
    useFinance()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    type: 'expense',
    icon: '📊',
    color: '#10b981',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      alert('Mohon isi nama kategori')
      return
    }

    if (editingId) {
      updateCategory(editingId, formData)
      setEditingId(null)
    } else {
      addCategory(formData)
    }

    setFormData({
      name: '',
      type: 'expense',
      icon: '📊',
      color: '#10b981',
    })
    setOpen(false)
  }

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    })
    setEditingId(category.id)
    setOpen(true)
  }

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  return (
    <div className="space-y-6">
      {/* Currency Settings */}
      <Card className="p-6 bg-white border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Pengaturan Umum
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currency">Mata Uang</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                <SelectItem value="USD">USD (Dolar)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                <SelectItem value="SGD">SGD (Dolar Singapura)</SelectItem>
                <SelectItem value="MYR">MYR (Ringgit Malaysia)</SelectItem>
                <SelectItem value="THB">THB (Baht Thailand)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Category Management */}
      <Card className="p-6 bg-white border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Manajemen Kategori
          </h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90" size="sm">
                <Plus className="w-4 h-4" />
                Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                  <Label>Tipe</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as 'income' | 'expense',
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

                {/* Name */}
                <div>
                  <Label>Nama Kategori</Label>
                  <Input
                    placeholder="Contoh: Gaji, Makanan, dll"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* Icon */}
                <div>
                  <Label>Ikon</Label>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {ICON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, icon: emoji })
                        }
                        className={`p-2 text-2xl rounded border-2 transition ${
                          formData.icon === emoji
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <Label>Warna</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      '#10b981',
                      '#3b82f6',
                      '#f59e0b',
                      '#ef4444',
                      '#8b5cf6',
                      '#ec4899',
                      '#06b6d4',
                      '#6366f1',
                      '#f97316',
                      '#64748b',
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, color })
                        }
                        className={`w-8 h-8 rounded border-2 transition ${
                          formData.color === color
                            ? 'border-gray-900'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  {editingId ? 'Update Kategori' : 'Tambah Kategori'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {/* Income Categories */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Kategori Pemasukan
            </h4>
            <div className="space-y-2">
              {incomeCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      <div
                        className="w-3 h-3 rounded-full mt-1"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cat)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Kategori Pengeluaran
            </h4>
            <div className="space-y-2">
              {expenseCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      <div
                        className="w-3 h-3 rounded-full mt-1"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cat)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
