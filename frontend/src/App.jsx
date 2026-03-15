import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Component imports - organized by sections
import { Navigation } from './components/navigation';
import { Hero } from './components/hero';
import { AboutSection } from './components/about';
import { ObjectivesSection } from './components/objectives';
import { VisionSection } from './components/vision';
import { FutureSection } from './components/future';
import { CommunitySection } from './components/community';
import { EventsSection } from './components/events';
import { ContactSection } from './components/contact';
import { Footer } from './components/footer';
import AdminPanel from './components/admin/AdminPanel';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { RegisterForm, LoginForm } from './components/auth';
import { ProfilePage } from './components/profile';
import { FeedPage } from './components/feed';
import ProjectsPage from './components/projects/ProjectsPage';

// Shared components
import { Modal } from './components/contact';
import { UpcomingEvents } from './components/community';
import ErrorBoundary from './components/shared/ErrorBoundary';

// Context providers
import { AuthProvider } from './contexts/AuthContext';

/**
 * Main Site Component
 */
const MainSite = () => {
  // State management for modal and events
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);

  // Modal handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Events handlers
  const openEvents = () => setIsEventsOpen(true);
  const closeEvents = () => setIsEventsOpen(false);

  return (
    <div className="app-container">
      {/* Fixed Navigation Bar */}
      <Navigation />

      {/* Main Content Sections */}
      <Hero />
      <AboutSection />
      <ObjectivesSection />
      <VisionSection />
      <FutureSection />
      <CommunitySection />
      <EventsSection />
      <ContactSection onOpenModal={openModal} />
      <Footer />

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={closeModal} />
      <UpcomingEvents 
        isOpen={isEventsOpen} 
        onClose={closeEvents} 
        onGetInvolved={openModal}
      />
    </div>
  );
};

/**
 * Main App Component
 * 
 * The root component for the Sewing Circle website.
 * Manages routing between main site and admin panel.
 * Includes error boundary for graceful error handling.
 */
const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainSite />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;