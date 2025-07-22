"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import type { ActivityLog } from "@/lib/mongodb"

export function useRealtimeActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchActivities()

    // Set up polling for real-time updates (every 3 seconds)
    const interval = setInterval(fetchActivities, 3000)

    return () => clearInterval(interval)
  }, [user])

  const fetchActivities = async () => {
    try {
      if (!loading && activities.length === 0) setLoading(true)

      const response = await fetch("/api/activities")
      if (!response.ok) throw new Error("Failed to fetch activities")

      const data = await response.json()
      setActivities(data)
    } catch (err) {
      console.error("Error fetching activities:", err)
    } finally {
      setLoading(false)
    }
  }

  return {
    activities,
    loading,
    refetch: fetchActivities,
  }
}
