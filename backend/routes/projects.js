const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth middleware
const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'approved') return res.status(403).json({ success: false, message: 'Not authorized' });
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET /api/projects - get public projects + own projects + collaborating projects
router.get('/', verifyUser, async (req, res) => {
  try {
    const userId = req.userId;

    // Public projects (not owned by user)
    const publicProjects = await Project.find({
      visibility: 'public',
      owner: { $ne: userId },
      'collaborators.user': { $ne: userId }
    })
      .populate('owner', 'firstName lastName profilePicture headline')
      .populate('collaborators.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    // Own projects
    const ownProjects = await Project.find({ owner: userId })
      .populate('owner', 'firstName lastName profilePicture headline')
      .populate('collaborators.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    // Collaborating projects (not owned)
    const collabProjects = await Project.find({
      'collaborators.user': userId,
      owner: { $ne: userId }
    })
      .populate('owner', 'firstName lastName profilePicture headline')
      .populate('collaborators.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      publicCompleted: publicProjects.filter(p => p.status === 'completed'),
      publicOngoing: publicProjects.filter(p => p.status === 'ongoing' || p.status === 'paused'),
      collaborating: [...ownProjects, ...collabProjects]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects - create project
router.post('/', verifyUser, async (req, res) => {
  try {
    const { name, aim, description, techStack, status, visibility, tags, repoUrl, demoUrl } = req.body;
    if (!name || !aim || !description) {
      return res.status(400).json({ success: false, message: 'Name, aim, and description are required' });
    }
    const project = new Project({
      name, aim, description,
      techStack: techStack || [],
      status: status || 'ongoing',
      visibility: visibility || 'public',
      tags: tags || [],
      repoUrl: repoUrl || '',
      demoUrl: demoUrl || '',
      owner: req.userId
    });
    await project.save();
    await project.populate('owner', 'firstName lastName profilePicture headline');
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/projects/:id
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'firstName lastName profilePicture headline')
      .populate('collaborators.user', 'firstName lastName profilePicture headline')
      .populate('updates.postedBy', 'firstName lastName profilePicture');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Check access: public, owner, collaborator, or shared
    const isOwner = project.owner._id.toString() === req.userId.toString();
    const isCollab = project.collaborators.some(c => c.user._id.toString() === req.userId.toString());
    const isShared = project.sharedWith.some(id => id.toString() === req.userId.toString());

    if (project.visibility === 'private' && !isOwner && !isCollab && !isShared) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/projects/:id - update project
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can edit this project' });
    }
    const allowed = ['name', 'aim', 'description', 'techStack', 'status', 'visibility', 'tags', 'repoUrl', 'demoUrl'];
    allowed.forEach(field => { if (req.body[field] !== undefined) project[field] = req.body[field]; });
    await project.save();
    await project.populate('owner', 'firstName lastName profilePicture headline');
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this project' });
    }
    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects/:id/updates - add update
router.post('/:id/updates', verifyUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const isOwner = project.owner.toString() === req.userId.toString();
    const isCollab = project.collaborators.some(c => c.user.toString() === req.userId.toString());
    if (!isOwner && !isCollab) return res.status(403).json({ success: false, message: 'Not authorized' });
    project.updates.push({ content: req.body.content, postedBy: req.userId });
    await project.save();
    await project.populate('updates.postedBy', 'firstName lastName profilePicture');
    res.json({ success: true, updates: project.updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects/:id/share - share with circle members
router.post('/:id/share', verifyUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can share this project' });
    }
    const { userIds } = req.body; // array of user IDs to share with
    if (!Array.isArray(userIds)) return res.status(400).json({ success: false, message: 'userIds must be an array' });
    // Add to sharedWith without duplicates
    userIds.forEach(id => {
      if (!project.sharedWith.some(s => s.toString() === id)) {
        project.sharedWith.push(id);
      }
    });
    await project.save();
    res.json({ success: true, message: 'Project shared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects/:id/collaborate - request to collaborate
router.post('/:id/collaborate', verifyUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.owner.toString() === req.userId.toString()) {
      return res.status(400).json({ success: false, message: 'You are the owner' });
    }
    const alreadyCollab = project.collaborators.some(c => c.user.toString() === req.userId.toString());
    if (alreadyCollab) return res.status(400).json({ success: false, message: 'Already a collaborator' });
    project.collaborators.push({ user: req.userId, role: req.body.role || 'Collaborator' });
    await project.save();
    res.json({ success: true, message: 'Added as collaborator' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
