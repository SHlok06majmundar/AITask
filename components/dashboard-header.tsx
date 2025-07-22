"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, Plus } from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { useState } from "react"

export function DashboardHeader() {
  const { user } = useUser()
  const [showCreateTask, setShowCreateTask] = useState(false)

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search tasks, projects..." className="pl-10 w-64" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowCreateTask(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>

              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.emailAddresses[0]?.emailAddress}</p>
                </div>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <CreateTaskDialog open={showCreateTask} onOpenChange={setShowCreateTask} />
    </>
  )
}
