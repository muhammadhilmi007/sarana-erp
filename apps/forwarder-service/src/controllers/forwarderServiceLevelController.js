/**
 * Forwarder Service Level Controller
 * Handles forwarder service level configuration operations
 */

const Forwarder = require('../models/Forwarder');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get forwarder service level configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderServiceLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    
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
    
    res.status(200).json({
      status: 'success',
      data: {
        serviceLevel: forwarder.serviceLevel || {},
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder service level ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder service level configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateForwarderServiceLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceLevelData = req.body;
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
    
    // Store old service level for history
    const oldServiceLevel = { ...forwarder.serviceLevel };
    
    // Update service level configuration
    forwarder.serviceLevel = {
      ...forwarder.serviceLevel,
      ...serviceLevelData,
    };
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'serviceLevel',
      oldServiceLevel,
      forwarder.serviceLevel,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        serviceLevel: forwarder.serviceLevel,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating forwarder service level ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update delivery time standards
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateDeliveryTimeStandards = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryTimeStandard, deliveryTimeExpress } = req.body;
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
    
    // Store old delivery times for history
    const oldDeliveryTimes = {
      deliveryTimeStandard: forwarder.serviceLevel?.deliveryTimeStandard,
      deliveryTimeExpress: forwarder.serviceLevel?.deliveryTimeExpress,
    };
    
    // Update delivery time standards
    forwarder.serviceLevel = {
      ...forwarder.serviceLevel,
    };
    
    if (deliveryTimeStandard !== undefined) {
      forwarder.serviceLevel.deliveryTimeStandard = parseInt(deliveryTimeStandard);
    }
    
    if (deliveryTimeExpress !== undefined) {
      forwarder.serviceLevel.deliveryTimeExpress = parseInt(deliveryTimeExpress);
    }
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'deliveryTimeStandards',
      oldDeliveryTimes,
      {
        deliveryTimeStandard: forwarder.serviceLevel.deliveryTimeStandard,
        deliveryTimeExpress: forwarder.serviceLevel.deliveryTimeExpress,
      },
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        deliveryTimeStandards: {
          deliveryTimeStandard: forwarder.serviceLevel.deliveryTimeStandard,
          deliveryTimeExpress: forwarder.serviceLevel.deliveryTimeExpress,
        },
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating delivery time standards ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update service guarantees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateServiceGuarantees = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      guaranteedDelivery, 
      insuranceIncluded, 
      trackingCapability, 
      proofOfDelivery,
      returnService,
      saturdayDelivery,
      sundayDelivery,
      holidayDelivery,
    } = req.body;
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
    
    // Store old service guarantees for history
    const oldServiceGuarantees = {
      guaranteedDelivery: forwarder.serviceLevel?.guaranteedDelivery,
      insuranceIncluded: forwarder.serviceLevel?.insuranceIncluded,
      trackingCapability: forwarder.serviceLevel?.trackingCapability,
      proofOfDelivery: forwarder.serviceLevel?.proofOfDelivery,
      returnService: forwarder.serviceLevel?.returnService,
      saturdayDelivery: forwarder.serviceLevel?.saturdayDelivery,
      sundayDelivery: forwarder.serviceLevel?.sundayDelivery,
      holidayDelivery: forwarder.serviceLevel?.holidayDelivery,
    };
    
    // Update service guarantees
    forwarder.serviceLevel = {
      ...forwarder.serviceLevel,
    };
    
    if (guaranteedDelivery !== undefined) {
      forwarder.serviceLevel.guaranteedDelivery = guaranteedDelivery;
    }
    
    if (insuranceIncluded !== undefined) {
      forwarder.serviceLevel.insuranceIncluded = insuranceIncluded;
    }
    
    if (trackingCapability !== undefined) {
      forwarder.serviceLevel.trackingCapability = trackingCapability;
    }
    
    if (proofOfDelivery !== undefined) {
      forwarder.serviceLevel.proofOfDelivery = proofOfDelivery;
    }
    
    if (returnService !== undefined) {
      forwarder.serviceLevel.returnService = returnService;
    }
    
    if (saturdayDelivery !== undefined) {
      forwarder.serviceLevel.saturdayDelivery = saturdayDelivery;
    }
    
    if (sundayDelivery !== undefined) {
      forwarder.serviceLevel.sundayDelivery = sundayDelivery;
    }
    
    if (holidayDelivery !== undefined) {
      forwarder.serviceLevel.holidayDelivery = holidayDelivery;
    }
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'serviceGuarantees',
      oldServiceGuarantees,
      {
        guaranteedDelivery: forwarder.serviceLevel.guaranteedDelivery,
        insuranceIncluded: forwarder.serviceLevel.insuranceIncluded,
        trackingCapability: forwarder.serviceLevel.trackingCapability,
        proofOfDelivery: forwarder.serviceLevel.proofOfDelivery,
        returnService: forwarder.serviceLevel.returnService,
        saturdayDelivery: forwarder.serviceLevel.saturdayDelivery,
        sundayDelivery: forwarder.serviceLevel.sundayDelivery,
        holidayDelivery: forwarder.serviceLevel.holidayDelivery,
      },
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        serviceGuarantees: {
          guaranteedDelivery: forwarder.serviceLevel.guaranteedDelivery,
          insuranceIncluded: forwarder.serviceLevel.insuranceIncluded,
          trackingCapability: forwarder.serviceLevel.trackingCapability,
          proofOfDelivery: forwarder.serviceLevel.proofOfDelivery,
          returnService: forwarder.serviceLevel.returnService,
          saturdayDelivery: forwarder.serviceLevel.saturdayDelivery,
          sundayDelivery: forwarder.serviceLevel.sundayDelivery,
          holidayDelivery: forwarder.serviceLevel.holidayDelivery,
        },
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating service guarantees ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update package limitations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updatePackageLimitations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      maxWeight, 
      maxDimensions,
      specialHandling,
    } = req.body;
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
    
    // Store old package limitations for history
    const oldPackageLimitations = {
      maxWeight: forwarder.serviceLevel?.maxWeight,
      maxDimensions: forwarder.serviceLevel?.maxDimensions,
      specialHandling: forwarder.serviceLevel?.specialHandling,
    };
    
    // Update package limitations
    forwarder.serviceLevel = {
      ...forwarder.serviceLevel,
    };
    
    if (maxWeight !== undefined) {
      forwarder.serviceLevel.maxWeight = parseFloat(maxWeight);
    }
    
    if (maxDimensions) {
      forwarder.serviceLevel.maxDimensions = {
        ...forwarder.serviceLevel.maxDimensions,
        ...maxDimensions,
      };
    }
    
    if (specialHandling) {
      forwarder.serviceLevel.specialHandling = {
        ...forwarder.serviceLevel.specialHandling,
        ...specialHandling,
      };
    }
    
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordUpdate(
      forwarder._id,
      'packageLimitations',
      oldPackageLimitations,
      {
        maxWeight: forwarder.serviceLevel.maxWeight,
        maxDimensions: forwarder.serviceLevel.maxDimensions,
        specialHandling: forwarder.serviceLevel.specialHandling,
      },
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        packageLimitations: {
          maxWeight: forwarder.serviceLevel.maxWeight,
          maxDimensions: forwarder.serviceLevel.maxDimensions,
          specialHandling: forwarder.serviceLevel.specialHandling,
        },
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating package limitations ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Compare service levels between forwarders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const compareServiceLevels = async (req, res, next) => {
  try {
    const { forwarderIds } = req.body;
    
    if (!forwarderIds || !Array.isArray(forwarderIds) || forwarderIds.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'At least two valid forwarder IDs are required',
      });
    }
    
    // Validate forwarder IDs
    const invalidIds = forwarderIds.filter(id => !isValidObjectId(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid forwarder ID format',
        invalidIds,
      });
    }
    
    // Find forwarders
    const forwarders = await Forwarder.find({
      _id: { $in: forwarderIds },
    }).select('name code type serviceLevel');
    
    if (forwarders.length !== forwarderIds.length) {
      const foundIds = forwarders.map(f => f._id.toString());
      const missingIds = forwarderIds.filter(id => !foundIds.includes(id));
      
      return res.status(404).json({
        status: 'error',
        message: 'Some forwarders not found',
        missingIds,
      });
    }
    
    // Prepare comparison data
    const comparison = {
      forwarders: forwarders.map(forwarder => ({
        _id: forwarder._id,
        name: forwarder.name,
        code: forwarder.code,
        type: forwarder.type,
      })),
      deliveryTimes: {
        standard: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          deliveryTime: forwarder.serviceLevel?.deliveryTimeStandard || 0,
        })),
        express: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          deliveryTime: forwarder.serviceLevel?.deliveryTimeExpress || 0,
        })),
      },
      serviceGuarantees: {
        guaranteedDelivery: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          value: forwarder.serviceLevel?.guaranteedDelivery || false,
        })),
        insuranceIncluded: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          value: forwarder.serviceLevel?.insuranceIncluded || false,
        })),
        trackingCapability: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          value: forwarder.serviceLevel?.trackingCapability || false,
        })),
        proofOfDelivery: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          value: forwarder.serviceLevel?.proofOfDelivery || false,
        })),
        returnService: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          value: forwarder.serviceLevel?.returnService || false,
        })),
        weekendDelivery: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          saturday: forwarder.serviceLevel?.saturdayDelivery || false,
          sunday: forwarder.serviceLevel?.sundayDelivery || false,
        })),
      },
      packageLimitations: {
        maxWeight: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          value: forwarder.serviceLevel?.maxWeight || 0,
        })),
        maxDimensions: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          length: forwarder.serviceLevel?.maxDimensions?.length || 0,
          width: forwarder.serviceLevel?.maxDimensions?.width || 0,
          height: forwarder.serviceLevel?.maxDimensions?.height || 0,
        })),
        specialHandling: forwarders.map(forwarder => ({
          forwarderId: forwarder._id,
          name: forwarder.name,
          fragile: forwarder.serviceLevel?.specialHandling?.fragile || false,
          hazardous: forwarder.serviceLevel?.specialHandling?.hazardous || false,
          refrigerated: forwarder.serviceLevel?.specialHandling?.refrigerated || false,
          oversized: forwarder.serviceLevel?.specialHandling?.oversized || false,
        })),
      },
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        comparison,
      },
    });
  } catch (error) {
    logger.error('Error comparing service levels:', error);
    next(error);
  }
};

