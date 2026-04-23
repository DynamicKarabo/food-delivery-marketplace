import { useState } from 'react'
import { useQuery } from 'react-query'
import { Search, SlidersHorizontal } from 'lucide-react'
import { RestaurantCard } from '../components/RestaurantCard'
import { Restaurant } from '../types'
import { api } from '../services/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const cuisines = ['All', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'Mediterranean']

export const Restaurants = () => {
  const [search, setSearch] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All')

  const { data: restaurants, isLoading } = useQuery('restaurants', async () => {
    const response = await api.get('/api/restaurants')
    return response.data.data as Restaurant[]
  })

  const filtered = restaurants?.filter((r) => {
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase())
    const matchesCuisine = selectedCuisine === 'All' || r.cuisineTypes.includes(selectedCuisine)
    return matchesSearch && matchesCuisine
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Restaurants</h1>
        <p className="text-muted-foreground">Discover the best food near you</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
          {cuisines.map((c) => (
            <Button
              key={c}
              variant={selectedCuisine === c ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCuisine(c)}
              className={selectedCuisine === c ? 'bg-primary hover:bg-primary/90' : ''}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered?.length || 0} restaurant{filtered?.length !== 1 ? 's' : ''} found
          </p>
          {selectedCuisine !== 'All' && (
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedCuisine('All')}>
              Clear filter ✕
            </Badge>
          )}
        </div>
      )}

      {/* Restaurant Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse h-80" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {filtered?.length === 0 && (
            <div className="text-center py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No restaurants found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setSelectedCuisine('All') }}>
                Clear filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
