#!/usr/bin/env python3
"""
This is a verbatim copy of grade_calls.py from commit 6619b839df04947eb693d6f8f4eee36573326884
(branch: claude/execute-task-files-01PD9HFwszKJ5FqLML1ikp8C).

It auto-grades calls using heuristic, transcript-only logic (VTT parsing + regex checks)
for the Phase 1 17-criteria system. Use as a reference for timing/search/thanks detection;
do NOT treat its outputs as golden.
"""

import json
import re
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional

class CallGrader:
    def __init__(self, call_dir: str):
        self.call_dir = Path(call_dir)
        self.call_id = self.call_dir.name
        self.transcript = []
        self.timestamps = {}
        self.violations = []
        self.criteria_assessment = {}

    def load_transcript(self) -> bool:
        """Load VTT transcript file"""
        vtt_path = self.call_dir / "transcript-2.vtt"
        if not vtt_path.exists():
            # Try transcript-3.vtt as fallback
            vtt_path = self.call_dir / "transcript-3.vtt"
            if not vtt_path.exists():
                print(f"Warning: no transcript file found in {self.call_dir}")
                return False

        with open(vtt_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse VTT format
        lines = content.split('\n')
        current_entry = {}
        i = 0

        while i < len(lines):
            line = lines[i].strip()
            i += 1

            if not line or line == 'WEBVTT' or line.isdigit():
                continue

            # Timeline: 00:00:03,502 --> 00:00:09,152 <AGENT> or 00:03.940 --> 00:07.320
            if '-->' in line:
                parts = line.split('-->')
                start_part = parts[0].strip()
                end_part = parts[1].strip()

                # Check for speaker tag
                speaker = None
                if '<AGENT>' in end_part:
                    speaker = 'Agent'
                    end_part = end_part.replace('<AGENT>', '').strip()
                elif '<CUSTOMER>' in end_part:
                    speaker = 'Customer'
                    end_part = end_part.replace('<CUSTOMER>', '').strip()

                current_entry['start'] = self.parse_timestamp(start_part)
                current_entry['end'] = self.parse_timestamp(end_part)
                current_entry['speaker'] = speaker

                # Read text (may be multiple lines)
                text_lines = []
                while i < len(lines) and lines[i].strip() and '-->' not in lines[i] and not lines[i].strip().isdigit():
                    text_lines.append(lines[i].strip())
                    i += 1

                if text_lines:
                    current_entry['text'] = ' '.join(text_lines)

                    # If no speaker tag, try to infer from context or use alternating pattern
                    if not speaker:
                        # Simple heuristic: if text starts with greeting, likely Agent
                        text_lower = current_entry['text'].lower()
                        if any(word in text_lower for word in ['здравствуй', 'компания', 'зовут', 'помочь', 'слушаю']):
                            current_entry['speaker'] = 'Agent'
                        else:
                            # Alternate based on previous speaker
                            if self.transcript and self.transcript[-1]['speaker'] == 'Agent':
                                current_entry['speaker'] = 'Customer'
                            else:
                                current_entry['speaker'] = 'Agent'

                    self.transcript.append(current_entry.copy())
                    current_entry = {}

        return len(self.transcript) > 0

    def load_timestamps(self) -> bool:
        """Load timestamps JSON file (first 100 lines for metadata)"""
        json_path = self.call_dir / "timestamps.json"
        if not json_path.exists():
            print(f"Warning: {json_path} not found")
            return False

        with open(json_path, 'r', encoding='utf-8') as f:
            self.timestamps = json.load(f)

        return bool(self.timestamps)

    def parse_timestamp(self, ts: str) -> float:
        """Convert MM:SS.sss or HH:MM:SS.sss to seconds (handles both comma and period separators)"""
        # Replace comma with period for European format
        ts = ts.replace(',', '.')

        parts = ts.split(':')
        if len(parts) == 3:
            h, m, s = parts
            return int(h) * 3600 + int(m) * 60 + float(s)
        elif len(parts) == 2:
            m, s = parts
            return int(m) * 60 + float(s)
        return float(ts)

    def format_timestamp(self, seconds: float) -> str:
        """Convert seconds to MM:SS.sss format"""
        mins = int(seconds // 60)
        secs = seconds % 60
        return f"{mins}:{secs:06.3f}"

    def check_7_1_script_violations(self):
        """7.1 - Script Violations (greeting, closing, sequence)"""
        if not self.transcript:
            return

        # Check greeting (first operator speech)
        first_agent = next((e for e in self.transcript if e['speaker'] == 'Agent'), None)
        if not first_agent:
            self.add_violation(
                "7.1", 7, "Script violations - no operator speech detected",
                first_agent['start'] if first_agent else 0, 0.95, True
            )
            return

        greeting = first_agent['text'].lower()

        # Check greeting components
        has_greeting = any(word in greeting for word in ['здравствуй', 'добрый день', 'добрый вечер', 'доброе утро'])
        has_company = any(word in greeting for word in ['компани', 'колес', 'магазин'])
        has_name = 'зовут' in greeting or 'меня' in greeting
        has_offer = any(word in greeting for word in ['помочь', 'помогу', 'слушаю'])

        if not (has_greeting or has_company):
            self.add_violation(
                "7.1", 7, f"Missing proper greeting: '{first_agent['text']}'",
                first_agent['start'], 0.80, True, flag_window=False
            )

        # Check closing (last operator speech)
        last_agent = next((e for e in reversed(self.transcript) if e['speaker'] == 'Agent'), None)
        if last_agent:
            closing = last_agent['text'].lower()
            has_thanks = 'спасибо' in closing or 'благодар' in closing
            has_farewell = any(word in closing for word in ['до свидания', 'всего доброго', 'хорошего дня'])

            if not (has_thanks or has_farewell):
                self.add_violation(
                    "7.1", 7, f"Missing proper closing: '{last_agent['text']}'",
                    last_agent['start'], 0.75, True, flag_window=False
                )

        self.set_pass("7.1", "HIGH", "Proper greeting and closing detected")

    def check_7_2_echo_method(self):
        """7.2 - Echo Method Not Used (CRITICAL)"""
        # Look for contact data collection (name, phone, address, email)
        contact_data_patterns = {
            'name': r'(?:как вас зовут|ваше имя|представьтесь)',
            'phone': r'(?:номер телефон|ваш номер|контактный номер)',
            'address': r'(?:адрес|где находитесь|откуда звоните)',
            'email': r'(?:email|почт|электронн)'
        }

        entities_collected = []
        echo_performed = {}
        confirmation_received = {}

        for i, entry in enumerate(self.transcript):
            text_lower = entry['text'].lower()

            # Check for contact data questions
            for entity_type, pattern in contact_data_patterns.items():
                if re.search(pattern, text_lower) and entry['speaker'] == 'Agent':
                    # Look for customer response in next few entries
                    for j in range(i+1, min(i+5, len(self.transcript))):
                        if self.transcript[j]['speaker'] == 'Customer':
                            # Found contact data collection
                            entities_collected.append(entity_type)

                            # Check if operator echoes back within next entries
                            echo_found = False
                            confirm_found = False

                            for k in range(j+1, min(j+3, len(self.transcript))):
                                if self.transcript[k]['speaker'] == 'Agent':
                                    agent_text = self.transcript[k]['text'].lower()

                                    # Check for confirmation request
                                    if any(word in agent_text for word in ['верно', 'правильно', 'подтверд', 'так']):
                                        confirm_found = True

                            echo_performed[entity_type] = echo_found
                            confirmation_received[entity_type] = confirm_found

                            # VIOLATION if no confirmation
                            if not confirm_found:
                                self.add_violation(
                                    "7.2", 7,
                                    f"{entity_type.capitalize()} collected but no echo confirmation ('Верно?') requested. "
                                    f"Customer: '{self.transcript[j]['text']}' at {self.format_timestamp(self.transcript[j]['start'])}",
                                    self.transcript[j]['start'], 0.92, True, flag_window=False
                                )
                            break

        if entities_collected:
            # Mark patterns
            self.echo_patterns = {
                'contact_data_captured': True,
                'entities_collected': list(set(entities_collected)),
                'echo_performed': echo_performed,
                'confirmation_received': confirmation_received
            }
        else:
            self.echo_patterns = {
                'contact_data_captured': False,
                'entities_collected': [],
                'echo_performed': {},
                'confirmation_received': {}
            }
            self.set_pass("7.2", "HIGH", "No contact data collected (criterion not applicable)")

    def check_7_3_timing_rules(self):
        """7.3 - 5-Second Timing Rules (intro and outro)"""
        if not self.transcript:
            return

        # Intro timing: first operator speech should be within 5 seconds
        first_agent = next((e for e in self.transcript if e['speaker'] == 'Agent'), None)
        if first_agent:
*** End Patch તેની
