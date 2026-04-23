# Changelog

All notable changes to this project are documented in this file.

---

## 2026-04-23 — Session: Comprehensive Test Coverage + Security Hardening

### Added
- **137 tests** across 4 microservices (from 0 to full coverage)
  - `customer-service`: 55 tests — auth, customer, address, favorite, review
  - `restaurant-service`: 33 tests — restaurant, menu, order
  - `driver-service`: 24 tests — driver, delivery
  - `order-service`: 25 tests — order, payment, webhook
- Jest + Supertest test harness to all services with `jest.config.js`, `jest.setup.js`, `jest.setupAfterEnv.js`
- `nock` for HTTP mocking, `uuid` for deterministic test data
- Mermaid architecture diagram (`docs/architecture-diagram.mermaid`)
- Rate limiting on auth endpoints (`express-rate-limit`)
- Authentication middleware (`auth.middleware.ts`) to driver, order, restaurant services
- `CHANGELOG.md` (this file)

### Fixed
- Removed hardcoded `JWT_SECRET` fallback — now throws at startup if missing
- Removed cross-service `prisma.user` lookup from auth middleware in driver/order/restaurant services (they don't have a User model)
- Auth middleware now verifies JWT locally without DB calls (correct microservices pattern)
- All `.env` files added to `.gitignore`

### Documentation
- README credits Homer as architect
- Added PR description template with test checklist

### CI
- `lint-and-test` workflow: Install deps → Build TypeScript → Run tests
- PostgreSQL + Redis service containers for integration tests

---
