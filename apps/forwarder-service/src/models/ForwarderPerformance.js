/**
 * ForwarderPerformance Model
 * Tracks performance metrics and SLA monitoring for forwarder partners
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the ForwarderPerformance schema
const forwarderPerformanceSchema = new Schema({
  // Basic Information
  forwarderId: {
    type: Schema.Types.ObjectId,
    ref: 'Forwarder',
    required: true,
    index: true,
  },
  
  // Time Period
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
    index: true,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Volume Metrics
  volumeMetrics: {
    totalShipments: {
      type: Number,
      default: 0,
    },
    totalPackages: {
      type: Number,
      default: 0,
    },
    totalWeight: {
      type: Number, // in kg
      default: 0,
    },
    totalValue: {
      type: Number, // in IDR
      default: 0,
    },
    averageShipmentSize: {
      type: Number, // in kg
      default: 0,
    },
    averageShipmentValue: {
      type: Number, // in IDR
      default: 0,
    },
  },
  
  // Delivery Performance
  deliveryPerformance: {
    onTimeDeliveries: {
      type: Number,
      default: 0,
    },
    lateDeliveries: {
      type: Number,
      default: 0,
    },
    veryLateDeliveries: {
      type: Number, // more than 24h late
      default: 0,
    },
    onTimeDeliveryRate: {
      type: Number, // percentage
      default: 0,
    },
    averageDeliveryTime: {
      type: Number, // in hours
      default: 0,
    },
    averageDelay: {
      type: Number, // in hours
      default: 0,
    },
    deliveryAttempts: {
      type: Number,
      default: 0,
    },
    averageAttemptsPerDelivery: {
      type: Number,
      default: 0,
    },
  },
  
  // Quality Metrics
  qualityMetrics: {
    damagedPackages: {
      type: Number,
      default: 0,
    },
    lostPackages: {
      type: Number,
      default: 0,
    },
    incorrectDeliveries: {
      type: Number,
      default: 0,
    },
    returnedPackages: {
      type: Number,
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
    incorrectDeliveryRate: {
      type: Number, // percentage
      default: 0,
    },
    returnRate: {
      type: Number, // percentage
      default: 0,
    },
  },
  
  // Customer Experience
  customerExperience: {
    customerComplaints: {
      type: Number,
      default: 0,
    },
    complaintRate: {
      type: Number, // percentage
      default: 0,
    },
    complaintResolutionTime: {
      type: Number, // in hours
      default: 0,
    },
    satisfactionScore: {
      type: Number, // 0-100
      default: 0,
    },
    npsScore: {
      type: Number, // -100 to 100
      default: 0,
    },
    customerFeedbackCount: {
      type: Number,
      default: 0,
    },
  },
  
  // Financial Metrics
  financialMetrics: {
    totalCost: {
      type: Number, // in IDR
      default: 0,
    },
    averageCostPerShipment: {
      type: Number, // in IDR
      default: 0,
    },
    averageCostPerKg: {
      type: Number, // in IDR
      default: 0,
    },
    costVariance: {
      type: Number, // percentage from expected
      default: 0,
    },
    invoiceAccuracy: {
      type: Number, // percentage
      default: 0,
    },
    paymentOnTime: {
      type: Boolean,
      default: true,
    },
    discountsApplied: {
      type: Number, // in IDR
      default: 0,
    },
    penaltiesApplied: {
      type: Number, // in IDR
      default: 0,
    },
  },
  
  // Operational Metrics
  operationalMetrics: {
    pickupOnTime: {
      type: Number,
      default: 0,
    },
    pickupLate: {
      type: Number,
      default: 0,
    },
    pickupOnTimeRate: {
      type: Number, // percentage
      default: 0,
    },
    scanComplianceRate: {
      type: Number, // percentage
      default: 0,
    },
    trackingAccuracy: {
      type: Number, // percentage
      default: 0,
    },
    documentationAccuracy: {
      type: Number, // percentage
      default: 0,
    },
    averageProcessingTime: {
      type: Number, // in hours
      default: 0,
    },
    capacityUtilization: {
      type: Number, // percentage
      default: 0,
    },
  },
  
  // SLA Compliance
  slaCompliance: {
    overallCompliance: {
      type: Number, // percentage
      default: 0,
    },
    deliveryTimeCompliance: {
      type: Number, // percentage
      default: 0,
    },
    qualityCompliance: {
      type: Number, // percentage
      default: 0,
    },
    pickupCompliance: {
      type: Number, // percentage
      default: 0,
    },
    trackingCompliance: {
      type: Number, // percentage
      default: 0,
    },
    documentationCompliance: {
      type: Number, // percentage
      default: 0,
    },
    billingCompliance: {
      type: Number, // percentage
      default: 0,
    },
  },
  
  // Performance by Service Type
  serviceTypePerformance: [{
    serviceType: {
      type: String,
      enum: ['standard', 'express', 'same-day', 'international', 'specialized'],
      required: true,
    },
    shipmentCount: {
      type: Number,
      default: 0,
    },
    onTimeRate: {
      type: Number, // percentage
      default: 0,
    },
    damageRate: {
      type: Number, // percentage
      default: 0,
    },
    averageCost: {
      type: Number, // in IDR
      default: 0,
    },
  }],
  
  // Performance by Region
  regionPerformance: [{
    region: {
      type: String,
      required: true,
    },
    shipmentCount: {
      type: Number,
      default: 0,
    },
    onTimeRate: {
      type: Number, // percentage
      default: 0,
    },
    damageRate: {
      type: Number, // percentage
      default: 0,
    },
    averageDeliveryTime: {
      type: Number, // in hours
      default: 0,
    },
  }],
  
  // Benchmarking
  benchmarking: {
    industryAverageOnTime: {
      type: Number, // percentage
      default: 0,
    },
    industryAverageDamage: {
      type: Number, // percentage
      default: 0,
    },
    industryAverageCost: {
      type: Number, // in IDR
      default: 0,
    },
    rankingOnTime: {
      type: Number,
      default: 0,
    },
    rankingDamage: {
      type: Number,
      default: 0,
    },
    rankingCost: {
      type: Number,
      default: 0,
    },
    rankingOverall: {
      type: Number,
      default: 0,
    },
  },
  
  // Trend Analysis
  trends: {
    onTimeDeliveryTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable',
    },
    damageTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable',
    },
    costTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable',
    },
    volumeTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable',
    },
    customerSatisfactionTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable',
    },
  },
  
  // Performance Score
  performanceScore: {
    overall: {
      type: Number, // 0-100
      default: 0,
    },
    delivery: {
      type: Number, // 0-100
      default: 0,
    },
    quality: {
      type: Number, // 0-100
      default: 0,
    },
    cost: {
      type: Number, // 0-100
      default: 0,
    },
    customerExperience: {
      type: Number, // 0-100
      default: 0,
    },
    operational: {
      type: Number, // 0-100
      default: 0,
    },
  },
  
  // Recommendations
  recommendations: [{
    area: {
      type: String,
      enum: ['delivery', 'quality', 'cost', 'customer', 'operational'],
      required: true,
    },
    issue: {
      type: String,
      required: true,
      trim: true,
    },
    recommendation: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    potentialImpact: {
      type: Number, // 0-100
      default: 50,
    },
  }],
  
  // Metadata
  isFinalized: {
    type: Boolean,
    default: false,
    index: true,
  },
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
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Create compound index for forwarder, period and date range
forwarderPerformanceSchema.index({ forwarderId: 1, period: 1, startDate: 1, endDate: 1 }, { unique: true });

/**
 * Calculate overall performance score
 */
