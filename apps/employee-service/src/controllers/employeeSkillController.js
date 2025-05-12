/**
 * Employee Skill Controller
 * Handles employee skills and competencies management operations
 */

const Employee = require('../models/Employee');
const EmployeeHistory = require('../models/EmployeeHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Add or update employee skill
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateEmployeeSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const skillData = req.body;
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
    
    // Find existing skill if any
    const existingSkillIndex = employee.skills.findIndex(s => s.name === skillData.name);
    const previousSkill = existingSkillIndex >= 0 ? employee.skills[existingSkillIndex].toObject() : null;
    
    // Add or update skill
    employee.addSkill(skillData);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record skill update in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      `skills.${skillData.name}`,
      previousSkill,
      employee.skills.find(s => s.name === skillData.name).toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { 
        skill: employee.skills.find(s => s.name === skillData.name),
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error updating employee skill ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Remove employee skill
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const removeEmployeeSkill = async (req, res, next) => {
  try {
    const { id, skillName } = req.params;
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
    
    // Find skill
    const skillIndex = employee.skills.findIndex(s => s.name === skillName);
    if (skillIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found',
      });
    }
    
    // Store skill for history
    const removedSkill = employee.skills[skillIndex].toObject();
    
    // Remove skill
    employee.skills.splice(skillIndex, 1);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record skill removal in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      `skills.${skillName}`,
      removedSkill,
      null,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Skill removed successfully',
      data: { employee },
    });
  } catch (error) {
    logger.error(`Error removing employee skill ${req.params.id}/${req.params.skillName}:`, error);
    next(error);
  }
};

/**
 * Get employee skills
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeeSkills = async (req, res, next) => {
  try {
    const { id } = req.params;
    
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
    
    res.status(200).json({
      status: 'success',
      data: { skills: employee.skills },
    });
  } catch (error) {
    logger.error(`Error getting employee skills ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add certification to employee skill
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addSkillCertification = async (req, res, next) => {
  try {
    const { id, skillName } = req.params;
    const certificationData = req.body;
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
    
    // Find skill
    const skill = employee.skills.find(s => s.name === skillName);
    if (!skill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found',
      });
    }
    
    // Add certification
    skill.certifications.push(certificationData);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record certification addition in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      `skills.${skillName}.certifications`,
      skill.certifications.slice(0, -1).map(c => c.toObject()),
      skill.certifications.map(c => c.toObject()),
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: { 
        certification: skill.certifications[skill.certifications.length - 1],
        skill,
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error adding certification to employee skill ${req.params.id}/${req.params.skillName}:`, error);
    next(error);
  }
};

/**
 * Find employees by skill
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const findEmployeesBySkill = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    const { level, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {
      'skills.name': skillName,
      'employmentInfo.employmentStatus': 'active',
    };
    
    if (level) {
      query['skills.level'] = level;
    }
    
    // Find employees by skill
    const employees = await Employee.find(query)
      .sort({ fullName: 1 })
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
    logger.error(`Error finding employees by skill ${req.params.skillName}:`, error);
    next(error);
  }
};

/**
 * Get skill matrix
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getSkillMatrix = async (req, res, next) => {
  try {
    const { divisionId, branchId } = req.query;
    
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
    
    // Get employees with skills
    const employees = await Employee.find(query)
      .select('employeeId firstName lastName fullName skills positionAssignment.current')
      .populate('positionAssignment.current.positionId', 'title code')
      .sort({ fullName: 1 });
    
    // Collect all unique skills
    const skillSet = new Set();
    employees.forEach(employee => {
      employee.skills.forEach(skill => {
        skillSet.add(skill.name);
      });
    });
    
    const skills = Array.from(skillSet).sort();
    
    // Build skill matrix
    const skillMatrix = employees.map(employee => {
      const employeeSkills = {};
      
      skills.forEach(skillName => {
        const skill = employee.skills.find(s => s.name === skillName);
        employeeSkills[skillName] = skill ? skill.level : null;
      });
      
      return {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        position: employee.positionAssignment.current.positionId ? 
          employee.positionAssignment.current.positionId.title : null,
        skills: employeeSkills,
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        skillMatrix,
        skills,
      },
    });
  } catch (error) {
    logger.error('Error getting skill matrix:', error);
    next(error);
  }
};

module.exports = {
  updateEmployeeSkill,
  removeEmployeeSkill,
  getEmployeeSkills,
  addSkillCertification,
  findEmployeesBySkill,
  getSkillMatrix,
};
