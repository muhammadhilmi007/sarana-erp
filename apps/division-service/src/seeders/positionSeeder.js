/**
 * Position Seeder
 * Seeds the positions collection with initial data
 */

const mongoose = require('mongoose');
const Position = require('../models/Position');
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

// Sample position data
const positionData = [
  // Executive positions
  {
    code: 'POS-EXE-001',
    title: 'Chief Executive Officer',
    description: 'Leads the organization and reports to the Board of Directors',
    level: 1,
    path: 'POS-EXE-001',
    divisionId: divisionIds['DIV-HQ-001'], // Board of Directors
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
        },
        {
          description: 'Logistics industry experience',
          yearsRequired: 5,
          isRequired: true
        }
      ],
      skills: [
        {
          name: 'Strategic Planning',
          level: 'expert',
          isRequired: true
        },
        {
          name: 'Business Development',
          level: 'expert',
          isRequired: true
        }
      ]
    },
    responsibilities: [
      {
        description: 'Define and execute company strategy',
        priority: 'critical'
      },
      {
        description: 'Lead executive team',
        priority: 'critical'
      },
      {
        description: 'Report to Board of Directors',
        priority: 'high'
      }
    ],
    authorities: [
      {
        description: 'Final approval on all strategic decisions',
        scope: 'Company-wide'
      },
      {
        description: 'Approve expenditures above 500 million IDR',
        scope: 'Financial'
      }
    ],
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: positionIds['POS-EXE-002'],
    code: 'POS-EXE-002',
    title: 'Chief Financial Officer',
    description: 'Oversees financial operations and strategy',
    reportingTo: positionIds['POS-EXE-001'], // Reports to CEO
    level: 2,
    path: 'POS-EXE-001.POS-EXE-002',
    divisionId: divisionIds['DIV-HQ-002'], // Finance Division
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
        },
        {
          name: 'Strategic Planning',
          level: 'advanced',
          isRequired: true
        }
      ]
    },
    responsibilities: [
      {
        description: 'Oversee financial planning and reporting',
        priority: 'critical'
      },
      {
        description: 'Manage financial risks',
        priority: 'high'
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: positionIds['POS-EXE-003'],
    code: 'POS-EXE-003',
    title: 'Chief Operations Officer',
    description: 'Oversees operational activities and service delivery',
    reportingTo: positionIds['POS-EXE-001'], // Reports to CEO
    level: 2,
    path: 'POS-EXE-001.POS-EXE-003',
    divisionId: divisionIds['DIV-HQ-004'], // Operations Division
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
        },
        {
          name: 'Process Optimization',
          level: 'expert',
          isRequired: true
        }
      ]
    },
    responsibilities: [
      {
        description: 'Oversee logistics operations',
        priority: 'critical'
      },
      {
        description: 'Optimize service delivery',
        priority: 'high'
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: positionIds['POS-EXE-004'],
    code: 'POS-EXE-004',
    title: 'Chief Technology Officer',
    description: 'Oversees technology strategy and implementation',
    reportingTo: positionIds['POS-EXE-001'], // Reports to CEO
    level: 2,
    path: 'POS-EXE-001.POS-EXE-004',
    divisionId: divisionIds['DIV-HQ-005'], // IT Division
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
        },
        {
          name: 'Digital Transformation',
          level: 'expert',
          isRequired: true
        }
      ]
    },
    responsibilities: [
      {
        description: 'Define technology strategy',
        priority: 'critical'
      },
      {
        description: 'Oversee IT operations',
        priority: 'high'
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: positionIds['POS-EXE-005'],
    code: 'POS-EXE-005',
    title: 'Chief Human Resources Officer',
    description: 'Oversees human resources strategy and operations',
    reportingTo: positionIds['POS-EXE-001'], // Reports to CEO
    level: 2,
    path: 'POS-EXE-001.POS-EXE-005',
    divisionId: divisionIds['DIV-HQ-003'], // HR Division
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
        },
        {
          name: 'Organizational Development',
          level: 'expert',
          isRequired: true
        }
      ]
    },
    responsibilities: [
      {
        description: 'Define HR strategy',
        priority: 'critical'
      },
      {
        description: 'Oversee talent acquisition and development',
        priority: 'high'
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
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Director positions
  {
    _id: positionIds['POS-DIR-001'],
    code: 'POS-DIR-001',
    title: 'Finance Director',
    description: 'Directs financial operations and reporting',
    reportingTo: positionIds['POS-EXE-002'], // Reports to CFO
    level: 3,
    path: 'POS-EXE-001.POS-EXE-002.POS-DIR-001',
    divisionId: divisionIds['DIV-HQ-002'], // Finance Division
    status: 'active',
    isVacant: false,
    salaryGrade: 'D1',
    salaryRange: {
      min: 30000000,
      max: 50000000,
      currency: 'IDR'
    },
    responsibilities: [
      {
        description: 'Direct financial operations',
        priority: 'critical'
      }
    ],
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Manager positions
  {
    _id: positionIds['POS-MGR-001'],
    code: 'POS-MGR-001',
    title: 'Accounting Manager',
    description: 'Manages accounting operations and reporting',
    reportingTo: positionIds['POS-DIR-001'], // Reports to Finance Director
    level: 4,
    path: 'POS-EXE-001.POS-EXE-002.POS-DIR-001.POS-MGR-001',
    divisionId: divisionIds['DIV-FIN-001'], // Accounting Department
    status: 'active',
    isVacant: false,
    salaryGrade: 'M1',
    salaryRange: {
      min: 15000000,
      max: 25000000,
      currency: 'IDR'
    },
    responsibilities: [
      {
        description: 'Manage accounting team',
        priority: 'high'
      },
      {
        description: 'Ensure accurate financial reporting',
        priority: 'critical'
      }
    ],
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: positionIds['POS-MGR-002'],
    code: 'POS-MGR-002',
    title: 'Treasury Manager',
    description: 'Manages cash flow and financial investments',
    reportingTo: positionIds['POS-DIR-001'], // Reports to Finance Director
    level: 4,
    path: 'POS-EXE-001.POS-EXE-002.POS-DIR-001.POS-MGR-002',
    divisionId: divisionIds['DIV-FIN-002'], // Treasury Department
    status: 'active',
    isVacant: false,
    salaryGrade: 'M1',
    salaryRange: {
      min: 15000000,
      max: 25000000,
      currency: 'IDR'
    },
    responsibilities: [
      {
        description: 'Manage cash flow',
        priority: 'critical'
      },
      {
        description: 'Oversee financial investments',
        priority: 'high'
      }
    ],
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Staff positions
  {
    _id: positionIds['POS-STF-001'],
    code: 'POS-STF-001',
    title: 'Senior Accountant',
    description: 'Performs advanced accounting tasks',
    reportingTo: positionIds['POS-MGR-001'], // Reports to Accounting Manager
    level: 5,
    path: 'POS-EXE-001.POS-EXE-002.POS-DIR-001.POS-MGR-001.POS-STF-001',
    divisionId: divisionIds['DIV-FIN-001'], // Accounting Department
    status: 'active',
    isVacant: false,
    salaryGrade: 'S1',
    salaryRange: {
      min: 8000000,
      max: 12000000,
      currency: 'IDR'
    },
    responsibilities: [
      {
        description: 'Prepare financial statements',
        priority: 'high'
      },
      {
        description: 'Conduct financial analysis',
        priority: 'medium'
      }
    ],
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: positionIds['POS-STF-002'],
    code: 'POS-STF-002',
    title: 'Junior Accountant',
    description: 'Performs basic accounting tasks',
    reportingTo: positionIds['POS-STF-001'], // Reports to Senior Accountant
    level: 6,
    path: 'POS-EXE-001.POS-EXE-002.POS-DIR-001.POS-MGR-001.POS-STF-001.POS-STF-002',
    divisionId: divisionIds['DIV-FIN-001'], // Accounting Department
    status: 'active',
    isVacant: true, // Vacant position
    salaryGrade: 'S2',
    salaryRange: {
      min: 5000000,
      max: 8000000,
      currency: 'IDR'
    },
    responsibilities: [
      {
        description: 'Process financial transactions',
        priority: 'high'
      },
      {
        description: 'Assist with financial reporting',
        priority: 'medium'
      }
    ],
    statusHistory: [
      {
        status: 'active',
        reason: 'Initial setup',
        changedBy: SYSTEM_USER_ID, // System user ID
        timestamp: new Date()
      }
    ],
    createdBy: SYSTEM_USER_ID,
    updatedBy: SYSTEM_USER_ID, // System user ID
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Seed positions
 * @returns {Promise<Array>} - Seeded positions
 */
const seedPositions = async () => {
  try {
    logger.info('Starting position seeding...');
    const positions = await seedCollection(Position, positionData);
    logger.info('Position seeding completed successfully');
    return positions;
  } catch (error) {
    logger.error(`Position seeding failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  seedPositions,
  positionData
};
