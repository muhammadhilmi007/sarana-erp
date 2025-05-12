# Employee Management Service

A comprehensive microservice for managing employees within the Samudra Paket ERP system.

## Features

- Complete employee profile management
- Employee status tracking
- Position and branch assignment management
- Document management with verification workflow
- Skills and competencies tracking
- Performance evaluation system
- Career development and succession planning
- Training management
- Contract management

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Swagger API Documentation

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.0 or higher
- npm 10.x or higher

### Installation

1. Clone the repository
2. Navigate to the employee service directory:
   ```
   cd apps/employee-service
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration values

### Running the Service

#### Development Mode

```
npm run dev
```

#### Production Mode

```
npm start
```

### API Documentation

The API documentation is available at `/api-docs` when the service is running. For example:

```
http://localhost:3003/api-docs
```

## API Endpoints

### Employee Management

- `GET /api/v1/employees` - Get all employees
- `GET /api/v1/employees/:id` - Get employee by ID
- `POST /api/v1/employees` - Create new employee
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Employee Status Management

- `PATCH /api/v1/employees/:id/status` - Update employee status
- `GET /api/v1/employees/:id/status/history` - Get employee status history

### Employee Assignment Management

- `PATCH /api/v1/employees/:id/position` - Update employee position
- `PATCH /api/v1/employees/:id/branch` - Update employee branch
- `GET /api/v1/employees/:id/assignments` - Get employee assignment history

### Document Management

- `POST /api/v1/employees/:employeeId/documents` - Upload employee document
- `GET /api/v1/employees/:employeeId/documents` - Get employee documents
- `GET /api/v1/documents/:id` - Get document by ID
- `PATCH /api/v1/documents/:id/verify` - Verify document
- `PATCH /api/v1/documents/:id/reject` - Reject document
- `DELETE /api/v1/documents/:id` - Delete document
- `GET /api/v1/documents/expiring` - Get documents expiring soon

### Skills Management

- `PATCH /api/v1/employees/:id/skills` - Update employee skill
- `DELETE /api/v1/employees/:id/skills/:skillName` - Remove employee skill
- `GET /api/v1/employees/:id/skills` - Get employee skills
- `POST /api/v1/employees/:id/skills/:skillName/certifications` - Add skill certification
- `GET /api/v1/employees/skills/:skillName` - Find employees by skill
- `GET /api/v1/employees/skills/matrix` - Get skill matrix

### Performance Management

- `POST /api/v1/employees/:id/performance` - Add performance evaluation
- `PUT /api/v1/employees/:id/performance/:evaluationId` - Update performance evaluation
- `GET /api/v1/employees/:id/performance` - Get employee performance evaluations
- `GET /api/v1/employees/:id/performance/:evaluationId` - Get performance evaluation by ID
- `PATCH /api/v1/employees/:id/performance/:evaluationId/acknowledge` - Acknowledge performance evaluation
- `GET /api/v1/employees/performance/statistics` - Get performance statistics

### Career Development

- `PATCH /api/v1/employees/:id/career/path` - Update career path
- `POST /api/v1/employees/:id/career/mentorship` - Add mentorship
- `PATCH /api/v1/employees/:id/career/mentorship/:mentorshipId` - Update mentorship status
- `PATCH /api/v1/employees/:id/career/successor` - Update successor information
- `GET /api/v1/employees/:id/career` - Get career development
- `GET /api/v1/employees/career/successors/:positionId` - Find successors for position
- `GET /api/v1/employees/career/succession-planning` - Get succession planning report

### Training Management

- `POST /api/v1/employees/:id/training` - Add training record
- `PUT /api/v1/employees/:id/training/:trainingId` - Update training record
- `PATCH /api/v1/employees/:id/training/:trainingId/status` - Update training status
- `GET /api/v1/employees/:id/training` - Get employee training history
- `GET /api/v1/employees/:id/training/:trainingId` - Get training record by ID
- `GET /api/v1/employees/training/statistics` - Get training statistics

### Contract Management

- `POST /api/v1/employees/:id/contracts` - Add employee contract
- `PUT /api/v1/employees/:id/contracts/:contractId` - Update employee contract
- `PATCH /api/v1/employees/:id/contracts/:contractId/status` - Update contract status
- `GET /api/v1/employees/:id/contracts` - Get employee contracts
- `GET /api/v1/employees/:id/contracts/:contractId` - Get contract by ID
- `GET /api/v1/employees/contracts/expiring` - Get contracts expiring soon
- `GET /api/v1/employees/contracts/statistics` - Get contract statistics

## Data Models

### Employee

The core employee model with comprehensive profile information including:
- Personal details
- Contact information
- Employment information
- Position assignments
- Status tracking
- Document management

### Employee History

Tracks changes to employee records for audit and history purposes.

### Employee Document

Manages employee documents with metadata and versioning.

## Authentication and Authorization

The service uses JWT authentication and role-based access control. The following roles are supported:

- `admin`: Full access to all endpoints
- `hr_manager`: Manage all employee data
- `hr_staff`: Limited management of employee data
- `manager`: View employee data and manage performance evaluations
- `employee`: View own data and limited self-service functions

## Error Handling

The service uses standardized error responses with appropriate HTTP status codes:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `500 Internal Server Error`: Server error

## Contributing

Please follow the project's coding standards and submit pull requests for review.

## License

This project is proprietary and confidential to PT. Sarana Mudah Raya.
