"""
NeuroSchet™ - AI-Powered Neurological Assessment Platform
Main application with dynamic case generation and adaptive learning
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime

# Import NeuroSchet modules
from case_generator import get_case_generator
from case_database import get_case_database
from adaptive_engine import get_adaptive_engine
from ai_conversation import get_ai_conversation
from tts_service import get_tts_service
from neuro_api import parse_neurological_findings, SYNDROMES, CRANIAL_NERVES

app = Flask(__name__, static_folder='frontend/build', static_url_path='')
CORS(app)

# Initialize services
case_generator = get_case_generator()
case_database = get_case_database()
adaptive_engine = get_adaptive_engine()
ai_conversation = get_ai_conversation()
tts_service = get_tts_service()

# Store active sessions
active_sessions = {}

@app.route('/')
def serve_frontend():
    """Serve the React frontend"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory(app.static_folder, path)

# ============================================================================
# DYNAMIC CASE GENERATION ENDPOINTS
# ============================================================================

@app.route('/api/generate_patient', methods=['POST'])
def generate_patient():
    """Generate a new dynamic patient case"""
    data = request.get_json()
    
    user_id = data.get('user_id', 'anonymous')
    syndrome = data.get('syndrome')  # Optional: specific syndrome
    difficulty = data.get('difficulty')  # Optional: specific difficulty
    
    # Get adaptive recommendations if no preferences specified
    if not difficulty:
        params = adaptive_engine.get_next_case_parameters(user_id)
        difficulty = params['difficulty']
        if not syndrome and params['recommended_syndrome']:
            syndrome = params['recommended_syndrome']
    
    # Generate patient
    patient = case_generator.generate_dynamic_patient(syndrome, difficulty)
    
    if not patient:
        return jsonify({"error": "Failed to generate patient"}), 500
    
    # Generate FHIR record
    fhir_record = case_generator.generate_fhir_record(patient)
    
    return jsonify({
        "patient": patient,
        "fhir": fhir_record,
        "difficulty": difficulty,
        "generated": True
    })

@app.route('/api/get_curated_case', methods=['POST'])
def get_curated_case():
    """Get a curated case from medical literature"""
    data = request.get_json()
    
    case_key = data.get('case_key')  # Optional: specific case
    
    if case_key:
        case = case_database.get_curated_case(case_key)
    else:
        case = case_database.get_random_curated_case()
    
    if not case:
        return jsonify({"error": "Case not found"}), 404
    
    return jsonify({
        "case": case,
        "source": "curated_literature"
    })

@app.route('/api/synthesize_case', methods=['POST'])
def synthesize_case():
    """Synthesize a new case from medical literature"""
    data = request.get_json()
    
    syndrome = data.get('syndrome', 'Weber Syndrome')
    difficulty = data.get('difficulty', 'intermediate')
    
    case = case_database.synthesize_case_from_literature(syndrome, difficulty)
    
    if not case:
        return jsonify({"error": "Failed to synthesize case"}), 500
    
    return jsonify({
        "case": case,
        "source": "literature_synthesis"
    })

# ============================================================================
# ADAPTIVE LEARNING ENDPOINTS
# ============================================================================

