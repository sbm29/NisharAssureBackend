
/**
 * TestRun Model
 * 
 * Defines the schema for test runs in the application.
 * A test run represents a specific execution of test cases within a project.
 * The model tracks test case status, execution details, and maintains execution history.
 */

const mongoose = require('mongoose');

// Define the schema for test execution history entries
// Each time a test case status is updated, the previous state is stored here
const testRunSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // Overall status of the test run (In Progress, Completed, Cancelled)
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Cancelled'],
    default: 'In Progress'
  },
  // Timestamps for the test run execution period
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  // Array of test cases included in this test run with their execution status
  testCases: [{
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase',
      required: true
    },
    // Current status of the test case in this run
    status: {
      type: String,
      enum: ['Passed', 'Failed', 'Blocked', 'Rejected', 'Not Executed'],
      default: 'Not Executed'
    },
    // Information about who executed the test
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    executedAt: {
      type: Date
    },
    // Results and notes from test execution
    actualResults: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    // Historical record of all previous executions of this test case in this run
    // Preserves the complete execution history for auditing and tracking
    history: [{
      status: {
        type: String,
        enum: ['Passed', 'Failed', 'Blocked', 'Rejected', 'Not Executed'],
        required: true
      },
      actualResults: {
        type: String,
        trim: true
      },
      notes: {
        type: String,
        trim: true
      },
      executedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      executedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  // User who created this test run
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

const TestRun = mongoose.model('TestRun', testRunSchema);

module.exports = TestRun;
