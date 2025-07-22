"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in")
    }
  }, [isLoaded, user, router])

  const handleGetStarted = () => {
    router.push("/")
  }

  if (!isLoaded || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to SyncSphere! 🎉</CardTitle>
          <CardDescription className="text-lg">
            Hi {user.firstName}! You're all set to start managing tasks with AI-powered efficiency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold">Smart Task Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, organize, and track tasks with intelligent prioritization
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get smart suggestions and productivity insights powered by Gemini AI
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold">Real-time Sync</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stay in sync with your team with live updates and notifications
              </p>
            </div>
          </div>
          <div className="text-center">
            <Button onClick={handleGetStarted} size="lg" className="px-8">
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
