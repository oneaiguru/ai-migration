
import unittest
from result_assembly import ResultAssembly


class TestResultAssembly(unittest.TestCase):
    def setUp(self) -> None:
        """Set up mock data for testing."""
        self.assembler = ResultAssembly()
        self.valid_chunks = [
            {"index": 0, "text": "Hello"},
            {"index": 1, "text": "world!"},
            {"index": 2, "text": "This"},
            {"index": 3, "text": "is"},
            {"index": 4, "text": "a test."},
        ]

    def test_correct_assembly_order(self):
        """Test assembling transcript from correctly ordered chunks."""
        result = self.assembler.assemble_transcript(self.valid_chunks)
        self.assertEqual(result, "Hello world! This is a test.")

    def test_empty_chunks(self):
        """Test handling of empty input."""
        with self.assertRaises(ValueError):
            self.assembler.assemble_transcript([])
