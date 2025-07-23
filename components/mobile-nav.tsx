"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  MessageCircle, 
  Settings, 
  Menu,
  Target
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Team", href: "/team", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Assistant", href: "/assistant", icon: MessageCircle },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          {/* Hidden accessibility elements */}
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              Navigate through the application using the menu items below
            </SheetDescription>
          </VisuallyHidden>
          
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 border-b p-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">SyncSphere</h1>
                <p className="text-xs text-muted-foreground">Task Management</p>
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start px-3",
                          isActive && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4">
              <div className="text-xs text-muted-foreground text-center">
                SyncSphere v2.0
                <br />
                Advanced Task Management
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
