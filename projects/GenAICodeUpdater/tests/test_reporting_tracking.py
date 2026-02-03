import unittest
import os
import tempfile
import json
from datetime import datetime
from unittest.mock import patch
from llmcodeupdater.reporting import ReportGenerator
from llmcodeupdater import config

class TestReportGenerator(unittest.TestCase):
    def setUp(self):
        """Set up test environment with temporary directory and test data."""
        self.temp_dir = tempfile.mkdtemp()
        
        # Use patch to mock get_centralized_path before initializing ReportGenerator
        self.centralized_path_patcher = patch('llmcodeupdater.reporting.get_centralized_path', return_value=self.temp_dir)
        self.mock_get_centralized_path = self.centralized_path_patcher.start()
        
        # Initialize ReportGenerator after mock is in place
        self.report_generator = ReportGenerator()
        
        # Sample data for testing
        self.update_summary = {
            'files_updated': 5,
            'files_created': 2,
            'files_skipped': 2,
            'error_files': {
                'path/to/file1.py': 'Permission denied',
                'path/to/file2.py': 'Syntax error'
            }
        }
        
        self.task_summary = {
            'total': 10,
            'pending': 1,
            'updated': 5,
            'skipped': 2,
            'error': 2,
            'performance': {
                'average_processing_time': 0.5,
                'max_processing_time': 1.2,
                'total_processing_time': 5.0
            }
        }
        
        self.test_results = {
            'tests_passed': True,
            'total_tests': 15,
            'failed_tests': 0,
            'test_output': 'All tests passed successfully'
        }

    def tearDown(self):
        """Clean up temporary test files and directory."""
        self.centralized_path_patcher.stop()
        for file in os.listdir(self.temp_dir):
            os.remove(os.path.join(self.temp_dir, file))
        os.rmdir(self.temp_dir)

    def test_report_generator_default_path(self):
        """Test ReportGenerator uses centralized path by default."""
        # Ensure the mocked path is used
        self.mock_get_centralized_path.assert_called_once_with('reports')
        assert self.report_generator.report_dir == self.temp_dir
        assert os.path.exists(self.temp_dir)

    def test_generate_markdown_report(self):
        """Test markdown report generation with comprehensive assertions."""
        report_path = self.report_generator.generate_markdown_report(
            self.update_summary,
            self.task_summary,
            self.test_results,
            'backup_20241024'
        )
        
        self.assertTrue(os.path.exists(report_path))
        with open(report_path, 'r') as f:
            content = f.read()
            
            # Check report structure
            self.assertIn("# Code Update Report", content)
            self.assertIn("## Update Statistics", content)
            self.assertIn("## Task Progress", content)
            self.assertIn("## Test Results", content)
            
            # Verify update statistics
            self.assertIn("Files Updated: 5", content)
            self.assertIn("Files Created: 2", content)
            self.assertIn("Files Skipped: 2", content)
            
            # Verify task summary
            self.assertIn("Total Tasks: 10", content)
            self.assertIn("Pending: 1", content)
            self.assertIn("Completed: 5", content)
            
            # Verify performance metrics
            self.assertIn("### Performance Metrics", content)
            self.assertIn("Average Processing Time: 0.50s", content)
            self.assertIn("Maximum Processing Time: 1.20s", content)
            
            # Verify test results
            self.assertIn("Tests Passed: Yes", content)
            self.assertIn("Total Tests: 15", content)
            self.assertIn("Failed Tests: 0", content)

    def test_generate_json_report(self):
        """Test JSON report generation with data structure verification."""
        report_path = self.report_generator.generate_json_report(
            self.update_summary,
            self.task_summary,
            self.test_results,
            'backup_20241024'
        )
        
        self.assertTrue(os.path.exists(report_path))
        with open(report_path, 'r') as f:
            data = json.load(f)
            
            # Verify report structure
            self.assertIn('generated_at', data)
            self.assertIn('backup_timestamp', data)
            self.assertIn('update_summary', data)
            self.assertIn('task_summary', data)
            self.assertIn('test_results', data)
            
            # Verify update summary data
            self.assertEqual(data['update_summary']['files_updated'], 5)
            self.assertEqual(data['update_summary']['files_created'], 2)
            self.assertEqual(data['update_summary']['files_skipped'], 2)
            
            # Verify task summary data
            self.assertEqual(data['task_summary']['total'], 10)
            self.assertEqual(data['task_summary']['pending'], 1)
            self.assertEqual(data['task_summary']['updated'], 5)
            
            # Verify performance metrics
            self.assertEqual(data['task_summary']['performance']['average_processing_time'], 0.5)
            self.assertEqual(data['task_summary']['performance']['max_processing_time'], 1.2)

    def test_generate_error_report(self):
        """Test error report generation with content verification."""
        error_report_path = self.report_generator.generate_error_report(
            self.update_summary['error_files']
        )
        
        self.assertTrue(os.path.exists(error_report_path))
        with open(error_report_path, 'r') as f:
            content = f.read()
            self.assertIn("Code Update Error Report", content)
            self.assertIn("Total Errors: 2", content)
            self.assertIn("path/to/file1.py", content)
            self.assertIn("Permission denied", content)
            self.assertIn("path/to/file2.py", content)
            self.assertIn("Syntax error", content)

    def test_handle_empty_summaries(self):
        """Test report generation with empty data."""
        empty_summary = {
            'files_updated': 0,
            'files_created': 0,
            'files_skipped': 0,
            'error_files': {}
        }
        
        empty_task_summary = {
            'total': 0,
            'pending': 0,
            'updated': 0,
            'skipped': 0,
            'error': 0,
            'performance': {
                'average_processing_time': 0.0,
                'max_processing_time': 0.0,
                'total_processing_time': 0.0
            }
        }
        
        report_path = self.report_generator.generate_markdown_report(
            empty_summary,
            empty_task_summary,
            {'tests_passed': True, 'total_tests': 0, 'failed_tests': 0, 'test_output': ''},
            'backup_20241024'
        )
        
        self.assertTrue(os.path.exists(report_path))
        with open(report_path, 'r') as f:
            content = f.read()
            self.assertIn("No files were updated", content)
            self.assertIn("No tasks were processed", content)

if __name__ == '__main__':
    unittest.main()