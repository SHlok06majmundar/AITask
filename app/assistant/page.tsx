"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, Lightbulb, Clock, Users, TrendingUp, MessageCircle, Zap, Target } from "lucide-react"
import { toast } from "sonner"

interface Insight {
  type: "productivity" | "task" | "team" | "schedule"
  title: string
  description: string
  action?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AssistantPage() {
  const { user } = useUser()
  const [insights, setInsights] = useState<Insight[]>([])
  const [taskDescription, setTaskDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello ${user?.firstName || "there"}! I'm your productivity assistant. I can help you with:

• Task management and prioritization
• Schedule optimization
• Team collaboration insights
• Productivity tips and strategies

How can I help you be more productive today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/insights")
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (error) {
      console.error("Error fetching insights:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()

    // Real-time updates every 30 seconds
    const interval = setInterval(fetchInsights, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSmartTask = async () => {
    if (!taskDescription.trim()) return

    try {
      const response = await fetch("/api/create-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: taskDescription }),
      })

      if (response.ok) {
        const data = await response.json()
        setTaskDescription("")
        toast.success(`Created ${data.tasksCreated} tasks successfully!`)
      } else {
        toast.error("Failed to create tasks")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create tasks")
    }
  }

  const quickActions = [
    {
      icon: Lightbulb,
      title: "Optimize My Day",
      description: "Get suggestions for task prioritization",
      action: "How should I prioritize my tasks today?",
    },
    {
      icon: Clock,
      title: "Schedule Analysis",
      description: "Analyze my schedule for optimization opportunities",
      action: "Analyze my schedule and suggest improvements",
    },
    {
      icon: Users,
      title: "Team Insights",
      description: "Get insights about team productivity",
      action: "Show me insights about my team's productivity",
    },
    {
      icon: TrendingUp,
      title: "Productivity Tips",
      description: "Get personalized productivity recommendations",
      action: "Give me productivity tips based on my work patterns",
    },
  ]

  const handleQuickAction = (action: string) => {
    setInput(action)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Productivity Assistant</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your intelligent productivity companion for better task management
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="chat" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat">Assistant Chat</TabsTrigger>
                    <TabsTrigger value="create">Smart Task Creator</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat">
                    <Card className="h-[600px] flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                            <MessageCircle className="h-5 w-5 text-white" />
                          </div>
                          <span>Productivity Chat</span>
                          <Badge variant="secondary" className="ml-auto">
                            <Target className="h-3 w-3 mr-1" />
                            Smart Assistant
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col p-0">
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-4">
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`flex items-start space-x-3 max-w-[80%] ${
                                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                                  }`}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-sm">
                                      {message.role === "assistant" ? <MessageCircle className="h-4 w-4" /> : "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`rounded-lg p-3 ${
                                      message.role === "user"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {isLoading && (
                              <div className="flex justify-start">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-sm">
                                      <MessageCircle className="h-4 w-4" />
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

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                          <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <Input
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Ask me anything about productivity, tasks, or team management..."
                              disabled={isLoading}
                              className="flex-1"
                            />
                            <Button type="submit" disabled={isLoading || !input.trim()}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="create">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <MessageSquare className="h-5 w-5" />
                          <span>Smart Task Creator</span>
                        </CardTitle>
                        <CardDescription>
                          Describe your task in natural language and get structured tasks created automatically
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          placeholder="Example: 'I need to prepare a presentation for the quarterly review meeting next Friday. Include market analysis, team performance metrics, and budget overview.'"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <Button onClick={handleCreateSmartTask} disabled={!taskDescription.trim()} className="w-full">
                          <Target className="h-4 w-4 mr-2" />
                          Create Structured Tasks
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Insights & Quick Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Get instant productivity assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start h-auto p-3 text-left bg-transparent"
                          onClick={() => handleQuickAction(action.action)}
                        >
                          <action.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Productivity Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Productivity Insights</span>
                    </CardTitle>
                    <CardDescription>Personalized recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            </div>
                          ))}
                        </div>
                      ) : insights.length === 0 ? (
                        <div className="text-center py-4">
                          <Lightbulb className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No insights available yet. Start using the app to get personalized recommendations!
                          </p>
                        </div>
                      ) : (
                        insights.map((insight, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                                <Lightbulb className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                                  {insight.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{insight.description}</p>
                                {insight.action && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6 bg-transparent"
                                    onClick={() => handleQuickAction(insight.action!)}
                                  >
                                    {insight.action}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Assistant</span>
                        <Badge variant="secondary">Advanced</Badge>
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
                        <span className="text-sm text-gray-900 dark:text-white">~0.8s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Conversations</span>
                        <span className="text-sm text-gray-900 dark:text-white">{messages.length}</span>
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
