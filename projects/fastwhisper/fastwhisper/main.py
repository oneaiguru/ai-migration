
# fastwhisper/main.py

import os
import argparse
from pathlib import Path
from fastwhisper.core.file_manager import FileManager
from fastwhisper.core.storage_manager import StorageManager
from faster_whisper import WhisperModel
import torch
from fastwhisper.core.transcribe import transcribe_audio
from fastwhisper.core.deduper import check_duplication

def get_project_root():
    """Get the project root directory based on the environment."""
    environment = os.getenv('ENVIRONMENT', 'local')
    if environment == 'code_interpreter':
        return Path('/mnt/data')
    return Path(os.getenv("FASTWHISPER_ROOT", Path.cwd()))

def get_dynamic_path(subfolder):
    """Get dynamic path that works in both environments."""
    root = get_project_root()
    root = Path(root) if isinstance(root, str) else root
    if os.getenv('PYTEST_CURRENT_TEST'):
        return root / subfolder
    # If running in code_interpreter, project root is already /mnt/data; avoid nesting another data/
    if os.getenv('ENVIRONMENT') == 'code_interpreter':
        return root / subfolder
    return root / 'data' / subfolder

def main():
    parser = argparse.ArgumentParser(description="Process audio files for transcription.")
    parser.add_argument("--language", type=str, default="ru",
                        help="Language code for transcription (default: ru)")
    
    # Only parse known args to handle test runner arguments
    args, _ = parser.parse_known_args()

    # Define folders with more structured approach
    input_folder = get_dynamic_path('input')
    processed_folder = get_dynamic_path('processed')  # New folder for processed files
    transcript_folder = get_dynamic_path('transcript')
    archive_folder = get_dynamic_path('archive')
    remote_folder = get_dynamic_path('remote')

    print(f"\nWorking directories:")
    print(f"  input: {input_folder}")
    print(f"  processed: {processed_folder}")  # New folder print
    print(f"  transcript: {transcript_folder}")
    print(f"  archive: {archive_folder}")
    print(f"  remote: {remote_folder}")

    # Create all necessary folders
    for folder in [input_folder, processed_folder, transcript_folder, archive_folder, remote_folder]:
        folder.mkdir(parents=True, exist_ok=True)

    file_manager = FileManager(is_code_interpreter=os.getenv('ENVIRONMENT') == 'code_interpreter')
    storage_manager = StorageManager(str(input_folder), str(remote_folder))

    # Check for duplicates first
    check_duplication(str(input_folder), str(transcript_folder))

    # Handle any pre-transcribed files first
    file_manager.handle_pretranscribed_files(str(input_folder), str(transcript_folder), str(archive_folder))

    # Initialize multilingual model
    print("\nInitializing multilingual Whisper model...")
    model_download_root = get_dynamic_path('models')
    model_download_root.mkdir(parents=True, exist_ok=True)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = WhisperModel(
        "large-v2",
        device=device,
        download_root=str(model_download_root),
    )
    print(f"Model loaded successfully. Using device: {device}")

    # Get list of audio files, sorted by modification time (newest first)
    audio_files = [
        f for f in os.listdir(str(input_folder)) 
        if f.endswith(('.mp3', '.wav', '.m4a'))
    ]
    audio_files.sort(
        key=lambda f: os.path.getmtime(str(input_folder / f)), 
        reverse=True
    )

    print(f"\nFound {len(audio_files)} audio files to process.")
    
    for filename in audio_files:
        try:
            print(f"\n{'='*50}")
            print(f"Processing file: {filename}")
            print(f"{'='*50}")

            audio_path = str(input_folder / filename)
            base_name = os.path.splitext(filename)[0]
            output_txt = str(transcript_folder / f"{base_name}.txt")
            output_vtt = str(transcript_folder / f"{base_name}.vtt")
            processed_audio_path = str(processed_folder / filename)

            # Check if transcription files already exist
            if os.path.exists(output_txt) and os.path.exists(output_vtt):
                print(f"Skipping already transcribed file: {filename}")
                # Move the original audio file to processed folder
                file_manager.move_file(audio_path, processed_audio_path)
                continue

            # Transcribe the audio file
            transcribe_audio(audio_path, output_txt, output_vtt, 
                            language=args.language, model=model, 
                            storage_manager=storage_manager)

            # Add transcription files to sync queue
            storage_manager.add_to_sync_queue(output_txt)
            storage_manager.add_to_sync_queue(output_vtt)

            # Move the original audio file to processed folder
            file_manager.move_file(audio_path, processed_audio_path)
        
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            continue

    storage_manager.sync_files()
    storage_manager.cleanup_local_files()
    
    print("\nTranscription process completed.")

if __name__ == "__main__":
    main()
