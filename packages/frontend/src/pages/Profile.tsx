import { useState } from 'react'
import { User, Mail, MapPin, Heart } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export const Profile = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'favorites'>('profile')

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Please sign in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-primary-100">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'addresses', label: 'Addresses', icon: MapPin },
              { id: 'favorites', label: 'Favorites', icon: Heart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <p className="mt-1 text-gray-900">{user.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 text-gray-900">{user.lastName}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No addresses saved yet</p>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No favorite restaurants yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
