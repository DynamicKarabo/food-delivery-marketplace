import { Link } from 'react-router-dom'
import { Star, Clock, Truck } from 'lucide-react'
import { Restaurant } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RestaurantCardProps {
  restaurant: Restaurant
}

const cuisineImages: Record<string, string> = {
  Italian: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80&auto=format',
  Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80&auto=format',
  Mexican: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80&auto=format',
  Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80&auto=format',
  Japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80&auto=format',
  American: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format',
  Thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80&auto=format',
  Mediterranean: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80&auto=format',
}

const getCuisineImage = (cuisines: string[]): string => {
  for (const c of cuisines) {
    if (cuisineImages[c]) return cuisineImages[c]
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format'
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const image = restaurant.imageUrl || getCuisineImage(restaurant.cuisineTypes)

  return (
    <Link to={`/restaurants/${restaurant.id}`}>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/95 text-foreground hover:bg-white/95 gap-1 font-semibold">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {restaurant.rating.toFixed(1)}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 flex gap-2">
            {restaurant.cuisineTypes.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary" className="bg-black/40 text-white border-0 backdrop-blur-sm">
                {c}
              </Badge>
            ))}
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {restaurant.description}
            </p>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{restaurant.estimatedDeliveryTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="h-4 w-4" />
              <span>${restaurant.deliveryFee.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
