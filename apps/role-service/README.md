# Role & Authorization Service

Role & Authorization Service for Samudra Paket ERP, implementing RBAC (Role-Based Access Control) with hierarchical roles, permission inheritance, and resource ownership validation.

## Features

- **Role Management**: Create, update, and delete roles with hierarchical structure
- **Permission Management**: Define granular permissions for resources and actions
- **User-Role Assignment**: Assign roles to users with scope and validity period
- **Permission Inheritance**: Inherit permissions from parent roles
- **Resource Ownership**: Validate resource ownership for permission checks
- **Context-Aware Permissions**: Evaluate permissions based on request context
- **Permission Caching**: Efficient caching of permissions for performance
- **Audit Logging**: Comprehensive logging of all authorization changes

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

#### Roles

- `GET /api/v1/roles` - Get all roles
- `GET /api/v1/roles/:id` - Get role by ID
- `POST /api/v1/roles` - Create a new role
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role
- `GET /api/v1/roles/hierarchy` - Get role hierarchy
- `GET /api/v1/roles/:id/permissions` - Get role permissions

#### Permissions

- `GET /api/v1/permissions` - Get all permissions
- `GET /api/v1/permissions/:id` - Get permission by ID
- `POST /api/v1/permissions` - Create a new permission
- `PUT /api/v1/permissions/:id` - Update permission
- `DELETE /api/v1/permissions/:id` - Delete permission
- `GET /api/v1/permissions/resources` - Get all resources
- `GET /api/v1/permissions/resources/:resource` - Get permissions by resource
- `POST /api/v1/permissions/roles/:roleId/:permissionId` - Assign permission to role
- `DELETE /api/v1/permissions/roles/:roleId/:permissionId` - Revoke permission from role

#### User Roles

- `GET /api/v1/user-roles/users/:userId/roles` - Get roles for a user
- `GET /api/v1/user-roles/roles/:roleId/users` - Get users for a role
- `POST /api/v1/user-roles/users/:userId/roles/:roleId` - Assign role to user
- `PUT /api/v1/user-roles/:userRoleId` - Update user role
- `DELETE /api/v1/user-roles/users/:userId/roles/:roleId` - Revoke role from user
- `GET /api/v1/user-roles/users/:userId/permissions` - Get user permissions
- `POST /api/v1/user-roles/users/:userId/check-permission` - Check if user has permission

## Architecture

The service follows the hexagonal architecture pattern with clear separation of concerns:

- **Models**: Database schemas for roles, permissions, and user-role assignments
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic for permission checking and role management
- **Middleware**: Handle authentication, permission checking, and error handling
- **Routes**: Define API endpoints and connect them to controllers
- **Utils**: Utility functions for logging, caching, and other common tasks

## Environment Variables

- `PORT`: Port number for the service (default: 3002)
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
