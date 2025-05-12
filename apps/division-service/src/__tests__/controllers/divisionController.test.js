/**
 * Division Controller Tests
 */

const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const divisionController = require('../../controllers/divisionController');
const Division = require('../../models/Division');
const DivisionHistory = require('../../models/DivisionHistory');

// Mock dependencies
jest.mock('../../models/Division');
jest.mock('../../models/DivisionHistory');
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock data
const mockDivision = {
  _id: new mongoose.Types.ObjectId(),
  code: 'DIV001',
  name: 'Finance Division',
  description: 'Handles financial operations',
  branchId: new mongoose.Types.ObjectId(),
  status: 'active',
  level: 0,
  path: 'mockId',
  performanceMetrics: {
    kpis: [],
    lastUpdated: new Date(),
  },
  budget: {
    allocated: 1000000,
    spent: 250000,
    remaining: 750000,
    currency: 'IDR',
    fiscalYear: '2025',
    lastUpdated: new Date(),
  },
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  toObject: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(this),
  getChildren: jest.fn(),
  getDescendants: jest.fn(),
  getAncestors: jest.fn(),
  addStatusHistory: jest.fn(),
  updateKPI: jest.fn(),
  updateBudget: jest.fn(),
};

// Mock user
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: 'user@example.com',
};

describe('Division Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    req.user = mockUser;
    jest.clearAllMocks();
  });

  describe('getAllDivisions', () => {
    it('should get all divisions with pagination and filtering', async () => {
      // Mock request
      req.query = {
        page: '1',
        limit: '10',
        search: 'Finance',
        status: 'active',
        sortBy: 'name',
        sortOrder: 'asc',
      };

      // Mock Division.find
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([mockDivision]),
      };
      Division.find.mockReturnValue(mockFind);
      Division.countDocuments.mockResolvedValue(1);

      // Call controller
      await divisionController.getAllDivisions(req, res, next);

      // Assertions
      expect(Division.find).toHaveBeenCalled();
      expect(mockFind.sort).toHaveBeenCalledWith({ name: 1 });
      expect(mockFind.skip).toHaveBeenCalledWith(0);
      expect(mockFind.limit).toHaveBeenCalledWith(10);
      expect(Division.countDocuments).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        status: 'success',
        data: {
          divisions: [mockDivision],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            pages: 1,
          },
        },
      });
    });

    it('should handle errors', async () => {
      // Mock Division.find to throw error
      const error = new Error('Database error');
      Division.find.mockImplementation(() => {
        throw error;
      });

      // Call controller
      await divisionController.getAllDivisions(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getDivisionById', () => {
    it('should get division by ID', async () => {
      // Mock request
      req.params = { id: mockDivision._id };

      // Mock Division.findById
      Division.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDivision),
      });

      // Call controller
      await divisionController.getDivisionById(req, res, next);

      // Assertions
      expect(Division.findById).toHaveBeenCalledWith(mockDivision._id);
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        status: 'success',
        data: { division: mockDivision },
      });
    });

    it('should return 404 if division not found', async () => {
      // Mock request
      req.params = { id: mockDivision._id };

      // Mock Division.findById
      Division.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      // Call controller
      await divisionController.getDivisionById(req, res, next);

      // Assertions
      expect(Division.findById).toHaveBeenCalledWith(mockDivision._id);
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        status: 'error',
        message: 'Division not found',
      });
    });

    it('should handle invalid ID', async () => {
      // Mock request
      req.params = { id: 'invalid-id' };

      // Call controller
      await divisionController.getDivisionById(req, res, next);

      // Assertions
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        status: 'error',
        message: 'Invalid division ID',
      });
    });

    it('should handle errors', async () => {
      // Mock request
      req.params = { id: mockDivision._id };

      // Mock Division.findById to throw error
      const error = new Error('Database error');
      Division.findById.mockImplementation(() => {
        throw error;
      });

      // Call controller
      await divisionController.getDivisionById(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createDivision', () => {
    it('should create a new division', async () => {
      // Mock request
      req.body = {
        code: 'DIV001',
        name: 'Finance Division',
        description: 'Handles financial operations',
        branchId: new mongoose.Types.ObjectId(),
      };

      // Mock Division.create
      Division.create.mockResolvedValue(mockDivision);

      // Call controller
      await divisionController.createDivision(req, res, next);

      // Assertions
      expect(Division.create).toHaveBeenCalled();
      expect(DivisionHistory.recordCreation).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({
        status: 'success',
        data: { division: mockDivision },
      });
    });

    it('should handle parent division check', async () => {
      // Mock request
      req.body = {
        code: 'DIV002',
        name: 'Accounting Department',
        description: 'Handles accounting operations',
        parentId: mockDivision._id,
        branchId: new mongoose.Types.ObjectId(),
      };

      // Mock Division.findById
      Division.findById.mockResolvedValue(mockDivision);

      // Mock Division.create
      Division.create.mockResolvedValue({
        ...mockDivision,
        _id: new mongoose.Types.ObjectId(),
        code: 'DIV002',
        name: 'Accounting Department',
        parentId: mockDivision._id,
      });

      // Call controller
      await divisionController.createDivision(req, res, next);

      // Assertions
      expect(Division.findById).toHaveBeenCalledWith(mockDivision._id);
      expect(Division.create).toHaveBeenCalled();
      expect(DivisionHistory.recordCreation).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(201);
    });

    it('should handle parent division not found', async () => {
      // Mock request
      req.body = {
        code: 'DIV002',
        name: 'Accounting Department',
        description: 'Handles accounting operations',
        parentId: new mongoose.Types.ObjectId(),
        branchId: new mongoose.Types.ObjectId(),
      };

      // Mock Division.findById
      Division.findById.mockResolvedValue(null);

      // Call controller
      await divisionController.createDivision(req, res, next);

      // Assertions
      expect(Division.findById).toHaveBeenCalledWith(req.body.parentId);
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        status: 'error',
        message: 'Parent division not found',
      });
    });

    it('should handle errors', async () => {
      // Mock request
      req.body = {
        code: 'DIV001',
        name: 'Finance Division',
        description: 'Handles financial operations',
        branchId: new mongoose.Types.ObjectId(),
      };

      // Mock Division.create to throw error
      const error = new Error('Database error');
      Division.create.mockRejectedValue(error);

      // Call controller
      await divisionController.createDivision(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // Additional tests for other controller methods would follow the same pattern
});
