/**
 * Division Model Tests
 */

const mongoose = require('mongoose');
const Division = require('../../models/Division');

// Mock data
const mockDivision = {
  code: 'DIV001',
  name: 'Finance Division',
  description: 'Handles financial operations',
  branchId: new mongoose.Types.ObjectId(),
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
};

// Mock user ID for tests
const mockUserId = new mongoose.Types.ObjectId();

describe('Division Model', () => {
  // Connect to in-memory MongoDB before tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarana-division-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear database between tests
  afterEach(async () => {
    await Division.deleteMany({});
  });

  // Disconnect after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test division creation
  it('should create a division successfully', async () => {
    const division = new Division(mockDivision);
    const savedDivision = await division.save();

    expect(savedDivision._id).toBeDefined();
    expect(savedDivision.code).toBe(mockDivision.code);
    expect(savedDivision.name).toBe(mockDivision.name);
    expect(savedDivision.description).toBe(mockDivision.description);
    expect(savedDivision.branchId.toString()).toBe(mockDivision.branchId.toString());
    expect(savedDivision.status).toBe('active');
    expect(savedDivision.level).toBe(0);
    expect(savedDivision.path).toBe(savedDivision._id.toString());
  });

  // Test required fields
  it('should require code, name, branchId, createdBy, and updatedBy fields', async () => {
    const division = new Division({});
    
    let error;
    try {
      await division.validate();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.code).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.branchId).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
    expect(error.errors.updatedBy).toBeDefined();
  });

  // Test hierarchical structure
  it('should set correct path and level for child division', async () => {
    // Create parent division
    const parentDivision = new Division(mockDivision);
    await parentDivision.save();

    // Create child division
    const childDivision = new Division({
      ...mockDivision,
      code: 'DIV002',
      name: 'Accounting Department',
      parentId: parentDivision._id,
    });
    await childDivision.save();

    expect(childDivision.path).toBe(`${parentDivision._id.toString()},${childDivision._id.toString()}`);
    expect(childDivision.level).toBe(1);
  });

  // Test getChildren method
  it('should get children of a division', async () => {
    // Create parent division
    const parentDivision = new Division(mockDivision);
    await parentDivision.save();

    // Create child divisions
    const childDivision1 = new Division({
      ...mockDivision,
      code: 'DIV002',
      name: 'Accounting Department',
      parentId: parentDivision._id,
    });
    await childDivision1.save();

    const childDivision2 = new Division({
      ...mockDivision,
      code: 'DIV003',
      name: 'Tax Department',
      parentId: parentDivision._id,
    });
    await childDivision2.save();

    // Get children
    const children = await parentDivision.getChildren();

    expect(children).toHaveLength(2);
    expect(children[0].name).toBe('Accounting Department');
    expect(children[1].name).toBe('Tax Department');
  });

  // Test getDescendants method
  it('should get all descendants of a division', async () => {
    // Create parent division
    const parentDivision = new Division(mockDivision);
    await parentDivision.save();

    // Create child division
    const childDivision = new Division({
      ...mockDivision,
      code: 'DIV002',
      name: 'Accounting Department',
      parentId: parentDivision._id,
    });
    await childDivision.save();

    // Create grandchild division
    const grandchildDivision = new Division({
      ...mockDivision,
      code: 'DIV003',
      name: 'Financial Reporting Team',
      parentId: childDivision._id,
    });
    await grandchildDivision.save();

    // Get descendants
    const descendants = await parentDivision.getDescendants();

    expect(descendants).toHaveLength(2);
    expect(descendants[0].name).toBe('Accounting Department');
    expect(descendants[1].name).toBe('Financial Reporting Team');
  });

  // Test getAncestors method
  it('should get ancestors of a division', async () => {
    // Create parent division
    const parentDivision = new Division(mockDivision);
    await parentDivision.save();

    // Create child division
    const childDivision = new Division({
      ...mockDivision,
      code: 'DIV002',
      name: 'Accounting Department',
      parentId: parentDivision._id,
    });
    await childDivision.save();

    // Create grandchild division
    const grandchildDivision = new Division({
      ...mockDivision,
      code: 'DIV003',
      name: 'Financial Reporting Team',
      parentId: childDivision._id,
    });
    await grandchildDivision.save();

    // Get ancestors
    const ancestors = await grandchildDivision.getAncestors();

    expect(ancestors).toHaveLength(2);
    expect(ancestors[0].name).toBe('Finance Division');
    expect(ancestors[1].name).toBe('Accounting Department');
  });

  // Test addStatusHistory method
  it('should add status history entry', async () => {
    const division = new Division(mockDivision);
    await division.save();

    division.addStatusHistory('inactive', 'Restructuring', mockUserId);
    await division.save();

    expect(division.status).toBe('inactive');
    expect(division.statusHistory).toHaveLength(1);
    expect(division.statusHistory[0].status).toBe('inactive');
    expect(division.statusHistory[0].reason).toBe('Restructuring');
    expect(division.statusHistory[0].changedBy.toString()).toBe(mockUserId.toString());
  });

  // Test updateKPI method
  it('should update KPI', async () => {
    const division = new Division(mockDivision);
    await division.save();

    const kpi = {
      name: 'Revenue Growth',
      description: 'Annual revenue growth rate',
      target: 15,
      unit: '%',
      current: 10,
    };

    division.updateKPI(kpi);
    await division.save();

    expect(division.performanceMetrics.kpis).toHaveLength(1);
    expect(division.performanceMetrics.kpis[0].name).toBe('Revenue Growth');
    expect(division.performanceMetrics.kpis[0].target).toBe(15);
    expect(division.performanceMetrics.kpis[0].current).toBe(10);
  });

  // Test updateBudget method
  it('should update budget', async () => {
    const division = new Division(mockDivision);
    await division.save();

    const budgetData = {
      allocated: 1000000,
      spent: 250000,
      fiscalYear: '2025',
    };

    division.updateBudget(budgetData);
    await division.save();

    expect(division.budget.allocated).toBe(1000000);
    expect(division.budget.spent).toBe(250000);
    expect(division.budget.remaining).toBe(750000);
    expect(division.budget.fiscalYear).toBe('2025');
  });

  // Test findActive static method
  it('should find active divisions', async () => {
    // Create active division
    const activeDivision = new Division(mockDivision);
    await activeDivision.save();

    // Create inactive division
    const inactiveDivision = new Division({
      ...mockDivision,
      code: 'DIV002',
      name: 'Inactive Division',
      status: 'inactive',
    });
    await inactiveDivision.save();

    // Find active divisions
    const activeDivisions = await Division.findActive();

    expect(activeDivisions).toHaveLength(1);
    expect(activeDivisions[0].name).toBe('Finance Division');
  });

  // Test findByBranch static method
  it('should find divisions by branch', async () => {
    const branchId1 = new mongoose.Types.ObjectId();
    const branchId2 = new mongoose.Types.ObjectId();

    // Create divisions for branch 1
    const division1 = new Division({
      ...mockDivision,
      branchId: branchId1,
    });
    await division1.save();

    // Create division for branch 2
    const division2 = new Division({
      ...mockDivision,
      code: 'DIV002',
      name: 'HR Division',
      branchId: branchId2,
    });
    await division2.save();

    // Find divisions by branch
    const branchDivisions = await Division.findByBranch(branchId1);

    expect(branchDivisions).toHaveLength(1);
    expect(branchDivisions[0].name).toBe('Finance Division');
  });
});
