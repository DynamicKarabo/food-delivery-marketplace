import { Link } from 'react-router-dom'
import { MapPin, Clock, Star, UtensilsCrossed, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const cuisineCategories = [
  { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&auto=format' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80&auto=format' },
  { name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80&auto=format' },
  { name: 'Pasta', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80&auto=format' },
  { name: 'Tacos', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80&auto=format' },
  { name: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80&auto=format' },
]

const features = [
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Wide Selection',
    desc: 'Choose from hundreds of top-rated restaurants in your area',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Fast Delivery',
    desc: 'Average delivery time under 30 minutes to your doorstep',
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Top Rated',
    desc: 'Only the best restaurants with verified customer reviews',
  },
]

const steps = [
  { step: '1', title: 'Browse', desc: 'Explore restaurants and cuisines near you' },
  { step: '2', title: 'Order', desc: 'Customize your meal and checkout securely' },
  { step: '3', title: 'Track', desc: 'Follow your order from kitchen to door' },
  { step: '4', title: 'Enjoy', desc: 'Savor fresh, delicious food delivered hot' },
]

export const Home = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format"
            alt="Delicious food spread"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
              🚀 Now delivering in your area
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Food you love,{' '}
              <span className="text-primary">delivered.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-lg">
              Order from the best local restaurants. Fresh, fast, and right to your door.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/restaurants">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 text-base px-8">
                  <UtensilsCrossed className="h-5 w-5" />
                  Order Now
                </Button>
              </Link>
              <Link to="/restaurants">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 text-base px-8">
                  Explore Menu
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Crave Something?</h2>
            <p className="text-muted-foreground mt-2">Explore popular cuisines near you</p>
          </div>
          <Link to="/restaurants" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cuisineCategories.map((c) => (
            <Link key={c.name} to={`/restaurants?cuisine=${c.name}`}>
              <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white font-semibold text-sm">{c.name}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">Why CraveDrop?</h2>
          <p className="text-muted-foreground mt-2">The easiest way to get your favorite food</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative overflow-hidden rounded-2xl bg-muted/50 px-6 py-16 md:px-12">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-muted-foreground mt-2">From craving to eating in four simple steps</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-lg shadow-primary/25">
                {item.step}
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[60%] w-full h-[2px] bg-primary/20" />
              )}
              <h4 className="mt-4 font-semibold text-lg">{item.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground max-w-[200px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80&auto=format"
            alt="Fine dining"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
        <div className="relative z-10 py-16 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Hungry right now?
          </h2>
          <p className="mt-4 text-white/90 text-lg max-w-md mx-auto">
            Join thousands of happy customers ordering their favorites today.
          </p>
          <div className="mt-8">
            <Link to="/restaurants">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base px-8 shadow-xl">
                Start Ordering
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
