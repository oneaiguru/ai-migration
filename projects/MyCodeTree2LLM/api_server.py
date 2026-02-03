from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import subprocess
import tempfile
import os

app = FastAPI(title="File Concatenation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConcatRequest(BaseModel):
    project_path: str
    selected_files: list[str]
    include_tree: bool = False

@app.get("/api/files")
def list_files(folder: str = Query(..., description="Folder path to list files from")):
    folder_path = Path(folder).expanduser().resolve()
    if not folder_path.exists() or not folder_path.is_dir():
        raise HTTPException(status_code=400, detail="Invalid folder path")
    files = [str(file.relative_to(folder_path)) for file in folder_path.rglob("*") if file.is_file()]
    return {"files": files}

@app.post("/api/concatenate")
def concatenate_files(request: ConcatRequest):
    project_path = Path(request.project_path).expanduser().resolve()
    if not project_path.exists() or not project_path.is_dir():
        raise HTTPException(status_code=400, detail="Invalid project path")
    output_content = ""
    if request.include_tree:
        with tempfile.TemporaryDirectory() as tmpdirname:
            tree_file = Path(tmpdirname) / "tree.txt"
            try:
                # Assumes folder_structure_generator.py is available in the same directory
                cmd = ["python", "folder_structure_generator.py", str(project_path), "--output", str(tree_file)]
                subprocess.run(cmd, check=True)
                with open(tree_file, "r", encoding="utf-8") as f:
                    tree_content = f.read()
                output_content += f"# tree.txt\n{tree_content}\n"
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate tree structure: {e}")
    for rel_file in request.selected_files:
        file_path = project_path / rel_file
        if file_path.exists() and file_path.is_file():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                output_content += f"# {rel_file}\n{content}\n"
            except Exception:
                continue
        else:
            continue
    return {"concatenated_content": output_content}