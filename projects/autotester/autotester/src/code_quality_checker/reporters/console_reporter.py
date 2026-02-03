class ConsoleReporter:
    def report(self, results):
        """Report code quality results to console."""
        print("\nPEP8 errors:", results.pep8_errors)

        if results.complexity_issues:
            print("\nComplexity issues:")
            print("-" * 40)
            for issue in results.complexity_issues:
                print(issue)

        if results.halstead_issues:
            print("\nHalstead issues:")
            print("-" * 40)
            for issue in results.halstead_issues:
                print(issue)

        if results.maintainability_issues:
            print("\nMaintainability issues:")
            print("-" * 40)
            for issue in results.maintainability_issues:
                print(issue)

        total = results.total_errors
        print(f"\nTotal issues: {total}")
