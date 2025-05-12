/**
 * Service Area Seed Data Script
 * Populates initial service area data for development and testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ServiceArea = require('../models/ServiceArea');
const Branch = require('../models/Branch');
const { logger } = require('../utils/logger');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-branch', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('Connected to MongoDB');
  seedServiceAreas();
})
.catch((error) => {
  logger.error(`MongoDB connection error: ${error.message}`, { error });
  process.exit(1);
});

/**
 * Seed service areas
 */
const seedServiceAreas = async () => {
  try {
    // Check if service areas already exist
    const count = await ServiceArea.countDocuments();
    
    if (count > 0) {
      logger.info(`${count} service areas already exist. Skipping seed.`);
      process.exit(0);
    }
    
    // Get branches to assign to service areas
    const branches = await Branch.find().select('_id name code type');
    
    if (branches.length === 0) {
      logger.error('No branches found. Please run seedData.js first to create branches.');
      process.exit(1);
    }
    
    // Group branches by type
    const headquarters = branches.find(branch => branch.type === 'headquarters');
    const regionalOffices = branches.filter(branch => branch.type === 'regional');
    const branchOffices = branches.filter(branch => branch.type === 'branch');
    
    if (!headquarters) {
      logger.error('No headquarters found. Please run seedData.js first.');
      process.exit(1);
    }
    
    // Create service areas
    const serviceAreas = [];
    
    // Jakarta HQ Service Area (covers all of Jakarta)
    serviceAreas.push({
      name: 'Jakarta Metropolitan Area',
      code: 'JKT-AREA-001',
      description: 'Service area covering the Jakarta metropolitan area',
      boundaries: {
        type: 'Polygon',
        coordinates: [[
          [106.7000, -6.1000], // Southwest
          [106.9000, -6.1000], // Southeast
          [106.9000, -6.3000], // Northeast
          [106.7000, -6.3000], // Northwest
          [106.7000, -6.1000]  // Close the polygon
        ]]
      },
      center: {
        type: 'Point',
        coordinates: [106.8000, -6.2000]
      },
      coverageRadius: 20,
      type: 'both',
      branches: [
        {
          branchId: headquarters._id,
          assignedDate: new Date(),
          isPrimary: true
        }
      ],
      pricing: {
        basePrice: 15000,
        pricePerKm: 2500,
        minimumDistance: 1,
        maximumDistance: 30,
        specialRates: [
          {
            name: 'Weekend Rate',
            description: 'Higher rate for weekend deliveries',
            rate: 20000,
            conditions: { days: ['saturday', 'sunday'] }
          },
          {
            name: 'Rush Hour Rate',
            description: 'Higher rate during rush hours',
            rate: 25000,
            conditions: { hours: ['07:00-10:00', '16:00-19:00'] }
          }
        ]
      },
      status: 'active'
    });
    
    // Create service areas for each regional office
    for (const regional of regionalOffices) {
      // Extract city name from branch name (assuming format "City Regional Office")
      const cityName = regional.name.replace(' Regional Office', '');
      
      // Generate random coordinates based on region
      const baseLat = getBaseLatitude(cityName);
      const baseLng = getBaseLongitude(cityName);
      
      serviceAreas.push({
        name: `${cityName} Regional Service Area`,
        code: `${regional.code.substring(0, 3)}-AREA-001`,
        description: `Service area covering the ${cityName} region`,
        boundaries: {
          type: 'Polygon',
          coordinates: [[
            [baseLng - 0.1, baseLat - 0.1], // Southwest
            [baseLng + 0.1, baseLat - 0.1], // Southeast
            [baseLng + 0.1, baseLat + 0.1], // Northeast
            [baseLng - 0.1, baseLat + 0.1], // Northwest
            [baseLng - 0.1, baseLat - 0.1]  // Close the polygon
          ]]
        },
        center: {
          type: 'Point',
          coordinates: [baseLng, baseLat]
        },
        coverageRadius: 15,
        type: 'both',
        branches: [
          {
            branchId: regional._id,
            assignedDate: new Date(),
            isPrimary: true
          }
        ],
        pricing: {
          basePrice: 12000,
          pricePerKm: 2000,
          minimumDistance: 1,
          maximumDistance: 25,
          specialRates: [
            {
              name: 'Weekend Rate',
              description: 'Higher rate for weekend deliveries',
              rate: 15000,
              conditions: { days: ['saturday', 'sunday'] }
            }
          ]
        },
        status: 'active'
      });
      
      // Create smaller sub-areas for each regional area
      for (let i = 1; i <= 3; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.1;
        const offsetLng = (Math.random() - 0.5) * 0.1;
        const subAreaLat = baseLat + offsetLat;
        const subAreaLng = baseLng + offsetLng;
        
        serviceAreas.push({
          name: `${cityName} Sub-Area ${i}`,
          code: `${regional.code.substring(0, 3)}-AREA-00${i+1}`,
          description: `Sub-service area ${i} within ${cityName} region`,
          boundaries: {
            type: 'Polygon',
            coordinates: [[
              [subAreaLng - 0.05, subAreaLat - 0.05], // Southwest
              [subAreaLng + 0.05, subAreaLat - 0.05], // Southeast
              [subAreaLng + 0.05, subAreaLat + 0.05], // Northeast
              [subAreaLng - 0.05, subAreaLat + 0.05], // Northwest
              [subAreaLng - 0.05, subAreaLat - 0.05]  // Close the polygon
            ]]
          },
          center: {
            type: 'Point',
            coordinates: [subAreaLng, subAreaLat]
          },
          coverageRadius: 5,
          type: 'both',
          branches: [
            {
              branchId: regional._id,
              assignedDate: new Date(),
              isPrimary: true
            }
          ],
          pricing: {
            basePrice: 10000,
            pricePerKm: 1800,
            minimumDistance: 1,
            maximumDistance: 15,
            specialRates: []
          },
          status: 'active'
        });
      }
    }
    
    // Create service areas for branch offices
    for (const branch of branchOffices) {
      // Skip if more than 10 branch service areas (to avoid too many)
      if (serviceAreas.length > 25) break;
      
      // Extract city name from branch name (assuming format "City Branch")
      const cityName = branch.name.replace(' Branch', '');
      
      // Generate random coordinates based on branch name
      const baseLat = getBaseLatitude(cityName);
      const baseLng = getBaseLongitude(cityName);
      
      serviceAreas.push({
        name: `${cityName} Local Service Area`,
        code: `${branch.code.substring(0, 3)}-AREA-001`,
        description: `Service area covering the ${cityName} local area`,
        boundaries: {
          type: 'Polygon',
          coordinates: [[
            [baseLng - 0.05, baseLat - 0.05], // Southwest
            [baseLng + 0.05, baseLat - 0.05], // Southeast
            [baseLng + 0.05, baseLat + 0.05], // Northeast
            [baseLng - 0.05, baseLat + 0.05], // Northwest
            [baseLng - 0.05, baseLat - 0.05]  // Close the polygon
          ]]
        },
        center: {
          type: 'Point',
          coordinates: [baseLng, baseLat]
        },
        coverageRadius: 8,
        type: 'both',
        branches: [
          {
            branchId: branch._id,
            assignedDate: new Date(),
            isPrimary: true
          }
        ],
        pricing: {
          basePrice: 8000,
          pricePerKm: 1500,
          minimumDistance: 1,
          maximumDistance: 10,
          specialRates: []
        },
        status: 'active'
      });
    }
    
    // Insert service areas into database
    await ServiceArea.insertMany(serviceAreas);
    
    logger.info(`${serviceAreas.length} service areas seeded successfully`);
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding service areas:', error);
    process.exit(1);
  }
};

