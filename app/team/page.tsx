"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  X,
  ArrowLeft,
  Send,
  Search,
  CheckCircle,
  Globe,
  Building,
} from "lucide-react"
import { toast } from "sonner"

interface RegisteredUser {
  _id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  imageUrl: string
  joinedAt: string
  isOnline: boolean
  lastSeen: string
}

interface TeamMember {
  _id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  imageUrl: string
  role: "owner" | "admin" | "member"
  status: "active" | "pending"
  joinedAt: string
  teamId: string
}

interface TeamInvite {
  _id: string
  fromUserId: string
  fromUserName: string
  fromUserImage: string
  toUserId: string
  toUserEmail: string
  toUserName: string
  teamName: string
  role: "admin" | "member"
  status: "pending" | "accepted" | "declined"
  invitedAt: string
  message?: string
  inviteToken: string
}

interface Team {
  _id: string
  name: string
  description: string
  ownerId: string
  memberCount: number
  createdAt: string
}

export default function TeamPage() {
  const { user } = useUser()
  const router = useRouter()

  // State management
  const [activeTab, setActiveTab] = useState("my-team")
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [myTeamMembers, setMyTeamMembers] = useState<TeamMember[]>([])
  const [sentInvites, setSentInvites] = useState<TeamInvite[]>([])
  const [receivedInvites, setReceivedInvites] = useState<TeamInvite[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null)
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [inviteMessage, setInviteMessage] = useState("")
  const [sendingInvite, setSendingInvite] = useState(false)

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "member">("all")

  // Fetch all data
  const fetchAllData = async () => {
    try {
      const [usersRes, teamRes, sentRes, receivedRes, teamsRes] = await Promise.all([
        fetch("/api/users/all"),
        fetch("/api/team/my-members"),
        fetch("/api/team/invites/sent"),
        fetch("/api/team/invites/received"),
        fetch("/api/teams/all"),
      ])

      if (usersRes.ok) {
        const users = await usersRes.json()
        setRegisteredUsers(users.filter((u: RegisteredUser) => u.userId !== user?.id))
      }

      if (teamRes.ok) {
        const members = await teamRes.json()
        setMyTeamMembers(members)
      }

      if (sentRes.ok) {
        const sent = await sentRes.json()
        setSentInvites(sent)
      }

      if (receivedRes.ok) {
        const received = await receivedRes.json()
        setReceivedInvites(received)
      }

      if (teamsRes.ok) {
        const teams = await teamsRes.json()
        setAllTeams(teams)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAllData()
      // Real-time updates every 3 seconds
      const interval = setInterval(fetchAllData, 3000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Send team invitation
  const handleSendInvite = async () => {
    if (!selectedUser) return

    setSendingInvite(true)
    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: selectedUser.userId,
          toUserEmail: selectedUser.email,
          toUserName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          role: inviteRole,
          message: inviteMessage.trim() || `Join my team as ${inviteRole}!`,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Invitation sent to ${selectedUser.firstName} ${selectedUser.lastName}!`)
        setShowInviteDialog(false)
        setSelectedUser(null)
        setInviteMessage("")
        setInviteRole("member")
        fetchAllData()
      } else {
        toast.error(data.error || "Failed to send invitation")
      }
    } catch (error) {
      toast.error("Failed to send invitation")
    } finally {
      setSendingInvite(false)
    }
  }

  // Accept invitation
  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invites/${inviteId}/accept`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Invitation accepted! Welcome to the team!")
        fetchAllData()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to accept invitation")
      }
    } catch (error) {
      toast.error("Failed to accept invitation")
    }
  }

  // Decline invitation
  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invites/${inviteId}/decline`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Invitation declined")
        fetchAllData()
      } else {
        toast.error("Failed to decline invitation")
      }
    } catch (error) {
      toast.error("Failed to decline invitation")
    }
  }

  // Cancel sent invitation
  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invites/${inviteId}/cancel`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Invitation cancelled")
        fetchAllData()
      } else {
        toast.error("Failed to cancel invitation")
      }
    } catch (error) {
      toast.error("Failed to cancel invitation")
    }
  }

  // Remove team member
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Member removed from team")
        fetchAllData()
      } else {
        toast.error("Failed to remove member")
      }
    } catch (error) {
      toast.error("Failed to remove member")
    }
  }

  // Filter functions
  const filteredUsers = registeredUsers.filter((user) => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const filteredTeamMembers = myTeamMembers.filter((member) => {
    const matchesRole = filterRole === "all" || member.role === filterRole
    const matchesSearch = `${member.firstName} ${member.lastName} ${member.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case "admin":
        return "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "accepted":
        return "bg-green-100 text-green-800 border-green-300"
      case "declined":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading team data...</p>
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
                  <p className="text-gray-600 dark:text-gray-400">Connect with colleagues and build your dream team</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live Updates
                </Badge>
                <Badge variant="secondary">
                  <Globe className="h-3 w-3 mr-1" />
                  {registeredUsers.length} Users Online
                </Badge>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Team</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{myTeamMembers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Send className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent Invites</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{sentInvites.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Mail className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Received</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{receivedInvites.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">All Teams</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{allTeams.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="discover">
                  <Globe className="h-4 w-4 mr-2" />
                  Discover Users
                </TabsTrigger>
                <TabsTrigger value="my-team">
                  <Users className="h-4 w-4 mr-2" />
                  My Team ({myTeamMembers.length})
                </TabsTrigger>
                <TabsTrigger value="sent">
                  <Send className="h-4 w-4 mr-2" />
                  Sent ({sentInvites.length})
                </TabsTrigger>
                <TabsTrigger value="received">
                  <Mail className="h-4 w-4 mr-2" />
                  Received ({receivedInvites.length})
                </TabsTrigger>
                <TabsTrigger value="teams">
                  <Building className="h-4 w-4 mr-2" />
                  All Teams
                </TabsTrigger>
              </TabsList>

              {/* Discover Users Tab */}
              <TabsContent value="discover">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Discover Team Members
                        </CardTitle>
                        <CardDescription>Find and invite registered users to join your team</CardDescription>
                      </div>
                      <Badge variant="secondary">{filteredUsers.length} users found</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search users by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredUsers.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                        </div>
                      ) : (
                        filteredUsers.map((registeredUser) => (
                          <Card key={registeredUser._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="relative">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={registeredUser.imageUrl || "/placeholder.svg"} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                      {registeredUser.firstName?.[0]}
                                      {registeredUser.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  {registeredUser.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                    {registeredUser.firstName} {registeredUser.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {registeredUser.email}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {registeredUser.isOnline
                                      ? "Online now"
                                      : `Last seen ${new Date(registeredUser.lastSeen).toLocaleDateString()}`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedUser(registeredUser)
                                  setShowInviteDialog(true)
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite to Team
                              </Button>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My Team Tab */}
              <TabsContent value="my-team">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          My Team Members
                        </CardTitle>
                        <CardDescription>People who are part of your team</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={filterRole}
                          onValueChange={(value: "all" | "admin" | "member") => setFilterRole(value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search team members..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-4">
                      {filteredTeamMembers.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No team members yet
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Start building your team by discovering and inviting users
                          </p>
                          <Button onClick={() => setActiveTab("discover")}>
                            <Globe className="h-4 w-4 mr-2" />
                            Discover Users
                          </Button>
                        </div>
                      ) : (
                        filteredTeamMembers.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={member.imageUrl || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                  {member.firstName?.[0]}
                                  {member.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium text-gray-900 dark:text-white">
                                    {member.firstName} {member.lastName}
                                  </h3>
                                  {member.userId === user?.id && (
                                    <Badge variant="secondary" className="text-xs">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                <p className="text-xs text-gray-400">
                                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(member.role)}
                                <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                              </div>
                              {member.status === "pending" && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                  Pending
                                </Badge>
                              )}
                              {member.userId !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveMember(member._id, `${member.firstName} ${member.lastName}`)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sent Invites Tab */}
              <TabsContent value="sent">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Sent Invitations
                    </CardTitle>
                    <CardDescription>Invitations you've sent to other users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sentInvites.length === 0 ? (
                        <div className="text-center py-12">
                          <Send className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No invitations sent
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Start inviting users to build your team
                          </p>
                          <Button onClick={() => setActiveTab("discover")}>
                            <Globe className="h-4 w-4 mr-2" />
                            Discover Users
                          </Button>
                        </div>
                      ) : (
                        sentInvites.map((invite) => (
                          <div
                            key={invite._id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                                  {invite.toUserName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{invite.toUserName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{invite.toUserEmail}</p>
                                <p className="text-xs text-gray-400">
                                  Sent {new Date(invite.invitedAt).toLocaleDateString()}
                                </p>
                                {invite.message && (
                                  <p className="text-xs text-gray-500 italic mt-1">"{invite.message}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={getRoleBadgeColor(invite.role)}>{invite.role}</Badge>
                              <Badge variant="outline" className={getStatusBadgeColor(invite.status)}>
                                {invite.status}
                              </Badge>
                              {invite.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelInvite(invite._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Received Invites Tab */}
              <TabsContent value="received">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Received Invitations
                    </CardTitle>
                    <CardDescription>Team invitations you've received from other users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {receivedInvites.length === 0 ? (
                        <div className="text-center py-12">
                          <Mail className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No invitations received
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            When others invite you to their teams, they'll appear here
                          </p>
                        </div>
                      ) : (
                        receivedInvites.map((invite) => (
                          <div
                            key={invite._id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={invite.fromUserImage || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                                  {invite.fromUserName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{invite.fromUserName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Invited you to join {invite.teamName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(invite.invitedAt).toLocaleDateString()}
                                </p>
                                {invite.message && (
                                  <p className="text-xs text-gray-500 italic mt-1">"{invite.message}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={getRoleBadgeColor(invite.role)}>{invite.role}</Badge>
                              <Badge variant="outline" className={getStatusBadgeColor(invite.status)}>
                                {invite.status}
                              </Badge>
                              {invite.status === "pending" && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptInvite(invite._id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeclineInvite(invite._id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* All Teams Tab */}
              <TabsContent value="teams">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      All Teams
                    </CardTitle>
                    <CardDescription>Overview of all teams in the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allTeams.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No teams yet</h3>
                          <p className="text-gray-500 dark:text-gray-400">Teams will appear here as they are created</p>
                        </div>
                      ) : (
                        allTeams.map((team) => (
                          <Card key={team._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <Building className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{team.name}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {team.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{team.memberCount} members</span>
                                <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Team</DialogTitle>
            <DialogDescription>
              Send a team invitation to {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.imageUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {selectedUser.firstName?.[0]}
                    {selectedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(value: "admin" | "member") => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Member - Can view and manage tasks</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin - Full team management access</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personal Message */}
              <div>
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Input
                  id="message"
                  placeholder="Join my team and let's collaborate!"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{inviteMessage.length}/200 characters</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSendInvite} disabled={sendingInvite} className="flex-1">
                  {sendingInvite ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)} disabled={sendingInvite}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
