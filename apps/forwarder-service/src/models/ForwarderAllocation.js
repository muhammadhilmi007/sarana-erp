/**
 * ForwarderAllocation Model
 * Handles forwarder shipment allocation and load balancing
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the ForwarderAllocation schema
const forwarderAllocationSchema = new Schema({
  // Basic Information
  allocationId: {
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
  },
  description: {
    type: String,
    trim: true,
  },
  
  // Allocation Strategy
  strategy: {
    type: String,
    enum: ['round-robin', 'performance-based', 'cost-optimized', 'sla-based', 'manual', 'zone-based'],
    default: 'round-robin',
  },
  
  // Active Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  // Allocation Rules
  rules: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
    conditions: {
      originZone: {
        type: String,
        trim: true,
      },
      destinationZone: {
        type: String,
        trim: true,
      },
      packageType: {
        type: String,
        trim: true,
      },
      minWeight: {
        type: Number,
      },
      maxWeight: {
        type: Number,
      },
      minValue: {
        type: Number,
      },
      maxValue: {
        type: Number,
      },
      serviceLevel: {
        type: String,
        enum: ['economy', 'standard', 'express', 'same-day'],
      },
      specialHandling: {
        type: Boolean,
      },
      isInternational: {
        type: Boolean,
      },
      customAttributes: {
        type: Map,
        of: String,
      },
    },
    forwarderPreferences: [{
      forwarderId: {
        type: Schema.Types.ObjectId,
        ref: 'Forwarder',
        required: true,
      },
      priority: {
        type: Number,
        default: 1,
      },
      weightPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
      },
      maxDailyShipments: {
        type: Number,
      },
      maxWeeklyShipments: {
        type: Number,
      },
      costMultiplier: {
        type: Number,
        default: 1.0,
      },
    }],
    fallbackForwarderId: {
      type: Schema.Types.ObjectId,
      ref: 'Forwarder',
    },
  }],
  
  // Load Balancing Settings
  loadBalancing: {
    enabled: {
      type: Boolean,
      default: true,
    },
    balancingPeriod: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    balancingMetric: {
      type: String,
      enum: ['shipment-count', 'package-weight', 'package-value', 'revenue'],
      default: 'shipment-count',
    },
    rebalanceThreshold: {
      type: Number, // percentage difference that triggers rebalancing
      default: 20,
    },
    maxAllocationPerForwarder: {
      type: Number, // percentage
      default: 50,
    },
    considerPerformance: {
      type: Boolean,
      default: true,
    },
    performanceWeight: {
      type: Number, // 0-100
      default: 30,
    },
    considerCost: {
      type: Boolean,
      default: true,
    },
    costWeight: {
      type: Number, // 0-100
      default: 30,
    },
    considerCapacity: {
      type: Boolean,
      default: true,
    },
    capacityWeight: {
      type: Number, // 0-100
      default: 40,
    },
  },
  
  // Performance Thresholds
  performanceThresholds: {
    minimumOnTimeDelivery: {
      type: Number, // percentage
      default: 90,
    },
    maximumDamageRate: {
      type: Number, // percentage
      default: 2,
    },
    maximumLossRate: {
      type: Number, // percentage
      default: 1,
    },
    maximumComplaintRate: {
      type: Number, // percentage
      default: 5,
    },
    penaltyThreshold: {
      type: Number, // percentage below which penalties apply
      default: 85,
    },
    bonusThreshold: {
      type: Number, // percentage above which bonuses apply
      default: 95,
    },
  },
  
  // Allocation History
  allocationHistory: [{
    date: {
      type: Date,
      default: Date.now,
    },
    allocations: [{
      forwarderId: {
        type: Schema.Types.ObjectId,
        ref: 'Forwarder',
      },
      shipmentCount: {
        type: Number,
        default: 0,
      },
      totalWeight: {
        type: Number,
        default: 0,
      },
      totalValue: {
        type: Number,
        default: 0,
      },
      performanceScore: {
        type: Number, // 0-100
        default: 0,
      },
    }],
    rebalanced: {
      type: Boolean,
      default: false,
    },
    notes: {
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
 * Add allocation rule
 * @param {Object} rule - Rule to add
 */
