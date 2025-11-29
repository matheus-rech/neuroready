# NeuroReady Quick Start Guide

## What is NeuroReady?

NeuroReady is a specialized neurological assessment application that combines AI-powered clinical interviews with real-time anatomical localization. It was created by personalizing Google's AppointReady to focus on neurological examination and brainstem syndrome diagnosis.

## Key Features

**AI Clinical Interview**: MedGemma conducts systematic neurological examinations while Gemini roleplays as patients with specific brainstem syndromes.

**Real-Time Localization**: The NeuroSketch component visualizes affected cranial nerves, tracts, and anatomical structures as symptoms are reported during the interview.

**Syndrome Recognition**: The system automatically matches findings to classic brainstem syndromes like Weber, Wallenberg, and Millard-Gubler syndromes.

**Comprehensive Reports**: Generates structured neurological assessment reports organized by neurological system with anatomical localization.

## Getting Started

### Prerequisites

Before running NeuroReady, ensure you have:

- Docker installed on your system
- Git for cloning the repository
- A Google Cloud project with Vertex AI API enabled
- A Gemini API key from Google AI Studio

### Installation Steps

**Step 1: Clone the Repository**

```bash
git clone https://huggingface.co/spaces/google/appoint-ready
cd appoint-ready
```

**Step 2: Configure Environment Variables**

Create a file named `env.list` in the root directory with the following content:

```ini
GEMINI_API_KEY="your-gemini-api-key-here"
GENERATE_SPEECH=false
GCP_MEDGEMMA_ENDPOINT="your-medgemma-vertex-ai-endpoint"
GCP_MEDGEMMA_SERVICE_ACCOUNT_KEY="your-service-account-key-json"
```

To get these credentials:

