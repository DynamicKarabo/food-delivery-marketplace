import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, MapPin } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { api } from '../services/api'

export const Checkout = () => {
  const { items, getTotal, restaurantId, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryInstructions: '',
  })

  const deliveryFee = 2.99
  const tax = getTotal() * 0.08
  const total = getTotal() + deliveryFee + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderResponse = await api.post('/api/orders', {
        customerId: 'temp-customer-id',
        restaurantId,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          selectedOptions: item.selectedOptions,
        })),
        deliveryAddress,
        deliveryInstructions: deliveryAddress.deliveryInstructions,
        deliveryFee,
        tax,
      })

      clearCart()
      navigate(`/orders/${orderResponse.data.data.id}/track`)
    } catch (error) {
      console.error('Checkout failed:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
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
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Delivery Address</h2>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Street address"
              value={deliveryAddress.street}
              onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={deliveryAddress.city}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={deliveryAddress.state}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <input
              type="text"
              placeholder="ZIP code"
              value={deliveryAddress.zipCode}
              onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
            <textarea
              placeholder="Delivery instructions (optional)"
              value={deliveryAddress.deliveryInstructions}
              onChange={(e) => setDeliveryAddress({ ...deliveryAddress, deliveryInstructions: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between">
                <span>
                  {item.quantity}x {item.menuItemName}
                </span>
                <span>${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Payment</h2>
          </div>
          <p className="text-gray-600 mb-4">Payment will be processed securely via Stripe after placing the order.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  )
}
