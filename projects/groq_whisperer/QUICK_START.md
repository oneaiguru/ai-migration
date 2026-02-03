# Groq Whisperer - Quick Start 🎤

## ⚡ Setup (One Time)

```bash
# 1. Add to ~/.zshrc
export GROQ_API_KEY='your-groq-api-key-here'

# 2. Reload shell
source ~/.zshrc
```

## 🚀 Run Now

```bash
cd /Users/m/git/tools/groq_whisperer
source .venv/bin/activate
python main_improved.py
```

## 🎯 How to Use

1. **Hold F19** (or Alt+Space) to start recording
2. **Speak** while holding the key
3. **Release** to transcribe and paste

Text appears instantly in your active app!

## 🔧 Run as Background Service

```bash
# Start service (runs at login)
launchctl load ~/Library/LaunchAgents/com.mikhail.groqwhisperer.plist

# Stop service
launchctl unload ~/Library/LaunchAgents/com.mikhail.groqwhisperer.plist

# Check logs
tail -f /tmp/groqwhisperer.out
```

## ✅ Test Setup

```bash
./test_run.sh
```

## 🔑 Get API Key

Visit: https://console.groq.com/keys

## 📱 Works With

- iTerm2 / Warp / Terminal
- Microsoft Edge / Chrome / Safari  
- VS Code / Cursor / Any text editor
- Slack / Discord / Any chat app
- ANY macOS application!

## ⚠️ First Run

macOS will ask for permissions:
- ✅ Microphone Access
- ✅ Accessibility 
- ✅ Input Monitoring

Grant all in System Settings → Privacy & Security