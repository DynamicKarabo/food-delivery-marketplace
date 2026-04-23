import { Link } from 'react-router-dom'
import { Star, Clock, Truck } from 'lucide-react'
import { Restaurant } from '../types'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-48 bg-gray-200 relative">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100">
            <span className="text-primary-600 text-4xl">🍽️</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded">
            <Star className="h-4 w-4 text-green-600 fill-current" />
            <span className="text-sm font-medium text-green-600">{restaurant.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-1">{restaurant.cuisineTypes.join(', ')}</p>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{restaurant.estimatedDeliveryTime} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Truck className="h-4 w-4" />
            <span>${restaurant.deliveryFee} delivery</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
