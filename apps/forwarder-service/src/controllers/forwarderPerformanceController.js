/**
 * Forwarder Performance Controller
 * Handles forwarder performance tracking and SLA monitoring
 */

const Forwarder = require('../models/Forwarder');
const ForwarderPerformance = require('../models/ForwarderPerformance');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get forwarder performance metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderPerformanceMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        performanceMetrics: forwarder.performanceMetrics || {},
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder performance metrics ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder performance metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderPerformanceMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const metricsData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Store old metrics for history
    const oldMetrics = { ...forwarder.performanceMetrics };
    
    // Update performance metrics
    forwarder.updatePerformanceMetrics(metricsData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'performanceMetrics',
      oldMetrics,
      forwarder.performanceMetrics,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        performanceMetrics: forwarder.performanceMetrics,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating forwarder performance metrics ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get forwarder performance reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderPerformanceReports = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', limit = 12 } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Get performance history
    const performanceHistory = await ForwarderPerformance.getPerformanceHistory(
      id,
      period,
      parseInt(limit)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        performanceHistory,
        period,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder performance reports ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get forwarder performance report by period
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderPerformanceReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', date = new Date() } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Get performance report for period
    const performanceReport = await ForwarderPerformance.findByForwarderAndPeriod(
      id,
      period,
      new Date(date)
    );
    
    if (!performanceReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance report not found for the specified period',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        performanceReport,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder performance report ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create forwarder performance report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createForwarderPerformanceReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reportData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Set forwarder ID and metadata
    reportData.forwarderId = id;
    reportData.createdBy = userId;
    reportData.updatedBy = userId;
    
    // Create performance report
    const performanceReport = await ForwarderPerformance.create(reportData);
    
    // Calculate performance score and SLA compliance
    performanceReport.calculatePerformanceScore();
    performanceReport.calculateSLACompliance();
    
    // Generate recommendations
    performanceReport.generateRecommendations();
    
    await performanceReport.save();
    
    // Update forwarder performance metrics
    forwarder.updatePerformanceMetrics({
      onTimeDeliveryRate: performanceReport.deliveryPerformance.onTimeDeliveryRate,
      damageRate: performanceReport.qualityMetrics.damageRate,
      lossRate: performanceReport.qualityMetrics.lossRate,
      averageDeliveryTime: performanceReport.deliveryPerformance.averageDeliveryTime,
      customerComplaintRate: performanceReport.customerExperience.complaintRate,
      lastUpdated: new Date(),
    });
    
    forwarder.updatedBy = userId;
    await forwarder.save();
    
    // Record update in forwarder history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'performanceMetrics',
      { performanceMetrics: forwarder.performanceMetrics },
      { performanceMetrics: forwarder.performanceMetrics },
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        performanceReport,
      },
    });
  } catch (error) {
    logger.error(`Error creating forwarder performance report ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder performance report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderPerformanceReport = async (req, res, next) => {
  try {
    const { id, reportId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(reportId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find performance report
    const performanceReport = await ForwarderPerformance.findById(reportId);
    
    if (!performanceReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance report not found',
      });
    }
    
    // Verify forwarder ID
    if (performanceReport.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Performance report does not belong to this forwarder',
      });
    }
    
    // Check if report is already finalized
    if (performanceReport.isFinalized) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update a finalized performance report',
      });
    }
    
    // Update performance report
    Object.keys(updateData).forEach(key => {
      performanceReport[key] = updateData[key];
    });
    
    performanceReport.updatedBy = userId;
    
    // Recalculate performance score and SLA compliance
    performanceReport.calculatePerformanceScore();
    performanceReport.calculateSLACompliance();
    
    // Regenerate recommendations
    performanceReport.generateRecommendations();
    
    await performanceReport.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        performanceReport,
      },
    });
  } catch (error) {
    logger.error(`Error updating forwarder performance report ${req.params.reportId}:`, error);
    next(error);
  }
};

/**
 * Finalize forwarder performance report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const finalizeForwarderPerformanceReport = async (req, res, next) => {
  try {
    const { id, reportId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(reportId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    // Find performance report
    const performanceReport = await ForwarderPerformance.findById(reportId);
    
    if (!performanceReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance report not found',
      });
    }
    
    // Verify forwarder ID
    if (performanceReport.forwarderId.toString() !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'Performance report does not belong to this forwarder',
      });
    }
    
    // Check if report is already finalized
    if (performanceReport.isFinalized) {
      return res.status(400).json({
        status: 'error',
        message: 'Performance report is already finalized',
      });
    }
    
    // Finalize report
    performanceReport.finalizeReport(userId);
    
    await performanceReport.save();
    
    // Update forwarder performance metrics
    const forwarder = await Forwarder.findById(id);
    
    if (forwarder) {
      forwarder.updatePerformanceMetrics({
        onTimeDeliveryRate: performanceReport.deliveryPerformance.onTimeDeliveryRate,
        damageRate: performanceReport.qualityMetrics.damageRate,
        lossRate: performanceReport.qualityMetrics.lossRate,
        averageDeliveryTime: performanceReport.deliveryPerformance.averageDeliveryTime,
        customerComplaintRate: performanceReport.customerExperience.complaintRate,
        lastUpdated: new Date(),
      });
      
      forwarder.updatedBy = userId;
      await forwarder.save();
      
      // Record update in forwarder history
      await ForwarderHistory.recordUpdate(
        forwarder._id,
        'performanceMetrics',
        { performanceMetrics: forwarder.performanceMetrics },
        { performanceMetrics: forwarder.performanceMetrics },
        userId
      );
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        performanceReport,
      },
    });
  } catch (error) {
    logger.error(`Error finalizing forwarder performance report ${req.params.reportId}:`, error);
    next(error);
  }
};

/**
 * Get top performing forwarders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getTopPerformingForwarders = async (req, res, next) => {
  try {
    const { period = 'monthly', metric = 'overall', limit = 10 } = req.query;
    
    // Get top performers
    const topPerformers = await ForwarderPerformance.getTopPerformers(
      period,
      metric,
      parseInt(limit)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        topPerformers,
        period,
        metric,
      },
    });
  } catch (error) {
    logger.error('Error getting top performing forwarders:', error);
    next(error);
  }
};

/**
 * Get forwarder SLA compliance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderSLACompliance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', date = new Date() } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Get performance report for period
    const performanceReport = await ForwarderPerformance.findByForwarderAndPeriod(
      id,
      period,
      new Date(date)
    );
    
    if (!performanceReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance report not found for the specified period',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        slaCompliance: performanceReport.slaCompliance || {},
        period,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder SLA compliance ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get forwarder performance recommendations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderPerformanceRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', date = new Date() } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Get performance report for period
    const performanceReport = await ForwarderPerformance.findByForwarderAndPeriod(
      id,
      period,
      new Date(date)
    );
    
    if (!performanceReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Performance report not found for the specified period',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        recommendations: performanceReport.recommendations || [],
        period,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder performance recommendations ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Analyze forwarder performance trends
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const analyzeForwarderPerformanceTrends = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', limit = 12 } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    // Find forwarder
    const forwarder = await Forwarder.findById(id);
    
    if (!forwarder) {
      return res.status(404).json({
        status: 'error',
        message: 'Forwarder not found',
      });
    }
    
    // Get performance history
    const performanceHistory = await ForwarderPerformance.getPerformanceHistory(
      id,
      period,
      parseInt(limit)
    );
    
    if (performanceHistory.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient data for trend analysis',
      });
    }
    
    // Get latest report
    const latestReport = performanceHistory[0];
    
    // Get previous report
    const previousReport = performanceHistory[1];
    
    // Analyze trends
    const trends = latestReport.analyzeTrends(previousReport);
    
    // Prepare trend data
    const trendData = {
      trends,
      period,
      metrics: {
        onTimeDelivery: {
          current: latestReport.deliveryPerformance.onTimeDeliveryRate,
          previous: previousReport.deliveryPerformance.onTimeDeliveryRate,
          change: latestReport.deliveryPerformance.onTimeDeliveryRate - previousReport.deliveryPerformance.onTimeDeliveryRate,
        },
        damage: {
          current: latestReport.qualityMetrics.damageRate,
          previous: previousReport.qualityMetrics.damageRate,
          change: previousReport.qualityMetrics.damageRate - latestReport.qualityMetrics.damageRate,
        },
        cost: {
          current: latestReport.financialMetrics.averageCostPerShipment,
          previous: previousReport.financialMetrics.averageCostPerShipment,
          change: previousReport.financialMetrics.averageCostPerShipment - latestReport.financialMetrics.averageCostPerShipment,
        },
        volume: {
          current: latestReport.volumeMetrics.totalShipments,
          previous: previousReport.volumeMetrics.totalShipments,
          change: latestReport.volumeMetrics.totalShipments - previousReport.volumeMetrics.totalShipments,
        },
        satisfaction: {
          current: latestReport.customerExperience.satisfactionScore,
          previous: previousReport.customerExperience.satisfactionScore,
          change: latestReport.customerExperience.satisfactionScore - previousReport.customerExperience.satisfactionScore,
        },
      },
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        trendData,
      },
    });
  } catch (error) {
    logger.error(`Error analyzing forwarder performance trends ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getForwarderPerformanceMetrics,
  updateForwarderPerformanceMetrics,
  getForwarderPerformanceReports,
  getForwarderPerformanceReport,
  createForwarderPerformanceReport,
  updateForwarderPerformanceReport,
  finalizeForwarderPerformanceReport,
  getTopPerformingForwarders,
  getForwarderSLACompliance,
  getForwarderPerformanceRecommendations,
  analyzeForwarderPerformanceTrends,
};
