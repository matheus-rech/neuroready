import React, { useState, useEffect } from 'react';
import { Brain, Activity, AlertCircle, FileText } from 'lucide-react';
import NeuroSketch from './NeuroSketch';

/**
 * NeuroInterview Component
 * Integrates the neurological interview with real-time NeuroSketch localization
 */
const NeuroInterview = ({ patient, condition }) => {
  const [messages, setMessages] = useState([]);
  const [currentFindings, setCurrentFindings] = useState('');
  const [showNeuroSketch, setShowNeuroSketch] = useState(true);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [report, setReport] = useState('');

  // Stream interview conversation
  useEffect(() => {
    if (!patient || !condition) return;

    const eventSource = new EventSource(
      `/api/stream_conversation?patient=${encodeURIComponent(patient)}&condition=${encodeURIComponent(condition)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          setMessages(prev => [...prev, data]);
          
          // Extract findings from patient responses
          if (data.role === 'patient') {
            extractFindings([...messages, data]);
          }
        } else if (data.type === 'report') {
          setReport(data.content);
          setInterviewComplete(true);
        } else if (data.type === 'complete') {
          setInterviewComplete(true);
          eventSource.close();
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [patient, condition]);

  // Extract neurological findings from interview messages
  const extractFindings = async (msgs) => {
    try {
      const response = await fetch('/api/neuro/extract_interview_findings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: msgs }),
      });

      const data = await response.json();
      
      // Convert structured findings back to text for NeuroSketch
      const findingsText = formatFindingsAsText(data);
      setCurrentFindings(findingsText);
    } catch (error) {
      console.error('Error extracting findings:', error);
    }
  };

  // Format structured findings as text for NeuroSketch input
  const formatFindingsAsText = (findings) => {
    const parts = [];

    // Add cranial nerve findings
    findings.cranialNerves?.forEach(cn => {
      parts.push(`${cn.side} ${cn.name.toLowerCase()} nerve (${cn.cn})`);
    });

    // Add tract findings
    findings.tracts?.forEach(tract => {
      parts.push(`${tract.side} ${tract.name.toLowerCase()}`);
    });

    // Add additional findings
    findings.additional?.forEach(finding => {
      parts.push(`${finding.side} ${finding.name.toLowerCase()}`);
    });

    return parts.join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NeuroReady</h1>
                <p className="text-sm text-gray-600">Neurological Pre-Visit Assessment</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">Patient: {patient}</div>
              <div className="text-xs text-gray-500">Condition: {condition}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interview Panel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Clinical Interview</h2>
              </div>
            </div>

            <div className="p-6 h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Starting neurological assessment...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        msg.role === 'interviewer'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'interviewer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          {msg.role === 'interviewer' ? 'AI' : 'P'}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-500 mb-1 uppercase">
                            {msg.role === 'interviewer' ? 'Clinical Assistant' : 'Patient'}
                          </div>
                          <div className="text-sm text-gray-800">{msg.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {interviewComplete && (
              <div className="p-4 bg-green-50 border-t border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">Interview Complete</span>
                </div>
              </div>
            )}
          </div>

          {/* NeuroSketch Panel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Real-Time Localization</h2>
                </div>
                <button
                  onClick={() => setShowNeuroSketch(!showNeuroSketch)}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                >
                  {showNeuroSketch ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {showNeuroSketch && (
              <div className="p-4 h-[600px] overflow-y-auto">
                {currentFindings ? (
                  <NeuroSketch initialInput={currentFindings} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-sm">Waiting for neurological findings...</p>
                      <p className="text-xs mt-2">
                        Localization will appear as symptoms are reported
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Report Section */}
        {interviewComplete && report && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
              <div className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Neurological Assessment Report</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {report}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuroInterview;
