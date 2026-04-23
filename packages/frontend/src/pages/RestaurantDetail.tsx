import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Plus, Minus, Star, Clock, Truck } from 'lucide-react'
import { api } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { MenuItem } from '../types'

export const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>()
  const addToCart = useCartStore((state) => state.addToCart)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const { data: restaurant, isLoading } = useQuery(['restaurant', id], async () => {
    const response = await api.get(`/api/restaurants/${id}`)
    return response.data.data
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
    addToCart(
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

  if (isLoading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-8">
      {/* Restaurant Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-64 bg-gray-200 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
            <p className="text-lg opacity-90">{restaurant?.cuisineTypes?.join(', ')}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span>{restaurant?.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-5 w-5" />
                <span>{restaurant?.estimatedDeliveryTime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="h-5 w-5" />
                <span>${restaurant?.deliveryFee} delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Menu</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {menuItems?.map((item: MenuItem) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <p className="text-primary-600 font-semibold mt-1">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-2 hover:bg-gray-200 rounded-l-lg"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{quantities[item.id] || 1}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-2 hover:bg-gray-200 rounded-r-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
