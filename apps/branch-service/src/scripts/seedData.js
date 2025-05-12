/**
 * Seed Data Script
 * Creates initial branches for the Branch Management Service
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Branch = require('../models/Branch');
const BranchHistory = require('../models/BranchHistory');
const { logger } = require('../utils/logger');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-branch', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Connected to MongoDB');
  seedData().then(() => {
    logger.info('Seed data completed');
    process.exit(0);
  }).catch(error => {
    logger.error('Seed data failed:', error);
    process.exit(1);
  });
}).catch(error => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

/**
 * Seed initial data
 */
const seedData = async () => {
  try {
    // Create system admin user ID for history records
    const systemUserId = new mongoose.Types.ObjectId('000000000000000000000000');
    
    // Check if branches already exist
    const branchCount = await Branch.countDocuments();
    if (branchCount > 0) {
      logger.info(`${branchCount} branches already exist, skipping seed data`);
      return;
    }
    
    // Create headquarters
    logger.info('Creating headquarters branch...');
    const headquarters = await Branch.create({
      code: 'HQ-001',
      name: 'Samudra Paket Headquarters',
      type: 'headquarters',
      address: {
        street: 'Jl. Jendral Sudirman No. 123',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        postalCode: '10220',
        country: 'Indonesia',
        coordinates: {
          type: 'Point',
          coordinates: [106.8230, -6.1754], // Jakarta coordinates
        },
      },
      contactInfo: {
        phone: '+62215551234',
        email: 'info@samudrapaket.com',
        fax: '+62215551235',
        website: 'https://samudrapaket.com',
      },
      operationalHours: [
        { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
        { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
        { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
        { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
        { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '16:00' },
        { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '13:00' },
        { day: 'sunday', isOpen: false },
      ],
      resources: {
        employeeCount: 150,
        vehicleCount: 20,
        storageCapacity: 2000,
        maxDailyPackages: 5000,
      },
      performanceMetrics: {
        monthlyRevenue: 5000000000,
        monthlyPackages: 150000,
        customerSatisfaction: 90,
        deliverySuccessRate: 98,
        lastUpdated: new Date(),
      },
      status: 'active',
      statusHistory: [{
        status: 'active',
        reason: 'Initial creation',
        changedBy: systemUserId,
        changedAt: new Date(),
      }],
      createdBy: systemUserId,
      updatedBy: systemUserId,
    });
    
    // Record creation in history
    await BranchHistory.recordCreation(
      headquarters._id,
      headquarters.toObject(),
      systemUserId
    );
    
    // Create regional offices
    logger.info('Creating regional branches...');
    const regions = [
      {
        code: 'REG-JKT',
        name: 'Jakarta Regional Office',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        coordinates: [106.8230, -6.1754],
      },
      {
        code: 'REG-BDG',
        name: 'Bandung Regional Office',
        city: 'Bandung',
        state: 'Jawa Barat',
        coordinates: [107.6097, -6.9147],
      },
      {
        code: 'REG-SBY',
        name: 'Surabaya Regional Office',
        city: 'Surabaya',
        state: 'Jawa Timur',
        coordinates: [112.7520, -7.2575],
      },
      {
        code: 'REG-MDN',
        name: 'Medan Regional Office',
        city: 'Medan',
        state: 'Sumatera Utara',
        coordinates: [98.6722, 3.5952],
      },
      {
        code: 'REG-MKS',
        name: 'Makassar Regional Office',
        city: 'Makassar',
        state: 'Sulawesi Selatan',
        coordinates: [119.4324, -5.1477],
      },
    ];
    
    const regionalOffices = [];
    
    for (const region of regions) {
      const regionalOffice = await Branch.create({
        code: region.code,
        name: region.name,
        type: 'regional',
        parentId: headquarters._id,
        address: {
          street: `Jl. Utama No. ${Math.floor(Math.random() * 100) + 1}`,
          city: region.city,
          state: region.state,
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'Indonesia',
          coordinates: {
            type: 'Point',
            coordinates: region.coordinates,
          },
        },
        contactInfo: {
          phone: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
          email: `${region.code.toLowerCase()}@samudrapaket.com`,
          fax: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
          website: `https://${region.code.toLowerCase()}.samudrapaket.com`,
        },
        operationalHours: [
          { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '16:00' },
          { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '13:00' },
          { day: 'sunday', isOpen: false },
        ],
        resources: {
          employeeCount: Math.floor(Math.random() * 50) + 30,
          vehicleCount: Math.floor(Math.random() * 15) + 5,
          storageCapacity: Math.floor(Math.random() * 1000) + 500,
          maxDailyPackages: Math.floor(Math.random() * 2000) + 1000,
        },
        performanceMetrics: {
          monthlyRevenue: Math.floor(Math.random() * 1000000000) + 500000000,
          monthlyPackages: Math.floor(Math.random() * 50000) + 10000,
          customerSatisfaction: Math.floor(Math.random() * 15) + 80,
          deliverySuccessRate: Math.floor(Math.random() * 5) + 95,
          lastUpdated: new Date(),
        },
        status: 'active',
        statusHistory: [{
          status: 'active',
          reason: 'Initial creation',
          changedBy: systemUserId,
          changedAt: new Date(),
        }],
        createdBy: systemUserId,
        updatedBy: systemUserId,
      });
      
      // Record creation in history
      await BranchHistory.recordCreation(
        regionalOffice._id,
        regionalOffice.toObject(),
        systemUserId
      );
      
      regionalOffices.push(regionalOffice);
    }
    
    // Create branch offices
    logger.info('Creating branch offices...');
    const branchOffices = [
      {
        code: 'BDG-001',
        name: 'Bandung Dago Branch',
        city: 'Bandung',
        state: 'Jawa Barat',
        street: 'Jl. Dago No. 45',
        coordinates: [107.6133, -6.8855],
        region: 'REG-BDG',
      },
      {
        code: 'BDG-002',
        name: 'Bandung Buah Batu Branch',
        city: 'Bandung',
        state: 'Jawa Barat',
        street: 'Jl. Buah Batu No. 123',
        coordinates: [107.6339, -6.9444],
        region: 'REG-BDG',
      },
      {
        code: 'JKT-001',
        name: 'Jakarta Sudirman Branch',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        street: 'Jl. Jendral Sudirman No. 45',
        coordinates: [106.8230, -6.2088],
        region: 'REG-JKT',
      },
      {
        code: 'JKT-002',
        name: 'Jakarta Kelapa Gading Branch',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        street: 'Jl. Boulevard Raya No. 27',
        coordinates: [106.8969, -6.1526],
        region: 'REG-JKT',
      },
      {
        code: 'SBY-001',
        name: 'Surabaya Tunjungan Branch',
        city: 'Surabaya',
        state: 'Jawa Timur',
        street: 'Jl. Tunjungan No. 56',
        coordinates: [112.7378, -7.2575],
        region: 'REG-SBY',
      },
    ];
    
    for (const branch of branchOffices) {
      // Find parent regional office
      const parentRegional = regionalOffices.find(r => r.code === branch.region);
      
      if (!parentRegional) {
        logger.warn(`Parent regional office ${branch.region} not found for branch ${branch.code}`);
        continue;
      }
      
      const branchOffice = await Branch.create({
        code: branch.code,
        name: branch.name,
        type: 'branch',
        parentId: parentRegional._id,
        address: {
          street: branch.street,
          city: branch.city,
          state: branch.state,
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'Indonesia',
          coordinates: {
            type: 'Point',
            coordinates: branch.coordinates,
          },
        },
        contactInfo: {
          phone: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
          email: `${branch.code.toLowerCase()}@samudrapaket.com`,
          fax: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
        },
        operationalHours: [
          { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '16:00' },
          { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '13:00' },
          { day: 'sunday', isOpen: false },
        ],
        resources: {
          employeeCount: Math.floor(Math.random() * 20) + 10,
          vehicleCount: Math.floor(Math.random() * 10) + 3,
          storageCapacity: Math.floor(Math.random() * 500) + 200,
          maxDailyPackages: Math.floor(Math.random() * 1000) + 500,
        },
        performanceMetrics: {
          monthlyRevenue: Math.floor(Math.random() * 500000000) + 100000000,
          monthlyPackages: Math.floor(Math.random() * 20000) + 5000,
          customerSatisfaction: Math.floor(Math.random() * 15) + 80,
          deliverySuccessRate: Math.floor(Math.random() * 5) + 95,
          lastUpdated: new Date(),
        },
        status: 'active',
        statusHistory: [{
          status: 'active',
          reason: 'Initial creation',
          changedBy: systemUserId,
          changedAt: new Date(),
        }],
        createdBy: systemUserId,
        updatedBy: systemUserId,
      });
      
      // Record creation in history
      await BranchHistory.recordCreation(
        branchOffice._id,
        branchOffice.toObject(),
        systemUserId
      );
    }
    
    logger.info('Seed data completed successfully');
  } catch (error) {
    logger.error('Error seeding data:', error);
    throw error;
  }
};
