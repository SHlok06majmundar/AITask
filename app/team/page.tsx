"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, Mail, Crown, Shield, User, X, Copy } from "lucide-react"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/loading-spinner"

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
}

interface TeamInvite {
  _id: string
  email: string
  role: "admin" | "member"
  invitedBy: string
  invitedAt: string
  status: "pending" | "accepted" | "declined"
  inviteToken: string
}

export default function TeamPage() {
  const { user } = useUser()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)

  const fetchTeamData = async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([fetch("/api/team/members"), fetch("/api/team/invites")])

      if (membersRes.ok) {
        const members = await membersRes.json()
        setTeamMembers(members)
      }

      if (invitesRes.ok) {
        const invites = await invitesRes.json()
        setTeamInvites(invites)
      }
    } catch (error) {
      console.error("Error fetching team data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamData()
    // Real-time polling every 5 seconds
    const interval = setInterval(fetchTeamData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address")
      return
    }

    setSendingInvite(true)
    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Invitation sent successfully!")
        setInviteEmail("")
        setInviteRole("member")
        setShowInviteDialog(false)
        fetchTeamData()

        // Show the invite link
        const inviteLink = `${window.location.origin}/team/join/${data.inviteToken}`
        navigator.clipboard.writeText(inviteLink)
        toast.success("Invite link copied to clipboard!")
      } else {
        toast.error(data.message || "Failed to send invitation")
      }
    } catch (error) {
      toast.error("Failed to send invitation")
    } finally {
      setSendingInvite(false)
    }
  }

  const copyInviteLink = (token: string) => {
    const inviteLink = `${window.location.origin}/team/join/${token}`
    navigator.clipboard.writeText(inviteLink)
    toast.success("Invite link copied to clipboard!")
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Member removed successfully!")
        fetchTeamData()
      } else {
        toast.error("Failed to remove member")
      }
    } catch (error) {
      toast.error("Failed to remove member")
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invites/${inviteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Invitation cancelled!")
        fetchTeamData()
      } else {
        toast.error("Failed to cancel invitation")
      }
    } catch (error) {
      toast.error("Failed to cancel invitation")
    }
  }

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
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your team members and invitations</p>
              </div>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>Send an invitation link to join your team</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={(value: "admin" | "member") => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleInviteMember} className="w-full" disabled={sendingInvite}>
                      {sendingInvite ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="members" className="space-y-6">
              <TabsList>
                <TabsTrigger value="members">
                  <Users className="h-4 w-4 mr-2" />
                  Members ({teamMembers.length})
                </TabsTrigger>
                <TabsTrigger value="invites">
                  <Mail className="h-4 w-4 mr-2" />
                  Invitations ({teamInvites.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>People who have access to your workspace</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No team members yet
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">Invite team members to get started</p>
                        </div>
                      ) : (
                        teamMembers.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage src={member.imageUrl || "/placeholder.svg"} />
                                <AvatarFallback>
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
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(member.role)}
                                <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                              </div>
                              {member.status === "pending" && (
                                <Badge variant="outline" className="text-yellow-600">
                                  Pending
                                </Badge>
                              )}
                              {member.userId !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member._id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Remove
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

              <TabsContent value="invites">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>Invitations that haven't been accepted yet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamInvites.length === 0 ? (
                        <div className="text-center py-8">
                          <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No pending invitations
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">Invite team members to get started</p>
                        </div>
                      ) : (
                        teamInvites.map((invite) => (
                          <div
                            key={invite._id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{invite.email}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Invited {new Date(invite.invitedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={getRoleBadgeColor(invite.role)}>{invite.role}</Badge>
                              <Badge
                                variant="outline"
                                className={
                                  invite.status === "pending"
                                    ? "text-yellow-600"
                                    : invite.status === "accepted"
                                      ? "text-green-600"
                                      : "text-red-600"
                                }
                              >
                                {invite.status}
                              </Badge>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => copyInviteLink(invite.inviteToken)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelInvite(invite._id)}
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
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
    </div>
  )
}
