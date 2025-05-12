/**
 * Service Area Model
 * Defines the schema for service areas with geospatial indexing
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const serviceAreaSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // Geospatial data - Using GeoJSON format
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
      required: true,
    },
  },
  // Service area center point for quick distance calculations
  center: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  // Coverage radius in kilometers
  coverageRadius: {
    type: Number,
    min: 0,
    default: 0,
  },
  // Service area type
  type: {
    type: String,
    enum: ['delivery', 'pickup', 'both'],
    default: 'both',
    index: true,
  },
  // Assigned branches
  branches: [{
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  // Pricing configuration
  pricing: {
    basePrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    pricePerKm: {
      type: Number,
      min: 0,
      default: 0,
    },
    minimumDistance: {
      type: Number,
      min: 0,
      default: 0,
    },
    maximumDistance: {
      type: Number,
      min: 0,
      default: 0,
    },
    specialRates: [{
      name: String,
      description: String,
      rate: Number,
      conditions: Schema.Types.Mixed,
    }],
  },
  // Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Create geospatial indexes
serviceAreaSchema.index({ boundaries: '2dsphere' });
serviceAreaSchema.index({ center: '2dsphere' });

// Create compound indexes for efficient queries
serviceAreaSchema.index({ status: 1, type: 1 });
serviceAreaSchema.index({ 'branches.branchId': 1 });

/**
 * Check if a point is within this service area
 * @param {Array} coordinates - [longitude, latitude]
 * @returns {Boolean} - True if point is within service area
 */
serviceAreaSchema.methods.containsPoint = function(coordinates) {
  return mongoose.connection.db.command({
    geoIntersects: {
      geometry: {
        type: 'Point',
        coordinates: coordinates
      },
      query: {
        boundaries: this.boundaries
      }
    }
  });
};

/**
 * Calculate distance from a point to the service area center
 * @param {Array} coordinates - [longitude, latitude]
 * @returns {Number} - Distance in kilometers
 */
serviceAreaSchema.methods.distanceFromCenter = function(coordinates) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const earthRadius = 6371; // Earth's radius in kilometers
  
  const lat1 = radians(this.center.coordinates[1]);
  const lon1 = radians(this.center.coordinates[0]);
  const lat2 = radians(coordinates[1]);
  const lon2 = radians(coordinates[0]);
  
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return earthRadius * c;
};

/**
 * Check if this service area overlaps with another service area
 * @param {Object} otherArea - Another service area object
 * @returns {Boolean} - True if areas overlap
 */
serviceAreaSchema.methods.overlaps = function(otherArea) {
  return mongoose.connection.db.command({
    geoIntersects: {
      geometry: otherArea.boundaries,
      query: {
        boundaries: this.boundaries
      }
    }
  });
};

const ServiceArea = mongoose.model('ServiceArea', serviceAreaSchema);

module.exports = ServiceArea;
