import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get all environment variables
    const envVars: Record<string, string> = {}
    
    // Filter and mask sensitive variables
    const sensitiveKeys = ['DATABASE_URL', 'SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'API_KEY']
    
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === 'string') {
        // Mask sensitive values
        if (sensitiveKeys.some(sensitiveKey => 
          key.toUpperCase().includes(sensitiveKey.toUpperCase())
        )) {
          envVars[key] = value.substring(0, 4) + '...' + value.substring(value.length - 4)
        } else {
          envVars[key] = value
        }
      }
    }
    
    // Sort keys for consistent output
    const sortedEnvVars: Record<string, string> = {}
    Object.keys(envVars).sort().forEach(key => {
      sortedEnvVars[key] = envVars[key]
    })
    
    return NextResponse.json({
      environment: sortedEnvVars,
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('Error fetching environment variables:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
