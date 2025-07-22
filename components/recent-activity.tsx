"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckSquare, MessageSquare, UserPlus, FileText, GitBranch, Clock } from "lucide-react"
import { useRealtimeActivity } from "@/lib/hooks/use-realtime-activity"
import { LoadingSpinner } from "@/components/loading-spinner"

const getActivityIcon = (action: string) => {
  switch (action) {
    case "created":
      return GitBranch
    case "updated":
      return CheckSquare
    case "completed":
      return CheckSquare
    case "commented":
      return MessageSquare
    case "joined":
      return UserPlus
    case "uploaded":
      return FileText
    default:
      return Clock
  }
}

const getActivityColor = (action: string) => {
  switch (action) {
    case "created":
      return "text-indigo-600"
    case "updated":
      return "text-blue-600"
    case "completed":
      return "text-green-600"
    case "commented":
      return "text-blue-600"
    case "joined":
      return "text-purple-600"
    case "uploaded":
      return "text-orange-600"
    default:
      return "text-gray-600"
  }
}

export function RecentActivity() {
  const { activities, loading } = useRealtimeActivity()

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.action)
              const colorClass = getActivityColor(activity.action)

              return (
                <div
                  key={activity._id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user?.imageUrl || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {activity.user?.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className={`h-4 w-4 ${colorClass}`} />
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{activity.user?.fullName || "Unknown User"}</span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>{" "}
                        <span className="font-medium">{activity.entityType}</span>
                        {activity.metadata?.task_title && (
                          <span className="text-gray-600 dark:text-gray-400"> - {activity.metadata.task_title}</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {activity.action}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activity yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Activity will appear here as your team works</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
