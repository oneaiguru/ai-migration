# Groq Whisperer Setup Guide

## Overview
Groq Whisperer is a background dictation tool that:
- Records audio with F19 or Alt+Space hotkey
- Transcribes using Groq's Whisper API (whisper-large-v3-turbo)
- Pastes text directly into any application
- Works with Edge, iTerm2, Warp, and more

## Quick Start

### 1. Get your Groq API Key
Visit https://console.groq.com/ and create an API key.

### 2. Set Environment Variable
Add to your `~/.zshrc`:
```bash
export GROQ_API_KEY='your-key-here'
```
Then reload:
```bash
source ~/.zshrc
```

### 3. Test the Setup
```bash
cd /path/to/projects/groq_whisperer
./test_run.sh
```

### 4. Run Manually
```bash
source .venv/bin/activate
python main_improved.py
```

## Usage

1. **Start Recording**: Hold F19 (or Alt+Space if F19 unavailable)
2. **Speak**: Hold the key while speaking
3. **Release**: Let go to transcribe and paste
4. **Result**: Text appears in your active application

## Features

- **Smart Paste**: Automatically detects terminal apps
- **Universal**: Works with any macOS application
- **Fast**: Uses Groq's turbo model for quick transcription
- **Background Ready**: Can run as a system service

## Running as Background Service

### Install Service
Create a LaunchAgent plist (not included here) in `~/Library/LaunchAgents/com.mikhail.groqwhisperer.plist` that points to `start_groq_whisperer.sh` in this repo.

### Check Status
```bash
launchctl list | grep groqwhisperer
tail -f /tmp/groqwhisperer.out  # View output
tail -f /tmp/groqwhisperer.err  # View errors
```

### Stop Service
```bash
launchctl unload ~/Library/LaunchAgents/com.mikhail.groqwhisperer.plist
```

## Permissions Required

macOS will prompt for:
1. **Microphone Access** - Required for audio recording
2. **Accessibility** - Required for hotkey detection
3. **Input Monitoring** - Required for keyboard events

Grant these in System Settings → Privacy & Security.

## Customization

### Change Hotkey
Edit `main_improved.py`:
```python
RECORD_KEY = "f19"  # Change to your preferred key
FALLBACK_KEY = "alt+space"  # Backup key
```

### Auto-Enter in Terminals
Uncomment line in `paste_transcription()` function:
```python
# pyautogui.press("enter")  # Uncomment for auto-execute
```

### Adjust Model Settings
In `transcribe_audio()`:
```python
model="whisper-large-v3-turbo",  # Or "whisper-large-v3"
temperature=0.0,  # 0.0-1.0, lower = more deterministic
```

## Troubleshooting

### API Key Not Found
```bash
echo $GROQ_API_KEY  # Check if set
export GROQ_API_KEY='your-key-here'  # Set temporarily
```

### Permissions Issues
- Go to System Settings → Privacy & Security
- Check Microphone, Accessibility, Input Monitoring
- Add Terminal (or your IDE) to allowed apps

### Module Import Errors
```bash
source .venv/bin/activate
pip install groq pyaudio keyboard pyautogui pyperclip
```

### Audio Not Recording
```bash
brew install portaudio  # Required for PyAudio on Mac
```

### Service Not Starting
Check logs:
```bash
tail -f /tmp/groqwhisperer.err
```

## Files Overview

- `main_improved.py` - Enhanced version with Mac support
- `main.py` - Original version (uses Pause key)
- `start_groq_whisperer.sh` - Service startup script
- `test_run.sh` - Setup verification script
- `com.mikhail.groqwhisperer.plist` - LaunchAgent config (create under ~/Library/LaunchAgents as described)

## Next Steps

1. Test with your favorite apps
2. Customize hotkeys as needed
3. Consider adding local Whisper fallback
4. Adjust auto-enter behavior for terminals

## Support

For Groq API issues: https://console.groq.com/docs
For repo issues: https://github.com/KennyVaneetvelde/groq_whisperer
