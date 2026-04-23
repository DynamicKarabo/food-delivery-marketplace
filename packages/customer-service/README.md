# Food Delivery Customer Service

Customer management and authentication service for the food delivery marketplace.

## Features

- User registration and authentication (JWT)
- Customer profile management
- Address book management
- Order history tracking
- Favorite restaurants
- Review and rating system

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login customer
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout customer

### Customers
- `GET /api/customers/me` - Get current customer profile
- `PUT /api/customers/me` - Update customer profile
- `GET /api/customers/:id` - Get customer by ID (admin only)
- `DELETE /api/customers/me` - Delete customer account

### Addresses
- `GET /api/addresses` - List customer addresses
- `POST /api/addresses` - Add new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PUT /api/addresses/:id/default` - Set default address

### Favorites
- `GET /api/favorites/restaurants` - List favorite restaurants
- `POST /api/favorites/restaurants/:restaurantId` - Add to favorites
- `DELETE /api/favorites/restaurants/:restaurantId` - Remove from favorites

### Orders
- `GET /api/orders` - List customer orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/reviews` - List customer reviews
- `POST /api/reviews` - Create review

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Database Schema

Uses Prisma ORM with PostgreSQL. Main models:
- User (with Customer profile)
- Address
- Favorite
- Review
- Order (read-only, from Order Service)

## Environment Variables

Copy `.env.example` to `.env` and configure.

## Docker

```bash
# Build image
docker build -t food-delivery/customer-service .

# Run with docker-compose
docker-compose up customer-service
```
