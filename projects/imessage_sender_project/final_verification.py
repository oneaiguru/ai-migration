#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Final verification script for iMessage Sender
This script runs a series of checks to ensure all components of the
iMessage Sender are working properly before client delivery.
"""

import os
import sys
import time
import subprocess
import platform
import importlib.util
from datetime import datetime

# Check what components we have access to
def check_component(module_name):
    """Check if a module can be imported"""
    try:
        spec = importlib.util.find_spec(module_name)
        return spec is not None
    except ImportError:
        return False

def run_command(command):
    """Run a shell command and return the output"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_environment():
    """Check the environment to ensure all requirements are met"""
    results = {
        "system": platform.system(),
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "modules": {},
        "dependencies": {}
    }
    
    # Required modules
    required_modules = [
        "config", "contact_manager", "imessage_sender", 
        "logger", "message_template"
    ]
    
    for module in required_modules:
        results["modules"][module] = check_component(module)
    
    # Check external dependencies
    dependencies = [
        "pandas", "jinja2", "PyQt5"
    ]
    
    for dep in dependencies:
        results["dependencies"][dep] = check_component(dep)
    
    # Check system-specific requirements
    if platform.system() == "Darwin":
        # Check for Messages.app
        messages_path = "/Applications/Messages.app"
        results["messages_app"] = os.path.exists(messages_path)
    else:
        results["messages_app"] = False
        
    return results

