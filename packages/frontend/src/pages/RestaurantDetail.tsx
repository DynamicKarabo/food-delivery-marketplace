import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Plus, Minus, Star, Clock, Truck, MapPin, ChevronLeft, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { MenuItem, Restaurant } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

const cuisineImages: Record<string, string> = {
  Italian: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=1200&q=80&auto=format',
  Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80&auto=format',
  Mexican: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200&q=80&auto=format',
  Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80&auto=format',
  Japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80&auto=format',
  American: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80&auto=format',
  Thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&q=80&auto=format',
  Mediterranean: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80&auto=format',
}

const getCuisineImage = (cuisines: string[]): string => {
  for (const c of cuisines) {
    if (cuisineImages[c]) return cuisineImages[c]
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format'
}

export const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>()
  const addItem = useCartStore((state) => state.addItem)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const { data: restaurant, isLoading } = useQuery(['restaurant', id], async () => {
    const response = await api.get(`/api/restaurants/${id}`)
    return response.data.data as Restaurant
  })

  const { data: menuItems } = useQuery(['menu', id], async () => {
    const response = await api.get(`/api/menu/${id}/items`)
    return response.data.data as MenuItem[]
  })

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }))
  }

  const handleAddToCart = (item: MenuItem) => {
    const qty = quantities[item.id] || 1
    addItem(
      {
        menuItemId: item.id,
        menuItemName: item.name,
        quantity: qty,
        unitPrice: item.price,
        totalPrice: item.price * qty,
        selectedOptions: [],
      },
      id!
    )
    setQuantities((prev) => ({ ...prev, [item.id]: 0 }))
  }

  const categories = [...new Set(menuItems?.map((item) => item.category) || [])]
  const menuByCategory = (category: string) =>
    menuItems?.filter((item) => item.category === category) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const heroImage = restaurant ? getCuisineImage(restaurant.cuisineTypes) : ''

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link to="/restaurants">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to restaurants
        </Button>
      </Link>

      {/* Restaurant Header */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={restaurant?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        <div className="relative z-10 p-6 md:p-10 pt-32 md:pt-48">
          <div className="flex flex-wrap gap-2 mb-3">
            {restaurant?.cuisineTypes.map((c) => (
              <Badge key={c} variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                {c}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {restaurant?.name}
          </h1>
          <p className="text-white/80 mt-2 max-w-xl text-lg">
            {restaurant?.description}
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-6 text-white/90">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-semibold">{restaurant?.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-5 w-5" />
              <span>{restaurant?.estimatedDeliveryTime} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-5 w-5" />
              <span>${restaurant?.deliveryFee.toFixed(2)} delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-5 w-5" />
              <span>Min order ${restaurant?.minOrderAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
        </div>

        {categories.length > 0 ? (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto h-auto py-2 px-1 flex-wrap">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-sm">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <Separator className="my-4" />
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-4 mt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  {menuByCategory(category).map((item: MenuItem) => (
                    <Card key={item.id} className="border-0 shadow-md overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="flex-1 p-5 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                              <span className="text-primary font-bold whitespace-nowrap">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={(quantities[item.id] || 1) <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {quantities[item.id] || 1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleAddToCart(item)}
                              >
                                Add to cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {menuByCategory(category).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No items in this category
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No menu items yet</h3>
            <p className="text-muted-foreground mt-1">Check back later for delicious options</p>
          </div>
        )}
      </div>
    </div>
  )
}