forwarderPerformanceSchema.methods.calculatePerformanceScore = function() {
  // Delivery score (40% weight)
  const deliveryScore = Math.min(100, (
    (this.deliveryPerformance.onTimeDeliveryRate * 0.7) +
    (Math.max(0, 100 - (this.deliveryPerformance.averageDelay * 2)) * 0.3)
  ));
  
  // Quality score (20% weight)
  const qualityScore = Math.min(100, (
    (Math.max(0, 100 - (this.qualityMetrics.damageRate * 10)) * 0.4) +
    (Math.max(0, 100 - (this.qualityMetrics.lossRate * 20)) * 0.4) +
    (Math.max(0, 100 - (this.qualityMetrics.incorrectDeliveryRate * 5)) * 0.2)
  ));
  
  // Cost score (15% weight)
  const costScore = Math.min(100, (
    (Math.max(0, 100 - (this.financialMetrics.costVariance * 2)) * 0.5) +
    (this.financialMetrics.invoiceAccuracy * 0.5)
  ));
  
  // Customer experience score (15% weight)
  const customerScore = Math.min(100, (
    (Math.max(0, 100 - (this.customerExperience.complaintRate * 10)) * 0.4) +
    (this.customerExperience.satisfactionScore * 0.4) +
    (((this.customerExperience.npsScore + 100) / 2) * 0.2)
  ));
  
  // Operational score (10% weight)
  const operationalScore = Math.min(100, (
    (this.operationalMetrics.pickupOnTimeRate * 0.3) +
    (this.operationalMetrics.scanComplianceRate * 0.3) +
    (this.operationalMetrics.trackingAccuracy * 0.2) +
    (this.operationalMetrics.documentationAccuracy * 0.2)
  ));
  
  // Calculate overall score
  const overallScore = (
    (deliveryScore * 0.4) +
    (qualityScore * 0.2) +
    (costScore * 0.15) +
    (customerScore * 0.15) +
    (operationalScore * 0.1)
  );
  
  // Update scores
  this.performanceScore = {
    overall: Math.round(overallScore * 10) / 10, // Round to 1 decimal place
    delivery: Math.round(deliveryScore * 10) / 10,
    quality: Math.round(qualityScore * 10) / 10,
    cost: Math.round(costScore * 10) / 10,
    customerExperience: Math.round(customerScore * 10) / 10,
    operational: Math.round(operationalScore * 10) / 10,
  };
  
  return this.performanceScore;
};

