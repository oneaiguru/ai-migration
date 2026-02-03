# feedback/feedback_collector.py
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

class FeedbackCollector:
    """Collects and stores user feedback for different components."""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.feedback_file = output_dir / 'feedback.json'
        self.feedback_data = self._load_existing_feedback()
    
    def _load_existing_feedback(self) -> Dict:
        """Load existing feedback if available."""
        if self.feedback_file.exists():
            try:
                with open(self.feedback_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def collect_feedback(
        self,
        component: str,
        file_name: str,
        feedback_type: str,
        comments: Optional[str] = None
    ) -> None:
        """
        Collect and store feedback for a component.
        
        Args:
            component: Name of the component (e.g., "Code Quality Checker")
            file_name: Name of the file or report
            feedback_type: Type of feedback (e.g., "Success", "Improvement Suggestion")
            comments: Optional additional comments
        """
        timestamp = datetime.now().isoformat()
        
        if component not in self.feedback_data:
            self.feedback_data[component] = []
            
        feedback_entry = {
            'timestamp': timestamp,
            'file_name': file_name,
            'feedback_type': feedback_type,
            'comments': comments
        }
        
        self.feedback_data[component].append(feedback_entry)
        self._save_feedback()
    
    def _save_feedback(self) -> None:
        """Save collected feedback to JSON file."""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        with open(self.feedback_file, 'w') as f:
            json.dump(self.feedback_data, f, indent=2)
