
// /**
//  * TestCase Model
//  * 
//  * Defines the schema for test cases in the application.
//  * A test case represents a specific test scenario that can be executed.
//  */



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

  testSuite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: TestSuite,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
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
