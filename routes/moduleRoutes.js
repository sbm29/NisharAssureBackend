
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Module = require('../models/Module');
const Project = require('../models/Project');
const router = express.Router();

// Get all modules
router.get('/getModules', protect, async (req, res) => {
  
  
  try {
    const { project } = req.query;
    if (!project) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    const filter = project ? { project } : {};

    const modules = await Module.find(filter)
      .populate('project', 'name')
      .populate('createdBy', 'name');

    res.status(200).json({ modules }); // ✅ wrap in object
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Create module
router.post('/createModule', protect, async (req, res) => {
  try {
    const { project, name, description } = req.body;

    if (!project ) {
      return res.status(400).json({ message: 'Project ID is required.' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Module name is required.' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: user not found.' });
    }

    // Optional: Validate if the project exists
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    
    const module = await Module.create({
      project,
      name,
      description,
      createdBy: req.user.id
    });
    
    await module.save();

    // Add module reference to the project
    existingProject.modules.push(module._id);
    await existingProject.save();

    res.status(201).json(module);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get module by id
router.get('/:id', protect, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name');
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json(module);
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update module
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    module.name = name || module.name;
    module.description = description || module.description;
    
    await module.save();
    
    res.json(module);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete module
router.delete('/:id', protect, authorize(['admin', 'test_manager']), async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    await module.deleteOne();
    
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
