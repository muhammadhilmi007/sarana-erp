/**
 * Service Area Controller
 * Handles all service area related operations
 */

const ServiceArea = require('../models/ServiceArea');
const ServiceAreaHistory = require('../models/ServiceAreaHistory');
const Branch = require('../models/Branch');
const { logger } = require('../utils/logger');
const { redisClient } = require('../utils/redis');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const toGeoJSON = require('@mapbox/togeojson');
const { DOMParser } = require('xmldom');
const archiver = require('archiver');
const multer = require('multer');
const { promisify } = require('util');

/**
 * Get all service areas with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllServiceAreas = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      type,
      branchId,
      near,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Filter by branch if provided
    if (branchId) {
      query['branches.branchId'] = mongoose.Types.ObjectId(branchId);
    }
    
    // Search by name or code
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Geospatial query if near coordinates provided
    let geoNearPipeline = [];
    if (near && near.longitude && near.latitude) {
      const maxDistance = near.maxDistance || 10; // Default 10km
      geoNearPipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(near.longitude), parseFloat(near.latitude)]
            },
            distanceField: 'distance',
            maxDistance: maxDistance * 1000, // Convert to meters
            spherical: true
          }
        }
      ];
    }
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with or without geoNear
    let serviceAreas;
    let total;
    
    if (geoNearPipeline.length > 0) {
      // Using aggregation pipeline for geospatial queries
      const pipeline = [
        ...geoNearPipeline,
        { $match: query },
        { $sort: sortConfig },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ];
      
      serviceAreas = await ServiceArea.aggregate(pipeline);
      
      // Count total for pagination
      const countPipeline = [
        ...geoNearPipeline,
        { $match: query },
        { $count: 'total' }
      ];
      
      const countResult = await ServiceArea.aggregate(countPipeline);
      total = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      // Standard query without geospatial
      serviceAreas = await ServiceArea.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      total = await ServiceArea.countDocuments(query);
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Return response
    res.status(200).json({
      status: 'success',
      data: {
        serviceAreas,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    logger.error('Error getting service areas:', error);
    next(error);
  }
};

/**
 * Get service area by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getServiceAreaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try to get from cache first
    const cacheKey = `service-area:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json({
        status: 'success',
        data: JSON.parse(cachedData),
        source: 'cache'
      });
    }
    
    // Get from database if not in cache
    const serviceArea = await ServiceArea.findById(id)
      .populate('branches.branchId', 'name code type')
      .lean();
    
    if (!serviceArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Service area not found'
      });
    }
    
    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(serviceArea), 'EX', 3600); // Cache for 1 hour
    
    res.status(200).json({
      status: 'success',
      data: serviceArea,
      source: 'database'
    });
  } catch (error) {
    logger.error('Error getting service area by ID:', error);
    next(error);
  }
};

/**
 * Create a new service area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createServiceArea = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const serviceAreaData = req.body;
    
    // Check for code uniqueness
    const existingArea = await ServiceArea.findOne({ code: serviceAreaData.code });
    if (existingArea) {
      return res.status(400).json({
        status: 'error',
        message: 'Service area code already exists'
      });
    }
    
    // Validate assigned branches exist
    if (serviceAreaData.branches && serviceAreaData.branches.length > 0) {
      const branchIds = serviceAreaData.branches.map(branch => branch.branchId);
      const branches = await Branch.find({ _id: { $in: branchIds } });
      
      if (branches.length !== branchIds.length) {
        return res.status(400).json({
          status: 'error',
          message: 'One or more assigned branches do not exist'
        });
      }
    }
    
    // Check for overlapping service areas if needed
    if (req.query.checkOverlap === 'true') {
      const overlappingAreas = await ServiceArea.find({
        'boundaries.type': 'Polygon',
        status: 'active'
      });
      
      // Implement overlap detection logic
      // This is a simplified check - in production you would use proper geospatial queries
      for (const area of overlappingAreas) {
        // Check if the new area overlaps with existing areas
        // This would be a complex geospatial query in production
        // For now, we'll just log a warning
        logger.warn(`Potential overlap with service area: ${area.name} (${area.code})`);
      }
    }
    
    // Set creator if available
    if (req.user && req.user._id) {
      serviceAreaData.createdBy = req.user._id;
      serviceAreaData.updatedBy = req.user._id;
    }
    
    // Create the service area
    const serviceArea = new ServiceArea(serviceAreaData);
    await serviceArea.save({ session });
    
    // Create history record
    const history = new ServiceAreaHistory({
      serviceAreaId: serviceArea._id,
      action: 'create',
      newValue: serviceArea.toObject(),
      changedBy: req.user ? req.user._id : null,
      changedFields: Object.keys(serviceAreaData),
      reason: req.body.reason || 'Initial creation'
    });
    
    await history.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Clear any related cache
    await redisClient.del('service-areas:list');
    
    res.status(201).json({
      status: 'success',
      data: serviceArea
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error creating service area:', error);
    next(error);
  }
};

/**
 * Update an existing service area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateServiceArea = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find the service area
    const serviceArea = await ServiceArea.findById(id);
    
    if (!serviceArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Service area not found'
      });
    }
    
    // Store old value for history
    const oldValue = serviceArea.toObject();
    
    // Check for code uniqueness if code is being updated
    if (updateData.code && updateData.code !== serviceArea.code) {
      const existingArea = await ServiceArea.findOne({ code: updateData.code });
      if (existingArea) {
        return res.status(400).json({
          status: 'error',
          message: 'Service area code already exists'
        });
      }
    }
    
    // Check for overlapping service areas if boundaries are being updated
    if (updateData.boundaries && req.query.checkOverlap === 'true') {
      const overlappingAreas = await ServiceArea.find({
        _id: { $ne: id },
        'boundaries.type': 'Polygon',
        status: 'active'
      });
      
      // Implement overlap detection logic
      // This is a simplified check - in production you would use proper geospatial queries
      for (const area of overlappingAreas) {
        // Check if the updated area overlaps with existing areas
        logger.warn(`Potential overlap with service area: ${area.name} (${area.code})`);
      }
    }
    
    // Set updater if available
    if (req.user && req.user._id) {
      updateData.updatedBy = req.user._id;
    }
    
    // Update the service area
    const updatedServiceArea = await ServiceArea.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, session }
    );
    
    // Track changed fields
    const changedFields = Object.keys(updateData);
    
    // Create history record
    const history = new ServiceAreaHistory({
      serviceAreaId: serviceArea._id,
      action: 'update',
      oldValue,
      newValue: updatedServiceArea.toObject(),
      changedBy: req.user ? req.user._id : null,
      changedFields,
      reason: req.body.reason || 'Update service area'
    });
    
    await history.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Clear cache
    await redisClient.del(`service-area:${id}`);
    await redisClient.del('service-areas:list');
    
    res.status(200).json({
      status: 'success',
      data: updatedServiceArea
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error updating service area:', error);
    next(error);
  }
};

/**
 * Delete a service area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteServiceArea = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    // Find the service area
    const serviceArea = await ServiceArea.findById(id);
    
    if (!serviceArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Service area not found'
      });
    }
    
    // Store old value for history
    const oldValue = serviceArea.toObject();
    
    // Delete the service area
    await ServiceArea.findByIdAndDelete(id, { session });
    
    // Create history record
    const history = new ServiceAreaHistory({
      serviceAreaId: serviceArea._id,
      action: 'delete',
      oldValue,
      changedBy: req.user ? req.user._id : null,
      reason: req.body.reason || 'Delete service area'
    });
    
    await history.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Clear cache
    await redisClient.del(`service-area:${id}`);
    await redisClient.del('service-areas:list');
    
    res.status(200).json({
      status: 'success',
      message: 'Service area deleted successfully'
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error deleting service area:', error);
    next(error);
  }
};

/**
 * Update service area status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateServiceAreaStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    // Find the service area
    const serviceArea = await ServiceArea.findById(id);
    
    if (!serviceArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Service area not found'
      });
    }
    
    // Store old value for history
    const oldValue = serviceArea.toObject();
    
    // Update the status
    const updatedServiceArea = await ServiceArea.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status,
          updatedBy: req.user ? req.user._id : null 
        } 
      },
      { new: true, runValidators: true, session }
    );
    
    // Create history record
    const history = new ServiceAreaHistory({
      serviceAreaId: serviceArea._id,
      action: 'status_change',
      oldValue,
      newValue: updatedServiceArea.toObject(),
      changedBy: req.user ? req.user._id : null,
      changedFields: ['status'],
      reason: reason || `Status changed to ${status}`
    });
    
    await history.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Clear cache
    await redisClient.del(`service-area:${id}`);
    await redisClient.del('service-areas:list');
    
    res.status(200).json({
      status: 'success',
      data: updatedServiceArea
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error updating service area status:', error);
    next(error);
  }
};

/**
 * Assign a branch to a service area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const assignBranchToServiceArea = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { branchId, isPrimary = false } = req.body;
    
    // Find the service area
    const serviceArea = await ServiceArea.findById(id);
    
    if (!serviceArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Service area not found'
      });
    }
    
    // Verify branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found'
      });
    }
    
    // Store old value for history
    const oldValue = serviceArea.toObject();
    
    // Check if branch is already assigned
    const branchIndex = serviceArea.branches.findIndex(
      b => b.branchId.toString() === branchId
    );
    
    let updatedServiceArea;
    
    if (branchIndex >= 0) {
      // Update existing branch assignment
      serviceArea.branches[branchIndex].isPrimary = isPrimary;
      serviceArea.branches[branchIndex].assignedDate = new Date();
      
      // If this branch is set as primary, set others to non-primary
      if (isPrimary) {
        serviceArea.branches.forEach((b, i) => {
          if (i !== branchIndex) {
            b.isPrimary = false;
          }
        });
      }
      
      updatedServiceArea = await serviceArea.save({ session });
    } else {
      // Add new branch assignment
      const branchAssignment = {
        branchId,
        assignedDate: new Date(),
        isPrimary
      };
      
      // If this branch is set as primary, set others to non-primary
      if (isPrimary) {
        const updateQuery = {
          $set: { 'branches.$[].isPrimary': false },
          $push: { branches: branchAssignment }
        };
        
        updatedServiceArea = await ServiceArea.findByIdAndUpdate(
          id,
          updateQuery,
          { new: true, runValidators: true, session }
        );
      } else {
        updatedServiceArea = await ServiceArea.findByIdAndUpdate(
          id,
          { $push: { branches: branchAssignment } },
          { new: true, runValidators: true, session }
        );
      }
    }
    
    // Create history record
    const history = new ServiceAreaHistory({
      serviceAreaId: serviceArea._id,
      action: 'branch_assignment',
      oldValue,
      newValue: updatedServiceArea.toObject(),
      changedBy: req.user ? req.user._id : null,
      changedFields: ['branches'],
      reason: req.body.reason || `Branch ${branchId} assigned to service area`
    });
    
    await history.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Clear cache
    await redisClient.del(`service-area:${id}`);
    await redisClient.del('service-areas:list');
    
    res.status(200).json({
      status: 'success',
      data: updatedServiceArea
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error assigning branch to service area:', error);
    next(error);
  }
};

/**
 * Remove a branch from a service area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const removeBranchFromServiceArea = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id, branchId } = req.params;
    
    // Find the service area
    const serviceArea = await ServiceArea.findById(id);
    
    if (!serviceArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Service area not found'
      });
    }
    
    // Store old value for history
    const oldValue = serviceArea.toObject();
    
    // Check if branch is assigned
    const branchExists = serviceArea.branches.some(
      b => b.branchId.toString() === branchId
    );
    
    if (!branchExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not assigned to this service area'
      });
    }
    
    // Remove branch assignment
    const updatedServiceArea = await ServiceArea.findByIdAndUpdate(
      id,
      { $pull: { branches: { branchId: mongoose.Types.ObjectId(branchId) } } },
      { new: true, runValidators: true, session }
    );
    
    // Create history record
    const history = new ServiceAreaHistory({
      serviceAreaId: serviceArea._id,
      action: 'branch_assignment',
      oldValue,
      newValue: updatedServiceArea.toObject(),
      changedBy: req.user ? req.user._id : null,
      changedFields: ['branches'],
      reason: req.body.reason || `Branch ${branchId} removed from service area`
    });
    
    await history.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Clear cache
    await redisClient.del(`service-area:${id}`);
    await redisClient.del('service-areas:list');
    
    res.status(200).json({
      status: 'success',
      data: updatedServiceArea
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error removing branch from service area:', error);
    next(error);
  }
};

/**
 * Update service area pricing configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateServiceAreaPricing = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const pricingData = req.body;
    
    // Find the service area
    const serviceArea = await ServiceArea.findById(id);
    
    if (!serviceArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Service area not found'
      });
    }
    
    // Store old value for history
    const oldValue = serviceArea.toObject();
    
    // Update pricing configuration
    const updatedServiceArea = await ServiceArea.findByIdAndUpdate(
      id,
      { 
        $set: { 
          pricing: pricingData,
          updatedBy: req.user ? req.user._id : null 
        } 
      },
      { new: true, runValidators: true, session }
    );
    
    // Create history record
    const history = new ServiceAreaHistory({
      serviceAreaId: serviceArea._id,
      action: 'pricing_update',
      oldValue,
      newValue: updatedServiceArea.toObject(),
      changedBy: req.user ? req.user._id : null,
      changedFields: ['pricing'],
      reason: req.body.reason || 'Pricing configuration updated'
    });
    
    await history.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    // Clear cache
    await redisClient.del(`service-area:${id}`);
    await redisClient.del('service-areas:list');
    
    res.status(200).json({
      status: 'success',
      data: updatedServiceArea
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error updating service area pricing:', error);
    next(error);
  }
};

/**
 * Check if a point is within a service area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkPointInServiceArea = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.query;
    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    
    // Find service areas that contain the point
    const serviceAreas = await ServiceArea.find({
      'boundaries.type': 'Polygon',
      status: 'active'
    });
    
    // Check each service area
    const results = [];
    for (const area of serviceAreas) {
      const isWithin = await area.containsPoint(coordinates);
      if (isWithin) {
        const distance = area.distanceFromCenter(coordinates);
        results.push({
          serviceAreaId: area._id,
          name: area.name,
          code: area.code,
          distance: distance.toFixed(2),
          withinCoverageRadius: distance <= area.coverageRadius
        });
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        point: { longitude, latitude },
        serviceAreas: results,
        count: results.length
      }
    });
  } catch (error) {
    logger.error('Error checking point in service area:', error);
    next(error);
  }
};

/**
 * Get service areas near a location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getServiceAreasByLocation = async (req, res, next) => {
  try {
    const { longitude, latitude, maxDistance = 10 } = req.query; // maxDistance in km
    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    
    // Find service areas near the location using geospatial query
    const serviceAreas = await ServiceArea.find({
      'center': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: maxDistance * 1000 // Convert to meters
        }
      },
      status: 'active'
    }).lean();
    
    // Calculate distance for each service area
    const results = serviceAreas.map(area => {
      const distance = calculateDistance(
        coordinates[1], coordinates[0],
        area.center.coordinates[1], area.center.coordinates[0]
      );
      
      return {
        ...area,
        distance: distance.toFixed(2),
        withinCoverageRadius: distance <= area.coverageRadius
      };
    });
    
    // Sort by distance
    results.sort((a, b) => a.distance - b.distance);
    
    res.status(200).json({
      status: 'success',
      data: {
        point: { longitude, latitude },
        serviceAreas: results,
        count: results.length
      }
    });
  } catch (error) {
    logger.error('Error getting service areas by location:', error);
    next(error);
  }
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {Number} lat1 - Latitude of first point
 * @param {Number} lon1 - Longitude of first point
 * @param {Number} lat2 - Latitude of second point
 * @param {Number} lon2 - Longitude of second point
 * @returns {Number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const radians = (degrees) => degrees * Math.PI / 180;
  const earthRadius = 6371; // Earth's radius in kilometers
  
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(radians(lat1)) * Math.cos(radians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return earthRadius * c;
};

/**
 * Get service area history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getServiceAreaHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, action } = req.query;
    
    // Build query
    const query = { serviceAreaId: id };
    
    // Filter by action if provided
    if (action) {
      query.action = action;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get history records
    const history = await ServiceAreaHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('changedBy', 'name email')
      .lean();
    
    // Count total records
    const total = await ServiceAreaHistory.countDocuments(query);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      status: 'success',
      data: {
        history,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    logger.error('Error getting service area history:', error);
    next(error);
  }
};

/**
 * Get service areas that overlap with a specific service area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getServiceAreaOverlaps = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the service area
    const serviceArea = await ServiceArea.findById(id);
    
    if (!serviceArea) {
      return res.status(404).json({
        status: 'error',
        message: 'Service area not found'
      });
    }
    
    // Find overlapping service areas using geospatial query
    const overlappingAreas = await ServiceArea.find({
      _id: { $ne: id },
      'boundaries.type': 'Polygon',
      status: 'active',
      boundaries: {
        $geoIntersects: {
          $geometry: serviceArea.boundaries
        }
      }
    }).lean();
    
    res.status(200).json({
      status: 'success',
      data: {
        serviceArea: {
          id: serviceArea._id,
          name: serviceArea.name,
          code: serviceArea.code
        },
        overlappingAreas,
        count: overlappingAreas.length
      }
    });
  } catch (error) {
    logger.error('Error getting service area overlaps:', error);
    next(error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    const fileTypes = /csv|json|geojson|kml|xml/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV, GeoJSON, KML, or XML files are allowed'));
    }
  }
}).single('file');

// Promisify multer upload
const uploadMiddleware = promisify(upload);

/**
 * Import service areas from file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const importServiceAreas = async (req, res, next) => {
  try {
    // Handle file upload
    await uploadMiddleware(req, res);
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    
    const { format = 'geojson', overwrite = false } = req.body;
    const filePath = req.file.path;
    
    // Read and parse file based on format
    let serviceAreas = [];
    
    if (format === 'geojson' || format === 'json') {
      // Parse GeoJSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const geoJson = JSON.parse(fileContent);
      
      if (geoJson.type === 'FeatureCollection') {
        serviceAreas = geoJson.features.map(feature => {
          const properties = feature.properties || {};
          
          return {
            name: properties.name || 'Unnamed Area',
            code: properties.code || `SA-${Date.now()}`,
            description: properties.description || '',
            boundaries: feature.geometry,
            center: calculateCentroid(feature.geometry),
            coverageRadius: properties.coverageRadius || 0,
            type: properties.type || 'both',
            status: properties.status || 'active'
          };
        });
      }
    } else if (format === 'csv') {
      // Parse CSV file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const records = parse(fileContent, { columns: true, skip_empty_lines: true });
      
      serviceAreas = records.map(record => {
        // Assuming CSV has columns: name, code, description, type, status, lat, lng, radius
        const lat = parseFloat(record.lat || 0);
        const lng = parseFloat(record.lng || 0);
        const radius = parseFloat(record.radius || 0);
        
        // Create a circular polygon around the point
        const polygon = createCirclePolygon(lat, lng, radius);
        
        return {
          name: record.name || 'Unnamed Area',
          code: record.code || `SA-${Date.now()}`,
          description: record.description || '',
          boundaries: {
            type: 'Polygon',
            coordinates: polygon
          },
          center: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          coverageRadius: radius,
          type: record.type || 'both',
          status: record.status || 'active'
        };
      });
    } else if (format === 'kml') {
      // Parse KML file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const kmlDoc = new DOMParser().parseFromString(fileContent);
      const geoJson = toGeoJSON.kml(kmlDoc);
      
      if (geoJson.type === 'FeatureCollection') {
        serviceAreas = geoJson.features.map(feature => {
          const properties = feature.properties || {};
          
          return {
            name: properties.name || 'Unnamed Area',
            code: properties.code || `SA-${Date.now()}`,
            description: properties.description || '',
            boundaries: feature.geometry,
            center: calculateCentroid(feature.geometry),
            coverageRadius: properties.coverageRadius || 0,
            type: properties.type || 'both',
            status: properties.status || 'active'
          };
        });
      }
    }
    
    // Import service areas to database
    const results = {
      total: serviceAreas.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
    
    for (const areaData of serviceAreas) {
      try {
        // Check if service area with same code exists
        const existingArea = await ServiceArea.findOne({ code: areaData.code });
        
        if (existingArea && overwrite) {
          // Update existing service area
          await ServiceArea.findByIdAndUpdate(
            existingArea._id,
            { $set: areaData },
            { runValidators: true }
          );
          results.updated++;
        } else if (!existingArea) {
          // Create new service area
          await ServiceArea.create(areaData);
          results.created++;
        } else {
          // Skip if exists and overwrite is false
          results.failed++;
          results.errors.push({
            code: areaData.code,
            error: 'Service area with this code already exists'
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          code: areaData.code,
          error: error.message
        });
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    // Clear cache
    await redisClient.del('service-areas:list');
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    // Clean up uploaded file if exists
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    logger.error('Error importing service areas:', error);
    next(error);
  }
};

/**
 * Export service areas to file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const exportServiceAreas = async (req, res, next) => {
  try {
    const { format = 'geojson', status } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Get service areas
    const serviceAreas = await ServiceArea.find(query).lean();
    
    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    let filePath;
    let fileName;
    
    if (format === 'geojson' || format === 'json') {
      // Export as GeoJSON
      fileName = `service-areas-${Date.now()}.geojson`;
      filePath = path.join(exportDir, fileName);
      
      const features = serviceAreas.map(area => ({
        type: 'Feature',
        properties: {
          id: area._id.toString(),
          name: area.name,
          code: area.code,
          description: area.description,
          type: area.type,
          status: area.status,
          coverageRadius: area.coverageRadius
        },
        geometry: area.boundaries
      }));
      
      const geoJson = {
        type: 'FeatureCollection',
        features
      };
      
      fs.writeFileSync(filePath, JSON.stringify(geoJson, null, 2));
    } else if (format === 'csv') {
      // Export as CSV
      fileName = `service-areas-${Date.now()}.csv`;
      filePath = path.join(exportDir, fileName);
      
      const records = serviceAreas.map(area => ({
        id: area._id.toString(),
        name: area.name,
        code: area.code,
        description: area.description,
        type: area.type,
        status: area.status,
        coverageRadius: area.coverageRadius,
        centerLat: area.center.coordinates[1],
        centerLng: area.center.coordinates[0]
      }));
      
      const csv = stringify(records, { header: true });
      fs.writeFileSync(filePath, csv);
    } else if (format === 'zip') {
      // Export as ZIP containing both formats
      fileName = `service-areas-${Date.now()}.zip`;
      filePath = path.join(exportDir, fileName);
      
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Compression level
      });
      
      // Pipe archive data to the output file
      archive.pipe(output);
      
      // Create GeoJSON content
      const features = serviceAreas.map(area => ({
        type: 'Feature',
        properties: {
          id: area._id.toString(),
          name: area.name,
          code: area.code,
          description: area.description,
          type: area.type,
          status: area.status,
          coverageRadius: area.coverageRadius
        },
        geometry: area.boundaries
      }));
      
      const geoJson = {
        type: 'FeatureCollection',
        features
      };
      
      // Create CSV content
      const records = serviceAreas.map(area => ({
        id: area._id.toString(),
        name: area.name,
        code: area.code,
        description: area.description,
        type: area.type,
        status: area.status,
        coverageRadius: area.coverageRadius,
        centerLat: area.center.coordinates[1],
        centerLng: area.center.coordinates[0]
      }));
      
      const csv = stringify(records, { header: true });
      
      // Add files to the archive
      archive.append(JSON.stringify(geoJson, null, 2), { name: 'service-areas.geojson' });
      archive.append(csv, { name: 'service-areas.csv' });
      
      // Finalize the archive
      await archive.finalize();
      
      // Wait for the output stream to finish
      await new Promise((resolve) => {
        output.on('close', resolve);
      });
    }
    
    // Set response headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', getContentType(format));
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Clean up the file after sending
    fileStream.on('end', () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    logger.error('Error exporting service areas:', error);
    next(error);
  }
};

/**
 * Get content type based on format
 * @param {String} format - Export format
 * @returns {String} - Content type
 */
