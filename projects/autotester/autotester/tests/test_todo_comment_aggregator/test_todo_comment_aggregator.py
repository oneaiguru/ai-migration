from pathlib import Path
import unittest
from src.todo_comment_aggregator.todo_comment_aggregator import detect_todo_fixme_comments, generate_todo_markdown

sample_file_content = """
# Sample file with TODOs and FIXMEs
def example_function():
    # TODO: Refactor this function
    pass
class ExampleClass:
    def example_method(self):
        # FIXME: Handle edge cases
        # TODO: Add more details
        pass
"""

class TestTODOCommentAggregator(unittest.TestCase):
    
    def test_detect_comments(self):
        result = detect_todo_fixme_comments(sample_file_content)
        expected_output = [
            {'type': 'TODO', 'line': 4, 'content': 'Refactor this function'},
            {'type': 'FIXME', 'line': 8, 'content': 'Handle edge cases'},
            {'type': 'TODO', 'line': 9, 'content': 'Add more details'}
        ]
        self.assertEqual(result, expected_output)

    def test_generate_markdown(self):
        comments_by_file = {
            "sample_file.py": [
                {'type': 'TODO', 'line': 4, 'content': 'Refactor this function'},
                {'type': 'FIXME', 'line': 9, 'content': 'Handle edge cases'}
            ]
        }
        output_path = "test_output.md"
        generate_todo_markdown(comments_by_file, output_path)
        with open(output_path, 'r') as f:
            content = f.read()
        self.assertIn("## File: sample_file.py", content)
        self.assertIn("- Line 4: TODO - Refactor this function", content)
        Path(output_path).unlink()  # Clean up

# Running the tests
if __name__ == "__main__":
    unittest.main()
