/**
 * NeuroSchet™ Welcome Page
 */

import React from 'react';
import './WelcomePage.css';

function WelcomePage({ onStartCase, systemStatus }) {
  return (
    <div className="welcome-page fade-in">
      <div className="hero-section">
        <img 
          src="/neuroschet-hero.png" 
          alt="NeuroSchet Platform" 
          className="hero-image"
        />
        <div className="hero-overlay">
          <h1 className="hero-title">
            Welcome to NeuroSchet<sup>™</sup>
          </h1>
          <p className="hero-subtitle">
            AI-Powered Neurological Assessment Platform
          </p>
          <p className="hero-description">
            Master neurological diagnosis through dynamic AI-generated cases,
            adaptive learning, and real-time clinical reasoning.
          </p>
          <button className="btn btn-primary btn-lg" onClick={onStartCase}>
            Start New Case
          </button>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3 className="feature-title">Dynamic Case Generation</h3>
          <p className="feature-description">
            AI creates infinite unique patient cases with realistic presentations.
            Never see the same case twice.
          </p>
          {systemStatus?.features.dynamic_case_generation && (
            <span className="badge badge-success">Active</span>
          )}
        </div>

        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3 className="feature-title">Medical Literature</h3>
          <p className="feature-description">
            Curated cases from textbooks and journals with references and
            teaching points.
          </p>
          {systemStatus?.features.curated_cases && (
            <span className="badge badge-success">Active</span>
          )}
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3 className="feature-title">Adaptive Learning</h3>
          <p className="feature-description">
            Automatically adjusts difficulty based on your performance across
            5 skill domains.
          </p>
          {systemStatus?.features.adaptive_learning && (
            <span className="badge badge-success">Active</span>
          )}
        </div>

        <div className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3 className="feature-title">Real-Time Localization</h3>
          <p className="feature-description">
            Instant neurological localization with cranial nerve and tract
            identification.
          </p>
          {systemStatus?.features.neurological_localization && (
            <span className="badge badge-success">Active</span>
          )}
        </div>

        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3 className="feature-title">AI Conversations</h3>
          <p className="feature-description">
            Realistic patient interviews powered by Claude AI for authentic
            clinical practice.
          </p>
          {systemStatus?.features.ai_conversations && (
            <span className="badge badge-success">Active</span>
          )}
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Performance Analytics</h3>
          <p className="feature-description">
            Track your progress with detailed analytics, learning curves, and
            personalized recommendations.
          </p>
          {systemStatus?.features.adaptive_learning && (
            <span className="badge badge-success">Active</span>
          )}
        </div>
      </div>

      <div className="cta-section">
        <h2 className="cta-title">Ready to Master Neurological Diagnosis?</h2>
        <p className="cta-description">
          Join medical students, residents, and physicians using NeuroSchet™
          to enhance their clinical reasoning skills.
        </p>
        <button className="btn btn-secondary btn-lg" onClick={onStartCase}>
          Begin Your First Case
        </button>
      </div>

      {systemStatus && (
        <div className="system-info">
          <p>
            <strong>System Status:</strong> All features operational | 
            Version {systemStatus.version} | 
            Active Sessions: {systemStatus.active_sessions}
          </p>
        </div>
      )}
    </div>
  );
}

export default WelcomePage;
