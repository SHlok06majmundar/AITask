import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg"></div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"></div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  )
}
