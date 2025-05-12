/**
 * Employee Performance Controller
 * Handles employee performance evaluation operations
 */

const Employee = require('../models/Employee');
const EmployeeHistory = require('../models/EmployeeHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Add performance evaluation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addPerformanceEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluationData = req.body;
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
    
    // Add performance evaluation
    employee.addPerformanceEvaluation(evaluationData);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record performance evaluation in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      'performanceEvaluations',
      employee.performanceEvaluations.slice(0, -1).map(e => e.toObject()),
      employee.performanceEvaluations.map(e => e.toObject()),
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: { 
        evaluation: employee.performanceEvaluations[employee.performanceEvaluations.length - 1],
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error adding performance evaluation for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update performance evaluation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updatePerformanceEvaluation = async (req, res, next) => {
  try {
    const { id, evaluationId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(evaluationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or evaluation ID',
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
    
    // Find evaluation
    const evaluation = employee.performanceEvaluations.id(evaluationId);
    if (!evaluation) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance evaluation not found',
      });
    }
    
    // Store previous evaluation for history
    const previousEvaluation = evaluation.toObject();
    
    // Update evaluation fields
    Object.keys(updateData).forEach(field => {
      if (field !== '_id') {
        evaluation[field] = updateData[field];
      }
    });
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record evaluation update in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      `performanceEvaluations.${evaluationId}`,
      previousEvaluation,
      evaluation.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { evaluation, employee },
    });
  } catch (error) {
    logger.error(`Error updating performance evaluation ${req.params.evaluationId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get employee performance evaluations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeePerformanceEvaluations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Find employee
    const employee = await Employee.findById(id)
      .populate('performanceEvaluations.evaluator', 'employeeId firstName lastName fullName');
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    // Filter evaluations by date if provided
    let evaluations = employee.performanceEvaluations;
    
    if (startDate || endDate) {
      evaluations = evaluations.filter(evaluation => {
        const evalDate = new Date(evaluation.evaluationDate);
        
        if (startDate && endDate) {
          return evalDate >= new Date(startDate) && evalDate <= new Date(endDate);
        } else if (startDate) {
          return evalDate >= new Date(startDate);
        } else if (endDate) {
          return evalDate <= new Date(endDate);
        }
        
        return true;
      });
    }
    
    // Sort evaluations by date (newest first)
    evaluations.sort((a, b) => new Date(b.evaluationDate) - new Date(a.evaluationDate));
    
    res.status(200).json({
      status: 'success',
      data: { evaluations },
    });
  } catch (error) {
    logger.error(`Error getting performance evaluations for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get performance evaluation by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getPerformanceEvaluationById = async (req, res, next) => {
  try {
    const { id, evaluationId } = req.params;
    
    if (!isValidObjectId(id) || !isValidObjectId(evaluationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or evaluation ID',
      });
    }
    
    // Find employee
    const employee = await Employee.findById(id)
      .populate('performanceEvaluations.evaluator', 'employeeId firstName lastName fullName');
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    // Find evaluation
    const evaluation = employee.performanceEvaluations.id(evaluationId);
    if (!evaluation) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance evaluation not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { evaluation },
    });
  } catch (error) {
    logger.error(`Error getting performance evaluation ${req.params.evaluationId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Acknowledge performance evaluation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const acknowledgePerformanceEvaluation = async (req, res, next) => {
  try {
    const { id, evaluationId } = req.params;
    const { comments } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(evaluationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or evaluation ID',
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
    
    // Find evaluation
    const evaluation = employee.performanceEvaluations.id(evaluationId);
    if (!evaluation) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance evaluation not found',
      });
    }
    
    // Store previous acknowledgement for history
    const previousAcknowledgement = evaluation.employeeAcknowledgement.toObject();
    
    // Update acknowledgement
    evaluation.employeeAcknowledgement = {
      acknowledged: true,
      date: new Date(),
      comments: comments || '',
    };
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record acknowledgement update in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      `performanceEvaluations.${evaluationId}.employeeAcknowledgement`,
      previousAcknowledgement,
      evaluation.employeeAcknowledgement.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { evaluation, employee },
    });
  } catch (error) {
    logger.error(`Error acknowledging performance evaluation ${req.params.evaluationId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get performance statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getPerformanceStatistics = async (req, res, next) => {
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
    
    // Get employees with performance evaluations
    const employees = await Employee.find(query)
      .select('employeeId firstName lastName fullName performanceEvaluations positionAssignment.current')
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.divisionId', 'name code')
      .sort({ fullName: 1 });
    
    // Filter evaluations by year if provided
    const filteredEmployees = employees.map(employee => {
      const filteredEvaluations = year ? 
        employee.performanceEvaluations.filter(e => 
          new Date(e.evaluationDate).getFullYear() === parseInt(year)
        ) : 
        employee.performanceEvaluations;
      
      return {
        ...employee.toObject(),
        performanceEvaluations: filteredEvaluations,
      };
    });
    
    // Calculate statistics
    const statistics = {
      totalEmployees: filteredEmployees.length,
      evaluatedEmployees: filteredEmployees.filter(e => e.performanceEvaluations.length > 0).length,
      averageRating: 0,
      ratingDistribution: {
        excellent: 0, // 4.5-5.0
        good: 0,      // 3.5-4.4
        average: 0,   // 2.5-3.4
        belowAverage: 0, // 1.5-2.4
        poor: 0,      // 1.0-1.4
      },
    };
    
    // Calculate average rating and distribution
    let totalRating = 0;
    let ratingCount = 0;
    
    filteredEmployees.forEach(employee => {
      employee.performanceEvaluations.forEach(evaluation => {
        totalRating += evaluation.overallRating;
        ratingCount++;
        
        if (evaluation.overallRating >= 4.5) {
          statistics.ratingDistribution.excellent++;
        } else if (evaluation.overallRating >= 3.5) {
          statistics.ratingDistribution.good++;
        } else if (evaluation.overallRating >= 2.5) {
          statistics.ratingDistribution.average++;
        } else if (evaluation.overallRating >= 1.5) {
          statistics.ratingDistribution.belowAverage++;
        } else {
          statistics.ratingDistribution.poor++;
        }
      });
    });
    
    if (ratingCount > 0) {
      statistics.averageRating = (totalRating / ratingCount).toFixed(2);
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
          evaluationsCount: e.performanceEvaluations.length,
          averageRating: e.performanceEvaluations.length > 0 ? 
            (e.performanceEvaluations.reduce((sum, eval) => sum + eval.overallRating, 0) / 
            e.performanceEvaluations.length).toFixed(2) : null,
        })),
      },
    });
  } catch (error) {
    logger.error('Error getting performance statistics:', error);
    next(error);
  }
};

module.exports = {
  addPerformanceEvaluation,
  updatePerformanceEvaluation,
  getEmployeePerformanceEvaluations,
  getPerformanceEvaluationById,
  acknowledgePerformanceEvaluation,
  getPerformanceStatistics,
};
