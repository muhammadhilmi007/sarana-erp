/**
 * Integration tests for Forwarder API endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/server');
const Forwarder = require('../../src/models/Forwarder');
const jwt = require('jsonwebtoken');

// Mock JWT verification
jest.mock('jsonwebtoken');

let mongoServer;

// Create test token
const createTestToken = (role = 'admin') => {
  const user = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Test User',
    email: 'test@example.com',
    role,
  };
  
  jwt.verify.mockImplementation(() => user);
  
  return `Bearer ${jwt.sign(user, 'test-secret')}`;
};

describe('Forwarder API Endpoints', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database between tests
    await Forwarder.deleteMany({});
  });

  describe('GET /api/forwarders', () => {
    it('should return all forwarders', async () => {
      // Create test forwarders
      await Forwarder.create([
        {
          name: 'Test Forwarder 1',
          code: 'TF001',
          type: 'national',
          status: 'active',
        },
        {
          name: 'Test Forwarder 2',
          code: 'TF002',
          type: 'international',
          status: 'active',
        },
      ]);

      const token = createTestToken();
      
      const response = await request(app)
        .get('/api/forwarders')
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.forwarders).toHaveLength(2);
      expect(response.body.data.count).toBe(2);
    });

    it('should filter forwarders by status', async () => {
      // Create test forwarders with different statuses
      await Forwarder.create([
        {
          name: 'Active Forwarder',
          code: 'AF001',
          type: 'national',
          status: 'active',
        },
        {
          name: 'Inactive Forwarder',
          code: 'IF001',
          type: 'national',
          status: 'inactive',
        },
      ]);

      const token = createTestToken();
      
      const response = await request(app)
        .get('/api/forwarders?status=active')
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body.data.forwarders).toHaveLength(1);
      expect(response.body.data.forwarders[0].name).toBe('Active Forwarder');
    });
  });

  describe('POST /api/forwarders', () => {
    it('should create a new forwarder', async () => {
      const newForwarder = {
        name: 'New Forwarder',
        code: 'NF001',
        type: 'regional',
        contactInfo: {
          email: 'contact@newforwarder.com',
          phone: '123-456-7890',
        },
      };

      const token = createTestToken('admin');
      
      const response = await request(app)
        .post('/api/forwarders')
        .set('Authorization', token)
        .send(newForwarder);
      
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.forwarder.name).toBe(newForwarder.name);
      expect(response.body.data.forwarder.code).toBe(newForwarder.code);
      
      // Verify the forwarder was saved to the database
      const savedForwarder = await Forwarder.findOne({ code: 'NF001' });
      expect(savedForwarder).not.toBeNull();
      expect(savedForwarder.name).toBe(newForwarder.name);
    });

    it('should return 400 for invalid data', async () => {
      const invalidForwarder = {
        // Missing required fields
        type: 'unknown',
      };

      const token = createTestToken('admin');
      
      const response = await request(app)
        .post('/api/forwarders')
        .set('Authorization', token)
        .send(invalidForwarder);
      
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 for unauthorized users', async () => {
      const newForwarder = {
        name: 'New Forwarder',
        code: 'NF001',
        type: 'regional',
      };

      const token = createTestToken('user'); // Non-admin role
      
      const response = await request(app)
        .post('/api/forwarders')
        .set('Authorization', token)
        .send(newForwarder);
      
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/forwarders/:id', () => {
    it('should get a forwarder by ID', async () => {
      // Create a test forwarder
      const forwarder = await Forwarder.create({
        name: 'Test Forwarder',
        code: 'TF001',
        type: 'national',
        status: 'active',
      });

      const token = createTestToken();
      
      const response = await request(app)
        .get(`/api/forwarders/${forwarder._id}`)
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.forwarder._id).toBe(forwarder._id.toString());
      expect(response.body.data.forwarder.name).toBe(forwarder.name);
    });

    it('should return 404 for non-existent forwarder', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const token = createTestToken();
      
      const response = await request(app)
        .get(`/api/forwarders/${nonExistentId}`)
        .set('Authorization', token);
      
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Forwarder not found');
    });
  });

  describe('PUT /api/forwarders/:id', () => {
    it('should update a forwarder', async () => {
      // Create a test forwarder
      const forwarder = await Forwarder.create({
        name: 'Original Name',
        code: 'TF001',
        type: 'national',
        status: 'active',
      });

      const updateData = {
        name: 'Updated Name',
        status: 'inactive',
      };

      const token = createTestToken('admin');
      
      const response = await request(app)
        .put(`/api/forwarders/${forwarder._id}`)
        .set('Authorization', token)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.forwarder.name).toBe(updateData.name);
      expect(response.body.data.forwarder.status).toBe(updateData.status);
      
      // Verify the forwarder was updated in the database
      const updatedForwarder = await Forwarder.findById(forwarder._id);
      expect(updatedForwarder.name).toBe(updateData.name);
      expect(updatedForwarder.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent forwarder', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { name: 'Updated Name' };
      const token = createTestToken('admin');
      
      const response = await request(app)
        .put(`/api/forwarders/${nonExistentId}`)
        .set('Authorization', token)
        .send(updateData);
      
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/forwarders/:id', () => {
    it('should delete a forwarder', async () => {
      // Create a test forwarder
      const forwarder = await Forwarder.create({
        name: 'Forwarder to Delete',
        code: 'TF001',
        type: 'national',
        status: 'active',
      });

      const token = createTestToken('admin');
      
      const response = await request(app)
        .delete(`/api/forwarders/${forwarder._id}`)
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Forwarder deleted successfully');
      
      // Verify the forwarder was deleted from the database
      const deletedForwarder = await Forwarder.findById(forwarder._id);
      expect(deletedForwarder).toBeNull();
    });

    it('should return 404 for non-existent forwarder', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const token = createTestToken('admin');
      
      const response = await request(app)
        .delete(`/api/forwarders/${nonExistentId}`)
        .set('Authorization', token);
      
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should return 403 for unauthorized users', async () => {
      // Create a test forwarder
      const forwarder = await Forwarder.create({
        name: 'Forwarder to Delete',
        code: 'TF001',
        type: 'national',
        status: 'active',
      });

      const token = createTestToken('manager'); // Non-admin role
      
      const response = await request(app)
        .delete(`/api/forwarders/${forwarder._id}`)
        .set('Authorization', token);
      
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PATCH /api/forwarders/:id/status', () => {
    it('should update forwarder status', async () => {
      // Create a test forwarder
      const forwarder = await Forwarder.create({
        name: 'Test Forwarder',
        code: 'TF001',
        type: 'national',
        status: 'active',
      });

      const statusUpdate = {
        status: 'suspended',
        reason: 'Performance issues',
      };

      const token = createTestToken('manager');
      
      const response = await request(app)
        .patch(`/api/forwarders/${forwarder._id}/status`)
        .set('Authorization', token)
        .send(statusUpdate);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      
      // Verify the status was updated in the database
      const updatedForwarder = await Forwarder.findById(forwarder._id);
      expect(updatedForwarder.status).toBe(statusUpdate.status);
    });
  });
});
