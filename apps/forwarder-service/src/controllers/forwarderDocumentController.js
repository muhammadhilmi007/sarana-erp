/**
 * Forwarder Document Controller
 * Handles forwarder document management operations (contracts, agreements)
 */

const Forwarder = require('../models/Forwarder');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get forwarder documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, isActive } = req.query;
    
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
    
    // Filter documents
    let documents = forwarder.documents || [];
    
    if (type) {
      documents = documents.filter(doc => doc.type === type);
    }
    
    if (isActive !== undefined) {
      documents = documents.filter(doc => doc.isActive === (isActive === 'true'));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        documents,
        count: documents.length,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder documents ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get forwarder document by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderDocumentById = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    
    if (!isValidObjectId(id) || !isValidObjectId(documentId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
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
    
    // Find document
    const document = forwarder.documents.id(documentId);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder document ${req.params.documentId}:`, error);
    next(error);
  }
};

/**
 * Add document to forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addForwarderDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
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
    
    // Add document
    forwarder.addDocument(documentData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record document addition in history
    await ForwarderHistory.recordDocumentAdd(
      forwarder._id,
      forwarder.documents[forwarder.documents.length - 1],
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        document: forwarder.documents[forwarder.documents.length - 1],
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error adding document to forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(documentId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
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
    
    // Find document
    const document = forwarder.documents.id(documentId);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Store old document for history
    const oldDocument = document.toObject();
    
    // Update document
    forwarder.updateDocument(documentId, updateData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated document
    const updatedDocument = forwarder.documents.id(documentId);
    
    // Record document update in history
    await ForwarderHistory.recordDocumentUpdate(
      forwarder._id,
      documentId,
      oldDocument,
      updatedDocument.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        document: updatedDocument,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating document ${req.params.documentId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete forwarder document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteForwarderDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(documentId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
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
    
    // Find document
    const document = forwarder.documents.id(documentId);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Store old document for history
    const oldDocument = document.toObject();
    
    // Remove document
    forwarder.removeDocument(documentId);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record document deletion in history
    await ForwarderHistory.recordDocumentUpdate(
      forwarder._id,
      documentId,
      oldDocument,
      null,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully',
      data: {
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error deleting document ${req.params.documentId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update document status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateDocumentStatus = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const { isActive } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(documentId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
      });
    }
    
    if (isActive === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'isActive status is required',
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
    
    // Find document
    const document = forwarder.documents.id(documentId);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Store old document for history
    const oldDocument = document.toObject();
    
    // Update document status
    forwarder.updateDocument(documentId, { isActive });
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated document
    const updatedDocument = forwarder.documents.id(documentId);
    
    // Record document update in history
    await ForwarderHistory.recordDocumentUpdate(
      forwarder._id,
      documentId,
      oldDocument,
      updatedDocument.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        document: updatedDocument,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating document status ${req.params.documentId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get documents by type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDocumentsByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    // Find forwarders with documents of specified type
    const forwarders = await Forwarder.find({
      'documents.type': type,
      'documents.isActive': true,
    });
    
    // Extract documents of specified type
    const documents = [];
    
    forwarders.forEach(forwarder => {
      const forwarderDocs = forwarder.documents
        .filter(doc => doc.type === type && doc.isActive)
        .map(doc => ({
          ...doc.toObject(),
          forwarderId: forwarder._id,
          forwarderName: forwarder.name,
          forwarderCode: forwarder.code,
        }));
      
      documents.push(...forwarderDocs);
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        documents,
        count: documents.length,
        type,
      },
    });
  } catch (error) {
    logger.error(`Error getting documents by type ${req.params.type}:`, error);
    next(error);
  }
};

/**
 * Get documents expiring soon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDocumentsExpiringSoon = async (req, res, next) => {
  try {
    const { daysThreshold = 30 } = req.query;
    
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + parseInt(daysThreshold));
    
    // Find forwarders with documents expiring soon
    const forwarders = await Forwarder.find({
      'documents.expiryDate': {
        $lte: thresholdDate,
        $gte: new Date(),
      },
      'documents.isActive': true,
    });
    
    // Extract expiring documents
    const documents = [];
    
    forwarders.forEach(forwarder => {
      const expiringDocs = forwarder.documents
        .filter(doc => 
          doc.expiryDate && 
          doc.expiryDate <= thresholdDate && 
          doc.expiryDate >= new Date() && 
          doc.isActive
        )
        .map(doc => ({
          ...doc.toObject(),
          forwarderId: forwarder._id,
          forwarderName: forwarder.name,
          forwarderCode: forwarder.code,
          daysUntilExpiry: Math.ceil((doc.expiryDate - new Date()) / (1000 * 60 * 60 * 24)),
        }));
      
      documents.push(...expiringDocs);
    });
    
    // Sort by expiry date (ascending)
    documents.sort((a, b) => a.expiryDate - b.expiryDate);
    
    res.status(200).json({
      status: 'success',
      data: {
        documents,
        count: documents.length,
        daysThreshold: parseInt(daysThreshold),
      },
    });
  } catch (error) {
    logger.error('Error getting documents expiring soon:', error);
    next(error);
  }
};

module.exports = {
  getForwarderDocuments,
  getForwarderDocumentById,
  addForwarderDocument,
  updateForwarderDocument,
  deleteForwarderDocument,
  updateDocumentStatus,
  getDocumentsByType,
  getDocumentsExpiringSoon,
};
