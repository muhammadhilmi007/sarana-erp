/**
 * Employee Document Model
 * Manages employee documents with metadata and versioning
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Employee Document schema
const employeeDocumentSchema = new Schema({
  // Reference to the employee
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  },
  
  // Document type
  documentType: {
    type: String,
    enum: [
      'ktp', // National ID
      'npwp', // Tax ID
      'ijazah', // Education certificate
      'sertifikat', // Professional certificate
      'sim', // Driving license
      'passport',
      'bpjs_kesehatan',
      'bpjs_ketenagakerjaan',
      'bank_account',
      'contract',
      'performance_review',
      'training_certificate',
      'other'
    ],
    required: true,
    index: true,
  },
  
  // Document details
  documentNumber: {
    type: String,
    trim: true,
    index: true,
  },
  
  documentName: {
    type: String,
    required: true,
    trim: true,
  },
  
  description: {
    type: String,
    trim: true,
  },
  
  issueDate: {
    type: Date,
  },
  
  expiryDate: {
    type: Date,
    index: true,
  },
  
  issuingAuthority: {
    type: String,
    trim: true,
  },
  
  // File information
  fileUrl: {
    type: String,
    required: true,
    trim: true,
  },
  
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  
  fileType: {
    type: String,
    required: true,
    trim: true,
  },
  
  fileSize: {
    type: Number,
    required: true,
  },
  
  // Version control
  version: {
    type: Number,
    default: 1,
  },
  
  previousVersions: [{
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  }],
  
  // Verification status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    index: true,
  },
  
  verificationDetails: {
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  
  // Alert settings
  alertSettings: {
    expiryAlert: {
      type: Boolean,
      default: true,
    },
    alertDays: {
      type: Number,
      default: 30,
    },
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
  }],
  
  notes: {
    type: String,
    trim: true,
  },
  
  // System fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Create indexes
employeeDocumentSchema.index({ employeeId: 1, documentType: 1 });
employeeDocumentSchema.index({ expiryDate: 1, verificationStatus: 1 });

/**
 * Update document version
 * @param {Object} newFileData - New file data
 * @param {ObjectId} userId - User ID who updated the document
 * @param {string} notes - Notes about the update
 */
employeeDocumentSchema.methods.updateVersion = function(newFileData, userId, notes) {
  // Add current version to previous versions
  this.previousVersions.push({
    fileUrl: this.fileUrl,
    fileName: this.fileName,
    fileType: this.fileType,
    fileSize: this.fileSize,
    uploadedBy: this.updatedBy,
    uploadedAt: this.updatedAt,
    notes,
  });
  
  // Update to new version
  this.fileUrl = newFileData.fileUrl;
  this.fileName = newFileData.fileName;
  this.fileType = newFileData.fileType;
  this.fileSize = newFileData.fileSize;
  this.version += 1;
  this.updatedBy = userId;
};

/**
 * Verify document
 * @param {ObjectId} userId - User ID who verified the document
 */
employeeDocumentSchema.methods.verify = function(userId) {
  this.verificationStatus = 'verified';
  this.verificationDetails = {
    verifiedBy: userId,
    verifiedAt: new Date(),
  };
};

/**
 * Reject document
 * @param {ObjectId} userId - User ID who rejected the document
 * @param {string} reason - Rejection reason
 */
employeeDocumentSchema.methods.reject = function(userId, reason) {
  this.verificationStatus = 'rejected';
  this.verificationDetails = {
    verifiedBy: userId,
    verifiedAt: new Date(),
    rejectionReason: reason,
  };
};

/**
 * Find documents by employee
 * @param {ObjectId} employeeId - Employee ID
 * @returns {Promise<Array>} - Employee documents
 */
employeeDocumentSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ employeeId });
};

/**
 * Find documents by type
 * @param {ObjectId} employeeId - Employee ID
 * @param {string} documentType - Document type
 * @returns {Promise<Array>} - Employee documents of the specified type
 */
employeeDocumentSchema.statics.findByType = function(employeeId, documentType) {
  return this.find({ employeeId, documentType });
};

/**
 * Find documents expiring soon
 * @param {number} days - Number of days to check
 * @returns {Promise<Array>} - Documents expiring within specified days
 */
employeeDocumentSchema.statics.findExpiringSoon = function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    expiryDate: { $gte: today, $lte: futureDate },
    verificationStatus: 'verified',
  }).populate('employeeId', 'employeeId firstName lastName fullName');
};

/**
 * Find documents pending verification
 * @returns {Promise<Array>} - Documents pending verification
 */
employeeDocumentSchema.statics.findPendingVerification = function() {
  return this.find({
    verificationStatus: 'pending',
  }).populate('employeeId', 'employeeId firstName lastName fullName');
};

// Create the EmployeeDocument model
const EmployeeDocument = mongoose.model('EmployeeDocument', employeeDocumentSchema);

module.exports = EmployeeDocument;
