const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ServiceArea = require('../../models/ServiceArea');

describe('ServiceArea Model', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await ServiceArea.deleteMany({});
  });

  it('should create a service area successfully', async () => {
    // Arrange
    const serviceAreaData = {
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
    const serviceArea = new ServiceArea(serviceAreaData);
    const savedServiceArea = await serviceArea.save();

    // Assert
    expect(savedServiceArea._id).toBeDefined();
    expect(savedServiceArea.code).toBe('SA001');
    expect(savedServiceArea.name).toBe('Test Service Area');
    expect(savedServiceArea.description).toBe('Test Description');
    expect(savedServiceArea.status).toBe('active');
    expect(savedServiceArea.geometry.type).toBe('Polygon');
    expect(savedServiceArea.geometry.coordinates).toEqual([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
    expect(savedServiceArea.pricing.basePrice).toBe(10000);
    expect(savedServiceArea.pricing.pricePerKg).toBe(1000);
    expect(savedServiceArea.pricing.pricePerKm).toBe(500);
    expect(savedServiceArea.createdAt).toBeDefined();
    expect(savedServiceArea.updatedAt).toBeDefined();
  });

  it('should not create a service area without required fields', async () => {
    // Arrange
    const serviceAreaData = {
      description: 'Test Description',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    };

    // Act & Assert
    try {
      const serviceArea = new ServiceArea(serviceAreaData);
      await serviceArea.save();
      fail('Should have thrown a validation error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.code).toBeDefined();
      expect(error.errors.name).toBeDefined();
    }
  });

  it('should not create a service area with duplicate code', async () => {
    // Arrange
    const serviceAreaData1 = {
      code: 'SA001',
      name: 'Test Service Area 1',
      description: 'Test Description 1',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      },
      status: 'active'
    };

    const serviceAreaData2 = {
      code: 'SA001', // Duplicate code
      name: 'Test Service Area 2',
      description: 'Test Description 2',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]
      },
      status: 'active'
    };

    // Act & Assert
    await new ServiceArea(serviceAreaData1).save();
    
    try {
      await new ServiceArea(serviceAreaData2).save();
      fail('Should have thrown a duplicate key error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('MongoServerError');
      expect(error.code).toBe(11000); // Duplicate key error code
    }
  });

  it('should update a service area successfully', async () => {
    // Arrange
    const serviceAreaData = {
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
    const serviceArea = await new ServiceArea(serviceAreaData).save();
    
    serviceArea.name = 'Updated Service Area';
    serviceArea.description = 'Updated Description';
    serviceArea.status = 'inactive';
    serviceArea.pricing.basePrice = 15000;
    
    const updatedServiceArea = await serviceArea.save();

    // Assert
    expect(updatedServiceArea._id).toEqual(serviceArea._id);
    expect(updatedServiceArea.code).toBe('SA001');
    expect(updatedServiceArea.name).toBe('Updated Service Area');
    expect(updatedServiceArea.description).toBe('Updated Description');
    expect(updatedServiceArea.status).toBe('inactive');
    expect(updatedServiceArea.pricing.basePrice).toBe(15000);
    expect(updatedServiceArea.pricing.pricePerKg).toBe(1000);
    expect(updatedServiceArea.pricing.pricePerKm).toBe(500);
  });

  it('should assign and remove branches from a service area', async () => {
    // Arrange
    const serviceAreaData = {
      code: 'SA001',
      name: 'Test Service Area',
      description: 'Test Description',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      },
      status: 'active',
      branches: []
    };

    // Act - Create service area
    const serviceArea = await new ServiceArea(serviceAreaData).save();
    
    // Act - Assign branches
    serviceArea.branches.push('branch123');
    serviceArea.branches.push('branch456');
    let updatedServiceArea = await serviceArea.save();

    // Assert - Branches assigned
    expect(updatedServiceArea.branches).toHaveLength(2);
    expect(updatedServiceArea.branches).toContain('branch123');
    expect(updatedServiceArea.branches).toContain('branch456');

    // Act - Remove a branch
    updatedServiceArea.branches = updatedServiceArea.branches.filter(id => id !== 'branch123');
    updatedServiceArea = await updatedServiceArea.save();

    // Assert - Branch removed
    expect(updatedServiceArea.branches).toHaveLength(1);
    expect(updatedServiceArea.branches).not.toContain('branch123');
    expect(updatedServiceArea.branches).toContain('branch456');
  });

  it('should validate service area status values', async () => {
    // Arrange
    const serviceAreaData = {
      code: 'SA001',
      name: 'Test Service Area',
      description: 'Test Description',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      },
      status: 'invalid_status' // Invalid status
    };

    // Act & Assert
    try {
      const serviceArea = new ServiceArea(serviceAreaData);
      await serviceArea.save();
      fail('Should have thrown a validation error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.status).toBeDefined();
    }
  });

  it('should validate geometry type', async () => {
    // Arrange
    const serviceAreaData = {
      code: 'SA001',
      name: 'Test Service Area',
      description: 'Test Description',
      geometry: {
        type: 'InvalidType', // Invalid geometry type
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      },
      status: 'active'
    };

    // Act & Assert
    try {
      const serviceArea = new ServiceArea(serviceAreaData);
      await serviceArea.save();
      fail('Should have thrown a validation error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors['geometry.type']).toBeDefined();
    }
  });
});
