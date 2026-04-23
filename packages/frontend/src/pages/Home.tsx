import { Link } from 'react-router-dom'
import { MapPin, Clock, Star, UtensilsCrossed } from 'lucide-react'

export const Home = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Food Delivery Made Simple
        </h1>
        <p className="text-xl mb-8 text-primary-100">
          Order from your favorite restaurants, delivered to your door
        </p>
        <Link
          to="/restaurants"
          className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          <UtensilsCrossed className="h-5 w-5" />
          <span>Order Now</span>
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
          <p className="text-gray-600">Choose from hundreds of restaurants in your area</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
          <p className="text-gray-600">Average delivery time under 30 minutes</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <Star className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Top Rated</h3>
          <p className="text-gray-600">Only the best restaurants with high ratings</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Choose', desc: 'Browse restaurants and select your meal' },
            { step: '2', title: 'Order', desc: 'Customize and place your order securely' },
            { step: '3', title: 'Track', desc: 'Follow your order in real-time' },
            { step: '4', title: 'Enjoy', desc: 'Receive and enjoy your delicious food' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
