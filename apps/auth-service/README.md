# Auth Service

Authentication and User Management Service for Samudra Paket ERP.

## Overview

The Auth Service is responsible for user authentication, authorization, and user management in the Samudra Paket ERP system. It provides secure endpoints for user registration, login, password management, and session management, as well as administrative functions for user management.

## Features

- User registration with email verification
- Secure login with JWT authentication
- Password reset and change functionality
- Account locking for security
- Session management
- Role-based access control
- Comprehensive security logging
- Admin user management

## Tech Stack

- Node.js and Express.js
- MongoDB with Mongoose
- Redis for caching and session management
- JWT for authentication
- Nodemailer for email notifications
- Joi for validation
- Winston for logging

## API Endpoints

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `GET /api/v1/auth/verify-email/:token` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/change-password` - Change password
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `GET /api/v1/auth/sessions` - Get active sessions
- `DELETE /api/v1/auth/sessions/:sessionId` - Terminate a specific session
- `DELETE /api/v1/auth/sessions` - Terminate all other sessions

### Admin Endpoints

- `GET /api/v1/admin/users` - Get all users with pagination
- `GET /api/v1/admin/users/:userId` - Get user by ID
- `POST /api/v1/admin/users` - Create a new user
- `PUT /api/v1/admin/users/:userId` - Update user
- `POST /api/v1/admin/users/:userId/reset-password` - Reset user password
- `POST /api/v1/admin/users/:userId/lock` - Lock user account
- `POST /api/v1/admin/users/:userId/unlock` - Unlock user account
- `DELETE /api/v1/admin/users/:userId` - Delete user
- `GET /api/v1/admin/users/:userId/sessions` - Get user sessions
- `DELETE /api/v1/admin/users/:userId/sessions/:sessionId` - Terminate user session
- `DELETE /api/v1/admin/users/:userId/sessions` - Terminate all user sessions
- `GET /api/v1/admin/users/:userId/security-logs` - Get user security logs

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB
- Redis

### Installation

1. Clone the repository
2. Navigate to the auth service directory:
   ```
   cd apps/auth-service
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Start the service:
   ```
   npm run dev
   ```

### API Documentation

API documentation is available at `/api-docs` when the service is running.

## Security Features

- Secure password storage with bcrypt
- JWT-based authentication with refresh tokens
- Account locking after failed login attempts
- Email verification
- Password policies and validation
- Session management and termination
- Comprehensive security logging
- Rate limiting for sensitive operations

## Architecture

The Auth Service follows a hexagonal architecture pattern with clear separation of concerns:

- **API Layer**: Controllers and routes
- **Application Layer**: Services and business logic
- **Domain Layer**: Models and validation
- **Infrastructure Layer**: Database, Redis, and external services

## Testing

Run tests with:

```
npm test
```

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
