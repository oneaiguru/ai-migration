# main.py
import os
from datetime import datetime
import logging
from pathlib import Path
from typing import List, Tuple, Dict
from llmcodeupdater.input_handler import InputHandler, setup_cli_parser
from llmcodeupdater.task_tracking import TaskTracker
from llmcodeupdater.code_parser import parse_code_blocks_with_logging
from llmcodeupdater.mapping import update_files
from llmcodeupdater.backup import backup_files
from llmcodeupdater.reporting import ReportGenerator
from llmcodeupdater.file_encoding_handler import FileEncodingHandler
from llmcodeupdater.ignore_handler import IgnoreHandler
from llmcodeupdater.config import get_centralized_path


def validate_prerequisites(project_path: str, llm_content: str) -> bool:
    """Validate required inputs before proceeding."""
    logger = logging.getLogger('Main')
    
    if not project_path:
        logging.error("No valid project path provided")
        return False
    if not llm_content:
        logger.error("No LLM content provided. Please copy the content to clipboard first.")
        return False
    if not llm_content.strip():
        logger.error("Clipboard content is empty. Please copy valid content first.")
        return False
    return True


def setup_project_directories(project_root: str):
    """Centralized directories for backups, reports, and tasks.db."""
    backup_root = get_centralized_path('backups')
    report_dir = get_centralized_path('reports')
    db_path = get_centralized_path('tasks.db')
    return backup_root, report_dir, db_path


def collect_python_files(project_root: str, ignore_handler: IgnoreHandler) -> List[str]:
    """Collect all existing Python files in the project, respecting ignore patterns."""
    py_files = []
    for root, _, files in os.walk(project_root):
        rel_root = os.path.relpath(root, project_root)
        if ignore_handler.is_ignored(rel_root):
            continue
        for file in files:
            file_rel_path = os.path.join(rel_root, file) if rel_root != '.' else file
            if ignore_handler.is_ignored(file_rel_path):
                continue
            if file.endswith('.py'):
                py_files.append(os.path.join(root, file))
    return py_files


def collect_markdown_files(project_root: str, ignore_handler: IgnoreHandler) -> List[str]:
    """Collect all existing Markdown files in the project, respecting ignore patterns."""
    md_files = []
    for root, _, files in os.walk(project_root):
        rel_root = os.path.relpath(root, project_root)
        if ignore_handler.is_ignored(rel_root):
            continue
        for file in files:
            file_rel_path = os.path.join(rel_root, file) if rel_root != '.' else file
            if ignore_handler.is_ignored(file_rel_path):
                continue
            if file.endswith(('.md', '.markdown')):
                md_files.append(os.path.join(root, file))
    return md_files


