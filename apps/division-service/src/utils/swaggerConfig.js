/**
 * Swagger Configuration
 * Provides configuration for Swagger/OpenAPI documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Division & Position Management Service API',
    version: '1.0.0',
    description: 'API documentation for the Division & Position Management Service of Samudra Paket ERP',
    contact: {
      name: 'Samudra Paket ERP Team',
      email: 'support@samudrapaket.com',
    },
    license: {
      name: 'Proprietary',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      // Division schemas
      DivisionInput: {
        type: 'object',
        required: ['code', 'name', 'branchId'],
        properties: {
          code: {
            type: 'string',
            description: 'Division code',
            example: 'DIV001',
          },
          name: {
            type: 'string',
            description: 'Division name',
            example: 'Finance Division',
          },
          description: {
            type: 'string',
            description: 'Division description',
            example: 'Handles financial operations',
          },
          parentId: {
            type: 'string',
            description: 'Parent division ID',
            example: '60d21b4667d0d8992e610c85',
          },
          branchId: {
            type: 'string',
            description: 'Branch ID',
            example: '60d21b4667d0d8992e610c86',
          },
          headPositionId: {
            type: 'string',
            description: 'Head position ID',
            example: '60d21b4667d0d8992e610c87',
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'restructuring'],
            description: 'Division status',
            example: 'active',
          },
        },
      },
      DivisionUpdateInput: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Division code',
            example: 'DIV001',
          },
          name: {
            type: 'string',
            description: 'Division name',
            example: 'Finance Division',
          },
          description: {
            type: 'string',
            description: 'Division description',
            example: 'Handles financial operations',
          },
          parentId: {
            type: 'string',
            description: 'Parent division ID',
            example: '60d21b4667d0d8992e610c85',
          },
          branchId: {
            type: 'string',
            description: 'Branch ID',
            example: '60d21b4667d0d8992e610c86',
          },
          headPositionId: {
            type: 'string',
            description: 'Head position ID',
            example: '60d21b4667d0d8992e610c87',
          },
        },
      },
      DivisionStatusInput: {
        type: 'object',
        required: ['status', 'reason'],
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'restructuring'],
            description: 'Division status',
            example: 'inactive',
          },
          reason: {
            type: 'string',
            description: 'Reason for status change',
            example: 'Restructuring',
          },
        },
      },
      DivisionKPIsInput: {
        type: 'object',
        required: ['kpis'],
        properties: {
          kpis: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'target', 'unit'],
              properties: {
                name: {
                  type: 'string',
                  description: 'KPI name',
                  example: 'Revenue Growth',
                },
                description: {
                  type: 'string',
                  description: 'KPI description',
                  example: 'Annual revenue growth rate',
                },
                target: {
                  type: 'number',
                  description: 'KPI target',
                  example: 15,
                },
                unit: {
                  type: 'string',
                  description: 'KPI unit',
                  example: '%',
                },
                current: {
                  type: 'number',
                  description: 'Current KPI value',
                  example: 10,
                },
              },
            },
          },
        },
      },
      DivisionBudgetInput: {
        type: 'object',
        required: ['allocated', 'fiscalYear'],
        properties: {
          allocated: {
            type: 'number',
            description: 'Allocated budget',
            example: 1000000,
          },
          spent: {
            type: 'number',
            description: 'Spent budget',
            example: 250000,
          },
          currency: {
            type: 'string',
            description: 'Currency',
            example: 'IDR',
          },
          fiscalYear: {
            type: 'string',
            description: 'Fiscal year',
            example: '2025',
          },
        },
      },
      
      // Position schemas
      PositionInput: {
        type: 'object',
        required: ['code', 'title', 'divisionId', 'salaryGrade', 'salaryRange'],
        properties: {
          code: {
            type: 'string',
            description: 'Position code',
            example: 'POS001',
          },
          title: {
            type: 'string',
            description: 'Position title',
            example: 'Finance Manager',
          },
          description: {
            type: 'string',
            description: 'Position description',
            example: 'Manages financial operations',
          },
          reportingTo: {
            type: 'string',
            description: 'Reporting position ID',
            example: '60d21b4667d0d8992e610c88',
          },
          divisionId: {
            type: 'string',
            description: 'Division ID',
            example: '60d21b4667d0d8992e610c85',
          },
          salaryGrade: {
            type: 'string',
            description: 'Salary grade',
            example: 'M3',
          },
          salaryRange: {
            type: 'object',
            required: ['min', 'max'],
            properties: {
              min: {
                type: 'number',
                description: 'Minimum salary',
                example: 10000000,
              },
              max: {
                type: 'number',
                description: 'Maximum salary',
                example: 15000000,
              },
              currency: {
                type: 'string',
                description: 'Currency',
                example: 'IDR',
              },
            },
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'draft'],
            description: 'Position status',
            example: 'active',
          },
          isVacant: {
            type: 'boolean',
            description: 'Vacancy status',
            example: true,
          },
        },
      },
      PositionUpdateInput: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Position code',
            example: 'POS001',
          },
          title: {
            type: 'string',
            description: 'Position title',
            example: 'Finance Manager',
          },
          description: {
            type: 'string',
            description: 'Position description',
            example: 'Manages financial operations',
          },
          reportingTo: {
            type: 'string',
            description: 'Reporting position ID',
            example: '60d21b4667d0d8992e610c88',
          },
          divisionId: {
            type: 'string',
            description: 'Division ID',
            example: '60d21b4667d0d8992e610c85',
          },
          salaryGrade: {
            type: 'string',
            description: 'Salary grade',
            example: 'M3',
          },
          salaryRange: {
            type: 'object',
            properties: {
              min: {
                type: 'number',
                description: 'Minimum salary',
                example: 10000000,
              },
              max: {
                type: 'number',
                description: 'Maximum salary',
                example: 15000000,
              },
              currency: {
                type: 'string',
                description: 'Currency',
                example: 'IDR',
              },
            },
          },
          isVacant: {
            type: 'boolean',
            description: 'Vacancy status',
            example: true,
          },
        },
      },
      PositionStatusInput: {
        type: 'object',
        required: ['status', 'reason'],
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'draft'],
            description: 'Position status',
            example: 'inactive',
          },
          reason: {
            type: 'string',
            description: 'Reason for status change',
            example: 'Position eliminated',
          },
        },
      },
      PositionRequirementsInput: {
        type: 'object',
        required: ['requirements'],
        properties: {
          requirements: {
            type: 'object',
            properties: {
              education: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    degree: {
                      type: 'string',
                      description: 'Degree',
                      example: 'Bachelor',
                    },
                    field: {
                      type: 'string',
                      description: 'Field of study',
                      example: 'Finance',
                    },
                    isRequired: {
                      type: 'boolean',
                      description: 'Is required',
                      example: true,
                    },
                  },
                },
              },
              experience: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    description: {
                      type: 'string',
                      description: 'Experience description',
                      example: 'Financial management',
                    },
                    yearsRequired: {
                      type: 'number',
                      description: 'Years required',
                      example: 5,
                    },
                    isRequired: {
                      type: 'boolean',
                      description: 'Is required',
                      example: true,
                    },
                  },
                },
              },
              skills: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Skill name',
                      example: 'Financial analysis',
                    },
                    level: {
                      type: 'string',
                      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
                      description: 'Skill level',
                      example: 'advanced',
                    },
                    isRequired: {
                      type: 'boolean',
                      description: 'Is required',
                      example: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      PositionResponsibilitiesInput: {
        type: 'object',
        required: ['responsibilities'],
        properties: {
          responsibilities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description: 'Responsibility description',
                  example: 'Prepare financial reports',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical'],
                  description: 'Priority',
                  example: 'high',
                },
              },
            },
          },
        },
      },
      PositionAuthoritiesInput: {
        type: 'object',
        required: ['authorities'],
        properties: {
          authorities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description: 'Authority description',
                  example: 'Approve expenses up to 10 million IDR',
                },
                scope: {
                  type: 'string',
                  description: 'Authority scope',
                  example: 'Finance department',
                },
              },
            },
          },
        },
      },
      PositionCompensationInput: {
        type: 'object',
        properties: {
          salaryGrade: {
            type: 'string',
            description: 'Salary grade',
            example: 'M3',
          },
          salaryRange: {
            type: 'object',
            properties: {
              min: {
                type: 'number',
                description: 'Minimum salary',
                example: 10000000,
              },
              max: {
                type: 'number',
                description: 'Maximum salary',
                example: 15000000,
              },
              currency: {
                type: 'string',
                description: 'Currency',
                example: 'IDR',
              },
            },
          },
          benefits: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Benefit name',
                  example: 'Health insurance',
                },
                description: {
                  type: 'string',
                  description: 'Benefit description',
                  example: 'Full coverage for employee and family',
                },
                value: {
                  type: 'number',
                  description: 'Benefit value',
                  example: 5000000,
                },
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.js'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi,
};