const getContentType = (format) => {
  switch (format) {
    case 'geojson':
    case 'json':
      return 'application/json';
    case 'csv':
      return 'text/csv';
    case 'zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Calculate centroid of a GeoJSON geometry
 * @param {Object} geometry - GeoJSON geometry
 * @returns {Object} - GeoJSON Point
 */
const calculateCentroid = (geometry) => {
  // Simplified centroid calculation - in production you would use a proper geospatial library
  if (geometry.type === 'Polygon') {
    const coordinates = geometry.coordinates[0]; // Outer ring
    let sumX = 0;
    let sumY = 0;
    
    for (const coord of coordinates) {
      sumX += coord[0];
      sumY += coord[1];
    }
    
    return {
      type: 'Point',
      coordinates: [sumX / coordinates.length, sumY / coordinates.length]
    };
  }
  
  // Default to first coordinate if not a polygon
  return {
    type: 'Point',
    coordinates: geometry.coordinates[0] || [0, 0]
  };
};

/**
 * Create a circular polygon around a point
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @param {Number} radiusKm - Radius in kilometers
 * @returns {Array} - Polygon coordinates
 */
const createCirclePolygon = (lat, lng, radiusKm) => {
  const points = 32; // Number of points in the circle
  const earthRadius = 6371; // Earth's radius in kilometers
  const coordinates = [];
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    
    // Convert dx, dy to longitude, latitude offset
    const dLng = dx / (earthRadius * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI);
    const dLat = dy / earthRadius * (180 / Math.PI);
    
    coordinates.push([lng + dLng, lat + dLat]);
  }
  
  // Close the polygon
  coordinates.push(coordinates[0]);
  
  return [coordinates]; // Polygon format: [outer_ring, inner_ring1, inner_ring2, ...]
};

module.exports = {
  getAllServiceAreas,
  getServiceAreaById,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
  updateServiceAreaStatus,
  assignBranchToServiceArea,
  removeBranchFromServiceArea,
  updateServiceAreaPricing,
  checkPointInServiceArea,
  getServiceAreasByLocation,
  getServiceAreaHistory,
  getServiceAreaOverlaps,
  importServiceAreas,
  exportServiceAreas
};
