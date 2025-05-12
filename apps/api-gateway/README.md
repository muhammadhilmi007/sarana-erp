# API Gateway

API Gateway for Samudra Paket ERP system. This service routes requests to appropriate microservices, handles authentication, and provides centralized error handling and monitoring.

## Features

- **Routing**: Routes requests to appropriate microservices
- **Authentication**: JWT-based authentication
- **Error Handling**: Centralized error handling with standardized responses
- **Rate Limiting**: Prevents abuse with configurable rate limits
- **Security**: Implements security best practices with Helmet
- **CORS**: Configurable CORS settings for web and mobile clients
- **Validation**: Request validation with Joi
- **Logging**: Structured logging with Winston
- **Circuit Breaker**: Fault tolerance with circuit breaker pattern
- **Caching**: Response caching with Redis for performance optimization
- **Request Tracing**: Request ID tracking for debugging
- **Health Checks**: Endpoints for monitoring service health
- **API Versioning**: URL-based API versioning
- **Documentation**: API documentation with Swagger/OpenAPI
- **Monitoring**: Metrics collection with Prometheus

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- Redis (for caching)

### Installation

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to run the server on | 3000 |
| NODE_ENV | Environment (development, production) | development |
| JWT_SECRET | Secret key for JWT signing | your-secret-key-change-in-production |
| JWT_EXPIRES_IN | JWT expiration time | 1h |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration time | 7d |
| RATE_LIMIT_MAX | Maximum requests per IP in rate limit window | 100 |
| REDIS_URL | Redis connection URL | redis://localhost:6379 |
| WEB_CLIENT_URL | Web client URL for CORS | http://localhost:3001 |
| MOBILE_CLIENT_URL | Mobile client URL for CORS | http://localhost:19000 |
| AUTH_SERVICE_URL | Auth service URL | http://localhost:3001 |
| CORE_SERVICE_URL | Core service URL | http://localhost:3002 |
| OPERATIONS_SERVICE_URL | Operations service URL | http://localhost:3003 |
| FINANCE_SERVICE_URL | Finance service URL | http://localhost:3004 |
| NOTIFICATION_SERVICE_URL | Notification service URL | http://localhost:3005 |
| REPORTING_SERVICE_URL | Reporting service URL | http://localhost:3006 |
| LOG_LEVEL | Logging level | info |
| LOG_FILE | Log file path | api-gateway.log |

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Health Checks

- `/health` - API Gateway health
- `/health/redis` - Redis connection health
- `/health/services` - All microservices health
- `/health/service/:serviceName` - Specific microservice health

## Metrics

Prometheus metrics are available at `/metrics`.

## Architecture

The API Gateway follows a layered architecture:

- **Routes**: Define API endpoints and route handlers
- **Middleware**: Handle cross-cutting concerns like authentication, logging, etc.
- **Config**: Application configuration
- **Utils**: Utility functions and helpers

## Error Handling

All errors are standardized with the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "details": {
    // Additional error details (optional)
  },
  "requestId": "unique-request-id"
}
```

## Circuit Breaker

The circuit breaker pattern is implemented to prevent cascading failures:

- **Closed**: Requests flow normally
- **Open**: Requests are immediately rejected
- **Half-Open**: Limited requests are allowed to test if the service has recovered

## Caching

Responses are cached in Redis for improved performance:

- GET requests are cached by default
- Cache keys include the user ID, path, and query parameters
- Cache can be cleared programmatically
