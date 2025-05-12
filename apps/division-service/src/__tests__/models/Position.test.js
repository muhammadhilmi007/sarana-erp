/**
 * Position Model Tests
 */

const mongoose = require('mongoose');
const Position = require('../../models/Position');

// Mock data
const mockPosition = {
  code: 'POS001',
  title: 'Finance Manager',
  description: 'Manages financial operations',
  divisionId: new mongoose.Types.ObjectId(),
  salaryGrade: 'M3',
  salaryRange: {
    min: 10000000,
    max: 15000000,
    currency: 'IDR',
  },
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
};

// Mock user ID for tests
const mockUserId = new mongoose.Types.ObjectId();

describe('Position Model', () => {
  // Connect to in-memory MongoDB before tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-division-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear database between tests
  afterEach(async () => {
    await Position.deleteMany({});
  });

  // Disconnect after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test position creation
  it('should create a position successfully', async () => {
    const position = new Position(mockPosition);
    const savedPosition = await position.save();

    expect(savedPosition._id).toBeDefined();
    expect(savedPosition.code).toBe(mockPosition.code);
    expect(savedPosition.title).toBe(mockPosition.title);
    expect(savedPosition.description).toBe(mockPosition.description);
    expect(savedPosition.divisionId.toString()).toBe(mockPosition.divisionId.toString());
    expect(savedPosition.status).toBe('active');
    expect(savedPosition.isVacant).toBe(true);
    expect(savedPosition.level).toBe(0);
    expect(savedPosition.path).toBe(savedPosition._id.toString());
  });

  // Test required fields
  it('should require code, title, divisionId, salaryGrade, salaryRange, createdBy, and updatedBy fields', async () => {
    const position = new Position({});
    
    let error;
    try {
      await position.validate();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.code).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.divisionId).toBeDefined();
    expect(error.errors.salaryGrade).toBeDefined();
    expect(error.errors['salaryRange.min']).toBeDefined();
    expect(error.errors['salaryRange.max']).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
    expect(error.errors.updatedBy).toBeDefined();
  });

  // Test hierarchical structure
  it('should set correct path and level for subordinate position', async () => {
    // Create supervisor position
    const supervisorPosition = new Position(mockPosition);
    await supervisorPosition.save();

    // Create subordinate position
    const subordinatePosition = new Position({
      ...mockPosition,
      code: 'POS002',
      title: 'Financial Analyst',
      reportingTo: supervisorPosition._id,
    });
    await subordinatePosition.save();

    expect(subordinatePosition.path).toBe(`${supervisorPosition._id.toString()},${subordinatePosition._id.toString()}`);
    expect(subordinatePosition.level).toBe(1);
  });

  // Test getDirectReports method
  it('should get direct reports of a position', async () => {
    // Create supervisor position
    const supervisorPosition = new Position(mockPosition);
    await supervisorPosition.save();

    // Create subordinate positions
    const subordinatePosition1 = new Position({
      ...mockPosition,
      code: 'POS002',
      title: 'Financial Analyst',
      reportingTo: supervisorPosition._id,
    });
    await subordinatePosition1.save();

    const subordinatePosition2 = new Position({
      ...mockPosition,
      code: 'POS003',
      title: 'Accountant',
      reportingTo: supervisorPosition._id,
    });
    await subordinatePosition2.save();

    // Get direct reports
    const directReports = await supervisorPosition.getDirectReports();

    expect(directReports).toHaveLength(2);
    expect(directReports[0].title).toBe('Financial Analyst');
    expect(directReports[1].title).toBe('Accountant');
  });

  // Test getAllSubordinates method
  it('should get all subordinates of a position', async () => {
    // Create supervisor position
    const supervisorPosition = new Position(mockPosition);
    await supervisorPosition.save();

    // Create direct report position
    const directReportPosition = new Position({
      ...mockPosition,
      code: 'POS002',
      title: 'Financial Analyst',
      reportingTo: supervisorPosition._id,
    });
    await directReportPosition.save();

    // Create indirect report position
    const indirectReportPosition = new Position({
      ...mockPosition,
      code: 'POS003',
      title: 'Junior Analyst',
      reportingTo: directReportPosition._id,
    });
    await indirectReportPosition.save();

    // Get all subordinates
    const allSubordinates = await supervisorPosition.getAllSubordinates();

    expect(allSubordinates).toHaveLength(2);
    expect(allSubordinates[0].title).toBe('Financial Analyst');
    expect(allSubordinates[1].title).toBe('Junior Analyst');
  });

  // Test getReportingChain method
  it('should get reporting chain of a position', async () => {
    // Create top-level position
    const topPosition = new Position(mockPosition);
    await topPosition.save();

    // Create mid-level position
    const midPosition = new Position({
      ...mockPosition,
      code: 'POS002',
      title: 'Financial Analyst',
      reportingTo: topPosition._id,
    });
    await midPosition.save();

    // Create bottom-level position
    const bottomPosition = new Position({
      ...mockPosition,
      code: 'POS003',
      title: 'Junior Analyst',
      reportingTo: midPosition._id,
    });
    await bottomPosition.save();

    // Get reporting chain
    const reportingChain = await bottomPosition.getReportingChain();

    expect(reportingChain).toHaveLength(2);
    expect(reportingChain[0].title).toBe('Finance Manager');
    expect(reportingChain[1].title).toBe('Financial Analyst');
  });

  // Test addStatusHistory method
  it('should add status history entry', async () => {
    const position = new Position(mockPosition);
    await position.save();

    position.addStatusHistory('inactive', 'Position eliminated', mockUserId);
    await position.save();

    expect(position.status).toBe('inactive');
    expect(position.statusHistory).toHaveLength(1);
    expect(position.statusHistory[0].status).toBe('inactive');
    expect(position.statusHistory[0].reason).toBe('Position eliminated');
    expect(position.statusHistory[0].changedBy.toString()).toBe(mockUserId.toString());
  });

  // Test updateVacancy method
  it('should update vacancy status', async () => {
    const position = new Position(mockPosition);
    await position.save();

    position.updateVacancy(false, 1);
    await position.save();

    expect(position.isVacant).toBe(false);
    expect(position.headcount.filled).toBe(1);
  });

  // Test findActive static method
  it('should find active positions', async () => {
    // Create active position
    const activePosition = new Position(mockPosition);
    await activePosition.save();

    // Create inactive position
    const inactivePosition = new Position({
      ...mockPosition,
      code: 'POS002',
      title: 'Inactive Position',
      status: 'inactive',
    });
    await inactivePosition.save();

    // Find active positions
    const activePositions = await Position.findActive();

    expect(activePositions).toHaveLength(1);
    expect(activePositions[0].title).toBe('Finance Manager');
  });

  // Test findByDivision static method
  it('should find positions by division', async () => {
    const divisionId1 = new mongoose.Types.ObjectId();
    const divisionId2 = new mongoose.Types.ObjectId();

    // Create positions for division 1
    const position1 = new Position({
      ...mockPosition,
      divisionId: divisionId1,
    });
    await position1.save();

    // Create position for division 2
    const position2 = new Position({
      ...mockPosition,
      code: 'POS002',
      title: 'HR Manager',
      divisionId: divisionId2,
    });
    await position2.save();

    // Find positions by division
    const divisionPositions = await Position.findByDivision(divisionId1);

    expect(divisionPositions).toHaveLength(1);
    expect(divisionPositions[0].title).toBe('Finance Manager');
  });

  // Test findVacant static method
  it('should find vacant positions', async () => {
    // Create vacant position
    const vacantPosition = new Position(mockPosition);
    await vacantPosition.save();

    // Create filled position
    const filledPosition = new Position({
      ...mockPosition,
      code: 'POS002',
      title: 'Filled Position',
      isVacant: false,
    });
    await filledPosition.save();

    // Find vacant positions
    const vacantPositions = await Position.findVacant();

    expect(vacantPositions).toHaveLength(1);
    expect(vacantPositions[0].title).toBe('Finance Manager');
  });
});
