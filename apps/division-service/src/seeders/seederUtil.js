/**
 * Seeder Utility
 * Provides utility functions for seeding data
 */

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

/**
 * Clear a collection
 * @param {mongoose.Model} model - Mongoose model to clear
 * @returns {Promise<void>}
 */
const clearCollection = async (model) => {
  try {
    await model.deleteMany({});
    logger.info(`Cleared ${model.collection.name} collection`);
  } catch (error) {
    logger.error(`Error clearing ${model.collection.name} collection: ${error.message}`);
    throw error;
  }
};

/**
 * Insert data into a collection
 * @param {mongoose.Model} model - Mongoose model to insert data into
 * @param {Array} data - Data to insert
 * @returns {Promise<Array>} - Inserted documents
 */
const insertData = async (model, data) => {
  try {
    const result = await model.insertMany(data);
    logger.info(`Inserted ${result.length} documents into ${model.collection.name}`);
    return result;
  } catch (error) {
    logger.error(`Error inserting data into ${model.collection.name}: ${error.message}`);
    throw error;
  }
};

/**
 * Seed a collection with data
 * @param {mongoose.Model} model - Mongoose model to seed
 * @param {Array} data - Data to seed
 * @param {boolean} clear - Whether to clear the collection first
 * @returns {Promise<Array>} - Seeded documents
 */
const seedCollection = async (model, data, clear = true) => {
  try {
    if (clear) {
      await clearCollection(model);
    }
    return await insertData(model, data);
  } catch (error) {
    logger.error(`Error seeding ${model.collection.name}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  clearCollection,
  insertData,
  seedCollection,
};
