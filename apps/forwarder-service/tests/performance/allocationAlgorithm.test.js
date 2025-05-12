/**
 * Performance tests for Forwarder Allocation Algorithms
 */

const { performance } = require('perf_hooks');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Forwarder = require('../../src/models/Forwarder');
const ForwarderAllocation = require('../../src/models/ForwarderAllocation');
const forwarderAllocationController = require('../../src/controllers/forwarderAllocationController');

let mongoServer;

describe('Forwarder Allocation Algorithm Performance', () => {
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
    await ForwarderAllocation.deleteMany({});
  });

  /**
   * Helper function to create test forwarders
   * @param {number} count - Number of forwarders to create
   * @returns {Promise<Array>} - Array of created forwarders
   */
  const createTestForwarders = async (count) => {
    const forwarders = [];
    
    for (let i = 0; i < count; i++) {
      const forwarder = await Forwarder.create({
        name: `Test Forwarder ${i}`,
        code: `TF${i.toString().padStart(3, '0')}`,
        type: i % 3 === 0 ? 'national' : (i % 3 === 1 ? 'international' : 'regional'),
        status: 'active',
        performanceMetrics: {
          deliverySuccessRate: 85 + (Math.random() * 15),
          onTimeDeliveryRate: 80 + (Math.random() * 20),
          damageRate: Math.random() * 5,
          customerSatisfactionScore: 3.5 + (Math.random() * 1.5),
        },
        coverageAreas: [
          {
            province: 'Test Province',
            city: 'Test City',
            district: 'Test District',
            postalCode: '12345',
            serviceLevel: 'standard',
          }
        ],
        rates: [
          {
            originProvince: 'Test Province',
            destinationProvince: 'Test Province',
            serviceType: 'standard',
            baseRate: 10000 + (Math.random() * 5000),
            weightBreaks: [
              { minWeight: 0, maxWeight: 1, rate: 10000 },
              { minWeight: 1, maxWeight: 5, rate: 15000 },
              { minWeight: 5, maxWeight: 10, rate: 20000 },
            ]
          }
        ]
      });
      
      forwarders.push(forwarder);
    }
    
    return forwarders;
  };

  /**
   * Helper function to create a test shipment
   * @returns {Object} - Test shipment object
   */
  const createTestShipment = () => {
    return {
      origin: {
        province: 'Test Province',
        city: 'Test City',
        district: 'Test District',
        postalCode: '12345',
      },
      destination: {
        province: 'Test Province',
        city: 'Test City',
        district: 'Test District',
        postalCode: '12345',
      },
      package: {
        weight: 3.5,
        length: 30,
        width: 20,
        height: 10,
        value: 500000,
      },
      serviceType: 'standard',
      priority: 'normal',
    };
  };

  describe('Round Robin Allocation', () => {
    it('should measure performance with 10 forwarders', async () => {
      // Setup
      const forwarders = await createTestForwarders(10);
      const shipment = createTestShipment();
      
      // Set allocation strategy to round-robin
      await ForwarderAllocation.create({
        strategy: 'round-robin',
        isActive: true,
        config: {
          roundRobinCounter: 0,
        },
      });
      
      // Mock request, response, and next
      const req = {
        body: shipment,
        user: { _id: new mongoose.Types.ObjectId() },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      const next = jest.fn();
      
      // Measure performance
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        await forwarderAllocationController.allocateShipment(req, res, next);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`Round Robin Allocation (10 forwarders, 100 shipments): ${executionTime.toFixed(2)}ms`);
      
      // Assert
      expect(executionTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(100);
    });
  });

  describe('Performance-Based Allocation', () => {
    it('should measure performance with 10 forwarders', async () => {
      // Setup
      const forwarders = await createTestForwarders(10);
      const shipment = createTestShipment();
      
      // Set allocation strategy to performance-based
      await ForwarderAllocation.create({
        strategy: 'performance-based',
        isActive: true,
        config: {
          deliverySuccessWeight: 0.4,
          onTimeDeliveryWeight: 0.3,
          damageRateWeight: 0.2,
          customerSatisfactionWeight: 0.1,
        },
      });
      
      // Mock request, response, and next
      const req = {
        body: shipment,
        user: { _id: new mongoose.Types.ObjectId() },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      const next = jest.fn();
      
      // Measure performance
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        await forwarderAllocationController.allocateShipment(req, res, next);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`Performance-Based Allocation (10 forwarders, 100 shipments): ${executionTime.toFixed(2)}ms`);
      
      // Assert
      expect(executionTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(100);
    });
  });

  describe('Cost-Based Allocation', () => {
    it('should measure performance with 10 forwarders', async () => {
      // Setup
      const forwarders = await createTestForwarders(10);
      const shipment = createTestShipment();
      
      // Set allocation strategy to cost-based
      await ForwarderAllocation.create({
        strategy: 'cost-based',
        isActive: true,
        config: {
          prioritizeCheapest: true,
        },
      });
      
      // Mock request, response, and next
      const req = {
        body: shipment,
        user: { _id: new mongoose.Types.ObjectId() },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      const next = jest.fn();
      
      // Measure performance
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        await forwarderAllocationController.allocateShipment(req, res, next);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`Cost-Based Allocation (10 forwarders, 100 shipments): ${executionTime.toFixed(2)}ms`);
      
      // Assert
      expect(executionTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(100);
    });
  });

  describe('Scaling Test', () => {
    it('should measure performance with 50 forwarders', async () => {
      // Setup
      const forwarders = await createTestForwarders(50);
      const shipment = createTestShipment();
      
      // Set allocation strategy to performance-based
      await ForwarderAllocation.create({
        strategy: 'performance-based',
        isActive: true,
        config: {
          deliverySuccessWeight: 0.4,
          onTimeDeliveryWeight: 0.3,
          damageRateWeight: 0.2,
          customerSatisfactionWeight: 0.1,
        },
      });
      
      // Mock request, response, and next
      const req = {
        body: shipment,
        user: { _id: new mongoose.Types.ObjectId() },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      const next = jest.fn();
      
      // Measure performance
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        await forwarderAllocationController.allocateShipment(req, res, next);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`Performance-Based Allocation (50 forwarders, 100 shipments): ${executionTime.toFixed(2)}ms`);
      
      // Assert
      expect(executionTime).toBeLessThan(10000); // Should complete in under 10 seconds
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(100);
    });
  });

  describe('Concurrent Allocation Test', () => {
    it('should handle concurrent allocation requests', async () => {
      // Setup
      const forwarders = await createTestForwarders(20);
      const shipment = createTestShipment();
      
      // Set allocation strategy to performance-based
      await ForwarderAllocation.create({
        strategy: 'performance-based',
        isActive: true,
        config: {
          deliverySuccessWeight: 0.4,
          onTimeDeliveryWeight: 0.3,
          damageRateWeight: 0.2,
          customerSatisfactionWeight: 0.1,
        },
      });
      
      // Mock request, response, and next
      const createMockReq = () => ({
        body: { ...shipment },
        user: { _id: new mongoose.Types.ObjectId() },
      });
      
      const createMockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
      };
      
      const next = jest.fn();
      
      // Create 10 concurrent requests
      const requests = Array(10).fill().map(() => ({
        req: createMockReq(),
        res: createMockRes(),
      }));
      
      // Measure performance
      const startTime = performance.now();
      
      await Promise.all(
        requests.map(({ req, res }) => 
          forwarderAllocationController.allocateShipment(req, res, next)
        )
      );
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`Concurrent Allocation (20 forwarders, 10 concurrent requests): ${executionTime.toFixed(2)}ms`);
      
      // Assert
      expect(executionTime).toBeLessThan(5000); // Should complete in under 5 seconds
      for (const { res } of requests) {
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalled();
      }
    });
  });
});