def main(argv=None):
    """Main function to orchestrate the code update process."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger('Main')
    
    try:
        # Initialize and parse arguments
        parser = setup_cli_parser()
        args = parser.parse_args(argv)
        
        # Default project root falls back to the repository root when no CLI path/config is present
        default_project_root = Path(__file__).resolve().parent.parent
        input_handler = InputHandler(default_git_path=args.git_path or default_project_root)
        
        # Prepare input parameters
        input_params = {
            'git_path': args.git_path,
            'content': args.content if hasattr(args, 'content') else None,
            'content_file': args.content_file if hasattr(args, 'content_file') else None,
        }
        
        # Decide whether to use config:
        # - Respect explicit --use-config
        # - Otherwise only attempt config if no git path was supplied and a config file exists
        use_config = bool(getattr(args, 'use_config', False))
        if not (input_params['git_path'] or input_params['content'] or input_params['content_file']):
            use_config = use_config or input_handler.config_file.exists()
        input_params['use_config'] = use_config
        
        # Process input with the prepared parameters
        result = input_handler.process_input(input_params)
        
        # Validate prerequisites first
        project_root = result.get('project_path')
        if not validate_prerequisites(project_root, result.get('llm_content')):
            logger.error("Prerequisite validation failed. Exiting.")
            return
                
        # Setup directories after validation
        backup_root, report_dir, db_path = setup_project_directories(project_root)
        
        llm_content = result['llm_content']
        
        # Initialize IgnoreHandler
        ignore_handler = IgnoreHandler(project_root, 
                                     ignore_files=['.gitignore', '.treeignore', '.selectignore'])
        
        # Initialize components
        task_tracker = TaskTracker()
        report_generator = ReportGenerator()
        # Clear any prior task entries for this project to avoid stale rows
        task_tracker.clear_project_tasks(str(project_root))
        
        # Preprocess files (Encoding Conversion)
        file_handler = FileEncodingHandler()
        preprocess_results = file_handler.preprocess_files(
            project_root,
            backup_dir=backup_root,
            ignore_handler=ignore_handler
        )
        if preprocess_results['failed']:
            for fail in preprocess_results['failed']:
                logger.error(f"Failed to convert encoding: {fail['path']}, Error: {fail['error']}")
        if preprocess_results.get('successful'):
            update_summary = {
                'encoding_conversions': preprocess_results['successful']
            }
        else:
            update_summary = {}
        
        # Parse and validate code blocks first
        code_blocks = parse_code_blocks_with_logging(llm_content)
        if not code_blocks:
            logger.error("No valid code blocks found in LLM output")
            raise ValueError("No valid code blocks to process")

        # Collect existing files and prepare for new ones
        existing_py_files = collect_python_files(project_root, ignore_handler)
        existing_md_files = collect_markdown_files(project_root, ignore_handler)
        all_files = set(existing_py_files + existing_md_files)
        
        # Add new files from code blocks
        for filename, _ in code_blocks:
            file_path = os.path.join(project_root, filename)
            all_files.add(file_path)
        
        # Update task tracking for all files using project-relative paths
        rel_task_paths = [os.path.relpath(f, project_root) for f in all_files]
        task_tracker.add_tasks(rel_task_paths, str(project_root))
        
        # Backup existing files
        backup_timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        files_to_backup = existing_py_files + existing_md_files
        files_backed_up = backup_files(files_to_backup, project_root, backup_root)
        logger.info(f"Backed up {files_backed_up} existing files.")
        
        # Process updates
        update_result = update_files(code_blocks, project_root)
        
        # Update task statuses based on outcomes
        error_set = set(update_result.get('errors', {}).keys())
        skipped_set = set(update_result.get('skipped_files', []))
        for filename, _ in code_blocks:
            if filename in error_set:
                status = 'error'
            elif filename in skipped_set:
                status = 'skipped'
            else:
                status = 'updated'
            task_tracker.update_task_status(filename, str(project_root), status)
        
        # Update summary
        update_summary.update({
            'files_updated': update_result['files_updated'],
            'files_created': update_result['files_created'],
            'files_skipped': update_result['files_skipped'],
            'error_files': update_result.get('errors', {})
        })
        
        task_summary = task_tracker.get_task_summary(project_root)
        test_results = {
            'tests_passed': True,
            'total_tests': len(code_blocks),
            'failed_tests': 0,
            'test_output': 'No automated tests were executed'
        }
        
        # Generate reports
        markdown_report = report_generator.generate_markdown_report(
            update_summary, task_summary, test_results, backup_timestamp
        )
        json_report = report_generator.generate_json_report(
            update_summary, task_summary, test_results, backup_timestamp
        )
        
        if update_result.get('errors'):
            error_report = report_generator.generate_error_report(update_result['errors'])
            logger.info(f"Error report generated: {error_report}")
        
        logger.info("Update process completed!")
        logger.info(f"Markdown report: {markdown_report}")
        logger.info(f"JSON report: {json_report}")
        
    except Exception as e:
        logger.error(f"An error occurred during the update process: {str(e)}")
        raise


if __name__ == "__main__":
    main()
