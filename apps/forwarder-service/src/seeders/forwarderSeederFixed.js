/**
 * Forwarder Seeder (Fixed)
 * Seeds the database with initial forwarder partners data
 */

const mongoose = require('mongoose');
const Forwarder = require('../models/Forwarder');
const ForwarderAllocation = require('../models/ForwarderAllocation');
const { logger } = require('../utils/logger');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-forwarder-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    logger.info('Connected to MongoDB');
    seedForwarders();
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

/**
 * Seed forwarder partners data
 */
const seedForwarders = async () => {
  try {
    // Check if forwarders already exist
    const count = await Forwarder.countDocuments();
    
    if (count > 0) {
      logger.info(`Database already has ${count} forwarders. Skipping seeder.`);
      process.exit(0);
    }
    
    logger.info('Seeding forwarder partners...');
    
    // Sample forwarder data
    const forwarders = [
      {
        name: 'JNE Express',
        code: 'JNE001',
        type: 'domestic',
        status: 'active',
        companyInfo: {
          legalName: 'PT Jalur Nugraha Ekakurir',
          taxId: '01.123.456.7-001.000',
          registrationNumber: 'AHU-1234.AH.01.01.2010',
          yearEstablished: 1990,
          website: 'www.jne.co.id',
          logo: 'jne-logo.png'
        },
        contactInfo: {
          primaryContact: {
            name: 'Ahmad Wijaya',
            position: 'Account Manager',
            phone: '021-5655555',
            email: 'ahmad.wijaya@jne.co.id'
          },
          secondaryContact: {
            name: 'Budi Santoso',
            position: 'Operations Manager',
            phone: '021-5655556',
            email: 'budi.santoso@jne.co.id'
          },
          address: {
            street: 'Jl. Tomang Raya No. 11',
            city: 'Jakarta Barat',
            state: 'DKI Jakarta',
            postalCode: '11440',
            country: 'Indonesia',
            coordinates: {
              type: 'Point',
              coordinates: [106.8, -6.2]
            }
          }
        },
        contract: {
          contractNumber: 'JNE/2023/001',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2025-12-31'),
          renewalDate: new Date('2025-11-01'),
          contractType: 'preferred',
          paymentTerms: 'net30',
          specialTerms: 'Standard terms with 5% volume discount'
        },
        financialSettlement: {
          paymentMethod: 'bank-transfer',
          creditLimit: 50000000,
          currentBalance: 0,
          bankDetails: {
            bankName: 'Bank Mandiri',
            accountNumber: '1234567890',
            accountName: 'PT Jalur Nugraha Ekakurir',
            branchName: 'Jakarta Pusat',
            swiftCode: 'BMRIIDJA'
          }
        },
        serviceLevel: {
          deliveryTimeStandard: 72, // 3 days in hours
          deliveryTimeExpress: 24, // 1 day in hours
          guaranteedDelivery: true,
          insuranceIncluded: true,
          trackingCapability: true,
          proofOfDelivery: true,
          returnService: true,
          saturdayDelivery: true,
          sundayDelivery: false,
          holidayDelivery: false,
          maxWeight: 30,
          maxDimensions: {
            length: 100,
            width: 100,
            height: 100
          },
          specialHandling: {
            fragile: true,
            hazardous: false,
            refrigerated: false,
            oversized: true
          }
        },
        performanceMetrics: {
          onTimeDeliveryRate: 95.2,
          damageRate: 0.5,
          lossRate: 0.1,
          returnRate: 1.2,
          customerSatisfactionScore: 4.7,
          responseTime: 2, // hours
          resolutionRate: 98.0,
          pickupAccuracy: 99.5,
          invoiceAccuracy: 99.8,
          lastUpdated: new Date()
        },
        rateCards: [
          {
            name: 'Standard Rate Card 2023',
            effectiveDate: new Date('2023-01-01'),
            expiryDate: new Date('2023-12-31'),
            isActive: true,
            currency: 'IDR',
            originType: 'domestic',
            destinationType: 'domestic',
            serviceType: 'standard',
            baseRate: 10000,
            weightIncrement: 1,
            volumetricDivisor: 5000,
            minimumCharge: 10000,
            fuelSurcharge: 5,
            discounts: [
              {
                threshold: 100,
                discountPercentage: 5
              },
              {
                threshold: 500,
                discountPercentage: 10
              }
            ]
          }
        ],
        coverageAreas: [
          {
            name: 'Jakarta Barat',
            type: 'city',
            code: 'JKT-BAR',
            serviceLevel: 'express',
            isActive: true,
            deliveryTimeAdjustment: 0,
            surcharge: 0
          },
          {
            name: 'Jakarta Pusat',
            type: 'city',
            code: 'JKT-PUS',
            serviceLevel: 'express',
            isActive: true,
            deliveryTimeAdjustment: 0,
            surcharge: 0
          },
          {
            name: 'Jakarta Selatan',
            type: 'city',
            code: 'JKT-SEL',
            serviceLevel: 'express',
            isActive: true,
            deliveryTimeAdjustment: 0,
            surcharge: 0
          },
          {
            name: 'Jakarta Timur',
            type: 'city',
            code: 'JKT-TIM',
            serviceLevel: 'express',
            isActive: true,
            deliveryTimeAdjustment: 0,
            surcharge: 0
          },
          {
            name: 'Jakarta Utara',
            type: 'city',
            code: 'JKT-UTA',
            serviceLevel: 'express',
            isActive: true,
            deliveryTimeAdjustment: 0,
            surcharge: 0
          },
          {
            name: 'Bandung',
            type: 'city',
            code: 'BDG',
            serviceLevel: 'standard',
            isActive: true,
            deliveryTimeAdjustment: 12,
            surcharge: 0
          },
          {
            name: 'Bekasi',
            type: 'city',
            code: 'BKS',
            serviceLevel: 'express',
            isActive: true,
            deliveryTimeAdjustment: 6,
            surcharge: 0
          },
          {
            name: 'Depok',
            type: 'city',
            code: 'DPK',
            serviceLevel: 'express',
            isActive: true,
            deliveryTimeAdjustment: 6,
            surcharge: 0
          }
        ],
        integration: {
          apiEnabled: true,
          apiEndpoint: 'https://api.jne.co.id/v1',
          apiKey: 'jne-api-key-123456',
          apiSecret: 'jne-api-secret-123456',
          authType: 'api-key',
          webhookUrl: 'https://sarana.com/api/webhooks/jne',
          isActive: true,
          lastSyncTime: new Date()
        },
        documents: [
          {
            name: 'Service Agreement',
            type: 'contract',
            fileUrl: '/documents/jne/service-agreement.pdf',
            uploadDate: new Date('2023-01-01'),
            expiryDate: new Date('2025-12-31'),
            isActive: true
          },
          {
            name: 'Rate Card',
            type: 'rate-card',
            fileUrl: '/documents/jne/rate-card.pdf',
            uploadDate: new Date('2023-01-01'),
            expiryDate: new Date('2023-12-31'),
            isActive: true
          }
        ],
        communicationLogs: [
          {
            date: new Date('2023-01-15'),
            type: 'meeting',
            contactPerson: 'Ahmad Wijaya',
            subject: 'Service Agreement Discussion',
            summary: 'Initial meeting to discuss service agreement',
            outcome: 'Positive',
            followUpRequired: false,
            recordedBy: new mongoose.Types.ObjectId('000000000000000000000001')
          }
        ],
        createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
        updatedBy: new mongoose.Types.ObjectId('000000000000000000000001')
      }
    ];
    
    // Insert forwarders
    await Forwarder.insertMany(forwarders);
    logger.info(`Inserted ${forwarders.length} forwarders`);
    
    // Seed allocation strategy
    const allocationStrategy = {
      name: 'Performance-Based Allocation Strategy',
      allocationId: 'PERF-BASED-001',
      strategy: 'performance-based',
      isActive: true,
      config: {
        deliverySuccessWeight: 0.4,
        onTimeDeliveryWeight: 0.3,
        damageRateWeight: 0.2,
        customerSatisfactionWeight: 0.1
      },
      createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
      updatedBy: new mongoose.Types.ObjectId('000000000000000000000001')
    };
    
    await ForwarderAllocation.create(allocationStrategy);
    logger.info('Inserted default allocation strategy');
    
    logger.info('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});
