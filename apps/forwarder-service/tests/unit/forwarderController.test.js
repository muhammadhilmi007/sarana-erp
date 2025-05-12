/**
 * Unit tests for Forwarder Controller
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const forwarderController = require('../../src/controllers/forwarderController');
const Forwarder = require('../../src/models/Forwarder');
const ForwarderHistory = require('../../src/models/ForwarderHistory');

// Mock dependencies
jest.mock('../../src/models/Forwarder');
jest.mock('../../src/models/ForwarderHistory');
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Forwarder Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request, response, and next function
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: { _id: 'mockUserId', role: 'admin' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('getAllForwarders', () => {
    it('should get all forwarders with pagination', async () => {
      // Setup
      const mockForwarders = [
        { _id: 'forwarder1', name: 'Test Forwarder 1' },
        { _id: 'forwarder2', name: 'Test Forwarder 2' },
      ];
      
      mockRequest.query = { page: '1', limit: '10' };
      
      Forwarder.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockForwarders),
      });
      
      Forwarder.countDocuments.mockResolvedValue(2);

      // Execute
      await forwarderController.getAllForwarders(mockRequest, mockResponse, mockNext);

      // Assert
      expect(Forwarder.find).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          forwarders: mockForwarders,
          count: 2,
          totalPages: 1,
          currentPage: 1,
        },
      });
    });

    it('should handle errors', async () => {
      // Setup
      const error = new Error('Database error');
      Forwarder.find.mockImplementation(() => {
        throw error;
      });

      // Execute
      await forwarderController.getAllForwarders(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getForwarderById', () => {
    it('should get a forwarder by ID', async () => {
      // Setup
      const mockForwarder = { _id: 'forwarder1', name: 'Test Forwarder' };
      mockRequest.params.id = 'forwarder1';
      
      Forwarder.findById.mockResolvedValue(mockForwarder);

      // Execute
      await forwarderController.getForwarderById(mockRequest, mockResponse, mockNext);

      // Assert
      expect(Forwarder.findById).toHaveBeenCalledWith('forwarder1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          forwarder: mockForwarder,
        },
      });
    });

    it('should return 404 if forwarder not found', async () => {
      // Setup
      mockRequest.params.id = 'nonexistentId';
      
      Forwarder.findById.mockResolvedValue(null);

      // Execute
      await forwarderController.getForwarderById(mockRequest, mockResponse, mockNext);

      // Assert
      expect(Forwarder.findById).toHaveBeenCalledWith('nonexistentId');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forwarder not found',
      });
    });

    it('should handle invalid ID format', async () => {
      // Setup
      mockRequest.params.id = 'invalid-id';
      
      mongoose.Types.isValidObjectId = jest.fn().mockReturnValue(false);

      // Execute
      await forwarderController.getForwarderById(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    });
  });

  describe('createForwarder', () => {
    it('should create a new forwarder', async () => {
      // Setup
      const mockForwarderData = {
        name: 'New Forwarder',
        code: 'FWD001',
        type: 'national',
      };
      
      const mockCreatedForwarder = {
        _id: 'newForwarderId',
        ...mockForwarderData,
        save: jest.fn().mockResolvedValue(true),
      };
      
      mockRequest.body = mockForwarderData;
      
      Forwarder.mockImplementation(() => mockCreatedForwarder);
      ForwarderHistory.recordCreation.mockResolvedValue(true);

      // Execute
      await forwarderController.createForwarder(mockRequest, mockResponse, mockNext);

      // Assert
      expect(Forwarder).toHaveBeenCalledWith({
        ...mockForwarderData,
        createdBy: 'mockUserId',
      });
      expect(mockCreatedForwarder.save).toHaveBeenCalled();
      expect(ForwarderHistory.recordCreation).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          forwarder: mockCreatedForwarder,
        },
      });
    });

    it('should handle validation errors', async () => {
      // Setup
      const mockForwarderData = {
        // Missing required fields
        type: 'unknown',
      };
      
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = { name: { message: 'Name is required' } };
      
      mockRequest.body = mockForwarderData;
      
      const mockCreatedForwarder = {
        save: jest.fn().mockRejectedValue(validationError),
      };
      
      Forwarder.mockImplementation(() => mockCreatedForwarder);

      // Execute
      await forwarderController.createForwarder(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(validationError);
    });
  });

  describe('updateForwarder', () => {
    it('should update a forwarder', async () => {
      // Setup
      const mockForwarderId = 'forwarder1';
      const mockUpdateData = {
        name: 'Updated Forwarder',
        status: 'active',
      };
      
      const mockForwarder = {
        _id: mockForwarderId,
        name: 'Original Forwarder',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };
      
      mockRequest.params.id = mockForwarderId;
      mockRequest.body = mockUpdateData;
      
      mongoose.Types.isValidObjectId = jest.fn().mockReturnValue(true);
      Forwarder.findById.mockResolvedValue(mockForwarder);
      ForwarderHistory.recordUpdate.mockResolvedValue(true);

      // Execute
      await forwarderController.updateForwarder(mockRequest, mockResponse, mockNext);

      // Assert
      expect(Forwarder.findById).toHaveBeenCalledWith(mockForwarderId);
      expect(ForwarderHistory.recordUpdate).toHaveBeenCalled();
      expect(mockForwarder.name).toBe(mockUpdateData.name);
      expect(mockForwarder.status).toBe(mockUpdateData.status);
      expect(mockForwarder.updatedBy).toBe('mockUserId');
      expect(mockForwarder.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          forwarder: mockForwarder,
        },
      });
    });

    it('should return 404 if forwarder not found', async () => {
      // Setup
      mockRequest.params.id = 'nonexistentId';
      mockRequest.body = { name: 'Updated Forwarder' };
      
      mongoose.Types.isValidObjectId = jest.fn().mockReturnValue(true);
      Forwarder.findById.mockResolvedValue(null);

      // Execute
      await forwarderController.updateForwarder(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forwarder not found',
      });
    });
  });

  describe('deleteForwarder', () => {
    it('should delete a forwarder', async () => {
      // Setup
      const mockForwarderId = 'forwarder1';
      
      const mockForwarder = {
        _id: mockForwarderId,
        name: 'Forwarder to Delete',
        remove: jest.fn().mockResolvedValue(true),
      };
      
      mockRequest.params.id = mockForwarderId;
      
      mongoose.Types.isValidObjectId = jest.fn().mockReturnValue(true);
      Forwarder.findById.mockResolvedValue(mockForwarder);
      ForwarderHistory.recordDeletion.mockResolvedValue(true);

      // Execute
      await forwarderController.deleteForwarder(mockRequest, mockResponse, mockNext);

      // Assert
      expect(Forwarder.findById).toHaveBeenCalledWith(mockForwarderId);
      expect(ForwarderHistory.recordDeletion).toHaveBeenCalled();
      expect(mockForwarder.remove).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Forwarder deleted successfully',
      });
    });

    it('should return 404 if forwarder not found', async () => {
      // Setup
      mockRequest.params.id = 'nonexistentId';
      
      mongoose.Types.isValidObjectId = jest.fn().mockReturnValue(true);
      Forwarder.findById.mockResolvedValue(null);

      // Execute
      await forwarderController.deleteForwarder(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forwarder not found',
      });
    });
  });
});
