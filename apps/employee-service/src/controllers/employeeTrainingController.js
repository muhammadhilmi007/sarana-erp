/**
 * Employee Training Controller
 * Handles employee training history operations
 */

const Employee = require('../models/Employee');
const EmployeeHistory = require('../models/EmployeeHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Add training record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addTrainingRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trainingData = req.body;
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
    
    // Add training record
    employee.addTraining(trainingData);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record training addition in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      'trainingHistory',
      employee.trainingHistory.slice(0, -1).map(t => t.toObject()),
      employee.trainingHistory.map(t => t.toObject()),
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: { 
        training: employee.trainingHistory[employee.trainingHistory.length - 1],
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error adding training record for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update training record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateTrainingRecord = async (req, res, next) => {
  try {
    const { id, trainingId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(trainingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or training ID',
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
    
    // Find training record
    const training = employee.trainingHistory.id(trainingId);
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training record not found',
      });
    }
    
    // Store previous training for history
    const previousTraining = training.toObject();
    
    // Update training fields
    Object.keys(updateData).forEach(field => {
      if (field !== '_id') {
        training[field] = updateData[field];
      }
    });
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record training update in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      `trainingHistory.${trainingId}`,
      previousTraining,
      training.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { training, employee },
    });
  } catch (error) {
    logger.error(`Error updating training record ${req.params.trainingId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update training completion status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateTrainingStatus = async (req, res, next) => {
  try {
    const { id, trainingId } = req.params;
    const { status, certificateUrl, feedback } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(trainingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or training ID',
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
    
    // Find training record
    const training = employee.trainingHistory.id(trainingId);
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training record not found',
      });
    }
    
    // Store previous training for history
    const previousTraining = training.toObject();
    
    // Update training status
    training.completionStatus = status;
    
    // Update certificate URL if provided
    if (certificateUrl) {
      training.certificateUrl = certificateUrl;
    }
    
    // Update feedback if provided
    if (feedback) {
      training.feedback = feedback;
    }
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record training update in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      `trainingHistory.${trainingId}`,
      previousTraining,
      training.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { training, employee },
    });
  } catch (error) {
    logger.error(`Error updating training status ${req.params.trainingId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get employee training history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeeTrainingHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, type, status } = req.query;
    
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
    
    // Filter training history
    let trainingHistory = employee.trainingHistory;
    
    if (startDate || endDate) {
      trainingHistory = trainingHistory.filter(training => {
        const trainingDate = new Date(training.startDate);
        
        if (startDate && endDate) {
          return trainingDate >= new Date(startDate) && trainingDate <= new Date(endDate);
        } else if (startDate) {
          return trainingDate >= new Date(startDate);
        } else if (endDate) {
          return trainingDate <= new Date(endDate);
        }
        
        return true;
      });
    }
    
    if (type) {
      trainingHistory = trainingHistory.filter(training => training.type === type);
    }
    
    if (status) {
      trainingHistory = trainingHistory.filter(training => training.completionStatus === status);
    }
    
    // Sort training history by date (newest first)
    trainingHistory.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    res.status(200).json({
      status: 'success',
      data: { trainingHistory },
    });
  } catch (error) {
    logger.error(`Error getting training history for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get training record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getTrainingById = async (req, res, next) => {
  try {
    const { id, trainingId } = req.params;
    
    if (!isValidObjectId(id) || !isValidObjectId(trainingId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or training ID',
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
    
    // Find training record
    const training = employee.trainingHistory.id(trainingId);
    if (!training) {
      return res.status(404).json({
        status: 'error',
        message: 'Training record not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { training },
    });
  } catch (error) {
    logger.error(`Error getting training record ${req.params.trainingId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get training statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getTrainingStatistics = async (req, res, next) => {
  try {
    const { divisionId, branchId, year } = req.query;
    
    // Build query
    const query = {
      'employmentInfo.employmentStatus': 'active',
    };
    
    if (divisionId) {
      if (!isValidObjectId(divisionId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid division ID',
        });
      }
      query['positionAssignment.current.divisionId'] = divisionId;
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
    
    // Get employees with training history
    const employees = await Employee.find(query)
      .select('employeeId firstName lastName fullName trainingHistory positionAssignment.current')
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.divisionId', 'name code')
      .sort({ fullName: 1 });
    
    // Filter training history by year if provided
    const filteredEmployees = employees.map(employee => {
      const filteredTraining = year ? 
        employee.trainingHistory.filter(t => 
          new Date(t.startDate).getFullYear() === parseInt(year)
        ) : 
        employee.trainingHistory;
      
      return {
        ...employee.toObject(),
        trainingHistory: filteredTraining,
      };
    });
    
    // Calculate statistics
    const statistics = {
      totalEmployees: filteredEmployees.length,
      employeesWithTraining: filteredEmployees.filter(e => e.trainingHistory.length > 0).length,
      totalTrainings: filteredEmployees.reduce((sum, e) => sum + e.trainingHistory.length, 0),
      trainingsByType: {
        internal: 0,
        external: 0,
        online: 0,
        conference: 0,
        workshop: 0,
      },
      trainingsByStatus: {
        registered: 0,
        'in-progress': 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
      },
      averageFeedbackRating: 0,
    };
    
    // Calculate training distribution and average feedback
    let totalFeedback = 0;
    let feedbackCount = 0;
    
    filteredEmployees.forEach(employee => {
      employee.trainingHistory.forEach(training => {
        // Count by type
        statistics.trainingsByType[training.type]++;
        
        // Count by status
        statistics.trainingsByStatus[training.completionStatus]++;
        
        // Calculate average feedback
        if (training.feedback && training.feedback.rating) {
          totalFeedback += training.feedback.rating;
          feedbackCount++;
        }
      });
    });
    
    if (feedbackCount > 0) {
      statistics.averageFeedbackRating = (totalFeedback / feedbackCount).toFixed(2);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        statistics,
        employees: filteredEmployees.map(e => ({
          employeeId: e.employeeId,
          fullName: e.fullName,
          position: e.positionAssignment.current.positionId ? 
            e.positionAssignment.current.positionId.title : null,
          division: e.positionAssignment.current.divisionId ? 
            e.positionAssignment.current.divisionId.name : null,
          trainingCount: e.trainingHistory.length,
          completedTrainings: e.trainingHistory.filter(t => t.completionStatus === 'completed').length,
        })),
      },
    });
  } catch (error) {
    logger.error('Error getting training statistics:', error);
    next(error);
  }
};

module.exports = {
  addTrainingRecord,
  updateTrainingRecord,
  updateTrainingStatus,
  getEmployeeTrainingHistory,
  getTrainingById,
  getTrainingStatistics,
};