def create_verification_report(results):
    """Create a verification report"""
    # Create report directory
    report_dir = "reports"
    os.makedirs(report_dir, exist_ok=True)
    
    # Create report file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(report_dir, f"verification_report_{timestamp}.html")
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("<!DOCTYPE html>\n")
        f.write("<html>\n<head>\n")
        f.write("<meta charset='utf-8'>\n")
        f.write("<title>iMessage Sender Verification Report</title>\n")
        f.write("<style>\n")
        f.write("body { font-family: Arial, sans-serif; margin: 20px; }\n")
        f.write("h1, h2 { color: #333; }\n")
        f.write("table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }\n")
        f.write("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n")
        f.write("th { background-color: #f2f2f2; }\n")
        f.write("tr:nth-child(even) { background-color: #f9f9f9; }\n")
        f.write(".pass { color: green; }\n")
        f.write(".fail { color: red; }\n")
        f.write(".warn { color: orange; }\n")
        f.write("</style>\n")
        f.write("</head>\n<body>\n")
        
        # Header
        f.write(f"<h1>iMessage Sender Verification Report</h1>\n")
        f.write(f"<p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>\n")
        
        # System Information
        f.write("<h2>System Information</h2>\n")
        f.write("<table>\n")
        f.write("<tr><th>Component</th><th>Value</th></tr>\n")
        f.write(f"<tr><td>Operating System</td><td>{results['system']}</td></tr>\n")
        f.write(f"<tr><td>Python Version</td><td>{results['python_version']}</td></tr>\n")
        
        if "messages_app" in results:
            status = "pass" if results["messages_app"] else "fail"
            f.write(f"<tr><td>Messages.app</td><td class='{status}'>{results['messages_app']}</td></tr>\n")
            
        f.write("</table>\n")
        
        # Core Modules
        f.write("<h2>Core Modules</h2>\n")
        f.write("<table>\n")
        f.write("<tr><th>Module</th><th>Status</th></tr>\n")
        
        for module, status in results["modules"].items():
            status_class = "pass" if status else "fail"
            status_text = "Available" if status else "Missing"
            f.write(f"<tr><td>{module}</td><td class='{status_class}'>{status_text}</td></tr>\n")
            
        f.write("</table>\n")
        
        # Dependencies
        f.write("<h2>External Dependencies</h2>\n")
        f.write("<table>\n")
        f.write("<tr><th>Package</th><th>Status</th></tr>\n")
        
        for dep, status in results["dependencies"].items():
            status_class = "pass" if status else "fail"
            status_text = "Installed" if status else "Missing"
            f.write(f"<tr><td>{dep}</td><td class='{status_class}'>{status_text}</td></tr>\n")
            
        f.write("</table>\n")
        
        # Test Results
        if "tests" in results:
            f.write("<h2>Test Results</h2>\n")
            f.write("<table>\n")
            f.write("<tr><th>Test</th><th>Result</th><th>Details</th></tr>\n")
            
            for test, details in results["tests"].items():
                status_class = "pass" if details["success"] else "fail"
                status_text = "Passed" if details["success"] else "Failed"
                f.write(f"<tr><td>{test}</td><td class='{status_class}'>{status_text}</td><td>{details.get('message', '')}</td></tr>\n")
                
            f.write("</table>\n")
        
        # Summary and Recommendations
        f.write("<h2>Summary and Recommendations</h2>\n")
        
        # Count failures
        failures = 0
        for module, status in results["modules"].items():
            if not status:
                failures += 1
                
        for dep, status in results["dependencies"].items():
            if not status:
                failures += 1
        
        if "messages_app" in results and not results["messages_app"]:
            failures += 1
        
        if failures == 0:
            f.write("<p class='pass'>✓ All components are available and properly configured.</p>\n")
            f.write("<p>The iMessage Sender is ready for deployment!</p>\n")
        else:
            f.write(f"<p class='warn'>⚠ Found {failures} issue(s) that need to be resolved.</p>\n")
            
            f.write("<ul>\n")
            for module, status in results["modules"].items():
                if not status:
                    f.write(f"<li class='fail'>Core module '{module}' is missing</li>\n")
            
            for dep, status in results["dependencies"].items():
                if not status:
                    f.write(f"<li class='fail'>Dependency '{dep}' is not installed. Run: pip install {dep}</li>\n")
            
            if "messages_app" in results and not results["messages_app"]:
                f.write("<li class='fail'>Messages.app not found. The application requires macOS with Messages.app installed</li>\n")
            
            f.write("</ul>\n")
        
        f.write("<h3>Final Checklist for Client Delivery:</h3>\n")
        f.write("<ol>\n")
        f.write("<li>Ensure all requirements are installed: <code>pip install -r requirements.txt</code></li>\n")
        f.write("<li>Run unit tests: <code>python test_cli.py --run-all</code></li>\n")
        f.write("<li>Test with mock mode: <code>python test_files/send_test_message.py +79161234567 --mock</code></li>\n")
        f.write("<li>Create final package: <code>python test_files/prepare_deployment.py --version 1.0.0</code></li>\n")
        f.write("<li>Verify the GUI functionality using the GUI testing checklist</li>\n")
        f.write("<li>Provide client with usage instructions and testing approach</li>\n")
        f.write("</ol>\n")
        
        f.write("</body>\n</html>")
    
    print(f"Verification report created: {report_path}")
    return report_path

def run_verification():
    """Run all verification checks"""
    print("Starting iMessage Sender verification...")
    
    # Check environment
    print("Checking environment...")
    env_results = check_environment()
    
    # Perform some basic tests if all core modules are available
    if all(env_results["modules"].values()):
        print("All core modules available, running basic tests...")
        tests_results = {}
        
        # Test message template rendering
        if check_component("message_template"):
            try:
                from message_template import MessageTemplate
                template = MessageTemplate()
                template.set_template("Hello, {{ name }}!")
                rendered = template.render({"name": "Test"})
                success = rendered == "Hello, Test!"
                tests_results["message_template"] = {
                    "success": success,
                    "message": f"Rendered: '{rendered}'"
                }
            except Exception as e:
                tests_results["message_template"] = {
                    "success": False,
                    "message": f"Error: {str(e)}"
                }
        
        # Add test results to overall results
        env_results["tests"] = tests_results
    
    # Create report
    report_path = create_verification_report(env_results)
    
    # Open report if on macOS
    if platform.system() == "Darwin":
        subprocess.run(["open", report_path])
    
    return env_results

if __name__ == "__main__":
    results = run_verification()
    sys.exit(0 if all(results["modules"].values()) else 1)