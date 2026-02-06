# fastwhisper/core/transcribe.py
import os
import time
import torch
from typing import Optional, Tuple
from dataclasses import dataclass
import logging
from datetime import datetime
from pathlib import Path
from .retry_decorator import retry_operation
from faster_whisper import WhisperModel
from .storage_manager import StorageManager

logger = logging.getLogger(__name__)

@dataclass
class TranscriptionSegment:
    start: float
    end: float
    text: str

@retry_operation(max_retries=3, logger=logger)
def transcribe_audio(
    audio_path: str,
    output_txt: str,
    output_vtt: str,
    language: str = "ru",
    model: Optional[WhisperModel] = None,
    storage_manager: Optional[StorageManager] = None,
) -> Tuple[str, str]:
    """
    Transcribe audio file and save results to text and VTT files using StorageManager.

    Args:
        audio_path: Path to the audio file.
        output_txt: Path to the final text output file.
        output_vtt: Path to the final VTT subtitle file.
        language: Language for transcription.
        model: WhisperModel instance.
        storage_manager: Instance of StorageManager for handling files.

    Returns:
        Tuple of transcription text and VTT content
    """
    try:
        # Initialize the model if not provided
        if model is None:
            model = WhisperModel("large-v2", device="cuda" if torch.cuda.is_available() else "cpu")

        start_time = time.time()

        # Perform transcription
        segments, info = model.transcribe(
            audio_path,
            language=language,
            beam_size=5
        )

        # Collect transcription results
        transcription_text = ""
        vtt_content = "WEBVTT\n\n"

        # Process segments
        for segment in segments:
            text = segment.text.strip()
            start, end = segment.start, segment.end

            # Append to transcription text
            transcription_text += text + "\n"

            # Append to VTT content
            vtt_content += f"{format_time_vtt(start)} --> {format_time_vtt(end)}\n"
            vtt_content += f"{text}\n\n"

            # Log segment progress
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Processed: {text}")
            logger.info(
                f"[{os.path.basename(audio_path)}] Processed segment: {text} "
                f"(Start: {start:.2f}s, End: {end:.2f}s)"
            )

        transcription_text = transcription_text.strip()

        # Ensure output directories exist
        os.makedirs(os.path.dirname(output_txt), exist_ok=True)
        os.makedirs(os.path.dirname(output_vtt), exist_ok=True)

        if storage_manager is not None:
            # Use StorageManager to handle temp files and syncing
            txt_filename = os.path.basename(output_txt)
            vtt_filename = os.path.basename(output_vtt)

            temp_txt_path = storage_manager.write_temp_file(txt_filename, transcription_text)
            temp_vtt_path = storage_manager.write_temp_file(vtt_filename, vtt_content)

            storage_manager.finalize_temp_file(temp_txt_path, output_txt)
            storage_manager.finalize_temp_file(temp_vtt_path, output_vtt)

            # Trigger sync via storage manager (tests expect a call)
            storage_manager.sync_files()
        else:
            # Fallback to direct file writing
            with open(output_txt, 'w', encoding='utf-8') as txt_file:
                txt_file.write(transcription_text)

            with open(output_vtt, 'w', encoding='utf-8') as vtt_file:
                vtt_file.write(vtt_content)

        logger.info(f"Transcription complete for {os.path.basename(audio_path)}")

        return transcription_text, vtt_content

    except Exception as e:
        logger.error(f"Error during transcription of {audio_path}: {e}")
        raise

def format_time_vtt(seconds: float) -> str:
    """
    Format time in VTT format with HH:MM:SS.mmm.

    Args:
        seconds: Time in seconds.

    Returns:
        Formatted time string.
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:06.3f}"
def handle_segment(
    segment,
    txt_file,
    vtt_file,
    audio_path,
    start_time,
    segments_processed
) -> int:
    """
    Process each transcription segment with detailed logging and real-time progress updates.

    Args:
        segment: Current transcription segment
        txt_file: Text file for writing transcription
        vtt_file: VTT file for writing subtitles
        audio_path: Path to source audio file
        start_time: Transcription start time
        segments_processed: Number of segments processed

    Returns:
        Updated segments_processed count
    """
    segments_processed += 1

    # Extract segment details
    text = segment.text.strip()
    start = segment.start
    end = segment.end

    # Write to text file
    txt_file.write(f"{text}\n")
    txt_file.flush()

    # Write to VTT file
    vtt_file.write(f"{format_time_vtt(start)} --> {format_time_vtt(end)}\n")
    vtt_file.write(f"{text}\n\n")
    vtt_file.flush()

    # Calculate and print progress
    elapsed_time = time.time() - start_time
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ", end='')
    print(f"Processed: {text}")
    print(f"Segment {segments_processed} | ", end='')
    print(f"Timestamp: {start:.2f}-{end:.2f} | ", end='')
    print(f"Elapsed: {elapsed_time:.2f}s")

    # Log progress
    logger.info(
        f"[{os.path.basename(audio_path)}] Processed segment {segments_processed}: {text} "
        f"(Start: {start:.2f}s, End: {end:.2f}s, Elapsed: {elapsed_time:.2f}s)"
    )

    return segments_processed
