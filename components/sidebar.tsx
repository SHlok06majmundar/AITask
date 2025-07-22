"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, CheckSquare, Bot, BarChart3, Settings, Users, Calendar } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "AI Assistant", href: "/ai", icon: Bot },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">SyncSphere</span>
          </div>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
