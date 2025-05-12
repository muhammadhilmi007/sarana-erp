/**
 * Forwarder Financial Controller
 * Handles forwarder financial settlement tracking operations
 */

const Forwarder = require('../models/Forwarder');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get forwarder financial settlement details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderFinancialDetails = async (req, res, next) => {
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
        financialSettlement: forwarder.financialSettlement || {},
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder financial details ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder financial settlement details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderFinancialDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const financialData = req.body;
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
    
    // Store old financial details for history
    const oldFinancialDetails = { ...forwarder.financialSettlement };
    
    // Update financial settlement details
    forwarder.financialSettlement = {
      ...forwarder.financialSettlement,
      ...financialData,
    };
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'financialSettlement',
      oldFinancialDetails,
      forwarder.financialSettlement,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        financialSettlement: forwarder.financialSettlement,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating forwarder financial details ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder bank details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderBankDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bankData = req.body;
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
    
    // Store old bank details for history
    const oldBankDetails = { ...forwarder.financialSettlement?.bankDetails };
    
    // Update bank details
    forwarder.financialSettlement = {
      ...forwarder.financialSettlement,
      bankDetails: {
        ...forwarder.financialSettlement?.bankDetails,
        ...bankData,
      },
    };
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'bankDetails',
      oldBankDetails,
      forwarder.financialSettlement.bankDetails,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        bankDetails: forwarder.financialSettlement.bankDetails,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating forwarder bank details ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Record invoice for forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const recordForwarderInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { invoiceAmount, invoiceDate, invoiceNumber, dueDate, notes } = req.body;
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
    
    // Store old financial details for history
    const oldFinancialDetails = { ...forwarder.financialSettlement };
    
    // Update current balance
    forwarder.financialSettlement.currentBalance = 
      (forwarder.financialSettlement.currentBalance || 0) + parseFloat(invoiceAmount);
    
    // Update last invoice date
    forwarder.financialSettlement.lastInvoiceDate = invoiceDate || new Date();
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'invoice',
      oldFinancialDetails,
      {
        ...forwarder.financialSettlement,
        invoiceDetails: {
          invoiceNumber,
          invoiceAmount,
          invoiceDate: invoiceDate || new Date(),
          dueDate,
          notes,
        },
      },
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        financialSettlement: forwarder.financialSettlement,
        invoiceDetails: {
          invoiceNumber,
          invoiceAmount,
          invoiceDate: invoiceDate || new Date(),
          dueDate,
          notes,
        },
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error recording forwarder invoice ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Record payment from forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const recordForwarderPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentAmount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;
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
    
    // Store old financial details for history
    const oldFinancialDetails = { ...forwarder.financialSettlement };
    
    // Update current balance
    forwarder.financialSettlement.currentBalance = 
      (forwarder.financialSettlement.currentBalance || 0) - parseFloat(paymentAmount);
    
    // Update last payment details
    forwarder.financialSettlement.lastPaymentDate = paymentDate || new Date();
    forwarder.financialSettlement.lastPaymentAmount = parseFloat(paymentAmount);
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'payment',
      oldFinancialDetails,
      {
        ...forwarder.financialSettlement,
        paymentDetails: {
          paymentAmount,
          paymentDate: paymentDate || new Date(),
          paymentMethod,
          referenceNumber,
          notes,
        },
      },
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        financialSettlement: forwarder.financialSettlement,
        paymentDetails: {
          paymentAmount,
          paymentDate: paymentDate || new Date(),
          paymentMethod,
          referenceNumber,
          notes,
        },
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error recording forwarder payment ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder credit limit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderCreditLimit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { creditLimit, reason } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID',
      });
    }
    
    if (creditLimit === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Credit limit is required',
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
    
    // Store old credit limit for history
    const oldCreditLimit = forwarder.financialSettlement?.creditLimit;
    
    // Update credit limit
    forwarder.financialSettlement = {
      ...forwarder.financialSettlement,
      creditLimit: parseFloat(creditLimit),
    };
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'creditLimit',
      { creditLimit: oldCreditLimit },
      { 
        creditLimit: parseFloat(creditLimit),
        reason,
      },
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        creditLimit: forwarder.financialSettlement.creditLimit,
        oldCreditLimit,
        reason,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating forwarder credit limit ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get forwarders with outstanding balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwardersWithOutstandingBalance = async (req, res, next) => {
  try {
    const { minBalance = 0 } = req.query;
    
    // Find forwarders with outstanding balance
    const forwarders = await Forwarder.find({
      'financialSettlement.currentBalance': { $gt: parseFloat(minBalance) },
      status: 'active',
    })
      .select('name code type financialSettlement')
      .sort({ 'financialSettlement.currentBalance': -1 });
    
    const totalOutstanding = forwarders.reduce(
      (sum, forwarder) => sum + (forwarder.financialSettlement?.currentBalance || 0),
      0
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        count: forwarders.length,
        totalOutstanding,
      },
    });
  } catch (error) {
    logger.error('Error getting forwarders with outstanding balance:', error);
    next(error);
  }
};

/**
 * Get forwarders exceeding credit limit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwardersExceedingCreditLimit = async (req, res, next) => {
  try {
    // Find forwarders exceeding credit limit
    const forwarders = await Forwarder.find({
      $expr: {
        $gt: [
          '$financialSettlement.currentBalance',
          '$financialSettlement.creditLimit',
        ],
      },
      status: 'active',
    })
      .select('name code type financialSettlement')
      .sort({ 'financialSettlement.currentBalance': -1 });
    
    const results = forwarders.map(forwarder => ({
      _id: forwarder._id,
      name: forwarder.name,
      code: forwarder.code,
      type: forwarder.type,
      currentBalance: forwarder.financialSettlement?.currentBalance || 0,
      creditLimit: forwarder.financialSettlement?.creditLimit || 0,
      exceedAmount: (forwarder.financialSettlement?.currentBalance || 0) - 
                    (forwarder.financialSettlement?.creditLimit || 0),
      exceedPercentage: ((forwarder.financialSettlement?.currentBalance || 0) / 
                         (forwarder.financialSettlement?.creditLimit || 1)) * 100,
    }));
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders: results,
        count: results.length,
      },
    });
  } catch (error) {
    logger.error('Error getting forwarders exceeding credit limit:', error);
    next(error);
  }
};

module.exports = {
  getForwarderFinancialDetails,
  updateForwarderFinancialDetails,
  updateForwarderBankDetails,
  recordForwarderInvoice,
  recordForwarderPayment,
  updateForwarderCreditLimit,
  getForwardersWithOutstandingBalance,
  getForwardersExceedingCreditLimit,
};
