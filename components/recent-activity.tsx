"use client"

import { useRealtimeActivity } from "@/lib/hooks/use-realtime-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/loading-spinner"

export function RecentActivity() {
  const { activities, loading } = useRealtimeActivity()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 sm:h-80 scrollbar-thin">
          <div className="space-y-3 sm:space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-2 sm:space-x-3">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src={activity.user?.imageUrl || ""} />
                    <AvatarFallback className="text-xs">{activity.user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                      <span className="font-medium truncate">{activity.user?.fullName || "Someone"}</span> {activity.action} a{" "}
                      {activity.entityType}
                      {activity.metadata?.task_title && (
                        <span className="font-medium line-clamp-2"> "{activity.metadata.task_title}"</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
