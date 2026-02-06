# llmcodeupdater/code_parser.py
import re
import logging
from typing import Dict, List, Optional, Set, Tuple, Any
from dataclasses import dataclass
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CodeBlock:
    filename: str
    content: str
    context_before: str = ""
    context_after: str = ""
    project_path: Optional[str] = None
    file_type: str = "unknown"
    line_number: Optional[int] = None
    
    @property
    def line_count(self) -> int:
        """Count non-empty lines in content."""
        return len([line for line in self.content.splitlines() if line.strip()])
    
    @property
    def has_imports(self) -> bool:
        """Check if Python file has required imports."""
        if self.file_type != "python":
            return True
        # Look for import statements at file or function level
        return bool(re.search(r'(?:^|\n)\s*(?:import|from)\s+\w+', self.content))
    
    @property
    def is_complete(self) -> bool:
        """More lenient complete code detection."""
        incomplete_markers = [
            r'#.*rest.*unchanged',
            r'#.*implementation.*unchanged',
            r'pass  # TODO',
            r'# Missing implementation'
        ]
        return not any(bool(re.search(marker, self.content, re.MULTILINE | re.IGNORECASE))
                      for marker in incomplete_markers)
    
    @property
    def needs_manual_review(self) -> bool:
        """Determine if code block needs manual review."""
        if self.file_type == "python":
            return (
                self.line_count < 8 or  # Too short
                not self.has_imports or  # Missing imports
                not self.is_complete     # Incomplete code
            )
        # For non-Python files, only check if complete and has minimum content
        return not self.is_complete or self.line_count < 4

class CodeParser:
    def __init__(self, project_root: Optional[str] = None, min_lines: int = 4):
        self.project_root = project_root
        self.min_lines = min_lines
        self.supported_extensions = {
            '.py', '.feature', '.md', '.markdown', '.txt', '.json',
            '.yaml', '.yml', '.css', '.html', '.js', '.ts', '.jsx', '.tsx',
            '.php'  # Added PHP extension support
        }
    
    def _detect_file_type(self, filename: str) -> str:
        """Detect file type based on extension with enhanced recognition."""
        ext = Path(filename).suffix.lower()
        type_mapping = {
            '.py': 'python',
            '.feature': 'feature',
            '.md': 'markdown',
            '.markdown': 'markdown',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'react',
            '.tsx': 'react-ts',
            '.html': 'html',
            '.css': 'css',
            '.json': 'json',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.php': 'php'  # Added PHP file type mapping
        }
        return type_mapping.get(ext, "unknown")
    
    def _is_valid_filename(self, filename: str) -> bool:
        """Validate filename format and extension."""
        try:
            path = Path(filename)
            # Check for valid extension
            if path.suffix.lower() not in self.supported_extensions:
                return False
            # Check for valid path format
            return all(part.strip() and not part.startswith('.') 
                      for part in path.parts if part != '.')
        except Exception:
            return False

    def _clean_code_content(self, content: str) -> str:
        """Clean up code content by removing unnecessary whitespace and markers."""
        # Remove trailing whitespace while preserving intentional blank lines
        lines = content.splitlines()
        cleaned_lines = [line.rstrip() for line in lines]
        
        # Remove leading/trailing empty lines while preserving internal spacing
        while cleaned_lines and not cleaned_lines[0].strip():
            cleaned_lines.pop(0)
        while cleaned_lines and not cleaned_lines[-1].strip():
            cleaned_lines.pop()
            
        return '\n'.join(cleaned_lines)

    def parse_code_blocks(self, content: str) -> Dict[str, List[CodeBlock]]:
        """
        Parse code blocks from content with enhanced validation and error handling.
        
        Args:
            content: String containing code blocks with file markers
            
        Returns:
            Dictionary with 'update' and 'manual_update' lists of CodeBlock objects
        """
        logger.info("Starting to parse code blocks.")
        if not content or not content.strip():
            logger.warning("Empty content provided to parser")
            return {'update': [], 'manual_update': []}

        blocks: Dict[str, List[CodeBlock]] = {'update': [], 'manual_update': []}
        
        # Enhanced pattern to catch various file marker formats, including PHP files
        logger.debug("Compiling regex pattern for file markers.")
        file_pattern = re.compile(
            r'(?:^|\n)#\s*([\w/.-]+\.(?:py|md|markdown|feature|js|ts|jsx|tsx|html|css|json|ya?ml|php))(?:\s*\(.*?\))?\s*\n(.*?)(?=\n#\s*[\w/.-]+\.(?:py|md|markdown|feature|js|ts|jsx|tsx|html|css|json|ya?ml|php)|$)',
            re.DOTALL
        )
        
        matches = list(file_pattern.finditer(content))
        logger.info(f"Found {len(matches)} code block(s) matching the pattern.")
        if not matches:
            logger.warning("No code blocks found matching expected pattern")
            return blocks
            
        for match in matches:
            filename, code_content = match.groups()
            logger.debug(f"Processing file: {filename}")
            
            if not self._is_valid_filename(filename):
                logger.warning(f"Skipping invalid filename: {filename}")
                continue
                
            cleaned_content = self._clean_code_content(code_content)
            if not cleaned_content:
                logger.warning(f"Skipping empty code block for {filename}")
                continue
                
            file_type = self._detect_file_type(filename)
            block = CodeBlock(
                filename=filename,
                content=cleaned_content,
                context_before=content[:match.start()].strip(),
                context_after=content[match.end():].strip(),
                project_path=str(Path(self.project_root) / filename) if self.project_root else None,
                file_type=file_type,
                line_number=len(content[:match.start()].splitlines()) + 1
            )
            
            if block.needs_manual_review:
                logger.info(f"Block needs manual review: {filename}")
                logger.debug(f"Block details - Line count: {block.line_count}, Has imports: {block.has_imports}, Is complete: {block.is_complete}")
                blocks['manual_update'].append(block)
            else:
                logger.info(f"Block ready for update: {filename} ({block.line_count} lines)")
                blocks['update'].append(block)
        
        logger.info("Finished parsing code blocks.")
        return blocks

def parse_code_blocks_with_logging(content: str) -> List[Tuple[str, str]]:
    """
    Parse code blocks with enhanced logging and validation.
    
    Args:
        content: String containing code blocks
        
    Returns:
        List of (filename, content) tuples for valid code blocks
    """
    parser = CodeParser(min_lines=8)
    blocks = parser.parse_code_blocks(content)
    
    result = []
    for category in ['update', 'manual_update']:
        for block in blocks[category]:
            if block.is_complete:
                if category == 'manual_update' and block.line_count >= 4:
                    logger.info(f"Including manual review block: {block.filename}")
                    result.append((block.filename, block.content))
                elif category == 'update':
                    logger.info(f"Including update block: {block.filename}")
                    result.append((block.filename, block.content))
    
    if not result:
        logger.warning("No valid code blocks found after parsing and validation")
    
    return result
