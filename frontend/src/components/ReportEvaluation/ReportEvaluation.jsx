/**
 * Report Evaluation Component
 * Shows AI-generated evaluation of the clinical report
 */

import React, { useState, useEffect } from 'react';
import './ReportEvaluation.css';

const ReportEvaluation = ({ sessionId, report, onClose }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId && report) {
      evaluateReport();
    }
  }, [sessionId, report]);

  const evaluateReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/evaluate_report/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report })
      });

      const data = await response.json();
      setEvaluation(data.evaluation);
    } catch (error) {
      console.error('Error evaluating report:', error);
      setEvaluation('Unable to generate evaluation at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="evaluation-overlay">
      <div className="evaluation-modal">
        <div className="evaluation-header">
          <h2>📊 Report Evaluation</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="evaluation-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>AI is evaluating the report...</p>
            </div>
          ) : (
            <div className="evaluation-text">
              {evaluation}
            </div>
          )}
        </div>

        <div className="evaluation-footer">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReportEvaluation;
