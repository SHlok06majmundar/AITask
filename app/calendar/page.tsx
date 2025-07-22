"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Clock, Plus, MapPin } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"

interface CalendarEvent {
  _id: string
  title: string
  description: string
  date: string
  time: string
  type: "task" | "meeting" | "deadline" | "reminder"
  priority: "low" | "medium" | "high"
  attendees?: string[]
  location?: string
}

export default function CalendarPage() {
  const { user } = useUser()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    type: "meeting" as const,
    priority: "medium" as const,
    location: "",
  })

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/calendar/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchEvents, 10000)
    return () => clearInterval(interval)
  }, [])

  const createEvent = async () => {
    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })

      if (response.ok) {
        setShowEventDialog(false)
        setNewEvent({
          title: "",
          description: "",
          date: format(new Date(), "yyyy-MM-dd"),
          time: "09:00",
          type: "meeting",
          priority: "medium",
          location: "",
        })
        fetchEvents()
      }
    } catch (error) {
      console.error("Error creating event:", error)
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date))
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "meeting":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "deadline":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "reminder":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  const selectedDateEvents = getEventsForDate(selectedDate)
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your schedule and events</p>
              </div>
              <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>Add a new event to your calendar</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Event title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Event description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newEvent.type}
                          onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="task">Task</SelectItem>
                            <SelectItem value="deadline">Deadline</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newEvent.priority}
                          onValueChange={(value: any) => setNewEvent({ ...newEvent, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location (Optional)</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Meeting room, address, or link"
                      />
                    </div>
                    <Button onClick={createEvent} className="w-full">
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2" />
                      {format(selectedDate, "MMMM yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                      modifiers={{
                        hasEvents: (date) => getEventsForDate(date).length > 0,
                      }}
                      modifiersStyles={{
                        hasEvents: {
                          backgroundColor: "rgb(59 130 246 / 0.1)",
                          color: "rgb(59 130 246)",
                          fontWeight: "bold",
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Events for Selected Date */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      {format(selectedDate, "EEEE, MMMM d")}
                      {isToday(selectedDate) && (
                        <Badge variant="secondary" className="ml-2">
                          Today
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedDateEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No events scheduled</p>
                        </div>
                      ) : (
                        selectedDateEvents.map((event) => (
                          <div
                            key={event._id}
                            className={`p-3 border-l-4 ${getPriorityColor(event.priority)} bg-white dark:bg-gray-800 rounded-r-lg shadow-sm`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                              <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                            )}
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {event.time}
                              </div>
                              {event.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Next 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {events
                        .filter((event) => {
                          const eventDate = new Date(event.date)
                          const today = new Date()
                          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                          return eventDate >= today && eventDate <= nextWeek
                        })
                        .slice(0, 5)
                        .map((event) => (
                          <div
                            key={event._id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                event.priority === "high"
                                  ? "bg-red-500"
                                  : event.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {format(new Date(event.date), "MMM d")} at {event.time}
                              </p>
                            </div>
                            <Badge variant="outline" className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
