"""
Text-to-Speech Service using ElevenLabs
"""

import os
from elevenlabs import ElevenLabs, VoiceSettings

class TTSService:
    def __init__(self):
        api_key = os.environ.get("ELEVENLABS_API_KEY")
        if not api_key:
            print("Warning: ELEVENLABS_API_KEY not found")
            self.client = None
        else:
            self.client = ElevenLabs(api_key=api_key)
        
        # Voice mappings for different patients
        self.voice_map = {
            "male_elderly": "pNInz6obpgDQGcFmaJgB",  # Adam
            "female_elderly": "EXAVITQu4vr4xnSDxMaL",  # Bella
            "male_middle": "VR6AewLTigWG4xSOukaG",  # Arnold
            "female_middle": "jsCqWAovK2LkecY7zXl4",  # Freya
            "male_young": "TxGEqnHWrfWFTfGW9XjX",  # Josh
            "female_young": "jBpfuIE2acCO8z3wKNLl"   # Gigi
        }
    
    def get_voice_for_patient(self, patient):
        """Select appropriate voice based on patient demographics"""
        age = patient.get('age', 50)
        gender = patient.get('gender', 'Male').lower()
        
        if age >= 65:
            category = "elderly"
        elif age >= 40:
            category = "middle"
        else:
            category = "young"
        
        voice_key = f"{gender}_{category}"
        return self.voice_map.get(voice_key, self.voice_map["male_middle"])
    
    def generate_speech(self, text, patient):
        """Generate speech audio from text"""
        if not self.client:
            return None
        
        try:
            voice_id = self.get_voice_for_patient(patient)
            
            audio = self.client.text_to_speech.convert(
                voice_id=voice_id,
                text=text,
                model_id="eleven_turbo_v2_5",
                voice_settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.75,
                    style=0.0,
                    use_speaker_boost=True
                )
            )
            
            # Convert generator to bytes
            audio_bytes = b"".join(audio)
            return audio_bytes
            
        except Exception as e:
            print(f"Error generating speech: {e}")
            return None
    
    def is_available(self):
        """Check if TTS service is available"""
        return self.client is not None


# Singleton instance
_tts_service = None

def get_tts_service():
    """Get or create TTS service instance"""
    global _tts_service
    if _tts_service is None:
        _tts_service = TTSService()
    return _tts_service
