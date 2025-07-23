"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaskBoard } from "@/components/task-board"
import { RecentActivity } from "@/components/recent-activity"
import { QuickStats } from "@/components/quick-stats"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-full">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
                Welcome back, {user?.firstName || "User"}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">Here's what's happening with your projects today.</p>
            </div>

            <QuickStats />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
              <div className="xl:col-span-2 min-w-0">
                <TaskBoard />
              </div>
              <div className="min-w-0">
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
