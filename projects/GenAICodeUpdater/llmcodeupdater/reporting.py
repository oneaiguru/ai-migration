import os
import json
from datetime import datetime
from typing import Dict, Any
import logging
from llmcodeupdater.config import get_centralized_path

logger = logging.getLogger(__name__)

class ReportGenerator:
    def __init__(self):
        self.report_dir = get_centralized_path('reports')
        os.makedirs(self.report_dir, exist_ok=True)
        
    def _get_report_path(self, extension: str) -> str:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return os.path.join(self.report_dir, f'update_report_{timestamp}.{extension}')
        
    def generate_markdown_report(self, 
                               update_summary: Dict[str, Any],
                               task_summary: Dict[str, Any],
                               test_results: Dict[str, Any],
                               backup_timestamp: str) -> str:
        """Generate detailed markdown report of the update process."""
        report_path = self._get_report_path('md')
        
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("# Code Update Report\n\n")
                f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Backup Timestamp: {backup_timestamp}\n\n")
                
                # Update Statistics
                f.write("## Update Statistics\n")
                if update_summary['files_updated'] == 0 and update_summary['files_skipped'] == 0:
                    f.write("No files were updated during this process.\n")
                else:
                    f.write(f"- Files Updated: {update_summary['files_updated']}\n")
                    f.write(f"- Files Created: {update_summary.get('files_created', 0)}\n")
                    f.write(f"- Files Skipped: {update_summary['files_skipped']}\n")
                
                # Errors Section
                if update_summary.get('errors'):
                    f.write("\n## Errors\n")
                    for file, error in update_summary['errors'].items():
                        f.write(f"- {file}: {error}\n")
                
                # Task Progress
                if task_summary:
                    f.write("\n## Task Progress\n")
                    if all(v == 0 for v in task_summary.values() if isinstance(v, (int, float))):
                        f.write("No tasks were processed during this update.\n")
                    else:
                        f.write(f"- Total Tasks: {task_summary['total']}\n")
                        f.write(f"- Completed: {task_summary['updated']}\n")
                        f.write(f"- Pending: {task_summary['pending']}\n")
                        f.write(f"- Skipped: {task_summary['skipped']}\n")
                    
                    if 'performance' in task_summary:
                        perf = task_summary['performance']
                        f.write("\n### Performance Metrics\n")
                        f.write(f"- Average Processing Time: {perf['average_processing_time']:.2f}s\n")
                        f.write(f"- Maximum Processing Time: {perf['max_processing_time']:.2f}s\n")
                        f.write(f"- Total Processing Time: {perf['total_processing_time']:.2f}s\n")
                
                # Test Results
                if test_results:
                    f.write("\n## Test Results\n")
                    f.write(f"- Tests Passed: {'Yes' if test_results['tests_passed'] else 'No'}\n")
                    f.write(f"- Total Tests: {test_results['total_tests']}\n")
                    f.write(f"- Failed Tests: {test_results['failed_tests']}\n")
                    if test_results.get('test_output'):
                        f.write("\n### Test Output\n")
                        f.write("```\n")
                        f.write(test_results['test_output'])
                        f.write("\n```\n")
                
                # Update Details
                if update_summary.get('update_details'):
                    f.write("\n## File Details\n")
                    for detail in update_summary['update_details']:
                        f.write(f"\n### {os.path.basename(detail.new_path)}\n")
                        status = "Created" if detail.is_new_file else "Updated"
                        f.write(f"- Status: {status}\n")
                        if not detail.is_new_file:
                            f.write(f"- Size Change: {detail.old_size/1024:.1f}KB -> {detail.new_size/1024:.1f}KB\n")
                            f.write(f"- Lines: {detail.old_lines} -> {detail.new_lines}\n")
                            f.write(f"- Change Percentage: {detail.percent_change:.1f}%\n")
                
            return report_path
            
        except Exception as e:
            logger.error(f"Error generating markdown report: {str(e)}")
            raise

    def generate_json_report(self,
                           update_summary: Dict[str, Any],
                           task_summary: Dict[str, Any],
                           test_results: Dict[str, Any],
                           backup_timestamp: str) -> str:
        """Generate JSON report for programmatic consumption."""
        report_path = self._get_report_path('json')
        
        try:
            report_data = {
                'generated_at': datetime.now().isoformat(),
                'backup_timestamp': backup_timestamp,
                'update_summary': {
                    'files_updated': update_summary['files_updated'],
                    'files_created': update_summary.get('files_created', 0),
                    'files_skipped': update_summary['files_skipped'],
                    'errors': update_summary.get('errors', {})
                },
                'task_summary': task_summary,
                'test_results': test_results,
                'file_details': [
                    {
                        'path': detail.new_path,
                        'status': 'created' if detail.is_new_file else 'updated',
                        'old_size': detail.old_size,
                        'new_size': detail.new_size,
                        'old_lines': detail.old_lines,
                        'new_lines': detail.new_lines,
                        'percent_change': detail.percent_change
                    }
                    for detail in update_summary.get('update_details', [])
                ]
            }
            
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2)
                
            return report_path
            
        except Exception as e:
            logger.error(f"Error generating JSON report: {str(e)}")
            raise

    def generate_error_report(self, error_files: Dict[str, str]) -> str:
        """Generate a detailed error report including file creation attempts."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_path = os.path.join(self.report_dir, f'error_report_{timestamp}.txt')
        
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("Code Update Error Report\n")
                f.write("=" * 50 + "\n\n")
                
                if not error_files:
                    f.write("No errors were encountered during the update process.\n")
                else:
                    f.write(f"Total Errors: {len(error_files)}\n\n")
                    for file_path, error in error_files.items():
                        f.write(f"File: {file_path}\n")
                        f.write(f"Error: {error}\n")
                        f.write("-" * 50 + "\n")
                
            return report_path
            
        except Exception as e:
            logger.error(f"Error generating error report: {str(e)}")
            raise
