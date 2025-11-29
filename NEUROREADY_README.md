# NeuroReady: Neurological Pre-Visit Assessment System

## Overview

**NeuroReady** is a specialized neurological assessment application adapted from Google's AppointReady demo. It combines AI-powered clinical interviews with real-time anatomical localization to create comprehensive neurological assessment reports for physicians.

## What Makes NeuroReady Different

NeuroReady personalizes the original AppointReady application by:

1. **Neurological Focus**: Specialized for brainstem syndromes, stroke localization, and cranial nerve pathology
2. **NeuroSketch Integration**: Real-time anatomical localization and syndrome identification during interviews
3. **Neurological Patient Scenarios**: Pre-configured scenarios for Weber syndrome, Wallenberg syndrome, Millard-Gubler syndrome, and more
4. **Enhanced Clinical Reasoning**: Prompts optimized for neurological examination and localization

## Key Features

### AI-Powered Neurological Interview
- **MedGemma** acts as a neurological clinical assistant, conducting systematic neurological examinations
- **Gemini** roleplays as patients with specific brainstem syndromes
- Focused questioning on cranial nerves, motor/sensory deficits, coordination, and gait
- Emphasis on laterality, timing, and progression of symptoms

### Real-Time Anatomical Localization
- **NeuroSketch Component**: Interactive neurological localization tool
- Parses interview findings to identify:
  - Affected cranial nerves with laterality
  - Long tract involvement (corticospinal, spinothalamic, medial lemniscus)
  - Additional findings (Horner's syndrome, ataxia, nystagmus)
  - Lesion level (midbrain, pons, medulla)
  - Syndrome pattern matching (Weber, Wallenberg, Millard-Gubler, etc.)

### Comprehensive Neurological Reports
- Structured neurological assessment reports
- Organized by neurological system (cranial nerves, motor, sensory, coordination)
- Includes anatomical localization and syndrome identification
- Pertinent positives and negatives clearly documented
- Vascular risk factor assessment

### Educational Value
- Clinical pearls for each syndrome
- Visualization of brainstem anatomy
- Vascular territory mapping
- Crossed findings explanation

## Technical Architecture

### Backend Components

#### New Neurological Modules
- **`neuro_interview.py`**: Neurological interview logic and prompting
  - Patient roleplay instructions for neurological conditions
  - Interviewer instructions for systematic neurological examination
  - Report writing instructions for neurological assessments
  
- **`neuro_api.py`**: API endpoints for neurological findings
  - `/api/neuro/parse_findings`: Parse neurological findings from text
  - `/api/neuro/extract_interview_findings`: Extract findings from full interview
  - `/api/neuro/syndromes`: Get brainstem syndrome reference
  - `/api/neuro/cranial_nerves`: Get cranial nerve information

#### Neurological Data Files
- **`neuro_symptoms.json`**: Symptom patterns for each syndrome
- **`neuro_patients.json`**: Neurological patient profiles
- **FHIR JSON files**: Electronic health records for neurological patients

### Frontend Components

#### NeuroSketch Component
- **`NeuroSketch.jsx`**: Interactive neurological localization interface
  - Real-time parsing of neurological findings
  - Visual brainstem anatomy representation
  - Syndrome pattern matching with confidence scores
  - Differential diagnosis generation
  - Educational content on localization principles

#### Integration Points
- Interview findings automatically parsed and displayed in NeuroSketch
- Real-time updates as new symptoms are reported
- Visual feedback on lesion localization
- Syndrome recognition with clinical pearls

## Neurological Patient Scenarios

### 1. Weber Syndrome (Robert Chen, 68M)
- **Presentation**: Left CN III palsy + right hemiparesis
- **Localization**: Left midbrain (cerebral peduncle)
- **Vascular**: PCA or basilar perforators
- **Key Features**: "Down and out" eye with ptosis on left, weakness on right

### 2. Wallenberg Syndrome (Maria Santos, 72F)
- **Presentation**: Left facial sensory loss, Horner's, ataxia + right body sensory loss
- **Localization**: Left lateral medulla
- **Vascular**: PICA (most common)
- **Key Features**: Classic crossed sensory finding

### 3. Millard-Gubler Syndrome (James Wilson, 65M)
- **Presentation**: Left CN VI & VII palsy + right hemiparesis
- **Localization**: Left ventral pons
- **Vascular**: Basilar perforators
- **Key Features**: Both facial droop and lateral gaze palsy on same side

### 4. Lateral Pontine Syndrome (Linda Martinez, 58F)
- **Presentation**: Left CN VII, VIII, ataxia + right pain/temp loss
- **Localization**: Left lateral pons
- **Vascular**: AICA
- **Key Features**: AICA syndrome pattern

### 5. Medial Medullary Syndrome (David Kim, 70M)
- **Presentation**: Left CN XII palsy + right hemiparesis + right proprioception loss
- **Localization**: Left medial medulla
- **Vascular**: Vertebral artery or ASA
- **Key Features**: Tongue deviates toward lesion side

### 6. Multiple Sclerosis Brainstem (Sarah Johnson, 32F)
- **Presentation**: Episodic diplopia, INO, sensory symptoms
- **Localization**: Multiple brainstem lesions
- **Pathology**: Demyelinating disease
- **Key Features**: Young age, relapsing-remitting course

## Setup and Installation

### Prerequisites
- Docker
- Git
- Google Cloud project with Vertex AI API enabled
- Gemini API key

### Configuration

Create an `env.list` file in the root directory:

```ini
# env.list
GEMINI_API_KEY="your-gemini-api-key"
GENERATE_SPEECH=false
GCP_MEDGEMMA_ENDPOINT="your-medgemma-endpoint"
GCP_MEDGEMMA_SERVICE_ACCOUNT_KEY="your-service-account-key-json"
```

### Running NeuroReady

```bash
# Clone the repository
git clone https://huggingface.co/spaces/google/appoint-ready
cd appoint-ready

# Build and run
./run_local.sh

# Access the application
# Open browser to http://localhost:7860
```

## API Endpoints

### Original AppointReady Endpoints
- `GET /api/stream_conversation?patient={name}&condition={condition}`: Stream interview
- `POST /api/evaluate_report`: Evaluate assessment report
- `GET /api/download_cache`: Download cached responses

### New Neurological Endpoints
- `POST /api/neuro/parse_findings`: Parse neurological findings from text
- `POST /api/neuro/extract_interview_findings`: Extract findings from interview messages
- `GET /api/neuro/syndromes`: Get brainstem syndrome reference data
- `GET /api/neuro/cranial_nerves`: Get cranial nerve information

## Usage Example

### 1. Select Patient and Condition
Choose a neurological patient (e.g., Robert Chen) and condition (e.g., Weber Syndrome)

### 2. Conduct Interview
The AI clinical assistant will:
- Ask systematic neurological examination questions
- Probe for cranial nerve deficits
- Assess motor and sensory symptoms
- Clarify laterality and timing
- Explore vascular risk factors

### 3. Real-Time Localization
As symptoms are reported, NeuroSketch will:
- Identify affected cranial nerves
- Detect tract involvement
- Determine lesion level
- Match syndrome patterns
- Display differential diagnosis

### 4. Generate Report
After the interview, a comprehensive neurological assessment report is generated with:
- Chief complaint
- History of present illness (organized by neurological system)
- Relevant past medical history
- Neurological localization
- Clinical impression

### 5. Evaluate Report
The system can evaluate the report against the known diagnosis, providing feedback on:
- Completeness of findings
- Accuracy of localization
- Syndrome recognition
- Clinical reasoning

## Educational Applications

### Medical Student Training
- Learn systematic neurological examination
- Practice brainstem localization
- Understand crossed findings
- Recognize classic syndromes

### Resident Education
- Refine localization skills
- Develop differential diagnosis reasoning
- Practice documentation
- Learn vascular territories

### Continuing Medical Education
- Review neurological syndromes
- Stay current with AI-assisted assessment
- Explore clinical decision support tools

## Customization Options

### Add New Syndromes
1. Add syndrome pattern to `neuro_symptoms.json`
2. Create patient profile in `neuro_patients.json`
3. Add FHIR data file
4. Update syndrome matching logic in `neuro_api.py`

### Modify Interview Strategy
Edit prompts in `neuro_interview.py`:
- `neuro_patient_roleplay_instructions()`: Patient behavior
- `neuro_interviewer_roleplay_instructions()`: Interviewer strategy
- `neuro_report_writer_instructions()`: Report format

### Customize NeuroSketch
Modify `frontend/src/components/NeuroSketch.jsx`:
- Add new cranial nerves or tracts
- Customize visual representation
- Adjust syndrome matching algorithms
- Add new educational content

## Limitations and Disclaimers

⚠️ **Important**: This is a demonstration application for educational and research purposes only.

- **Not for Clinical Use**: This application is NOT approved for clinical decision-making
- **No Regulatory Approval**: Not compliant with medical device regulations
- **Educational Only**: Intended to demonstrate AI capabilities in neurological assessment
- **Requires Validation**: Any real-world application would require extensive validation and regulatory approval
- **Not HIPAA Compliant**: Do not use with real patient data

## Future Enhancements

### Potential Additions
- **Imaging Integration**: Display MRI/CT images with lesion localization
- **Video Analysis**: Analyze patient examination videos
- **Multi-language Support**: Conduct interviews in multiple languages
- **Real EHR Integration**: Connect to actual electronic health record systems
- **Telemedicine Integration**: Real-time remote neurological assessment
- **Advanced Visualizations**: 3D brainstem anatomy with interactive lesion mapping

### Research Opportunities
- Validate AI localization accuracy against expert neurologists
- Study impact on medical education outcomes
- Explore use in resource-limited settings
- Investigate integration with clinical workflows

## Technical Details

### AI Models Used
- **MedGemma 27b-text-it**: Medical LLM for clinical assistant role
- **Gemini 2.5 Flash**: Patient roleplay and general tasks
- **Gemini TTS** (optional): Voice synthesis for natural interaction

### Data Formats
- **FHIR R4**: Electronic health records
- **JSON**: Patient profiles, symptoms, findings
- **Markdown**: Reports and documentation

### Technologies
- **Backend**: Python, Flask, Gunicorn
- **Frontend**: React, Tailwind CSS, Lucide icons
- **Deployment**: Docker
- **APIs**: Vertex AI, Gemini API

## Contributing

This is a demonstration project adapted from Google's AppointReady. Contributions and adaptations are welcome for educational and research purposes.

### Areas for Contribution
- Additional neurological syndromes
- Improved localization algorithms
- Enhanced visualizations
- Multi-language support
- Accessibility improvements
- Documentation and tutorials

## License

Based on AppointReady by Google LLC, licensed under Apache License 2.0.

Neurological adaptations and NeuroSketch integration maintain the same license.

## Acknowledgments

- **Original AppointReady**: Google Health AI Developer Foundations (HAI-DEF)
- **MedGemma**: Google Health AI team
- **NeuroSketch**: Enhanced neurological localization component
- **Medical Knowledge**: Based on standard neurological textbooks and clinical practice

## Contact and Support

This is an educational demonstration project. For questions about:
- **Original AppointReady**: See [HAI-DEF documentation](https://developers.google.com/health-ai-developer-foundations)
- **Neurological Adaptations**: This is a personalized demo for educational purposes

## References

### Neurological Syndromes
- Weber Syndrome: Midbrain stroke with CN III palsy and contralateral hemiparesis
- Wallenberg Syndrome: Lateral medullary syndrome (PICA territory)
- Millard-Gubler Syndrome: Ventral pontine syndrome
- Lateral Pontine Syndrome: AICA territory infarction
- Medial Medullary Syndrome (Dejerine): ASA territory infarction

### Vascular Territories
- **PCA**: Posterior Cerebral Artery (midbrain lateral, thalamus, occipital lobe)
- **Basilar**: Basilar Artery (pons, midbrain medial)
- **AICA**: Anterior Inferior Cerebellar Artery (lateral pons)
- **PICA**: Posterior Inferior Cerebellar Artery (lateral medulla)
- **ASA**: Anterior Spinal Artery (medial medulla)

### Localization Principles
- **Ipsilateral Rule**: Cranial nerve deficits on same side as brainstem lesion
- **Contralateral Rule**: Long tract signs opposite to lesions above decussation
- **Crossed Syndromes**: Ipsilateral CN + contralateral tract = brainstem
- **Cranial Nerve Levels**: CN III-IV (midbrain), CN V-VIII (pons), CN IX-XII (medulla)

---

**NeuroReady**: Transforming neurological pre-visit assessment through AI-powered clinical interviews and real-time anatomical localization.
