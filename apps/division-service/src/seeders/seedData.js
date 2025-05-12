/**
 * Seed Data
 * Contains simplified data for seeding the database
 */

const mongoose = require('mongoose');

// Create a system user ID
const SYSTEM_USER_ID = new mongoose.Types.ObjectId();

// Create branch IDs
const BRANCH_HQ_ID = new mongoose.Types.ObjectId();
const BRANCH_JKT_ID = new mongoose.Types.ObjectId();
const BRANCH_SBY_ID = new mongoose.Types.ObjectId();

// Create division IDs
const divisionIds = {
  'DIV-HQ-001': new mongoose.Types.ObjectId(),
  'DIV-HQ-002': new mongoose.Types.ObjectId(),
  'DIV-HQ-003': new mongoose.Types.ObjectId(),
  'DIV-HQ-004': new mongoose.Types.ObjectId(),
  'DIV-HQ-005': new mongoose.Types.ObjectId(),
  'DIV-FIN-001': new mongoose.Types.ObjectId(),
  'DIV-FIN-002': new mongoose.Types.ObjectId(),
  'DIV-HR-001': new mongoose.Types.ObjectId(),
  'DIV-HR-002': new mongoose.Types.ObjectId(),
  'DIV-OPS-001': new mongoose.Types.ObjectId(),
  'DIV-OPS-002': new mongoose.Types.ObjectId(),
  'DIV-IT-001': new mongoose.Types.ObjectId(),
  'DIV-IT-002': new mongoose.Types.ObjectId(),
  'DIV-REG-001': new mongoose.Types.ObjectId(),
  'DIV-REG-002': new mongoose.Types.ObjectId(),
};

// Create position IDs
const positionIds = {
  'POS-EXE-001': new mongoose.Types.ObjectId(),
  'POS-EXE-002': new mongoose.Types.ObjectId(),
  'POS-EXE-003': new mongoose.Types.ObjectId(),
  'POS-EXE-004': new mongoose.Types.ObjectId(),
  'POS-EXE-005': new mongoose.Types.ObjectId(),
  'POS-DIR-001': new mongoose.Types.ObjectId(),
  'POS-MGR-001': new mongoose.Types.ObjectId(),
  'POS-MGR-002': new mongoose.Types.ObjectId(),
  'POS-STF-001': new mongoose.Types.ObjectId(),
  'POS-STF-002': new mongoose.Types.ObjectId(),
};

module.exports = {
  SYSTEM_USER_ID,
  BRANCH_HQ_ID,
  BRANCH_JKT_ID,
  BRANCH_SBY_ID,
  divisionIds,
  positionIds,
};
