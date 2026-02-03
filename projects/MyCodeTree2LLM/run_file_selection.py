#!/usr/bin/env python3

from src.fileselect.main import FileSelectionApp

# Specify the project directory you want to use
project_directory = "~/git/personal/active_project_manager/"  # Change this to your desired project path

# Initialize and run the FileSelectionApp
app = FileSelectionApp(project_directory)
app.run()
