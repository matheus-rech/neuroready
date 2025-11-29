# Copyright 2025 Google LLC
# Neurological API endpoints for NeuroReady
# Provides backend support for NeuroSketch component integration

from flask import jsonify, request
import re

# Simplified version of the parsing logic from NeuroSketch
# This will be called by the frontend to parse interview findings

CRANIAL_NERVES = {
    'CN I': {'name': 'Olfactory', 'level': 'forebrain', 'findings': ['anosmia', 'smell loss', 'loss of smell']},
    'CN II': {'name': 'Optic', 'level': 'forebrain', 'findings': ['vision loss', 'blindness', 'visual field defect', 'hemianopia']},
    'CN III': {'name': 'Oculomotor', 'level': 'midbrain', 'findings': ['ptosis', 'mydriasis', 'down and out', 'diplopia', 'dilated pupil']},
    'CN IV': {'name': 'Trochlear', 'level': 'midbrain', 'findings': ['vertical diplopia', 'difficulty looking down', 'head tilt']},
    'CN V': {'name': 'Trigeminal', 'level': 'pons', 'findings': ['facial numbness', 'facial sensory loss', 'jaw weakness']},
    'CN VI': {'name': 'Abducens', 'level': 'pons', 'findings': ['lateral gaze palsy', 'abduction deficit', 'cannot look laterally']},
    'CN VII': {'name': 'Facial', 'level': 'pons', 'findings': ['facial weakness', 'facial droop', 'facial palsy', 'cannot close eye']},
    'CN VIII': {'name': 'Vestibulocochlear', 'level': 'pons', 'findings': ['hearing loss', 'vertigo', 'tinnitus', 'nystagmus', 'dizziness']},
    'CN IX': {'name': 'Glossopharyngeal', 'level': 'medulla', 'findings': ['dysphagia', 'loss of gag reflex', 'swallowing difficulty']},
    'CN X': {'name': 'Vagus', 'level': 'medulla', 'findings': ['hoarseness', 'dysphagia', 'uvula deviation', 'vocal cord paralysis']},
    'CN XI': {'name': 'Accessory', 'level': 'medulla', 'findings': ['shoulder weakness', 'neck weakness', 'trapezius weakness']},
    'CN XII': {'name': 'Hypoglossal', 'level': 'medulla', 'findings': ['tongue deviation', 'tongue weakness', 'dysarthria']}
}

TRACTS = {
    'corticospinal': {
        'name': 'Corticospinal Tract',
        'findings': ['hemiparesis', 'hemiplegia', 'weakness', 'paralysis', 'spasticity', 'hyperreflexia', 'babinski'],
        'type': 'motor'
    },
    'spinothalamic': {
        'name': 'Spinothalamic Tract',
        'findings': ['pain loss', 'temperature loss', 'pinprick loss', 'thermal sensation loss'],
        'type': 'sensory'
    },
    'medialLemniscus': {
        'name': 'Medial Lemniscus',
        'findings': ['proprioception loss', 'vibration loss', 'position sense loss', 'ataxia', 'romberg positive'],
        'type': 'sensory'
    }
}

ADDITIONAL_FINDINGS = {
    'horner': {
        'name': "Horner's Syndrome",
        'findings': ['horner', 'horners', 'miosis', 'ptosis and miosis', 'anhidrosis'],
        'level': ['pons', 'medulla']
    },
    'ataxia': {
        'name': 'Ataxia',
        'findings': ['ataxia', 'cerebellar signs', 'incoordination', 'dysmetria', 'intention tremor'],
        'level': ['pons', 'medulla']
    }
}

SYNDROMES = [
    {
        'name': 'Weber Syndrome',
        'description': 'Ipsilateral CN III palsy + contralateral hemiparesis',
        'location': 'Midbrain (cerebral peduncle)',
        'level': 'midbrain',
        'findings': ['CN III (ipsi)', 'Corticospinal (contra)']
    },
    {
        'name': 'Wallenberg Syndrome',
        'description': 'Ipsilateral facial sensory loss, Horner\'s, ataxia + contralateral body sensory loss',
        'location': 'Lateral medulla',
        'level': 'medulla',
        'findings': ['CN V (ipsi)', 'Horner\'s (ipsi)', 'Ataxia (ipsi)', 'Spinothalamic (contra)', 'CN IX/X (ipsi)']
    },
    {
        'name': 'Millard-Gubler Syndrome',
        'description': 'Ipsilateral CN VI & VII palsy + contralateral hemiparesis',
        'location': 'Pons (ventral)',
        'level': 'pons',
        'findings': ['CN VI (ipsi)', 'CN VII (ipsi)', 'Corticospinal (contra)']
    },
    {
        'name': 'Lateral Pontine Syndrome',
        'description': 'Ipsilateral CN VII, VIII, ataxia + contralateral loss of pain/temp',
        'location': 'Lateral pons',
        'level': 'pons',
        'findings': ['CN VII (ipsi)', 'CN VIII (ipsi)', 'Ataxia (ipsi)', 'Spinothalamic (contra)']
    },
    {
        'name': 'Medial Medullary Syndrome',
        'description': 'Ipsilateral CN XII palsy + contralateral hemiparesis + contralateral proprioception loss',
        'location': 'Medial medulla',
        'level': 'medulla',
        'findings': ['CN XII (ipsi)', 'Corticospinal (contra)', 'Medial lemniscus (contra)']
    }
]

