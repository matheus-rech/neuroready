# NeuroReady - AI-Powered Neurological Assessment

## Overview

NeuroReady is an AI-powered clinical interview system specialized for neurological assessment. It combines Google's AppointReady with advanced neurological localization capabilities and real AI conversations.

## Features

- ✅ **Real AI Conversations** - Powered by Anthropic Claude 3.5 Sonnet
- ✅ **Text-to-Speech** - Natural patient voices via ElevenLabs
- ✅ **Neurological Localization** - Real-time cranial nerve and tract identification
- ✅ **Syndrome Matching** - Automatic brainstem syndrome recognition
- ✅ **Report Generation** - AI-generated comprehensive clinical reports
- ✅ **Report Evaluation** - AI feedback on report quality
- ✅ **6 Patients** - 3 general medical + 3 neurological
- ✅ **8 Conditions** - 4 general + 4 brainstem syndromes

## Technology Stack

### Backend
- **Python 3.11** - Core language
- **Flask** - Web framework
- **Anthropic Claude** - AI conversations
- **ElevenLabs** - Text-to-speech
- **Gunicorn** - Production server

### Frontend
- **React** - UI framework
- **Node.js 24** - Build tooling
- **Modern CSS** - Responsive design

## Deployment

### Hugging Face Spaces (Recommended)

1. **Create new Space**
   - Go to https://huggingface.co/new-space
   - Choose "Docker" as SDK
   - Select "Dockerfile.ai" as the Dockerfile

2. **Add Secrets**
   ```
   ANTHROPIC_API_KEY=your_key
   ELEVENLABS_API_KEY=your_key
   ```

3. **Push code**
   ```bash
   git push
   ```

### Local Development

1. **Install dependencies**
   ```bash
   pip install -r requirements-deploy.txt
   cd frontend && npm install && npm run build && cd ..
   ```

2. **Set environment variables**
   ```bash
   export ANTHROPIC_API_KEY=your_key
   export ELEVENLABS_API_KEY=your_key
   ```

3. **Run**
   ```bash
   python app_ai.py
   ```

### Docker

```bash
docker build -f Dockerfile.ai -t neuroready .
docker run -p 7860:7860 \
  -e ANTHROPIC_API_KEY=your_key \
  -e ELEVENLABS_API_KEY=your_key \
  neuroready
```

## API Endpoints

### Interview
- `POST /api/start_interview` - Start new AI interview
- `POST /api/conversation/<session_id>` - Continue conversation
- `POST /api/generate_audio/<session_id>` - Generate speech
- `POST /api/evaluate_report/<session_id>` - Evaluate report

### Neurological
- `POST /api/neuro/parse_findings` - Parse neurological findings
- `GET /api/neuro/syndromes` - Get syndrome reference
- `GET /api/neuro/cranial_nerves` - Get cranial nerve info

### Status
- `GET /api/demo_info` - Check AI availability

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key for conversations |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key for TTS |
| `PORT` | No | Server port (default: 7860) |
| `CACHE_DIR` | No | Cache directory (default: /cache) |

## Project Structure

```
neuroready/
├── app_ai.py                 # Main Flask application
├── ai_conversation.py        # Claude integration
├── tts_service.py           # ElevenLabs integration
├── neuro_api.py             # Neurological parsing
├── neuro_interview.py       # Neurological prompts
├── neuro_patients.json      # Patient data
├── neuro_symptoms.json      # Symptom patterns
├── frontend/
│   ├── src/
│   │   └── components/
│   │       ├── AIInterview/     # AI interview component
│   │       ├── ReportEvaluation/ # Evaluation modal
│   │       └── NeuroSketch.jsx  # Localization viz
│   ├── public/assets/       # Patient data and FHIR
│   └── build/               # Production build
├── Dockerfile.ai            # Docker configuration
└── requirements-deploy.txt  # Python dependencies
```

## Credits

- **Original**: Google AppointReady (HAI-DEF)
- **AI Enhancement**: Manus AI
- **Neurological Specialization**: Custom development
- **NeuroSketch**: Enhanced localization component

## License

Based on Google AppointReady - see original license terms.

## Support

For issues or questions, refer to the documentation or create an issue in the repository.

## Development Status

- ✅ Backend: 100% Complete
- ✅ AI Integration: Fully Functional
- ⚠️ Frontend: Partial Integration (API ready, UI needs connection)

## Next Steps

1. Complete frontend integration with AI components
2. Add FHIR viewer modal
3. Add patient images/avatars
4. Comprehensive end-to-end testing
5. Production hardening

## Demo

Visit the deployed application at: [Your Hugging Face Space URL]

## Quick Start

```bash
# Clone repository
git clone [your-repo-url]
cd neuroready

# Install dependencies
pip install -r requirements-deploy.txt

# Set API keys
export ANTHROPIC_API_KEY=your_key
export ELEVENLABS_API_KEY=your_key

# Run
python app_ai.py
```

Access at http://localhost:7860

---

**Note**: This is an educational tool for demonstration purposes. Not for clinical use.
