/**
 * Forwarder Allocation Controller
 * Handles forwarder shipment allocation and load balancing
 */

const Forwarder = require('../models/Forwarder');
const ForwarderAllocation = require('../models/ForwarderAllocation');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get all allocation strategies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllAllocationStrategies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Execute query with pagination
    const allocationStrategies = await ForwarderAllocation.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await ForwarderAllocation.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        allocationStrategies,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting allocation strategies:', error);
    next(error);
  }
};

/**
 * Get allocation strategy by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllocationStrategyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid allocation strategy ID',
      });
    }
    
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { allocationStrategy },
    });
  } catch (error) {
    logger.error(`Error getting allocation strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create allocation strategy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createAllocationStrategy = async (req, res, next) => {
  try {
    const allocationData = req.body;
    const userId = req.user._id;
    
    // Set created by and updated by
    allocationData.createdBy = userId;
    allocationData.updatedBy = userId;
    
    // Create allocation strategy
    const allocationStrategy = await ForwarderAllocation.create(allocationData);
    
    res.status(201).json({
      status: 'success',
      data: { allocationStrategy },
    });
  } catch (error) {
    logger.error('Error creating allocation strategy:', error);
    next(error);
  }
};

/**
 * Update allocation strategy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateAllocationStrategy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid allocation strategy ID',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Update updatedBy
    updateData.updatedBy = userId;
    
    // Update allocation strategy
    Object.keys(updateData).forEach(key => {
      // Skip rules and allocationHistory, they're handled separately
      if (key !== 'rules' && key !== 'allocationHistory') {
        allocationStrategy[key] = updateData[key];
      }
    });
    
    await allocationStrategy.save();
    
    res.status(200).json({
      status: 'success',
      data: { allocationStrategy },
    });
  } catch (error) {
    logger.error(`Error updating allocation strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete allocation strategy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteAllocationStrategy = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid allocation strategy ID',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Delete allocation strategy
    await allocationStrategy.remove();
    
    res.status(200).json({
      status: 'success',
      message: 'Allocation strategy deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting allocation strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add rule to allocation strategy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addAllocationRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ruleData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid allocation strategy ID',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Add rule
    allocationStrategy.addRule(ruleData);
    allocationStrategy.updatedBy = userId;
    
    await allocationStrategy.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        rule: allocationStrategy.rules[allocationStrategy.rules.length - 1],
        allocationStrategy,
      },
    });
  } catch (error) {
    logger.error(`Error adding rule to allocation strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update allocation rule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateAllocationRule = async (req, res, next) => {
  try {
    const { id, ruleId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(ruleId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Find rule
    const rule = allocationStrategy.rules.id(ruleId);
    
    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Rule not found',
      });
    }
    
    // Update rule
    allocationStrategy.updateRule(ruleId, updateData);
    allocationStrategy.updatedBy = userId;
    
    await allocationStrategy.save();
    
    // Get updated rule
    const updatedRule = allocationStrategy.rules.id(ruleId);
    
    res.status(200).json({
      status: 'success',
      data: {
        rule: updatedRule,
        allocationStrategy,
      },
    });
  } catch (error) {
    logger.error(`Error updating rule ${req.params.ruleId} for allocation strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete allocation rule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteAllocationRule = async (req, res, next) => {
  try {
    const { id, ruleId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(ruleId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Find rule
    const rule = allocationStrategy.rules.id(ruleId);
    
    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Rule not found',
      });
    }
    
    // Remove rule
    allocationStrategy.removeRule(ruleId);
    allocationStrategy.updatedBy = userId;
    
    await allocationStrategy.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Rule deleted successfully',
      data: {
        allocationStrategy,
      },
    });
  } catch (error) {
    logger.error(`Error deleting rule ${req.params.ruleId} for allocation strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add allocation history entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addAllocationHistoryEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const historyData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid allocation strategy ID',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Add history entry
    allocationStrategy.addAllocationHistory(historyData);
    allocationStrategy.updatedBy = userId;
    
    await allocationStrategy.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        historyEntry: allocationStrategy.allocationHistory[allocationStrategy.allocationHistory.length - 1],
        allocationStrategy,
      },
    });
  } catch (error) {
    logger.error(`Error adding history entry to allocation strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get allocation history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllocationHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 30 } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid allocation strategy ID',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Get history entries
    const history = allocationStrategy.allocationHistory || [];
    
    // Sort by date (descending)
    history.sort((a, b) => b.date - a.date);
    
    // Apply limit
    const limitedHistory = history.slice(0, parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      data: {
        history: limitedHistory,
        count: limitedHistory.length,
      },
    });
  } catch (error) {
    logger.error(`Error getting allocation history for strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Allocate shipment to forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const allocateShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shipmentData = req.body;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid allocation strategy ID',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Check if strategy is active
    if (!allocationStrategy.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Allocation strategy is not active',
      });
    }
    
    // Get available forwarders
    const availableForwarders = await Forwarder.find({
      status: 'active',
    });
    
    if (availableForwarders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No active forwarders available',
      });
    }
    
    // Allocate shipment
    const allocation = allocationStrategy.allocateShipment(shipmentData, availableForwarders);
    
    // Add allocation to history
    const historyEntry = {
      date: new Date(),
      allocations: [{
        forwarderId: allocation.forwarder._id,
        shipmentCount: 1,
        totalWeight: shipmentData.weight || 0,
        totalValue: shipmentData.declaredValue || 0,
        performanceScore: allocation.score || 0,
      }],
      rebalanced: false,
      notes: `Shipment allocated using ${allocation.rule || allocation.strategy} strategy`,
    };
    
    allocationStrategy.addAllocationHistory(historyEntry);
    
    await allocationStrategy.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        allocation: {
          forwarder: {
            _id: allocation.forwarder._id,
            name: allocation.forwarder.name,
            code: allocation.forwarder.code,
            type: allocation.forwarder.type,
          },
          rule: allocation.rule,
          strategy: allocation.strategy,
          score: allocation.score,
          isFallback: allocation.isFallback,
        },
        shipment: shipmentData,
      },
    });
  } catch (error) {
    logger.error(`Error allocating shipment using strategy ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Rebalance forwarder allocations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const rebalanceAllocations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid allocation strategy ID',
      });
    }
    
    // Find allocation strategy
    const allocationStrategy = await ForwarderAllocation.findById(id);
    
    if (!allocationStrategy) {
      return res.status(404).json({
        status: 'error',
        message: 'Allocation strategy not found',
      });
    }
    
    // Check if strategy is active
    if (!allocationStrategy.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Allocation strategy is not active',
      });
    }
    
    // Check if load balancing is enabled
    if (!allocationStrategy.loadBalancing.enabled) {
      return res.status(400).json({
        status: 'error',
        message: 'Load balancing is not enabled for this strategy',
      });
    }
    
    // Get available forwarders
    const availableForwarders = await Forwarder.find({
      status: 'active',
    });
    
    if (availableForwarders.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'At least two active forwarders are required for rebalancing',
      });
    }
    
    // Get latest allocation history
    const latestHistory = allocationStrategy.allocationHistory.length > 0
      ? allocationStrategy.allocationHistory[allocationStrategy.allocationHistory.length - 1]
      : null;
    
    if (!latestHistory) {
      return res.status(400).json({
        status: 'error',
        message: 'No allocation history available for rebalancing',
      });
    }
    
    // Calculate forwarder scores
    const scoredForwarders = allocationStrategy.calculateForwarderScores(availableForwarders);
    
    // Sort by score (descending)
    scoredForwarders.sort((a, b) => b.totalScore - a.totalScore);
    
    // Calculate total allocations
    const totalAllocations = latestHistory.allocations.reduce(
      (sum, allocation) => sum + allocation.shipmentCount, 0
    );
    
    // Calculate ideal distribution based on scores
    const totalScore = scoredForwarders.reduce(
      (sum, forwarder) => sum + forwarder.totalScore, 0
    );
    
    const idealDistribution = scoredForwarders.map(forwarder => ({
      forwarderId: forwarder.forwarderId,
      name: forwarder.name,
      idealPercentage: (forwarder.totalScore / totalScore) * 100,
      idealShipments: Math.round((forwarder.totalScore / totalScore) * totalAllocations),
      currentShipments: 0,
      adjustment: 0,
    }));
    
    // Get current distribution
    latestHistory.allocations.forEach(allocation => {
      const forwarder = idealDistribution.find(
        f => f.forwarderId.toString() === allocation.forwarderId.toString()
      );
      
      if (forwarder) {
        forwarder.currentShipments = allocation.shipmentCount;
        forwarder.adjustment = forwarder.idealShipments - forwarder.currentShipments;
      }
    });
    
    // Create rebalanced allocation history
    const rebalancedHistory = {
      date: new Date(),
      allocations: idealDistribution.map(forwarder => ({
        forwarderId: forwarder.forwarderId,
        shipmentCount: forwarder.idealShipments,
        totalWeight: 0, // Would be calculated from actual shipments
        totalValue: 0, // Would be calculated from actual shipments
        performanceScore: scoredForwarders.find(
          f => f.forwarderId.toString() === forwarder.forwarderId.toString()
        )?.totalScore || 0,
      })),
      rebalanced: true,
      notes: 'Allocations rebalanced based on forwarder performance scores',
    };
    
    // Add rebalanced history
    allocationStrategy.addAllocationHistory(rebalancedHistory);
    allocationStrategy.updatedBy = userId;
    
    await allocationStrategy.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        rebalancing: {
          before: latestHistory.allocations,
          after: rebalancedHistory.allocations,
          idealDistribution,
        },
        allocationStrategy,
      },
    });
  } catch (error) {
    logger.error(`Error rebalancing allocations for strategy ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getAllAllocationStrategies,
  getAllocationStrategyById,
  createAllocationStrategy,
  updateAllocationStrategy,
  deleteAllocationStrategy,
  addAllocationRule,
  updateAllocationRule,
  deleteAllocationRule,
  addAllocationHistoryEntry,
  getAllocationHistory,
  allocateShipment,
  rebalanceAllocations,
};
