/**
 * NeuroSchet™ Main Application Component
 * Sophisticated neurological assessment platform
 */

import React, { useState, useEffect } from 'react';
import './NeuroSchetApp.css';

// Import components
import WelcomePage from './components/NeuroSchet/WelcomePage';
import CaseSelector from './components/NeuroSchet/CaseSelector';
import InterviewInterface from './components/NeuroSchet/InterviewInterface';
import AnalyticsDashboard from './components/NeuroSchet/AnalyticsDashboard';
import Header from './components/NeuroSchet/Header';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:7860/api';

function NeuroSchetApp() {
  const [currentView, setCurrentView] = useState('welcome'); // welcome, selector, interview, analytics
  const [userId, setUserId] = useState('demo_user');
  const [selectedCase, setSelectedCase] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  // Load system status on mount
  useEffect(() => {
    fetchSystemStatus();
    fetchUserProfile();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/user_profile/${userId}`);
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleStartCase = () => {
    setCurrentView('selector');
  };

  const handleCaseSelected = (caseData) => {
    setSelectedCase(caseData);
    setCurrentView('interview');
  };

  const handleViewAnalytics = () => {
    fetchUserProfile(); // Refresh profile
    setCurrentView('analytics');
  };

  const handleBackToHome = () => {
    setCurrentView('welcome');
    setSelectedCase(null);
    setSessionId(null);
  };

  const handleInterviewComplete = (performance) => {
    // Record performance
    recordPerformance(performance);
    // Show analytics
    setCurrentView('analytics');
  };

  const recordPerformance = async (performance) => {
    try {
      await fetch(`${API_BASE}/record_performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          case_data: selectedCase,
          performance: performance
        })
      });
      // Refresh profile
      fetchUserProfile();
    } catch (error) {
      console.error('Error recording performance:', error);
    }
  };

  return (
    <div className="neuroschet-app">
      <Header 
        systemStatus={systemStatus}
        userProfile={userProfile}
        onViewAnalytics={handleViewAnalytics}
        onBackToHome={handleBackToHome}
        currentView={currentView}
      />

      <main className="neuroschet-main">
        {currentView === 'welcome' && (
          <WelcomePage 
            onStartCase={handleStartCase}
            systemStatus={systemStatus}
          />
        )}

        {currentView === 'selector' && (
          <CaseSelector 
            userId={userId}
            userProfile={userProfile}
            onCaseSelected={handleCaseSelected}
            onBack={handleBackToHome}
          />
        )}

        {currentView === 'interview' && selectedCase && (
          <InterviewInterface 
            caseData={selectedCase}
            userId={userId}
            onComplete={handleInterviewComplete}
            onBack={() => setCurrentView('selector')}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsDashboard 
            userId={userId}
            userProfile={userProfile}
            onStartNewCase={handleStartCase}
            onBack={handleBackToHome}
          />
        )}
      </main>

      <footer className="neuroschet-footer">
        <p>NeuroSchet™ - Mapping the Mind, Mastering Diagnosis</p>
        <p className="footer-meta">
          AI-Powered Neurological Assessment Platform | 
          {systemStatus && ` v${systemStatus.version}`}
        </p>
      </footer>
    </div>
  );
}

export default NeuroSchetApp;
