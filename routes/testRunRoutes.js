
/**
 * Test Run Routes
 * 
 * API endpoints for managing test runs.
 * Provides functionality to create, read, update, and delete test runs.
 * Also includes endpoints for managing test cases within runs and tracking execution metrics.
 * 
 * Connection to Frontend:
 * The frontend interacts with these endpoints to:
 * - Create and manage test runs
 * - Execute test cases within runs
 * - Track test execution history
 * - Calculate test run metrics
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const TestRun = require('../models/TestRun');
const TestCase = require('../models/TestCase');

const router = express.Router();

/**
 * @route   GET /api/test-runs/project/:projectId
 * @desc    Get all test runs for a project
 * @access  Private
 */
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Find all test runs for the project and populate creator information
    const testRuns = await TestRun.find({ projectId })
      .populate('createdBy', 'name')
      .sort('-createdAt');
    
    res.json(testRuns);
  } catch (error) {
    console.error('Get test runs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/test-runs
 * @desc    Create a new test run
 * @access  Private
 */
router.post('/create', protect, async (req, res) => {
  try {
    const { name, description, projectId, testCaseIds } = req.body;
    
    // Initialize test run with provided test cases
    const testCases = testCaseIds ? testCaseIds.map(id => ({
      testCaseId: id,
      status: 'Not Executed',
      history: []
    })) : [];
    
    // Create the test run
    const testRun = await TestRun.create({
      name,
      description,
      projectId,
      testCases,
      createdBy: req.user.id,
      status: 'In Progress'
    });
    
    res.status(201).json(testRun);
  } catch (error) {
    console.error('Create test run error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/test-runs/:id
 * @desc    Get a test run by ID with populated details
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    // Find test run by ID and populate related information
    const testRun = await TestRun.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .populate({
        path: 'testCases.testCaseId',
        select: 'title description priority type steps expectedResults'
      })
      .populate('testCases.executedBy', 'name')
      .populate('testCases.history.executedBy', 'name');
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    res.json(testRun);
  } catch (error) {
    console.error('Get test run error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/test-runs/:id
 * @desc    Update a test run
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    const testRun = await TestRun.findById(req.params.id);
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    // Update test run fields
    testRun.name = name || testRun.name;
    testRun.description = description || testRun.description;
    
    // Handle status changes and set end date if completed
    if (status) {
      testRun.status = status;
      
      if (status === 'Completed') {
        testRun.endDate = new Date();
      }
    }
    
    await testRun.save();
    
    res.json(testRun);
  } catch (error) {
    console.error('Update test run error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/test-runs/:id
 * @desc    Delete a test run
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const testRun = await TestRun.findById(req.params.id);
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    await testRun.deleteOne();
    
    res.json({ message: 'Test run deleted successfully' });
  } catch (error) {
    console.error('Delete test run error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/test-runs/:id/test-cases
 * @desc    Add test cases to a test run
 * @access  Private
 */
router.post('/:id/test-cases', protect, async (req, res) => {
  try {
    const { testCaseIds } = req.body;
    
    const testRun = await TestRun.findById(req.params.id);
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    // Filter out test cases that are already in the run
    const existingTestCaseIds = testRun.testCases.map(tc => tc.testCaseId.toString());
    const newTestCaseIds = testCaseIds.filter(id => !existingTestCaseIds.includes(id));
    
    // Add new test cases to the test run
    const newTestCases = newTestCaseIds.map(id => ({
      testCaseId: id,
      status: 'Not Executed',
      history: []
    }));
    
    testRun.testCases = [...testRun.testCases, ...newTestCases];
    await testRun.save();
    
    res.json(testRun);
  } catch (error) {
    console.error('Add test cases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/test-runs/:id/test-cases/:testCaseId
 * @desc    Remove a test case from a test run
 * @access  Private
 */
router.delete('/:id/test-cases/:testCaseId', protect, async (req, res) => {
  try {
    const { id, testCaseId } = req.params;
    
    const testRun = await TestRun.findById(id);
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    // Remove test case from the test run
    testRun.testCases = testRun.testCases.filter(
      tc => tc.testCaseId.toString() !== testCaseId
    );
    
    await testRun.save();
    
    res.json(testRun);
  } catch (error) {
    console.error('Remove test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/test-runs/:id/test-cases/:testCaseId/execute
 * @desc    Execute a test case in a test run and maintain execution history
 * @access  Private
 */
router.post('/:id/test-cases/:testCaseId/execute', protect, async (req, res) => {
  try {
    const { id, testCaseId } = req.params;
    const { status, actualResults, notes } = req.body;
    
    const testRun = await TestRun.findById(id);
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    // Find the test case in the test run
    const testCaseIndex = testRun.testCases.findIndex(
      tc => tc.testCaseId.toString() === testCaseId
    );
    
    if (testCaseIndex === -1) {
      return res.status(404).json({ message: 'Test case not found in this test run' });
    }
    
    // Get the current test case data
    const testCase = testRun.testCases[testCaseIndex];
    
    // Add current status to history if it's not the first execution
    // This preserves the complete execution history
    if (testCase.executedAt) {
      testRun.testCases[testCaseIndex].history.push({
        status: testCase.status,
        actualResults: testCase.actualResults,
        notes: testCase.notes,
        executedBy: testCase.executedBy,
        executedAt: testCase.executedAt
      });
    }
    
    // Update the test case execution with new data
    testRun.testCases[testCaseIndex].status = status;
    testRun.testCases[testCaseIndex].actualResults = actualResults;
    testRun.testCases[testCaseIndex].notes = notes;
    testRun.testCases[testCaseIndex].executedBy = req.user.id;
    testRun.testCases[testCaseIndex].executedAt = new Date();
    
    await testRun.save();
    
    res.json(testRun);
  } catch (error) {
    console.error('Execute test case error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/test-runs/:id/test-cases/:testCaseId/history
 * @desc    Get execution history for a test case in a specific run
 * @access  Private
 */
router.get('/:id/test-cases/:testCaseId/history', protect, async (req, res) => {
  try {
    const { id, testCaseId } = req.params;
    
    const testRun = await TestRun.findById(id)
      .populate('testCases.history.executedBy', 'name');
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    // Find the test case in the test run
    const testCase = testRun.testCases.find(
      tc => tc.testCaseId.toString() === testCaseId
    );
    
    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found in this test run' });
    }
    
    res.json(testCase.history);
  } catch (error) {
    console.error('Get test case history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/test-runs/:id/metrics
 * @desc    Get metrics for a test run (pass rate, counts by status)
 * @access  Private
 */
router.get('/:id/metrics', protect, async (req, res) => {
  try {
    const testRun = await TestRun.findById(req.params.id);
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    // Calculate metrics for reporting and dashboards
    const totalTestCases = testRun.testCases.length;
    const executed = testRun.testCases.filter(tc => tc.status !== 'Not Executed').length;
    const passed = testRun.testCases.filter(tc => tc.status === 'Passed').length;
    const failed = testRun.testCases.filter(tc => tc.status === 'Failed').length;
    const blocked = testRun.testCases.filter(tc => tc.status === 'Blocked').length;
    const rejected = testRun.testCases.filter(tc => tc.status === 'Rejected').length;
    const notExecuted = totalTestCases - executed;
    
    // Calculate pass rate percentage
    const passRate = totalTestCases > 0 ? Math.round((passed / totalTestCases) * 100) : 0;
    
    res.json({
      totalTestCases,
      executed,
      passed,
      failed,
      blocked,
      rejected,
      notExecuted,
      passRate
    });
  } catch (error) {
    console.error('Get test run metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/test-runs/:id/complete
 * @desc    Mark a test run as completed and set the end date
 * @access  Private
 */
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const testRun = await TestRun.findById(req.params.id);
    
    if (!testRun) {
      return res.status(404).json({ message: 'Test run not found' });
    }
    
    testRun.status = 'Completed';
    testRun.endDate = new Date();
    
    await testRun.save();
    
    res.json(testRun);
  } catch (error) {
    console.error('Complete test run error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
