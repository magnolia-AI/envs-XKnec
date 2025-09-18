'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus } from 'lucide-react'

interface ShoppingListProps {
  listId: number
  initialName: string
}

interface ShoppingListItem {
  id: number
  name: string
  quantity: number
  completed: boolean
}

export function ShoppingList({ listId, initialName }: ShoppingListProps) {
  const [listName, setListName] = useState(initialName)
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/shopping-list-items?listId=${listId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      const data = await response.json()
      setItems(data)
    } catch (err) {
      setError('Failed to load shopping list items')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [listId])

  // Fetch items when component mounts
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = async () => {
    if (!newItemName.trim()) return

    try {
      const response = await fetch('/api/shopping-list-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listId,
          name: newItemName,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add item')
      }

      const newItem = await response.json()
      setItems([...items, newItem])
      setNewItemName('')
    } catch (err) {
      setError('Failed to add item')
      console.error(err)
    }
  }

  const toggleItem = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/shopping-list-items?itemId=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !completed,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      const updatedItem = await response.json()
      setItems(items.map(item => 
        item.id === id ? { ...item, completed: !completed } : item
      ))
    } catch (err) {
      setError('Failed to update item')
      console.error(err)
    }
  }

  const deleteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/shopping-list-items?itemId=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      setItems(items.filter(item => item.id !== id))
    } catch (err) {
      setError('Failed to delete item')
      console.error(err)
    }
  }

  const updateListName = async () => {
    try {
      const response = await fetch(`/api/shopping-list?listId=${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: listName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update list name')
      }
    } catch (err) {
      setError('Failed to update list name')
      console.error(err)
    }
  }

  if (isLoading) {
    return <div>Loading shopping list...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Input
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onBlur={updateListName}
            className="text-xl font-bold"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add a new item..."
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id, item.completed)}
              />
              <span className={item.completed ? 'line-through text-gray-500 flex-1' : 'flex-1'}>
                {item.name} (x{item.quantity})
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p className="text-gray-500 text-center py-4">No items in this list yet</p>
        )}
      </CardContent>
    </Card>
  )
}
