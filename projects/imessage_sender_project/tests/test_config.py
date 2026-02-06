#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Tests for Config load/save behavior."""

import os
import sys
import tempfile
import unittest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config


class TestConfig(unittest.TestCase):
    """Validate JSON/INI persistence and type handling."""

    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.base = self.tmpdir.name
        self.json_path = os.path.join(self.base, "config.json")
        self.ini_path = os.path.join(self.base, "config.ini")

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_json_round_trip_preserves_formats(self):
        cfg = Config()
        cfg.update(
            {
                "date_format": "%d.%m.%Y",
                "time_format": "%H:%M",
                "delay_min": 1.5,
                "delay_max": 2.5,
                "console_log": False,
            }
        )
        self.assertTrue(cfg.save_to_file(self.json_path))

        reloaded = Config(self.json_path)
        self.assertEqual(reloaded.get("date_format"), "%d.%m.%Y")
        self.assertEqual(reloaded.get("time_format"), "%H:%M")
        self.assertEqual(reloaded.get("delay_min"), 1.5)
        self.assertEqual(reloaded.get("delay_max"), 2.5)
        self.assertFalse(reloaded.get("console_log"))

    def test_ini_round_trip_uses_raw_parser(self):
        cfg = Config()
        cfg.update(
            {
                "date_format": "%d.%m.%Y",
                "time_format": "%H:%M",
                "batch_size": 10,
                "log_level": "debug",
                "console_log": True,
            }
        )
        self.assertTrue(cfg.save_to_file(self.ini_path, format_type="ini"))

        reloaded = Config(self.ini_path)
        self.assertEqual(reloaded.get("date_format"), "%d.%m.%Y")
        self.assertEqual(reloaded.get("time_format"), "%H:%M")
        self.assertEqual(reloaded.get("batch_size"), 10)
        self.assertEqual(reloaded.get("log_level"), "debug")
        self.assertTrue(reloaded.get("console_log"))


if __name__ == "__main__":
    unittest.main()
