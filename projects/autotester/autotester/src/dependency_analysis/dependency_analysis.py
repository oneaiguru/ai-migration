
import os
import ast
import sys
from typing import List, Set, Dict
import networkx as nx
import matplotlib.pyplot as plt

def get_python_files(directory: str) -> List[str]:
    python_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    return python_files

def visualize_dependencies(dependencies: Dict[str, Set[str]]) -> None:
    """
    Visualize project dependencies using networkx and matplotlib.
    
    Args:
        dependencies: Dictionary mapping module names to their dependencies
    """
    import networkx as nx
    import matplotlib.pyplot as plt
    
    # Create directed graph
    graph = nx.DiGraph()
    
    # Add nodes and edges
    for module, deps in dependencies.items():
        if not graph.has_node(module):
            graph.add_node(module)
        for dep in deps:
            if dep and dep != module:  # Avoid self-loops and empty dependencies
                if not graph.has_node(dep):
                    graph.add_node(dep)
                graph.add_edge(module, dep)
    
    # Set up the plot
    plt.figure(figsize=(12, 8))
    
    # Use spring layout for node positioning
    pos = nx.spring_layout(graph, k=1, iterations=50)
    
    # Draw the graph
    nx.draw(graph, pos,
            with_labels=True,
            node_color='lightblue',
            node_size=2000,
            font_size=8,
            font_weight='bold',
            arrows=True,
            edge_color='gray',
            arrowsize=20)
    
    # Add title
    plt.title("Module Dependencies", pad=20)
    
    # Show the plot
    plt.tight_layout()
    plt.show()

def extract_imports_from_content(file_content: str) -> Set[str]:
    imports = set()
    node = ast.parse(file_content)
    stdlib_modules = sys.stdlib_module_names if hasattr(sys, "stdlib_module_names") else set()

    for n in ast.walk(node):
        if isinstance(n, ast.Import):
            for alias in n.names:
                top = alias.name.split('.')[0]
                if top and top not in stdlib_modules:
                    imports.add(top)
        elif isinstance(n, ast.ImportFrom):
            if n.module:
                top = n.module.split('.')[0]
                if top and top not in stdlib_modules:
                    imports.add(top)

    return imports

def analyze_project_dependencies_from_content(files: Dict[str, str]) -> Dict[str, Set[str]]:
    dependencies = {}
    for filename, content in files.items():
        module_name = filename.split('.')[0]
        dependencies[module_name] = extract_imports_from_content(content)
    return dependencies
