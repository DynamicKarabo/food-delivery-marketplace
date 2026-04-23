import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { MapPin, Clock, Truck, CheckCircle, Package } from 'lucide-react'
import { api } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const statusSteps = [
  { status: 'PENDING', label: 'Order Placed', icon: <Clock className="h-5 w-5" /> },
  { status: 'CONFIRMED', label: 'Confirmed', icon: <CheckCircle className="h-5 w-5" /> },
  { status: 'PREPARING', label: 'Preparing', icon: <Clock className="h-5 w-5" /> },
  { status: 'OUT_FOR_DELIVERY', label: 'On the Way', icon: <Truck className="h-5 w-5" /> },
  { status: 'DELIVERED', label: 'Delivered', icon: <MapPin className="h-5 w-5" /> },
]

export const OrderTracking = () => {
  const { id } = useParams<{ id: string }>()

  const { data: order, isLoading } = useQuery(['order', id], async () => {
    const response = await api.get(`/api/orders/${id}`)
    return response.data.data
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  const currentStepIndex = statusSteps.findIndex((step) => step.status === order?.status)
  const progressPercent = Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Tracking</h1>
        <p className="text-muted-foreground mt-1">Order #{order?.id?.slice(0, 8)}</p>
      </div>

      {/* Timeline */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="relative flex justify-between items-start">
            {/* Progress line background */}
            <div className="absolute top-5 left-0 right-0 h-[2px] bg-muted" />
            {/* Progress line fill */}
            <div
              className="absolute top-5 left-0 h-[2px] bg-primary transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />

            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isCurrent
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-background text-muted-foreground border-muted'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium text-center max-w-[80px] ${
                      isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Current Status Badge */}
          <div className="mt-8 flex justify-center">
            <Badge variant={currentStepIndex >= 4 ? 'secondary' : 'default'} className="text-sm px-4 py-1">
              {statusSteps[currentStepIndex]?.label || 'Processing'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {order?.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{item.quantity}x</span>
                <span className="font-medium">{item.menuItemName}</span>
              </div>
              <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">${order?.total?.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
