"""
Enhanced NeuroReady Application with AI Features
"""

from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import json
import os
import base64
from ai_conversation import get_ai_conversation
from tts_service import get_tts_service
from neuro_api import parse_neurological_findings, SYNDROMES, CRANIAL_NERVES

app = Flask(__name__, static_folder='frontend/build', static_url_path='')
CORS(app)

# Initialize AI services
ai_conv = get_ai_conversation()
tts_service = get_tts_service()

# Load patient and condition data
def load_patients_and_conditions():
    """Load patient and condition data from JSON"""
    try:
        with open('frontend/public/assets/patients_and_conditions.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading patients and conditions: {e}")
        return {"patients": [], "conditions": []}

# Store active conversations
conversations = {}

@app.route('/')
def serve_frontend():
    """Serve the React frontend"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get list of available patients"""
    data = load_patients_and_conditions()
    return jsonify(data['patients'])

@app.route('/api/conditions', methods=['GET'])
def get_conditions():
    """Get list of available conditions"""
    data = load_patients_and_conditions()
    return jsonify(data['conditions'])

@app.route('/api/start_interview', methods=['POST'])
def start_interview():
    """Start a new AI-powered interview"""
    data = request.json
    patient_id = data.get('patient_id')
    condition_name = data.get('condition_name')
    
    # Load patient and condition data
    all_data = load_patients_and_conditions()
    patient = next((p for p in all_data['patients'] if p['id'] == patient_id), None)
    condition = next((c for c in all_data['conditions'] if c['name'] == condition_name), None)
    
    if not patient or not condition:
        return jsonify({"error": "Patient or condition not found"}), 404
    
    # Create new conversation
    session_id = f"{patient_id}_{condition_name}_{len(conversations)}"
    conversations[session_id] = {
        "patient": patient,
        "condition": condition,
        "history": [],
        "findings": {"cranialNerves": [], "tracts": [], "level": None}
    }
    
    # Generate initial greeting from interviewer
    initial_message = f"Hello, I'm the clinical assistant. I understand you're {patient['name']}, a {patient['age']}-year-old {patient['gender']}. Can you tell me what brought you in today?"
    
    conversations[session_id]['history'].append({
        "role": "interviewer",
        "content": initial_message
    })
    
    return jsonify({
        "session_id": session_id,
        "message": initial_message,
        "audio_available": tts_service.is_available()
    })

@app.route('/api/conversation/<session_id>', methods=['POST'])
def continue_conversation(session_id):
    """Continue an existing conversation"""
    if session_id not in conversations:
        return jsonify({"error": "Session not found"}), 404
    
    data = request.json
    action = data.get('action', 'next')  # 'next' or 'complete'
    
    conv = conversations[session_id]
    patient = conv['patient']
    condition = conv['condition']
    history = conv['history']
    
    if action == 'complete':
        # Generate final report
        report = ai_conv.generate_report(history, patient, condition, conv['findings'])
        return jsonify({
            "action": "report",
            "report": report,
            "findings": conv['findings']
        })
    
    # Generate patient response
    patient_response = ai_conv.generate_patient_response(history, patient, condition)
    history.append({"role": "patient", "content": patient_response})
    
    # Parse for neurological findings if it's a neurological condition
    if condition.get('level'):  # Neurological condition
        findings = parse_neurological_findings(patient_response)
        if findings['cranialNerves']:
            conv['findings']['cranialNerves'].extend(findings['cranialNerves'])
        if findings['tracts']:
            conv['findings']['tracts'].extend(findings['tracts'])
        if findings['level']:
            conv['findings']['level'] = findings['level']
    
    # Generate interviewer's next question
    interviewer_response = ai_conv.generate_interviewer_response(history, patient, condition)
    history.append({"role": "interviewer", "content": interviewer_response})
    
    return jsonify({
        "action": "continue",
        "patient_message": patient_response,
        "interviewer_message": interviewer_response,
        "findings": conv['findings'],
        "turn": len(history) // 2
    })

@app.route('/api/generate_audio/<session_id>', methods=['POST'])
def generate_audio(session_id):
    """Generate audio for a message"""
    if session_id not in conversations:
        return jsonify({"error": "Session not found"}), 404
    
    data = request.json
    text = data.get('text')
    role = data.get('role', 'patient')
    
    if role == 'patient':
        patient = conversations[session_id]['patient']
        audio_bytes = tts_service.generate_speech(text, patient)
        
        if audio_bytes:
            # Return audio as base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            return jsonify({
                "audio": audio_base64,
                "format": "mp3"
            })
    
    return jsonify({"error": "Audio generation not available"}), 503

@app.route('/api/evaluate_report/<session_id>', methods=['POST'])
def evaluate_report(session_id):
    """Evaluate the generated report"""
    if session_id not in conversations:
        return jsonify({"error": "Session not found"}), 404
    
    data = request.json
    report_text = data.get('report')
    
    conv = conversations[session_id]
    evaluation = ai_conv.evaluate_report(report_text, conv['patient'], conv['condition'])
    
    return jsonify({"evaluation": evaluation})

# Neurological API endpoints
@app.route('/api/neuro/parse_findings', methods=['POST'])
def neuro_parse_findings():
    """Parse neurological findings from text"""
    data = request.json
    text = data.get('text', '')
    findings = parse_neurological_findings(text)
    return jsonify(findings)

@app.route('/api/neuro/syndromes', methods=['GET'])
def neuro_syndromes():
    """Get neurological syndromes reference"""
    return jsonify({"syndromes": SYNDROMES})

@app.route('/api/neuro/cranial_nerves', methods=['GET'])
def neuro_cranial_nerves():
    """Get cranial nerves reference"""
    return jsonify({"cranialNerves": CRANIAL_NERVES})

@app.route('/api/demo_info', methods=['GET'])
def demo_info():
    """Get demo information"""
    return jsonify({
        "mode": "AI-Powered",
        "ai_available": True,
        "tts_available": tts_service.is_available(),
        "features": [
            "Real AI conversations using Claude",
            "Text-to-speech with ElevenLabs",
            "Neurological localization",
            "Report generation and evaluation",
            "FHIR data integration"
        ]
    })

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from frontend build"""
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    print(f"Starting NeuroReady AI-Powered Server on port {port}...")
    print(f"AI Conversations: Enabled (Claude)")
    print(f"Text-to-Speech: {'Enabled (ElevenLabs)' if tts_service.is_available() else 'Disabled'}")
    app.run(host='0.0.0.0', port=port, debug=False)
