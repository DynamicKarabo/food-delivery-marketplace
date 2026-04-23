-- Initialize database schemas for all services
-- Note: In production, each service should have its own database

CREATE SCHEMA IF NOT EXISTS customer_service;
CREATE SCHEMA IF NOT EXISTS restaurant_service;
CREATE SCHEMA IF NOT EXISTS driver_service;
CREATE SCHEMA IF NOT EXISTS order_service;
