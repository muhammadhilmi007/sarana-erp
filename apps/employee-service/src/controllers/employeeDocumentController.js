/**
 * Employee Document Controller
 * Handles employee document management operations
 */

const Employee = require('../models/Employee');
const EmployeeDocument = require('../models/EmployeeDocument');
const EmployeeHistory = require('../models/EmployeeHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Upload employee document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const documentData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    // Check if document with same type already exists
    const existingDocument = await EmployeeDocument.findOne({
      employeeId,
      documentType: documentData.documentType,
      documentNumber: documentData.documentNumber,
    });
    
    let document;
    
    if (existingDocument) {
      // Update existing document version
      existingDocument.updateVersion(
        {
          fileUrl: documentData.fileUrl,
          fileName: documentData.fileName,
          fileType: documentData.fileType,
          fileSize: documentData.fileSize,
        },
        userId,
        documentData.notes || 'Document updated'
      );
      
      // Update other fields
      Object.keys(documentData).forEach(field => {
        if (field !== 'fileUrl' && field !== 'fileName' && field !== 'fileType' && field !== 'fileSize') {
          existingDocument[field] = documentData[field];
        }
      });
      
      existingDocument.updatedBy = userId;
      document = await existingDocument.save();
    } else {
      // Create new document
      documentData.employeeId = employeeId;
      documentData.createdBy = userId;
      documentData.updatedBy = userId;
      document = await EmployeeDocument.create(documentData);
    }
    
    // Record document update in history
    await EmployeeHistory.recordDocumentUpdate(
      employeeId,
      document.documentType,
      existingDocument ? existingDocument.toObject() : null,
      document.toObject(),
      userId
    );
    
    // Update employee document reference if needed
    if (document.documentType === 'ktp') {
      employee.identificationDocuments.nationalId = {
        number: document.documentNumber,
        documentUrl: document.fileUrl,
        verificationStatus: document.verificationStatus,
      };
    } else if (document.documentType === 'npwp') {
      employee.identificationDocuments.taxId = {
        number: document.documentNumber,
        documentUrl: document.fileUrl,
        verificationStatus: document.verificationStatus,
      };
    } else if (document.documentType === 'sim') {
      employee.identificationDocuments.drivingLicense = {
        number: document.documentNumber,
        documentUrl: document.fileUrl,
        verificationStatus: document.verificationStatus,
      };
    } else if (document.documentType === 'passport') {
      employee.identificationDocuments.passport = {
        number: document.documentNumber,
        documentUrl: document.fileUrl,
        verificationStatus: document.verificationStatus,
      };
    } else if (document.documentType === 'bpjs_kesehatan') {
      employee.identificationDocuments.bpjsKesehatan = {
        number: document.documentNumber,
        documentUrl: document.fileUrl,
      };
    } else if (document.documentType === 'bpjs_ketenagakerjaan') {
      employee.identificationDocuments.bpjsKetenagakerjaan = {
        number: document.documentNumber,
        documentUrl: document.fileUrl,
      };
    }
    
    employee.updatedBy = userId;
    await employee.save();
    
    res.status(201).json({
      status: 'success',
      data: { document },
    });
  } catch (error) {
    logger.error(`Error uploading document for employee ${req.params.employeeId}:`, error);
    next(error);
  }
};

/**
 * Get employee documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getEmployeeDocuments = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { documentType } = req.query;
    
    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID',
      });
    }
    
    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
    }
    
    // Build query
    const query = { employeeId };
    
    if (documentType) {
      query.documentType = documentType;
    }
    
    // Get documents
    const documents = await EmployeeDocument.find(query)
      .sort({ documentType: 1, updatedAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: { documents },
    });
  } catch (error) {
    logger.error(`Error getting documents for employee ${req.params.employeeId}:`, error);
    next(error);
  }
};

/**
 * Get document by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID',
      });
    }
    
    // Find document
    const document = await EmployeeDocument.findById(id);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { document },
    });
  } catch (error) {
    logger.error(`Error getting document ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Verify document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const verifyDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID',
      });
    }
    
    // Find document
    const document = await EmployeeDocument.findById(id);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Verify document
    document.verify(userId);
    document.updatedBy = userId;
    await document.save();
    
    // Update employee document verification status
    const employee = await Employee.findById(document.employeeId);
    
    if (employee) {
      if (document.documentType === 'ktp' && employee.identificationDocuments.nationalId) {
        employee.identificationDocuments.nationalId.verificationStatus = 'verified';
      } else if (document.documentType === 'npwp' && employee.identificationDocuments.taxId) {
        employee.identificationDocuments.taxId.verificationStatus = 'verified';
      } else if (document.documentType === 'sim' && employee.identificationDocuments.drivingLicense) {
        employee.identificationDocuments.drivingLicense.verificationStatus = 'verified';
      } else if (document.documentType === 'passport' && employee.identificationDocuments.passport) {
        employee.identificationDocuments.passport.verificationStatus = 'verified';
      }
      
      employee.updatedBy = userId;
      await employee.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: { document },
    });
  } catch (error) {
    logger.error(`Error verifying document ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Reject document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const rejectDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID',
      });
    }
    
    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required',
      });
    }
    
    // Find document
    const document = await EmployeeDocument.findById(id);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Reject document
    document.reject(userId, reason);
    document.updatedBy = userId;
    await document.save();
    
    // Update employee document verification status
    const employee = await Employee.findById(document.employeeId);
    
    if (employee) {
      if (document.documentType === 'ktp' && employee.identificationDocuments.nationalId) {
        employee.identificationDocuments.nationalId.verificationStatus = 'rejected';
      } else if (document.documentType === 'npwp' && employee.identificationDocuments.taxId) {
        employee.identificationDocuments.taxId.verificationStatus = 'rejected';
      } else if (document.documentType === 'sim' && employee.identificationDocuments.drivingLicense) {
        employee.identificationDocuments.drivingLicense.verificationStatus = 'rejected';
      } else if (document.documentType === 'passport' && employee.identificationDocuments.passport) {
        employee.identificationDocuments.passport.verificationStatus = 'rejected';
      }
      
      employee.updatedBy = userId;
      await employee.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: { document },
    });
  } catch (error) {
    logger.error(`Error rejecting document ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document ID',
      });
    }
    
    // Find document
    const document = await EmployeeDocument.findById(id);
    
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }
    
    // Delete document
    await document.remove();
    
    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting document ${req.params.id}:`, error);
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
    const { days = 30 } = req.query;
    
    // Get documents expiring soon
    const documents = await EmployeeDocument.findExpiringSoon(parseInt(days));
    
    res.status(200).json({
      status: 'success',
      data: { documents },
    });
  } catch (error) {
    logger.error('Error getting documents expiring soon:', error);
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getEmployeeDocuments,
  getDocumentById,
  verifyDocument,
  rejectDocument,
  deleteDocument,
  getDocumentsExpiringSoon,
};
