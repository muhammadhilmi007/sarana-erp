/**
 * Forwarder Model
 * Defines the schema for forwarder partners with contract details
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Forwarder schema
const forwarderSchema = new Schema({
  // Basic Information
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['domestic', 'international', 'specialized', 'express', 'economy'],
    default: 'domestic',
    index: true,
  },
  
  // Company Information
  companyInfo: {
    legalName: {
      type: String,
      required: true,
      trim: true,
    },
    taxId: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    yearEstablished: {
      type: Number,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
  },
  
  // Contact Information
  contactInfo: {
    primaryContact: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      position: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    secondaryContact: {
      name: {
        type: String,
        trim: true,
      },
      position: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      postalCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        default: 'Indonesia',
        trim: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
  },
  
  // Contract Details
  contract: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    renewalDate: {
      type: Date,
    },
    contractNumber: {
      type: String,
      required: true,
      trim: true,
    },
    contractType: {
      type: String,
      enum: ['exclusive', 'non-exclusive', 'preferred', 'backup'],
      default: 'non-exclusive',
    },
    paymentTerms: {
      type: String,
      enum: ['prepaid', 'net15', 'net30', 'net45', 'net60'],
      default: 'net30',
    },
    autoRenewal: {
      type: Boolean,
      default: false,
    },
    terminationClause: {
      type: String,
      trim: true,
    },
    specialTerms: {
      type: String,
      trim: true,
    },
  },
  
  // Service Level Configuration
  serviceLevel: {
    deliveryTimeStandard: {
      type: Number, // in hours
      default: 48,
    },
    deliveryTimeExpress: {
      type: Number, // in hours
      default: 24,
    },
    guaranteedDelivery: {
      type: Boolean,
      default: false,
    },
    insuranceIncluded: {
      type: Boolean,
      default: false,
    },
    trackingCapability: {
      type: Boolean,
      default: true,
    },
    proofOfDelivery: {
      type: Boolean,
      default: true,
    },
    returnService: {
      type: Boolean,
      default: false,
    },
    saturdayDelivery: {
      type: Boolean,
      default: false,
    },
    sundayDelivery: {
      type: Boolean,
      default: false,
    },
    holidayDelivery: {
      type: Boolean,
      default: false,
    },
    maxWeight: {
      type: Number, // in kg
      default: 30,
    },
    maxDimensions: {
      length: {
        type: Number, // in cm
        default: 100,
      },
      width: {
        type: Number, // in cm
        default: 100,
      },
      height: {
        type: Number, // in cm
        default: 100,
      },
    },
    specialHandling: {
      fragile: {
        type: Boolean,
        default: false,
      },
      hazardous: {
        type: Boolean,
        default: false,
      },
      refrigerated: {
        type: Boolean,
        default: false,
      },
      oversized: {
        type: Boolean,
        default: false,
      },
    },
  },
  
  // Coverage Areas
  coverageAreas: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['city', 'province', 'region', 'country', 'international'],
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specialConditions: {
      type: String,
      trim: true,
    },
    deliveryTimeAdjustment: {
      type: Number, // additional hours
      default: 0,
    },
    surcharge: {
      type: Number, // percentage
      default: 0,
    },
  }],
  
  // Rate Information
  rateCards: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    serviceType: {
      type: String,
      enum: ['standard', 'express', 'same-day', 'international', 'specialized'],
      required: true,
    },
    weightBreaks: [{
      minWeight: {
        type: Number, // in kg
        required: true,
      },
      maxWeight: {
        type: Number, // in kg
        required: true,
      },
      rate: {
        type: Number, // base rate
        required: true,
      },
      perKgRate: {
        type: Number, // additional per kg
        default: 0,
      },
    }],
    zonePricing: [{
      fromZone: {
        type: String,
        required: true,
        trim: true,
      },
      toZone: {
        type: String,
        required: true,
        trim: true,
      },
      multiplier: {
        type: Number,
        required: true,
        default: 1.0,
      },
    }],
    volumetricFactor: {
      type: Number,
      default: 5000, // standard volumetric divisor (cm³/kg)
    },
    minimumCharge: {
      type: Number,
      required: true,
    },
    fuelSurcharge: {
      type: Number, // percentage
      default: 0,
    },
    discounts: [{
      threshold: {
        type: Number, // volume threshold
        required: true,
      },
      discountPercentage: {
        type: Number,
        required: true,
      },
    }],
  }],
  
  // Integration Details
  integration: {
    apiEnabled: {
      type: Boolean,
      default: false,
    },
    apiEndpoint: {
      type: String,
      trim: true,
    },
    apiKey: {
      type: String,
      trim: true,
    },
    apiSecret: {
      type: String,
      trim: true,
    },
    webhookUrl: {
      type: String,
      trim: true,
    },
    integrationMethod: {
      type: String,
      enum: ['api', 'file-transfer', 'manual', 'hybrid'],
      default: 'manual',
    },
    dataFormat: {
      type: String,
      enum: ['json', 'xml', 'csv', 'custom'],
      default: 'json',
    },
    authType: {
      type: String,
      enum: ['basic', 'oauth', 'api-key', 'jwt', 'none'],
      default: 'api-key',
    },
    customFields: {
      type: Map,
      of: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastSyncTime: {
      type: Date,
    },
  },
  
  // Performance Metrics
  performanceMetrics: {
    onTimeDeliveryRate: {
      type: Number, // percentage
      default: 0,
    },
    damageRate: {
      type: Number, // percentage
      default: 0,
    },
    lossRate: {
      type: Number, // percentage
      default: 0,
    },
    averageDeliveryTime: {
      type: Number, // in hours
      default: 0,
    },
    customerComplaintRate: {
      type: Number, // percentage
      default: 0,
    },
    volumeHandled: {
      type: Number,
      default: 0,
    },
    returnRate: {
      type: Number, // percentage
      default: 0,
    },
    invoiceAccuracy: {
      type: Number, // percentage
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Financial Settlement
  financialSettlement: {
    paymentMethod: {
      type: String,
      enum: ['bank-transfer', 'check', 'credit-card', 'digital-wallet'],
      default: 'bank-transfer',
    },
    bankDetails: {
      bankName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      accountName: {
        type: String,
        trim: true,
      },
      branchCode: {
        type: String,
        trim: true,
      },
      swiftCode: {
        type: String,
        trim: true,
      },
    },
    currency: {
      type: String,
      default: 'IDR',
      trim: true,
    },
    billingCycle: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly'],
      default: 'monthly',
    },
    invoiceDay: {
      type: Number, // day of month or week
      default: 1,
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    lastInvoiceDate: {
      type: Date,
    },
    lastPaymentDate: {
      type: Date,
    },
    lastPaymentAmount: {
      type: Number,
      default: 0,
    },
  },
  
  // Documents
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['contract', 'agreement', 'license', 'certificate', 'insurance', 'rate-card', 'sla', 'other'],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  }],
  
  // Communication Log
  communicationLogs: [{
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'phone', 'meeting', 'site-visit', 'other'],
      required: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    outcome: {
      type: String,
      trim: true,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    attachments: [{
      name: {
        type: String,
        trim: true,
      },
      fileUrl: {
        type: String,
      },
    }],
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }],
  
  // Status Information
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'terminated'],
    default: 'active',
    index: true,
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended', 'terminated'],
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Metadata
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

// Create geospatial index for location coordinates
forwarderSchema.index({ 'contactInfo.address.coordinates': '2dsphere' });

/**
 * Add status history entry
 * @param {string} status - New status
 * @param {string} reason - Reason for status change
 * @param {ObjectId} userId - User ID who changed the status
 */
