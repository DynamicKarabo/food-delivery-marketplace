import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, ArrowRight } from 'lucide-react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { user, tokens } = response.data.data
      setAuth(user, tokens.accessToken)
      navigate('/')
    } catch (error) {
      console.error('Login failed:', error)
      alert('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl shadow-xl">
        {/* Image Side */}
        <div className="hidden md:block relative">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format"
            alt="Delicious food"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
          <div className="relative z-10 flex flex-col justify-end h-full p-10 text-white">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back to CraveDrop</h2>
            <p className="mt-2 text-white/90">Sign in to order your favorite meals.</p>
          </div>
        </div>

        {/* Form Side */}
        <Card className="border-0 shadow-none rounded-none">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-muted-foreground mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 gap-2 h-11"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
