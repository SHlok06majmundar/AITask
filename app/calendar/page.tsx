"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import { CalendarIcon, Plus, Edit, Trash2, Clock, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  _id: string
  title: string
  description: string
  start: Date
  end: Date
  type: "meeting" | "deadline" | "reminder" | "personal"
  priority: "low" | "medium" | "high"
  attendees: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface EventFormData {
  title: string
  description: string
  start: string
  end: string
  type: "meeting" | "deadline" | "reminder" | "personal"
  priority: "low" | "medium" | "high"
  attendees: string
}

export default function CalendarPage() {
  const { user } = useUser()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    start: "",
    end: "",
    type: "meeting",
    priority: "medium",
    attendees: "",
  })

  // Fetch calendar events
  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/calendar/events")
      if (response.ok) {
        const data = await response.json()
        const transformedEvents = data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))
        setEvents(transformedEvents)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    // Real-time updates every 5 seconds
    const interval = setInterval(fetchEvents, 5000)
    return () => clearInterval(interval)
  }, [])

  // Handle event creation/update
  const handleSaveEvent = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter an event title")
      return
    }

    // Only validate dates if both are provided
    if (formData.start.trim() && formData.end.trim() && new Date(formData.start) >= new Date(formData.end)) {
      toast.error("End time must be after start time")
      return
    }

    setSaving(true)
    try {
      const eventData = {
        ...formData,
        attendees: formData.attendees
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
      }

      // Only add dates if they are provided
      if (formData.start.trim()) {
        eventData.start = new Date(formData.start).toISOString()
      }
      if (formData.end.trim()) {
        eventData.end = new Date(formData.end).toISOString()
      }

      const url = isEditing ? `/api/calendar/events/${selectedEvent?._id}` : "/api/calendar/events"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        toast.success(isEditing ? "Event updated successfully!" : "Event created successfully!")
        setShowEventDialog(false)
        resetForm()
        fetchEvents()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to save event")
      }
    } catch (error) {
      toast.error("Failed to save event")
    } finally {
      setSaving(false)
    }
  }

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Event deleted successfully!")
        fetchEvents()
      } else {
        toast.error("Failed to delete event")
      }
    } catch (error) {
      toast.error("Failed to delete event")
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start: "",
      end: "",
      type: "meeting",
      priority: "medium",
      attendees: "",
    })
    setSelectedEvent(null)
    setIsEditing(false)
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      start: format(event.start, "yyyy-MM-dd'T'HH:mm"),
      end: format(event.end, "yyyy-MM-dd'T'HH:mm"),
      type: event.type,
      priority: event.priority,
      attendees: event.attendees.join(", "),
    })
    setIsEditing(true)
    setShowEventDialog(true)
  }

  // Handle new event creation
  const handleNewEvent = () => {
    resetForm()
    setShowEventDialog(true)
  }

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3174ad"

    switch (event.type) {
      case "meeting":
        backgroundColor = "#3b82f6"
        break
      case "deadline":
        backgroundColor = "#ef4444"
        break
      case "reminder":
        backgroundColor = "#f59e0b"
        break
      case "personal":
        backgroundColor = "#8b5cf6"
        break
    }

    if (event.priority === "high") {
      backgroundColor = "#dc2626"
    } else if (event.priority === "low") {
      backgroundColor = "#6b7280"
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  // Get upcoming events
  const upcomingEvents = events
    .filter((event) => event.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
          </div>
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
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage your events, meetings, and deadlines</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live Updates
                </Badge>
                <Button onClick={handleNewEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Calendar View
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: "600px" }}>
                      <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleEventClick}
                        eventPropGetter={eventStyleGetter}
                        views={["month", "week", "day", "agenda"]}
                        defaultView="month"
                        popup
                        showMultiDayTimes
                        step={30}
                        timeslots={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Events</span>
                      <Badge variant="secondary">{events.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                      <Badge variant="secondary">
                        {
                          events.filter(
                            (e) =>
                              e.start.getMonth() === new Date().getMonth() &&
                              e.start.getFullYear() === new Date().getFullYear(),
                          ).length
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                      <Badge variant="secondary">{upcomingEvents.length}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No upcoming events</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event._id}
                            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {event.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {format(event.start, "MMM d, h:mm a")}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      event.type === "meeting"
                                        ? "text-blue-600 border-blue-600"
                                        : event.type === "deadline"
                                          ? "text-red-600 border-red-600"
                                          : event.type === "reminder"
                                            ? "text-yellow-600 border-yellow-600"
                                            : "text-purple-600 border-purple-600"
                                    }`}
                                  >
                                    {event.type}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      event.priority === "high"
                                        ? "text-red-600 border-red-600"
                                        : event.priority === "medium"
                                          ? "text-yellow-600 border-yellow-600"
                                          : "text-green-600 border-green-600"
                                    }`}
                                  >
                                    {event.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Event Types Legend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">Meeting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm">Deadline</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Reminder</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-sm">Personal</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update event details" : "Add a new event to your calendar"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Event description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Start</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end">End</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                />
              </div>
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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

            {/* Attendees */}
            <div>
              <Label htmlFor="attendees">Attendees</Label>
              <Input
                id="attendees"
                placeholder="email1@example.com, email2@example.com"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSaveEvent} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEditing ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {isEditing ? "Update Event" : "Create Event"}
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => handleDeleteEvent(selectedEvent!._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowEventDialog(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
