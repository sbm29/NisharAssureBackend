const mongoose = require('mongoose');


const testExecutionSchema = new mongoose.Schema({
  testRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRun',
    required: true
  },
  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase',
    required: true
  },
  status: {
    type: String,
    enum: ['Passed', 'Failed', 'Blocked', 'Rejected', 'Not Executed'],
    default: 'Not Executed'
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
  },
  isFinal: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
