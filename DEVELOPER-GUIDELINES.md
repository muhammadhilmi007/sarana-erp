# Developer Guidelines and Coding Standards

## Overview

This document outlines the development guidelines and coding standards for the Samudra Paket ERP project. All contributors should follow these guidelines to ensure consistency and maintainability across the codebase.

## Development Environment

### Required Software

- **Node.js**: Version 18.x LTS
- **Yarn**: Version 1.22.x or higher (for monorepo support)
- **Docker**: Version 24.x and Docker Compose 2.x
- **MongoDB**: Local installation or Docker container for development
- **Redis**: Local installation or Docker container for caching
- **Git**: Latest version with Git LFS support

## Architecture

- Follow the microservice architecture with API Gateway as specified
- Maintain hexagonal architecture for each microservice:
  - API Layer: Controllers, Routes, Middleware
  - Application Layer: Use Cases, Services
  - Domain Layer: Entities, Value Objects, Domain Services
  - Infrastructure Layer: Repositories, External Services

## Naming Conventions

- **Directories**: Use kebab-case (e.g., `user-management`)
- **Files**: Use camelCase (e.g., `userController.js`)
- **Components**: Use PascalCase (e.g., `UserProfile.jsx`)
- **Variables/Functions**: Use camelCase (e.g., `getUserData`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Database Collections**: Use PascalCase (e.g., `Users`, `ShipmentOrders`)

## Code Style

### General

- Follow Airbnb JavaScript Style Guide
- Use ESLint and Prettier for code formatting
- Maximum line length: 100 characters
- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for strings
- Add trailing commas in objects and arrays

### JavaScript/TypeScript

- Use ES2022 features for JavaScript
- Use TypeScript for mobile application and shared libraries
- Use async/await for asynchronous operations (avoid callbacks)
- Implement proper error handling for all async operations
- Use destructuring for object and array access
- Prefer const over let, avoid var
- Use optional chaining and nullish coalescing operators
- Document functions with JSDoc comments

### React/Next.js

- Use functional components with hooks
- Implement proper React key usage for lists
- Use React.memo for performance optimization when appropriate
- Implement error boundaries for component error handling
- Use Next.js Image component for all images
- Implement proper loading states for data fetching
- Use dynamic imports for code splitting
- Implement proper SEO metadata for pages

### CSS/Tailwind

- Use Tailwind utility classes for styling
- Follow mobile-first approach for responsive design
- Maintain consistent spacing and sizing
- Use CSS variables for theme customization
- Implement dark mode support
- Use Tailwind's JIT mode for development
- Extract common patterns to component classes

## Frontend Development

- Follow Atomic Design methodology (atoms, molecules, organisms, templates, pages)
- Use Shadcn UI as the component library foundation
- Implement the state management strategy using Redux Toolkit for global state and React Query for server state
- Create comprehensive form handling with React Hook Form and Zod validation
- Design all UI with WCAG 2.1 Level AA compliance in mind

## Backend Development

- Implement REST API principles with consistent request/response format
- Follow the standardized error handling strategy with proper error codes and messages
- Implement JWT-based authentication with refresh token mechanism
- Implement Role-Based Access Control (RBAC) for authorization
- Design APIs with proper semantic status codes
- Use repository pattern for data access abstraction
- Implement proper validation for all API requests
- Use Redis for caching frequently accessed data

## Mobile Development

- Design mobile apps with offline-first functionality using WatermelonDB
- Implement device integration features (camera, GPS, signature capture)
- Use React Native with TypeScript and Expo SDK
- Optimize for battery life and data usage for field conditions
- Implement secure data synchronization with conflict resolution
- Support both online and offline operations for field staff

## Testing

- Write unit tests for all new functionality
- Maintain minimum 80% code coverage
- Run tests locally before committing
- Include integration tests for API endpoints
- Write end-to-end tests for critical user flows
- Test for accessibility compliance

## Git Workflow

- Use feature branches for all new features and bug fixes
- Branch naming convention: `feature/feature-name`, `bugfix/issue-description`, `hotfix/urgent-fix`
- Commit messages must follow Conventional Commits specification:
  - `feat: add new feature`
  - `fix: resolve bug`
  - `docs: update documentation`
  - `style: formatting changes`
  - `refactor: code restructuring`
  - `test: add or update tests`
  - `chore: maintenance tasks`
- Squash commits before merging to main branch
- Require code reviews for all pull requests

## Documentation

- Document all code with JSDoc comments
- Create comprehensive API documentation with Swagger/OpenAPI
- Maintain up-to-date README files for all modules
- Document database schema changes
- Create user documentation for different roles
- Include diagrams and visual aids in technical documentation

## Security

- Follow OWASP security best practices
- Implement proper authentication and authorization
- Encrypt sensitive data at rest and in transit
- Implement rate limiting for public endpoints
- Use secure headers and CORS policies
- Regularly update dependencies to patch security vulnerabilities

## Performance

- Optimize database queries with proper indexing
- Implement caching strategies for frequently accessed data
- Use code splitting and lazy loading for frontend
- Optimize images and assets
- Implement proper pagination for list endpoints
