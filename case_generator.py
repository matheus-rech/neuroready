"""
NeuroSchet™ Dynamic Case Generator
Generates realistic neurological patient cases on-demand using AI
"""

import os
import json
import random
from anthropic import Anthropic
from datetime import datetime, timedelta

class CaseGenerator:
    def __init__(self):
        self.client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        self.model = "claude-3-5-sonnet-20240620"
        
        # Case difficulty levels
        self.difficulty_levels = {
            "beginner": {
                "syndromes": ["Weber", "Wallenberg"],
                "complexity": "classic presentation",
                "confounders": 0
            },
            "intermediate": {
                "syndromes": ["Weber", "Wallenberg", "Millard-Gubler", "Lateral Pontine"],
                "complexity": "typical with minor variations",
                "confounders": 1
            },
            "advanced": {
                "syndromes": ["all"],
                "complexity": "atypical presentation with comorbidities",
                "confounders": 2-3
            },
            "expert": {
                "syndromes": ["all", "rare variants"],
                "complexity": "complex multi-level lesions",
                "confounders": 3-5
            }
        }
    
    def generate_patient_demographics(self):
        """Generate realistic patient demographics"""
        
        # Age distribution based on stroke epidemiology
        age_ranges = {
            "young": (18, 45),
            "middle": (46, 65),
            "elderly": (66, 85),
            "very_elderly": (86, 95)
        }
        
        age_category = random.choices(
            list(age_ranges.keys()),
            weights=[0.1, 0.3, 0.4, 0.2]
        )[0]
        
        age = random.randint(*age_ranges[age_category])
        gender = random.choice(["Male", "Female"])
        
        # Generate realistic names
        first_names_male = ["James", "Robert", "John", "Michael", "David", "William", "Richard", "Joseph", "Thomas", "Charles"]
        first_names_female = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", 
                      "Chen", "Patel", "Kim", "Lee", "Nguyen", "Singh", "Cohen", "O'Brien", "Murphy", "Anderson"]
        
        first_name = random.choice(first_names_male if gender == "Male" else first_names_female)
        last_name = random.choice(last_names)
        
        return {
            "name": f"{first_name} {last_name}",
            "age": age,
            "gender": gender,
            "age_category": age_category
        }
    
    def generate_risk_factors(self, age_category):
        """Generate appropriate cardiovascular risk factors"""
        
        risk_factors = []
        
        # Age-appropriate risk factors
        if age_category in ["elderly", "very_elderly"]:
            if random.random() < 0.7:
                risk_factors.append("Hypertension")
            if random.random() < 0.4:
                risk_factors.append("Type 2 Diabetes")
            if random.random() < 0.3:
                risk_factors.append("Atrial Fibrillation")
            if random.random() < 0.3:
                risk_factors.append("Hyperlipidemia")
        elif age_category == "middle":
            if random.random() < 0.5:
                risk_factors.append("Hypertension")
            if random.random() < 0.3:
                risk_factors.append("Type 2 Diabetes")
            if random.random() < 0.2:
                risk_factors.append("Smoking History")
        else:  # young
            if random.random() < 0.2:
                risk_factors.append("Migraine with Aura")
            if random.random() < 0.15:
                risk_factors.append("Oral Contraceptive Use")
        
        return risk_factors if risk_factors else ["No significant past medical history"]
    
    def generate_case_from_syndrome(self, syndrome_name, difficulty="intermediate"):
        """Generate a complete patient case for a specific syndrome"""
        
        prompt = f"""Generate a realistic neurological patient case for educational purposes.

Syndrome: {syndrome_name}
Difficulty Level: {difficulty}
Complexity: {self.difficulty_levels[difficulty]['complexity']}

Create a complete patient profile including:

1. **Chief Complaint**: What the patient says brought them in (in patient's own words)

2. **History of Present Illness**: 
   - Onset (sudden, gradual, etc.)
   - Timeline of symptom development
   - Specific neurological symptoms consistent with {syndrome_name}
   - Any precipitating factors

3. **Symptom Presentation**:
   - List 5-8 specific symptoms the patient would report
   - Use patient-friendly language (not medical jargon)
   - Include both obvious and subtle findings
   - Ensure consistency with {syndrome_name} localization

4. **Physical Examination Findings**:
   - Cranial nerve examination results
   - Motor examination (strength, tone, reflexes)
   - Sensory examination
   - Coordination and gait
   - Vital signs

5. **Relevant Negatives** (symptoms NOT present that help rule out other diagnoses)

Format as JSON with this structure:
{{
    "chief_complaint": "string",
    "history_present_illness": "string",
    "symptoms": ["symptom1", "symptom2", ...],
    "physical_exam": {{
        "cranial_nerves": {{}},
        "motor": {{}},
        "sensory": {{}},
        "coordination": {{}},
        "vitals": {{}}
    }},
    "relevant_negatives": ["negative1", "negative2", ...]
}}

Make it realistic and educational. The case should be challenging but solvable at the {difficulty} level."""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Extract JSON from response
            content = response.content[0].text
            # Find JSON block
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end > start:
                case_data = json.loads(content[start:end])
                return case_data
            else:
                raise ValueError("No JSON found in response")
                
        except Exception as e:
            print(f"Error generating case: {e}")
            return None
    
    def generate_dynamic_patient(self, syndrome=None, difficulty="intermediate"):
        """Generate a complete dynamic patient case"""
        
        # Generate demographics
        demographics = self.generate_patient_demographics()
        risk_factors = self.generate_risk_factors(demographics['age_category'])
        
        # Select syndrome if not specified
        if not syndrome:
            available_syndromes = self.difficulty_levels[difficulty]['syndromes']
            if "all" in available_syndromes:
                syndrome = random.choice(["Weber Syndrome", "Wallenberg Syndrome", 
                                        "Millard-Gubler Syndrome", "Lateral Pontine Syndrome",
                                        "Medial Medullary Syndrome"])
            else:
                syndrome = random.choice([s + " Syndrome" for s in available_syndromes])
        
        # Generate clinical case
        case_data = self.generate_case_from_syndrome(syndrome, difficulty)
        
        if not case_data:
            return None
        
        # Combine all data
        complete_patient = {
            "id": f"NS-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}",
            "name": demographics['name'],
            "age": demographics['age'],
            "gender": demographics['gender'],
            "medical_history": ", ".join(risk_factors),
            "syndrome": syndrome,
            "difficulty": difficulty,
            "chief_complaint": case_data.get('chief_complaint', ''),
            "history_present_illness": case_data.get('history_present_illness', ''),
            "symptoms": case_data.get('symptoms', []),
            "physical_exam": case_data.get('physical_exam', {}),
            "relevant_negatives": case_data.get('relevant_negatives', []),
            "generated_at": datetime.now().isoformat()
        }
        
        return complete_patient
    
    def generate_fhir_record(self, patient_data):
        """Generate synthetic FHIR record for the patient"""
        
        fhir_record = {
            "resourceType": "Patient",
            "id": patient_data['id'],
            "name": [{
                "use": "official",
                "text": patient_data['name'],
                "family": patient_data['name'].split()[-1],
                "given": patient_data['name'].split()[:-1]
            }],
            "gender": patient_data['gender'].lower(),
            "birthDate": (datetime.now() - timedelta(days=patient_data['age']*365)).strftime("%Y-%m-%d"),
            "condition": [{
                "code": {
                    "coding": [{
                        "system": "http://snomed.info/sct",
                        "code": "230690007",
                        "display": patient_data['syndrome']
                    }],
                    "text": patient_data['syndrome']
                },
                "onsetDateTime": datetime.now().isoformat()
            }],
            "meta": {
                "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
                "lastUpdated": datetime.now().isoformat()
            }
        }
        
        return fhir_record


# Singleton instance
_case_generator = None

def get_case_generator():
    """Get or create case generator instance"""
    global _case_generator
    if _case_generator is None:
        _case_generator = CaseGenerator()
    return _case_generator
