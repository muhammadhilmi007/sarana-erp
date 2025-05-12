/**
 * Database Seeder
 * Populates the database with initial test data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./logger');
const Employee = require('../models/Employee');
const EmployeeDocument = require('../models/EmployeeDocument');

// Sample data for employees
const employees = [
  {
    employeeId: 'EMP001',
    firstName: 'Budi',
    lastName: 'Santoso',
    email: 'budi.santoso@samudrapaket.com',
    phoneNumber: '081234567890',
    birthDate: new Date('1990-05-15'),
    gender: 'male',
    maritalStatus: 'married',
    address: {
      street: 'Jl. Merdeka No. 123',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      postalCode: '12345',
      country: 'Indonesia'
    },
    emergencyContact: {
      name: 'Siti Rahayu',
      relationship: 'spouse',
      phoneNumber: '081234567891'
    },
    joinDate: new Date('2020-01-15'),
    divisionId: new mongoose.Types.ObjectId(),
    branchId: new mongoose.Types.ObjectId(),
    positionId: new mongoose.Types.ObjectId(),
    employmentType: 'full-time',
    status: 'active',
    bankAccount: {
      bankName: 'Bank Mandiri',
      accountNumber: '1234567890',
      accountName: 'Budi Santoso'
    },
    taxInfo: {
      taxId: '123456789012345',
      taxStatus: 'TK/0'
    },
    skills: [
      {
        name: 'Customer Service',
        level: 'expert',
        yearsOfExperience: 5,
        certifications: [
          {
            name: 'Customer Service Excellence',
            issuer: 'Samudra Paket Academy',
            issueDate: new Date('2021-03-15'),
            credentialId: 'CSE-2021-001'
          }
        ]
      },
      {
        name: 'Logistics Management',
        level: 'intermediate',
        yearsOfExperience: 3
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    updatedBy: new mongoose.Types.ObjectId()
  },
  {
    employeeId: 'EMP002',
    firstName: 'Dewi',
    lastName: 'Lestari',
    email: 'dewi.lestari@samudrapaket.com',
    phoneNumber: '081234567892',
    birthDate: new Date('1992-08-20'),
    gender: 'female',
    maritalStatus: 'single',
    address: {
      street: 'Jl. Sudirman No. 45',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      postalCode: '12346',
      country: 'Indonesia'
    },
    emergencyContact: {
      name: 'Ahmad Sulaiman',
      relationship: 'father',
      phoneNumber: '081234567893'
    },
    joinDate: new Date('2021-03-10'),
    divisionId: new mongoose.Types.ObjectId(),
    branchId: new mongoose.Types.ObjectId(),
    positionId: new mongoose.Types.ObjectId(),
    employmentType: 'full-time',
    status: 'active',
    bankAccount: {
      bankName: 'BCA',
      accountNumber: '0987654321',
      accountName: 'Dewi Lestari'
    },
    taxInfo: {
      taxId: '987654321012345',
      taxStatus: 'TK/0'
    },
    skills: [
      {
        name: 'Data Analysis',
        level: 'advanced',
        yearsOfExperience: 4,
        certifications: [
          {
            name: 'Data Science Fundamentals',
            issuer: 'DataCamp',
            issueDate: new Date('2020-05-20'),
            credentialId: 'DSF-2020-123'
          }
        ]
      },
      {
        name: 'Project Management',
        level: 'intermediate',
        yearsOfExperience: 2
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    updatedBy: new mongoose.Types.ObjectId()
  },
  {
    employeeId: 'EMP003',
    firstName: 'Ahmad',
    lastName: 'Hidayat',
    email: 'ahmad.hidayat@samudrapaket.com',
    phoneNumber: '081234567894',
    birthDate: new Date('1988-11-12'),
    gender: 'male',
    maritalStatus: 'married',
    address: {
      street: 'Jl. Gatot Subroto No. 78',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      postalCode: '12347',
      country: 'Indonesia'
    },
    emergencyContact: {
      name: 'Fatimah Hidayat',
      relationship: 'spouse',
      phoneNumber: '081234567895'
    },
    joinDate: new Date('2019-07-22'),
    divisionId: new mongoose.Types.ObjectId(),
    branchId: new mongoose.Types.ObjectId(),
    positionId: new mongoose.Types.ObjectId(),
    employmentType: 'full-time',
    status: 'active',
    bankAccount: {
      bankName: 'BNI',
      accountNumber: '1122334455',
      accountName: 'Ahmad Hidayat'
    },
    taxInfo: {
      taxId: '112233445566778',
      taxStatus: 'K/1'
    },
    skills: [
      {
        name: 'Warehouse Management',
        level: 'expert',
        yearsOfExperience: 7,
        certifications: [
          {
            name: 'Warehouse Operations Management',
            issuer: 'Supply Chain Indonesia',
            issueDate: new Date('2019-10-15'),
            credentialId: 'WOM-2019-045'
          }
        ]
      },
      {
        name: 'Inventory Control',
        level: 'advanced',
        yearsOfExperience: 5
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    updatedBy: new mongoose.Types.ObjectId()
  }
];

// Sample data for employee documents
const documents = [
  {
    employeeId: null, // Will be set after employee creation
    documentType: 'ktp',
    documentNumber: '3201012345678901',
    title: 'KTP Budi Santoso',
    description: 'Kartu Tanda Penduduk',
    issueDate: new Date('2018-05-10'),
    expiryDate: new Date('2023-05-10'),
    issuingAuthority: 'Disdukcapil Jakarta',
    fileUrl: 'https://storage.samudrapaket.com/employees/documents/ktp_budi_santoso.pdf',
    fileName: 'ktp_budi_santoso.pdf',
    fileSize: 1024 * 1024 * 2, // 2MB
    fileType: 'application/pdf',
    status: 'verified',
    verifiedBy: new mongoose.Types.ObjectId(),
    verifiedAt: new Date('2020-01-16'),
    uploadedBy: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    updatedBy: new mongoose.Types.ObjectId()
  },
  {
    employeeId: null, // Will be set after employee creation
    documentType: 'npwp',
    documentNumber: '123456789012345',
    title: 'NPWP Budi Santoso',
    description: 'Nomor Pokok Wajib Pajak',
    issueDate: new Date('2015-03-20'),
    issuingAuthority: 'Direktorat Jenderal Pajak',
    fileUrl: 'https://storage.samudrapaket.com/employees/documents/npwp_budi_santoso.pdf',
    fileName: 'npwp_budi_santoso.pdf',
    fileSize: 1024 * 1024 * 1.5, // 1.5MB
    fileType: 'application/pdf',
    status: 'verified',
    verifiedBy: new mongoose.Types.ObjectId(),
    verifiedAt: new Date('2020-01-16'),
    uploadedBy: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    updatedBy: new mongoose.Types.ObjectId()
  },
  {
    employeeId: null, // Will be set after employee creation
    documentType: 'ijazah',
    documentNumber: 'UN-123456',
    title: 'Ijazah S1 Dewi Lestari',
    description: 'Ijazah Sarjana Ekonomi',
    issueDate: new Date('2014-09-15'),
    issuingAuthority: 'Universitas Indonesia',
    fileUrl: 'https://storage.samudrapaket.com/employees/documents/ijazah_dewi_lestari.pdf',
    fileName: 'ijazah_dewi_lestari.pdf',
    fileSize: 1024 * 1024 * 3, // 3MB
    fileType: 'application/pdf',
    status: 'verified',
    verifiedBy: new mongoose.Types.ObjectId(),
    verifiedAt: new Date('2021-03-11'),
    uploadedBy: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    updatedBy: new mongoose.Types.ObjectId()
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('MongoDB connected');
  seedDatabase();
})
.catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Employee.deleteMany({});
    await EmployeeDocument.deleteMany({});
    
    logger.info('Existing data cleared');
    
    // Insert employees
    const createdEmployees = await Employee.insertMany(employees);
    logger.info(`${createdEmployees.length} employees inserted`);
    
    // Update document employeeIds and insert documents
    documents[0].employeeId = createdEmployees[0]._id;
    documents[1].employeeId = createdEmployees[0]._id;
    documents[2].employeeId = createdEmployees[1]._id;
    
    const createdDocuments = await EmployeeDocument.insertMany(documents);
    logger.info(`${createdDocuments.length} documents inserted`);
    
    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};
