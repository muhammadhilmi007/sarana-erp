/**
 * Employee Career Controller
 * Handles employee career development operations
 */

const Employee = require('../models/Employee');
const EmployeeHistory = require('../models/EmployeeHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Update employee career path
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateCareerPath = async (req, res, next) => {
  try {
    const { id } = req.params;
    const careerPathData = req.body;
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
    
    // Store previous career path for history
    const previousCareerPath = employee.careerDevelopment && employee.careerDevelopment.careerPath ? 
      employee.careerDevelopment.careerPath.map(cp => cp.toObject()) : [];
    
    // Initialize career development if not exists
    if (!employee.careerDevelopment) {
      employee.careerDevelopment = {};
    }
    
    // Update career path
    employee.careerDevelopment.careerPath = careerPathData;
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record career path update in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      'careerDevelopment.careerPath',
      previousCareerPath,
      employee.careerDevelopment.careerPath.map(cp => cp.toObject()),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { 
        careerPath: employee.careerDevelopment.careerPath,
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error updating career path for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add mentorship record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addMentorship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentorshipData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Validate mentor ID
    if (!isValidObjectId(mentorshipData.mentor)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid mentor ID',
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
    
    // Find mentor
    const mentor = await Employee.findById(mentorshipData.mentor);
    if (!mentor) {
      return res.status(404).json({
        status: 'error',
        message: 'Mentor not found',
      });
    }
    
    // Initialize career development if not exists
    if (!employee.careerDevelopment) {
      employee.careerDevelopment = {};
    }
    
    // Initialize mentorship array if not exists
    if (!employee.careerDevelopment.mentorship) {
      employee.careerDevelopment.mentorship = [];
    }
    
    // Add mentorship record
    employee.careerDevelopment.mentorship.push(mentorshipData);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record mentorship addition in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      'careerDevelopment.mentorship',
      employee.careerDevelopment.mentorship.slice(0, -1).map(m => m.toObject()),
      employee.careerDevelopment.mentorship.map(m => m.toObject()),
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: { 
        mentorship: employee.careerDevelopment.mentorship[employee.careerDevelopment.mentorship.length - 1],
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error adding mentorship for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update mentorship status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateMentorshipStatus = async (req, res, next) => {
  try {
    const { id, mentorshipId } = req.params;
    const { status, endDate } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(mentorshipId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or mentorship ID',
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
    
    // Find mentorship record
    if (!employee.careerDevelopment || !employee.careerDevelopment.mentorship) {
      return res.status(404).json({
        status: 'error',
        message: 'Mentorship records not found',
      });
    }
    
    const mentorship = employee.careerDevelopment.mentorship.id(mentorshipId);
    if (!mentorship) {
      return res.status(404).json({
        status: 'error',
        message: 'Mentorship record not found',
      });
    }
    
    // Store previous mentorship for history
    const previousMentorship = mentorship.toObject();
    
    // Update mentorship status
    mentorship.status = status;
    
    // Update end date if provided or if status is completed/cancelled
    if (endDate) {
      mentorship.endDate = new Date(endDate);
    } else if (status === 'completed' || status === 'cancelled') {
      mentorship.endDate = new Date();
    }
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record mentorship update in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      `careerDevelopment.mentorship.${mentorshipId}`,
      previousMentorship,
      mentorship.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { mentorship, employee },
    });
  } catch (error) {
    logger.error(`Error updating mentorship status for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update successor information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateSuccessorInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const successorData = req.body;
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
    
    // Store previous successor info for history
    const previousSuccessorInfo = employee.careerDevelopment && employee.careerDevelopment.successorFor ? 
      employee.careerDevelopment.successorFor.map(s => s.toObject()) : [];
    
    // Initialize career development if not exists
    if (!employee.careerDevelopment) {
      employee.careerDevelopment = {};
    }
    
    // Update successor information
    employee.careerDevelopment.successorFor = successorData;
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record successor info update in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      'careerDevelopment.successorFor',
      previousSuccessorInfo,
      employee.careerDevelopment.successorFor.map(s => s.toObject()),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { 
        successorInfo: employee.careerDevelopment.successorFor,
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error updating successor info for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get employee career development
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getCareerDevelopment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Find employee with populated references
    const employee = await Employee.findById(id)
      .populate('careerDevelopment.careerPath.targetPosition', 'title code')
      .populate('careerDevelopment.mentorship.mentor', 'employeeId firstName lastName fullName')
      .populate('careerDevelopment.successorFor.positionId', 'title code');
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { 
        careerDevelopment: employee.careerDevelopment || {},
      },
    });
  } catch (error) {
    logger.error(`Error getting career development for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Find successors for position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const findSuccessorsForPosition = async (req, res, next) => {
  try {
    const { positionId } = req.params;
    
    if (!isValidObjectId(positionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid position ID',
      });
    }
    
    // Find employees who are successors for the position
    const employees = await Employee.find({
      'careerDevelopment.successorFor.positionId': positionId,
      'employmentInfo.employmentStatus': 'active',
    })
      .select('employeeId firstName lastName fullName careerDevelopment.successorFor positionAssignment.current')
      .populate('positionAssignment.current.positionId', 'title code')
      .sort({ fullName: 1 });
    
    // Extract successor information
    const successors = employees.map(employee => {
      const successorInfo = employee.careerDevelopment.successorFor.find(
        s => s.positionId.toString() === positionId
      );
      
      return {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        currentPosition: employee.positionAssignment.current.positionId ? 
          employee.positionAssignment.current.positionId.title : null,
        readinessLevel: successorInfo ? successorInfo.readinessLevel : null,
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: { successors },
    });
  } catch (error) {
    logger.error(`Error finding successors for position ${req.params.positionId}:`, error);
    next(error);
  }
};

/**
 * Get succession planning report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getSuccessionPlanningReport = async (req, res, next) => {
  try {
    const { divisionId } = req.query;
    
    // Build query
    const query = {
      'employmentInfo.employmentStatus': 'active',
      'careerDevelopment.successorFor': { $exists: true, $ne: [] },
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
    
    // Get employees with successor information
    const employees = await Employee.find(query)
      .select('employeeId firstName lastName fullName careerDevelopment.successorFor positionAssignment.current')
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.divisionId', 'name code')
      .populate('careerDevelopment.successorFor.positionId', 'title code')
      .sort({ fullName: 1 });
    
    // Build succession planning report
    const successionPlan = employees.map(employee => {
      return {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        currentPosition: employee.positionAssignment.current.positionId ? 
          employee.positionAssignment.current.positionId.title : null,
        division: employee.positionAssignment.current.divisionId ? 
          employee.positionAssignment.current.divisionId.name : null,
        successorFor: employee.careerDevelopment.successorFor.map(successor => ({
          position: successor.positionId ? successor.positionId.title : null,
          readinessLevel: successor.readinessLevel,
        })),
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: { successionPlan },
    });
  } catch (error) {
    logger.error('Error getting succession planning report:', error);
    next(error);
  }
};

module.exports = {
  updateCareerPath,
  addMentorship,
  updateMentorshipStatus,
  updateSuccessorInfo,
  getCareerDevelopment,
  findSuccessorsForPosition,
  getSuccessionPlanningReport,
};
