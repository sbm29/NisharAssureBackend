
// const mongoose = require('mongoose');

// const testSuiteSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   moduleId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Module',
//     required: true
//   },
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// const TestSuite = mongoose.model('TestSuite', testSuiteSchema);

// module.exports = TestSuite;

const mongoose = require('mongoose');
const Module = require('./Module');
const Project = require('./Project');
const User = require('./User');

const testSuiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Module,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Project,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestSuite', testSuiteSchema);