forwarderSchema.methods.addStatusHistory = function(status, reason, userId) {
  this.status = status;
  this.statusHistory.push({
    status,
    reason,
    changedBy: userId,
    changedAt: new Date(),
  });
};

/**
 * Update performance metrics
 * @param {Object} metrics - Performance metrics to update
 */
forwarderSchema.methods.updatePerformanceMetrics = function(metrics) {
  this.performanceMetrics = {
    ...this.performanceMetrics,
    ...metrics,
    lastUpdated: new Date(),
  };
};

/**
 * Add coverage area
 * @param {Object} coverageArea - Coverage area to add
 */
forwarderSchema.methods.addCoverageArea = function(coverageArea) {
  this.coverageAreas.push(coverageArea);
};

/**
 * Update coverage area
 * @param {ObjectId} areaId - Coverage area ID
 * @param {Object} updates - Updates to apply
 */
forwarderSchema.methods.updateCoverageArea = function(areaId, updates) {
  const area = this.coverageAreas.id(areaId);
  if (area) {
    Object.assign(area, updates);
  }
};

/**
 * Remove coverage area
 * @param {ObjectId} areaId - Coverage area ID
 */
forwarderSchema.methods.removeCoverageArea = function(areaId) {
  const area = this.coverageAreas.id(areaId);
  if (area) {
    area.remove();
  }
};

