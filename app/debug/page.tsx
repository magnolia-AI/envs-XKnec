'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal, Database } from 'lucide-react'

type EnvironmentVariables = Record<string, string>

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<EnvironmentVariables | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [dbTestLoading, setDbTestLoading] = useState(false)

  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/debug-env')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setEnvVars(data.environment)
      } catch (err) {
        console.error('Error fetching environment variables:', err)
        setError('Failed to fetch environment variables')
      } finally {
        setLoading(false)
      }
    }

    fetchEnvVars()
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const testDatabaseConnection = async () => {
    try {
      setDbTestLoading(true)
      setDbTestResult(null)
      
      const response = await fetch('/api/test-db-connection')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setDbTestResult({
        success: data.success || false,
        message: data.message || data.error || 'Unknown response'
      })
    } catch (err) {
      console.error('Error testing database connection:', err)
      setDbTestResult({
        success: false,
        message: 'Failed to test database connection'
      })
    } finally {
      setDbTestLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Debug Dashboard</h1>
          <p className="text-muted-foreground">
            View environment variables and test database connections.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={handleRefresh}>Refresh Environment Variables</Button>
          <Button onClick={testDatabaseConnection} disabled={dbTestLoading}>
            <Database className="mr-2 h-4 w-4" />
            {dbTestLoading ? 'Testing...' : 'Test Database Connection'}
          </Button>
        </div>

        {dbTestResult && (
          <Alert variant={dbTestResult.success ? 'default' : 'destructive'}>
            <Database className="h-4 w-4" />
            <AlertTitle>{dbTestResult.success ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>
              {dbTestResult.message}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : envVars ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Variable</th>
                      <th className="text-left py-2 px-4">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(envVars).map(([key, value]) => (
                      <tr key={key} className="border-b hover:bg-muted">
                        <td className="py-2 px-4 font-mono text-sm">{key}</td>
                        <td className="py-2 px-4 font-mono text-sm break-all">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No environment variables found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

