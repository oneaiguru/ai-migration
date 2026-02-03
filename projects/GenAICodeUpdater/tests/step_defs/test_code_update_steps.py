from behave import given, when, then
import os

@then('reports should be generated appropriately')
def verify_reports_generated(context):
    """Verify that reports are generated."""
    assert context.get('update_success', False), "Update process failed, reports not generated"
    report_dir = context['report_dir']
    assert os.path.exists(report_dir), "Report directory does not exist"

    # Add retry logic with timeout for report generation
    import time
    timeout = 5  # seconds
    start_time = time.time()

    while time.time() - start_time < timeout:
        # Check for markdown and JSON reports
        markdown_reports = [f for f in os.listdir(report_dir) if f.endswith('.md')]
        json_reports = [f for f in os.listdir(report_dir) if f.endswith('.json')]

        if markdown_reports and json_reports:
            # Verify report contents
            md_path = os.path.join(report_dir, markdown_reports[0])
            json_path = os.path.join(report_dir, json_reports[0])

            assert os.path.getsize(md_path) > 0, "Markdown report is empty"
            assert os.path.getsize(json_path) > 0, "JSON report is empty"
            return

        time.sleep(0.1)  # Short sleep between checks

    # If we get here, the timeout was reached
    assert False, f"Reports not generated after {timeout} seconds. Found files: {os.listdir(report_dir)}"