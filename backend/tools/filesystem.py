import os
from langchain_core.tools import tool
from typing import List

# Restrict file operations to the current working directory for safety
ROOT_DIR = os.getcwd()

@tool
def list_directory(path: str = ".") -> str:
    """
    List files and directories in the given path (relative to project root).
    """
    try:
        abs_path = os.path.abspath(os.path.join(ROOT_DIR, path))
        if not abs_path.startswith(ROOT_DIR):
            return "Error: Access denied (outside project root)."
            
        if not os.path.exists(abs_path):
            return f"Error: Path '{path}' does not exist."
            
        items = os.listdir(abs_path)
        return "\n".join(items) if items else "(empty directory)"
    except Exception as e:
        return f"Error listing directory: {e}"

@tool
def read_file(path: str) -> str:
    """
    Read the contents of a file.
    """
    try:
        abs_path = os.path.abspath(os.path.join(ROOT_DIR, path))
        if not abs_path.startswith(ROOT_DIR):
            return "Error: Access denied (outside project root)."
            
        with open(abs_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"

@tool
def write_file(path: str, content: str) -> str:
    """
    Write content to a file. Creates the file if it doesn't exist.
    WARNING: Overwrites existing files.
    """
    try:
        abs_path = os.path.abspath(os.path.join(ROOT_DIR, path))
        if not abs_path.startswith(ROOT_DIR):
            return "Error: Access denied (outside project root)."
            
        # Ensure parent dirs exist
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Successfully wrote to '{path}'."
    except Exception as e:
        return f"Error writing file: {e}"
