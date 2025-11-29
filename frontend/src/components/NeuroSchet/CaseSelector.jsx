/**
 * NeuroSchet™ Case Selector Component
 * Connects to dynamic case generation and curated case APIs
 */

import React, { useState, useEffect } from 'react';
import './CaseSelector.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:7860/api';

function CaseSelector({ userId, userProfile, onCaseSelected, onBack }) {
  const [caseMode, setCaseMode] = useState('dynamic'); // 'dynamic', 'curated', 'recommended'
  const [difficulty, setDifficulty] = useState(null);
  const [syndrome, setSyndrome] = useState(null);
  const [loading, setLoading] = useState(false);
  const [curatedCases, setCuratedCases] = useState([]);
  const [recommendedParams, setRecommendedParams] = useState(null);

  const syndromes = [
    'Weber Syndrome',
    'Wallenberg Syndrome',
    'Millard-Gubler Syndrome',
    'Lateral Pontine Syndrome',
    'Medial Medullary Syndrome'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

  useEffect(() => {
    fetchRecommendedParams();
    fetchCuratedCases();
  }, []);

  const fetchRecommendedParams = async () => {
    try {
      const response = await fetch(`${API_BASE}/next_case_params/${userId}`);
      const data = await response.json();
      setRecommendedParams(data);
      // Set defaults from recommendations
      if (!difficulty) setDifficulty(data.difficulty);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchCuratedCases = async () => {
    try {
      const response = await fetch(`${API_BASE}/case_library`);
      const data = await response.json();
      setCuratedCases(data.curated_cases || []);
    } catch (error) {
      console.error('Error fetching curated cases:', error);
    }
  };

  const handleGenerateDynamicCase = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate_patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          syndrome: syndrome,
          difficulty: difficulty
        })
      });
      
      const data = await response.json();
      
      if (data.patient) {
        onCaseSelected({
          ...data.patient,
          type: 'dynamic',
          fhir: data.fhir
        });
      } else {
        alert('Failed to generate case. Please try again.');
      }
    } catch (error) {
      console.error('Error generating case:', error);
      alert('Error generating case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCuratedCase = async (caseKey) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/get_curated_case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_key: caseKey })
      });
      
      const data = await response.json();
      
      if (data.case) {
        onCaseSelected({
          ...data.case,
          type: 'curated',
          case_key: caseKey
        });
      }
    } catch (error) {
      console.error('Error loading curated case:', error);
      alert('Error loading case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseRecommended = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate_patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          syndrome: recommendedParams.recommended_syndrome,
          difficulty: recommendedParams.difficulty
        })
      });
      
      const data = await response.json();
      
      if (data.patient) {
        onCaseSelected({
          ...data.patient,
          type: 'recommended',
          fhir: data.fhir
        });
      }
    } catch (error) {
      console.error('Error generating recommended case:', error);
      alert('Error generating case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="case-selector fade-in">
      <div className="selector-header">
        <button className="btn btn-outline" onClick={onBack}>
          ← Back
        </button>
        <h2 className="selector-title">Select Your Case</h2>
        <div></div>
      </div>

      {/* Recommended Case */}
      {recommendedParams && (
        <div className="recommended-section card">
          <div className="card-header">
            <div>
              <h3 className="card-title">🎯 Recommended for You</h3>
              <p className="card-subtitle">
                Based on your performance and learning goals
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleUseRecommended}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Start Recommended Case'}
            </button>
          </div>
          <div className="recommendation-details">
            <div className="rec-item">
              <strong>Difficulty:</strong> 
              <span className={`badge badge-${recommendedParams.difficulty}`}>
                {recommendedParams.difficulty}
              </span>
            </div>
            {recommendedParams.recommended_syndrome && (
              <div className="rec-item">
                <strong>Focus:</strong> {recommendedParams.recommended_syndrome}
              </div>
            )}
            {recommendedParams.focus_areas && recommendedParams.focus_areas.length > 0 && (
              <div className="rec-item">
                <strong>Improve:</strong> 
                {recommendedParams.focus_areas.map(area => (
                  <span key={area} className="focus-tag">
                    {area.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode Selection */}
      <div className="mode-selector">
        <button 
          className={`mode-btn ${caseMode === 'dynamic' ? 'active' : ''}`}
          onClick={() => setCaseMode('dynamic')}
        >
          <span className="mode-icon">⚡</span>
          <div>
            <div className="mode-title">Dynamic AI Generation</div>
            <div className="mode-desc">Infinite unique cases</div>
          </div>
        </button>

        <button 
          className={`mode-btn ${caseMode === 'curated' ? 'active' : ''}`}
          onClick={() => setCaseMode('curated')}
        >
          <span className="mode-icon">📚</span>
          <div>
            <div className="mode-title">Curated Literature</div>
            <div className="mode-desc">Classic cases from textbooks</div>
          </div>
        </button>
      </div>

      {/* Dynamic Case Options */}
      {caseMode === 'dynamic' && (
        <div className="dynamic-options card">
          <h3 className="card-title">Configure Your Case</h3>
          
          <div className="option-group">
            <label className="option-label">Difficulty Level</label>
            <div className="difficulty-buttons">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  className={`difficulty-btn ${difficulty === diff ? 'active' : ''}`}
                  onClick={() => setDifficulty(diff)}
                >
                  {diff}
                  {userProfile && userProfile.current_level === diff && (
                    <span className="current-badge">Current</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">
              Syndrome (Optional - leave blank for random)
            </label>
            <select 
              className="syndrome-select"
              value={syndrome || ''}
              onChange={(e) => setSyndrome(e.target.value || null)}
            >
              <option value="">Random Selection</option>
              {syndromes.map(syn => (
                <option key={syn} value={syn}>{syn}</option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-primary btn-block"
            onClick={handleGenerateDynamicCase}
            disabled={loading || !difficulty}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Generating Case...
              </>
            ) : (
              '⚡ Generate New Case'
            )}
          </button>
        </div>
      )}

      {/* Curated Cases */}
      {caseMode === 'curated' && (
        <div className="curated-cases">
          <h3 className="section-title">Classic Cases from Medical Literature</h3>
          <div className="curated-grid">
            {curatedCases.map(caseKey => (
              <div key={caseKey} className="curated-card card">
                <h4 className="curated-title">
                  {caseKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <p className="curated-desc">
                  Classic presentation from medical literature
                </p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleSelectCuratedCase(caseKey)}
                  disabled={loading}
                >
                  Select Case
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseSelector;
