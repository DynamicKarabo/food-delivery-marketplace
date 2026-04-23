import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { api } from '../services/api'
import { Order } from '../types'

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PENDING: { icon: <Clock className="h-5 w-5" />, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
  CONFIRMED: { icon: <CheckCircle className="h-5 w-5" />, color: 'text-blue-600 bg-blue-100', label: 'Confirmed' },
  PREPARING: { icon: <Clock className="h-5 w-5" />, color: 'text-orange-600 bg-orange-100', label: 'Preparing' },
  OUT_FOR_DELIVERY: { icon: <Truck className="h-5 w-5" />, color: 'text-purple-600 bg-purple-100', label: 'On the way' },
  DELIVERED: { icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-600 bg-green-100', label: 'Delivered' },
  CANCELLED: { icon: <XCircle className="h-5 w-5" />, color: 'text-red-600 bg-red-100', label: 'Cancelled' },
}

export const Orders = () => {
  const { data: orders, isLoading } = useQuery('orders', async () => {
    const response = await api.get('/api/orders')
    return response.data.data as Order[]
  })

  if (isLoading) return <div className="text-center py-12">Loading orders...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No orders yet</p>
          <Link to="/restaurants" className="text-primary-600 hover:underline mt-2 inline-block">
            Order now
          </Link>
        </div>
      )}

      {orders?.map((order) => {
        const status = statusConfig[order.status] || statusConfig.PENDING
        return (
          <Link
            key={order.id}
            to={`/orders/${order.id}/track`}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                <p className="text-lg font-semibold mt-1">${order.total.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">{order.items.length} items</p>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${status.color}`}>
                {status.icon}
                <span className="text-sm font-medium">{status.label}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
