import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, MapPin, Heart, LogIn } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export const Profile = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
          <LogIn className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Please sign in</h2>
        <p className="text-muted-foreground mt-2 mb-8">Sign in to view your profile and orders.</p>
        <Link to="/login">
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-primary p-8">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-white/30">
              <AvatarFallback className="bg-white text-primary text-2xl font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h1 className="text-2xl font-bold tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-white/90">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto py-2 px-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-lg font-semibold">{user.firstName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-lg font-semibold">{user.lastName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-lg font-semibold">{user.phone || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No addresses saved</h3>
              <p className="text-muted-foreground mt-1">Add a delivery address during checkout.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No favorites yet</h3>
              <p className="text-muted-foreground mt-1">Heart your favorite restaurants to see them here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
