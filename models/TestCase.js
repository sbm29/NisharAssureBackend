
// /**
//  * TestCase Model
//  * 
//  * Defines the schema for test cases in the application.
//  * A test case represents a specific test scenario that can be executed.
//  */

// const mongoose = require('mongoose');

// // Function to generate a unique test case ID
// const generateTestCaseId = function() {
//   // Generate a random 3-digit number and pad with leading zeros
//   const randomNum = Math.floor(1000 + Math.random() * 9000);
//   return `TC-${randomNum}`;
// };

// const testCaseSchema = new mongoose.Schema({
//   testCaseId: {
//     type: String,
//     default: generateTestCaseId,
//     unique: true,
//     index: true
//   },
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   moduleId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Module',
//     required: true
//   },
//   testSuiteId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'TestSuite',
//     required: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   priority: {
//     type: String,
//     enum: ['Low', 'Medium', 'High', 'Critical'],
//     default: 'Medium'
//   },
//   type: {
//     type: String,
//     enum: ['Functional', 'Integration', 'UI/UX', 'Performance', 'Security'],
//     default: 'Functional'
//   },
//   preconditions: {
//     type: String,
//     trim: true
//   },
//   steps: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   expectedResults: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   status: {
//     type: String,
//     enum: ['Draft', 'Ready', 'In Progress', 'Passed', 'Failed', 'Blocked', 'Rejected'],
//     default: 'Draft'
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// const TestCase = mongoose.model('TestCase', testCaseSchema);

// module.exports = TestCase;

const mongoose = require('mongoose');

const Module = require('./Module');
const TestSuite = require('./TestSuite');
const Project = require('./Project');
const User = require('./User');


const generateTestCaseId = () => {
  const timestamp = Date.now().toString(36);
  return `TC-${timestamp}`;
};

 

const testCaseSchema = new mongoose.Schema({
  testCaseId: {
    type: String,
    default: generateTestCaseId,
    unique: true,
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Project,
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Module,
    required: true
  },
  testSuite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: TestSuite,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  type: {
    type: String,
    enum: ['Functional', 'Integration', 'UI/UX', 'Performance', 'Security'],
    default: 'Functional'
  },
  preconditions: {
    type: String,
    trim: true
  },
  steps: {
    type: String,
    required: true,
    trim: true
  },
  expectedResults: {
    type: String,
    required: false // move to step.expected ideally
  },
  status: {
    type: String,
    enum: ['Draft', 'Ready', 'In Progress', 'Passed', 'Failed', 'Blocked', 'Rejected'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: false
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('TestCase', testCaseSchema);
