
from autotester.src.feedback.feedback_collector import FeedbackCollector

import ast
from pathlib import Path
from typing import Optional, Dict, Tuple, List

def extract_module_docstring(file_path: Path) -> Optional[str]:
    """Extracts the module-level docstring from a Python file."""
    with file_path.open("r", encoding="utf-8") as file:
        try:
            tree = ast.parse(file.read(), filename=str(file_path))
            return ast.get_docstring(tree)
        except SyntaxError:
            return None

def extract_class_and_method_docstrings(file_path: Path) -> Optional[Dict[str, Optional[Dict[str, str]]]]:
    """Extracts class names and their method docstrings from a Python file."""
    with file_path.open("r", encoding="utf-8") as file:
        try:
            tree = ast.parse(file.read(), filename=str(file_path))
            classes_info: List[Dict[str, Optional[Dict[str, str]]]] = []
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    class_name = node.name
                    class_docstring = ast.get_docstring(node)
                    methods_info = []
                    for class_body_node in node.body:
                        if isinstance(class_body_node, ast.FunctionDef):
                            method_name = class_body_node.name
                            method_docstring = ast.get_docstring(class_body_node)
                            methods_info.append({"name": method_name, "docstring": method_docstring})
                    classes_info.append(
                        {
                            "class": {"name": class_name, "docstring": class_docstring},
                            "methods": methods_info,
                        }
                    )

            if not classes_info:
                return None

            # Preserve backward compatibility by returning the first class/methods,
            # and include all classes in a list for callers that need them.
            return {
                "class": classes_info[0]["class"],
                "methods": classes_info[0]["methods"],
                "classes": classes_info,
            }
        except SyntaxError:
            return None

def collect_user_feedback(feedback_collector: FeedbackCollector, file_path: Path) -> None:
    """
    Collect user feedback about the documentation generation process.
    
    Args:
        feedback_collector: Instance of FeedbackCollector to store feedback
        file_path: Path of the source file being documented
    """
    print(f"\nFeedback for documentation of {file_path.name}:")
    print("-" * 50)
    
    # Get success/failure feedback
    while True:
        response = input("Was the documentation generation successful? (yes/no): ").lower()
        if response in ['yes', 'no']:
            break
        print("Please enter 'yes' or 'no'")
    
    # Get improvement suggestions
    suggestions = input("Any comments or suggestions for the documentation? (press Enter to skip): ")
    
    # Store feedback
    feedback_collector.collect_feedback(
        component="Documentation Tool",
        file_name="Documentation Generation",
        feedback_type="Success" if response == "yes" else "Improvement Suggestion",
        comments=suggestions if suggestions else None
    )

def generate_markdown(
    parsed_data: dict,
    output_dir: Path,
    source_file: Path,
    feedback_collector: Optional[FeedbackCollector] = None
) -> Tuple[Path, bool]:
    """
    Generates a Markdown file based on parsed docstring data and collects feedback.
    
    Args:
        parsed_data: Dictionary containing parsed documentation data
        output_dir: Directory where markdown files will be saved
        source_file: Source Python file being documented
        feedback_collector: Optional FeedbackCollector instance for feedback collection
    
    Returns:
        Tuple of (output_file_path, success_status)
    """
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file_path = output_dir / (source_file.stem + ".md")
        
        with output_file_path.open("w") as md_file:
            if "module_docstring" in parsed_data:
                md_file.write(f"# {source_file.stem}\n\n")
                md_file.write(f"{parsed_data['module_docstring']}\n\n")
            
            class_info = parsed_data.get("class")
            if class_info:
                md_file.write(f"## Class: {class_info['name']}\n\n")
                md_file.write(f"{class_info['docstring']}\n\n")
                
                for method_info in parsed_data.get("methods", []):
                    md_file.write(f"### Method: {method_info['name']}\n\n")
                    md_file.write(f"{method_info['docstring']}\n\n")
        
        print(f"Documentation generated successfully: {output_file_path}")
        
        # Collect feedback if collector is provided
        if feedback_collector is not None:
            collect_user_feedback(feedback_collector, source_file)
        
        return output_file_path, True
        
    except Exception as e:
        print(f"Error generating documentation for {source_file}: {str(e)}")
        if feedback_collector is not None:
            feedback_collector.collect_feedback(
                component="Documentation Tool",
                file_name="Documentation Generation",
                feedback_type="Error",
                comments=f"Error during generation: {str(e)}"
            )
        return output_dir / (source_file.stem + ".md"), False

def process_python_file(
    file_path: Path,
    output_dir: Path,
    feedback_collector: Optional[FeedbackCollector] = None
) -> Tuple[Path, bool]:
    """
    Process a single Python file to generate documentation with feedback collection.
    
    Args:
        file_path: Path to the Python file
        output_dir: Directory where documentation will be saved
        feedback_collector: Optional FeedbackCollector instance for feedback collection
    
    Returns:
        Tuple of (output_file_path, success_status)
    """
    module_doc = extract_module_docstring(file_path)
    class_docs = extract_class_and_method_docstrings(file_path)
    
    if module_doc or class_docs:
        parsed_data = {
            'module_docstring': module_doc,
            'class': class_docs.get('class') if class_docs else None,
            'methods': class_docs.get('methods', []) if class_docs else []
        }
        return generate_markdown(parsed_data, output_dir, file_path, feedback_collector)
    
    return output_dir / (file_path.stem + ".md"), False
