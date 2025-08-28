

const mongoose = require('mongoose');
const Module = require('./Module');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'On Hold', 'Completed'],
    default: 'Planning'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for computed metrics
projectSchema.virtual('progress').get(function () {
  return this._progress || 0;
});
projectSchema.virtual('testCaseCount').get(function () {
  return this._testCaseCount || 0;
});
projectSchema.virtual('passRate').get(function () {
  return this._passRate || 0;
});

module.exports = mongoose.model('Project', projectSchema);
