# FastWhisper - Audio Transcription Tool Memory

## Quick Start
- **Purpose**: High-performance audio transcription using faster-whisper with file management
- **Input**: Audio files (mp3, wav, m4a)  
- **Output**: Transcription text files (.txt) and subtitle files (.vtt)

## Installation & Setup
```bash
# Install dependencies (from setup.py analysis)
pip install faster-whisper torch pathlib

# Additional requirements
# - CUDA for GPU acceleration (optional)
# - FFmpeg for audio processing
```

## Usage Examples
```bash
# Basic transcription (default Russian language)
python -m fastwhisper.main

# Specify language
python -m fastwhisper.main --language en

# Set environment for Code Interpreter
ENVIRONMENT=code_interpreter python -m fastwhisper.main
```

## Core Components
| File | Lines | Purpose |
|------|-------|---------|
| `main.py` | 1-124 | Main orchestration and CLI interface |
| `core/transcribe.py` | 1-188 | Core transcription logic with retry handling |
| `core/file_manager.py` | N/A | File operations and management |
| `core/storage_manager.py` | N/A | Storage synchronization and cleanup |
| `core/deduper.py` | N/A | Duplicate file detection |
| `setup.py` | N/A | Package configuration |

## Processing Pipeline
1. **Environment Setup** - `main.py:14-28` - Detect local vs code_interpreter
2. **Directory Creation** - `main.py:51-53` - Create input, processed, transcript, archive, remote folders
3. **Duplicate Check** - `main.py:59` - Check for existing transcriptions using deduper
4. **Model Initialization** - `main.py:65-67` - Load WhisperModel with GPU/CPU detection
5. **File Processing** - `main.py:81-114` - Process audio files by modification time (newest first)
6. **Transcription** - `transcribe.py:24-120` - Core transcription with retry logic
7. **Storage Management** - `main.py:116-117` - Sync files and cleanup

## Configuration Options
- `--language`: Language code for transcription (default: "ru")
- **Model**: "large-v2" (hardcoded in `main.py:66`)
- **Device**: Auto-detects CUDA availability, falls back to CPU
- **Beam Size**: 5 (set in `transcribe.py:68`)

## Performance Notes
- **Model Size**: Uses large-v2 model for high accuracy
- **GPU Acceleration**: Automatically uses CUDA if available
- **File Processing**: Processes newest files first (sorted by modification time)
- **Retry Logic**: 3-attempt retry with exponential backoff (`transcribe.py:23`)
- **Memory Management**: Uses secure temporary files during processing

## Directory Structure
```
data/
├── input/          # Source audio files
├── processed/      # Successfully processed audio files  
├── transcript/     # Output text and VTT files
├── archive/        # Archived transcriptions
│   ├── 2024/
│   ├── 2025/
│   └── daily/
└── remote/         # Remote sync directory
```

## Integration Examples
```python
# Use as library
from fastwhisper.core.transcribe import transcribe_audio
from faster_whisper import WhisperModel

model = WhisperModel("large-v2", device="cuda")
transcription, vtt_content = transcribe_audio(
    "audio.mp3", 
    "output.txt", 
    "output.vtt",
    language="en",
    model=model
)

# Pipeline with file management
from fastwhisper.core.file_manager import FileManager
from fastwhisper.core.storage_manager import StorageManager

file_manager = FileManager()
storage_manager = StorageManager("input_dir", "remote_dir")
```

## Common Issues
- **Large files**: Tool handles large files with robust retry mechanism
  - Solution: Built-in retry decorator with 3 attempts (`transcribe.py:23`)
- **GPU memory**: Automatic fallback to CPU if CUDA unavailable
  - Solution: Device detection in `main.py:66-67`
- **File conflicts**: Prevents duplicate processing
  - Solution: Existence check in `main.py:94-98`
- **Encoding issues**: Handles UTF-8 encoding properly
  - Solution: Explicit UTF-8 encoding in `transcribe.py:48-99`

## Advanced Features
- **Multi-environment support**: Works in both local and code_interpreter environments
- **Comprehensive logging**: Detailed progress tracking with timestamps
- **File deduplication**: Prevents reprocessing existing files
- **Storage synchronization**: Remote file sync capabilities
- **VTT subtitle generation**: Creates properly formatted WebVTT files
- **Batch processing**: Handles multiple files automatically
- **Error recovery**: Robust error handling with cleanup

## Output Formats
- **Text (.txt)**: Plain text transcription, UTF-8 encoded
- **WebVTT (.vtt)**: Subtitle format with timestamps
  - Format: `HH:MM:SS,mmm --> HH:MM:SS,mmm`
  - Proper WebVTT headers and structure

## Performance Optimization
- Files processed by modification time (newest first)
- GPU acceleration when available
- Temporary file usage for atomic operations
- Built-in retry logic for reliability
- Efficient model reuse across files