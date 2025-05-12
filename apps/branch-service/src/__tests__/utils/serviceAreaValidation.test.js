const {
  validateServiceAreaCreate,
  validateServiceAreaUpdate,
  validateServiceAreaPricing,
  validateServiceAreaBranchAssignment,
  validateServiceAreaStatus,
  validatePointInServiceArea
} = require('../../utils/serviceAreaValidation');

describe('Service Area Validation', () => {
  describe('validateServiceAreaCreate', () => {
    it('should validate a valid service area creation payload', () => {
      // Arrange
      const payload = {
        code: 'SA001',
        name: 'Test Service Area',
        description: 'Test Description',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        status: 'active',
        pricing: {
          basePrice: 10000,
          pricePerKg: 1000,
          pricePerKm: 500
        }
      };

      // Act
      const result = validateServiceAreaCreate(payload);

      // Assert
      expect(result.error).toBeNull();
      expect(result.value).toEqual(payload);
    });

    it('should reject payload with missing required fields', () => {
      // Arrange
      const payload = {
        name: 'Test Service Area',
        description: 'Test Description'
      };

      // Act
      const result = validateServiceAreaCreate(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('code');
    });

    it('should reject payload with invalid geometry type', () => {
      // Arrange
      const payload = {
        code: 'SA001',
        name: 'Test Service Area',
        description: 'Test Description',
        geometry: {
          type: 'InvalidType',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        status: 'active'
      };

      // Act
      const result = validateServiceAreaCreate(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('geometry.type');
    });

    it('should reject payload with invalid status', () => {
      // Arrange
      const payload = {
        code: 'SA001',
        name: 'Test Service Area',
        description: 'Test Description',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        status: 'invalid_status'
      };

      // Act
      const result = validateServiceAreaCreate(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('status');
    });

    it('should reject payload with invalid pricing values', () => {
      // Arrange
      const payload = {
        code: 'SA001',
        name: 'Test Service Area',
        description: 'Test Description',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        status: 'active',
        pricing: {
          basePrice: -100, // Negative value
          pricePerKg: 1000,
          pricePerKm: 500
        }
      };

      // Act
      const result = validateServiceAreaCreate(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('pricing.basePrice');
    });
  });

  describe('validateServiceAreaUpdate', () => {
    it('should validate a valid service area update payload', () => {
      // Arrange
      const payload = {
        name: 'Updated Service Area',
        description: 'Updated Description',
        status: 'inactive'
      };

      // Act
      const result = validateServiceAreaUpdate(payload);

      // Assert
      expect(result.error).toBeNull();
      expect(result.value).toEqual(payload);
    });

    it('should reject update with invalid fields', () => {
      // Arrange
      const payload = {
        name: '', // Empty name
        status: 'invalid_status' // Invalid status
      };

      // Act
      const result = validateServiceAreaUpdate(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
    });

    it('should allow partial updates', () => {
      // Arrange
      const payload = {
        name: 'Updated Service Area'
      };

      // Act
      const result = validateServiceAreaUpdate(payload);

      // Assert
      expect(result.error).toBeNull();
      expect(result.value).toEqual(payload);
    });
  });

  describe('validateServiceAreaPricing', () => {
    it('should validate valid pricing data', () => {
      // Arrange
      const payload = {
        pricing: {
          basePrice: 15000,
          pricePerKg: 1500,
          pricePerKm: 700
        }
      };

      // Act
      const result = validateServiceAreaPricing(payload);

      // Assert
      expect(result.error).toBeNull();
      expect(result.value).toEqual(payload);
    });

    it('should reject pricing with missing fields', () => {
      // Arrange
      const payload = {
        pricing: {
          basePrice: 15000
          // Missing pricePerKg and pricePerKm
        }
      };

      // Act
      const result = validateServiceAreaPricing(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
    });

    it('should reject pricing with negative values', () => {
      // Arrange
      const payload = {
        pricing: {
          basePrice: 15000,
          pricePerKg: -100, // Negative value
          pricePerKm: 700
        }
      };

      // Act
      const result = validateServiceAreaPricing(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('pricing.pricePerKg');
    });
  });

  describe('validateServiceAreaBranchAssignment', () => {
    it('should validate valid branch assignment', () => {
      // Arrange
      const payload = {
        branchId: 'branch123'
      };

      // Act
      const result = validateServiceAreaBranchAssignment(payload);

      // Assert
      expect(result.error).toBeNull();
      expect(result.value).toEqual(payload);
    });

    it('should reject branch assignment with missing branchId', () => {
      // Arrange
      const payload = {};

      // Act
      const result = validateServiceAreaBranchAssignment(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('branchId');
    });

    it('should reject branch assignment with empty branchId', () => {
      // Arrange
      const payload = {
        branchId: ''
      };

      // Act
      const result = validateServiceAreaBranchAssignment(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('branchId');
    });
  });

  describe('validateServiceAreaStatus', () => {
    it('should validate valid status update', () => {
      // Arrange
      const payload = {
        status: 'inactive'
      };

      // Act
      const result = validateServiceAreaStatus(payload);

      // Assert
      expect(result.error).toBeNull();
      expect(result.value).toEqual(payload);
    });

    it('should reject status update with invalid status', () => {
      // Arrange
      const payload = {
        status: 'invalid_status'
      };

      // Act
      const result = validateServiceAreaStatus(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('status');
    });

    it('should reject status update with missing status', () => {
      // Arrange
      const payload = {};

      // Act
      const result = validateServiceAreaStatus(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('status');
    });
  });

  describe('validatePointInServiceArea', () => {
    it('should validate valid point coordinates', () => {
      // Arrange
      const payload = {
        longitude: 106.8456,
        latitude: -6.2088
      };

      // Act
      const result = validatePointInServiceArea(payload);

      // Assert
      expect(result.error).toBeNull();
      expect(result.value).toEqual(payload);
    });

    it('should reject point with missing coordinates', () => {
      // Arrange
      const payload = {
        longitude: 106.8456
        // Missing latitude
      };

      // Act
      const result = validatePointInServiceArea(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('latitude');
    });

    it('should reject point with invalid coordinate values', () => {
      // Arrange
      const payload = {
        longitude: 200, // Invalid longitude (out of range)
        latitude: -6.2088
      };

      // Act
      const result = validatePointInServiceArea(payload);

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error.details.length).toBeGreaterThan(0);
      expect(result.error.details[0].message).toContain('longitude');
    });
  });
});
