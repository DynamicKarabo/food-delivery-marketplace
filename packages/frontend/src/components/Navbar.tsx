import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, MapPin, Menu } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const navLinks = [
    { to: '/restaurants', label: 'Restaurants' },
    ...(user ? [{ to: '/orders', label: 'My Orders' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Crave<span className="text-primary">Drop</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l">
                  <Link to="/profile" className="flex items-center gap-2 group">
                    <Avatar className="h-8 w-8 border-2 border-primary/20 group-hover:border-primary transition-colors">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.firstName}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="md:hidden" asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/" className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-bold">
                    Crave<span className="text-primary">Drop</span>
                  </span>
                </Link>

                <Separator />

                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Button
                      key={link.to}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => navigate(link.to)}
                    >
                      {link.label}
                    </Button>
                  ))}
                  {user && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => navigate('/cart')}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => navigate('/profile')}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => { logout(); navigate('/') }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/login')}
                      >
                        Log in
                      </Button>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => navigate('/register')}
                      >
                        Sign up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
