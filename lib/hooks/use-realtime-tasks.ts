"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import type { Task } from "@/lib/mongodb"

export function useRealtimeTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchTasks()

    // Set up polling for real-time updates (every 2 seconds)
    const interval = setInterval(fetchTasks, 2000)

    return () => clearInterval(interval)
  }, [user])

  const fetchTasks = async () => {
    try {
      if (!loading && tasks.length === 0) setLoading(true)

      const response = await fetch("/api/tasks")
      if (!response.ok) throw new Error("Failed to fetch tasks")

      const data = await response.json()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) throw new Error("Failed to create task")

      const newTask = await response.json()
      setTasks((prev) => [newTask, ...prev])

      // Log activity
      await logActivity("created", "task", newTask._id, { task_title: taskData.title })

      return newTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update task")

      const updatedTask = await response.json()
      setTasks((prev) => prev.map((task) => (task._id === taskId ? updatedTask : task)))

      // Log activity
      await logActivity("updated", "task", taskId, { updates })

      return updatedTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete task")

      setTasks((prev) => prev.filter((task) => task._id !== taskId))

      // Log activity
      await logActivity("deleted", "task", taskId, {})
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task")
      throw err
    }
  }

  const logActivity = async (action: string, entityType: string, entityId: string, metadata: any) => {
    if (!user) return

    try {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          entityType,
          entityId,
          metadata,
        }),
      })
    } catch (err) {
      console.error("Failed to log activity:", err)
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  }
}
