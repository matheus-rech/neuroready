"""
NeuroSchet™ Adaptive Difficulty & Clinical Reasoning Engine
Adjusts case complexity based on user performance and tracks learning progress
"""

import json
import os
from datetime import datetime
from collections import defaultdict

class AdaptiveEngine:
    def __init__(self):
        self.user_profiles = {}  # Store user performance data
        self.difficulty_thresholds = {
            "beginner": {"accuracy": 0.0, "avg_time": float('inf')},
            "intermediate": {"accuracy": 0.65, "avg_time": 300},
            "advanced": {"accuracy": 0.80, "avg_time": 180},
            "expert": {"accuracy": 0.90, "avg_time": 120}
        }
    
    def get_user_profile(self, user_id):
        """Get or create user profile"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                "user_id": user_id,
                "current_level": "beginner",
                "cases_completed": 0,
                "total_accuracy": 0.0,
                "average_time": 0.0,
                "syndrome_performance": defaultdict(lambda: {"correct": 0, "total": 0}),
                "skill_areas": {
                    "cranial_nerve_exam": 0.5,
                    "motor_exam": 0.5,
                    "sensory_exam": 0.5,
                    "localization": 0.5,
                    "differential_diagnosis": 0.5
                },
                "learning_curve": [],
                "created_at": datetime.now().isoformat()
            }
        return self.user_profiles[user_id]
    
    def record_case_performance(self, user_id, case_data, performance_data):
        """Record user performance on a case"""
        profile = self.get_user_profile(user_id)
        
        # Update basic stats
        profile["cases_completed"] += 1
        
        # Calculate accuracy for this case
        correct = performance_data.get("correct_diagnosis", False)
        time_taken = performance_data.get("time_seconds", 0)
        
        # Update running averages
        total_cases = profile["cases_completed"]
        profile["total_accuracy"] = (
            (profile["total_accuracy"] * (total_cases - 1) + (1.0 if correct else 0.0)) / total_cases
        )
        profile["average_time"] = (
            (profile["average_time"] * (total_cases - 1) + time_taken) / total_cases
        )
        
        # Update syndrome-specific performance
        syndrome = case_data.get("syndrome", "Unknown")
        profile["syndrome_performance"][syndrome]["total"] += 1
        if correct:
            profile["syndrome_performance"][syndrome]["correct"] += 1
        
        # Update skill areas based on detailed performance
        self._update_skill_areas(profile, performance_data)
        
        # Add to learning curve
        profile["learning_curve"].append({
            "timestamp": datetime.now().isoformat(),
            "case_id": case_data.get("id"),
            "syndrome": syndrome,
            "difficulty": case_data.get("difficulty"),
            "correct": correct,
            "time": time_taken,
            "accuracy_running": profile["total_accuracy"]
        })
        
        # Determine if level should change
        self._adjust_difficulty_level(profile)
        
        return profile
    
    def _update_skill_areas(self, profile, performance_data):
        """Update individual skill area scores"""
        
        skills = profile["skill_areas"]
        learning_rate = 0.1  # How quickly skills adapt
        
        # Update based on specific performance metrics
        if "cranial_nerve_accuracy" in performance_data:
            skills["cranial_nerve_exam"] = (
                skills["cranial_nerve_exam"] * (1 - learning_rate) +
                performance_data["cranial_nerve_accuracy"] * learning_rate
            )
        
        if "motor_exam_accuracy" in performance_data:
            skills["motor_exam"] = (
                skills["motor_exam"] * (1 - learning_rate) +
                performance_data["motor_exam_accuracy"] * learning_rate
            )
        
        if "sensory_exam_accuracy" in performance_data:
            skills["sensory_exam"] = (
                skills["sensory_exam"] * (1 - learning_rate) +
                performance_data["sensory_exam_accuracy"] * learning_rate
            )
        
        if "localization_correct" in performance_data:
            skills["localization"] = (
                skills["localization"] * (1 - learning_rate) +
                (1.0 if performance_data["localization_correct"] else 0.0) * learning_rate
            )
        
        if "differential_quality" in performance_data:
            skills["differential_diagnosis"] = (
                skills["differential_diagnosis"] * (1 - learning_rate) +
                performance_data["differential_quality"] * learning_rate
            )
    
    def _adjust_difficulty_level(self, profile):
        """Adjust user's difficulty level based on performance"""
        
        accuracy = profile["total_accuracy"]
        avg_time = profile["average_time"]
        cases_completed = profile["cases_completed"]
        
        # Need minimum cases before adjusting
        if cases_completed < 5:
            return
        
        current_level = profile["current_level"]
        levels = ["beginner", "intermediate", "advanced", "expert"]
        current_index = levels.index(current_level)
        
        # Check if ready to advance
        if current_index < len(levels) - 1:
            next_level = levels[current_index + 1]
            threshold = self.difficulty_thresholds[next_level]
            
            if accuracy >= threshold["accuracy"] and avg_time <= threshold["avg_time"]:
                profile["current_level"] = next_level
                profile["level_changed_at"] = datetime.now().isoformat()
        
        # Check if should go back down
        elif current_index > 0:
            current_threshold = self.difficulty_thresholds[current_level]
            if accuracy < current_threshold["accuracy"] * 0.7:  # Struggling significantly
                profile["current_level"] = levels[current_index - 1]
                profile["level_changed_at"] = datetime.now().isoformat()
    
    def get_recommended_difficulty(self, user_id):
        """Get recommended difficulty for next case"""
        profile = self.get_user_profile(user_id)
        return profile["current_level"]
    
    def get_recommended_syndrome(self, user_id):
        """Recommend a syndrome to practice based on weak areas"""
        profile = self.get_user_profile(user_id)
        syndrome_perf = profile["syndrome_performance"]
        
        if not syndrome_perf:
            return None  # No history, let system choose
        
        # Find syndromes with lowest accuracy
        syndrome_accuracies = {}
        for syndrome, stats in syndrome_perf.items():
            if stats["total"] > 0:
                syndrome_accuracies[syndrome] = stats["correct"] / stats["total"]
        
        if not syndrome_accuracies:
            return None
        
        # Return syndrome with lowest accuracy (need more practice)
        weakest_syndrome = min(syndrome_accuracies, key=syndrome_accuracies.get)
        return weakest_syndrome
    
    def get_performance_analytics(self, user_id):
        """Get detailed performance analytics for user"""
        profile = self.get_user_profile(user_id)
        
        analytics = {
            "overview": {
                "level": profile["current_level"],
                "cases_completed": profile["cases_completed"],
                "overall_accuracy": round(profile["total_accuracy"] * 100, 1),
                "average_time_minutes": round(profile["average_time"] / 60, 1)
            },
            "skill_breakdown": {
                skill: round(score * 100, 1)
                for skill, score in profile["skill_areas"].items()
            },
            "syndrome_performance": {},
            "learning_progress": profile["learning_curve"][-10:],  # Last 10 cases
            "strengths": [],
            "weaknesses": [],
            "recommendations": []
        }
        
        # Calculate syndrome-specific stats
        for syndrome, stats in profile["syndrome_performance"].items():
            if stats["total"] > 0:
                accuracy = stats["correct"] / stats["total"]
                analytics["syndrome_performance"][syndrome] = {
                    "attempts": stats["total"],
                    "accuracy": round(accuracy * 100, 1)
                }
        
        # Identify strengths and weaknesses
        for skill, score in profile["skill_areas"].items():
            if score >= 0.8:
                analytics["strengths"].append(skill.replace("_", " ").title())
            elif score < 0.6:
                analytics["weaknesses"].append(skill.replace("_", " ").title())
        
        # Generate recommendations
        if analytics["weaknesses"]:
            analytics["recommendations"].append(
                f"Focus on improving: {', '.join(analytics['weaknesses'])}"
            )
        
        if profile["average_time"] > 300:
            analytics["recommendations"].append(
                "Try to complete cases more quickly to improve clinical efficiency"
            )
        
        if profile["total_accuracy"] > 0.85:
            analytics["recommendations"].append(
                "Consider advancing to more challenging cases"
            )
        
        return analytics
    
    def get_next_case_parameters(self, user_id):
        """Get optimal parameters for next case"""
        profile = self.get_user_profile(user_id)
        
        difficulty = self.get_recommended_difficulty(user_id)
        recommended_syndrome = self.get_recommended_syndrome(user_id)
        
        # Determine focus areas based on weak skills
        focus_areas = []
        for skill, score in profile["skill_areas"].items():
            if score < 0.65:
                focus_areas.append(skill)
        
        return {
            "difficulty": difficulty,
            "recommended_syndrome": recommended_syndrome,
            "focus_areas": focus_areas,
            "user_level": profile["current_level"]
        }


# Singleton instance
_adaptive_engine = None

def get_adaptive_engine():
    """Get or create adaptive engine instance"""
    global _adaptive_engine
    if _adaptive_engine is None:
        _adaptive_engine = AdaptiveEngine()
    return _adaptive_engine
