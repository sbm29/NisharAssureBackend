
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Project = require('../models/Project');
const TestCase = require('../models/TestCase');
const TestExecution = require('../models/TestExecution');

const router = express.Router();

// Get all projects
router.get('/allprojects', protect, async (req, res) => {
  try {
    const projects = await Project.find();

    // Add statistics to each project
    const projectsWithStats = await Promise.all(projects.map(async project => {
      const testCaseCount = await TestCase.countDocuments({ projectId: project._id });

      // Calculate pass rate if there are test cases
      let passRate = 0;
      if (testCaseCount > 0) {
        const executions = await TestExecution.countDocuments({
          testCaseId: { $in: await TestCase.find({ projectId: project._id }).distinct('_id') },
          status: 'Passed'
        });

        passRate = Math.round((executions / testCaseCount) * 100);
      }

      // Calculate progress (could be based on test case statuses)
      const progress = Math.round(passRate * 0.8); // Simplified calculation

      return {
        ...project.toObject(),
        testCaseCount,
        passRate,
        progress
      };
    }));

    res.json(projectsWithStats);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new project (admin or test manager only)
router.post('/createProject', protect, authorize(['admin', 'test_manager']), async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.create({
      name,
      description,
      status,
      createdBy: req.user.id
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by id
router.get('/project/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('modules');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get project statistics
    const testCaseCount = await TestCase.countDocuments({ projectId: project._id });

    // Calculate pass rate if there are test cases
    let passRate = 0;
    if (testCaseCount > 0) {
      const executions = await TestExecution.countDocuments({
        testCaseId: { $in: await TestCase.find({ projectId: project._id }).distinct('_id') },
        status: 'Passed'
      });

      passRate = Math.round((executions / testCaseCount) * 100);
    }

    // Calculate progress
    const progress = Math.round(passRate * 0.8); // Simplified calculation

    res.json({
      ...project.toObject(),
      testCaseCount,
      passRate,
      progress
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project (admin or test manager only)
router.put('/:id', protect, authorize(['admin', 'test_manager']), async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

//get test cases based on project id 
router.get('/:projectId/testcases', protect, async (req, res) => {
  try {
    const { projectId } = req.params;

    const testCases = await TestCase.find({ project: projectId })
      .populate('project', 'name')

      .populate('testSuite', 'name')
      .populate('createdBy', 'name');

    res.json(testCases);
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
