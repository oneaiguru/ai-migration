# main_workflow.py

import sys
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import json

# Import tool-specific modules
from documentation_tool.documentation_tool import (
    extract_module_docstring,
    extract_class_and_method_docstrings,
    generate_markdown
)

from code_quality_checker.checks.pep8_checks import PEP8Checker
from code_quality_checker.reporters.console_reporter import ConsoleReporter
from dependency_analysis.dependency_analysis import (
    get_python_files,
    analyze_project_dependencies_from_content,
    visualize_dependencies
)
from todo_comment_aggregator.todo_comment_aggregator import (
    detect_todo_fixme_comments,
    generate_todo_markdown
)
class FeedbackCollector:
    """Collects and stores user feedback for each tool execution."""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.feedback_file = output_dir / 'tool_feedback.json'
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
    
    def collect_feedback(self, tool_name: str) -> None:
        """Collect user feedback for a specific tool."""
        print(f"\nPlease rate the {tool_name} execution (1-5, 5 being best):")
        try:
            rating = int(input("Rating: "))
            comments = input("Additional comments (optional): ")
            
            self.feedback_data[tool_name] = {
                'rating': rating,
                'comments': comments,
                'timestamp': datetime.now().isoformat()
            }
            
            self._save_feedback()
        except ValueError:
            logging.warning(f"Invalid rating received for {tool_name}")
    
    def _save_feedback(self) -> None:
        """Save collected feedback to JSON file."""
        with open(self.feedback_file, 'w') as f:
            json.dump(self.feedback_data, f, indent=2)

class WorkflowManager:
    """Manages the execution of all tools in the workflow."""
    
    def __init__(self, project_dir: Path, output_dir: Path):
        self.project_dir = project_dir
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure logging
        logging.basicConfig(
            filename=output_dir / 'workflow.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        
        self.feedback_collector = FeedbackCollector(output_dir)
    
    def run_documentation_tool(self) -> bool:
        """Run documentation generation tool."""
        try:
            logging.info("Starting documentation generation")
            docs_dir = self.output_dir / 'documentation'
            docs_dir.mkdir(exist_ok=True)
            
            for py_file in self.project_dir.rglob('*.py'):
                rel_path = py_file.relative_to(self.project_dir)
                module_doc = extract_module_docstring(py_file)
                class_docs = extract_class_and_method_docstrings(py_file)
                
                if module_doc or class_docs:
                    parsed_data = {
                        'module_docstring': module_doc,
                        'class': class_docs.get('class') if class_docs else None,
                        'methods': class_docs.get('methods', []) if class_docs else []
                    }
                    generate_markdown(parsed_data, docs_dir, py_file)
            
            logging.info("Documentation generation completed")
            self.feedback_collector.collect_feedback("Documentation Tool")
            return True
            
        except Exception as e:
            logging.error(f"Documentation generation failed: {str(e)}")
            return False
    
    def run_code_quality_check(self) -> bool:
        """Run PEP 8 compliance check."""
        try:
            logging.info("Starting code quality check")
            checker = PEP8Checker()
            reporter = ConsoleReporter()
            
            python_files = list(str(p) for p in self.project_dir.rglob('*.py'))
            results = checker.check_files(python_files)
            reporter.report(results)
            
            logging.info(f"Code quality check completed with {results.total_errors} total issues")
            self.feedback_collector.collect_feedback("Code Quality Checker")
            return True
            
        except Exception as e:
            logging.error(f"Code quality check failed: {str(e)}")
            return False
    def run_test_suite(self) -> bool:
        """Run automated test suite."""
        try:
            logging.info("Starting test execution")
            
            from automated_test_runner.test_discovery import discover_test_files
            from automated_test_runner.enhanced_test_execution import run_tests
            
            # Discover test files
            test_files = discover_test_files(str(self.project_dir))
            
            # Run tests and collect results
            all_results = {}
            for test_file in test_files:
                file_path = self.project_dir / test_file
                results = run_tests(str(file_path))
                all_results[test_file] = results
            
            # Log results
            total_tests = sum(sum(r.values()) for r in all_results.values())
            total_passed = sum(r.get('passed', 0) for r in all_results.values())
            logging.info(f"Test execution completed: {total_passed}/{total_tests} tests passed")
            
            # Collect feedback
            self.feedback_collector.collect_feedback("Test Runner")
            
            return True
            
        except Exception as e:
            logging.error(f"Test execution failed: {str(e)}")
            return False
    
    def analyze_dependencies(self) -> bool:
        """Run dependency analysis."""
        try:
            logging.info("Starting dependency analysis")
            python_files = get_python_files(str(self.project_dir))
            
            # Read file contents
            file_contents = {}
            for file_path in python_files:
                with open(file_path, 'r') as f:
                    file_contents[file_path] = f.read()
            
            dependencies = analyze_project_dependencies_from_content(file_contents)
            visualize_dependencies(dependencies)
            
            logging.info("Dependency analysis completed")
            self.feedback_collector.collect_feedback("Dependency Analysis")
            return True
            
        except Exception as e:
            logging.error(f"Dependency analysis failed: {str(e)}")
            return False
    
    def aggregate_todos(self) -> bool:
        """Aggregate TODO and FIXME comments."""
        try:
            logging.info("Starting TODO/FIXME aggregation")
            comments_by_file = {}
            
            for py_file in self.project_dir.rglob('*.py'):
                with open(py_file, 'r') as f:
                    content = f.read()
                    
                comments = detect_todo_fixme_comments(content)
                if comments:
                    rel_path = py_file.relative_to(self.project_dir)
                    comments_by_file[str(rel_path)] = comments
            
            if comments_by_file:
                output_file = self.output_dir / 'todo_comments.md'
                generate_todo_markdown(comments_by_file, str(output_file))
            
            logging.info("TODO/FIXME aggregation completed")
            self.feedback_collector.collect_feedback("TODO Comment Aggregator")
            return True
            
        except Exception as e:
            logging.error(f"TODO/FIXME aggregation failed: {str(e)}")
            return False
    
    def run_workflow(self) -> None:
        """Execute the complete workflow."""
        logging.info("Starting workflow execution")
        
        # Dictionary to track tool execution status
        status = {
            "Documentation": self.run_documentation_tool(),
            "Code Quality": self.run_code_quality_check(),
            "Tests": self.run_test_suite(),
            "Dependencies": self.analyze_dependencies(),
            "TODOs": self.aggregate_todos()
        }
        
        # Print summary
        print("\n=== Workflow Execution Summary ===")
        for tool, success in status.items():
            print(f"{tool}: {'✓' if success else '✗'}")
        
        logging.info("Workflow execution completed")

def main():
    if len(sys.argv) != 3:
        print("Usage: python main_workflow.py <project_directory> <output_directory>")
        sys.exit(1)
    
    project_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    
    if not project_dir.exists():
        print(f"Error: Project directory '{project_dir}' does not exist.")
        sys.exit(1)
    
    workflow = WorkflowManager(project_dir, output_dir)
    workflow.run_workflow()

if __name__ == "__main__":
    main()
