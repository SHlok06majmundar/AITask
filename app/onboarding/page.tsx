"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Zap } from "lucide-react"

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    role: "",
    teamSize: "",
    goals: [] as string[],
  })

  const handleComplete = async () => {
    // Save onboarding data to user metadata
    try {
      await user?.update({
        unsafeMetadata: {
          onboardingCompleted: true,
          role: formData.role,
          teamSize: formData.teamSize,
          goals: formData.goals,
        },
      })
      router.push("/")
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const steps = [
    {
      title: "Welcome to SyncSphere!",
      description: "Let's get you set up for success",
      content: (
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Hi {user?.firstName}!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We're excited to help you and your team achieve more with intelligent task management.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Tell us about yourself",
      description: "Help us personalize your experience",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="role">What's your role?</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Team Manager</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="marketer">Marketer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="teamSize">How big is your team?</Label>
            <Select value={formData.teamSize} onValueChange={(value) => setFormData({ ...formData, teamSize: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Just me</SelectItem>
                <SelectItem value="small">2-5 people</SelectItem>
                <SelectItem value="medium">6-15 people</SelectItem>
                <SelectItem value="large">16+ people</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: "You're all set!",
      description: "Ready to start managing tasks like a pro",
      content: (
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Welcome aboard!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're ready to experience the power of AI-driven task management.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{steps[step - 1].title}</CardTitle>
          <CardDescription>{steps[step - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[step - 1].content}

          <div className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <div className="ml-auto">
              {step < steps.length ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 2 && (!formData.role || !formData.teamSize)}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete}>Get Started</Button>
              )}
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index + 1 <= step ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