forwarderAllocationSchema.methods.addRule = function(rule) {
  this.rules.push(rule);
};

/**
 * Update allocation rule
 * @param {ObjectId} ruleId - Rule ID
 * @param {Object} updates - Updates to apply
 */
forwarderAllocationSchema.methods.updateRule = function(ruleId, updates) {
  const rule = this.rules.id(ruleId);
  if (rule) {
    Object.assign(rule, updates);
  }
};

/**
 * Remove allocation rule
 * @param {ObjectId} ruleId - Rule ID
 */
forwarderAllocationSchema.methods.removeRule = function(ruleId) {
  const rule = this.rules.id(ruleId);
  if (rule) {
    rule.remove();
  }
};

/**
 * Add allocation history entry
 * @param {Object} historyEntry - History entry to add
 */
forwarderAllocationSchema.methods.addAllocationHistory = function(historyEntry) {
  this.allocationHistory.push(historyEntry);
};

/**
 * Calculate forwarder scores based on performance metrics
 * @param {Array} forwarders - Array of forwarders with performance metrics
 * @returns {Array} - Forwarders with calculated scores
 */
forwarderAllocationSchema.methods.calculateForwarderScores = function(forwarders) {
  const { 
    performanceWeight, 
    costWeight, 
    capacityWeight 
  } = this.loadBalancing;
  
  const { 
    minimumOnTimeDelivery, 
    maximumDamageRate, 
    maximumLossRate, 
    maximumComplaintRate 
  } = this.performanceThresholds;
  
  return forwarders.map(forwarder => {
    // Calculate performance score (0-100)
    const performanceMetrics = forwarder.performanceMetrics;
    let performanceScore = 0;
    
    if (this.loadBalancing.considerPerformance) {
      // On-time delivery contributes 40% to performance score
      const onTimeScore = Math.min(100, (performanceMetrics.onTimeDeliveryRate / minimumOnTimeDelivery) * 100);
      
      // Damage rate contributes 20% to performance score (inverse relationship)
      const damageScore = Math.min(100, ((maximumDamageRate - performanceMetrics.damageRate) / maximumDamageRate) * 100);
      
      // Loss rate contributes 20% to performance score (inverse relationship)
      const lossScore = Math.min(100, ((maximumLossRate - performanceMetrics.lossRate) / maximumLossRate) * 100);
      
      // Complaint rate contributes 20% to performance score (inverse relationship)
      const complaintScore = Math.min(100, ((maximumComplaintRate - performanceMetrics.customerComplaintRate) / maximumComplaintRate) * 100);
      
      performanceScore = (onTimeScore * 0.4) + (damageScore * 0.2) + (lossScore * 0.2) + (complaintScore * 0.2);
    }
    
    // Calculate cost score (0-100, higher is better/cheaper)
    let costScore = 0;
    if (this.loadBalancing.considerCost) {
      // This would be calculated based on rate cards and pricing
      // For now, we'll use a placeholder
      costScore = 80; // Placeholder
    }
    
    // Calculate capacity score (0-100)
    let capacityScore = 0;
    if (this.loadBalancing.considerCapacity) {
      // This would be calculated based on forwarder capacity and current load
      // For now, we'll use a placeholder
      capacityScore = 90; // Placeholder
    }
    
    // Calculate total score
    const totalScore = (
      (performanceScore * (performanceWeight / 100)) +
      (costScore * (costWeight / 100)) +
      (capacityScore * (capacityWeight / 100))
    );
    
    return {
      forwarderId: forwarder._id,
      name: forwarder.name,
      performanceScore,
      costScore,
      capacityScore,
      totalScore,
    };
  });
};

