export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
}

export interface Address {
  id: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  latitude?: number
  longitude?: number
  label?: string
  isDefault?: boolean
}

export interface Restaurant {
  id: string
  name: string
  description: string
  cuisineTypes: string[]
  rating: number
  deliveryFee: number
  minOrderAmount: number
  estimatedDeliveryTime: number
  imageUrl?: string
  isActive: boolean
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  isAvailable: boolean
  options?: MenuOption[]
}

export interface MenuOption {
  id: string
  name: string
  choices: OptionChoice[]
}

export interface OptionChoice {
  id: string
  name: string
  priceModifier: number
}

export interface CartItem {
  menuItemId: string
  menuItemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  selectedOptions: SelectedOption[]
}

export interface SelectedOption {
  optionId: string
  optionName: string
  choiceId: string
  choiceName: string
  priceModifier: number
}

export interface Order {
  id: string
  status: string
  total: number
  items: CartItem[]
  createdAt: string
  estimatedDeliveryTime?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
