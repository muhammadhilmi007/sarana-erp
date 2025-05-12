/**
 * Main Seeder
 * Entry point for seeding the database with initial data
 */

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
const { seedDivisions } = require('./divisionSeeder');
const { seedPositions } = require('./positionSeeder');

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectToMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-division';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB Connected: ${mongoURI.split('@').pop()}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Seed all data
 * @returns {Promise<void>}
 */
const seedAll = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Seed divisions first
    logger.info('Seeding divisions...');
    const divisions = await seedDivisions();
    logger.info(`Seeded ${divisions.length} divisions`);

    // Seed positions next (since they depend on divisions)
    logger.info('Seeding positions...');
    const positions = await seedPositions();
    logger.info(`Seeded ${positions.length} positions`);

    logger.info('All data seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// If this file is run directly, seed all data
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  // Run the seeder
  seedAll();
}

module.exports = {
  seedAll,
  connectToMongoDB,
};
