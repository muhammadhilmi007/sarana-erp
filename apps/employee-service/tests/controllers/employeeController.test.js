/**
 * Employee Controller Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const employeeController = require('../../src/controllers/employeeController');
const Employee = require('../../src/models/Employee');
const { notFoundError } = require('../../src/middleware/errorMiddleware');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock request and response
const mockRequest = () => {
  const req = {};
  req.body = jest.fn().mockReturnValue(req);
  req.params = jest.fn().mockReturnValue(req);
  req.query = jest.fn().mockReturnValue(req);
  req.user = { id: new mongoose.Types.ObjectId(), role: 'admin' };
  return req;
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  await Employee.deleteMany({});
});

describe('Employee Controller', () => {
  describe('getAllEmployees', () => {
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
          createdBy: new mongoose.Types.ObjectId(),
          updatedBy: new mongoose.Types.ObjectId(),
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
          createdBy: new mongoose.Types.ObjectId(),
          updatedBy: new mongoose.Types.ObjectId(),
        },
      ]);

      const req = mockRequest();
      req.query = { page: 1, limit: 10 };
      const res = mockResponse();
      const next = jest.fn();

      await employeeController.getAllEmployees(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
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
            pagination: expect.objectContaining({
              total: 2,
              page: 1,
              limit: 10,
              pages: 1,
            }),
          }),
        })
      );
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
          createdBy: new mongoose.Types.ObjectId(),
          updatedBy: new mongoose.Types.ObjectId(),
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
          createdBy: new mongoose.Types.ObjectId(),
          updatedBy: new mongoose.Types.ObjectId(),
        },
      ]);

      const req = mockRequest();
      req.query = { search: 'Jane', page: 1, limit: 10 };
      const res = mockResponse();
      const next = jest.fn();

      await employeeController.getAllEmployees(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            employees: expect.arrayContaining([
              expect.objectContaining({
                employeeId: 'EMP002',
                firstName: 'Jane',
                lastName: 'Smith',
              }),
            ]),
            pagination: expect.objectContaining({
              total: 1,
              page: 1,
              limit: 10,
              pages: 1,
            }),
          }),
        })
      );
      expect(res.json.mock.calls[0][0].data.employees).toHaveLength(1);
    });
  });

  describe('getEmployeeById', () => {
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
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId(),
      });

      const req = mockRequest();
      req.params = { id: employee._id };
      const res = mockResponse();
      const next = jest.fn();

      await employeeController.getEmployeeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            employee: expect.objectContaining({
              employeeId: 'EMP001',
              firstName: 'John',
              lastName: 'Doe',
            }),
          }),
        })
      );
    });

    it('should return 404 if employee not found', async () => {
      const req = mockRequest();
      req.params = { id: new mongoose.Types.ObjectId() };
      const res = mockResponse();
      const next = jest.fn();

      await employeeController.getEmployeeById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining('Employee not found'),
        })
      );
    });
  });

  // Add more tests for other controller methods
});
