/**
 * Forwarder Seeder
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
            country: 'Indonesia'
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
            swiftCode: 'BMRIIDJA',
          },
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
            height: 100,
          },
          specialHandling: {
            fragile: true,
            hazardous: false,
            refrigerated: false,
            oversized: true,
          },
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
          lastUpdated: new Date(),
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
          },
        ],
        createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
      },
      {
        name: 'SiCepat Ekspres',
        code: 'SCE001',
        type: 'national',
        status: 'active',
        contactInfo: {
          address: 'Jl. Gajah Mada No. 1',
          city: 'Jakarta Pusat',
          province: 'DKI Jakarta',
          postalCode: '10130',
          country: 'Indonesia',
          phone: '021-50200050',
          email: 'customerservice@sicepat.com',
          website: 'www.sicepat.com',
          contactPerson: 'Budi Santoso',
        },
        contractDetails: {
          contractNumber: 'SCE/2023/001',
          startDate: new Date('2023-02-15'),
          endDate: new Date('2025-02-14'),
          renewalDate: new Date('2025-01-15'),
          contractTerms: 'Standard terms with volume-based pricing',
        },
        financialSettlement: {
          paymentTerms: 'Net 15',
          creditLimit: 30000000,
          currentBalance: 0,
          bankDetails: {
            bankName: 'BCA',
            accountNumber: '0987654321',
            accountName: 'PT SiCepat Ekspres Indonesia',
            swiftCode: 'CENAIDJA',
          },
        },
        serviceLevel: {
          deliveryTimeStandard: 2,
          deliveryTimeExpress: 1,
          guaranteedDelivery: true,
          insuranceIncluded: true,
          trackingCapability: true,
          proofOfDelivery: true,
          returnService: true,
          saturdayDelivery: true,
          sundayDelivery: true,
          holidayDelivery: false,
          maxWeight: 25,
          maxDimensions: {
            length: 80,
            width: 80,
            height: 80,
          },
          specialHandling: {
            fragile: true,
            hazardous: false,
            refrigerated: false,
            oversized: true,
          },
        },
        performanceMetrics: {
          deliverySuccessRate: 97.8,
          onTimeDeliveryRate: 96.3,
          damageRate: 0.7,
          customerSatisfactionScore: 4.5,
          lastUpdated: new Date(),
        },
        coverageAreas: [
          {
            province: 'DKI Jakarta',
            city: 'All Cities',
            serviceLevel: 'express',
          },
          {
            province: 'Jawa Barat',
            city: 'Bandung',
            serviceLevel: 'express',
          },
          {
            province: 'Jawa Barat',
            city: 'Bekasi',
            serviceLevel: 'express',
          },
          {
            province: 'Jawa Barat',
            city: 'Bogor',
            serviceLevel: 'express',
          },
          {
            province: 'Jawa Barat',
            city: 'Depok',
            serviceLevel: 'express',
          },
          {
            province: 'Jawa Tengah',
            city: 'Semarang',
            serviceLevel: 'standard',
          },
          {
            province: 'Jawa Timur',
            city: 'Surabaya',
            serviceLevel: 'standard',
          },
        ],
        createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
      },
      {
        name: 'Anteraja',
        code: 'AJA001',
        type: 'national',
        status: 'active',
        contactInfo: {
          address: 'Jl. TB Simatupang No. 41',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          postalCode: '12550',
          country: 'Indonesia',
          phone: '021-50283333',
          email: 'cs@anteraja.id',
          website: 'www.anteraja.id',
          contactPerson: 'Siti Rahayu',
        },
        contractDetails: {
          contractNumber: 'AJA/2023/001',
          startDate: new Date('2023-03-01'),
          endDate: new Date('2025-02-28'),
          renewalDate: new Date('2025-01-31'),
          contractTerms: 'Standard terms with COD service',
        },
        financialSettlement: {
          paymentTerms: 'Net 7',
          creditLimit: 20000000,
          currentBalance: 0,
          bankDetails: {
            bankName: 'BNI',
            accountNumber: '1357924680',
            accountName: 'PT Anteraja',
            swiftCode: 'BNINIDJA',
          },
        },
        serviceLevel: {
          deliveryTimeStandard: 2,
          deliveryTimeExpress: 1,
          guaranteedDelivery: false,
          insuranceIncluded: true,
          trackingCapability: true,
          proofOfDelivery: true,
          returnService: true,
          saturdayDelivery: true,
          sundayDelivery: false,
          holidayDelivery: false,
          maxWeight: 20,
          maxDimensions: {
            length: 70,
            width: 70,
            height: 70,
          },
          specialHandling: {
            fragile: true,
            hazardous: false,
            refrigerated: false,
            oversized: false,
          },
        },
        performanceMetrics: {
          deliverySuccessRate: 96.5,
          onTimeDeliveryRate: 94.8,
          damageRate: 0.9,
          customerSatisfactionScore: 4.3,
          lastUpdated: new Date(),
        },
        coverageAreas: [
          {
            province: 'DKI Jakarta',
            city: 'All Cities',
            serviceLevel: 'express',
          },
          {
            province: 'Jawa Barat',
            city: 'Bandung',
            serviceLevel: 'standard',
          },
          {
            province: 'Jawa Barat',
            city: 'Bekasi',
            serviceLevel: 'express',
          },
          {
            province: 'Jawa Barat',
            city: 'Bogor',
            serviceLevel: 'standard',
          },
          {
            province: 'Jawa Barat',
            city: 'Depok',
            serviceLevel: 'express',
          },
          {
            province: 'Banten',
            city: 'Tangerang',
            serviceLevel: 'express',
          },
        ],
        createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
      },
      {
        name: 'DHL Express',
        code: 'DHL001',
        type: 'international',
        status: 'active',
        contactInfo: {
          address: 'Jl. Mampang Prapatan No. 25',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          postalCode: '12790',
          country: 'Indonesia',
          phone: '021-80630888',
          email: 'cs.id@dhl.com',
          website: 'www.dhl.co.id',
          contactPerson: 'Michael Wong',
        },
        contractDetails: {
          contractNumber: 'DHL/2023/001',
          startDate: new Date('2023-01-15'),
          endDate: new Date('2026-01-14'),
          renewalDate: new Date('2025-12-15'),
          contractTerms: 'International express service with customs clearance',
        },
        financialSettlement: {
          paymentTerms: 'Net 30',
          creditLimit: 100000000,
          currentBalance: 0,
          bankDetails: {
            bankName: 'HSBC',
            accountNumber: '246813579',
            accountName: 'PT DHL Express Indonesia',
            swiftCode: 'HSBCIDJA',
          },
        },
        serviceLevel: {
          deliveryTimeStandard: 5,
          deliveryTimeExpress: 3,
          guaranteedDelivery: true,
          insuranceIncluded: true,
          trackingCapability: true,
          proofOfDelivery: true,
          returnService: true,
          saturdayDelivery: true,
          sundayDelivery: false,
          holidayDelivery: false,
          maxWeight: 70,
          maxDimensions: {
            length: 120,
            width: 120,
            height: 120,
          },
          specialHandling: {
            fragile: true,
            hazardous: true,
            refrigerated: true,
            oversized: true,
          },
        },
        performanceMetrics: {
          deliverySuccessRate: 99.2,
          onTimeDeliveryRate: 97.5,
          damageRate: 0.3,
          customerSatisfactionScore: 4.8,
          lastUpdated: new Date(),
        },
        coverageAreas: [
          {
            province: 'International',
            city: 'All Countries',
            serviceLevel: 'express',
          },
        ],
        createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
      },
      {
        name: 'FedEx',
        code: 'FDX001',
        type: 'international',
        status: 'active',
        contactInfo: {
          address: 'Jl. Casablanca Raya Kav. 18',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          postalCode: '12870',
          country: 'Indonesia',
          phone: '021-29568000',
          email: 'customer.service@fedex.com',
          website: 'www.fedex.com/id',
          contactPerson: 'Jessica Lee',
        },
        contractDetails: {
          contractNumber: 'FDX/2023/001',
          startDate: new Date('2023-02-01'),
          endDate: new Date('2026-01-31'),
          renewalDate: new Date('2025-12-31'),
          contractTerms: 'International express and freight services',
        },
        financialSettlement: {
          paymentTerms: 'Net 45',
          creditLimit: 150000000,
          currentBalance: 0,
          bankDetails: {
            bankName: 'Citibank',
            accountNumber: '9876543210',
            accountName: 'PT FedEx Indonesia',
            swiftCode: 'CITIIDJX',
          },
        },
        serviceLevel: {
          deliveryTimeStandard: 6,
          deliveryTimeExpress: 3,
          guaranteedDelivery: true,
          insuranceIncluded: true,
          trackingCapability: true,
          proofOfDelivery: true,
          returnService: true,
          saturdayDelivery: true,
          sundayDelivery: false,
          holidayDelivery: false,
          maxWeight: 100,
          maxDimensions: {
            length: 150,
            width: 150,
            height: 150,
          },
          specialHandling: {
            fragile: true,
            hazardous: true,
            refrigerated: true,
            oversized: true,
          },
        },
        performanceMetrics: {
          deliverySuccessRate: 98.7,
          onTimeDeliveryRate: 96.9,
          damageRate: 0.4,
          customerSatisfactionScore: 4.7,
          lastUpdated: new Date(),
        },
        coverageAreas: [
          {
            province: 'International',
            city: 'All Countries',
            serviceLevel: 'express',
          },
        ],
        createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
      },
    ];
    
    // Insert forwarders
    await Forwarder.insertMany(forwarders);
    logger.info(`Inserted ${forwarders.length} forwarders`);
    
    // Seed allocation strategy
    const allocationStrategy = {
      strategy: 'performance-based',
      isActive: true,
      config: {
        deliverySuccessWeight: 0.4,
        onTimeDeliveryWeight: 0.3,
        damageRateWeight: 0.2,
        customerSatisfactionWeight: 0.1,
      },
      createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
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