/**
 * Allocate shipment to forwarder based on rules and scores
 * @param {Object} shipment - Shipment details
 * @param {Array} availableForwarders - Available forwarders
 * @returns {Object} - Selected forwarder and allocation details
 */
forwarderAllocationSchema.methods.allocateShipment = function(shipment, availableForwarders) {
  // Find matching rule based on shipment characteristics
  const matchingRule = this.findMatchingRule(shipment);
  
  if (!matchingRule) {
    // No matching rule, use default strategy
    return this.allocateByStrategy(shipment, availableForwarders);
  }
  
  // Filter forwarders based on rule preferences
  const preferredForwarderIds = matchingRule.forwarderPreferences.map(pref => pref.forwarderId.toString());
  const preferredForwarders = availableForwarders.filter(forwarder => 
    preferredForwarderIds.includes(forwarder._id.toString())
  );
  
  if (preferredForwarders.length === 0) {
    // No preferred forwarders available, use fallback if specified
    if (matchingRule.fallbackForwarderId) {
      const fallbackForwarder = availableForwarders.find(
        forwarder => forwarder._id.toString() === matchingRule.fallbackForwarderId.toString()
      );
      
      if (fallbackForwarder) {
        return {
          forwarder: fallbackForwarder,
          rule: matchingRule.name,
          isFallback: true,
        };
      }
    }
    
    // No fallback available, use default strategy
    return this.allocateByStrategy(shipment, availableForwarders);
  }
  
  // Calculate scores for preferred forwarders
  const scoredForwarders = this.calculateForwarderScores(preferredForwarders);
  
  // Apply rule-specific weightings
  const weightedForwarders = scoredForwarders.map(scored => {
    const preference = matchingRule.forwarderPreferences.find(
      pref => pref.forwarderId.toString() === scored.forwarderId.toString()
    );
    
    return {
      ...scored,
      weightedScore: scored.totalScore * (preference.priority / 10) * (preference.weightPercentage / 100),
    };
  });
  
  // Sort by weighted score (descending)
  weightedForwarders.sort((a, b) => b.weightedScore - a.weightedScore);
  
  // Select top forwarder
  const selectedForwarderId = weightedForwarders[0].forwarderId;
  const selectedForwarder = preferredForwarders.find(
    forwarder => forwarder._id.toString() === selectedForwarderId.toString()
  );
  
  return {
    forwarder: selectedForwarder,
    rule: matchingRule.name,
    score: weightedForwarders[0].weightedScore,
  };
};

/**
 * Find matching rule for a shipment
 * @param {Object} shipment - Shipment details
 * @returns {Object|null} - Matching rule or null
 */
forwarderAllocationSchema.methods.findMatchingRule = function(shipment) {
  // Sort rules by priority (descending)
  const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);
  
  // Find first matching rule
  return sortedRules.find(rule => {
    const conditions = rule.conditions;
    
    // Check each condition
    if (conditions.originZone && conditions.originZone !== shipment.originZone) return false;
    if (conditions.destinationZone && conditions.destinationZone !== shipment.destinationZone) return false;
    if (conditions.packageType && conditions.packageType !== shipment.packageType) return false;
    if (conditions.minWeight && shipment.weight < conditions.minWeight) return false;
    if (conditions.maxWeight && shipment.weight > conditions.maxWeight) return false;
    if (conditions.minValue && shipment.declaredValue < conditions.minValue) return false;
    if (conditions.maxValue && shipment.declaredValue > conditions.maxValue) return false;
    if (conditions.serviceLevel && conditions.serviceLevel !== shipment.serviceLevel) return false;
    if (conditions.specialHandling !== undefined && conditions.specialHandling !== shipment.specialHandling) return false;
    if (conditions.isInternational !== undefined && conditions.isInternational !== shipment.isInternational) return false;
    
    // Check custom attributes if any
    if (conditions.customAttributes && conditions.customAttributes.size > 0) {
      for (const [key, value] of conditions.customAttributes.entries()) {
        if (shipment.customAttributes[key] !== value) return false;
      }
    }
    
    // All conditions match
    return true;
  }) || null;
};

