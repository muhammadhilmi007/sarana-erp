/**
 * Branch Controller
 * Handles branch management operations
 */

const Branch = require('../models/Branch');
const BranchHistory = require('../models/BranchHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get all branches with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllBranches = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type,
      status = 'active',
      city,
      state,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }
    
    // Execute query with pagination
    const branches = await Branch.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('parentId', 'name code');
    
    // Get total count
    const total = await Branch.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        branches,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting branches:', error);
    next(error);
  }
};

/**
 * Get branch by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    const branch = await Branch.findById(id)
      .populate('parentId', 'name code');
    
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    logger.error(`Error getting branch ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createBranch = async (req, res, next) => {
  try {
    const branchData = req.body;
    const userId = req.user._id;
    
    // Check if parent exists if parentId is provided
    if (branchData.parentId) {
      if (!isValidObjectId(branchData.parentId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid parent branch ID',
        });
      }
      
      const parentBranch = await Branch.findById(branchData.parentId);
      if (!parentBranch) {
        return res.status(404).json({
          status: 'error',
          message: 'Parent branch not found',
        });
      }
    }
    
    // Set created by and updated by
    branchData.createdBy = userId;
    branchData.updatedBy = userId;
    
    // Initialize status history
    branchData.statusHistory = [{
      status: branchData.status || 'active',
      reason: 'Initial creation',
      changedBy: userId,
    }];
    
    // Create branch
    const branch = await Branch.create(branchData);
    
    // Record history
    await BranchHistory.recordCreation(branch._id, branch.toObject(), userId);
    
    res.status(201).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    logger.error('Error creating branch:', error);
    next(error);
  }
};

/**
 * Update branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Check if parent exists if parentId is being updated
    if (updateData.parentId && updateData.parentId !== branch.parentId?.toString()) {
      if (!isValidObjectId(updateData.parentId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid parent branch ID',
        });
      }
      
      // Check for circular reference
      if (updateData.parentId === id) {
        return res.status(400).json({
          status: 'error',
          message: 'Branch cannot be its own parent',
        });
      }
      
      const parentBranch = await Branch.findById(updateData.parentId);
      if (!parentBranch) {
        return res.status(404).json({
          status: 'error',
          message: 'Parent branch not found',
        });
      }
      
      // Check if new parent is a descendant of this branch (would create a cycle)
      const descendants = await branch.getDescendants();
      const descendantIds = descendants.map(d => d._id.toString());
      
      if (descendantIds.includes(updateData.parentId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot set a descendant as parent (would create a cycle)',
        });
      }
    }
    
    // Set updated by
    updateData.updatedBy = userId;
    
    // Record status change if status is being updated
    if (updateData.status && updateData.status !== branch.status) {
      branch.addStatusHistory(
        updateData.status,
        updateData.statusReason || 'Status updated',
        userId
      );
      
      // Record status change history
      await BranchHistory.recordStatusChange(
        branch._id,
        branch.status,
        updateData.status,
        userId,
        updateData.statusReason || 'Status updated'
      );
      
      // Remove status from updateData as it's already handled
      delete updateData.status;
      delete updateData.statusReason;
    }
    
    // Record changes for each field
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'updatedBy' && JSON.stringify(branch[key]) !== JSON.stringify(value)) {
        await BranchHistory.recordUpdate(
          branch._id,
          key,
          branch[key],
          value,
          userId
        );
      }
    }
    
    // Update branch
    Object.assign(branch, updateData);
    await branch.save();
    
    res.status(200).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    logger.error(`Error updating branch ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Check if branch has children
    const children = await branch.getChildren();
    if (children.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete branch with child branches. Please reassign or delete child branches first.',
      });
    }
    
    // Store branch data for history
    const branchData = branch.toObject();
    
    // Delete branch
    await Branch.deleteOne({ _id: id });
    
    // Record deletion in history
    await BranchHistory.recordDeletion(
      id,
      branchData,
      userId,
      req.body.reason || 'Branch deleted'
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting branch ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update branch status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateBranchStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    if (!['active', 'inactive', 'pending', 'closed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: active, inactive, pending, closed',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Check if status is already set
    if (branch.status === status) {
      return res.status(400).json({
        status: 'error',
        message: `Branch status is already ${status}`,
      });
    }
    
    // Update status and add to history
    const oldStatus = branch.status;
    branch.addStatusHistory(status, reason, userId);
    branch.updatedBy = userId;
    await branch.save();
    
    // Record status change in history
    await BranchHistory.recordStatusChange(
      branch._id,
      oldStatus,
      status,
      userId,
      reason || `Status changed from ${oldStatus} to ${status}`
    );
    
    res.status(200).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    logger.error(`Error updating branch status ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get branch hierarchy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getBranchHierarchy = async (req, res, next) => {
  try {
    // Get all branches
    const branches = await Branch.find({ status: 'active' })
      .select('_id name code type parentId level path')
      .sort({ level: 1, name: 1 });
    
    // Build hierarchy
    const hierarchy = [];
    const branchMap = {};
    
    // Create map of branches
    branches.forEach(branch => {
      branchMap[branch._id] = {
        ...branch.toObject(),
        children: [],
      };
    });
    
    // Build tree structure
    branches.forEach(branch => {
      if (branch.parentId && branchMap[branch.parentId]) {
        // Add to parent's children
        branchMap[branch.parentId].children.push(branchMap[branch._id]);
      } else {
        // Root branch
        hierarchy.push(branchMap[branch._id]);
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: { hierarchy },
    });
  } catch (error) {
    logger.error('Error getting branch hierarchy:', error);
    next(error);
  }
};

/**
 * Get branch children
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getBranchChildren = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Get direct children
    const children = await branch.getChildren();
    
    // Get all descendants if requested
    let descendants = [];
    if (req.query.includeDescendants === 'true') {
      descendants = await branch.getDescendants();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        children,
        descendants: req.query.includeDescendants === 'true' ? descendants : undefined,
      },
    });
  } catch (error) {
    logger.error(`Error getting branch children ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get branch ancestors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getBranchAncestors = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Get ancestors
    const ancestors = await branch.getAncestors();
    
    res.status(200).json({
      status: 'success',
      data: { ancestors },
    });
  } catch (error) {
    logger.error(`Error getting branch ancestors ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update branch resources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateBranchResources = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resourceData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Store old resources for history
    const oldResources = { ...branch.resources.toObject() };
    
    // Update resources
    branch.updateResources(resourceData);
    branch.updatedBy = userId;
    await branch.save();
    
    // Record resource update in history
    await BranchHistory.recordResourceUpdate(
      branch._id,
      oldResources,
      branch.resources.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    logger.error(`Error updating branch resources ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update branch performance metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateBranchPerformanceMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const metricsData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Store old metrics for history
    const oldMetrics = { ...branch.performanceMetrics.toObject() };
    
    // Update metrics
    branch.updatePerformanceMetrics(metricsData);
    branch.updatedBy = userId;
    await branch.save();
    
    // Record metrics update in history
    await BranchHistory.recordUpdate(
      branch._id,
      'performanceMetrics',
      oldMetrics,
      branch.performanceMetrics.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    logger.error(`Error updating branch performance metrics ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add branch document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addBranchDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Validate document data
    if (!documentData.name || !documentData.type || !documentData.fileUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Document name, type, and fileUrl are required',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Add document
    branch.addDocument({
      ...documentData,
      uploadDate: new Date(),
    });
    branch.updatedBy = userId;
    await branch.save();
    
    // Get the newly added document
    const newDocument = branch.documents[branch.documents.length - 1];
    
    // Record document addition in history
    await BranchHistory.recordDocumentAdd(
      branch._id,
      newDocument.toObject(),
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: { document: newDocument },
    });
  } catch (error) {
    logger.error(`Error adding branch document ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update branch document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateBranchDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const documentData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(documentId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID or document ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Find document
    const document = branch.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Store old document for history
    const oldDocument = document.toObject();
    
    // Update document
    Object.keys(documentData).forEach(key => {
      if (key !== '_id') {
        document[key] = documentData[key];
      }
    });
    
    branch.updatedBy = userId;
    await branch.save();
    
    // Record document update in history
    await BranchHistory.recordDocumentUpdate(
      branch._id,
      oldDocument,
      document.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { document },
    });
  } catch (error) {
    logger.error(`Error updating branch document ${req.params.id}/${req.params.documentId}:`, error);
    next(error);
  }
};

/**
 * Delete branch document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteBranchDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(documentId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID or document ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Find document
    const document = branch.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Store document for history
    const documentData = document.toObject();
    
    // Remove document
    document.remove();
    branch.updatedBy = userId;
    await branch.save();
    
    // Record document deletion in history
    await BranchHistory.recordUpdate(
      branch._id,
      'documents',
      documentData,
      null,
      userId,
      'Document deleted'
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting branch document ${req.params.id}/${req.params.documentId}:`, error);
    next(error);
  }
};

/**
 * Update branch operational hours
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateBranchOperationalHours = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { operationalHours } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Validate operational hours
    if (!Array.isArray(operationalHours)) {
      return res.status(400).json({
        status: 'error',
        message: 'Operational hours must be an array',
      });
    }
    
    // Check if all required fields are present
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const hours of operationalHours) {
      if (!hours.day || !validDays.includes(hours.day)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid day: ${hours.day}. Must be one of: ${validDays.join(', ')}`,
        });
      }
      
      if (hours.isOpen === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'isOpen field is required for each day',
        });
      }
      
      if (hours.isOpen && (!hours.openTime || !hours.closeTime)) {
        return res.status(400).json({
          status: 'error',
          message: 'openTime and closeTime are required when isOpen is true',
        });
      }
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Store old operational hours for history
    const oldOperationalHours = [...branch.operationalHours];
    
    // Update operational hours
    branch.operationalHours = operationalHours;
    branch.updatedBy = userId;
    await branch.save();
    
    // Record update in history
    await BranchHistory.recordUpdate(
      branch._id,
      'operationalHours',
      oldOperationalHours,
      branch.operationalHours,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    logger.error(`Error updating branch operational hours ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get branch history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getBranchHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch ID',
      });
    }
    
    // Find branch
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        status: 'error',
        message: 'Branch not found',
      });
    }
    
    // Get history with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const history = await BranchHistory.getBranchHistory(id, {
      action,
      startDate,
      endDate,
      limit: parseInt(limit),
      skip,
    });
    
    // Get total count
    const query = { branchId: id };
    if (action) query.action = action;
    if (startDate || endDate) {
      query.performedAt = {};
      if (startDate) query.performedAt.$gte = new Date(startDate);
      if (endDate) query.performedAt.$lte = new Date(endDate);
    }
    
    const total = await BranchHistory.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        history,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error(`Error getting branch history ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get branches by location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getBranchesByLocation = async (req, res, next) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        status: 'error',
        message: 'Longitude and latitude are required',
      });
    }
    
    // Find branches by location
    const branches = await Branch.findByLocation(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(maxDistance)
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        branches,
        count: branches.length,
        center: {
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
        },
        maxDistance: parseInt(maxDistance),
      },
    });
  } catch (error) {
    logger.error('Error getting branches by location:', error);
    next(error);
  }
};

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  updateBranchStatus,
  getBranchHierarchy,
  getBranchChildren,
  getBranchAncestors,
  updateBranchResources,
  updateBranchPerformanceMetrics,
  addBranchDocument,
  updateBranchDocument,
  deleteBranchDocument,
  updateBranchOperationalHours,
  getBranchHistory,
  getBranchesByLocation,
};
