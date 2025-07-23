"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserPlus,
  Send,
  Check,
  X,
  Crown,
  Shield,
  UserIcon,
  Search,
  Mail,
  Calendar,
  Clock,
  Trash2,
  Eye,
  Settings,
} from "lucide-react"
import { toast } from "sonner"
import { TeamTaskBoard } from "@/components/team-task-board"

interface User {
  _id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  imageUrl: string
  createdAt: string
  isOnline: boolean
}

interface TeamMember {
  _id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  imageUrl: string
  role: "owner" | "admin" | "member"
  status: "active" | "pending"
  joinedAt: string
}

interface Invitation {
  _id: string
  fromUserId: string
  fromUserName: string
  fromUserImage: string
  toUserId: string
  toUserName: string
  toUserImage: string
  toUserEmail: string
  role: "admin" | "member"
  message: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
  expiresAt: string
}

export default function TeamPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("discover")
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [sentInvites, setSentInvites] = useState<Invitation[]>([])
  const [receivedInvites, setReceivedInvites] = useState<Invitation[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [inviteForm, setInviteForm] = useState({
    role: "member" as "admin" | "member",
    message: "",
  })

  const fetchAllUsers = async () => {
    try {
      const response = await fetch("/api/users/all")
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data.filter((u: User) => u.userId !== user?.id))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team/my-members")
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data)

        // Find current user's role
        const currentMember = data.find((member: TeamMember) => member.userId === user?.id)
        if (currentMember) {
          setCurrentUserRole(currentMember.role)
        }
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
    }
  }

  const fetchSentInvites = async () => {
    try {
      const response = await fetch("/api/team/invites/sent")
      if (response.ok) {
        const data = await response.json()
        setSentInvites(data)
      }
    } catch (error) {
      console.error("Error fetching sent invites:", error)
    }
  }

  const fetchReceivedInvites = async () => {
    try {
      const response = await fetch("/api/team/invites/received")
      if (response.ok) {
        const data = await response.json()
        setReceivedInvites(data)
      }
    } catch (error) {
      console.error("Error fetching received invites:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAllUsers()
      fetchTeamMembers()
      fetchSentInvites()
      fetchReceivedInvites()

      // Real-time updates every 3 seconds
      const interval = setInterval(() => {
        fetchAllUsers()
        fetchTeamMembers()
        fetchSentInvites()
        fetchReceivedInvites()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [user])

  const isAdmin = currentUserRole === "admin" || currentUserRole === "owner"

  const sendInvitation = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to invite")
      return
    }

    if (!selectedUser.email || !selectedUser.firstName || !selectedUser.lastName) {
      toast.error("Selected user is missing required information")
      return
    }

    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: selectedUser.userId,
          toUserEmail: selectedUser.email,
          toUserName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          role: inviteForm.role,
          message: inviteForm.message || `Join my team as ${inviteForm.role}!`,
        }),
      })

      if (response.ok) {
        toast.success("Invitation sent successfully!")
        setIsInviteDialogOpen(false)
        setSelectedUser(null)
        setInviteForm({ role: "member", message: "" })
        fetchSentInvites()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      toast.error("Failed to send invitation")
    }
  }

  const acceptInvitation = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invites/${inviteId}/accept`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Invitation accepted!")
        fetchReceivedInvites()
        fetchTeamMembers()
      } else {
        toast.error("Failed to accept invitation")
      }
    } catch (error) {
      toast.error("Failed to accept invitation")
    }
  }

  const declineInvitation = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invites/${inviteId}/decline`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Invitation declined")
        fetchReceivedInvites()
      } else {
        toast.error("Failed to decline invitation")
      }
    } catch (error) {
      toast.error("Failed to decline invitation")
    }
  }

  const cancelInvitation = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invites/${inviteId}/cancel`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Invitation cancelled")
        fetchSentInvites()
      } else {
        toast.error("Failed to cancel invitation")
      }
    } catch (error) {
      toast.error("Failed to cancel invitation")
    }
  }

  const removeMember = async (memberId: string) => {
    if (!isAdmin) {
      toast.error("Only admins can remove team members")
      return
    }

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Member removed from team")
        fetchTeamMembers()
      } else {
        toast.error("Failed to remove member")
      }
    } catch (error) {
      toast.error("Failed to remove member")
    }
  }

  const filteredUsers = allUsers.filter(
    (u) =>
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="text-green-600">
            Accepted
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="outline" className="text-red-600">
            Declined
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">Team Management</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Discover, invite, and collaborate with team members</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 text-xs">
                  {getRoleIcon(currentUserRole)}
                  <span className="truncate">{currentUserRole}</span>
                </Badge>
                <Badge variant="outline" className="text-green-600 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 sm:mr-2"></div>
                  <span className="hidden sm:inline">Live Updates</span>
                  <span className="sm:hidden">Live</span>
                </Badge>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 min-w-max">
                  <TabsTrigger value="discover" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Discover</span>
                    <span className="sm:hidden">Find</span>
                    <span className="hidden lg:inline">({filteredUsers.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">My Team</span>
                    <span className="sm:hidden">Team</span>
                    <span className="hidden lg:inline">({teamMembers.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Sent</span>
                    <span className="sm:hidden">Out</span>
                    <span className="hidden lg:inline">({sentInvites.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="received" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Received</span>
                    <span className="sm:hidden">In</span>
                    <span className="hidden lg:inline">({receivedInvites.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Team Tasks</span>
                    <span className="sm:hidden">Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Overview</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Discover Users Tab */}
              <TabsContent value="discover" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Badge variant="outline" className="text-xs sm:text-sm self-start sm:self-auto">
                    {filteredUsers.length} users found
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredUsers.map((user) => (
                    <Card key={user._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                              <AvatarImage src={user.imageUrl || "/placeholder.svg"} />
                              <AvatarFallback className="text-sm">
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted-foreground mb-3 gap-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          {user.isOnline ? (
                            <Badge variant="outline" className="text-green-600 text-xs">
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 text-xs">
                              Offline
                            </Badge>
                          )}
                        </div>

                        {isAdmin ? (
                          <Button
                            onClick={() => {
                              setSelectedUser(user)
                              setIsInviteDialogOpen(true)
                            }}
                            className="w-full"
                            size="sm"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite to Team
                          </Button>
                        ) : (
                          <Button disabled className="w-full bg-transparent" size="sm" variant="outline">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Only
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms</p>
                  </div>
                )}
              </TabsContent>

              {/* My Team Tab */}
              <TabsContent value="team" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <Card key={member._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.imageUrl || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.firstName.charAt(0)}
                              {member.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {member.firstName} {member.lastName}
                              </h3>
                              {getRoleIcon(member.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <Badge className={getRoleBadgeColor(member.role)} variant="secondary">
                              {member.role}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {member.status}
                          </Badge>
                        </div>

                        {member.role !== "owner" && member.userId !== user?.id && isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMember(member._id)}
                            className="w-full text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {teamMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
                    <p className="text-muted-foreground">Start by inviting users from the Discover tab</p>
                  </div>
                )}
              </TabsContent>

              {/* Sent Invitations Tab */}
              <TabsContent value="sent" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sentInvites.map((invite) => (
                    <Card key={invite._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={invite.toUserImage || "/placeholder.svg"} />
                            <AvatarFallback>{invite.toUserName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{invite.toUserName}</h3>
                            <p className="text-sm text-muted-foreground">{invite.toUserEmail}</p>
                          </div>
                          {getStatusBadge(invite.status)}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4" />
                            <span>Role: {invite.role}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Sent {new Date(invite.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {invite.message && (
                          <div className="bg-muted p-2 rounded text-sm mb-3">
                            <p className="italic">"{invite.message}"</p>
                          </div>
                        )}

                        {invite.status === "pending" && isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelInvitation(invite._id)}
                            className="w-full text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Invitation
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {sentInvites.length === 0 && (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No invitations sent</h3>
                    <p className="text-muted-foreground">
                      {isAdmin
                        ? "Invite users from the Discover tab to build your team"
                        : "Only admins can send invitations"}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Received Invitations Tab */}
              <TabsContent value="received" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receivedInvites.map((invite) => (
                    <Card key={invite._id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={invite.fromUserImage || "/placeholder.svg"} />
                            <AvatarFallback>{invite.fromUserName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{invite.fromUserName}</h3>
                            <p className="text-sm text-muted-foreground">invited you to join their team</p>
                          </div>
                          {getStatusBadge(invite.status)}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4" />
                            <span>Role: {invite.role}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Received {new Date(invite.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {invite.message && (
                          <div className="bg-blue-50 border-l-4 border-l-blue-500 p-3 rounded text-sm mb-3">
                            <p className="italic">"{invite.message}"</p>
                          </div>
                        )}

                        {invite.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => acceptInvitation(invite._id)} className="flex-1">
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => declineInvitation(invite._id)}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {receivedInvites.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No invitations received</h3>
                    <p className="text-muted-foreground">You'll see team invitations here when others invite you</p>
                  </div>
                )}
              </TabsContent>

              {/* Team Tasks Tab */}
              <TabsContent value="tasks">
                <TeamTaskBoard />
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{teamMembers.length}</p>
                      <p className="text-sm text-muted-foreground">Team Members</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Send className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{sentInvites.length}</p>
                      <p className="text-sm text-muted-foreground">Sent Invites</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{receivedInvites.length}</p>
                      <p className="text-sm text-muted-foreground">Received Invites</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Search className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{allUsers.length}</p>
                      <p className="text-sm text-muted-foreground">Available Users</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Team Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sentInvites.slice(0, 5).map((invite) => (
                          <div key={invite._id} className="flex items-center gap-3 p-2 bg-muted rounded">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={invite.toUserImage || "/placeholder.svg"} />
                              <AvatarFallback>{invite.toUserName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm">Invited {invite.toUserName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(invite.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {getStatusBadge(invite.status)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Team Composition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {["owner", "admin", "member"].map((role) => {
                          const count = teamMembers.filter((m) => m.role === role).length
                          return (
                            <div key={role} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(role)}
                                <span className="capitalize">{role}s</span>
                              </div>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Invite Dialog */}
      {isAdmin && (
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite to Team</DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.imageUrl || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedUser.firstName.charAt(0)}
                      {selectedUser.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: "admin" | "member") => setInviteForm({ ...inviteForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Member - Can view, edit tasks and comment
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin - Can create, assign and manage all tasks
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Personal Message (Optional)</label>
                  <Textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    placeholder="Add a personal message to your invitation..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={sendInvitation} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
