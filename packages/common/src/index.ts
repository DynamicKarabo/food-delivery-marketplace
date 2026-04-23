// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT_OWNER = 'restaurant_owner',
  DRIVER = 'driver',
  ADMIN = 'admin'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Restaurant types
export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: Address;
  contact: ContactInfo;
  cuisineTypes: string[];
  openingHours: OpeningHours[];
  isActive: boolean;
  rating: number;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
}

export interface OpeningHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // "09:00"
  closeTime: string; // "22:00"
  isClosed: boolean;
}

// Menu types
export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  options: MenuOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuOption {
  id: string;
  name: string;
  choices: MenuOptionChoice[];
}

export interface MenuOptionChoice {
  id: string;
  name: string;
  priceModifier: number;
}

// Order types
export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryAddress: Address;
  deliveryInstructions?: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  ASSIGNED_TO_DRIVER = 'assigned_to_driver',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions: SelectedOption[];
}

export interface SelectedOption {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceName: string;
  priceModifier: number;
}

// Driver types
export interface Driver {
  id: string;
  userId: string;
  vehicle: Vehicle;
  isAvailable: boolean;
  currentLocation?: Location;
  totalDeliveries: number;
  averageRating: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: VehicleType;
}

export enum VehicleType {
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  BICYCLE = 'bicycle',
  SCOOTER = 'scooter'
}

export interface Location {
  latitude: number;
  longitude: number;
}

// Delivery tracking
export interface DeliveryTracking {
  orderId: string;
  driverId: string;
  currentLocation: Location;
  route: Location[];
  estimatedArrival: Date;
  status: DeliveryStatus;
  updatedAt: Date;
}

export enum DeliveryStatus {
  PICKING_UP = 'picking_up',
  ON_THE_WAY = 'on_the_way',
  NEARBY = 'nearby'
}

// Review types
export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Event types (Kafka)
export interface OrderEvent {
  eventId: string;
  type: OrderEventType;
  orderId: string;
  timestamp: Date;
  payload: Record<string, any>;
}

export enum OrderEventType {
  ORDER_CREATED = 'order_created',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_PREPARING = 'order_preparing',
  ORDER_READY = 'order_ready',
  DRIVER_ASSIGNED = 'driver_assigned',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled'
}
