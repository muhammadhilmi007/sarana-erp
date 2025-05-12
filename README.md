# Samudra Paket ERP

A comprehensive enterprise resource planning system for PT. Sarana Mudah Raya, a logistics and shipping company. The system integrates all business processes including pickup management, shipment tracking, delivery management, financial operations, and reporting.

## Project Structure

This project is organized as a monorepo using Turborepo with the following structure:

### Apps

- **api-gateway**: API Gateway for routing requests to microservices
- **auth-service**: Authentication and authorization service
- **core-service**: Core business logic and data management
- **operations-service**: Operations management including pickups and deliveries
- **finance-service**: Financial operations and billing
- **notification-service**: Notification handling (email, SMS, push)
- **reporting-service**: Reporting and analytics
- **web**: Web frontend built with Next.js and JavaScript
- **mobile**: Mobile app built with React Native Expo and TypeScript

### Packages

- **ui**: Shared UI components
- **config**: Shared configuration
- **utils**: Shared utilities
- **api-client**: API client for frontend applications
- **logger**: Shared logging functionality
- **validation**: Shared validation schemas
- **types**: TypeScript types shared across the project

## Tech Stack

- **Frontend Web**: Next.js with JavaScript, Tailwind CSS, Shadcn UI
- **Frontend Mobile**: React Native (Expo) with TypeScript
- **Backend**: Node.js, Express.js with JavaScript
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Deployment**: Railway.com
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- Yarn (v1.22.x or later)
- MongoDB
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/sarana-app.git
   cd sarana-app
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create `.env.local` files in each app directory based on the provided `.env.example` files.

4. Start the development servers:
   ```bash
   yarn dev
   ```

### Development Workflow

- Run `yarn dev` to start all services in development mode
- Run `yarn build` to build all packages and apps
- Run `yarn lint` to run linting across the monorepo
- Run `yarn test` to run tests across the monorepo

## Documentation

- [Developer Guidelines](./DEVELOPER-GUIDELINES.md)
- [API Documentation](./documentation/api-docs.md)
- [Architecture Overview](./documentation/architecture.md)

## Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request.

## License

This project is proprietary and confidential. Unauthorized copying, transfer, or reproduction of the contents of this project, via any medium, is strictly prohibited.
