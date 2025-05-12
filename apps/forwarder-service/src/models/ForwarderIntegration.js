/**
 * ForwarderIntegration Model
 * Handles integration points with forwarder partners' APIs
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the ForwarderIntegration schema
const forwarderIntegrationSchema = new Schema({
  // Basic Information
  forwarderId: {
    type: Schema.Types.ObjectId,
    ref: 'Forwarder',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  
  // Integration Type
  integrationType: {
    type: String,
    enum: ['api', 'file-transfer', 'webhook', 'manual', 'hybrid'],
    default: 'api',
    required: true,
  },
  
  // API Configuration
  apiConfig: {
    baseUrl: {
      type: String,
      trim: true,
    },
    version: {
      type: String,
      trim: true,
    },
    authType: {
      type: String,
      enum: ['basic', 'oauth2', 'api-key', 'jwt', 'custom'],
      default: 'api-key',
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
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
    tokenUrl: {
      type: String,
      trim: true,
    },
    clientId: {
      type: String,
      trim: true,
    },
    clientSecret: {
      type: String,
      trim: true,
    },
    scope: {
      type: String,
      trim: true,
    },
    customHeaders: {
      type: Map,
      of: String,
    },
    timeout: {
      type: Number, // in milliseconds
      default: 30000,
    },
    retryAttempts: {
      type: Number,
      default: 3,
    },
    retryDelay: {
      type: Number, // in milliseconds
      default: 1000,
    },
  },
  
  // Webhook Configuration
  webhookConfig: {
    inboundUrl: {
      type: String,
      trim: true,
    },
    outboundUrl: {
      type: String,
      trim: true,
    },
    secret: {
      type: String,
      trim: true,
    },
    events: [{
      type: String,
      enum: [
        'shipment.created',
        'shipment.updated',
        'shipment.cancelled',
        'tracking.updated',
        'delivery.completed',
        'delivery.failed',
        'invoice.created',
        'custom'
      ],
    }],
    format: {
      type: String,
      enum: ['json', 'xml', 'form'],
      default: 'json',
    },
    customEventNames: {
      type: Map,
      of: String,
    },
  },
  
  // File Transfer Configuration
  fileTransferConfig: {
    protocol: {
      type: String,
      enum: ['ftp', 'sftp', 'ftps', 's3', 'local'],
      default: 'sftp',
    },
    host: {
      type: String,
      trim: true,
    },
    port: {
      type: Number,
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    privateKey: {
      type: String,
      trim: true,
    },
    remotePath: {
      type: String,
      trim: true,
    },
    localPath: {
      type: String,
      trim: true,
    },
    fileNamePattern: {
      type: String,
      trim: true,
    },
    fileFormat: {
      type: String,
      enum: ['csv', 'xml', 'json', 'excel', 'custom'],
      default: 'csv',
    },
    delimiter: {
      type: String,
      default: ',',
    },
    schedule: {
      frequency: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'custom'],
        default: 'daily',
      },
      customCron: {
        type: String,
        trim: true,
      },
      timeOfDay: {
        type: String,
        trim: true,
      },
      daysOfWeek: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      }],
    },
  },
  
  // Endpoint Mappings
  endpointMappings: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    operationType: {
      type: String,
      enum: [
        'create-shipment',
        'cancel-shipment',
        'track-shipment',
        'get-rates',
        'create-pickup',
        'cancel-pickup',
        'create-label',
        'get-proof-of-delivery',
        'create-return',
        'get-locations',
        'custom'
      ],
      required: true,
    },
    endpoint: {
      type: String,
      trim: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      default: 'POST',
    },
    requestTemplate: {
      type: String,
      trim: true,
    },
    responseTemplate: {
      type: String,
      trim: true,
    },
    transformationScript: {
      type: String,
      trim: true,
    },
    headers: {
      type: Map,
      of: String,
    },
    parameters: {
      type: Map,
      of: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mockResponse: {
      type: String,
      trim: true,
    },
    useMock: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Field Mappings
  fieldMappings: [{
    sourceField: {
      type: String,
      required: true,
      trim: true,
    },
    targetField: {
      type: String,
      required: true,
      trim: true,
    },
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'date', 'object', 'array'],
      default: 'string',
    },
    defaultValue: {
      type: Schema.Types.Mixed,
    },
    transformationRule: {
      type: String,
      trim: true,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    validationRule: {
      type: String,
      trim: true,
    },
  }],
  
  // Error Handling
  errorHandling: {
    logErrors: {
      type: Boolean,
      default: true,
    },
    alertOnError: {
      type: Boolean,
      default: true,
    },
    alertEmails: [{
      type: String,
      trim: true,
    }],
    alertThreshold: {
      type: Number,
      default: 3,
    },
    retryStrategy: {
      type: String,
      enum: ['immediate', 'exponential-backoff', 'fixed-interval', 'custom'],
      default: 'exponential-backoff',
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    fallbackAction: {
      type: String,
      enum: ['queue', 'manual', 'alternate-provider', 'abort'],
      default: 'queue',
    },
  },
  
  // Sync Settings
  syncSettings: {
    autoSync: {
      type: Boolean,
      default: true,
    },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily', 'custom'],
      default: 'realtime',
    },
    customSyncSchedule: {
      type: String,
      trim: true,
    },
    lastSyncTime: {
      type: Date,
    },
    syncStatuses: {
      type: Boolean,
      default: true,
    },
    syncRates: {
      type: Boolean,
      default: true,
    },
    syncLocations: {
      type: Boolean,
      default: false,
    },
    syncInvoices: {
      type: Boolean,
      default: false,
    },
  },
  
  // Status and History
  status: {
    type: String,
    enum: ['active', 'inactive', 'testing', 'maintenance', 'failed'],
    default: 'testing',
    index: true,
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['active', 'inactive', 'testing', 'maintenance', 'failed'],
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
  
  // Integration Logs
  integrationLogs: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    operation: {
      type: String,
      required: true,
      trim: true,
    },
    endpoint: {
      type: String,
      trim: true,
    },
    requestData: {
      type: Schema.Types.Mixed,
    },
    responseData: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['success', 'error', 'warning'],
      required: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    processingTime: {
      type: Number, // in milliseconds
    },
    ipAddress: {
      type: String,
      trim: true,
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

/**
 * Add status history entry
 * @param {string} status - New status
 * @param {string} reason - Reason for status change
 * @param {ObjectId} userId - User ID who changed the status
 */
