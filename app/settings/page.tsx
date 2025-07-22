"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, Palette, Globe, Trash2, Download } from "lucide-react"
import { toast } from "sonner"

interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    taskUpdates: boolean
    teamInvites: boolean
    weeklyDigest: boolean
  }
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    timezone: string
    dateFormat: string
    startOfWeek: string
  }
  privacy: {
    profileVisibility: "public" | "team" | "private"
    activityVisibility: boolean
    allowAnalytics: boolean
  }
}

export default function SettingsPage() {
  const { user } = useUser()
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      taskUpdates: true,
      teamInvites: true,
      weeklyDigest: false,
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/dd/yyyy",
      startOfWeek: "monday",
    },
    privacy: {
      profileVisibility: "team",
      activityVisibility: true,
      allowAnalytics: true,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, ...data })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success("Settings saved successfully!")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch("/api/user/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `syncsphere-data-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Data exported successfully!")
      } else {
        toast.error("Failed to export data")
      }
    } catch (error) {
      toast.error("Failed to export data")
    }
  }

  const deleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const response = await fetch("/api/user/delete", {
          method: "DELETE",
        })

        if (response.ok) {
          toast.success("Account deleted successfully")
          // Redirect to sign-out
          window.location.href = "/sign-out"
        } else {
          toast.error("Failed to delete account")
        }
      } catch (error) {
        toast.error("Failed to delete account")
      }
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="preferences">
                  <Palette className="h-4 w-4 mr-2" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="privacy">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="account">
                  <Globe className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your profile information and how others see you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.imageUrl || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline">Change Photo</Button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">JPG, GIF or PNG. 1MB max.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={user?.firstName || ""} disabled />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={user?.lastName || ""} disabled />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user?.primaryEmailAddress?.emailAddress || ""} disabled />
                    </div>

                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={(user?.unsafeMetadata?.role as string) || "Not specified"} disabled />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified about updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => updateSettings("notifications", "email", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive push notifications in your browser
                          </p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={settings.notifications.push}
                          onCheckedChange={(checked) => updateSettings("notifications", "push", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="task-updates">Task Updates</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get notified when tasks are updated
                          </p>
                        </div>
                        <Switch
                          id="task-updates"
                          checked={settings.notifications.taskUpdates}
                          onCheckedChange={(checked) => updateSettings("notifications", "taskUpdates", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="team-invites">Team Invitations</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get notified about team invitations
                          </p>
                        </div>
                        <Switch
                          id="team-invites"
                          checked={settings.notifications.teamInvites}
                          onCheckedChange={(checked) => updateSettings("notifications", "teamInvites", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weekly-digest">Weekly Digest</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive a weekly summary of your activity
                          </p>
                        </div>
                        <Switch
                          id="weekly-digest"
                          checked={settings.notifications.weeklyDigest}
                          onCheckedChange={(checked) => updateSettings("notifications", "weeklyDigest", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>App Preferences</CardTitle>
                    <CardDescription>Customize how the app looks and behaves</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={settings.preferences.theme}
                        onValueChange={(value) => updateSettings("preferences", "theme", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={settings.preferences.language}
                        onValueChange={(value) => updateSettings("preferences", "language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={settings.preferences.timezone}
                        onValueChange={(value) => updateSettings("preferences", "timezone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={settings.preferences.dateFormat}
                        onValueChange={(value) => updateSettings("preferences", "dateFormat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="startOfWeek">Start of Week</Label>
                      <Select
                        value={settings.preferences.startOfWeek}
                        onValueChange={(value) => updateSettings("preferences", "startOfWeek", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunday">Sunday</SelectItem>
                          <SelectItem value="monday">Monday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your privacy and data sharing preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="profileVisibility">Profile Visibility</Label>
                      <Select
                        value={settings.privacy.profileVisibility}
                        onValueChange={(value) => updateSettings("privacy", "profileVisibility", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="team">Team Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="activity-visibility">Activity Visibility</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Show your activity to team members</p>
                      </div>
                      <Switch
                        id="activity-visibility"
                        checked={settings.privacy.activityVisibility}
                        onCheckedChange={(checked) => updateSettings("privacy", "activityVisibility", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allow-analytics">Allow Analytics</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Help us improve by sharing anonymous usage data
                        </p>
                      </div>
                      <Switch
                        id="allow-analytics"
                        checked={settings.privacy.allowAnalytics}
                        onCheckedChange={(checked) => updateSettings("privacy", "allowAnalytics", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>View your account details and subscription status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Account Status</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Plan</span>
                        <Badge variant="outline">Free</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Member Since</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data & Privacy</CardTitle>
                      <CardDescription>Export your data or delete your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Export Data</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Download all your data in JSON format
                          </p>
                        </div>
                        <Button variant="outline" onClick={exportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-red-600">Delete Account</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button variant="destructive" onClick={deleteAccount}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-8">
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
