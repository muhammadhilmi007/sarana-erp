/**
 * Employee Routes Integration Tests
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/index');
const Employee = require('../../src/models/Employee');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

let mongoServer;
let token;
let adminId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-jwt-secret';
  
  // Create admin user ID for testing
  adminId = new mongoose.Types.ObjectId();
  
  // Generate test JWT token
  token = jwt.sign(
    { id: adminId, email: 'admin@example.com', role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  await Employee.deleteMany({});
});

describe('Employee API Endpoints', () => {
  describe('GET /api/v1/employees', () => {
    it('should get all employees with pagination', async () => {
      // Create test employees
      await Employee.create([
        {
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '1234567890',
          birthDate: new Date('1990-01-01'),
          gender: 'male',
          maritalStatus: 'single',
          address: {
            street: 'Test Street',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country',
          },
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'spouse',
            phoneNumber: '0987654321',
          },
          joinDate: new Date('2020-01-01'),
          divisionId: new mongoose.Types.ObjectId(),
          branchId: new mongoose.Types.ObjectId(),
          positionId: new mongoose.Types.ObjectId(),
          employmentType: 'full-time',
          status: 'active',
          bankAccount: {
            bankName: 'Test Bank',
            accountNumber: '1234567890',
            accountName: 'John Doe',
          },
          taxInfo: {
            taxId: '1234567890',
            taxStatus: 'single',
          },
          createdBy: adminId,
          updatedBy: adminId,
        },
        {
          employeeId: 'EMP002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '0987654321',
          birthDate: new Date('1995-01-01'),
          gender: 'female',
          maritalStatus: 'married',
          address: {
            street: 'Test Street 2',
            city: 'Test City 2',
            state: 'Test State 2',
            postalCode: '54321',
            country: 'Test Country 2',
          },
          emergencyContact: {
            name: 'John Smith',
            relationship: 'spouse',
            phoneNumber: '1234567890',
          },
          joinDate: new Date('2021-01-01'),
          divisionId: new mongoose.Types.ObjectId(),
          branchId: new mongoose.Types.ObjectId(),
          positionId: new mongoose.Types.ObjectId(),
          employmentType: 'part-time',
          status: 'active',
          bankAccount: {
            bankName: 'Test Bank 2',
            accountNumber: '0987654321',
            accountName: 'Jane Smith',
          },
          taxInfo: {
            taxId: '0987654321',
            taxStatus: 'married',
          },
          createdBy: adminId,
          updatedBy: adminId,
        },
      ]);

      const response = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          employees: expect.arrayContaining([
            expect.objectContaining({
              employeeId: 'EMP001',
              firstName: 'John',
              lastName: 'Doe',
            }),
            expect.objectContaining({
              employeeId: 'EMP002',
              firstName: 'Jane',
              lastName: 'Smith',
            }),
          ]),
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            pages: 1,
          },
        },
      });
      expect(response.body.data.employees).toHaveLength(2);
    });

    it('should filter employees by search query', async () => {
      // Create test employees
      await Employee.create([
        {
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '1234567890',
          birthDate: new Date('1990-01-01'),
          gender: 'male',
          maritalStatus: 'single',
          address: {
            street: 'Test Street',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country',
          },
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'spouse',
            phoneNumber: '0987654321',
          },
          joinDate: new Date('2020-01-01'),
          divisionId: new mongoose.Types.ObjectId(),
          branchId: new mongoose.Types.ObjectId(),
          positionId: new mongoose.Types.ObjectId(),
          employmentType: 'full-time',
          status: 'active',
          bankAccount: {
            bankName: 'Test Bank',
            accountNumber: '1234567890',
            accountName: 'John Doe',
          },
          taxInfo: {
            taxId: '1234567890',
            taxStatus: 'single',
          },
          createdBy: adminId,
          updatedBy: adminId,
        },
        {
          employeeId: 'EMP002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '0987654321',
          birthDate: new Date('1995-01-01'),
          gender: 'female',
          maritalStatus: 'married',
          address: {
            street: 'Test Street 2',
            city: 'Test City 2',
            state: 'Test State 2',
            postalCode: '54321',
            country: 'Test Country 2',
          },
          emergencyContact: {
            name: 'John Smith',
            relationship: 'spouse',
            phoneNumber: '1234567890',
          },
          joinDate: new Date('2021-01-01'),
          divisionId: new mongoose.Types.ObjectId(),
          branchId: new mongoose.Types.ObjectId(),
          positionId: new mongoose.Types.ObjectId(),
          employmentType: 'part-time',
          status: 'active',
          bankAccount: {
            bankName: 'Test Bank 2',
            accountNumber: '0987654321',
            accountName: 'Jane Smith',
          },
          taxInfo: {
            taxId: '0987654321',
            taxStatus: 'married',
          },
          createdBy: adminId,
          updatedBy: adminId,
        },
      ]);

      const response = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${token}`)
        .query({ search: 'Jane', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          employees: expect.arrayContaining([
            expect.objectContaining({
              employeeId: 'EMP002',
              firstName: 'Jane',
              lastName: 'Smith',
            }),
          ]),
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            pages: 1,
          },
        },
      });
      expect(response.body.data.employees).toHaveLength(1);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/v1/employees')
        .expect(401);
    });
  });

  describe('GET /api/v1/employees/:id', () => {
    it('should get an employee by ID', async () => {
      // Create a test employee
      const employee = await Employee.create({
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        birthDate: new Date('1990-01-01'),
        gender: 'male',
        maritalStatus: 'single',
        address: {
          street: 'Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'spouse',
          phoneNumber: '0987654321',
        },
        joinDate: new Date('2020-01-01'),
        divisionId: new mongoose.Types.ObjectId(),
        branchId: new mongoose.Types.ObjectId(),
        positionId: new mongoose.Types.ObjectId(),
        employmentType: 'full-time',
        status: 'active',
        bankAccount: {
          bankName: 'Test Bank',
          accountNumber: '1234567890',
          accountName: 'John Doe',
        },
        taxInfo: {
          taxId: '1234567890',
          taxStatus: 'single',
        },
        createdBy: adminId,
        updatedBy: adminId,
      });

      const response = await request(app)
        .get(`/api/v1/employees/${employee._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: {
          employee: expect.objectContaining({
            employeeId: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
          }),
        },
      });
    });

    it('should return 404 if employee not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/v1/employees/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  // Add more tests for other endpoints
});
