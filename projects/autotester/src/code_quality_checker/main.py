# code_quality_checker/main.py
import sys
from pathlib import Path

from checks.pep8_checks import PEP8Checker
from reporters.console_reporter import ConsoleReporter
from utils.file_selector import select_python_files
from feedback.feedback_collector import FeedbackCollector

def collect_user_feedback(feedback_collector: FeedbackCollector) -> None:
    """Collect user feedback about the PEP 8 compliance report."""
    print("\nFeedback:")
    print("---------")
    
    # Get helpful/not helpful feedback
    while True:
        response = input("Was the PEP 8 compliance report helpful? (yes/no): ").lower()
        if response in ['yes', 'no']:
            break
        print("Please enter 'yes' or 'no'")
    
    # Get improvement suggestions
    suggestions = input("Any suggestions for improvement? (press Enter to skip): ")
    
    # Store feedback
    feedback_collector.collect_feedback(
        component="Code Quality Checker",
        file_name="PEP8 Compliance Report",
        feedback_type="Success" if response == "yes" else "Improvement Suggestion",
        comments=suggestions if suggestions else None
    )

def main():
    if len(sys.argv) < 2:
        print("Usage: python -m code_quality_checker.main /path/to/check")
        sys.exit(1)
        
    project_path = sys.argv[1]
    
    # Create output directory for feedback
    output_dir = Path("output")
    feedback_collector = FeedbackCollector(output_dir)
    
    # Find Python files
    python_files = select_python_files(project_path)
    
    # Initialize checker with default max line length
    checker = PEP8Checker(max_line_length=79)
    
    # Run checks
    results = checker.check_files(python_files)
    
    # Report results
    reporter = ConsoleReporter()
    reporter.report(results)
    
    # Collect feedback
    collect_user_feedback(feedback_collector)
    
    # Exit with status code based on whether there were violations
    sys.exit(1 if results.total_errors > 0 else 0)

if __name__ == "__main__":
    main()
