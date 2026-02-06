# File Concatenation Tool Web Interface – Detailed Documentation

## Overview
This project extends an existing Python file‐concatenation tool by adding a web interface. It consists of two main components:
• A backend API (local only) built with FastAPI that exposes endpoints to:
 – List files in a given folder.
 – Concatenate selected files (with an optional folder tree) into a single delimited text.
• A frontend single‐page application (SPA) built with Vue.js (using TypeScript and Vite) that provides a user interface for:
 – Selecting files using both keyboard shortcuts and mouse checkboxes.
 – Sending requests to the backend API.
 – Displaying the concatenated result.

## Architecture Decisions
• **Backend:** Use FastAPI for its rapid development, automatic OpenAPI documentation, and built–in CORS middleware.
• **Frontend:** Use Vue.js with TypeScript (scaffolded with Vite) for a modern, reactive UI.
• **Testing & BDD:** Write BDD specifications in Gherkin (see features/file_concatenation.feature) so that deterministic tests can be automated (via pytest for the backend).
• **Deployment:** Local development only; can later be extended with Docker for production deployment.

## Tasks & BDD Specifications
1. **Backend API:**
 – GET `/api/files?folder=<path>`: List all files (relative paths) in the specified folder.
  – POST `/api/concatenate`: Accept a JSON body with:
   • project_path (absolute or relative)
   • selected_files (list of file paths relative to the project_path)
   • include_tree (boolean flag)
   Returns concatenated content (including a generated tree if requested).
2. **Frontend UI:**
 – Input for project path.
  – Display available files (populated by the GET API).
  – Checkbox selection (with “Select All” support).
  – Option to include the folder tree.
  – Button to trigger concatenation and display the result.
3. **BDD Spec:**
 – See the feature file below that describes a scenario where a user selects files and receives concatenated output.

## Running the Application
• **Backend:**
 1. Install dependencies: `pip install fastapi uvicorn`
 2. Run the API: `uvicorn api_server:app --reload`
• **Frontend:**
 1. In the “frontend” folder, run: `npm install`
 2. Start the dev server: `npm run dev` (default port 5173)
• The Vue app uses a proxy (configured in vite.config.ts) to forward API calls to the FastAPI backend.

## BDD Testing
BDD specifications are written in Gherkin (see features/file_concatenation.feature). Deterministic tests (e.g. using pytest) should verify that API endpoints behave as expected.

## Conclusion
This project demonstrates a full-stack file concatenation tool with a Python FastAPI backend and a Vue.js frontend. It provides a solid foundation for further development and automated testing using BDD principles.