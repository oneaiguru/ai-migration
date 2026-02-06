import pycodestyle
from typing import List, Dict, Any
from radon.complexity import cc_visit
from radon.metrics import h_visit
from radon.raw import analyze

class CodeQualityReport:
    def __init__(self):
        self.pep8_errors = 0
        self.complexity_issues = []
        self.maintainability_issues = []
        self.halstead_issues = []

    @property
    def has_issues(self) -> bool:
        return (self.pep8_errors > 0 or 
                len(self.complexity_issues) > 0 or 
                len(self.maintainability_issues) > 0 or
                len(self.halstead_issues) > 0)

    @property
    def total_errors(self) -> int:
        """Aggregate error count across all checks."""
        return (
            self.pep8_errors
            + len(self.complexity_issues)
            + len(self.maintainability_issues)
            + len(self.halstead_issues)
        )

class PEP8Checker:
    def __init__(self, 
                 max_line_length: int = 79,
                 max_complexity: int = 7,
                 max_halstead_volume: int = 250,
                 max_loc: int = 20):
        self.style_guide = pycodestyle.StyleGuide(
            max_line_length=max_line_length,
            quiet=True
        )
        self.max_complexity = max_complexity
        self.max_halstead_volume = max_halstead_volume
        self.max_loc = max_loc

    def check_files(self, files: List[str]) -> CodeQualityReport:
        """Check files for PEP8 compliance and code quality metrics."""
        report = CodeQualityReport()
        
        # PEP8 Check
        pep8_result = self.style_guide.check_files(files)
        report.pep8_errors = pep8_result.total_errors

        # Additional metrics for each file
        for file_path in files:
            try:
                with open(file_path, 'r') as f:
                    code = f.read()
                    self._check_complexity(code, file_path, report)
                    self._check_halstead_metrics(code, file_path, report)
                    self._check_maintainability(code, file_path, report)
            except Exception as e:
                report.maintainability_issues.append(
                    f"Error analyzing {file_path}: {str(e)}"
                )

        return report

    def _check_complexity(self, code: str, file_path: str, report: CodeQualityReport) -> None:
        """Check cyclomatic complexity."""
        try:
            complexity_results = cc_visit(code)
            for item in complexity_results:
                if item.complexity > self.max_complexity:
                    report.complexity_issues.append(
                        f"{file_path}: Function '{item.name}' has complexity of {item.complexity} (max allowed: {self.max_complexity})"
                    )
        except Exception as e:
            report.complexity_issues.append(f"Error analyzing complexity in {file_path}: {str(e)}")

    def _check_halstead_metrics(self, code: str, file_path: str, report: CodeQualityReport) -> None:
        """Check Halstead metrics."""
        try:
            h_metrics = h_visit(code)
            if h_metrics.total.volume > self.max_halstead_volume:
                report.halstead_issues.append(
                    f"{file_path}: Halstead volume is too high, consider simplifying the code "
                    f"(current {h_metrics.total.volume:.2f}, max allowed: {self.max_halstead_volume})"
                )
        except Exception as e:
            report.halstead_issues.append(f"Error analyzing Halstead metrics in {file_path}: {str(e)}")

    def _check_maintainability(self, code: str, file_path: str, report: CodeQualityReport) -> None:
        """Check basic maintainability metrics (raw counts)."""
        try:
            metrics = analyze(code)
            if metrics.loc > self.max_loc:
                report.maintainability_issues.append(
                    f"{file_path}: LOC {metrics.loc} exceeds max allowed {self.max_loc}"
                )
        except Exception as e:
            report.maintainability_issues.append(f"Error analyzing maintainability in {file_path}: {str(e)}")