- **GEMINI_API_KEY**: Visit [Google AI Studio](https://aistudio.google.com/apikey) to generate a key
- **GCP_MEDGEMMA_ENDPOINT**: Deploy MedGemma via [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma)
- **GCP_MEDGEMMA_SERVICE_ACCOUNT_KEY**: Create a service account in Google Cloud Console with Vertex AI permissions

**Step 3: Build and Run**

```bash
./run_local.sh
```

This script will build the Docker container and start the application.

**Step 4: Access the Application**

Open your web browser and navigate to:

```
http://localhost:7860
```

## Using NeuroReady

### Conducting a Neurological Interview

**Select a Patient**: Choose from six neurological patients, each with different vascular risk factors and medical histories:
- Robert Chen (68M) - Hypertension and diabetes
- Maria Santos (72F) - Atrial fibrillation
- James Wilson (65M) - Poorly controlled HTN, smoker
- Linda Martinez (58F) - Hypertension and hyperlipidemia
- David Kim (70M) - Vertebral artery stenosis
- Sarah Johnson (32F) - Young patient with MS

**Select a Condition**: Choose a brainstem syndrome:
- Weber Syndrome (midbrain)
- Wallenberg Syndrome (lateral medulla)
- Millard-Gubler Syndrome (ventral pons)
- Lateral Pontine Syndrome (AICA territory)
- Medial Medullary Syndrome (medial medulla)
- Multiple Sclerosis Brainstem
- Midbrain Stroke
- Basilar Artery Thrombosis

**Watch the Interview**: The AI clinical assistant will systematically explore neurological symptoms while the AI patient responds based on their condition.

**Observe Real-Time Localization**: As symptoms are reported, the NeuroSketch component will identify affected structures and suggest possible syndromes.

**Review the Report**: After the interview, a comprehensive neurological assessment report is generated with anatomical localization.

**Evaluate the Assessment**: The system can evaluate the report against the known diagnosis to provide educational feedback.

### Understanding the NeuroSketch Visualization

The NeuroSketch component displays several key elements:

**Cranial Nerves**: Color-coded indicators show which cranial nerves are affected and on which side (left/right).

**Long Tracts**: Visual representation of motor (corticospinal) and sensory (spinothalamic, medial lemniscus) tract involvement.

**Lesion Level**: The system determines whether the lesion is in the midbrain, pons, or medulla based on cranial nerve involvement.

**Syndrome Matching**: A differential diagnosis list shows possible syndromes ranked by confidence score.

**Crossed Findings**: Special highlighting when ipsilateral cranial nerve deficits occur with contralateral motor/sensory deficits.

**Educational Content**: Key neurological localization principles are explained at the bottom of the interface.

## API Endpoints

If you want to integrate NeuroReady with other applications, these API endpoints are available:

### Original AppointReady Endpoints

**Stream Interview**
```
GET /api/stream_conversation?patient={name}&condition={condition}
```
Returns a server-sent event stream of the interview conversation.

**Evaluate Report**
```
POST /api/evaluate_report
Body: {"report": "...", "condition": "..."}
```
Evaluates a neurological assessment report against the known diagnosis.

**Download Cache**
```
GET /api/download_cache
```
Downloads cached interview responses as a ZIP file.

### Neurological Endpoints

**Parse Findings**
```
POST /api/neuro/parse_findings
Body: {"text": "left facial droop, right arm weakness..."}
```
Parses neurological findings from text and returns structured data.

**Extract Interview Findings**
```
POST /api/neuro/extract_interview_findings
Body: {"messages": [{role: "patient", content: "..."}, ...]}
```
Extracts neurological findings from a full interview conversation.

**Get Syndromes**
```
GET /api/neuro/syndromes
```
Returns reference information about all brainstem syndromes.

**Get Cranial Nerves**
```
GET /api/neuro/cranial_nerves
```
Returns reference information about cranial nerves and their findings.

## Example Use Cases

### Medical Student Education

Medical students can use NeuroReady to practice systematic neurological examination. The AI interviewer demonstrates proper questioning technique, and the real-time localization helps students understand the anatomical basis of neurological findings.

**Learning Objectives**:
- Master systematic neurological examination
- Understand brainstem anatomy and localization
- Recognize classic syndrome patterns
- Practice clinical reasoning and differential diagnosis

### Resident Training

Neurology residents can use NeuroReady to refine their localization skills and prepare for board examinations. The syndrome matching algorithm provides immediate feedback on diagnostic reasoning.

**Training Applications**:
- Practice complex localization cases
- Review vascular territories and stroke syndromes
- Develop differential diagnosis skills
- Prepare for oral board examinations

### Continuing Medical Education

Practicing physicians can use NeuroReady to stay current with neurological assessment techniques and explore AI-assisted clinical decision support.

**CME Applications**:
- Review neurological syndromes
- Explore AI applications in neurology
- Practice documentation skills
- Learn about clinical decision support tools

## Customization

### Adding New Patient Scenarios

To add a new neurological patient:

1. Add symptom pattern to `neuro_symptoms.json`
2. Create patient profile in `neuro_patients.json`
3. Generate FHIR data file in `frontend/public/assets/`
4. Update `neuro_patients_and_conditions.json`

### Modifying Interview Behavior

Edit the prompt templates in `neuro_interview.py`:

- `neuro_patient_roleplay_instructions()` - Patient behavior
- `neuro_interviewer_roleplay_instructions()` - Interviewer strategy
- `neuro_report_writer_instructions()` - Report format

### Extending the API

Add new endpoints in `neuro_api.py` and register them in the `register_neuro_routes()` function.

## Troubleshooting

### Application Won't Start

**Check Docker**: Ensure Docker is running and you have sufficient resources allocated.

**Verify Environment Variables**: Make sure `env.list` exists and contains valid API keys.

**Check Ports**: Ensure port 7860 is not already in use by another application.

### Interview Doesn't Stream

**API Key Issues**: Verify your Gemini API key is valid and has sufficient quota.

**MedGemma Endpoint**: Ensure your Vertex AI endpoint is deployed and accessible.

**Network Issues**: Check that your machine can reach Google Cloud APIs.

### NeuroSketch Not Updating

**Browser Console**: Check the browser console for JavaScript errors.

**API Endpoints**: Verify the neurological API endpoints are responding correctly.

**Findings Extraction**: Test the `/api/neuro/parse_findings` endpoint manually.

## Limitations

**Educational Use Only**: NeuroReady is a demonstration application for educational purposes. It is not approved for clinical use.

**Simulated Patients**: The application uses AI-generated patient responses, not real patient data.

**Limited Scope**: Currently focused on brainstem syndromes. Does not cover cortical, spinal cord, or peripheral nerve localization.

**No Imaging**: Does not integrate with actual MRI or CT imaging systems.

**English Only**: Currently supports English language interviews only.

## Next Steps

After getting familiar with NeuroReady, you can:

**Explore the Documentation**: Read the comprehensive documentation in `NEUROREADY_README.md` and `INTEGRATION_GUIDE.md`.

**Review the Code**: Examine the source code to understand how the integration works.

**Customize for Your Needs**: Adapt the prompts, add new scenarios, or extend the functionality.

**Contribute**: Share your improvements and customizations with the community.

**Research Applications**: Use NeuroReady as a platform for medical education research.

## Support and Resources

**Documentation**:
- `NEUROREADY_README.md` - Comprehensive documentation
- `INTEGRATION_GUIDE.md` - Technical integration details
- `PERSONALIZATION_SUMMARY.md` - Summary of all changes

**Original AppointReady**:
- [HAI-DEF Documentation](https://developers.google.com/health-ai-developer-foundations)
- [Hugging Face Space](https://huggingface.co/spaces/google/appoint-ready)

**Medical References**:
- Standard neurology textbooks for syndrome descriptions
- Neuroanatomy atlases for anatomical details
- Clinical practice guidelines for stroke management

## Disclaimer

This application is for educational and demonstration purposes only. It is not intended for clinical use and should not be used to make medical decisions. Any real-world clinical application would require extensive validation, regulatory approval, and compliance with medical device regulations and privacy laws (such as HIPAA).

---

**Ready to explore neurological localization with AI?** Start your first interview and watch as NeuroReady combines systematic clinical examination with real-time anatomical reasoning!
