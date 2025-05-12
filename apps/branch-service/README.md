# Branch Management Service

Branch Management Service for Samudra Paket ERP, implementing hierarchical branch structure management with comprehensive features for branch operations, resources, and performance tracking.

## Features

- **Hierarchical Branch Structure**: Manage headquarters, regional offices, and branches with parent-child relationships
- **Branch Information Management**: Comprehensive branch data including location, contact information, and operational hours
- **Resource Allocation**: Track and manage branch resources including employees, vehicles, and storage capacity
- **Performance Metrics**: Monitor branch performance with metrics like revenue, package volume, and customer satisfaction
- **Document Management**: Store and manage branch-related documents with expiry tracking
- **Status Management**: Track branch status changes with history
- **Geospatial Search**: Find branches by location with geospatial queries
- **Audit Logging**: Comprehensive logging of all branch changes

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the provided `.env.example` file.

3. Start the service:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

The API documentation is available at `/api-docs` when the service is running.

### Main Endpoints

#### Branch Management

- `GET /api/v1/branches` - Get all branches with pagination and filtering
- `GET /api/v1/branches/{id}` - Get branch by ID
- `POST /api/v1/branches` - Create a new branch
- `PUT /api/v1/branches/{id}` - Update branch
- `DELETE /api/v1/branches/{id}` - Delete branch
- `PATCH /api/v1/branches/{id}/status` - Update branch status

#### Branch Hierarchy

- `GET /api/v1/branches/hierarchy` - Get branch hierarchy
- `GET /api/v1/branches/{id}/children` - Get branch children
- `GET /api/v1/branches/{id}/ancestors` - Get branch ancestors

#### Branch Resources and Performance

- `PATCH /api/v1/branches/{id}/resources` - Update branch resources
- `PATCH /api/v1/branches/{id}/performance-metrics` - Update branch performance metrics

#### Branch Documents

- `POST /api/v1/branches/{id}/documents` - Add branch document
- `PUT /api/v1/branches/{id}/documents/{documentId}` - Update branch document
- `DELETE /api/v1/branches/{id}/documents/{documentId}` - Delete branch document

#### Branch Operations

- `PATCH /api/v1/branches/{id}/operational-hours` - Update branch operational hours
- `GET /api/v1/branches/{id}/history` - Get branch history
- `GET /api/v1/branches/location` - Get branches by location

## Architecture

The service follows the hexagonal architecture pattern with clear separation of concerns:

- **Models**: Database schemas for branches and branch history
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic for branch management
- **Middleware**: Handle authentication, permission checking, and error handling
- **Routes**: Define API endpoints and connect them to controllers
- **Utils**: Utility functions for logging, caching, and validation

## Environment Variables

- `PORT`: Port number for the service (default: 3003)
- `NODE_ENV`: Environment (development, production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT verification
- `JWT_ACCESS_EXPIRES_IN`: Access token expiration time
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration time
- `JWT_ISSUER`: JWT issuer
- `JWT_AUDIENCE`: JWT audience
- `REDIS_URL`: Redis connection string
- `LOG_LEVEL`: Logging level
- `PERMISSION_CACHE_TTL`: Permission cache time-to-live in seconds

## Integration with Auth Service

This service works in conjunction with the Auth Service for user authentication. It verifies JWTs issued by the Auth Service and uses the user information for permission checks.

## License

This project is proprietary and confidential.
