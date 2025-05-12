/**
 * Simple Seed Script
 * Seeds the database with initial data for development and testing
 */

const mongoose = require('mongoose');
const Division = require('../models/Division');
const Position = require('../models/Position');
const { logger } = require('../utils/logger');

// Load environment variables
require('dotenv').config();

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
 * Clear collections
 * @returns {Promise<void>}
 */
const clearCollections = async () => {
  try {
    await Division.deleteMany({});
    logger.info('Cleared divisions collection');
    
    await Position.deleteMany({});
    logger.info('Cleared positions collection');
  } catch (error) {
    logger.error(`Error clearing collections: ${error.message}`);
    throw error;
  }
};

/**
 * Seed divisions
 * @returns {Promise<void>}
 */
const seedDivisions = async () => {
  try {
    // Create system user ID
    const systemUserId = new mongoose.Types.ObjectId();
    
    // Create branch IDs
    const branchHqId = new mongoose.Types.ObjectId();
    const branchJktId = new mongoose.Types.ObjectId();
    const branchSbyId = new mongoose.Types.ObjectId();
    
    // Create headquarters division
    const headquarters = await Division.create({
      code: 'DIV-HQ-001',
      name: 'Board of Directors',
      description: 'Executive leadership team responsible for strategic direction',
      level: 1,
      path: 'DIV-HQ-001',
      status: 'active',
      branchId: branchHqId,
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    // Create finance division
    const finance = await Division.create({
      code: 'DIV-HQ-002',
      name: 'Finance Division',
      description: 'Manages financial operations, accounting, and reporting',
      parentId: headquarters._id,
      level: 2,
      path: `${headquarters._id.toString()}`,
      status: 'active',
      branchId: branchHqId,
      kpis: [
        {
          name: 'Budget Compliance',
          description: 'Percentage of departments operating within budget',
          target: 95,
          unit: '%',
          current: 92
        }
      ],
      budget: {
        allocated: 2000000000,
        spent: 850000000,
        currency: 'IDR',
        fiscalYear: '2025'
      },
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    // Create HR division
    const hr = await Division.create({
      code: 'DIV-HQ-003',
      name: 'Human Resources Division',
      description: 'Manages recruitment, employee relations, and development',
      parentId: headquarters._id,
      level: 2,
      path: `${headquarters._id.toString()}`,
      status: 'active',
      branchId: branchHqId,
      kpis: [
        {
          name: 'Employee Retention',
          description: 'Annual employee retention rate',
          target: 85,
          unit: '%',
          current: 82
        }
      ],
      budget: {
        allocated: 1500000000,
        spent: 620000000,
        currency: 'IDR',
        fiscalYear: '2025'
      },
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    // Create operations division
    const operations = await Division.create({
      code: 'DIV-HQ-004',
      name: 'Operations Division',
      description: 'Oversees logistics operations and service delivery',
      parentId: headquarters._id,
      level: 2,
      path: `${headquarters._id.toString()}`,
      status: 'active',
      branchId: branchHqId,
      kpis: [
        {
          name: 'On-Time Delivery',
          description: 'Percentage of shipments delivered on time',
          target: 95,
          unit: '%',
          current: 91
        }
      ],
      budget: {
        allocated: 5000000000,
        spent: 2100000000,
        currency: 'IDR',
        fiscalYear: '2025'
      },
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    // Create IT division
    const it = await Division.create({
      code: 'DIV-HQ-005',
      name: 'Information Technology Division',
      description: 'Manages IT infrastructure, systems, and digital transformation',
      parentId: headquarters._id,
      level: 2,
      path: `${headquarters._id.toString()}`,
      status: 'active',
      branchId: branchHqId,
      kpis: [
        {
          name: 'System Uptime',
          description: 'Percentage of core systems availability',
          target: 99.9,
          unit: '%',
          current: 99.7
        }
      ],
      budget: {
        allocated: 3000000000,
        spent: 1250000000,
        currency: 'IDR',
        fiscalYear: '2025'
      },
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    logger.info('Divisions seeded successfully');
    return { headquarters, finance, hr, operations, it, systemUserId };
  } catch (error) {
    logger.error(`Error seeding divisions: ${error.message}`);
    throw error;
  }
};

/**
 * Seed positions
 * @param {Object} divisions - Seeded divisions
 * @param {mongoose.Types.ObjectId} systemUserId - System user ID
 * @returns {Promise<void>}
 */
const seedPositions = async (divisions, systemUserId) => {
  try {
    // Create CEO position
    const ceo = await Position.create({
      code: 'POS-EXE-001',
      title: 'Chief Executive Officer',
      description: 'Leads the organization and reports to the Board of Directors',
      level: 1,
      path: 'POS-EXE-001',
      divisionId: divisions.headquarters._id,
      status: 'active',
      isVacant: false,
      salaryGrade: 'E1',
      salaryRange: {
        min: 50000000,
        max: 100000000,
        currency: 'IDR'
      },
      requirements: {
        education: [
          {
            degree: 'Master',
            field: 'Business Administration',
            isRequired: true
          }
        ],
        experience: [
          {
            description: 'Executive leadership',
            yearsRequired: 10,
            isRequired: true
          }
        ],
        skills: [
          {
            name: 'Strategic Planning',
            level: 'expert',
            isRequired: true
          }
        ]
      },
      responsibilities: [
        {
          description: 'Define and execute company strategy',
          priority: 'critical'
        }
      ],
      authorities: [
        {
          description: 'Final approval on all strategic decisions',
          scope: 'Company-wide'
        }
      ],
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    // Create CFO position
    const cfo = await Position.create({
      code: 'POS-EXE-002',
      title: 'Chief Financial Officer',
      description: 'Oversees financial operations and strategy',
      reportingTo: ceo._id,
      level: 2,
      path: `${ceo._id.toString()}`,
      divisionId: divisions.finance._id,
      status: 'active',
      isVacant: false,
      salaryGrade: 'E2',
      salaryRange: {
        min: 40000000,
        max: 75000000,
        currency: 'IDR'
      },
      requirements: {
        education: [
          {
            degree: 'Master',
            field: 'Finance or Accounting',
            isRequired: true
          }
        ],
        experience: [
          {
            description: 'Financial leadership',
            yearsRequired: 8,
            isRequired: true
          }
        ],
        skills: [
          {
            name: 'Financial Analysis',
            level: 'expert',
            isRequired: true
          }
        ]
      },
      responsibilities: [
        {
          description: 'Oversee financial planning and reporting',
          priority: 'critical'
        }
      ],
      authorities: [
        {
          description: 'Approve expenditures up to 500 million IDR',
          scope: 'Financial'
        }
      ],
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    // Create COO position
    const coo = await Position.create({
      code: 'POS-EXE-003',
      title: 'Chief Operations Officer',
      description: 'Oversees operational activities and service delivery',
      reportingTo: ceo._id,
      level: 2,
      path: `${ceo._id.toString()}`,
      divisionId: divisions.operations._id,
      status: 'active',
      isVacant: false,
      salaryGrade: 'E2',
      salaryRange: {
        min: 40000000,
        max: 75000000,
        currency: 'IDR'
      },
      requirements: {
        education: [
          {
            degree: 'Master',
            field: 'Business or Logistics',
            isRequired: true
          }
        ],
        experience: [
          {
            description: 'Operations management',
            yearsRequired: 8,
            isRequired: true
          }
        ],
        skills: [
          {
            name: 'Supply Chain Management',
            level: 'expert',
            isRequired: true
          }
        ]
      },
      responsibilities: [
        {
          description: 'Oversee logistics operations',
          priority: 'critical'
        }
      ],
      authorities: [
        {
          description: 'Approve operational changes',
          scope: 'Operations'
        }
      ],
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    // Create CTO position
    const cto = await Position.create({
      code: 'POS-EXE-004',
      title: 'Chief Technology Officer',
      description: 'Oversees technology strategy and implementation',
      reportingTo: ceo._id,
      level: 2,
      path: `${ceo._id.toString()}`,
      divisionId: divisions.it._id,
      status: 'active',
      isVacant: false,
      salaryGrade: 'E2',
      salaryRange: {
        min: 40000000,
        max: 75000000,
        currency: 'IDR'
      },
      requirements: {
        education: [
          {
            degree: 'Master',
            field: 'Computer Science or IT',
            isRequired: true
          }
        ],
        experience: [
          {
            description: 'Technology leadership',
            yearsRequired: 8,
            isRequired: true
          }
        ],
        skills: [
          {
            name: 'Enterprise Architecture',
            level: 'expert',
            isRequired: true
          }
        ]
      },
      responsibilities: [
        {
          description: 'Define technology strategy',
          priority: 'critical'
        }
      ],
      authorities: [
        {
          description: 'Approve technology investments',
          scope: 'Technology'
        }
      ],
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    // Create CHRO position
    const chro = await Position.create({
      code: 'POS-EXE-005',
      title: 'Chief Human Resources Officer',
      description: 'Oversees human resources strategy and operations',
      reportingTo: ceo._id,
      level: 2,
      path: `${ceo._id.toString()}`,
      divisionId: divisions.hr._id,
      status: 'active',
      isVacant: false,
      salaryGrade: 'E2',
      salaryRange: {
        min: 40000000,
        max: 75000000,
        currency: 'IDR'
      },
      requirements: {
        education: [
          {
            degree: 'Master',
            field: 'Human Resources or Business',
            isRequired: true
          }
        ],
        experience: [
          {
            description: 'HR leadership',
            yearsRequired: 8,
            isRequired: true
          }
        ],
        skills: [
          {
            name: 'Talent Management',
            level: 'expert',
            isRequired: true
          }
        ]
      },
      responsibilities: [
        {
          description: 'Define HR strategy',
          priority: 'critical'
        }
      ],
      authorities: [
        {
          description: 'Approve HR policies',
          scope: 'Human Resources'
        }
      ],
      statusHistory: [
        {
          status: 'active',
          reason: 'Initial setup',
          changedBy: systemUserId,
          changedAt: new Date()
        }
      ],
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    
    logger.info('Positions seeded successfully');
    return { ceo, cfo, coo, cto, chro };
  } catch (error) {
    logger.error(`Error seeding positions: ${error.message}`);
    throw error;
  }
};

/**
 * Update division heads
 * @param {Object} divisions - Seeded divisions
 * @param {Object} positions - Seeded positions
 * @returns {Promise<void>}
 */
const updateDivisionHeads = async (divisions, positions) => {
  try {
    // Update headquarters division
    await Division.findByIdAndUpdate(divisions.headquarters._id, {
      headPositionId: positions.ceo._id
    });
    
    // Update finance division
    await Division.findByIdAndUpdate(divisions.finance._id, {
      headPositionId: positions.cfo._id
    });
    
    // Update operations division
    await Division.findByIdAndUpdate(divisions.operations._id, {
      headPositionId: positions.coo._id
    });
    
    // Update IT division
    await Division.findByIdAndUpdate(divisions.it._id, {
      headPositionId: positions.cto._id
    });
    
    // Update HR division
    await Division.findByIdAndUpdate(divisions.hr._id, {
      headPositionId: positions.chro._id
    });
    
    logger.info('Division heads updated successfully');
  } catch (error) {
    logger.error(`Error updating division heads: ${error.message}`);
    throw error;
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
    
    // Clear collections
    await clearCollections();
    
    // Seed divisions
    const { headquarters, finance, hr, operations, it, systemUserId } = await seedDivisions();
    const divisions = { headquarters, finance, hr, operations, it };
    
    // Seed positions
    const positions = await seedPositions(divisions, systemUserId);
    
    // Update division heads
    await updateDivisionHeads(divisions, positions);
    
    logger.info('All data seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// If this file is run directly, seed all data
if (require.main === module) {
  seedAll();
}

module.exports = {
  seedAll,
  connectToMongoDB,
  clearCollections,
  seedDivisions,
  seedPositions,
  updateDivisionHeads
};
