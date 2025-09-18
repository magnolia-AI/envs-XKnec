import { NextRequest, NextResponse } from 'next/server'
import { shoppingListItems } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// GET endpoint - get all items for a specific list
export async function GET(request: NextRequest) {
  try {
    // Try to import the database connection
    let db;
    try {
      db = (await import('@/lib/db')).default;
    } catch (importError) {
      console.error('Database connection error:', importError);
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }

    const searchParams = request.nextUrl.searchParams
    const listId = searchParams.get('listId')
    
    if (!listId) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 })
    }
    
    const items = await db.select().from(shoppingListItems).where(eq(shoppingListItems.listId, parseInt(listId)))
    
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching shopping list items:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST endpoint - create a new shopping list item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.listId || !body.name) {
      return NextResponse.json({ error: 'List ID and name are required' }, { status: 400 })
    }
    
    const newItem = await db.insert(shoppingListItems).values({
      listId: body.listId,
      name: body.name,
      quantity: body.quantity || 1,
      completed: body.completed || false
    }).returning()
    
    return NextResponse.json(newItem[0], { status: 201 })
  } catch (error) {
    console.error('Error creating shopping list item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT endpoint - update a shopping list item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const searchParams = request.nextUrl.searchParams
    const itemId = searchParams.get('itemId')
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }
    
    if (!body.name && body.quantity === undefined && body.completed === undefined) {
      return NextResponse.json({ error: 'At least one of name, quantity, or completed is required' }, { status: 400 })
    }
    
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.quantity !== undefined) updateData.quantity = body.quantity
    if (body.completed !== undefined) updateData.completed = body.completed
    updateData.updatedAt = new Date()
    
    const updatedItem = await db.update(shoppingListItems)
      .set(updateData)
      .where(eq(shoppingListItems.id, parseInt(itemId)))
      .returning()
    
    if (updatedItem.length === 0) {
      return NextResponse.json({ error: 'Shopping list item not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedItem[0])
  } catch (error) {
    console.error('Error updating shopping list item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE endpoint - delete a shopping list item
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const itemId = searchParams.get('itemId')
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }
    
    const deletedItem = await db.delete(shoppingListItems)
      .where(eq(shoppingListItems.id, parseInt(itemId)))
      .returning()
    
    if (deletedItem.length === 0) {
      return NextResponse.json({ error: 'Shopping list item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Shopping list item deleted successfully' })
  } catch (error) {
    console.error('Error deleting shopping list item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

