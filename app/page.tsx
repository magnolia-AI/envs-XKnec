'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-full">
      <section className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-[800px] mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
            Image Processing Tools
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-[600px] mx-auto">
            A collection of tools to help you process and manipulate images.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>PNG Background Processor</CardTitle>
              <CardDescription>
                Upload PNG images with transparency and add a white background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This tool allows you to upload up to 10 PNG images and automatically adds a white background to each one. 
                Perfect for preparing images for platforms that don't handle transparency well.
              </p>
              <Link href="/png-processor">
                <Button className="w-full sm:w-auto">
                  Try PNG Background Processor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