/**
 * Allocate shipment based on default strategy
 * @param {Object} shipment - Shipment details
 * @param {Array} availableForwarders - Available forwarders
 * @returns {Object} - Selected forwarder and allocation details
 */
forwarderAllocationSchema.methods.allocateByStrategy = function(shipment, availableForwarders) {
  switch (this.strategy) {
    case 'performance-based':
      return this.allocateByPerformance(shipment, availableForwarders);
    
    case 'cost-optimized':
      return this.allocateByCost(shipment, availableForwarders);
    
    case 'sla-based':
      return this.allocateBySLA(shipment, availableForwarders);
    
    case 'zone-based':
      return this.allocateByZone(shipment, availableForwarders);
    
    case 'round-robin':
    default:
      return this.allocateByRoundRobin(availableForwarders);
  }
};

/**
 * Allocate shipment based on performance
 * @param {Object} shipment - Shipment details
 * @param {Array} availableForwarders - Available forwarders
 * @returns {Object} - Selected forwarder and allocation details
 */
forwarderAllocationSchema.methods.allocateByPerformance = function(shipment, availableForwarders) {
  // Calculate scores with heavy weight on performance
  const scoredForwarders = this.calculateForwarderScores(availableForwarders);
  
  // Sort by total score (descending)
  scoredForwarders.sort((a, b) => b.performanceScore - a.performanceScore);
  
  // Select top forwarder
  const selectedForwarderId = scoredForwarders[0].forwarderId;
  const selectedForwarder = availableForwarders.find(
    forwarder => forwarder._id.toString() === selectedForwarderId.toString()
  );
  
  return {
    forwarder: selectedForwarder,
    strategy: 'performance-based',
    score: scoredForwarders[0].performanceScore,
  };
};

/**
 * Allocate shipment based on cost
 * @param {Object} shipment - Shipment details
 * @param {Array} availableForwarders - Available forwarders
 * @returns {Object} - Selected forwarder and allocation details
 */
forwarderAllocationSchema.methods.allocateByCost = function(shipment, availableForwarders) {
  // This would involve calculating shipping costs for each forwarder
  // For now, we'll use a simplified approach
  
  // Calculate costs for each forwarder (placeholder logic)
  const forwardersWithCost = availableForwarders.map(forwarder => {
    // Simplified cost calculation (would be more complex in reality)
    const baseCost = 10000; // Base cost in IDR
    const weightCost = shipment.weight * 5000; // 5000 IDR per kg
    
    // Apply forwarder-specific multiplier (from rate cards)
    const multiplier = 1.0; // This would come from rate cards
    
    const totalCost = (baseCost + weightCost) * multiplier;
    
    return {
      forwarder,
      cost: totalCost,
    };
  });
  
  // Sort by cost (ascending)
  forwardersWithCost.sort((a, b) => a.cost - b.cost);
  
  // Select cheapest forwarder
  return {
    forwarder: forwardersWithCost[0].forwarder,
    strategy: 'cost-optimized',
    cost: forwardersWithCost[0].cost,
  };
};

/**
 * Allocate shipment based on SLA
 * @param {Object} shipment - Shipment details
 * @param {Array} availableForwarders - Available forwarders
 * @returns {Object} - Selected forwarder and allocation details
 */
