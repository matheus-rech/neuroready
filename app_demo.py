# Copyright 2025 Google LLC
# Demo mode version - runs without API credentials for demonstration

from flask import Flask, send_from_directory, request, jsonify, Response, stream_with_context, send_file
from flask_cors import CORS
import os, time, json, re

# Import only the modules that don't require credentials
from cache import create_cache_zip

app = Flask(__name__, static_folder=os.environ.get("FRONTEND_BUILD", "frontend/build"), static_url_path="/")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register neurological API routes (these don't require external APIs)
try:
    from neuro_api import register_neuro_routes
    app = register_neuro_routes(app)
    print("✓ Neurological API routes registered successfully")
except Exception as e:
    print(f"⚠ Warning: Could not register neuro routes: {e}")

@app.route("/")
def serve():
    """Serves the main index.html file."""
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/stream_conversation", methods=["GET"])
def stream_conversation():
    """Demo mode - returns a message about needing API keys."""
    patient = request.args.get("patient", "Patient")
    condition = request.args.get("condition", "unknown condition")
    
    def generate():
        yield f"data: {json.dumps({'type': 'info', 'message': 'Demo Mode: This application requires Google Cloud API keys to run the AI interview. Please see QUICKSTART.md for setup instructions.'})}\n\n"
        yield f"data: {json.dumps({'type': 'info', 'message': f'Selected patient: {patient}, Condition: {condition}'})}\n\n"
        yield f"data: {json.dumps({'type': 'info', 'message': 'To enable full functionality, you need: 1) GEMINI_API_KEY, 2) GCP_MEDGEMMA_ENDPOINT, 3) GCP_MEDGEMMA_SERVICE_ACCOUNT_KEY'})}\n\n"
        
    return Response(stream_with_context(generate()), mimetype="text/event-stream")

@app.route("/api/evaluate_report", methods=["POST"])
def evaluate_report_call():
    """Demo mode - returns info about API requirements."""
    return jsonify({
        "evaluation": "Demo Mode: Report evaluation requires API credentials. See QUICKSTART.md for setup.",
        "demo": True
    })

@app.route("/api/download_cache")
def download_cache_zip():
    """Creates a zip file of the cache and returns it for download."""
    zip_filepath, error = create_cache_zip()
    if error:
        return jsonify({"error": error}), 500
    if not os.path.isfile(zip_filepath):
        return jsonify({"error": f"File not found: {zip_filepath}"}), 404
    return send_file(zip_filepath, as_attachment=True)

@app.route("/api/demo_info")
def demo_info():
    """Provides information about demo mode and setup requirements."""
    return jsonify({
        "mode": "demo",
        "message": "NeuroReady is running in demo mode",
        "features_available": [
            "Frontend interface accessible",
            "Neurological API endpoints functional",
            "NeuroSketch component can parse findings",
            "Patient and condition data viewable"
        ],
        "features_requiring_api_keys": [
            "AI-powered interviews (requires GEMINI_API_KEY)",
            "MedGemma clinical assistant (requires GCP_MEDGEMMA_ENDPOINT and credentials)",
            "Text-to-speech (requires GEMINI_API_KEY and GENERATE_SPEECH=true)",
            "Report generation and evaluation"
        ],
        "setup_instructions": "See QUICKSTART.md for detailed setup instructions",
        "neurological_features": {
            "findings_parsing": "Available - test via /api/neuro/parse_findings",
            "syndrome_reference": "Available - access via /api/neuro/syndromes",
            "cranial_nerve_info": "Available - access via /api/neuro/cranial_nerves"
        }
    })

@app.route("/<path:path>")
def static_proxy(path):
    """Serves static files and defaults to index.html for unknown paths."""
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")
        
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🧠 NeuroReady - Demo Mode")
    print("="*60)
    print("\n📋 Status:")
    print("  ✓ Frontend built and ready")
    print("  ✓ Flask server starting")
    print("  ✓ Neurological API endpoints available")
    print("\n⚠️  Running in DEMO MODE:")
    print("  • AI interviews require API credentials")
    print("  • See QUICKSTART.md for full setup")
    print("\n🌐 Access the application at:")
    print("  http://localhost:7860")
    print("\n📚 Available endpoints:")
    print("  • /api/demo_info - Demo mode information")
    print("  • /api/neuro/parse_findings - Parse neurological findings")
    print("  • /api/neuro/syndromes - Get syndrome reference")
    print("  • /api/neuro/cranial_nerves - Get cranial nerve info")
    print("\n" + "="*60 + "\n")
    
    app.run(host="0.0.0.0", port=7860, threaded=True)
