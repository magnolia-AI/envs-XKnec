import { NextRequest, NextResponse } from 'next/server'
import { shoppingLists, shoppingListItems } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

// GET endpoint - get all shopping lists or a specific list with items
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
    
    if (listId) {
      // Get a specific shopping list with its items
      const list = await db.select().from(shoppingLists).where(eq(shoppingLists.id, parseInt(listId)))
      const items = await db.select().from(shoppingListItems).where(eq(shoppingListItems.listId, parseInt(listId)))
      
      if (list.length === 0) {
        return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 })
      }
      
      return NextResponse.json({
        list: list[0],
        items
      })
    } else {
      // Get all shopping lists
      const lists = await db.select().from(shoppingLists)
      return NextResponse.json(lists)
    }
  } catch (error) {
    console.error('Error fetching shopping lists:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST endpoint - create a new shopping list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const newList = await db.insert(shoppingLists).values({
      name: body.name
    }).returning()
    
    return NextResponse.json(newList[0], { status: 201 })
  } catch (error) {
    console.error('Error creating shopping list:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT endpoint - update a shopping list
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const searchParams = request.nextUrl.searchParams
    const listId = searchParams.get('listId')
    
    if (!listId) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 })
    }
    
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const updatedList = await db.update(shoppingLists)
      .set({ name: body.name, updatedAt: new Date() })
      .where(eq(shoppingLists.id, parseInt(listId)))
      .returning()
    
    if (updatedList.length === 0) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedList[0])
  } catch (error) {
    console.error('Error updating shopping list:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE endpoint - delete a shopping list
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const listId = searchParams.get('listId')
    
    if (!listId) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 })
    }
    
    const deletedList = await db.delete(shoppingLists)
      .where(eq(shoppingLists.id, parseInt(listId)))
      .returning()
    
    if (deletedList.length === 0) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Shopping list deleted successfully' })
  } catch (error) {
    console.error('Error deleting shopping list:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

