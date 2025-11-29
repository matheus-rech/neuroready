/**
 * NeuroSchet™ Interview Interface
 * AI-powered conversation with real-time neurological localization
 */

import React, { useState, useEffect, useRef } from 'react';
import './InterviewInterface.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:7860/api';

function InterviewInterface({ caseData, userId, onComplete, onBack }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [findings, setFindings] = useState(null);
  const [report, setReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/start_interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: caseData,
          user_id: userId
        })
      });

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([data.message]);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const userMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/conversation/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });

      const data = await response.json();
      setMessages(prev => [...prev, data.response]);
      
      // Update findings if available
      if (data.findings) {
        setFindings(data.findings);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Error communicating with server. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate_report/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setReport(data.report);
      setShowReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const evaluateReport = async () => {
    if (!report) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/evaluate_report/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report })
      });

      const data = await response.json();
      setEvaluation(data.evaluation);
    } catch (error) {
      console.error('Error evaluating report:', error);
      alert('Failed to evaluate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    // Calculate performance metrics
    const performance = {
      correct_diagnosis: findings?.syndrome?.name === caseData.syndrome,
      time_seconds: Math.floor((Date.now() - sessionId.split('_').pop()) / 1000),
      localization_correct: findings?.level !== null,
      cranial_nerve_accuracy: findings?.cranialNerves?.length > 0 ? 0.8 : 0.5,
      motor_exam_accuracy: findings?.tracts?.length > 0 ? 0.8 : 0.5
    };

    onComplete(performance);
  };

  return (
    <div className="interview-interface fade-in">
      <div className="interview-header">
        <button className="btn btn-outline" onClick={onBack}>
          ← Back
        </button>
        <div className="case-info">
          <h2 className="case-title">
            {caseData.name || 'Patient Case'}, {caseData.age} years
          </h2>
          <p className="case-meta">
            {caseData.type === 'dynamic' && <span className="badge badge-primary">AI Generated</span>}
            {caseData.type === 'curated' && <span className="badge badge-info">Literature Case</span>}
            {caseData.difficulty && (
              <span className={`badge badge-${caseData.difficulty}`}>
                {caseData.difficulty}
              </span>
            )}
          </p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={generateReport}
          disabled={loading || messages.length < 5}
        >
          Generate Report
        </button>
      </div>

      <div className="interview-container">
        {/* Chat Panel */}
        <div className="chat-panel">
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👨‍⚕️' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-role">
                    {msg.role === 'user' ? 'Clinician' : 'Patient'}
                  </div>
                  <div className="message-text">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message message-loading">
                <div className="loading-spinner"></div>
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <textarea
              className="message-input"
              placeholder="Ask your next question..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              rows="3"
            />
            <button 
              className="btn btn-primary send-btn"
              onClick={sendMessage}
              disabled={loading || !userInput.trim()}
            >
              Send
            </button>
          </div>
        </div>

        {/* Localization Panel */}
        <div className="localization-panel">
          <h3 className="panel-title">Real-Time Localization</h3>
          
          {findings ? (
            <>
              {/* Cranial Nerves */}
              {findings.cranialNerves && findings.cranialNerves.length > 0 && (
                <div className="findings-section">
                  <h4 className="findings-title">Cranial Nerves</h4>
                  <div className="findings-list">
                    {findings.cranialNerves.map((cn, idx) => (
                      <div key={idx} className="finding-badge cn-badge">
                        <strong>{cn.cn}</strong> {cn.name}
                        <br />
                        <small>{cn.side} side</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracts */}
              {findings.tracts && findings.tracts.length > 0 && (
                <div className="findings-section">
                  <h4 className="findings-title">Tracts</h4>
                  <div className="findings-list">
                    {findings.tracts.map((tract, idx) => (
                      <div key={idx} className="finding-badge tract-badge">
                        <strong>{tract.name}</strong>
                        <br />
                        <small>{tract.side} side - {tract.type}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesion Level */}
              {findings.level && (
                <div className="findings-section">
                  <h4 className="findings-title">Lesion Level</h4>
                  <div className="level-badge">
                    {findings.level.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Syndrome Match */}
              {findings.syndrome && (
                <div className="findings-section syndrome-section">
                  <h4 className="findings-title">Syndrome Match</h4>
                  <div className="syndrome-card">
                    <h5 className="syndrome-name">{findings.syndrome.name}</h5>
                    <p className="syndrome-desc">{findings.syndrome.description}</p>
                    <div className="syndrome-confidence">
                      Confidence: {findings.syndrome.confidence}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-findings">
              <img 
                src="/brainstem-visual.png" 
                alt="Brainstem Anatomy" 
                className="brainstem-image"
              />
              <p>Findings will appear here as you conduct the interview</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Clinical Assessment Report</h3>
              <button className="close-btn" onClick={() => setShowReport(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <pre className="report-text">{report}</pre>
              
              {evaluation && (
                <div className="evaluation-section">
                  <h4>AI Evaluation</h4>
                  <pre className="evaluation-text">{evaluation}</pre>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {!evaluation && (
                <button 
                  className="btn btn-secondary"
                  onClick={evaluateReport}
                  disabled={loading}
                >
                  {loading ? 'Evaluating...' : 'Evaluate Report'}
                </button>
              )}
              <button className="btn btn-primary" onClick={handleComplete}>
                Complete Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewInterface;