/**
 * Calculate SLA compliance
 */
forwarderPerformanceSchema.methods.calculateSLACompliance = function() {
  // Delivery time compliance
  const deliveryTimeCompliance = this.deliveryPerformance.onTimeDeliveryRate;
  
  // Quality compliance
  const qualityCompliance = Math.min(100, (
    (Math.max(0, 100 - (this.qualityMetrics.damageRate * 10)) * 0.5) +
    (Math.max(0, 100 - (this.qualityMetrics.lossRate * 20)) * 0.5)
  ));
  
  // Pickup compliance
  const pickupCompliance = this.operationalMetrics.pickupOnTimeRate;
  
  // Tracking compliance
  const trackingCompliance = this.operationalMetrics.scanComplianceRate;
  
  // Documentation compliance
  const documentationCompliance = this.operationalMetrics.documentationAccuracy;
  
  // Billing compliance
  const billingCompliance = this.financialMetrics.invoiceAccuracy;
  
  // Overall compliance
  const overallCompliance = (
    (deliveryTimeCompliance * 0.4) +
    (qualityCompliance * 0.2) +
    (pickupCompliance * 0.1) +
    (trackingCompliance * 0.1) +
    (documentationCompliance * 0.1) +
    (billingCompliance * 0.1)
  );
  
  // Update SLA compliance
  this.slaCompliance = {
    overallCompliance: Math.round(overallCompliance * 10) / 10,
    deliveryTimeCompliance: Math.round(deliveryTimeCompliance * 10) / 10,
    qualityCompliance: Math.round(qualityCompliance * 10) / 10,
    pickupCompliance: Math.round(pickupCompliance * 10) / 10,
    trackingCompliance: Math.round(trackingCompliance * 10) / 10,
    documentationCompliance: Math.round(documentationCompliance * 10) / 10,
    billingCompliance: Math.round(billingCompliance * 10) / 10,
  };
  
  return this.slaCompliance;
};

/**
 * Generate recommendations based on performance
 */
forwarderPerformanceSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  
  // Delivery recommendations
  if (this.deliveryPerformance.onTimeDeliveryRate < 90) {
    recommendations.push({
      area: 'delivery',
      issue: 'Low on-time delivery rate',
      recommendation: 'Review delivery processes and identify bottlenecks',
      priority: 'high',
      potentialImpact: 80,
    });
  }
  
  if (this.deliveryPerformance.averageDelay > 12) {
    recommendations.push({
      area: 'delivery',
      issue: 'High average delivery delay',
      recommendation: 'Implement better route planning and tracking',
      priority: 'high',
      potentialImpact: 75,
    });
  }
  
  // Quality recommendations
  if (this.qualityMetrics.damageRate > 2) {
    recommendations.push({
      area: 'quality',
      issue: 'High package damage rate',
      recommendation: 'Review packaging standards and handling procedures',
      priority: 'high',
      potentialImpact: 70,
    });
  }
  
  if (this.qualityMetrics.lossRate > 0.5) {
    recommendations.push({
      area: 'quality',
      issue: 'Package loss rate above threshold',
      recommendation: 'Improve package tracking and security measures',
      priority: 'high',
      potentialImpact: 85,
    });
  }
  
  // Cost recommendations
  if (this.financialMetrics.costVariance > 10) {
    recommendations.push({
      area: 'cost',
      issue: 'High cost variance from expected',
      recommendation: 'Audit invoices and review pricing agreement',
      priority: 'medium',
      potentialImpact: 60,
    });
  }
  
  // Customer recommendations
  if (this.customerExperience.complaintRate > 5) {
    recommendations.push({
      area: 'customer',
      issue: 'High customer complaint rate',
      recommendation: 'Analyze complaint patterns and implement targeted improvements',
      priority: 'high',
      potentialImpact: 75,
    });
  }
  
  // Operational recommendations
  if (this.operationalMetrics.pickupOnTimeRate < 90) {
    recommendations.push({
      area: 'operational',
      issue: 'Low pickup on-time rate',
      recommendation: 'Review pickup scheduling and resource allocation',
      priority: 'medium',
      potentialImpact: 65,
    });
  }
  
  if (this.operationalMetrics.trackingAccuracy < 95) {
    recommendations.push({
      area: 'operational',
      issue: 'Low tracking accuracy',
      recommendation: 'Improve scanning procedures and tracking system integration',
      priority: 'medium',
      potentialImpact: 60,
    });
  }
  
  // Update recommendations
  this.recommendations = recommendations;
  
  return this.recommendations;
};

/**
 * Analyze trends compared to previous period
 * @param {Object} previousPeriod - Performance data from previous period
 */
forwarderPerformanceSchema.methods.analyzeTrends = function(previousPeriod) {
  if (!previousPeriod) {
    return;
  }
  
  // On-time delivery trend
  const onTimeDeliveryDiff = this.deliveryPerformance.onTimeDeliveryRate - previousPeriod.deliveryPerformance.onTimeDeliveryRate;
  const onTimeDeliveryTrend = onTimeDeliveryDiff > 2 ? 'improving' : (onTimeDeliveryDiff < -2 ? 'declining' : 'stable');
  
  // Damage trend
  const damageDiff = previousPeriod.qualityMetrics.damageRate - this.qualityMetrics.damageRate;
  const damageTrend = damageDiff > 0.5 ? 'improving' : (damageDiff < -0.5 ? 'declining' : 'stable');
  
  // Cost trend
  const costDiff = previousPeriod.financialMetrics.averageCostPerShipment - this.financialMetrics.averageCostPerShipment;
  const costTrend = costDiff > 0 ? 'improving' : (costDiff < 0 ? 'declining' : 'stable');
  
  // Volume trend
  const volumeDiff = this.volumeMetrics.totalShipments - previousPeriod.volumeMetrics.totalShipments;
  const volumeTrend = volumeDiff > (previousPeriod.volumeMetrics.totalShipments * 0.05) ? 'increasing' : 
                      (volumeDiff < -(previousPeriod.volumeMetrics.totalShipments * 0.05) ? 'decreasing' : 'stable');
  
  // Customer satisfaction trend
  const satisfactionDiff = this.customerExperience.satisfactionScore - previousPeriod.customerExperience.satisfactionScore;
  const satisfactionTrend = satisfactionDiff > 2 ? 'improving' : (satisfactionDiff < -2 ? 'declining' : 'stable');
  
  // Update trends
  this.trends = {
    onTimeDeliveryTrend,
    damageTrend,
    costTrend,
    volumeTrend,
    customerSatisfactionTrend,
  };
  
  return this.trends;
};

