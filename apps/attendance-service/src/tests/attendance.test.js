/**
 * Attendance API Tests
 * Tests for attendance-related endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Employee = require('../../../employee-service/src/models/Employee');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

let mongoServer;

// Mock JWT token for testing
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

// Setup before tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
beforeEach(async () => {
  await Employee.deleteMany({});
  await Attendance.deleteMany({});
});

describe('Attendance API', () => {
  let employee;
  let token;
  
  // Create test employee and token before each test
  beforeEach(async () => {
    // Create test employee
    employee = await Employee.create({
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      position: 'Software Engineer',
      department: 'Engineering',
      hireDate: new Date('2023-01-01'),
      role: 'employee'
    });
    
    // Generate token for employee
    token = generateToken(employee);
  });
  
  describe('POST /api/attendance/check-in', () => {
    it('should allow employee to check in', async () => {
      const response = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: employee._id,
          checkInTime: new Date(),
          location: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.employeeId.toString()).toBe(employee._id.toString());
      expect(response.body.data).toHaveProperty('checkInTime');
      expect(response.body.data.status).toBe('present');
    });
    
    it('should not allow check-in without authentication', async () => {
      const response = await request(app)
        .post('/api/attendance/check-in')
        .send({
          employeeId: employee._id,
          checkInTime: new Date()
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/attendance/check-out', () => {
    it('should allow employee to check out', async () => {
      // First check in
      const checkIn = await Attendance.create({
        employeeId: employee._id,
        checkInTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        status: 'present'
      });
      
      const response = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${token}`)
        .send({
          attendanceId: checkIn._id,
          checkOutTime: new Date(),
          location: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(checkIn._id.toString());
      expect(response.body.data).toHaveProperty('checkOutTime');
      expect(response.body.data).toHaveProperty('workHours');
    });
  });
  
  describe('GET /api/attendance', () => {
    it('should get employee attendance records', async () => {
      // Create some attendance records
      await Attendance.create([
        {
          employeeId: employee._id,
          checkInTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          checkOutTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
          status: 'present'
        },
        {
          employeeId: employee._id,
          checkInTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          checkOutTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
          status: 'present'
        }
      ]);
      
      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${token}`)
        .query({ employeeId: employee._id });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('checkInTime');
      expect(response.body.data[0]).toHaveProperty('checkOutTime');
    });
  });
});