/**
 * Get base latitude for a city
 * @param {String} cityName - City name
 * @returns {Number} - Base latitude
 */
const getBaseLatitude = (cityName) => {
  const cityCoordinates = {
    'Jakarta': -6.2088,
    'Bandung': -6.9147,
    'Surabaya': -7.2575,
    'Medan': 3.5952,
    'Makassar': -5.1477,
    'Semarang': -6.9932,
    'Palembang': -2.9761,
    'Balikpapan': -1.2379,
    'Manado': 1.4748,
    'Denpasar': -8.6705
  };
  
  return cityCoordinates[cityName] || -6.2088 + (Math.random() - 0.5) * 2; // Default to Jakarta with some randomness
};

/**
 * Get base longitude for a city
 * @param {String} cityName - City name
 * @returns {Number} - Base longitude
 */
const getBaseLongitude = (cityName) => {
  const cityCoordinates = {
    'Jakarta': 106.8456,
    'Bandung': 107.6097,
    'Surabaya': 112.7521,
    'Medan': 98.6722,
    'Makassar': 119.4275,
    'Semarang': 110.4203,
    'Palembang': 104.7754,
    'Balikpapan': 116.8529,
    'Manado': 124.8421,
    'Denpasar': 115.2126
  };
  
  return cityCoordinates[cityName] || 106.8456 + (Math.random() - 0.5) * 2; // Default to Jakarta with some randomness
};