@app.route('/api/user_profile/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get user learning profile"""
    profile = adaptive_engine.get_user_profile(user_id)
    return jsonify(profile)

@app.route('/api/record_performance', methods=['POST'])
def record_performance():
    """Record user performance on a case"""
    data = request.get_json()
    
    user_id = data.get('user_id', 'anonymous')
    case_data = data.get('case_data', {})
    performance_data = data.get('performance', {})
    
    updated_profile = adaptive_engine.record_case_performance(
        user_id, case_data, performance_data
    )
    
    return jsonify({
        "profile": updated_profile,
        "message": "Performance recorded successfully"
    })

@app.route('/api/analytics/<user_id>', methods=['GET'])
def get_analytics(user_id):
    """Get performance analytics for user"""
    analytics = adaptive_engine.get_performance_analytics(user_id)
    return jsonify(analytics)

@app.route('/api/next_case_params/<user_id>', methods=['GET'])
def get_next_case_params(user_id):
    """Get recommended parameters for next case"""
    params = adaptive_engine.get_next_case_parameters(user_id)
    return jsonify(params)

# ============================================================================
# AI CONVERSATION ENDPOINTS
# ============================================================================

@app.route('/api/start_interview', methods=['POST'])
def start_interview():
    """Start a new AI-powered interview"""
    data = request.get_json()
    
    patient_data = data.get('patient', {})
    user_id = data.get('user_id', 'anonymous')
    
    # Create session
    session_id = f"{user_id}_{patient_data.get('id', 'unknown')}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Initialize conversation
    initial_message = ai_conversation.start_conversation(patient_data, session_id)
    
    # Store session
    active_sessions[session_id] = {
        "patient": patient_data,
        "user_id": user_id,
        "started_at": datetime.now().isoformat(),
        "messages": [initial_message]
    }
    
    return jsonify({
        "session_id": session_id,
        "message": initial_message,
        "audio_available": tts_service is not None
    })

@app.route('/api/conversation/<session_id>', methods=['POST'])
def continue_conversation(session_id):
    """Continue an AI conversation"""
    data = request.get_json()
    user_input = data.get('message', '')
    
    if session_id not in active_sessions:
        return jsonify({"error": "Session not found"}), 404
    
    session = active_sessions[session_id]
    
    # Get AI response
    response = ai_conversation.continue_conversation(
        session_id,
        user_input,
        session['patient']
    )
    
    # Store messages
    session['messages'].append({"role": "user", "content": user_input})
    session['messages'].append(response)
    
    # Extract neurological findings in real-time
    findings = parse_neurological_findings(' '.join([
        msg.get('content', '') for msg in session['messages']
        if isinstance(msg.get('content'), str)
    ]))
    
    return jsonify({
        "response": response,
        "findings": findings,
        "audio_available": tts_service is not None
    })

@app.route('/api/generate_audio/<session_id>', methods=['POST'])
def generate_audio(session_id):
    """Generate TTS audio for patient response"""
    if not tts_service:
        return jsonify({"error": "TTS not available"}), 503
    
    data = request.get_json()
    text = data.get('text', '')
    
    if session_id not in active_sessions:
        return jsonify({"error": "Session not found"}), 404
    
    session = active_sessions[session_id]
    patient = session['patient']
    
    # Generate audio
    audio_base64 = tts_service.generate_speech(
        text,
        patient.get('age', 50),
        patient.get('gender', 'Male')
    )
    
    return jsonify({
        "audio": audio_base64,
        "format": "mp3"
    })

@app.route('/api/generate_report/<session_id>', methods=['POST'])
def generate_report(session_id):
    """Generate clinical report from interview"""
    if session_id not in active_sessions:
        return jsonify({"error": "Session not found"}), 404
    
    session = active_sessions[session_id]
    
    # Generate report using AI
    report = ai_conversation.generate_report(
        session['messages'],
        session['patient']
    )
    
    return jsonify({
        "report": report,
        "session_id": session_id
    })

@app.route('/api/evaluate_report/<session_id>', methods=['POST'])
def evaluate_report(session_id):
    """Evaluate the generated report"""
    if session_id not in active_sessions:
        return jsonify({"error": "Session not found"}), 404
    
    data = request.get_json()
    report = data.get('report', '')
    
    session = active_sessions[session_id]
    
    # Evaluate using AI
    evaluation = ai_conversation.evaluate_report(
        report,
        session['patient']
    )
    
    return jsonify({
        "evaluation": evaluation,
        "session_id": session_id
    })

# ============================================================================
# NEUROLOGICAL LOCALIZATION ENDPOINTS
# ============================================================================

@app.route('/api/neuro/parse_findings', methods=['POST'])
def parse_findings():
    """Parse neurological findings from text"""
    data = request.get_json()
    text = data.get('text', '')
    
    findings = parse_neurological_findings(text)
    return jsonify(findings)

@app.route('/api/neuro/syndromes', methods=['GET'])
def get_syndromes():
    """Get all brainstem syndromes"""
    return jsonify({"syndromes": SYNDROMES})

@app.route('/api/neuro/cranial_nerves', methods=['GET'])
def get_cranial_nerves():
    """Get cranial nerve information"""
    return jsonify({"cranialNerves": CRANIAL_NERVES})

# ============================================================================
# SYSTEM STATUS ENDPOINTS
# ============================================================================

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    return jsonify({
        "app_name": "NeuroSchet",
        "version": "1.0.0",
        "tagline": "Mapping the Mind, Mastering Diagnosis",
        "features": {
            "dynamic_case_generation": True,
            "curated_cases": True,
            "literature_synthesis": True,
            "adaptive_learning": True,
            "ai_conversations": ai_conversation is not None,
            "text_to_speech": tts_service is not None,
            "neurological_localization": True
        },
        "active_sessions": len(active_sessions),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/case_library', methods=['GET'])
def get_case_library():
    """Get all available curated cases"""
    cases = case_database.get_all_curated_cases()
    return jsonify({
        "curated_cases": list(cases.keys()),
        "count": len(cases)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    print(f"")
    print(f"╔═══════════════════════════════════════════════════════╗")
    print(f"║                                                       ║")
    print(f"║    ⚡ NEUROSCHET™                                     ║")
    print(f"║    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ║")
    print(f"║    Mapping the Mind, Mastering Diagnosis             ║")
    print(f"║                                                       ║")
    print(f"║    AI-Powered Neurological Assessment Platform       ║")
    print(f"║                                                       ║")
    print(f"╚═══════════════════════════════════════════════════════╝")
    print(f"")
    print(f"🚀 Starting NeuroSchet on port {port}...")
    print(f"")
    print(f"Features:")
    print(f"  ✅ Dynamic Case Generation (AI)")
    print(f"  ✅ Curated Medical Literature Cases")
    print(f"  ✅ Adaptive Learning Engine")
    print(f"  ✅ Real-Time Neurological Localization")
    print(f"  ✅ AI Conversations (Claude)")
    print(f"  ✅ Text-to-Speech (ElevenLabs)")
    print(f"")
    
    app.run(host='0.0.0.0', port=port, debug=False)
