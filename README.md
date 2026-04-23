# 🍔 Food Delivery Marketplace

A complete food delivery marketplace built with the **Agentic Era** workflow — designed by AI, built by AI, deployed autonomously.

## 🏗️ Architecture

**Microservices Architecture**
- **Customer Service** (Port 3001) — User authentication, profiles, addresses, favorites, reviews
- **Restaurant Service** (Port 3002) — Restaurant management, menus, order processing
- **Driver Service** (Port 3003) — Driver management, delivery tracking, earnings
- **Order Service** (Port 3004) — Order orchestration, Stripe payments, webhooks
- **Frontend** (Port 5173) — React SPA with real-time tracking

**Infrastructure**
- PostgreSQL — Primary database
- Redis — Caching & sessions
- Kafka — Event streaming between services
- Docker Compose — Local development
- GitHub Actions — CI/CD pipeline
- Nginx — Reverse proxy (production)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Stripe account (for payments)

### Local Development

```bash
# Clone the repository
git clone https://github.com/DynamicKarabo/food-delivery-marketplace.git
cd food-delivery-marketplace

# Start all services with Docker
npm run docker

# Or start individual services
npm run dev
```

### Environment Setup

Copy `.env.example` to `.env` in each service directory and configure:

```bash
cp packages/customer-service/.env.example packages/customer-service/.env
cp packages/restaurant-service/.env.example packages/restaurant-service/.env
cp packages/driver-service/.env.example packages/driver-service/.env
cp packages/order-service/.env.example packages/order-service/.env
cp packages/frontend/.env.example packages/frontend/.env
```

### Database Setup

```bash
# Run Prisma migrations for each service
cd packages/customer-service && npx prisma migrate dev
cd packages/restaurant-service && npx prisma migrate dev
cd packages/driver-service && npx prisma migrate dev
cd packages/order-service && npx prisma migrate dev
```

## 📁 Project Structure

```
food-delivery-marketplace/
├── packages/
│   ├── common/              # Shared types and utilities
│   ├── customer-service/    # Customer management API
│   ├── restaurant-service/  # Restaurant management API
│   ├── driver-service/      # Driver management API
│   ├── order-service/       # Order & payment API
│   └── frontend/            # React SPA
├── docker/                  # Docker configurations
│   ├── init.sql            # Database initialization
│   └── nginx.conf          # Nginx reverse proxy config
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Local development stack
└── README.md
```

## 🛠️ Tech Stack

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication
- Kafka for event streaming
- Stripe for payments

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Zustand (state management)
- React Query (data fetching)
- Axios (HTTP client)

**DevOps**
- Docker + Docker Compose
- GitHub Actions
- Nginx reverse proxy

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Helmet.js for HTTP security headers
- CORS configuration
- Input validation with Joi
- Stripe webhook signature verification
- Environment-based secrets management

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific service
npm test --workspace=packages/customer-service
```

## 🚀 Deployment

### Docker (Production)

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables

Required environment variables for production:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `KAFKA_BROKERS` | Kafka broker addresses |

## 📡 API Endpoints

### Customer Service (3001)
- `POST /api/auth/register` — Register new customer
- `POST /api/auth/login` — Login
- `GET /api/customers/me` — Get profile
- `GET /api/addresses` — List addresses
- `GET /api/favorites` — List favorites
- `GET /api/reviews` — List reviews

### Restaurant Service (3002)
- `GET /api/restaurants` — List restaurants
- `GET /api/restaurants/:id` — Get restaurant details
- `GET /api/menu/:restaurantId/items` — Get menu items
- `PATCH /api/restaurant-orders/:id/status` — Update order status

### Driver Service (3003)
- `GET /api/drivers` — List drivers
- `PATCH /api/drivers/:id/availability` — Update availability
- `PATCH /api/drivers/:id/location` — Update location
- `GET /api/deliveries/:driverId` — Get deliveries

### Order Service (3004)
- `POST /api/orders` — Create order
- `GET /api/orders/:id` — Get order
- `POST /api/payments/intent` — Create payment intent
- `POST /webhooks/stripe` — Stripe webhook handler

## 🔄 CI/CD Pipeline

The GitHub Actions workflow:
1. **Lint & Test** — Runs on every PR/push
2. **Build & Push** — Builds Docker images and pushes to registry on main branch

## 📈 Future Enhancements

- [ ] Real-time delivery tracking with WebSocket
- [ ] Push notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Loyalty program

## 📝 License

MIT License — built with the Agentic Era workflow.

## 🤖 Agentic Era

This project was designed and scaffolded autonomously using:
- **System Design Engine** — Architecture design
- **Project Template Generator** — Code generation
- **Quality Gate Pipeline** — Testing and validation

Zero manual coding. Full AI automation. 🚀
