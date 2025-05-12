/**
 * Swagger Configuration
 * Defines the Swagger/OpenAPI documentation settings
 */

const { version } = require('../../package.json');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Samudra Paket ERP API',
    version,
    description: 'API documentation for Samudra Paket ERP system',
    contact: {
      name: 'API Support',
      email: 'support@samudraepaket.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API Gateway',
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
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Authentication required',
                },
                errorCode: {
                  type: 'string',
                  example: 'ERR_AUTH',
                },
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Validation error',
                },
                errorCode: {
                  type: 'string',
                  example: 'ERR_VALIDATION',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Field is required',
                      },
                      path: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                        example: ['email'],
                      },
                      type: {
                        type: 'string',
                        example: 'any.required',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Internal server error',
                },
                errorCode: {
                  type: 'string',
                  example: 'ERR_INTERNAL',
                },
              },
            },
          },
        },
      },
      ServiceUnavailable: {
        description: 'Service temporarily unavailable',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Service temporarily unavailable',
                },
                errorCode: {
                  type: 'string',
                  example: 'ERR_SERVICE_UNAVAILABLE',
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
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization endpoints',
    },
    {
      name: 'Core',
      description: 'Core business logic endpoints',
    },
    {
      name: 'Operations',
      description: 'Operations management endpoints',
    },
    {
      name: 'Finance',
      description: 'Financial operations endpoints',
    },
    {
      name: 'Notification',
      description: 'Notification handling endpoints',
    },
    {
      name: 'Reporting',
      description: 'Reporting and analytics endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
};

module.exports = swaggerDefinition;
