"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, Lightbulb, Clock, Users, TrendingUp, Sparkles } from "lucide-react"

const suggestions = [
  {
    icon: Lightbulb,
    title: "Task Optimization",
    description: "Break down complex tasks into smaller subtasks",
    action: "Optimize my tasks",
  },
  {
    icon: Clock,
    title: "Schedule Planning",
    description: "Reorganize tasks for better productivity",
    action: "Plan my day",
  },
  {
    icon: Users,
    title: "Team Insights",
    description: "Analyze team performance and bottlenecks",
    action: "Show team insights",
  },
  {
    icon: TrendingUp,
    title: "Productivity Tips",
    description: "Get personalized productivity recommendations",
    action: "Get tips",
  },
]

const recentMessages = [
  {
    type: "ai",
    message: "I noticed you have 3 high-priority tasks due today. Would you like me to help prioritize them?",
    time: "2 min ago",
  },
  {
    type: "user",
    message: "Yes, please help me organize my tasks for today",
    time: "5 min ago",
  },
  {
    type: "ai",
    message:
      "Based on your calendar, I recommend starting with the API integration task since you have a 2-hour block free this morning.",
    time: "5 min ago",
  },
]

export function AIAssistant() {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = () => {
    if (!message.trim()) return

    setIsTyping(true)
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
    }, 2000)

    setMessage("")
  }

  const handleSuggestionClick = (action: string) => {
    setMessage(action)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span>AI Assistant</span>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Suggestions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</h4>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start h-auto p-3 text-left bg-transparent"
                onClick={() => handleSuggestionClick(suggestion.action)}
              >
                <suggestion.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <div>
                  <div className="font-medium text-xs">{suggestion.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{suggestion.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Conversation</h4>
          <ScrollArea className="h-48 w-full rounded-md border p-3">
            <div className="space-y-3">
              {recentMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {msg.type === "ai" ? <Bot className="h-3 w-3" /> : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-2 text-xs ${
                        msg.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`text-xs mt-1 opacity-70 ${msg.type === "user" ? "text-blue-100" : "text-gray-500"}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
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
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Ask AI anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Status */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>AI Assistant is online and ready to help</span>
        </div>
      </CardContent>
    </Card>
  )
}
