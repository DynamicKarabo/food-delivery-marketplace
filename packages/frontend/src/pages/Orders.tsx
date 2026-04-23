import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, Truck, Package, UtensilsCrossed } from 'lucide-react'
import { api } from '../services/api'
import { Order } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const statusConfig: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  PENDING: { icon: <Clock className="h-3.5 w-3.5" />, variant: 'outline', label: 'Pending' },
  CONFIRMED: { icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'secondary', label: 'Confirmed' },
  PREPARING: { icon: <Clock className="h-3.5 w-3.5" />, variant: 'default', label: 'Preparing' },
  OUT_FOR_DELIVERY: { icon: <Truck className="h-3.5 w-3.5" />, variant: 'default', label: 'On the way' },
  DELIVERED: { icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'secondary', label: 'Delivered' },
  CANCELLED: { icon: <XCircle className="h-3.5 w-3.5" />, variant: 'destructive', label: 'Cancelled' },
}

export const Orders = () => {
  const { data: orders, isLoading } = useQuery('orders', async () => {
    const response = await api.get('/api/orders')
    return response.data.data as Order[]
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track and manage your orders</p>
      </div>

      {orders?.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No orders yet</h3>
            <p className="text-muted-foreground mt-1 mb-6">Place your first order to see it here.</p>
            <Link to="/restaurants">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Order Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {orders?.map((order) => {
          const status = statusConfig[order.status] || statusConfig.PENDING
          return (
            <Link key={order.id} to={`/orders/${order.id}/track`}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Badge variant={status.variant} className="gap-1.5">
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
