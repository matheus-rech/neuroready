/**
 * NeuroSchet™ Header Component
 */

import React from 'react';
import './Header.css';

function Header({ systemStatus, userProfile, onViewAnalytics, onBackToHome, currentView }) {
  return (
    <header className="neuroschet-header">
      <div className="header-content">
        <div className="header-left" onClick={onBackToHome} style={{ cursor: 'pointer' }}>
          <img 
            src="/neuroschet-logo.png" 
            alt="NeuroSchet" 
            className="header-logo"
          />
          <div className="header-branding">
            <h1 className="header-title">NeuroSchet<sup>™</sup></h1>
            <p className="header-tagline">Mapping the Mind, Mastering Diagnosis</p>
          </div>
        </div>

        <nav className="header-nav">
          {currentView !== 'welcome' && (
            <button className="nav-btn" onClick={onBackToHome}>
              <span>🏠</span> Home
            </button>
          )}
          
          {currentView !== 'analytics' && userProfile && (
            <button className="nav-btn" onClick={onViewAnalytics}>
              <span>📊</span> Analytics
            </button>
          )}

          {userProfile && (
            <div className="user-info">
              <div className="user-level">
                <span className={`level-badge level-${userProfile.current_level}`}>
                  {userProfile.current_level.toUpperCase()}
                </span>
              </div>
              <div className="user-stats">
                <span className="stat">
                  {userProfile.cases_completed} cases
                </span>
                <span className="stat">
                  {Math.round(userProfile.total_accuracy * 100)}% accuracy
                </span>
              </div>
            </div>
          )}
        </nav>

        {systemStatus && (
          <div className="system-status">
            {systemStatus.features.dynamic_case_generation && (
              <span className="status-badge" title="Dynamic AI Case Generation">
                ⚡ AI
              </span>
            )}
            {systemStatus.features.ai_conversations && (
              <span className="status-badge" title="AI Conversations Active">
                💬 Claude
              </span>
            )}
            {systemStatus.features.text_to_speech && (
              <span className="status-badge" title="Text-to-Speech Active">
                🔊 TTS
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
