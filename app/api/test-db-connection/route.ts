import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is set in environment
    const databaseUrl = process.env.DATABASE_URL;
    
    // Try to import the database connection
    let db;
    try {
      db = (await import('@/lib/db')).default;
    } catch (importError) {
      console.error('Database connection error:', importError);
      // Properly handle the unknown error type
      let errorMessage = 'Unknown error';
      if (importError instanceof Error) {
        errorMessage = importError.message;
      } else if (typeof importError === 'string') {
        errorMessage = importError;
      } else if (importError && typeof importError === 'object' && 'message' in importError) {
        errorMessage = String(importError.message);
      }
      
      return NextResponse.json({ 
        error: 'Database connection not available', 
        importError: errorMessage,
        DATABASE_URL: databaseUrl ? 'Available' : 'Not available',
        databaseUrlValue: databaseUrl ? databaseUrl.substring(0, 20) + '...' : null,
        environmentKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB')).sort()
      }, { status: 503 });
    }

    // If we got here, the database connection is working
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      DATABASE_URL: databaseUrl ? 'Available' : 'Not available',
      databaseUrlValue: databaseUrl ? databaseUrl.substring(0, 20) + '...' : null,
      environmentKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB')).sort()
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



