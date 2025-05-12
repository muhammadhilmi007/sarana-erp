# Division & Position Management Service

## Overview

The Division & Position Management Service is a microservice for the Samudra Paket ERP system that handles the management of organizational divisions and positions. It provides functionality for creating and managing hierarchical organizational structures, including divisions, departments, and positions with reporting lines.

## Features

### Division Management

- Hierarchical division structure with parent-child relationships
- Division search and filtering with pagination
- Status management with history tracking
- Performance metrics (KPIs) tracking
- Budget allocation and tracking
- Branch association
- Comprehensive history tracking for audit purposes

### Position Management

- Hierarchical position structure with reporting lines
- Position search and filtering with pagination
- Position requirements and qualifications management
- Position responsibilities and authority definition
- Salary grade and benefit package configuration
- Vacancy tracking
- Comprehensive history tracking for audit purposes

## API Endpoints

### Division Endpoints

- `GET /api/v1/divisions` - Get all divisions with filtering and pagination
- `GET /api/v1/divisions/:id` - Get division by ID
- `POST /api/v1/divisions` - Create a new division
- `PUT /api/v1/divisions/:id` - Update a division
- `DELETE /api/v1/divisions/:id` - Delete a division
- `PATCH /api/v1/divisions/:id/status` - Update division status
- `GET /api/v1/divisions/hierarchy` - Get division hierarchy
- `GET /api/v1/divisions/:id/children` - Get division children
- `GET /api/v1/divisions/:id/ancestors` - Get division ancestors
- `PATCH /api/v1/divisions/:id/kpis` - Update division KPIs
- `PATCH /api/v1/divisions/:id/budget` - Update division budget
- `GET /api/v1/divisions/:id/history` - Get division history

### Position Endpoints

- `GET /api/v1/positions` - Get all positions with filtering and pagination
- `GET /api/v1/positions/:id` - Get position by ID
- `POST /api/v1/positions` - Create a new position
- `PUT /api/v1/positions/:id` - Update a position
- `DELETE /api/v1/positions/:id` - Delete a position
- `PATCH /api/v1/positions/:id/status` - Update position status
- `GET /api/v1/positions/hierarchy` - Get position hierarchy
- `GET /api/v1/positions/:id/direct-reports` - Get direct reports
- `GET /api/v1/positions/:id/reporting-chain` - Get reporting chain
- `PATCH /api/v1/positions/:id/requirements` - Update position requirements
- `PATCH /api/v1/positions/:id/responsibilities` - Update position responsibilities
- `PATCH /api/v1/positions/:id/authorities` - Update position authorities
- `PATCH /api/v1/positions/:id/compensation` - Update position compensation
- `GET /api/v1/positions/:id/history` - Get position history

## Setup and Installation

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the division-service directory
3. Install dependencies:

```bash
npm install
```

4. Configure environment variables by creating a `.env` file based on the `.env.example` file

### Running the Service

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

### Running with Docker

```bash
docker-compose up -d
```

### Running Tests

```bash
npm test
```

## Architecture

The Division & Position Management Service follows the hexagonal architecture pattern with clear separation of concerns:

- **Models**: Define the data structure and business logic for divisions and positions
- **Controllers**: Handle HTTP requests and responses
- **Routes**: Define API endpoints and route requests to controllers
- **Middleware**: Provide cross-cutting concerns like authentication, authorization, and error handling
- **Utils**: Provide utility functions for validation, logging, etc.

## Database Schema

### Division Schema

- Basic Information: code, name, description
- Hierarchical Structure: parentId, level, path
- Branch Association: branchId
- Division Head: headPositionId
- Performance Metrics: KPIs with targets and current values
- Budget Information: allocated, spent, remaining, fiscal year
- Status Information: status, status history
- Metadata: createdBy, updatedBy, timestamps

### Position Schema

- Basic Information: code, title, description
- Hierarchical Structure: reportingTo, level, path
- Organizational Structure: divisionId
- Position Requirements: education, experience, skills, certifications
- Responsibilities and Authority: responsibilities, authorities
- Compensation: salaryGrade, salaryRange, benefits
- Status Information: status, status history
- Vacancy Information: isVacant, headcount
- Metadata: createdBy, updatedBy, timestamps

## Integration with Other Services

The Division & Position Management Service integrates with the following services:

- **Auth Service**: For user authentication and authorization
- **Branch Service**: For branch information
- **Role Service**: For role-based access control

## Security

The service implements the following security measures:

- JWT-based authentication
- Role-based access control
- Input validation
- Error handling
- Audit logging

## Contributing

Please follow the project's coding standards and submit pull requests for review.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
