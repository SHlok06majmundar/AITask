"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Users, Zap, BarChart3 } from "lucide-react"

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()

  const features = [
    {
      icon: CheckCircle,
      title: "Smart Task Management",
      description: "Organize and prioritize tasks with AI assistance",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates",
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Get intelligent suggestions to boost productivity",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track progress with detailed analytics",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to SyncSphere, {user?.firstName}! 🎉</CardTitle>
          <CardDescription className="text-lg">
            Your AI-powered task management platform is ready to transform your productivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <feature.icon className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <Button onClick={() => router.push("/")} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started with SyncSphere
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
