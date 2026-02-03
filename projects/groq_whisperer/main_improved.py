import os
import tempfile
import wave
import pyaudio
import keyboard
import pyautogui
import pyperclip
from groq import Groq
import time
import subprocess
import sys

# Set up Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Configuration
RECORD_KEY = "f19"  # Primary hotkey (matches setup docs)
FALLBACK_KEY = "alt+space"  # Secondary hotkey if F19 isn't detected

def get_frontmost_app():
    """Get the name of the frontmost application on macOS."""
    try:
        script = 'tell application "System Events" to get name of (first process whose frontmost is true)'
        result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
        return result.stdout.strip()
    except:
        return ""

def is_terminal_app(app_name):
    """Check if the app is a terminal application."""
    terminal_apps = ["iTerm2", "iTerm", "Warp", "Terminal", "Alacritty", "Hyper", "kitty"]
    return any(term.lower() in app_name.lower() for term in terminal_apps)

def record_audio(sample_rate=16000, channels=1, chunk=1024):
    """
    Record audio from the microphone while the record key is held down.
    """
    p = pyaudio.PyAudio()
    stream = p.open(
        format=pyaudio.paInt16,
        channels=channels,
        rate=sample_rate,
        input=True,
        frames_per_buffer=chunk,
    )

    print(f"Press and hold {RECORD_KEY.upper()} to start recording...")
    frames = []

    # Wait for either primary or fallback key to be pressed.
    active_key = RECORD_KEY
    while True:
        if keyboard.is_pressed(RECORD_KEY):
            active_key = RECORD_KEY
            break
        if keyboard.is_pressed(FALLBACK_KEY):
            active_key = FALLBACK_KEY
            break
        time.sleep(0.1)

    print("Recording... (Release to stop)")
    while keyboard.is_pressed(active_key):
        data = stream.read(chunk, exception_on_overflow=False)
        frames.append(data)

    print("Recording finished.")
    stream.stop_stream()
    stream.close()
    p.terminate()

    return frames, sample_rate


def save_audio(frames, sample_rate):
    """
    Save recorded audio to a temporary WAV file.
    """
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
        wf = wave.open(temp_audio.name, "wb")
        wf.setnchannels(1)
        wf.setsampwidth(pyaudio.PyAudio().get_sample_size(pyaudio.paInt16))
        wf.setframerate(sample_rate)
        wf.writeframes(b"".join(frames))
        wf.close()
        return temp_audio.name


def transcribe_audio(audio_file_path):
    """
    Transcribe audio using Groq's Whisper implementation.
    """
    try:
        with open(audio_file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_file_path), file.read()),
                model="whisper-large-v3-turbo",  # Use the turbo model for faster transcription
                response_format="text",
                language="en",  # Remove prompt for cleaner transcription
                temperature=0.0,  # Lower temperature for more deterministic output
            )
        return transcription
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return None


def paste_transcription(text):
    """
    Paste the transcribed text to the active application.
    Automatically adds Enter for terminal applications.
    """
    # Get the frontmost application
    app_name = get_frontmost_app()
    is_terminal = is_terminal_app(app_name)
    
    # Copy to clipboard
    pyperclip.copy(text)
    
    # Small delay to ensure clipboard is ready
    time.sleep(0.1)
    
    # Paste using Cmd+V (macOS)
    pyautogui.hotkey("command", "v")
    
    # If it's a terminal, optionally add Enter to execute the command
    if is_terminal:
        time.sleep(0.1)  # Small delay before Enter
        # Uncomment the next line if you want auto-execute in terminals
        # pyautogui.press("enter")
        print(f"Pasted to {app_name} (terminal detected, auto-enter disabled)")
    else:
        print(f"Pasted to {app_name}")


def main():
    # Check for API key
    if not os.environ.get("GROQ_API_KEY"):
        print("Error: GROQ_API_KEY not found in environment variables")
        print("Please set it with: export GROQ_API_KEY='your-key-here'")
        sys.exit(1)
    
    print("Groq Whisperer - Background Dictation Tool")
    print(f"Using model: whisper-large-v3-turbo")
    print("-" * 40)
    
    while True:
        try:
            # Record audio
            frames, sample_rate = record_audio()
            
            # Skip if no audio was recorded
            if not frames:
                print("No audio recorded, skipping...")
                continue
            
            # Save audio to temporary file
            temp_audio_file = save_audio(frames, sample_rate)
            
            # Transcribe audio
            print("Transcribing...")
            transcription = transcribe_audio(temp_audio_file)
            
            # Paste transcription if successful
            if transcription:
                print(f"\nTranscription: {transcription}")
                paste_transcription(transcription)
                print("✓ Transcription pasted successfully")
            else:
                print("✗ Transcription failed")
            
            # Clean up temporary file
            try:
                os.unlink(temp_audio_file)
            except:
                pass
            
            print(f"\n Ready for next recording. Press {RECORD_KEY.upper()} to start.")
            print("-" * 40)
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {str(e)}")
            print("Continuing...")


if __name__ == "__main__":
    main()
