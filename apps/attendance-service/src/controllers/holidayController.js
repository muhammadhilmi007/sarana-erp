/**
 * Holiday Controller
 * Handles holiday management operations
 */

const mongoose = require('mongoose');
const Holiday = require('../models/Holiday');
const logger = require('../utils/logger');
const { validateHoliday } = require('../validators/holidayValidator');

/**
 * Create a new holiday
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createHoliday = async (req, res) => {
  try {
    // Validate request
    const { error, value } = validateHoliday(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    // Check if holiday with same name and date already exists
    const existingHoliday = await Holiday.findOne({ 
      name: value.name,
      date: new Date(value.date)
    });
    
    if (existingHoliday) {
      return res.status(400).json({
        success: false,
        message: 'Holiday with this name and date already exists'
      });
    }
    
    // Create new holiday
    const holiday = new Holiday({
      ...value,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    await holiday.save();
    
    return res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday
    });
  } catch (error) {
    logger.error('Error in createHoliday:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create holiday',
      error: error.message
    });
  }
};

/**
 * Get holiday by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const holiday = await Holiday.findById(id)
      .populate('branchIds', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: holiday
    });
  } catch (error) {
    logger.error('Error in getHolidayById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get holiday',
      error: error.message
    });
  }
};

/**
 * Get all holidays
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllHolidays = async (req, res) => {
  try {
    const { year, month, type, branchId } = req.query;
    
    // Build query
    const query = {};
    
    // Add year filter if provided
    if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Add month filter if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    // Add branch filter if provided
    if (branchId) {
      query.$or = [
        { branchIds: { $exists: false } }, // Global holidays
        { branchIds: { $size: 0 } }, // Global holidays
        { branchIds: branchId } // Branch-specific holidays
      ];
    }
    
    const holidays = await Holiday.find(query)
      .sort({ date: 1 })
      .populate('branchIds', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    return res.status(200).json({
      success: true,
      count: holidays.length,
      data: holidays
    });
  } catch (error) {
    logger.error('Error in getAllHolidays:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get holidays',
      error: error.message
    });
  }
};

/**
 * Update holiday
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request
    const { error, value } = validateHoliday(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }
    
    // Check if holiday exists
    const holiday = await Holiday.findById(id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }
    
    // Check if name and date are being changed and if new combination already exists
    if ((value.name && value.name !== holiday.name) || 
        (value.date && new Date(value.date).toDateString() !== holiday.date.toDateString())) {
      const existingHoliday = await Holiday.findOne({ 
        name: value.name || holiday.name,
        date: value.date ? new Date(value.date) : holiday.date,
        _id: { $ne: id }
      });
      
      if (existingHoliday) {
        return res.status(400).json({
          success: false,
          message: 'Holiday with this name and date already exists'
        });
      }
    }
    
    // Update holiday
    Object.keys(value).forEach(key => {
      holiday[key] = value[key];
    });
    
    // Update updatedBy
    holiday.updatedBy = req.user.id;
    
    await holiday.save();
    
    return res.status(200).json({
      success: true,
      message: 'Holiday updated successfully',
      data: holiday
    });
  } catch (error) {
    logger.error('Error in updateHoliday:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update holiday',
      error: error.message
    });
  }
};

/**
 * Delete holiday
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if holiday exists
    const holiday = await Holiday.findById(id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }
    
    await holiday.remove();
    
    return res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteHoliday:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: error.message
    });
  }
};

/**
 * Check if a date is a holiday
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.checkHoliday = async (req, res) => {
  try {
    const { date } = req.query;
    const { branchId } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    const checkDate = new Date(date);
    const isHoliday = await Holiday.isHoliday(checkDate, branchId);
    
    if (isHoliday) {
      // Get holiday details
      const holiday = await Holiday.findOne({
        $or: [
          // Single day holiday
          {
            date: {
              $gte: new Date(checkDate.setHours(0, 0, 0, 0)),
              $lte: new Date(checkDate.setHours(23, 59, 59, 999))
            },
            endDate: null
          },
          // Multi-day holiday that includes this date
          {
            date: { $lte: checkDate },
            endDate: { $gte: checkDate }
          }
        ],
        $or: [
          { branchIds: { $exists: false } }, // Global holidays
          { branchIds: { $size: 0 } }, // Global holidays
          { branchIds: branchId } // Branch-specific holidays
        ]
      });
      
      return res.status(200).json({
        success: true,
        isHoliday: true,
        data: holiday
      });
    }
    
    return res.status(200).json({
      success: true,
      isHoliday: false
    });
  } catch (error) {
    logger.error('Error in checkHoliday:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check holiday',
      error: error.message
    });
  }
};

/**
 * Get holidays in a date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHolidaysInRange = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const holidays = await Holiday.getHolidaysInRange(start, end, branchId);
    
    return res.status(200).json({
      success: true,
      count: holidays.length,
      data: holidays
    });
  } catch (error) {
    logger.error('Error in getHolidaysInRange:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get holidays in range',
      error: error.message
    });
  }
};

/**
 * Generate recurring holidays for a year
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateRecurringHolidays = async (req, res) => {
  try {
    const { year } = req.body;
    
    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required'
      });
    }
    
    const results = await Holiday.generateRecurringHolidays(parseInt(year), req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Recurring holidays generated successfully',
      data: {
        year,
        generatedCount: results.filter(r => r.status === 'generated').length,
        alreadyExistsCount: results.filter(r => r.status === 'already_exists').length,
        errorCount: results.filter(r => r.status === 'error').length,
        results
      }
    });
  } catch (error) {
    logger.error('Error in generateRecurringHolidays:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate recurring holidays',
      error: error.message
    });
  }
};

/**
 * Import holidays from CSV
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.importHolidays = async (req, res) => {
  try {
    // This would typically handle a CSV file upload
    // For now, we'll just process the holidays array from the request body
    const { holidays } = req.body;
    
    if (!holidays || !Array.isArray(holidays) || holidays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Holidays array is required'
      });
    }
    
    const results = [];
    
    for (const holidayData of holidays) {
      try {
        // Validate each holiday
        const { error, value } = validateHoliday(holidayData);
        if (error) {
          results.push({
            name: holidayData.name,
            date: holidayData.date,
            success: false,
            message: error.details[0].message
          });
          continue;
        }
        
        // Check if holiday already exists
        const existingHoliday = await Holiday.findOne({ 
          name: value.name,
          date: new Date(value.date)
        });
        
        if (existingHoliday) {
          results.push({
            name: value.name,
            date: value.date,
            success: false,
            message: 'Holiday already exists'
          });
          continue;
        }
        
        // Create new holiday
        const holiday = new Holiday({
          ...value,
          createdBy: req.user.id,
          updatedBy: req.user.id
        });
        
        await holiday.save();
        
        results.push({
          name: value.name,
          date: value.date,
          success: true,
          message: 'Holiday created successfully'
        });
      } catch (error) {
        results.push({
          name: holidayData.name,
          date: holidayData.date,
          success: false,
          message: error.message
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Holidays import completed',
      data: {
        totalProcessed: holidays.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        results
      }
    });
  } catch (error) {
    logger.error('Error in importHolidays:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to import holidays',
      error: error.message
    });
  }
};

module.exports = exports;