forwarderAllocationSchema.methods.allocateBySLA = function(shipment, availableForwarders) {
  // Filter forwarders that can meet the required SLA
  const requiredDeliveryTime = shipment.serviceLevel === 'express' ? 24 : 48; // hours
  
  const eligibleForwarders = availableForwarders.filter(forwarder => {
    const deliveryTime = shipment.serviceLevel === 'express' 
      ? forwarder.serviceLevel.deliveryTimeExpress 
      : forwarder.serviceLevel.deliveryTimeStandard;
    
    return deliveryTime <= requiredDeliveryTime;
  });
  
  if (eligibleForwarders.length === 0) {
    // No forwarders meet SLA, fall back to all available
    return this.allocateByPerformance(shipment, availableForwarders);
  }
  
  // Calculate scores for eligible forwarders
  const scoredForwarders = this.calculateForwarderScores(eligibleForwarders);
  
  // Sort by total score (descending)
  scoredForwarders.sort((a, b) => b.totalScore - a.totalScore);
  
  // Select top forwarder
  const selectedForwarderId = scoredForwarders[0].forwarderId;
  const selectedForwarder = eligibleForwarders.find(
    forwarder => forwarder._id.toString() === selectedForwarderId.toString()
  );
  
  return {
    forwarder: selectedForwarder,
    strategy: 'sla-based',
    score: scoredForwarders[0].totalScore,
  };
};

/**
 * Allocate shipment based on zone
 * @param {Object} shipment - Shipment details
 * @param {Array} availableForwarders - Available forwarders
 * @returns {Object} - Selected forwarder and allocation details
 */
forwarderAllocationSchema.methods.allocateByZone = function(shipment, availableForwarders) {
  // Filter forwarders that cover both origin and destination zones
  const eligibleForwarders = availableForwarders.filter(forwarder => {
    const coverageAreas = forwarder.coverageAreas || [];
    
    const coversOrigin = coverageAreas.some(area => 
      area.code === shipment.originZone && area.isActive
    );
    
    const coversDestination = coverageAreas.some(area => 
      area.code === shipment.destinationZone && area.isActive
    );
    
    return coversOrigin && coversDestination;
  });
  
  if (eligibleForwarders.length === 0) {
    // No forwarders cover both zones, fall back to all available
    return this.allocateByPerformance(shipment, availableForwarders);
  }
  
  // Calculate scores for eligible forwarders
  const scoredForwarders = this.calculateForwarderScores(eligibleForwarders);
  
  // Sort by total score (descending)
  scoredForwarders.sort((a, b) => b.totalScore - a.totalScore);
  
  // Select top forwarder
  const selectedForwarderId = scoredForwarders[0].forwarderId;
  const selectedForwarder = eligibleForwarders.find(
    forwarder => forwarder._id.toString() === selectedForwarderId.toString()
  );
  
  return {
    forwarder: selectedForwarder,
    strategy: 'zone-based',
    score: scoredForwarders[0].totalScore,
  };
};

/**
 * Allocate shipment using round-robin strategy
 * @param {Array} availableForwarders - Available forwarders
 * @returns {Object} - Selected forwarder and allocation details
 */
forwarderAllocationSchema.methods.allocateByRoundRobin = function(availableForwarders) {
  // Get last allocation history entry
  const lastHistory = this.allocationHistory.length > 0 
    ? this.allocationHistory[this.allocationHistory.length - 1] 
    : null;
  
  // Get last allocated forwarder
  let lastAllocatedIndex = -1;
  
  if (lastHistory) {
    const allocations = lastHistory.allocations;
    const lastAllocation = allocations.length > 0 ? allocations[allocations.length - 1] : null;
    
    if (lastAllocation) {
      lastAllocatedIndex = availableForwarders.findIndex(
        forwarder => forwarder._id.toString() === lastAllocation.forwarderId.toString()
      );
    }
  }
  
  // Select next forwarder in sequence
  const nextIndex = (lastAllocatedIndex + 1) % availableForwarders.length;
  const selectedForwarder = availableForwarders[nextIndex];
  
  return {
    forwarder: selectedForwarder,
    strategy: 'round-robin',
    index: nextIndex,
  };
};

/**
 * Find active allocation strategies
 * @returns {Promise<Array>} - Active allocation strategies
 */
forwarderAllocationSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Create the ForwarderAllocation model
const ForwarderAllocation = mongoose.model('ForwarderAllocation', forwarderAllocationSchema);

module.exports = ForwarderAllocation;
