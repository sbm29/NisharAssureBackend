
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const TestCase = require('../models/TestCase');
const TestExecution = require('../models/TestExecution');
const TestSuite = require('../models/TestSuite');

const router = express.Router();

// Get all test cases
router.get('/getAllTestCases', protect, async (req, res) => {
  try {
    const { project, module, testSuite } = req.query;
    const filter = {};
    
    if (project) filter.project = project;
    if (module) filter.module = module;
    if (testSuite) filter.testSuite = testSuite;
    
    const testCases = await TestCase.find(filter)
      .populate('project', 'name')
      .populate('module', 'name')
      .populate('testSuite', 'name')
      .populate('createdBy', 'name');
    
    res.json(testCases);
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Create test case
router.post('/createTestCase', protect, async (req, res) => {
  
  try {
    const { 
      project,
      module,
      testSuite,
      title,
      description,
      priority,
      type,
      preconditions,
      steps,
      expectedResults,
      
    } = req.body;
    
    const newTestCase = await TestCase.create({
      project,
      module,
      testSuite,
      title,
      description,
      priority,
      type,
      preconditions,
      steps,
      expectedResults,
      createdBy: req.user.id
    });
    
    res.status(201).json(newTestCase);
  } catch (error) {
    console.error('Create test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test case by id
router.get('/:id', protect, async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id)
      .populate('project', 'name')
      .populate('module', 'name')
      .populate('testSuite', 'name')
      .populate('createdBy', 'name');
    
    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    
    // Get the latest execution
    const latestExecution = await TestExecution.findOne({ 
      testCaseId: testCase._id 
    })
    .sort('-createdAt')
    .populate('executedBy', 'name');
    
    res.json({
      ...testCase.toObject(),
      latestExecution
    });
  } catch (error) {
    console.error('Get test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test case by testCaseId
router.get('/reference/:testCaseId', protect, async (req, res) => {
  try {
    const testCase = await TestCase.findOne({ testCaseId: req.params.testCaseId })
      .populate('project', 'name')
      .populate('module', 'name')
      .populate('testSuite', 'name')
      .populate('createdBy', 'name');
    
    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    
    // Get the latest execution
    const latestExecution = await TestExecution.findOne({ 
      testCaseId: testCase._id 
    })
    .sort('-createdAt')
    .populate('executedBy', 'name');
    
    res.json({
      ...testCase.toObject(),
      latestExecution
    });
  } catch (error) {
    console.error('Get test case by reference error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update test case
router.put('/updateTestCase/:id', protect, async (req, res) => {
  //console.log("Update test case", req.body);
  try {
    const { 
      title, description, priority, 
      type, preconditions, steps, expectedResults, status 
    } = req.body;

    const paramId = req.params.id;
    //console.log("Param Id ", paramId);

    const testCasetobeupdated = await TestCase.findById(paramId);

    //const tc = await TestCase.findByIdAndUpdate
    //console.log("Update to be test case", testCasetobeupdated);

    if (!testCasetobeupdated) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    
    // Update fields
    testCasetobeupdated.title = title || testCasetobeupdated.title;
    testCasetobeupdated.description = description || testCasetobeupdated.description;
    testCasetobeupdated.priority = priority || testCasetobeupdated.priority;
    testCasetobeupdated.type = type || testCasetobeupdated.type;
    testCasetobeupdated.preconditions = preconditions || testCasetobeupdated.preconditions;
    testCasetobeupdated.steps = steps || testCasetobeupdated.steps;
    testCasetobeupdated.expectedResults = expectedResults || testCasetobeupdated.expectedResults;
    testCasetobeupdated.status = status || testCasetobeupdated.status;
    
    await testCasetobeupdated.save();
    
    res.json(testCasetobeupdated);
  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete test case
router.delete('/:id', protect, authorize(['admin', 'test_manager']), async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id);
    
    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    
    await testCase.deleteOne();
    
    // Also delete related test executions
    await TestExecution.deleteMany({ testCaseId: req.params.id });
    
    res.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Execute test case
router.post('/:id/execute', protect, async (req, res) => {
  try {
    const { status, actualResults, notes } = req.body;
    
    // Verify test case exists
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    
    // Create new test execution
    const testExecution = await TestExecution.create({
      testCaseId: req.params.id,
      status,
      actualResults,
      notes,
      executedBy: req.user.id
    });
    
    // Update test case status based on execution
    testCase.status = status === 'Passed' ? 'Passed' : 
                      status === 'Failed' ? 'Failed' : 
                      testCase.status;
    await testCase.save();
    
    res.status(201).json(testExecution);
  } catch (error) {
    console.error('Execute test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test executions for a test case
router.get('/:id/executions', protect, async (req, res) => {
  try {
    const executions = await TestExecution.find({ 
      testCaseId: req.params.id 
    })
    .sort('-createdAt')
    .populate('executedBy', 'name');
    
    res.json(executions);
  } catch (error) {
    console.error('Get test executions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new route for importing test cases
router.post('/import', protect, async (req, res) => {
  try {
    const { testCases } = req.body;
    
    // Validate each test case and add createdBy
    const testCasesWithUser = testCases.map(testCase => ({
      ...testCase,
      createdBy: req.user.id
    }));

    // Insert all test cases
    const result = await TestCase.insertMany(testCasesWithUser);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Import test cases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move test case to another test suite
router.post('/:id/move', protect, async (req, res) => {
  try {
    const { targetTestSuiteId } = req.body;
    
    // Find the test case
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    
    // Find the target test suite to get moduleId
    const TestSuite = require('../models/TestSuite');
    const targetTestSuite = await TestSuite.findById(targetTestSuiteId);
    if (!targetTestSuite) {
      return res.status(404).json({ message: 'Target test suite not found' });
    }
    
    // Update test case with new module and test suite IDs
    testCase.module = targetTestSuite.module;
    testCase.testSuite = targetTestSuiteId;
    await testCase.save();
    
    res.json({ message: 'Test case moved successfully', testCase });
  } catch (error) {
    console.error('Move test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Copy test case to another test suite
router.post('/:id/copy', protect, async (req, res) => {
  try {
    const { targetTestSuiteId } = req.body;
    
    // Find the test case to copy
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    
    // Find the target test suite to get moduleId
   
    const targetTestSuite = await TestSuite.findById(targetTestSuiteId);
    if (!targetTestSuite) {
      return res.status(404).json({ message: 'Target test suite not found' });
    }
    
    // Create a new test case with the same data but different IDs
    const newTestCase = new TestCase({
      project: testCase.project,
      module: targetTestSuite.module,
      testSuite: targetTestSuiteId,
      title: `${testCase.title} (Copy)`,
      description: testCase.description,
      priority: testCase.priority,
      type: testCase.type,
      preconditions: testCase.preconditions,
      steps: testCase.steps,
      expectedResults: testCase.expectedResults,
      status: 'Draft',
      createdBy: req.user.id
    });
    
    await newTestCase.save();
    
    res.status(201).json({ message: 'Test case copied successfully', testCase: newTestCase });
  } catch (error) {
    console.error('Copy test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
