/**
 * Forwarder Rate Controller
 * Handles forwarder rate management operations with multi-tier pricing
 */

const Forwarder = require('../models/Forwarder');
const ForwarderHistory = require('../models/ForwarderHistory');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types;

/**
 * Get forwarder rate cards
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getForwarderRateCards = async (req, res, next) => {
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
        rateCards: forwarder.rateCards || [],
      },
    });
  } catch (error) {
    logger.error(`Error getting forwarder rate cards ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add rate card to forwarder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addRateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rateCardData = req.body;
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
    
    // Add rate card
    forwarder.addRateCard(rateCardData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'add',
      null,
      rateCardData,
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        rateCard: forwarder.rateCards[forwarder.rateCards.length - 1],
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error adding rate card to forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update forwarder rate card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateRateCard = async (req, res, next) => {
  try {
    const { id, rateCardId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Update rate card
    forwarder.updateRateCard(rateCardId, updateData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated rate card
    const updatedRateCard = forwarder.rateCards.id(rateCardId);
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'update',
      oldData,
      updatedRateCard.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        rateCard: updatedRateCard,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating rate card ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete forwarder rate card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteRateCard = async (req, res, next) => {
  try {
    const { id, rateCardId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Remove rate card
    forwarder.removeRateCard(rateCardId);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'remove',
      oldData,
      null,
      userId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Rate card deleted successfully',
      data: {
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error deleting rate card ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update rate card status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateRateCardStatus = async (req, res, next) => {
  try {
    const { id, rateCardId } = req.params;
    const { isActive } = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Update rate card status
    forwarder.updateRateCard(rateCardId, { isActive });
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated rate card
    const updatedRateCard = forwarder.rateCards.id(rateCardId);
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'status',
      oldData,
      updatedRateCard.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        rateCard: updatedRateCard,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating rate card status ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add weight break to rate card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addWeightBreak = async (req, res, next) => {
  try {
    const { id, rateCardId } = req.params;
    const weightBreakData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Add weight break
    rateCard.weightBreaks.push(weightBreakData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated rate card
    const updatedRateCard = forwarder.rateCards.id(rateCardId);
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'weight-break-add',
      oldData,
      updatedRateCard.toObject(),
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        weightBreak: updatedRateCard.weightBreaks[updatedRateCard.weightBreaks.length - 1],
        rateCard: updatedRateCard,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error adding weight break to rate card ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update weight break in rate card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateWeightBreak = async (req, res, next) => {
  try {
    const { id, rateCardId, weightBreakId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId) || !isValidObjectId(weightBreakId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Find weight break
    const weightBreak = rateCard.weightBreaks.id(weightBreakId);
    
    if (!weightBreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Weight break not found',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Update weight break
    Object.assign(weightBreak, updateData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated rate card
    const updatedRateCard = forwarder.rateCards.id(rateCardId);
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'weight-break-update',
      oldData,
      updatedRateCard.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        weightBreak: updatedRateCard.weightBreaks.id(weightBreakId),
        rateCard: updatedRateCard,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating weight break ${req.params.weightBreakId} in rate card ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete weight break from rate card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteWeightBreak = async (req, res, next) => {
  try {
    const { id, rateCardId, weightBreakId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId) || !isValidObjectId(weightBreakId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Find weight break
    const weightBreak = rateCard.weightBreaks.id(weightBreakId);
    
    if (!weightBreak) {
      return res.status(404).json({
        status: 'error',
        message: 'Weight break not found',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Remove weight break
    weightBreak.remove();
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated rate card
    const updatedRateCard = forwarder.rateCards.id(rateCardId);
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'weight-break-remove',
      oldData,
      updatedRateCard.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Weight break deleted successfully',
      data: {
        rateCard: updatedRateCard,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error deleting weight break ${req.params.weightBreakId} from rate card ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add zone pricing to rate card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const addZonePricing = async (req, res, next) => {
  try {
    const { id, rateCardId } = req.params;
    const zonePricingData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Check if zone pricing with same from/to zones already exists
    const existingZonePricing = rateCard.zonePricing.find(
      zp => zp.fromZone === zonePricingData.fromZone && zp.toZone === zonePricingData.toZone
    );
    
    if (existingZonePricing) {
      return res.status(400).json({
        status: 'error',
        message: 'Zone pricing with these zones already exists',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Add zone pricing
    rateCard.zonePricing.push(zonePricingData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated rate card
    const updatedRateCard = forwarder.rateCards.id(rateCardId);
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'zone-pricing-add',
      oldData,
      updatedRateCard.toObject(),
      userId
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        zonePricing: updatedRateCard.zonePricing[updatedRateCard.zonePricing.length - 1],
        rateCard: updatedRateCard,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error adding zone pricing to rate card ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update zone pricing in rate card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateZonePricing = async (req, res, next) => {
  try {
    const { id, rateCardId, zonePricingId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId) || !isValidObjectId(zonePricingId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Find zone pricing
    const zonePricing = rateCard.zonePricing.id(zonePricingId);
    
    if (!zonePricing) {
      return res.status(404).json({
        status: 'error',
        message: 'Zone pricing not found',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Update zone pricing
    Object.assign(zonePricing, updateData);
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated rate card
    const updatedRateCard = forwarder.rateCards.id(rateCardId);
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'zone-pricing-update',
      oldData,
      updatedRateCard.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        zonePricing: updatedRateCard.zonePricing.id(zonePricingId),
        rateCard: updatedRateCard,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error updating zone pricing ${req.params.zonePricingId} in rate card ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete zone pricing from rate card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteZonePricing = async (req, res, next) => {
  try {
    const { id, rateCardId, zonePricingId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(id) || !isValidObjectId(rateCardId) || !isValidObjectId(zonePricingId)) {
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
    
    // Find rate card
    const rateCard = forwarder.rateCards.id(rateCardId);
    
    if (!rateCard) {
      return res.status(404).json({
        status: 'error',
        message: 'Rate card not found',
      });
    }
    
    // Find zone pricing
    const zonePricing = rateCard.zonePricing.id(zonePricingId);
    
    if (!zonePricing) {
      return res.status(404).json({
        status: 'error',
        message: 'Zone pricing not found',
      });
    }
    
    // Store old data for history
    const oldData = rateCard.toObject();
    
    // Remove zone pricing
    zonePricing.remove();
    forwarder.updatedBy = userId;
    
    await forwarder.save();
    
    // Get updated rate card
    const updatedRateCard = forwarder.rateCards.id(rateCardId);
    
    // Record update in history
    await ForwarderHistory.recordRateUpdate(
      forwarder._id,
      'zone-pricing-remove',
      oldData,
      updatedRateCard.toObject(),
      userId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Zone pricing deleted successfully',
      data: {
        rateCard: updatedRateCard,
        forwarder,
      },
    });
  } catch (error) {
    logger.error(`Error deleting zone pricing ${req.params.zonePricingId} from rate card ${req.params.rateCardId} for forwarder ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Compare rate cards from different forwarders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const compareRateCards = async (req, res, next) => {
  try {
    const { rateCardIds, origin, destination, weight, dimensions, serviceType } = req.body;
    
    if (!rateCardIds || !Array.isArray(rateCardIds) || rateCardIds.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'At least two rate card IDs are required for comparison',
      });
    }
    
    // Validate rate card IDs
    for (const rateCardId of rateCardIds) {
      if (!isValidObjectId(rateCardId)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid rate card ID: ${rateCardId}`,
        });
      }
    }
    
    // Find forwarders with the specified rate cards
    const forwarders = await Forwarder.find({
      'rateCards._id': { $in: rateCardIds },
      status: 'active',
    });
    
    if (!forwarders || forwarders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No active forwarders found with the specified rate cards',
      });
    }
    
    // Extract rate cards for comparison
    const rateCardsForComparison = [];
    
    for (const forwarder of forwarders) {
      for (const rateCardId of rateCardIds) {
        const rateCard = forwarder.rateCards.id(rateCardId);
        
        if (rateCard && rateCard.isActive) {
          // Calculate shipping cost if origin, destination, and weight are provided
          let calculatedCost = null;
          
          if (origin && destination && weight) {
            // Calculate volumetric weight if dimensions are provided
            let calculatedWeight = parseFloat(weight);
            
            if (dimensions && dimensions.length && dimensions.width && dimensions.height) {
              const volumetricWeight = (
                dimensions.length * dimensions.width * dimensions.height
              ) / (rateCard.volumetricDivisor || 5000);
              
              // Use the greater of actual weight and volumetric weight
              calculatedWeight = Math.max(calculatedWeight, volumetricWeight);
            }
            
            // Find applicable zone pricing
            let zonePricing = null;
            
            if (rateCard.zonePricing && rateCard.zonePricing.length > 0) {
              zonePricing = rateCard.zonePricing.find(
                zone => (
                  zone.originZone === origin || 
                  zone.originZone === 'all'
                ) && (
                  zone.destinationZone === destination || 
                  zone.destinationZone === 'all'
                ) && (
                  !serviceType || 
                  zone.serviceType === serviceType || 
                  zone.serviceType === 'standard'
                )
              );
            }
            
            if (zonePricing) {
              // Find applicable weight break
              const weightBreak = zonePricing.weightBreaks.find(
                wb => calculatedWeight <= wb.maxWeight
              ) || zonePricing.weightBreaks[zonePricing.weightBreaks.length - 1];
              
              if (weightBreak) {
                calculatedCost = weightBreak.rate;
                
                // Apply additional charges
                if (rateCard.fuelSurcharge) {
                  calculatedCost += (calculatedCost * rateCard.fuelSurcharge) / 100;
                }
              }
            } else {
              // Use base rate if no zone pricing is found
              calculatedCost = rateCard.baseRate;
              
              // Apply additional charges
              if (rateCard.fuelSurcharge) {
                calculatedCost += (calculatedCost * rateCard.fuelSurcharge) / 100;
              }
            }
          }
          
          rateCardsForComparison.push({
            rateCardId: rateCard._id,
            forwarderId: forwarder._id,
            forwarderName: forwarder.name,
            forwarderCode: forwarder.code,
            rateCardName: rateCard.name,
            effectiveDate: rateCard.effectiveDate,
            expiryDate: rateCard.expiryDate,
            currency: rateCard.currency,
            baseRate: rateCard.baseRate,
            serviceType: rateCard.serviceType,
            calculatedCost,
          });
        }
      }
    }
    
    // Sort by calculated cost if available, otherwise by base rate
    rateCardsForComparison.sort((a, b) => {
      if (a.calculatedCost !== null && b.calculatedCost !== null) {
        return a.calculatedCost - b.calculatedCost;
      }
      return a.baseRate - b.baseRate;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        rateCards: rateCardsForComparison,
        count: rateCardsForComparison.length,
        parameters: {
          origin,
          destination,
          weight,
          dimensions,
          serviceType,
        },
      },
    });
  } catch (error) {
    logger.error('Error comparing rate cards:', error);
    next(error);
  }
};

module.exports = {
  getForwarderRateCards,
  addRateCard,
  updateRateCard,
  deleteRateCard,
  updateRateCardStatus,
  addWeightBreak,
  updateWeightBreak,
  deleteWeightBreak,
  addZonePricing,
  updateZonePricing,
  deleteZonePricing,
  compareRateCards,
};
