const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ServiceArea = require('../../models/ServiceArea');
const ServiceAreaHistory = require('../../models/ServiceAreaHistory');

// Mock dependencies
jest.mock('../../models/ServiceArea');
jest.mock('../../models/ServiceAreaHistory');
jest.mock('../../utils/serviceAreaValidation', () => ({
  validateServiceAreaCreate: jest.fn().mockReturnValue({ error: null }),
  validateServiceAreaUpdate: jest.fn().mockReturnValue({ error: null }),
  validateServiceAreaPricing: jest.fn().mockReturnValue({ error: null }),
  validateServiceAreaBranchAssignment: jest.fn().mockReturnValue({ error: null }),
  validateServiceAreaStatus: jest.fn().mockReturnValue({ error: null }),
  validatePointInServiceArea: jest.fn().mockReturnValue({ error: null })
}));

// Mock Redis client
jest.mock('redis', () => {
  return {
    createClient: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(true),
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
      exists: jest.fn().mockResolvedValue(0),
      on: jest.fn(),
      quit: jest.fn()
    })
  };
});

// Import controller after mocking dependencies
const serviceAreaController = require('../../controllers/serviceAreaController');

// Mock Express request and response
const mockRequest = (body = {}, params = {}, query = {}, user = { id: 'user123', role: 'admin' }) => ({
  body,
  params,
  query,
  user,
  file: null
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Service Area Controller', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createServiceArea', () => {
    it('should create a service area successfully', async () => {
      // Arrange
      const req = mockRequest({
        code: 'SA001',
        name: 'Test Service Area',
        description: 'Test Description',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        status: 'active',
        pricing: {
          basePrice: 10000,
          pricePerKg: 1000,
          pricePerKm: 500
        }
      });
      const res = mockResponse();

      ServiceArea.findOne.mockResolvedValue(null);
      ServiceArea.create.mockResolvedValue({
        _id: 'servicearea123',
        code: 'SA001',
        name: 'Test Service Area',
        toObject: () => ({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area'
        })
      });

      // Act
      await serviceAreaController.createServiceArea(req, res, mockNext);

      // Assert
      expect(ServiceArea.findOne).toHaveBeenCalledWith({ code: 'SA001' });
      expect(ServiceArea.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Service area created successfully',
        data: expect.objectContaining({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area'
        })
      }));
    });

    it('should return error if service area code already exists', async () => {
      // Arrange
      const req = mockRequest({
        code: 'SA001',
        name: 'Test Service Area'
      });
      const res = mockResponse();

      ServiceArea.findOne.mockResolvedValue({
        _id: 'servicearea123',
        code: 'SA001'
      });

      // Act
      await serviceAreaController.createServiceArea(req, res, mockNext);

      // Assert
      expect(ServiceArea.findOne).toHaveBeenCalledWith({ code: 'SA001' });
      expect(ServiceArea.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Service area with this code already exists'
      }));
    });
  });

  describe('getServiceAreas', () => {
    it('should get all service areas with pagination', async () => {
      // Arrange
      const req = mockRequest({}, {}, { page: 1, limit: 10 });
      const res = mockResponse();

      const mockServiceAreas = [
        { _id: 'servicearea1', code: 'SA001', name: 'Service Area 1' },
        { _id: 'servicearea2', code: 'SA002', name: 'Service Area 2' }
      ];

      const mockAggregate = [
        { count: 2 }
      ];

      ServiceArea.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockServiceAreas)
      });

      ServiceArea.aggregate.mockResolvedValue(mockAggregate);

      // Act
      await serviceAreaController.getServiceAreas(req, res, mockNext);

      // Assert
      expect(ServiceArea.find).toHaveBeenCalled();
      expect(ServiceArea.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockServiceAreas,
        pagination: expect.objectContaining({
          total: 2,
          page: 1,
          limit: 10
        })
      }));
    });
  });

  describe('getServiceAreaById', () => {
    it('should get a service area by ID', async () => {
      // Arrange
      const req = mockRequest({}, { id: 'servicearea123' });
      const res = mockResponse();

      const mockServiceArea = {
        _id: 'servicearea123',
        code: 'SA001',
        name: 'Test Service Area',
        toObject: () => ({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area'
        })
      };

      ServiceArea.findById.mockResolvedValue(mockServiceArea);

      // Act
      await serviceAreaController.getServiceAreaById(req, res, mockNext);

      // Assert
      expect(ServiceArea.findById).toHaveBeenCalledWith('servicearea123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area'
        })
      }));
    });

    it('should return 404 if service area not found', async () => {
      // Arrange
      const req = mockRequest({}, { id: 'nonexistentid' });
      const res = mockResponse();

      ServiceArea.findById.mockResolvedValue(null);

      // Act
      await serviceAreaController.getServiceAreaById(req, res, mockNext);

      // Assert
      expect(ServiceArea.findById).toHaveBeenCalledWith('nonexistentid');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Service area not found'
      }));
    });
  });

  describe('updateServiceArea', () => {
    it('should update a service area successfully', async () => {
      // Arrange
      const req = mockRequest(
        {
          name: 'Updated Service Area',
          description: 'Updated Description'
        },
        { id: 'servicearea123' }
      );
      const res = mockResponse();

      const mockServiceArea = {
        _id: 'servicearea123',
        code: 'SA001',
        name: 'Test Service Area',
        description: 'Test Description',
        save: jest.fn().mockResolvedValue({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Updated Service Area',
          description: 'Updated Description',
          toObject: () => ({
            _id: 'servicearea123',
            code: 'SA001',
            name: 'Updated Service Area',
            description: 'Updated Description'
          })
        }),
        toObject: () => ({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          description: 'Test Description'
        })
      };

      ServiceArea.findById.mockResolvedValue(mockServiceArea);
      ServiceAreaHistory.create.mockResolvedValue({});

      // Act
      await serviceAreaController.updateServiceArea(req, res, mockNext);

      // Assert
      expect(ServiceArea.findById).toHaveBeenCalledWith('servicearea123');
      expect(mockServiceArea.save).toHaveBeenCalled();
      expect(ServiceAreaHistory.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Service area updated successfully',
        data: expect.objectContaining({
          _id: 'servicearea123',
          name: 'Updated Service Area',
          description: 'Updated Description'
        })
      }));
    });
  });

  describe('deleteServiceArea', () => {
    it('should delete a service area successfully', async () => {
      // Arrange
      const req = mockRequest({}, { id: 'servicearea123' });
      const res = mockResponse();

      const mockServiceArea = {
        _id: 'servicearea123',
        code: 'SA001',
        name: 'Test Service Area',
        toObject: () => ({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area'
        })
      };

      ServiceArea.findById.mockResolvedValue(mockServiceArea);
      ServiceArea.findByIdAndDelete.mockResolvedValue(mockServiceArea);
      ServiceAreaHistory.create.mockResolvedValue({});

      // Act
      await serviceAreaController.deleteServiceArea(req, res, mockNext);

      // Assert
      expect(ServiceArea.findById).toHaveBeenCalledWith('servicearea123');
      expect(ServiceArea.findByIdAndDelete).toHaveBeenCalledWith('servicearea123');
      expect(ServiceAreaHistory.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Service area deleted successfully'
      }));
    });
  });

  describe('updateServiceAreaStatus', () => {
    it('should update service area status successfully', async () => {
      // Arrange
      const req = mockRequest(
        { status: 'inactive' },
        { id: 'servicearea123' }
      );
      const res = mockResponse();

      const mockServiceArea = {
        _id: 'servicearea123',
        code: 'SA001',
        name: 'Test Service Area',
        status: 'active',
        save: jest.fn().mockResolvedValue({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          status: 'inactive',
          toObject: () => ({
            _id: 'servicearea123',
            code: 'SA001',
            name: 'Test Service Area',
            status: 'inactive'
          })
        }),
        toObject: () => ({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          status: 'active'
        })
      };

      ServiceArea.findById.mockResolvedValue(mockServiceArea);
      ServiceAreaHistory.create.mockResolvedValue({});

      // Act
      await serviceAreaController.updateServiceAreaStatus(req, res, mockNext);

      // Assert
      expect(ServiceArea.findById).toHaveBeenCalledWith('servicearea123');
      expect(mockServiceArea.save).toHaveBeenCalled();
      expect(ServiceAreaHistory.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Service area status updated successfully',
        data: expect.objectContaining({
          _id: 'servicearea123',
          status: 'inactive'
        })
      }));
    });
  });

  describe('updateServiceAreaPricing', () => {
    it('should update service area pricing successfully', async () => {
      // Arrange
      const req = mockRequest(
        {
          pricing: {
            basePrice: 15000,
            pricePerKg: 1500,
            pricePerKm: 700
          }
        },
        { id: 'servicearea123' }
      );
      const res = mockResponse();

      const mockServiceArea = {
        _id: 'servicearea123',
        code: 'SA001',
        name: 'Test Service Area',
        pricing: {
          basePrice: 10000,
          pricePerKg: 1000,
          pricePerKm: 500
        },
        save: jest.fn().mockResolvedValue({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          pricing: {
            basePrice: 15000,
            pricePerKg: 1500,
            pricePerKm: 700
          },
          toObject: () => ({
            _id: 'servicearea123',
            code: 'SA001',
            name: 'Test Service Area',
            pricing: {
              basePrice: 15000,
              pricePerKg: 1500,
              pricePerKm: 700
            }
          })
        }),
        toObject: () => ({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          pricing: {
            basePrice: 10000,
            pricePerKg: 1000,
            pricePerKm: 500
          }
        })
      };

      ServiceArea.findById.mockResolvedValue(mockServiceArea);
      ServiceAreaHistory.create.mockResolvedValue({});

      // Act
      await serviceAreaController.updateServiceAreaPricing(req, res, mockNext);

      // Assert
      expect(ServiceArea.findById).toHaveBeenCalledWith('servicearea123');
      expect(mockServiceArea.save).toHaveBeenCalled();
      expect(ServiceAreaHistory.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Service area pricing updated successfully',
        data: expect.objectContaining({
          _id: 'servicearea123',
          pricing: {
            basePrice: 15000,
            pricePerKg: 1500,
            pricePerKm: 700
          }
        })
      }));
    });
  });

  describe('assignBranchToServiceArea', () => {
    it('should assign a branch to service area successfully', async () => {
      // Arrange
      const req = mockRequest(
        { branchId: 'branch123' },
        { id: 'servicearea123' }
      );
      const res = mockResponse();

      const mockServiceArea = {
        _id: 'servicearea123',
        code: 'SA001',
        name: 'Test Service Area',
        branches: [],
        save: jest.fn().mockResolvedValue({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          branches: ['branch123'],
          toObject: () => ({
            _id: 'servicearea123',
            code: 'SA001',
            name: 'Test Service Area',
            branches: ['branch123']
          })
        }),
        toObject: () => ({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          branches: []
        })
      };

      ServiceArea.findById.mockResolvedValue(mockServiceArea);
      ServiceAreaHistory.create.mockResolvedValue({});

      // Act
      await serviceAreaController.assignBranchToServiceArea(req, res, mockNext);

      // Assert
      expect(ServiceArea.findById).toHaveBeenCalledWith('servicearea123');
      expect(mockServiceArea.save).toHaveBeenCalled();
      expect(ServiceAreaHistory.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Branch assigned to service area successfully',
        data: expect.objectContaining({
          _id: 'servicearea123',
          branches: ['branch123']
        })
      }));
    });
  });

  describe('removeBranchFromServiceArea', () => {
    it('should remove a branch from service area successfully', async () => {
      // Arrange
      const req = mockRequest(
        { branchId: 'branch123' },
        { id: 'servicearea123' }
      );
      const res = mockResponse();

      const mockServiceArea = {
        _id: 'servicearea123',
        code: 'SA001',
        name: 'Test Service Area',
        branches: ['branch123', 'branch456'],
        save: jest.fn().mockResolvedValue({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          branches: ['branch456'],
          toObject: () => ({
            _id: 'servicearea123',
            code: 'SA001',
            name: 'Test Service Area',
            branches: ['branch456']
          })
        }),
        toObject: () => ({
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          branches: ['branch123', 'branch456']
        })
      };

      ServiceArea.findById.mockResolvedValue(mockServiceArea);
      ServiceAreaHistory.create.mockResolvedValue({});

      // Act
      await serviceAreaController.removeBranchFromServiceArea(req, res, mockNext);

      // Assert
      expect(ServiceArea.findById).toHaveBeenCalledWith('servicearea123');
      expect(mockServiceArea.save).toHaveBeenCalled();
      expect(ServiceAreaHistory.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Branch removed from service area successfully',
        data: expect.objectContaining({
          _id: 'servicearea123',
          branches: ['branch456']
        })
      }));
    });
  });

  describe('checkPointInServiceArea', () => {
    it('should check if a point is within a service area', async () => {
      // Arrange
      const req = mockRequest(
        { 
          longitude: 106.8456, 
          latitude: -6.2088 
        }
      );
      const res = mockResponse();

      const mockServiceAreas = [
        { 
          _id: 'servicearea123',
          code: 'SA001',
          name: 'Test Service Area',
          toObject: () => ({
            _id: 'servicearea123',
            code: 'SA001',
            name: 'Test Service Area'
          })
        }
      ];

      ServiceArea.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockServiceAreas)
      });

      // Act
      await serviceAreaController.checkPointInServiceArea(req, res, mockNext);

      // Assert
      expect(ServiceArea.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          isInServiceArea: true,
          serviceAreas: expect.arrayContaining([
            expect.objectContaining({
              _id: 'servicearea123',
              code: 'SA001',
              name: 'Test Service Area'
            })
          ])
        })
      }));
    });
  });

  describe('getServiceAreaHistory', () => {
    it('should get service area history', async () => {
      // Arrange
      const req = mockRequest({}, { id: 'servicearea123' }, { page: 1, limit: 10 });
      const res = mockResponse();

      const mockHistory = [
        {
          _id: 'history1',
          serviceAreaId: 'servicearea123',
          action: 'create',
          timestamp: new Date(),
          changes: {}
        },
        {
          _id: 'history2',
          serviceAreaId: 'servicearea123',
          action: 'update',
          timestamp: new Date(),
          changes: { name: { from: 'Old Name', to: 'New Name' } }
        }
      ];

      ServiceAreaHistory.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockHistory)
      });

      ServiceAreaHistory.countDocuments.mockResolvedValue(2);

      // Act
      await serviceAreaController.getServiceAreaHistory(req, res, mockNext);

      // Assert
      expect(ServiceAreaHistory.find).toHaveBeenCalledWith({ serviceAreaId: 'servicearea123' });
      expect(ServiceAreaHistory.countDocuments).toHaveBeenCalledWith({ serviceAreaId: 'servicearea123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockHistory,
        pagination: expect.objectContaining({
          total: 2,
          page: 1,
          limit: 10
        })
      }));
    });
  });
});
