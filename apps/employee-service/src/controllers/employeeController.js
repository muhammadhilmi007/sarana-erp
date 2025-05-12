/**
 * Employee Controller
 * Handles employee management operations
 */

const Employee = require('../models/Employee');
const EmployeeHistory = require('../models/EmployeeHistory');
const EmployeeDocument = require('../models/EmployeeDocument');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get all employees with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'active',
      branchId,
      divisionId,
      positionId,
      sortBy = 'fullName',
      sortOrder = 'asc',
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } },
        { 'contactInfo.phoneNumber': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) {
      query['employmentInfo.employmentStatus'] = status;
    }
    
    if (branchId) {
      if (!isValidObjectId(branchId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid branch ID',
        });
      }
      query['positionAssignment.current.branchId'] = branchId;
    }
    
    if (divisionId) {
      if (!isValidObjectId(divisionId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid division ID',
        });
      }
      query['positionAssignment.current.divisionId'] = divisionId;
    }
    
    if (positionId) {
      if (!isValidObjectId(positionId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid position ID',
        });
      }
      query['positionAssignment.current.positionId'] = positionId;
    }
    
    // Execute query with pagination
    const employees = await Employee.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.branchId', 'name code')
      .populate('positionAssignment.current.divisionId', 'name code');
    
    // Get total count
    const total = await Employee.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        employees,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting employees:', error);
    next(error);
  }
};

/**
 * Get employee by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    const employee = await Employee.findById(id)
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.branchId', 'name code')
      .populate('positionAssignment.current.divisionId', 'name code')
      .populate('userId', 'username email');
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { employee },
    });
  } catch (error) {
    logger.error(`Error getting employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createEmployee = async (req, res, next) => {
  try {
    const employeeData = req.body;
    const userId = req.user._id;
    
    // Check if position exists
    if (employeeData.positionAssignment && employeeData.positionAssignment.current) {
      const { positionId, branchId, divisionId } = employeeData.positionAssignment.current;
      
      if (!isValidObjectId(positionId) || !isValidObjectId(branchId) || !isValidObjectId(divisionId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid position, branch, or division ID',
        });
      }
    }
    
    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeId: employeeData.employeeId });
    if (existingEmployee) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID already exists',
      });
    }
    
    // Check if user ID already associated with another employee
    if (employeeData.userId) {
      const existingUserEmployee = await Employee.findOne({ userId: employeeData.userId });
      if (existingUserEmployee) {
        return res.status(400).json({
          status: 'error',
          message: 'User already associated with another employee',
        });
      }
    }
    
    // Add system fields
    employeeData.createdBy = userId;
    employeeData.updatedBy = userId;
    
    // Create employee
    const employee = await Employee.create(employeeData);
    
    // Record creation in history
    await EmployeeHistory.recordCreation(employee._id, employee.toObject(), userId);
    
    res.status(201).json({
      status: 'success',
      data: { employee },
    });
  } catch (error) {
    logger.error('Error creating employee:', error);
    next(error);
  }
};

/**
 * Update employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    // Check if employee ID is being changed and if it already exists
    if (updateData.employeeId && updateData.employeeId !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({ employeeId: updateData.employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          status: 'error',
          message: 'Employee ID already exists',
        });
      }
    }
    
    // Check if user ID is being changed and if it already associated with another employee
    if (updateData.userId && (!employee.userId || updateData.userId.toString() !== employee.userId.toString())) {
      const existingUserEmployee = await Employee.findOne({ userId: updateData.userId });
      if (existingUserEmployee) {
        return res.status(400).json({
          status: 'error',
          message: 'User already associated with another employee',
        });
      }
    }
    
    // Store previous values for history
    const previousValues = {};
    
    // Update fields and record history
    Object.keys(updateData).forEach(field => {
      if (field !== '_id' && field !== 'createdAt' && field !== 'updatedAt' && field !== 'createdBy') {
        previousValues[field] = employee[field];
        employee[field] = updateData[field];
      }
    });
    
    // Update system fields
    employee.updatedBy = userId;
    
    // Save changes
    await employee.save();
    
    // Record update in history
    for (const field in previousValues) {
      await EmployeeHistory.recordUpdate(
        employee._id,
        field,
        previousValues[field],
        employee[field],
        userId
      );
    }
    
    res.status(200).json({
      status: 'success',
      data: { employee },
    });
  } catch (error) {
    logger.error(`Error updating employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    // Store employee data for history
    const employeeData = employee.toObject();
    
    // Delete employee
    await employee.remove();
    
    // Record deletion in history
    await EmployeeHistory.recordDeletion(id, employeeData, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting employee ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