/**
 * Get forwarders by service capabilities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwardersByServiceCapabilities = async (req, res, next) => {
  try {
    const { 
      maxDeliveryTime,
      guaranteedDelivery,
      insuranceIncluded,
      trackingCapability,
      proofOfDelivery,
      returnService,
      weekendDelivery,
      minMaxWeight,
      specialHandling,
    } = req.query;
    
    // Build query
    const query = {
      status: 'active',
    };
    
    if (maxDeliveryTime) {
      query['serviceLevel.deliveryTimeStandard'] = { $lte: parseInt(maxDeliveryTime) };
    }
    
    if (guaranteedDelivery === 'true') {
      query['serviceLevel.guaranteedDelivery'] = true;
    }
    
    if (insuranceIncluded === 'true') {
      query['serviceLevel.insuranceIncluded'] = true;
    }
    
    if (trackingCapability === 'true') {
      query['serviceLevel.trackingCapability'] = true;
    }
    
    if (proofOfDelivery === 'true') {
      query['serviceLevel.proofOfDelivery'] = true;
    }
    
    if (returnService === 'true') {
      query['serviceLevel.returnService'] = true;
    }
    
    if (weekendDelivery === 'true') {
      query.$or = [
        { 'serviceLevel.saturdayDelivery': true },
        { 'serviceLevel.sundayDelivery': true },
      ];
    }
    
    if (minMaxWeight) {
      query['serviceLevel.maxWeight'] = { $gte: parseFloat(minMaxWeight) };
    }
    
    if (specialHandling) {
      const handlingTypes = specialHandling.split(',');
      
      handlingTypes.forEach(type => {
        if (['fragile', 'hazardous', 'refrigerated', 'oversized'].includes(type)) {
          query[`serviceLevel.specialHandling.${type}`] = true;
        }
      });
    }
    
    // Find forwarders
    const forwarders = await Forwarder.find(query)
      .select('name code type serviceLevel')
      .sort({ name: 1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        forwarders,
        count: forwarders.length,
        query: req.query,
      },
    });
  } catch (error) {
    logger.error('Error getting forwarders by service capabilities:', error);
    next(error);
  }
};

module.exports = {
  getForwarderServiceLevel,
  updateForwarderServiceLevel,
  updateDeliveryTimeStandards,
  updateServiceGuarantees,
  updatePackageLimitations,
  compareServiceLevels,
  getForwardersByServiceCapabilities,
};
