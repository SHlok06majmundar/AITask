"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

interface Task {
  _id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "done"
  assignee?: string
  createdAt: string
  updatedAt: string
}

export function useRealtimeTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { isSignedIn } = useUser()

  const fetchTasks = async () => {
    if (!isSignedIn) return

    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchTasks, 3000)

    return () => clearInterval(interval)
  }, [isSignedIn])

  const createTask = async (taskData: Omit<Task, "_id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        fetchTasks() // Refresh tasks
      }
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchTasks() // Refresh tasks
      }
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTasks() // Refresh tasks
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  }
}
