/**
 * Employee Contract Controller
 * Handles employee contract management operations
 */

const Employee = require('../models/Employee');
const EmployeeHistory = require('../models/EmployeeHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Add employee contract
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contractData = req.body;
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
    
    // Add contract
    employee.addContract(contractData);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record contract addition in history
    await EmployeeHistory.recordUpdate(
      employee._id,
      'contracts',
      employee.contracts.slice(0, -1).map(c => c.toObject()),
      employee.contracts.map(c => c.toObject()),
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: { 
        contract: employee.contracts[employee.contracts.length - 1],
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error adding contract for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update contract status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateContractStatus = async (req, res, next) => {
  try {
    const { id, contractId } = req.params;
    const { status, reason } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(contractId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or contract ID',
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
    
    // Find contract
    const contract = employee.contracts.id(contractId);
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contract not found',
      });
    }
    
    // Store previous contract for history
    const previousContract = contract.toObject();
    
    // Update contract status
    employee.updateContractStatus(contractId, status, reason);
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record contract update in history
    await EmployeeHistory.recordContractUpdate(
      employee._id,
      contractId,
      previousContract,
      employee.contracts.id(contractId).toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { 
        contract: employee.contracts.id(contractId),
        employee 
      },
    });
  } catch (error) {
    logger.error(`Error updating contract status ${req.params.contractId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update contract details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateContractDetails = async (req, res, next) => {
  try {
    const { id, contractId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(contractId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or contract ID',
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
    
    // Find contract
    const contract = employee.contracts.id(contractId);
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contract not found',
      });
    }
    
    // Store previous contract for history
    const previousContract = contract.toObject();
    
    // Update contract fields
    Object.keys(updateData).forEach(field => {
      if (field !== '_id' && field !== 'status') {
        contract[field] = updateData[field];
      }
    });
    
    // Save changes
    employee.updatedBy = userId;
    await employee.save();
    
    // Record contract update in history
    await EmployeeHistory.recordContractUpdate(
      employee._id,
      contractId,
      previousContract,
      contract.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { contract, employee },
    });
  } catch (error) {
    logger.error(`Error updating contract details ${req.params.contractId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get employee contracts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeeContracts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
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
    
    // Filter contracts by status if provided
    let contracts = employee.contracts;
    
    if (status) {
      contracts = contracts.filter(contract => contract.status === status);
    }
    
    // Sort contracts by start date (newest first)
    contracts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    res.status(200).json({
      status: 'success',
      data: { contracts },
    });
  } catch (error) {
    logger.error(`Error getting contracts for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get contract by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getContractById = async (req, res, next) => {
  try {
    const { id, contractId } = req.params;
    
    if (!isValidObjectId(id) || !isValidObjectId(contractId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID or contract ID',
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
    
    // Find contract
    const contract = employee.contracts.id(contractId);
    if (!contract) {
      return res.status(404).json({
        status: 'error',
        message: 'Contract not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { contract },
    });
  } catch (error) {
    logger.error(`Error getting contract ${req.params.contractId} for employee ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get contracts expiring soon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getContractsExpiringSoon = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));
    
    // Find employees with contracts expiring soon
    const employees = await Employee.find({
      'contracts.status': 'active',
      'contracts.endDate': { $gte: today, $lte: futureDate },
      'employmentInfo.employmentStatus': 'active',
    })
      .select('employeeId firstName lastName fullName contracts positionAssignment.current')
      .populate('positionAssignment.current.positionId', 'title code')
      .populate('positionAssignment.current.branchId', 'name code')
      .populate('positionAssignment.current.divisionId', 'name code')
      .sort({ 'contracts.endDate': 1 });
    
    // Extract expiring contracts
    const expiringContracts = [];
    
    employees.forEach(employee => {
      const contracts = employee.contracts.filter(contract => 
        contract.status === 'active' && 
        contract.endDate && 
        contract.endDate >= today && 
        contract.endDate <= futureDate
      );
      
      contracts.forEach(contract => {
        expiringContracts.push({
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          position: employee.positionAssignment.current.positionId ? 
            employee.positionAssignment.current.positionId.title : null,
          branch: employee.positionAssignment.current.branchId ? 
            employee.positionAssignment.current.branchId.name : null,
          division: employee.positionAssignment.current.divisionId ? 
            employee.positionAssignment.current.divisionId.name : null,
          contractId: contract._id,
          contractType: contract.type,
          startDate: contract.startDate,
          endDate: contract.endDate,
          daysRemaining: Math.ceil((contract.endDate - today) / (1000 * 60 * 60 * 24)),
        });
      });
    });
    
    // Sort by days remaining
    expiringContracts.sort((a, b) => a.daysRemaining - b.daysRemaining);
    
    res.status(200).json({
      status: 'success',
      data: { expiringContracts },
    });
  } catch (error) {
    logger.error('Error getting contracts expiring soon:', error);
    next(error);
  }
};

/**
 * Get contract statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getContractStatistics = async (req, res, next) => {
  try {
    const { divisionId, branchId } = req.query;
    
    // Base match condition
    const matchCondition = {};
    
    // Add division filter if provided
    if (divisionId && isValidObjectId(divisionId)) {
      matchCondition['positionAssignment.current.divisionId'] = new mongoose.Types.ObjectId(divisionId);
    }
    
    // Add branch filter if provided
    if (branchId && isValidObjectId(branchId)) {
      matchCondition['positionAssignment.current.branchId'] = new mongoose.Types.ObjectId(branchId);
    }
    
    // Get contract statistics
    const statistics = await Employee.aggregate([
      { $match: matchCondition },
      { $unwind: '$contracts' },
      {
        $group: {
          _id: '$contracts.status',
          count: { $sum: 1 },
          contracts: {
            $push: {
              employeeId: '$employeeId',
              fullName: { $concat: ['$firstName', ' ', '$lastName'] },
              contractType: '$contracts.contractType',
              startDate: '$contracts.startDate',
              endDate: '$contracts.endDate',
              status: '$contracts.status'
            }
          }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          contracts: 1,
          _id: 0
        }
      }
    ]);
    
    // Get contract type statistics
    const contractTypeStats = await Employee.aggregate([
      { $match: matchCondition },
      { $unwind: '$contracts' },
      {
        $group: {
          _id: '$contracts.contractType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          contractType: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Calculate expiring contracts in next 30, 60, 90 days
    const today = new Date();
    const thirtyDays = new Date(today);
    thirtyDays.setDate(today.getDate() + 30);
    const sixtyDays = new Date(today);
    sixtyDays.setDate(today.getDate() + 60);
    const ninetyDays = new Date(today);
    ninetyDays.setDate(today.getDate() + 90);
    
    const expiringStats = await Employee.aggregate([
      { $match: matchCondition },
      { $unwind: '$contracts' },
      {
        $match: {
          'contracts.status': 'active',
          'contracts.endDate': { $ne: null }
        }
      },
      {
        $project: {
          employeeId: 1,
          fullName: { $concat: ['$firstName', ' ', '$lastName'] },
          contractType: '$contracts.contractType',
          endDate: '$contracts.endDate',
          expiresIn30Days: {
            $cond: [
              { $and: [
                { $gte: ['$contracts.endDate', today] },
                { $lte: ['$contracts.endDate', thirtyDays] }
              ]},
              1,
              0
            ]
          },
          expiresIn60Days: {
            $cond: [
              { $and: [
                { $gt: ['$contracts.endDate', thirtyDays] },
                { $lte: ['$contracts.endDate', sixtyDays] }
              ]},
              1,
              0
            ]
          },
          expiresIn90Days: {
            $cond: [
              { $and: [
                { $gt: ['$contracts.endDate', sixtyDays] },
                { $lte: ['$contracts.endDate', ninetyDays] }
              ]},
              1,
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          expiringIn30Days: { $sum: '$expiresIn30Days' },
          expiringIn60Days: { $sum: '$expiresIn60Days' },
          expiringIn90Days: { $sum: '$expiresIn90Days' },
          expiringContracts: {
            $push: {
              $cond: [
                { $or: ['$expiresIn30Days', '$expiresIn60Days', '$expiresIn90Days'] },
                {
                  employeeId: '$employeeId',
                  fullName: '$fullName',
                  contractType: '$contractType',
                  endDate: '$endDate',
                  daysRemaining: {
                    $ceil: { $divide: [{ $subtract: ['$endDate', today] }, 86400000] }
                  }
                },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          expiringIn30Days: 1,
          expiringIn60Days: 1,
          expiringIn90Days: 1,
          expiringContracts: {
            $filter: {
              input: '$expiringContracts',
              as: 'contract',
              cond: { $ne: ['$$contract', null] }
            }
          }
        }
      }
    ]);
    
    // Prepare response
    const response = {
      statusStats: statistics,
      contractTypeStats: contractTypeStats,
      expiringStats: expiringStats.length > 0 ? expiringStats[0] : {
        expiringIn30Days: 0,
        expiringIn60Days: 0,
        expiringIn90Days: 0,
        expiringContracts: []
      }
    };
    
    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (error) {
    logger.error('Error getting contract statistics:', error);
    next(error);
  }
};

module.exports = {
  addContract,
  updateContractStatus,
  updateContractDetails,
  getEmployeeContracts,
  getContractById,
  getContractsExpiringSoon,
  getContractStatistics
};
