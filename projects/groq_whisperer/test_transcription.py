#!/usr/bin/env python3
"""
Test script for Groq Whisperer
Tests audio recording and transcription without the full UI
"""

import os
import tempfile
import wave
import pyaudio
import time
from groq import Groq

# Set up Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def record_short_audio(duration=3, sample_rate=16000, channels=1, chunk=1024):
    """Record a short audio clip for testing."""
    print(f"Recording {duration} seconds of audio...")
    print("Speak now!")
    
    p = pyaudio.PyAudio()
    stream = p.open(
        format=pyaudio.paInt16,
        channels=channels,
        rate=sample_rate,
        input=True,
        frames_per_buffer=chunk,
    )
    
    frames = []
    for _ in range(0, int(sample_rate / chunk * duration)):
        data = stream.read(chunk, exception_on_overflow=False)
        frames.append(data)
    
    print("Recording finished.")
    stream.stop_stream()
    stream.close()
    p.terminate()
    
    return frames, sample_rate

def save_audio(frames, sample_rate):
    """Save recorded audio to a temporary WAV file."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
        wf = wave.open(temp_audio.name, "wb")
        wf.setnchannels(1)
        wf.setsampwidth(pyaudio.PyAudio().get_sample_size(pyaudio.paInt16))
        wf.setframerate(sample_rate)
        wf.writeframes(b"".join(frames))
        wf.close()
        return temp_audio.name

def transcribe_audio(audio_file_path):
    """Transcribe audio using Groq's Whisper implementation."""
    try:
        print("Sending to Groq for transcription...")
        with open(audio_file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_file_path), file.read()),
                model="whisper-large-v3-turbo",
                response_format="text",
                language="en",
                temperature=0.0,
            )
        return transcription
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return None

def main():
    print("=" * 50)
    print("Groq Whisperer - Audio Transcription Test")
    print("=" * 50)
    
    # Check API key
    if not os.environ.get("GROQ_API_KEY"):
        print("❌ GROQ_API_KEY not set!")
        return
    
    print("✓ API key found")
    print("")
    
    # Give user a countdown
    print("Starting in 3 seconds...")
    for i in range(3, 0, -1):
        print(f"{i}...")
        time.sleep(1)
    
    # Record audio
    frames, sample_rate = record_short_audio(duration=3)
    
    # Save to file
    audio_file = save_audio(frames, sample_rate)
    print(f"Audio saved to: {audio_file}")
    
    # Transcribe
    transcription = transcribe_audio(audio_file)
    
    if transcription:
        print("")
        print("=" * 50)
        print("TRANSCRIPTION RESULT:")
        print("=" * 50)
        print(transcription)
        print("=" * 50)
        print("✓ Test successful!")
    else:
        print("❌ Transcription failed")
    
    # Clean up
    try:
        os.unlink(audio_file)
    except:
        pass

if __name__ == "__main__":
    main()