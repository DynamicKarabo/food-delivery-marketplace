import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { MapPin, Clock, Truck, CheckCircle } from 'lucide-react'
import { api } from '../services/api'

const statusSteps = [
  { status: 'PENDING', label: 'Order Placed', icon: <Clock className="h-6 w-6" /> },
  { status: 'CONFIRMED', label: 'Confirmed', icon: <CheckCircle className="h-6 w-6" /> },
  { status: 'PREPARING', label: 'Preparing', icon: <Clock className="h-6 w-6" /> },
  { status: 'OUT_FOR_DELIVERY', label: 'On the Way', icon: <Truck className="h-6 w-6" /> },
  { status: 'DELIVERED', label: 'Delivered', icon: <MapPin className="h-6 w-6" /> },
]

export const OrderTracking = () => {
  const { id } = useParams<{ id: string }>()

  const { data: order, isLoading } = useQuery(['order', id], async () => {
    const response = await api.get(`/api/orders/${id}`)
    return response.data.data
  })

  if (isLoading) return <div className="text-center py-12">Loading order...</div>

  const currentStepIndex = statusSteps.findIndex((step) => step.status === order?.status)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Order Tracking</h1>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div key={step.status} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-primary-600 text-white'
                      : isCurrent
                      ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCompleted ? 'text-primary-600' : isCurrent ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-0">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="space-y-4">
          {order?.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {item.quantity}x {item.menuItemName}
                </p>
              </div>
              <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
            </div>
          ))}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary-600">${order?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
