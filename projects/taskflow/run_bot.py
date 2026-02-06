#!/usr/bin/env python3
"""Convenient entry point for the Telegram bot."""

import os
import sys

# Ensure the repository root is in the path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from bot.bot import main

if __name__ == "__main__":
    main()
