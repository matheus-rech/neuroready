"""
AI Conversation Module for NeuroReady
Uses Anthropic Claude for realistic medical conversations
"""

import os
import json
from anthropic import Anthropic

class AIConversation:
    def __init__(self):
        self.client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        self.model = "claude-3-5-sonnet-20241022"
        
    def create_interviewer_prompt(self, patient, condition):
        """Create system prompt for the clinical interviewer"""
        return f"""You are a skilled clinical assistant conducting a pre-visit interview. 

Your role:
- Ask systematic, focused questions to gather relevant medical information
- Be empathetic and professional
- Follow a logical clinical reasoning process
- Focus on the presenting complaint and relevant history
- Conduct a brief neurological examination when appropriate

Patient context:
- Name: {patient['name']}
- Age: {patient['age']} years
- Gender: {patient['gender']}
- Medical history: {patient['condition']}

The patient is presenting with symptoms that may be related to {condition['name']}.

Guidelines:
- Start with open-ended questions about the chief complaint
- Ask about onset, duration, severity, and progression
- Inquire about associated symptoms
- Perform relevant neurological examination
- Keep responses concise and professional
- Do NOT reveal the diagnosis to the patient
- Ask one or two questions at a time
"""

    def create_patient_prompt(self, patient, condition):
        """Create system prompt for the simulated patient"""
        symptoms_text = "\n".join([f"- {s}" for s in condition.get('symptoms', [])])
        
        return f"""You are roleplaying as a patient presenting to a healthcare provider.

Your character:
- Name: {patient['name']}
- Age: {patient['age']} years
- Gender: {patient['gender']}
- Medical history: {patient['condition']}

Your current condition: {condition['name']}
Description: {condition['description']}

Your symptoms:
{symptoms_text}

Guidelines:
- Answer questions honestly based on your symptoms
- Describe symptoms in patient-friendly language (not medical jargon)
- Show appropriate concern but don't be overly dramatic
- Volunteer relevant information when asked
- If unsure about a question, say so naturally
- Keep responses conversational and realistic
- Do NOT use medical terminology unless you would realistically know it
"""

    def generate_interviewer_response(self, conversation_history, patient, condition):
        """Generate clinical interviewer's next question/response"""
        system_prompt = self.create_interviewer_prompt(patient, condition)
        
        messages = []
        for msg in conversation_history:
            role = "assistant" if msg['role'] == 'interviewer' else "user"
            messages.append({"role": role, "content": msg['content']})
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=300,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text
        except Exception as e:
            print(f"Error generating interviewer response: {e}")
            return "I apologize, but I'm having trouble processing that. Could you tell me more about your symptoms?"
    
    def generate_patient_response(self, conversation_history, patient, condition):
        """Generate patient's response to interviewer's question"""
        system_prompt = self.create_patient_prompt(patient, condition)
        
        messages = []
        for msg in conversation_history:
            role = "user" if msg['role'] == 'interviewer' else "assistant"
            messages.append({"role": role, "content": msg['content']})
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=200,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text
        except Exception as e:
            print(f"Error generating patient response: {e}")
            return "I'm not sure how to describe it exactly..."
    
    def evaluate_report(self, report_text, patient, condition):
        """Evaluate the quality of the generated report"""
        evaluation_prompt = f"""You are a medical education expert evaluating a clinical pre-visit report.

Patient: {patient['name']}, {patient['age']} years, {patient['gender']}
Actual condition: {condition['name']} - {condition['description']}

Report to evaluate:
{report_text}

Provide a structured evaluation covering:
1. Completeness: Did the report capture all relevant symptoms and findings?
2. Accuracy: Are the documented findings consistent with {condition['name']}?
3. Organization: Is the report well-structured and easy to follow?
4. Clinical Reasoning: Does it demonstrate appropriate localization and diagnosis?
5. Recommendations: Are the suggested next steps appropriate?

For each category, provide:
- A rating (Excellent/Good/Fair/Needs Improvement)
- Specific feedback
- Suggestions for improvement

Keep your evaluation constructive and educational."""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1000,
                messages=[{"role": "user", "content": evaluation_prompt}]
            )
            return response.content[0].text
        except Exception as e:
            print(f"Error evaluating report: {e}")
            return "Unable to generate evaluation at this time."
    
    def generate_report(self, conversation_history, patient, condition, findings=None):
        """Generate a comprehensive pre-visit report"""
        conversation_text = "\n".join([
            f"{msg['role'].upper()}: {msg['content']}" 
            for msg in conversation_history
        ])
        
        findings_text = ""
        if findings:
            findings_text = f"""
Neurological Findings:
- Cranial Nerves: {', '.join([f"{cn['cn']} ({cn['name']}) - {cn['side']} side" for cn in findings.get('cranialNerves', [])])}
- Tracts: {', '.join([f"{t['name']} - {t['side']} side ({t['type']})" for t in findings.get('tracts', [])])}
- Lesion Level: {findings.get('level', 'Not determined').upper()}
"""
        
        report_prompt = f"""Generate a comprehensive neurological assessment report based on this clinical interview.

Patient Information:
- Name: {patient['name']}
- Age: {patient['age']} years
- Gender: {patient['gender']}
- Medical History: {patient['condition']}

Interview Transcript:
{conversation_text}

{findings_text}

Generate a professional medical report with these sections:
1. PATIENT INFORMATION
2. CHIEF COMPLAINT
3. HISTORY OF PRESENT ILLNESS
4. NEUROLOGICAL EXAMINATION
5. LOCALIZATION (if neurological case)
6. CLINICAL IMPRESSION
7. RECOMMENDATIONS

Use proper medical terminology and formatting. Be thorough but concise."""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1500,
                messages=[{"role": "user", "content": report_prompt}]
            )
            return response.content[0].text
        except Exception as e:
            print(f"Error generating report: {e}")
            return "Unable to generate report at this time."


# Singleton instance
_ai_conversation = None

def get_ai_conversation():
    """Get or create AI conversation instance"""
    global _ai_conversation
    if _ai_conversation is None:
        _ai_conversation = AIConversation()
    return _ai_conversation
