import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Your cart is empty</h2>
        <button
          onClick={() => navigate('/restaurants')}
          className="mt-4 text-primary-600 hover:underline"
        >
          Browse restaurants
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.menuItemId} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{item.menuItemName}</h3>
              <p className="text-gray-600">${item.unitPrice.toFixed(2)} each</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="p-2 hover:bg-gray-200 rounded-l-lg"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="p-2 hover:bg-gray-200 rounded-r-lg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <p className="font-semibold w-20 text-right">${item.totalPrice.toFixed(2)}</p>

              <button
                onClick={() => removeItem(item.menuItemId)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary-600">${getTotal().toFixed(2)}</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => clearCart()}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Cart
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
