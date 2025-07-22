"use client"

import { useEffect, useState } from "react"
import { UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, CheckCheck } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { toast } from "sonner"

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export function DashboardHeader() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      })

      if (response.ok) {
        fetchNotifications()
        toast.success("All notifications marked as read")
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">SyncSphere</h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Notifications</h4>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>

              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.read ? "bg-muted/50" : "bg-background hover:bg-muted/50"
                        }`}
                        onClick={() => !notification.read && markAsRead(notification._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification._id)
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