/**
 * Add rate card
 * @param {Object} rateCard - Rate card to add
 */
forwarderSchema.methods.addRateCard = function(rateCard) {
  this.rateCards.push(rateCard);
};

/**
 * Update rate card
 * @param {ObjectId} rateCardId - Rate card ID
 * @param {Object} updates - Updates to apply
 */
forwarderSchema.methods.updateRateCard = function(rateCardId, updates) {
  const rateCard = this.rateCards.id(rateCardId);
  if (rateCard) {
    Object.assign(rateCard, updates);
  }
};

/**
 * Remove rate card
 * @param {ObjectId} rateCardId - Rate card ID
 */
forwarderSchema.methods.removeRateCard = function(rateCardId) {
  const rateCard = this.rateCards.id(rateCardId);
  if (rateCard) {
    rateCard.remove();
  }
};

/**
 * Add document
 * @param {Object} document - Document to add
 */
forwarderSchema.methods.addDocument = function(document) {
  this.documents.push(document);
};

/**
 * Update document
 * @param {ObjectId} documentId - Document ID
 * @param {Object} updates - Updates to apply
 */
forwarderSchema.methods.updateDocument = function(documentId, updates) {
  const document = this.documents.id(documentId);
  if (document) {
    Object.assign(document, updates);
  }
};

/**
 * Remove document
 * @param {ObjectId} documentId - Document ID
 */
forwarderSchema.methods.removeDocument = function(documentId) {
  const document = this.documents.id(documentId);
  if (document) {
    document.remove();
  }
};

/**
 * Add communication log
 * @param {Object} log - Communication log to add
 */
forwarderSchema.methods.addCommunicationLog = function(log) {
  this.communicationLogs.push(log);
};

/**
 * Find forwarders by location
 * @param {number} longitude - Longitude
 * @param {number} latitude - Latitude
 * @param {number} maxDistance - Maximum distance in meters
 * @returns {Promise<Array>} - Forwarders within the specified distance
 */
forwarderSchema.statics.findByLocation = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    'contactInfo.address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

/**
 * Find forwarders by type
 * @param {string} type - Forwarder type
 * @returns {Promise<Array>} - Forwarders of the specified type
 */
forwarderSchema.statics.findByType = function(type) {
  return this.find({ type, status: 'active' });
};

/**
 * Find active forwarders
 * @returns {Promise<Array>} - Active forwarders
 */
forwarderSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

/**
 * Find forwarders by coverage area
 * @param {string} areaCode - Area code
 * @returns {Promise<Array>} - Forwarders covering the specified area
 */
forwarderSchema.statics.findByCoverageArea = function(areaCode) {
  return this.find({
    'coverageAreas.code': areaCode,
    'coverageAreas.isActive': true,
    status: 'active',
  });
};

/**
 * Find forwarders with expiring contracts
 * @param {number} daysThreshold - Days threshold for expiry
 * @returns {Promise<Array>} - Forwarders with contracts expiring within the threshold
 */
forwarderSchema.statics.findWithExpiringContracts = function(daysThreshold = 30) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return this.find({
    'contract.endDate': {
      $lte: thresholdDate,
      $gte: new Date(),
    },
    status: 'active',
  });
};

// Create the Forwarder model
const Forwarder = mongoose.model('Forwarder', forwarderSchema);

module.exports = Forwarder;