def parse_neurological_findings(text):
    """
    Parse neurological findings from interview text
    Returns structured findings that can be used by NeuroSketch component
    """
    text_lower = text.lower()
    findings = {
        'cranialNerves': [],
        'tracts': [],
        'additional': [],
        'level': None,
        'syndrome': None
    }
    
    # Detect laterality
    left_mentioned = 'left' in text_lower
    right_mentioned = 'right' in text_lower
    
    # Check for cranial nerves
    for cn, cn_info in CRANIAL_NERVES.items():
        for finding in cn_info['findings']:
            if finding in text_lower:
                side = 'left' if left_mentioned else 'right' if right_mentioned else 'bilateral'
                findings['cranialNerves'].append({
                    'cn': cn,
                    'name': cn_info['name'],
                    'side': side,
                    'level': cn_info['level']
                })
                if not findings['level'] and cn_info['level'] != 'forebrain':
                    findings['level'] = cn_info['level']
                break
    
    # Check for tract findings
    for tract_key, tract_info in TRACTS.items():
        for finding in tract_info['findings']:
            if finding in text_lower:
                side = 'left' if left_mentioned else 'right' if right_mentioned else 'bilateral'
                findings['tracts'].append({
                    'name': tract_info['name'],
                    'side': side,
                    'type': tract_info['type'],
                    'tract': tract_key
                })
                break
    
    # Check for additional findings
    for key, info in ADDITIONAL_FINDINGS.items():
        for finding in info['findings']:
            if finding in text_lower:
                side = 'left' if left_mentioned else 'right' if right_mentioned else 'bilateral'
                findings['additional'].append({
                    'name': info['name'],
                    'side': side,
                    'description': info['name']
                })
                break
    
    # Try to match syndrome
    for syndrome in SYNDROMES:
        syndrome_match = True
        for finding_pattern in syndrome['findings']:
            # Simple matching - in production would need more sophisticated logic
            if '(ipsi)' in finding_pattern:
                base = finding_pattern.replace(' (ipsi)', '')
                if base not in str(findings):
                    syndrome_match = False
                    break
        
        if syndrome_match and len(findings['cranialNerves']) > 0:
            findings['syndrome'] = syndrome
            break
    
    return findings

def extract_findings_from_interview(interview_messages):
    """
    Extract neurological findings from the entire interview conversation
    """
    all_text = ' '.join([msg.get('content', '') for msg in interview_messages if isinstance(msg.get('content'), str)])
    return parse_neurological_findings(all_text)

def register_neuro_routes(app):
    """
    Register neurological API routes with the Flask app
    """
    
    @app.route("/api/neuro/parse_findings", methods=["POST"])
    def parse_findings_endpoint():
        """Parse neurological findings from text"""
        data = request.get_json()
        text = data.get("text", "")
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        findings = parse_neurological_findings(text)
        return jsonify(findings)
    
    @app.route("/api/neuro/extract_interview_findings", methods=["POST"])
    def extract_interview_findings_endpoint():
        """Extract findings from full interview conversation"""
        data = request.get_json()
        messages = data.get("messages", [])
        
        if not messages:
            return jsonify({"error": "Messages are required"}), 400
        
        findings = extract_findings_from_interview(messages)
        return jsonify(findings)
    
    @app.route("/api/neuro/syndromes", methods=["GET"])
    def get_syndromes():
        """Get list of all brainstem syndromes"""
        return jsonify({"syndromes": SYNDROMES})
    
    @app.route("/api/neuro/cranial_nerves", methods=["GET"])
    def get_cranial_nerves():
        """Get cranial nerve reference information"""
        return jsonify({"cranialNerves": CRANIAL_NERVES})

    return app
