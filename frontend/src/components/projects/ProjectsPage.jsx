import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, Plus, Home, Users, Calendar, Bell, User,
  LogOut, Search, CheckCircle, Clock, Share2, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { projectsAPI, followAPI, getImageUrl } from '../../services/api';
import './projects.css';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [publicCompleted, setPublicCompleted] = useState([]);
  const [publicOngoing, setPublicOngoing] = useState([]);
  const [collaborating, setCollaborating] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [circlePeople, setCirclePeople] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    loadProjects();
    loadCircle();
    // Get current user from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({ _id: payload.userId });
    } catch { /* silent */ }
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setPublicCompleted(res.data.publicCompleted || []);
      setPublicOngoing(res.data.publicOngoing || []);
      setCollaborating(res.data.collaborating || []);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCircle = async () => {
    try {
      const res = await followAPI.getSuggestions();
      setCirclePeople(res.data.suggestions || []);
    } catch { /* silent */ }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="projects-loading">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* Navbar */}
      <nav className="feed-nav">
        <div className="feed-nav-content">
          <div className="feed-nav-left">
            <h1 className="feed-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/feed')}>
              Sewing Circle
            </h1>
          </div>
          <div className="feed-nav-center">
            <div className="feed-search">
              <Search size={18} />
              <input type="text" placeholder="Search projects..." />
            </div>
          </div>
          <div className="feed-nav-right">
            <button className="nav-icon-btn" onClick={() => navigate('/feed')} title="Home">
              <Home size={20} /><span>Home</span>
            </button>
            <button className="nav-icon-btn" onClick={() => navigate('/feed')} title="Circle">
              <Users size={20} /><span>Circle</span>
            </button>
            <button className="nav-icon-btn" onClick={() => navigate('/feed')} title="Events">
              <Calendar size={20} /><span>Events</span>
            </button>
            <button className="nav-icon-btn active" title="Projects">
              <FolderOpen size={20} /><span>Projects</span>
            </button>
            <button className="nav-icon-btn logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="projects-header">
        <div className="projects-header-content">
          <div>
            <h2>Projects</h2>
            <p>Explore public projects and collaborate with your circle</p>
          </div>
          <button className="add-project-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Add Project
          </button>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="projects-layout">
        {/* Left column: Public Completed */}
        <div className="projects-col">
          <div className="projects-col-header">
            <CheckCircle size={18} className="col-icon completed" />
            <h3>Completed Projects</h3>
            <span className="col-count">{publicCompleted.length}</span>
          </div>
          {publicCompleted.length === 0 ? (
            <div className="projects-empty">No completed projects yet</div>
          ) : (
            publicCompleted.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                currentUser={currentUser}
                onView={() => setSelectedProject(p)}
                onShare={() => setShareModal(p)}
              />
            ))
          )}

          {/* Public Ongoing below completed on left */}
          <div className="projects-col-header" style={{ marginTop: '1.5rem' }}>
            <Clock size={18} className="col-icon ongoing" />
            <h3>Ongoing Projects</h3>
            <span className="col-count">{publicOngoing.length}</span>
          </div>
          {publicOngoing.length === 0 ? (
            <div className="projects-empty">No ongoing projects yet</div>
          ) : (
            publicOngoing.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                currentUser={currentUser}
                onView={() => setSelectedProject(p)}
                onShare={() => setShareModal(p)}
              />
            ))
          )}
        </div>

        {/* Right column: Collaborating */}
        <div className="projects-col projects-col-right">
          <div className="projects-col-header">
            <Users size={18} className="col-icon collab" />
            <h3>My Projects & Collaborations</h3>
            <span className="col-count">{collaborating.length}</span>
          </div>
          {collaborating.length === 0 ? (
            <div className="projects-empty">
              <p>No projects yet.</p>
              <button className="add-project-btn-sm" onClick={() => setShowForm(true)}>
                <Plus size={14} /> Add your first project
              </button>
            </div>
          ) : (
            collaborating.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                currentUser={currentUser}
                onView={() => setSelectedProject(p)}
                onShare={() => setShareModal(p)}
                showOwner
              />
            ))
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showForm && (
        <AddProjectModal
          onClose={() => setShowForm(false)}
          onCreated={(proj) => {
            setCollaborating(prev => [proj, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          currentUser={currentUser}
          onClose={() => setSelectedProject(null)}
          onRefresh={loadProjects}
        />
      )}

      {/* Share Modal */}
      {shareModal && (
        <ShareModal
          project={shareModal}
          people={circlePeople}
          onClose={() => setShareModal(null)}
        />
      )}
    </div>
  );
};

// ── Project Card ──
const ProjectCard = ({ project, currentUser, onView, onShare, showOwner }) => {
  const isOwner = currentUser && project.owner?._id === currentUser._id;
  const statusColors = { completed: '#16a34a', ongoing: '#2563eb', paused: '#d97706' };

  return (
    <div className="project-card">
      <div className="project-card-top">
        <div className="project-card-status" style={{ background: statusColors[project.status] || '#64748b' }}>
          {project.status}
        </div>
        {project.visibility === 'private' && <span className="project-private-badge">Private</span>}
      </div>
      <h4 className="project-card-name">{project.name}</h4>
      <p className="project-card-aim">{project.aim}</p>
      {project.techStack?.length > 0 && (
        <div className="project-tech-stack">
          {project.techStack.slice(0, 4).map((t, i) => (
            <span key={i} className="tech-tag">{t}</span>
          ))}
          {project.techStack.length > 4 && <span className="tech-tag">+{project.techStack.length - 4}</span>}
        </div>
      )}
      {showOwner && project.owner && (
        <div className="project-owner">
          <User size={12} />
          <span>{project.owner.firstName} {project.owner.lastName}</span>
          {isOwner && <span className="owner-badge">You</span>}
        </div>
      )}
      <div className="project-card-footer">
        <span className="project-collabs">{project.collaborators?.length || 0} collaborators</span>
        <div className="project-card-actions">
          {isOwner && (
            <button className="project-share-btn" onClick={onShare} title="Share">
              <Share2 size={14} />
            </button>
          )}
          <button className="project-view-btn" onClick={onView}>View</button>
        </div>
      </div>
    </div>
  );
};

// ── Add Project Modal ──
const AddProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '', aim: '', description: '',
    techStack: '', status: 'ongoing', visibility: 'public',
    tags: '', repoUrl: '', demoUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.aim || !form.description) {
      setError('Name, aim, and description are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      const res = await projectsAPI.create(payload);
      onCreated(res.data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-box-header">
          <h3>Add New Project</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="project-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <label>Project Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. AI Study Group App" />
          </div>
          <div className="form-row">
            <label>Project Aim *</label>
            <input value={form.aim} onChange={e => setForm({ ...form, aim: e.target.value })} placeholder="One-line goal of the project" />
          </div>
          <div className="form-row">
            <label>Description *</label>
            <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the project in detail..." />
          </div>
          <div className="form-row">
            <label>Tech Stack (comma-separated)</label>
            <input value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })} placeholder="React, Node.js, MongoDB" />
          </div>
          <div className="form-row-2">
            <div className="form-row">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="form-row">
              <label>Visibility</label>
              <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="AI, web, mobile" />
          </div>
          <div className="form-row-2">
            <div className="form-row">
              <label>Repo URL</label>
              <input value={form.repoUrl} onChange={e => setForm({ ...form, repoUrl: e.target.value })} placeholder="https://github.com/..." />
            </div>
            <div className="form-row">
              <label>Demo URL</label>
              <input value={form.demoUrl} onChange={e => setForm({ ...form, demoUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Project Detail Modal ──
const ProjectDetailModal = ({ project, currentUser, onClose, onRefresh }) => {
  const [updateText, setUpdateText] = useState('');
  const [posting, setPosting] = useState(false);
  const isOwner = currentUser && project.owner?._id === currentUser._id;
  const isCollab = project.collaborators?.some(c => c.user?._id === currentUser?._id);

  const handleAddUpdate = async () => {
    if (!updateText.trim()) return;
    setPosting(true);
    try {
      await projectsAPI.addUpdate(project._id, updateText.trim());
      setUpdateText('');
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post update');
    } finally {
      setPosting(false);
    }
  };

  const handleCollaborate = async () => {
    try {
      await projectsAPI.collaborate(project._id);
      alert('You have been added as a collaborator!');
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-large" onClick={e => e.stopPropagation()}>
        <div className="modal-box-header">
          <div>
            <h3>{project.name}</h3>
            <span className="project-status-pill">{project.status}</span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="project-detail-body">
          <div className="project-detail-section">
            <h4>Aim</h4>
            <p>{project.aim}</p>
          </div>
          <div className="project-detail-section">
            <h4>Description</h4>
            <p>{project.description}</p>
          </div>
          {project.techStack?.length > 0 && (
            <div className="project-detail-section">
              <h4>Tech Stack</h4>
              <div className="project-tech-stack">
                {project.techStack.map((t, i) => <span key={i} className="tech-tag">{t}</span>)}
              </div>
            </div>
          )}
          {project.collaborators?.length > 0 && (
            <div className="project-detail-section">
              <h4>Collaborators ({project.collaborators.length})</h4>
              <div className="collab-list">
                {project.collaborators.map((c, i) => (
                  <div key={i} className="collab-item">
                    <User size={16} />
                    <span>{c.user?.firstName} {c.user?.lastName}</span>
                    <span className="collab-role">{c.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {project.updates?.length > 0 && (
            <div className="project-detail-section">
              <h4>Updates</h4>
              <div className="updates-list">
                {project.updates.map((u, i) => (
                  <div key={i} className="update-item">
                    <div className="update-author">
                      <User size={14} />
                      <span>{u.postedBy?.firstName} {u.postedBy?.lastName}</span>
                      <span className="update-date">{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>{u.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(isOwner || isCollab) && (
            <div className="project-detail-section">
              <h4>Post an Update</h4>
              <textarea
                rows={3}
                value={updateText}
                onChange={e => setUpdateText(e.target.value)}
                placeholder="Share a project update..."
                className="update-textarea"
              />
              <button className="btn-primary" onClick={handleAddUpdate} disabled={posting || !updateText.trim()}>
                {posting ? 'Posting...' : 'Post Update'}
              </button>
            </div>
          )}
          {!isOwner && !isCollab && project.visibility === 'public' && (
            <div className="project-detail-section">
              <button className="btn-primary" onClick={handleCollaborate}>
                <Users size={16} /> Join as Collaborator
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Share Modal ──
const ShareModal = ({ project, people, onClose }) => {
  const [selected, setSelected] = useState([]);
  const [sharing, setSharing] = useState(false);

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleShare = async () => {
    if (selected.length === 0) return;
    setSharing(true);
    try {
      await projectsAPI.share(project._id, selected);
      alert(`Project shared with ${selected.length} people!`);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to share');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-box-header">
          <h3>Share "{project.name}"</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="share-subtitle">Select people from your circle to share this project with:</p>
        {people.length === 0 ? (
          <p className="no-suggestions">No people in your circle yet</p>
        ) : (
          <div className="share-people-list">
            {people.map(p => (
              <label key={p._id} className={`share-person ${selected.includes(p._id) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selected.includes(p._id)}
                  onChange={() => toggle(p._id)}
                />
                <User size={16} />
                <span>{p.firstName} {p.lastName}</span>
                {p.headline && <span className="share-person-headline">{p.headline}</span>}
              </label>
            ))}
          </div>
        )}
        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleShare} disabled={sharing || selected.length === 0}>
            {sharing ? 'Sharing...' : `Share with ${selected.length} people`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
