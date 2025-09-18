import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Try to import the database connection
    let db;
    try {
      db = (await import('@/lib/db')).default;
    } catch (importError) {
      console.error('Database connection error:', importError);
      return NextResponse.json({ 
        error: 'Database connection not available', 
        importError: importError.message,
        DATABASE_URL: process.env.DATABASE_URL ? 'Available' : 'Not available'
      }, { status: 503 });
    }

    // If we got here, the database connection is working
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      DATABASE_URL: process.env.DATABASE_URL ? 'Available' : 'Not available'
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
