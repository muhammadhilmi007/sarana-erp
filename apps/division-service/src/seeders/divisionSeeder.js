/**
 * Division Seeder
 * Seeds the divisions collection with initial data
 */

const mongoose = require('mongoose');
const Division = require('../models/Division');
const { seedCollection } = require('./seederUtil');
const { logger } = require('../utils/logger');
const { 
  SYSTEM_USER_ID, 
  BRANCH_HQ_ID, 
  BRANCH_JKT_ID, 
  BRANCH_SBY_ID,
  divisionIds,
  positionIds 
} = require('./seedData');

// Sample division data
const divisionData = [
  // Headquarters divisions
  {
    _id: divisionIds['DIV-HQ-001'],
    code: 'DIV-HQ-001',
    name: 'Board of Directors',
    description: 'Executive leadership team responsible for strategic direction',
    level: 1,
    path: 'DIV-HQ-001',
    status: 'active',
    branchId: BRANCH_HQ_ID, // HQ branch ID
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-HQ-002'],
    code: 'DIV-HQ-002',
    name: 'Finance Division',
    description: 'Manages financial operations, accounting, and reporting',
    parentId: divisionIds['DIV-HQ-001'], // Reports to Board of Directors
    headPositionId: positionIds['POS-EXE-002'], // CFO
    level: 2,
    path: 'DIV-HQ-001.DIV-HQ-002',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Budget Compliance',
        description: 'Percentage of departments operating within budget',
        target: 95,
        unit: '%',
        current: 92
      },
      {
        name: 'Financial Report Timeliness',
        description: 'Monthly financial reports delivered on time',
        target: 100,
        unit: '%',
        current: 100
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-HQ-003'],
    code: 'DIV-HQ-003',
    name: 'Human Resources Division',
    description: 'Manages recruitment, employee relations, and development',
    parentId: divisionIds['DIV-HQ-001'], // Reports to Board of Directors
    headPositionId: positionIds['POS-EXE-003'], // COO
    level: 2,
    path: 'DIV-HQ-001.DIV-HQ-003',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Employee Retention',
        description: 'Annual employee retention rate',
        target: 85,
        unit: '%',
        current: 82
      },
      {
        name: 'Recruitment Efficiency',
        description: 'Average days to fill open positions',
        target: 30,
        unit: 'days',
        current: 35
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-HQ-004'],
    code: 'DIV-HQ-004',
    name: 'Operations Division',
    description: 'Oversees logistics operations and service delivery',
    parentId: divisionIds['DIV-HQ-001'], // Reports to Board of Directors
    headPositionId: positionIds['POS-EXE-004'], // CTO
    level: 2,
    path: 'DIV-HQ-001.DIV-HQ-004',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'On-Time Delivery',
        description: 'Percentage of shipments delivered on time',
        target: 95,
        unit: '%',
        current: 91
      },
      {
        name: 'Operational Efficiency',
        description: 'Cost per shipment',
        target: 50000,
        unit: 'IDR',
        current: 52500
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-HQ-005'],
    code: 'DIV-HQ-005',
    name: 'Information Technology Division',
    description: 'Manages IT infrastructure, systems, and digital transformation',
    parentId: divisionIds['DIV-HQ-001'], // Reports to Board of Directors
    headPositionId: positionIds['POS-EXE-005'], // CHRO
    level: 2,
    path: 'DIV-HQ-001.DIV-HQ-005',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'System Uptime',
        description: 'Percentage of core systems availability',
        target: 99.9,
        unit: '%',
        current: 99.7
      },
      {
        name: 'Ticket Resolution Time',
        description: 'Average time to resolve IT support tickets',
        target: 4,
        unit: 'hours',
        current: 5.2
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Finance sub-divisions
  {
    _id: divisionIds['DIV-FIN-001'],
    code: 'DIV-FIN-001',
    name: 'Accounting Department',
    description: 'Manages financial records, transactions, and reporting',
    parentId: divisionIds['DIV-HQ-002'], // Reports to Finance Division
    headPositionId: positionIds['POS-EXE-002'], // CFO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-002.DIV-FIN-001',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Accounting Accuracy',
        description: 'Percentage of error-free transactions',
        target: 99.5,
        unit: '%',
        current: 99.2
      }
    ],
    budget: {
      allocated: 800000000,
      spent: 350000000,
      currency: 'IDR',
      fiscalYear: '2025'
    },
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-FIN-002'],
    code: 'DIV-FIN-002',
    name: 'Treasury Department',
    description: 'Manages cash flow, investments, and financial risk',
    parentId: divisionIds['DIV-HQ-002'], // Reports to Finance Division
    headPositionId: positionIds['POS-EXE-002'], // CFO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-002.DIV-FIN-002',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Cash Flow Optimization',
        description: 'Working capital efficiency ratio',
        target: 1.5,
        unit: 'ratio',
        current: 1.3
      }
    ],
    budget: {
      allocated: 600000000,
      spent: 250000000,
      currency: 'IDR',
      fiscalYear: '2025'
    },
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // HR sub-divisions
  {
    _id: divisionIds['DIV-HR-001'],
    code: 'DIV-HR-001',
    name: 'Recruitment Department',
    description: 'Manages talent acquisition and onboarding',
    parentId: divisionIds['DIV-HQ-003'], // Reports to HR Division
    headPositionId: positionIds['POS-EXE-003'], // COO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-003.DIV-HR-001',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Time to Hire',
        description: 'Average days from job posting to offer acceptance',
        target: 25,
        unit: 'days',
        current: 28
      }
    ],
    budget: {
      allocated: 500000000,
      spent: 220000000,
      currency: 'IDR',
      fiscalYear: '2025'
    },
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-HR-002'],
    code: 'DIV-HR-002',
    name: 'Training & Development Department',
    description: 'Manages employee training, development, and career growth',
    parentId: divisionIds['DIV-HQ-003'], // Reports to HR Division
    headPositionId: positionIds['POS-EXE-003'], // COO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-003.DIV-HR-002',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Training Effectiveness',
        description: 'Post-training performance improvement',
        target: 20,
        unit: '%',
        current: 15
      }
    ],
    budget: {
      allocated: 400000000,
      spent: 180000000,
      currency: 'IDR',
      fiscalYear: '2025'
    },
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Operations sub-divisions
  {
    _id: divisionIds['DIV-OPS-001'],
    code: 'DIV-OPS-001',
    name: 'Logistics Department',
    description: 'Manages transportation, warehousing, and distribution',
    parentId: divisionIds['DIV-HQ-004'], // Reports to Operations Division
    headPositionId: positionIds['POS-EXE-004'], // CTO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-004.DIV-OPS-001',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Delivery Accuracy',
        description: 'Percentage of shipments delivered to correct location',
        target: 99.8,
        unit: '%',
        current: 99.5
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-OPS-002'],
    code: 'DIV-OPS-002',
    name: 'Customer Service Department',
    description: 'Manages customer inquiries, complaints, and satisfaction',
    parentId: divisionIds['DIV-HQ-004'], // Reports to Operations Division
    headPositionId: positionIds['POS-EXE-004'], // CTO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-004.DIV-OPS-002',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Customer Satisfaction',
        description: 'Average customer satisfaction score',
        target: 4.5,
        unit: 'score',
        current: 4.2
      }
    ],
    budget: {
      allocated: 1200000000,
      spent: 520000000,
      currency: 'IDR',
      fiscalYear: '2025'
    },
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // IT sub-divisions
  {
    _id: divisionIds['DIV-IT-001'],
    code: 'DIV-IT-001',
    name: 'Software Development Department',
    description: 'Develops and maintains software applications',
    parentId: divisionIds['DIV-HQ-005'], // Reports to IT Division
    headPositionId: positionIds['POS-EXE-005'], // CHRO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-005.DIV-IT-001',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Development Velocity',
        description: 'Story points completed per sprint',
        target: 50,
        unit: 'points',
        current: 45
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-IT-002'],
    code: 'DIV-IT-002',
    name: 'IT Infrastructure Department',
    description: 'Manages servers, networks, and IT hardware',
    parentId: divisionIds['DIV-HQ-005'], // Reports to IT Division
    headPositionId: positionIds['POS-EXE-005'], // CHRO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-005.DIV-IT-002',
    status: 'active',
    branchId: 'BRANCH-HQ-001',
    kpis: [
      {
        name: 'Network Reliability',
        description: 'Network uptime percentage',
        target: 99.95,
        unit: '%',
        current: 99.9
      }
    ],
    budget: {
      allocated: 1200000000,
      spent: 480000000,
      currency: 'IDR',
      fiscalYear: '2025'
    },
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Regional divisions
  {
    _id: divisionIds['DIV-REG-001'],
    code: 'DIV-REG-001',
    name: 'Jakarta Regional Division',
    description: 'Manages operations in Jakarta metropolitan area',
    parentId: divisionIds['DIV-HQ-004'], // Reports to Operations Division
    headPositionId: positionIds['POS-EXE-004'], // CTO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-004.DIV-REG-001',
    status: 'active',
    branchId: BRANCH_JKT_ID, // Jakarta branch ID
    kpis: [
      {
        name: 'Regional Revenue',
        description: 'Monthly revenue target achievement',
        target: 100,
        unit: '%',
        current: 95
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: divisionIds['DIV-REG-002'],
    code: 'DIV-REG-002',
    name: 'Surabaya Regional Division',
    description: 'Manages operations in East Java region',
    parentId: divisionIds['DIV-HQ-004'], // Reports to Operations Division
    headPositionId: positionIds['POS-EXE-004'], // CTO
    level: 3,
    path: 'DIV-HQ-001.DIV-HQ-004.DIV-REG-002',
    status: 'active',
    branchId: BRANCH_SBY_ID, // Surabaya branch ID
    kpis: [
      {
        name: 'Regional Revenue',
        description: 'Monthly revenue target achievement',
        target: 100,
        unit: '%',
        current: 92
      }
    ],
    budget: {
      allocated: 2500000000,
      spent: 1050000000,
      currency: 'IDR',
      fiscalYear: '2025'
    },
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID, // System user ID
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Seed divisions
 * @returns {Promise<Array>} - Seeded divisions
 */
const seedDivisions = async () => {
  try {
    logger.info('Starting division seeding...');
    const divisions = await seedCollection(Division, divisionData);
    logger.info('Division seeding completed successfully');
    return divisions;
  } catch (error) {
    logger.error(`Division seeding failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  seedDivisions,
  divisionData
};