forwarderIntegrationSchema.methods.addStatusHistory = function(status, reason, userId) {
  this.status = status;
  this.statusHistory.push({
    status,
    reason,
    changedBy: userId,
    changedAt: new Date(),
  });
};

/**
 * Add integration log entry
 * @param {Object} logEntry - Log entry to add
 */
forwarderIntegrationSchema.methods.addIntegrationLog = function(logEntry) {
  // Limit logs to 1000 entries
  if (this.integrationLogs.length >= 1000) {
    this.integrationLogs.shift(); // Remove oldest log
  }
  
  this.integrationLogs.push({
    ...logEntry,
    timestamp: new Date(),
  });
};

/**
 * Add endpoint mapping
 * @param {Object} mapping - Endpoint mapping to add
 */
forwarderIntegrationSchema.methods.addEndpointMapping = function(mapping) {
  this.endpointMappings.push(mapping);
};

/**
 * Update endpoint mapping
 * @param {ObjectId} mappingId - Mapping ID
 * @param {Object} updates - Updates to apply
 */
forwarderIntegrationSchema.methods.updateEndpointMapping = function(mappingId, updates) {
  const mapping = this.endpointMappings.id(mappingId);
  if (mapping) {
    Object.assign(mapping, updates);
  }
};

/**
 * Remove endpoint mapping
 * @param {ObjectId} mappingId - Mapping ID
 */
forwarderIntegrationSchema.methods.removeEndpointMapping = function(mappingId) {
  const mapping = this.endpointMappings.id(mappingId);
  if (mapping) {
    mapping.remove();
  }
};

/**
 * Add field mapping
 * @param {Object} mapping - Field mapping to add
 */
forwarderIntegrationSchema.methods.addFieldMapping = function(mapping) {
  this.fieldMappings.push(mapping);
};

/**
 * Update field mapping
 * @param {ObjectId} mappingId - Mapping ID
 * @param {Object} updates - Updates to apply
 */
forwarderIntegrationSchema.methods.updateFieldMapping = function(mappingId, updates) {
  const mapping = this.fieldMappings.id(mappingId);
  if (mapping) {
    Object.assign(mapping, updates);
  }
};

/**
 * Remove field mapping
 * @param {ObjectId} mappingId - Mapping ID
 */
forwarderIntegrationSchema.methods.removeFieldMapping = function(mappingId) {
  const mapping = this.fieldMappings.id(mappingId);
  if (mapping) {
    mapping.remove();
  }
};

/**
 * Update sync time
 */
forwarderIntegrationSchema.methods.updateSyncTime = function() {
  this.syncSettings.lastSyncTime = new Date();
};

/**
 * Find integrations by forwarder
 * @param {ObjectId} forwarderId - Forwarder ID
 * @returns {Promise<Array>} - Integrations for the specified forwarder
 */
forwarderIntegrationSchema.statics.findByForwarder = function(forwarderId) {
  return this.find({ forwarderId });
};

/**
 * Find active integrations
 * @returns {Promise<Array>} - Active integrations
 */
forwarderIntegrationSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

/**
 * Find integrations by type
 * @param {string} integrationType - Integration type
 * @returns {Promise<Array>} - Integrations of the specified type
 */
forwarderIntegrationSchema.statics.findByType = function(integrationType) {
  return this.find({ integrationType, status: 'active' });
};

// Create the ForwarderIntegration model
const ForwarderIntegration = mongoose.model('ForwarderIntegration', forwarderIntegrationSchema);

module.exports = ForwarderIntegration;
