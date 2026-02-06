# VS Code Setup for Claude Code with Proxy

This guide explains how to set up VS Code to work with Claude Code through your proxy server.

## Prerequisites

1. VS Code installed on your machine
2. Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
3. Configuration set up using the client setup script

## Setting Up Environment Variables in VS Code

### Method 1: Using `.env` Files (Recommended)

1. Install the "DotENV" extension in VS Code
2. Create a `.env` file in your project root:

```
ANTHROPIC_API_BASE=https://your-proxy-server.com:3000/api/anthropic
STATSIG_API_BASE=https://your-proxy-server.com:3000/api/statsig
SENTRY_API_BASE=https://your-proxy-server.com:3000/api/sentry
CLAUDE_CODE_AUTH_TOKEN=your-auth-token
```

3. Install the `dotenv-cli` package:

```bash
npm install -g dotenv-cli
```

4. Create a script