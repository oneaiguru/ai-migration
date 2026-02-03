#!/usr/bin/env node

import { startTUI } from './tui/app.js';

startTUI().catch(error => {
  console.error('Failed to start Things TUI:', error);
  process.exit(1);
});
