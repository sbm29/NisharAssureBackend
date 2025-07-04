const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const TestSuite = require('../models/TestSuite');
const Module = require('../models/Module');

const router = express.Router();

// Get all test suites
router.get('/getTestSuites', protect, async (req, res) => {
  try {
    const { module, project } = req.query;
    const filter = {};
    
    if (module) filter.module = module;
    if (project) filter.project = project;
    
    const testSuites = await TestSuite.find(filter)
      .populate('module', 'name')
      .populate('project', 'name')
      .populate('createdBy', 'name');
    
    res.json(testSuites);
  } catch (error) {
    console.error('Get test suites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});






// Create test suite
router.post('/createTestSuite', protect, async (req, res) => {
  try {
    const { module, project, name, description } = req.body;
    
    const testSuite = await TestSuite.create({
      module,
      project,
      name,
      description,
      createdBy: req.user.id
    });
    
    //console.log("testSuite",testSuite);
    await Module.findByIdAndUpdate(module, {
      $push: { testSuites: testSuite._id }
    });

   
    
    res.status(201).json(testSuite);
  } catch (error) {
    console.error('Create test suite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test suite by id
router.get('/:id', protect, async (req, res) => {
  try {
    const testSuite = await TestSuite.findById(req.params.id)
      .populate('module', 'name')
      .populate('project', 'name')
      .populate('createdBy', 'name');
    
    if (!testSuite) {
      return res.status(404).json({ message: 'Test suite not found' });
    }
    
    res.json(testSuite);
  } catch (error) {
    console.error('Get test suite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update test suite
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const testSuite = await TestSuite.findById(req.params.id);
    
    if (!testSuite) {
      return res.status(404).json({ message: 'Test suite not found' });
    }
    
    testSuite.name = name || testSuite.name;
    testSuite.description = description || testSuite.description;
    
    await testSuite.save();
    
    res.json(testSuite);
  } catch (error) {
    console.error('Update test suite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete test suite
router.delete('/:id', protect, authorize(['admin', 'test_manager']), async (req, res) => {
  try {
    const testSuite = await TestSuite.findById(req.params.id);
    
    if (!testSuite) {
      return res.status(404).json({ message: 'Test suite not found' });
    }
    
    await testSuite.deleteOne();
    
    res.json({ message: 'Test suite deleted successfully' });
  } catch (error) {
    console.error('Delete test suite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move test suite to another module
router.post('/:id/move', protect, authorize(['admin', 'test_manager']), async (req, res) => {
  try {
    const { targetModuleId } = req.body;
    const testSuite = await TestSuite.findById(req.params.id);
    if (!testSuite) {
      return res.status(404).json({ message: 'Test suite not found' });
    }
    // Remove from old module
    if (testSuite.module) {
      await Module.findByIdAndUpdate(testSuite.module, { $pull: { testSuites: testSuite._id } });
    }
    // Add to new module
    await Module.findByIdAndUpdate(targetModuleId, { $addToSet: { testSuites: testSuite._id } });
    testSuite.module = targetModuleId;
    await testSuite.save();
    res.json({ message: 'Test suite moved successfully', testSuite });
  } catch (error) {
    console.error('Move test suite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Copy test suite to another module
router.post('/:id/copy', protect, authorize(['admin', 'test_manager']), async (req, res) => {
  try {
    const { targetModuleId } = req.body;
    const testSuite = await TestSuite.findById(req.params.id);
    if (!testSuite) {
      return res.status(404).json({ message: 'Test suite not found' });
    }
    // Create a copy
    const copiedSuite = await TestSuite.create({
      name: testSuite.name + ' (Copy)',
      description: testSuite.description,
      module: targetModuleId,
      project: testSuite.project,
      createdBy: req.user.id
    });
    // Add to new module
    await Module.findByIdAndUpdate(targetModuleId, { $addToSet: { testSuites: copiedSuite._id } });
    res.status(201).json({ message: 'Test suite copied successfully', testSuite: copiedSuite });
  } catch (error) {
    console.error('Copy test suite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
