"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

interface Activity {
  _id: string
  action: string
  taskTitle: string
  timestamp: string
}

export function useRealtimeActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const { isSignedIn } = useUser()

  const fetchActivities = async () => {
    if (!isSignedIn) return

    try {
      const response = await fetch("/api/activities")
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchActivities, 2000)

    return () => clearInterval(interval)
  }, [isSignedIn])

  return { activities, loading, refetch: fetchActivities }
}
