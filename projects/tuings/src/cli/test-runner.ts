import { ThingsTUITestable } from '../tui/app.js';
import { StateCapture, UIState } from '../tui/state-capture.js';
import { closeDatabase } from '../database/things-db.js';

interface ScenarioResult {
  name: string;
  passed: boolean;
  states: UIState[];
  issues: string[];
}

async function runNonInteractive(
  scenarioName: string,
  keySequence: string[],
  expectations?: Record<number, Record<string, any>>
): Promise<ScenarioResult> {
  const tui = new ThingsTUITestable();
  await tui.initialize();

  const capture = new StateCapture();
  const states: UIState[] = [];
  const issues: string[] = [];

  // Capture initial state
  const initialState = capture.capture(tui, 'Initial');
  states.push(initialState);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`Scenario: ${scenarioName}`);
  console.log(`Keys: ${keySequence.join(' ')}`);
  console.log('='.repeat(70));
  console.log(capture.renderAsText(initialState));

  // Execute key sequence
  for (let i = 0; i < keySequence.length; i++) {
    const key = keySequence[i];
    await tui.simulateKeyPress(key);

    // Small delay for state updates
    await new Promise(resolve => setTimeout(resolve, 50));

    const state = capture.capture(tui, `After key '${key}'`);
    states.push(state);

    console.log(capture.renderAsText(state));

    // Check expectations if provided
    if (expectations && expectations[i + 1]) {
      const expected = expectations[i + 1];
      for (const [field, expectedValue] of Object.entries(expected)) {
        const actualValue = (state as any)[field];
        const expectedIsObject =
          expectedValue !== null && typeof expectedValue === 'object' && !Array.isArray(expectedValue);
        const actualIsObject =
          actualValue !== null && typeof actualValue === 'object' && !Array.isArray(actualValue);

        if (expectedIsObject) {
          if (!actualIsObject) {
            issues.push(
              `[Step ${i + 1}] ${field}: expected ${JSON.stringify(expectedValue)}, got ${String(actualValue)}`
            );
            continue;
          }

          const mismatches = Object.entries(expectedValue).filter(
            ([key, value]) => (actualValue as any)[key] !== value
          );
          if (mismatches.length > 0) {
            const expectedSummary = mismatches.map(([key, value]) => `${key}=${value}`).join(', ');
            issues.push(
              `[Step ${i + 1}] ${field}: expected ${expectedSummary}, got ${JSON.stringify(actualValue)}`
            );
          }
        } else if (actualValue !== expectedValue) {
          issues.push(
            `[Step ${i + 1}] ${field}: expected ${expectedValue}, got ${actualValue}`
          );
        }
      }
    }
  }

  closeDatabase();
  // TUI cleanup handled by test harness

  const passed = issues.length === 0;
  const result: ScenarioResult = {
    name: scenarioName,
    passed,
    states,
    issues
  };

  console.log(`\n${passed ? '✓ PASS' : '✗ FAIL'}: ${scenarioName}`);
  if (issues.length > 0) {
    console.log('Issues:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  return result;
}

async function runScenarios() {
  const results: ScenarioResult[] = [];

  // Scenario 1: Navigate Today list
  results.push(
    await runNonInteractive('Navigate Today list - select task 2', ['1', 'down', 'down'])
  );

  // Scenario 2: Open and close detail view
  results.push(
    await runNonInteractive('Open detail view and close', ['1', 'down', 'enter', 'escape'], {
      3: { mode: 'detail' },
      4: { mode: 'list' }
    })
  );

  // Scenario 3: Switch lists
  results.push(
    await runNonInteractive('Switch to Upcoming list', ['2'], {
      1: { currentList: 'upcoming' }
    })
  );

  // Scenario 4: Mark task complete
  results.push(
    await runNonInteractive('Mark task complete with c key', ['1', 'down', 'c'], {
      3: { selectedTask: { status: 2 } }
    })
  );

  // Print summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('UAT SUMMARY');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Scenarios: ${passed} passed, ${failed} failed (${results.length} total)`);
  results.forEach(r => {
    console.log(`  ${r.passed ? '✓' : '✗'} ${r.name}`);
  });

  if (failed > 0) {
    console.log(`\nFailed scenarios:`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`\n  ${r.name}:`);
      r.issues.forEach(issue => console.log(`    - ${issue}`));
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

// CLI usage: node dist/cli/test-runner.js [scenario] [keys...]
// Or just: node dist/cli/test-runner.js (run all built-in scenarios)
if (process.argv.length > 2) {
  const scenarioName = process.argv[2];
  const keys = process.argv.slice(3);
  runNonInteractive(scenarioName, keys).then(result => {
    process.exit(result.passed ? 0 : 1);
  });
} else {
  runScenarios().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
  });
}