/**
 * Finalize performance report
 * @param {ObjectId} userId - User ID finalizing the report
 */
forwarderPerformanceSchema.methods.finalizeReport = function(userId) {
  // Calculate performance score
  this.calculatePerformanceScore();
  
  // Calculate SLA compliance
  this.calculateSLACompliance();
  
  // Generate recommendations
  this.generateRecommendations();
  
  // Set as finalized
  this.isFinalized = true;
  this.updatedBy = userId;
};

/**
 * Find performance by forwarder and period
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {string} period - Period type
 * @param {Date} date - Date within the period
 * @returns {Promise<Object>} - Performance record
 */
forwarderPerformanceSchema.statics.findByForwarderAndPeriod = async function(forwarderId, period, date) {
  const startOfPeriod = new Date(date);
  const endOfPeriod = new Date(date);
  
  // Adjust dates based on period
  switch (period) {
    case 'daily':
      startOfPeriod.setHours(0, 0, 0, 0);
      endOfPeriod.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      // Set to beginning of week (Monday)
      const day = startOfPeriod.getDay();
      const diff = startOfPeriod.getDate() - day + (day === 0 ? -6 : 1);
      startOfPeriod.setDate(diff);
      startOfPeriod.setHours(0, 0, 0, 0);
      
      // Set to end of week (Sunday)
      endOfPeriod.setDate(startOfPeriod.getDate() + 6);
      endOfPeriod.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      startOfPeriod.setDate(1);
      startOfPeriod.setHours(0, 0, 0, 0);
      
      endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);
      endOfPeriod.setDate(0);
      endOfPeriod.setHours(23, 59, 59, 999);
      break;
    case 'quarterly':
      const quarter = Math.floor(startOfPeriod.getMonth() / 3);
      startOfPeriod.setMonth(quarter * 3);
      startOfPeriod.setDate(1);
      startOfPeriod.setHours(0, 0, 0, 0);
      
      endOfPeriod.setMonth(quarter * 3 + 3);
      endOfPeriod.setDate(0);
      endOfPeriod.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      startOfPeriod.setMonth(0);
      startOfPeriod.setDate(1);
      startOfPeriod.setHours(0, 0, 0, 0);
      
      endOfPeriod.setFullYear(endOfPeriod.getFullYear() + 1);
      endOfPeriod.setMonth(0);
      endOfPeriod.setDate(0);
      endOfPeriod.setHours(23, 59, 59, 999);
      break;
  }
  
  return this.findOne({
    forwarderId,
    period,
    startDate: startOfPeriod,
    endDate: endOfPeriod,
  });
};

/**
 * Get performance history for a forwarder
 * @param {ObjectId} forwarderId - Forwarder ID
 * @param {string} period - Period type
 * @param {number} limit - Number of periods to retrieve
 * @returns {Promise<Array>} - Performance history
 */
forwarderPerformanceSchema.statics.getPerformanceHistory = async function(forwarderId, period, limit = 12) {
  return this.find({
    forwarderId,
    period,
    isFinalized: true,
  })
    .sort({ endDate: -1 })
    .limit(limit);
};

/**
 * Get top performing forwarders
 * @param {string} period - Period type
 * @param {string} metric - Metric to sort by (overall, delivery, quality, cost)
 * @param {number} limit - Number of forwarders to retrieve
 * @returns {Promise<Array>} - Top performing forwarders
 */
forwarderPerformanceSchema.statics.getTopPerformers = async function(period, metric = 'overall', limit = 10) {
  const sortField = `performanceScore.${metric}`;
  const sortOptions = { [sortField]: -1 };
  
  // Get latest performance records for each forwarder
  const latestDate = await this.findOne({
    period,
    isFinalized: true,
  })
    .sort({ endDate: -1 })
    .select('endDate');
  
  if (!latestDate) {
    return [];
  }
  
  return this.find({
    period,
    endDate: latestDate.endDate,
    isFinalized: true,
  })
    .sort(sortOptions)
    .limit(limit)
    .populate('forwarderId', 'name code type');
};

// Create the ForwarderPerformance model
const ForwarderPerformance = mongoose.model('ForwarderPerformance', forwarderPerformanceSchema);

module.exports = ForwarderPerformance;
