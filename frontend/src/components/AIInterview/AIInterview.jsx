/**
 * AI-Powered Interview Component
 * Uses real AI (Claude) for dynamic conversations
 */

import React, { useState, useEffect, useRef } from 'react';
import './AIInterview.css';

const AIInterview = ({ selectedPatient, selectedCondition, onBack, onComplete }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [findings, setFindings] = useState({ cranialNerves: [], tracts: [], level: null });
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);

  // Start interview on mount
  useEffect(() => {
    startInterview();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/start_interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          condition_name: selectedCondition.name
        })
      });

      const data = await response.json();
      setSessionId(data.session_id);
      setAudioAvailable(data.audio_available);
      setMessages([{ role: 'interviewer', content: data.message }]);
      
      // Auto-continue after initial message
      setTimeout(() => continueConversation(data.session_id), 2000);
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const continueConversation = async (sid = sessionId) => {
    if (!sid) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/conversation/${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: turnCount >= 5 ? 'complete' : 'next' })
      });

      const data = await response.json();
      
      if (data.action === 'report') {
        // Interview complete, show report
        onComplete(data.report, data.findings);
      } else {
        // Add new messages
        setMessages(prev => [
          ...prev,
          { role: 'patient', content: data.patient_message },
          { role: 'interviewer', content: data.interviewer_message }
        ]);
        
        // Update findings
        if (data.findings) {
          setFindings(data.findings);
        }
        
        setTurnCount(data.turn);
        
        // Generate audio for patient response if available
        if (audioAvailable) {
          generateAudio(data.patient_message, 'patient', sid);
        }
        
        // Continue conversation after delay
        if (data.turn < 5) {
          setTimeout(() => continueConversation(sid), 3000);
        } else {
          // Complete interview
          setTimeout(() => completeInterview(sid), 2000);
        }
      }
    } catch (error) {
      console.error('Error continuing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeInterview = async (sid = sessionId) => {
    if (!sid) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/conversation/${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' })
      });

      const data = await response.json();
      onComplete(data.report, data.findings);
    } catch (error) {
      console.error('Error completing interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAudio = async (text, role, sid = sessionId) => {
    try {
      const response = await fetch(`/api/generate_audio/${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, role })
      });

      const data = await response.json();
      if (data.audio) {
        playAudio(data.audio);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  const playAudio = (audioBase64) => {
    if (audioRef.current) {
      const audioBlob = base64ToBlob(audioBase64, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setPlayingAudio(true);
      audioRef.current.onended = () => setPlayingAudio(false);
    }
  };

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  return (
    <div className="ai-interview-container">
      <div className="ai-interview-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <h2>AI-Powered Clinical Interview</h2>
        <div className="interview-status">
          {isLoading && <span className="loading-indicator">●</span>}
          <span>Turn {turnCount}/5</span>
        </div>
      </div>

      <div className="ai-interview-content">
        <div className="chat-panel">
          <div className="chat-container" ref={chatContainerRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-header">
                  {msg.role === 'interviewer' ? '🩺 Clinical Assistant' : '👤 Patient'}
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message loading">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="findings-panel">
          <h3>Neurological Findings</h3>
          <div className="findings-list">
            {findings.cranialNerves.map((cn, idx) => (
              <div key={idx} className="finding-item cn">
                <span className="badge">{cn.cn}</span>
                <span>{cn.name} - {cn.side} side</span>
              </div>
            ))}
            {findings.tracts.map((tract, idx) => (
              <div key={idx} className="finding-item tract">
                <span className="badge">Tract</span>
                <span>{tract.name} - {tract.side} side ({tract.type})</span>
              </div>
            ))}
            {findings.level && (
              <div className="finding-item level">
                <span className="badge">Level</span>
                <span>Lesion at {findings.level.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default AIInterview;
