"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  Send,
  Lightbulb,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckSquare,
  Zap,
  Target,
  MessageSquare,
} from "lucide-react"

const aiFeatures = [
  {
    icon: Lightbulb,
    title: "Smart Task Breakdown",
    description: "AI automatically breaks complex tasks into manageable subtasks",
    example: 'Break down "Build user authentication" into 8 specific subtasks',
  },
  {
    icon: Clock,
    title: "Intelligent Scheduling",
    description: "Optimize your daily schedule based on priorities and deadlines",
    example: "Reorganize 12 tasks for maximum productivity today",
  },
  {
    icon: Users,
    title: "Team Load Balancing",
    description: "Automatically distribute tasks based on team capacity",
    example: "Sarah has 3 hours free - assign UI design tasks",
  },
  {
    icon: TrendingUp,
    title: "Performance Insights",
    description: "Get personalized productivity recommendations",
    example: "You're 23% more productive on Tuesday mornings",
  },
]

const chatHistory = [
  {
    type: "user",
    message: "Help me plan my day. I have 8 tasks due this week.",
    time: "10:30 AM",
  },
  {
    type: "ai",
    message:
      "I've analyzed your tasks and calendar. Here's an optimized schedule:\n\n🔥 **High Priority (Today)**\n• API Integration (2h) - 9:00-11:00 AM\n• Database Migration (1.5h) - 2:00-3:30 PM\n\n⚡ **Medium Priority (Tomorrow)**\n• User Testing Setup (1h)\n• Documentation Update (45min)\n\nThis leaves buffer time for meetings and follows your peak productivity hours.",
    time: "10:31 AM",
  },
  {
    type: "user",
    message: "Can you break down the API integration task?",
    time: "10:35 AM",
  },
  {
    type: "ai",
    message:
      "Here's the API Integration breakdown:\n\n1. **Setup & Authentication** (30min)\n   - Configure API keys\n   - Set up authentication headers\n\n2. **Core Integration** (45min)\n   - Implement payment endpoints\n   - Add error handling\n\n3. **Testing & Validation** (30min)\n   - Unit tests for API calls\n   - Integration testing\n\n4. **Documentation** (15min)\n   - Update API documentation\n   - Add usage examples\n\nWould you like me to create these as separate subtasks?",
    time: "10:36 AM",
  },
]

const quickActions = [
  { icon: CheckSquare, text: "Create task from description", color: "bg-blue-500" },
  { icon: Calendar, text: "Schedule my day", color: "bg-green-500" },
  { icon: Users, text: "Analyze team workload", color: "bg-purple-500" },
  { icon: Target, text: "Set smart deadlines", color: "bg-orange-500" },
  { icon: TrendingUp, text: "Show productivity insights", color: "bg-pink-500" },
  { icon: Zap, text: "Optimize task priorities", color: "bg-indigo-500" },
]

export default function AIPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [taskDescription, setTaskDescription] = useState("")

  const handleSendMessage = () => {
    if (!message.trim()) return

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
    }, 2000)

    setMessage("")
  }

  const handleQuickAction = (action: string) => {
    setMessage(action)
  }

  const handleCreateTask = () => {
    if (!taskDescription.trim()) return
    // Simulate AI task creation
    setTaskDescription("")
  }

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  if (!isSignedIn) {
    redirect("/sign-in")
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Assistant</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your intelligent productivity companion powered by advanced AI
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Chat Interface */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <span>AI Chat</span>
                      <Badge variant="secondary" className="ml-auto">
                        <Sparkles className="h-3 w-3 mr-1" />
                        GPT-4 Powered
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full rounded-md border p-4 mb-4">
                      <div className="space-y-4">
                        {chatHistory.map((msg, index) => (
                          <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`flex items-start space-x-3 max-w-[80%] ${msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-sm">
                                  {msg.type === "ai" ? <Bot className="h-4 w-4" /> : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`rounded-lg p-3 ${
                                  msg.type === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                }`}
                              >
                                <div className="text-sm whitespace-pre-line">{msg.message}</div>
                                <div
                                  className={`text-xs mt-2 opacity-70 ${msg.type === "user" ? "text-blue-100" : "text-gray-500"}`}
                                >
                                  {msg.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-sm">
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                  <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  />
                                  <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask AI anything about your tasks, schedule, or productivity..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!message.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Natural Language Task Creation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Natural Language Task Creation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Describe your task in natural language... 
Example: 'Remind me to update the client about project progress by Friday at 3 PM and assign it to Sarah'"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button onClick={handleCreateTask} disabled={!taskDescription.trim()} className="w-full">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Smart Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Features & Quick Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto p-3 text-left bg-transparent"
                          onClick={() => handleQuickAction(action.text)}
                        >
                          <div className={`p-1 ${action.color} rounded mr-3`}>
                            <action.icon className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">{action.text}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {aiFeatures.map((feature, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <feature.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                                {feature.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{feature.description}</p>
                              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                💡 {feature.example}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Model</span>
                        <Badge variant="secondary">GPT-4</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                        <span className="text-sm text-gray-900 dark:text-white">~1.2s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Analyzed</span>
                        <span className="text-sm text-gray-900 dark:text-white">1,247</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
