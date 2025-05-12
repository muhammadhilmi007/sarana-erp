const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ServiceAreaHistory = require('../../models/ServiceAreaHistory');

describe('ServiceAreaHistory Model', () => {
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
    await ServiceAreaHistory.deleteMany({});
  });

  it('should create a service area history record successfully', async () => {
    // Arrange
    const historyData = {
      serviceAreaId: 'servicearea123',
      action: 'create',
      userId: 'user123',
      changes: {},
      metadata: {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }
    };

    // Act
    const history = new ServiceAreaHistory(historyData);
    const savedHistory = await history.save();

    // Assert
    expect(savedHistory._id).toBeDefined();
    expect(savedHistory.serviceAreaId.toString()).toBe('servicearea123');
    expect(savedHistory.action).toBe('create');
    expect(savedHistory.userId.toString()).toBe('user123');
    expect(savedHistory.changes).toEqual({});
    expect(savedHistory.metadata.ipAddress).toBe('192.168.1.1');
    expect(savedHistory.metadata.userAgent).toBe('Mozilla/5.0');
    expect(savedHistory.timestamp).toBeDefined();
  });

  it('should not create a history record without required fields', async () => {
    // Arrange
    const historyData = {
      action: 'update',
      userId: 'user123',
      changes: {}
    };

    // Act & Assert
    try {
      const history = new ServiceAreaHistory(historyData);
      await history.save();
      fail('Should have thrown a validation error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.serviceAreaId).toBeDefined();
    }
  });

  it('should validate action values', async () => {
    // Arrange
    const historyData = {
      serviceAreaId: 'servicearea123',
      action: 'invalid_action', // Invalid action
      userId: 'user123',
      changes: {}
    };

    // Act & Assert
    try {
      const history = new ServiceAreaHistory(historyData);
      await history.save();
      fail('Should have thrown a validation error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors.action).toBeDefined();
    }
  });

  it('should create a history record with changes data', async () => {
    // Arrange
    const historyData = {
      serviceAreaId: 'servicearea123',
      action: 'update',
      userId: 'user123',
      changes: {
        name: {
          from: 'Old Service Area',
          to: 'New Service Area'
        },
        status: {
          from: 'active',
          to: 'inactive'
        }
      }
    };

    // Act
    const history = new ServiceAreaHistory(historyData);
    const savedHistory = await history.save();

    // Assert
    expect(savedHistory._id).toBeDefined();
    expect(savedHistory.serviceAreaId.toString()).toBe('servicearea123');
    expect(savedHistory.action).toBe('update');
    expect(savedHistory.userId.toString()).toBe('user123');
    expect(savedHistory.changes).toEqual({
      name: {
        from: 'Old Service Area',
        to: 'New Service Area'
      },
      status: {
        from: 'active',
        to: 'inactive'
      }
    });
  });

  it('should query history records by service area ID', async () => {
    // Arrange
    const historyData1 = {
      serviceAreaId: 'servicearea123',
      action: 'create',
      userId: 'user123',
      changes: {}
    };

    const historyData2 = {
      serviceAreaId: 'servicearea123',
      action: 'update',
      userId: 'user123',
      changes: {
        name: {
          from: 'Old Service Area',
          to: 'New Service Area'
        }
      }
    };

    const historyData3 = {
      serviceAreaId: 'servicearea456',
      action: 'create',
      userId: 'user123',
      changes: {}
    };

    // Act
    await new ServiceAreaHistory(historyData1).save();
    await new ServiceAreaHistory(historyData2).save();
    await new ServiceAreaHistory(historyData3).save();

    const historyRecords = await ServiceAreaHistory.find({ serviceAreaId: 'servicearea123' });

    // Assert
    expect(historyRecords).toHaveLength(2);
    expect(historyRecords[0].serviceAreaId.toString()).toBe('servicearea123');
    expect(historyRecords[1].serviceAreaId.toString()).toBe('servicearea123');
  });

  it('should sort history records by timestamp', async () => {
    // Arrange
    const historyData1 = {
      serviceAreaId: 'servicearea123',
      action: 'create',
      userId: 'user123',
      changes: {},
      timestamp: new Date('2023-01-01')
    };

    const historyData2 = {
      serviceAreaId: 'servicearea123',
      action: 'update',
      userId: 'user123',
      changes: {},
      timestamp: new Date('2023-01-02')
    };

    const historyData3 = {
      serviceAreaId: 'servicearea123',
      action: 'update',
      userId: 'user123',
      changes: {},
      timestamp: new Date('2023-01-03')
    };

    // Act - Save in random order
    await new ServiceAreaHistory(historyData2).save();
    await new ServiceAreaHistory(historyData3).save();
    await new ServiceAreaHistory(historyData1).save();

    // Query with sort
    const historyRecords = await ServiceAreaHistory.find({ serviceAreaId: 'servicearea123' })
      .sort({ timestamp: -1 });

    // Assert - Should be in descending order (newest first)
    expect(historyRecords).toHaveLength(3);
    expect(historyRecords[0].timestamp.toISOString()).toContain('2023-01-03');
    expect(historyRecords[1].timestamp.toISOString()).toContain('2023-01-02');
    expect(historyRecords[2].timestamp.toISOString()).toContain('2023-01-01');
  });
});
