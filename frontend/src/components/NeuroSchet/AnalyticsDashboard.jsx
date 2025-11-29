/**
 * NeuroSchet™ Analytics Dashboard
 * Performance tracking and learning analytics
 */

import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:7860/api';

function AnalyticsDashboard({ userId, userProfile, onStartNewCase, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/analytics/${userId}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="error-message">
          <h3>Unable to load analytics</h3>
          <button className="btn btn-primary" onClick={fetchAnalytics}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, skill_breakdown, syndrome_performance, strengths, weaknesses, recommendations } = analytics;

  return (
    <div className="analytics-dashboard fade-in">
      <div className="dashboard-header">
        <button className="btn btn-outline" onClick={onBack}>
          ← Back
        </button>
        <h2 className="dashboard-title">Performance Analytics</h2>
        <button className="btn btn-primary" onClick={onStartNewCase}>
          Start New Case
        </button>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Current Level</div>
            <div className={`stat-value level-${overview.level}`}>
              {overview.level.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Cases Completed</div>
            <div className="stat-value">{overview.cases_completed}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Overall Accuracy</div>
            <div className="stat-value">{overview.overall_accuracy}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Avg Time</div>
            <div className="stat-value">{overview.average_time_minutes} min</div>
          </div>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="card skills-card">
        <h3 className="card-title">Skill Breakdown</h3>
        <div className="skills-grid">
          {Object.entries(skill_breakdown).map(([skill, score]) => (
            <div key={skill} className="skill-item">
              <div className="skill-header">
                <span className="skill-name">
                  {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="skill-score">{score}%</span>
              </div>
              <div className="skill-bar">
                <div 
                  className="skill-progress"
                  style={{ 
                    width: `${score}%`,
                    background: getSkillColor(score)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Syndrome Performance */}
      {Object.keys(syndrome_performance).length > 0 && (
        <div className="card syndrome-card">
          <h3 className="card-title">Syndrome Performance</h3>
          <div className="syndrome-grid">
            {Object.entries(syndrome_performance).map(([syndrome, stats]) => (
              <div key={syndrome} className="syndrome-item">
                <h4 className="syndrome-item-title">{syndrome}</h4>
                <div className="syndrome-stats">
                  <div className="syndrome-stat">
                    <span className="stat-label">Attempts</span>
                    <span className="stat-number">{stats.attempts}</span>
                  </div>
                  <div className="syndrome-stat">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-number accuracy">{stats.accuracy}%</span>
                  </div>
                </div>
                <div className="syndrome-bar">
                  <div 
                    className="syndrome-progress"
                    style={{ 
                      width: `${stats.accuracy}%`,
                      background: getSkillColor(stats.accuracy)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths and Weaknesses */}
      <div className="insights-grid">
        {strengths.length > 0 && (
          <div className="card insights-card strengths-card">
            <h3 className="card-title">💪 Strengths</h3>
            <ul className="insights-list">
              {strengths.map((strength, idx) => (
                <li key={idx} className="insight-item strength-item">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses.length > 0 && (
          <div className="card insights-card weaknesses-card">
            <h3 className="card-title">📈 Areas for Improvement</h3>
            <ul className="insights-list">
              {weaknesses.map((weakness, idx) => (
                <li key={idx} className="insight-item weakness-item">
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card recommendations-card">
          <h3 className="card-title">🎓 Personalized Recommendations</h3>
          <div className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="recommendation-item">
                <span className="rec-icon">💡</span>
                <span className="rec-text">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="cta-card">
        <h3 className="cta-title">Ready to Continue Learning?</h3>
        <p className="cta-description">
          Practice makes perfect. Start a new case to improve your skills!
        </p>
        <button className="btn btn-primary btn-lg" onClick={onStartNewCase}>
          Start New Case
        </button>
      </div>
    </div>
  );
}

function getSkillColor(score) {
  if (score >= 80) return 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
  if (score >= 60) return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
  if (score >= 40) return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
  return 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)';
}

export default AnalyticsDashboard;
