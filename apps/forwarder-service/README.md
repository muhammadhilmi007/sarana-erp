# Forwarder Management Service

This microservice handles all forwarder partner management operations for the Samudra Paket ERP system. It provides comprehensive functionality for managing logistics partners, their coverage areas, rate cards, performance metrics, and more.

## Features

- **Forwarder Management**: Create, update, delete, and query forwarder partners
- **Coverage Area Management**: Define and manage service coverage areas for each forwarder
- **Rate Card Management**: Configure pricing and weight breaks for different service types
- **Performance Tracking**: Monitor SLA compliance and performance metrics
- **Allocation Management**: Configure and track shipment allocation strategies
- **Document Management**: Store and retrieve forwarder contracts and documents
- **Financial Settlement**: Track invoices, payments, and financial status
- **Communication Logs**: Record and manage all communications with forwarders
- **Service Level Management**: Configure and compare service level capabilities

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication and authorization
- **Swagger**: API documentation
- **Winston**: Logging
- **Jest**: Testing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm (v10 or higher)

### Installation

1. Clone the repository
2. Navigate to the forwarder service directory:
   ```
   cd apps/forwarder-service
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=3003
   MONGODB_URI=mongodb://localhost:27017/sarana-forwarder-service
   JWT_SECRET=your_jwt_secret
   LOG_LEVEL=info
   NODE_ENV=development
   ```

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

Once the service is running, you can access the Swagger API documentation at:

```
http://localhost:3003/api-docs
```

## API Endpoints

### Main Forwarder Endpoints

- `GET /api/forwarders` - Get all forwarders
- `POST /api/forwarders` - Create a new forwarder
- `GET /api/forwarders/:id` - Get forwarder by ID
- `PUT /api/forwarders/:id` - Update forwarder
- `DELETE /api/forwarders/:id` - Delete forwarder
- `PATCH /api/forwarders/:id/status` - Update forwarder status
- `GET /api/forwarders/search` - Search forwarders

### Coverage Area Endpoints

- `GET /api/forwarders/:id/coverage` - Get forwarder coverage
- `POST /api/forwarders/:id/coverage` - Add coverage area
- `PUT /api/forwarders/:id/coverage/:areaId` - Update coverage area
- `DELETE /api/forwarders/:id/coverage/:areaId` - Delete coverage area
- `GET /api/forwarders/coverage/search` - Search forwarders by coverage

### Rate Card Endpoints

- `GET /api/forwarders/:id/rates` - Get forwarder rates
- `POST /api/forwarders/:id/rates` - Add rate card
- `PUT /api/forwarders/:id/rates/:rateId` - Update rate card
- `DELETE /api/forwarders/:id/rates/:rateId` - Delete rate card
- `POST /api/forwarders/:id/rates/:rateId/weight-breaks` - Add weight break
- `PUT /api/forwarders/:id/rates/:rateId/weight-breaks/:breakId` - Update weight break
- `DELETE /api/forwarders/:id/rates/:rateId/weight-breaks/:breakId` - Delete weight break
- `GET /api/forwarders/rates/compare` - Compare rates

### Integration Endpoints

- `GET /api/forwarders/:id/integrations` - Get forwarder integrations
- `POST /api/forwarders/:id/integrations` - Add integration
- `PUT /api/forwarders/:id/integrations/:integrationId` - Update integration
- `DELETE /api/forwarders/:id/integrations/:integrationId` - Delete integration
- `GET /api/forwarders/:id/integrations/:integrationId/logs` - Get integration logs
- `POST /api/forwarders/:id/integrations/:integrationId/test` - Test integration

### Performance Endpoints

- `GET /api/forwarders/:id/performance` - Get forwarder performance
- `POST /api/forwarders/:id/performance` - Update performance metrics
- `GET /api/forwarders/:id/performance/history` - Get performance history
- `GET /api/forwarders/performance/rankings` - Get forwarder rankings
- `GET /api/forwarders/performance/sla-violations` - Get SLA violations

### Allocation Endpoints

- `GET /api/forwarders/:id/allocations` - Get forwarder allocations
- `POST /api/forwarders/allocate` - Allocate shipment
- `GET /api/forwarders/allocations/history` - Get allocation history
- `GET /api/forwarders/allocations/strategies` - Get allocation strategies
- `POST /api/forwarders/allocations/strategies` - Update allocation strategy

### Document Endpoints

- `GET /api/forwarders/:id/documents` - Get forwarder documents
- `POST /api/forwarders/:id/documents` - Upload document
- `GET /api/forwarders/:id/documents/:documentId` - Get document by ID
- `DELETE /api/forwarders/:id/documents/:documentId` - Delete document
- `PATCH /api/forwarders/:id/documents/:documentId` - Update document metadata

### Financial Endpoints

- `GET /api/forwarders/:id/financial` - Get forwarder financial details
- `PUT /api/forwarders/:id/financial` - Update forwarder financial details
- `PUT /api/forwarders/:id/financial/bank` - Update forwarder bank details
- `POST /api/forwarders/:id/financial/invoice` - Record forwarder invoice
- `POST /api/forwarders/:id/financial/payment` - Record forwarder payment
- `PUT /api/forwarders/:id/financial/credit-limit` - Update forwarder credit limit
- `GET /api/forwarders/financial/outstanding` - Get forwarders with outstanding balance
- `GET /api/forwarders/financial/credit-exceeded` - Get forwarders exceeding credit limit

### Communication Endpoints

- `GET /api/forwarders/:id/contact` - Get forwarder contact info
- `PUT /api/forwarders/:id/contact` - Update forwarder contact info
- `GET /api/forwarders/:id/communications` - Get forwarder communication logs
- `POST /api/forwarders/:id/communications` - Add communication log
- `PUT /api/forwarders/:id/communications/:logId` - Update communication log
- `DELETE /api/forwarders/:id/communications/:logId` - Delete communication log
- `GET /api/forwarders/communications/follow-up` - Get communication logs with follow-up required
- `POST /api/forwarders/:id/communications/:logId/follow-up` - Mark communication log as followed up

### Service Level Endpoints

- `GET /api/forwarders/:id/service-level` - Get forwarder service level
- `PUT /api/forwarders/:id/service-level` - Update forwarder service level
- `PUT /api/forwarders/:id/service-level/delivery-times` - Update delivery time standards
- `PUT /api/forwarders/:id/service-level/guarantees` - Update service guarantees
- `PUT /api/forwarders/:id/service-level/package-limitations` - Update package limitations
- `POST /api/forwarders/service-level/compare` - Compare service levels
- `GET /api/forwarders/service-level/capabilities` - Get forwarders by service capabilities

## Testing

Run tests with:

```
npm test
```

## Linting

Run ESLint with:

```
npm run lint
```

Fix linting issues automatically:

```
npm run lint:fix
```

## Project Structure

```
forwarder-service/
├── src/
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── utils/              # Utility functions
│   └── server.js           # Express app
├── logs/                   # Application logs
├── tests/                  # Test files
├── .env                    # Environment variables
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Git ignore file
├── jest.config.js          # Jest configuration
├── package.json            # npm dependencies
└── README.md               # This file
```

## Contributing

1. Follow the project coding standards
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
