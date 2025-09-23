'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingList } from '@/components/shopping-list/shopping-list';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [lists, setLists] = useState<any[]>([]);
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all shopping lists
  useEffect(() => {
    fetchShoppingLists();
  }, []);

  const fetchShoppingLists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/shopping-list');
      if (!response.ok) {
        throw new Error('Failed to fetch shopping lists');
      }
      const data = await response.json();
      setLists(data);

      // Select the first list by default if none is selected
      if (data.length > 0 && selectedListId === null) {
        setSelectedListId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching shopping lists:', err);
      toast({
        title: "Error",
        description: "Failed to load shopping lists",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewList = async () => {
    if (!newListName.trim()) return;

    try {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newListName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create shopping list');
      }

      const newList = await response.json();
      setLists([...lists, newList]);
      setSelectedListId(newList.id);
      setNewListName('');

      toast({
        title: "Success",
        description: "Shopping list created successfully"
      });
    } catch (err) {
      console.error('Error creating shopping list:', err);
      toast({
        title: "Error",
        description: "Failed to create shopping list",
        variant: "destructive"
      });
    }
  };

  const deleteList = async (id: number) => {
    try {
      const response = await fetch(`/api/shopping-list?listId=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete shopping list');
      }

      setLists(lists.filter((list) => list.id !== id));

      // If we deleted the selected list, select another one
      if (selectedListId === id) {
        setSelectedListId(lists.length > 1 ? lists[0].id : null);
      }

      toast({
        title: "Success",
        description: "Shopping list deleted successfully"
      });
    } catch (err) {
      console.error('Error deleting shopping list:', err);
      toast({
        title: "Error",
        description: "Failed to delete shopping list",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="min-h-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-full">
      <section className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-8 text-center">
            NEW ish Shopping List
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shopping Lists Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Shopping Lists</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="New list name..."
                      onKeyDown={(e) => e.key === 'Enter' && createNewList()} />

                    <Button onClick={createNewList}>Add</Button>
                  </div>
                  
                  {lists.length === 0 ?
                  <p className="text-gray-500 text-center py-4">No shopping lists yet</p> :

                  <ul className="space-y-2">
                      {lists.map((list) =>
                    <li
                      key={list.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                      selectedListId === list.id ?
                      'bg-primary/10 border border-primary' :
                      'hover:bg-muted'}`
                      }
                      onClick={() => setSelectedListId(list.id)}>

                          <span className="font-medium">{list.name}</span>
                          <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(list.id);
                        }}>

                            Delete
                          </Button>
                        </li>
                    )}
                    </ul>
                  }
                </CardContent>
              </Card>
            </div>
            
            {/* Shopping List Items Panel */}
            <div className="lg:col-span-2">
              {selectedListId ?
              <ShoppingList
                listId={selectedListId}
                initialName={lists.find((list) => list.id === selectedListId)?.name || 'Shopping List'} /> :


              <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <p className="text-gray-500 text-center">
                      Select a shopping list or create a new one to get started.
                    </p>
                  </CardContent>
                </Card>
              }
            </div>
          </div>
        </div>
      </section>
    </div>);

}
