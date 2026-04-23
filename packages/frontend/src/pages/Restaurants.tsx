import { useState } from 'react'
import { useQuery } from 'react-query'
import { Search } from 'lucide-react'
import { RestaurantCard } from '../components/RestaurantCard'
import { Restaurant } from '../types'
import { api } from '../services/api'

export const Restaurants = () => {
  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('')

  const { data: restaurants, isLoading } = useQuery('restaurants', async () => {
    const response = await api.get('/api/restaurants')
    return response.data.data as Restaurant[]
  })

  const filtered = restaurants?.filter((r) => {
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase())
    const matchesCuisine = !cuisine || r.cuisineTypes.includes(cuisine)
    return matchesSearch && matchesCuisine
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Cuisines</option>
          <option value="Italian">Italian</option>
          <option value="Chinese">Chinese</option>
          <option value="Mexican">Mexican</option>
          <option value="Indian">Indian</option>
          <option value="Japanese">Japanese</option>
          <option value="American">American</option>
        </select>
      </div>

      {/* Restaurant Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading restaurants...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered?.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      {filtered?.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">No restaurants found</div>
      )}
    </div>
  )
}
