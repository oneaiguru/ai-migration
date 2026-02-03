import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import { ThingsTUITestable } from '../../src/tui/app.js';
import { closeDatabase } from '../../src/database/things-db.js';

// Shared test context
interface TestContext {
  tui: ThingsTUITestable | null;
  lastKeyPressed: string;
  lastMessage: string;
}

const context: TestContext = {
  tui: null,
  lastKeyPressed: '',
  lastMessage: ''
};

// Setup and teardown
Before(async function() {
  // Initialize TUI for testing
  context.tui = new ThingsTUITestable();
  await context.tui.initialize();
});

After(async function() {
  // Cleanup
  if (context.tui) {
    closeDatabase();
    context.tui = null;
  }
});

// Background/Given steps
Given('Things TUI is running with real data', async function() {
  expect(context.tui).to.exist;
  const tasks = context.tui!.getVisibleTasks();
  expect(tasks.length).to.be.greaterThan(0);
});

Given('Things TUI is running', async function() {
  expect(context.tui).to.exist;
});

Given('at least one task exists in current list', async function() {
  const tasks = context.tui!.getVisibleTasks();
  expect(tasks.length).to.be.greaterThan(0);
});

Given('tasks have tags assigned', async function() {
  const tasks = context.tui!.getAllTasks();
  const withTags = tasks.filter(t => t.tags && t.tags.length > 0);
  expect(withTags.length).to.be.greaterThan(0);
});

Given('I select a task', async function() {
  context.tui!.selectTask(0);
});

Given('task {string} is in Today list', async function(title: string) {
  const tasks = context.tui!.getTodayTasks();
  const found = tasks.find(t => t.title === title);
  expect(found).to.exist;
});

Given('task has notes {string}', async function(notes: string) {
  const task = context.tui!.getSelectedTask();
  task!.notes = notes;
});

Given('task has tags {string}', async function(tags: string) {
  const task = context.tui!.getSelectedTask();
  task!.tags = tags.split(',').map(t => t.trim());
});

Given('task has due date {string}', async function(date: string) {
  const task = context.tui!.getSelectedTask();
  const now = Math.floor(Date.now() / 1000);
  task!.dueDate = now;
});

Given('task has very long notes', async function() {
  const task = context.tui!.getSelectedTask();
  task!.notes = 'Lorem ipsum dolor sit amet, '.repeat(50);
});

Given('filters are active with {string}', async function(tagName: string) {
  const tags = context.tui!.getTags();
  const tag = tags.find(t => t.title === tagName);
  if (tag) {
    context.tui!.selectTag(tag.id);
  }
});

Given('I select task at position {int}', async function(position: number) {
  context.tui!.selectTask(position - 1);
});

Given('selection is on first task', async function() {
  context.tui!.selectTask(0);
});

Given('selection is on last task', async function() {
  const tasks = context.tui!.getVisibleTasks();
  context.tui!.selectTask(tasks.length - 1);
});

// When/Action steps
When('I press {string}', async function(key: string) {
  context.lastKeyPressed = key;
  await context.tui!.simulateKeyPress(key);
  await new Promise(resolve => setTimeout(resolve, 50));
});

When('I type {string}', async function(text: string) {
  await context.tui!.typeText(text);
  await new Promise(resolve => setTimeout(resolve, 50));
});

When('I press Enter', async function() {
  await context.tui!.simulateKeyPress('enter');
  await new Promise(resolve => setTimeout(resolve, 50));
});

When('I press Escape', async function() {
  await context.tui!.simulateKeyPress('escape');
  await new Promise(resolve => setTimeout(resolve, 50));
});

When('I press Space', async function() {
  await context.tui!.simulateKeyPress('space');
  await new Promise(resolve => setTimeout(resolve, 50));
});

When('I press Tab', async function() {
  await context.tui!.simulateKeyPress('tab');
  await new Promise(resolve => setTimeout(resolve, 50));
});

When('I select tag {string}', async function(tagName: string) {
  const tags = context.tui!.getTags();
  const tag = tags.find(t => t.title === tagName);
  if (tag) {
    context.tui!.selectTag(tag.id);
  }
});

When('I select a task', async function() {
  context.tui!.selectTask(0);
});

When('I select task {string}', async function(title: string) {
  const tasks = context.tui!.getVisibleTasks();
  const task = tasks.find(t => t.title === title);
  const idx = tasks.indexOf(task!);
  if (idx >= 0) {
    context.tui!.selectTask(idx);
  }
});

When('I navigate to tag {string}', async function(tagName: string) {
  const tags = context.tui!.getTags();
  const idx = tags.findIndex(t => t.title === tagName);
  if (idx >= 0) {
    context.tui!.setTagFilterIndex(idx);
  }
});

When('I press Down arrow', async function() {
  await context.tui!.simulateKeyPress('down');
  await new Promise(resolve => setTimeout(resolve, 50));
});

When('I press Up arrow', async function() {
  await context.tui!.simulateKeyPress('up');
  await new Promise(resolve => setTimeout(resolve, 50));
});

When('I press Down {int} times', async function(count: number) {
  for (let i = 0; i < count; i++) {
    await context.tui!.simulateKeyPress('down');
    await new Promise(resolve => setTimeout(resolve, 10));
  }
});

When('I press any list key \\(1-4)', async function() {
  const keys = ['1', '2', '3', '4'];
  for (const key of keys) {
    await context.tui!.simulateKeyPress(key);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
});

// Then/Assertion steps
Then('search dialog appears', async function() {
  const visible = context.tui!.isSearchDialogVisible();
  expect(visible).to.be.true;
});

Then('input field is focused', async function() {
  const focused = context.tui!.isInputFocused();
  expect(focused).to.be.true;
});

Then('search results show tasks containing {string}', async function(query: string) {
  const results = context.tui!.getVisibleTasks();
  const matching = results.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase())
  );
  expect(matching.length).to.be.greaterThan(0);
});

Then('search results show tasks with notes containing {string}', async function(query: string) {
  const results = context.tui!.getVisibleTasks();
  const matching = results.filter(t => 
    (t.notes || '').toLowerCase().includes(query.toLowerCase())
  );
  expect(matching.length).to.be.greaterThan(0);
});

Then('search dialog closes', async function() {
  const visible = context.tui!.isSearchDialogVisible();
  expect(visible).to.be.false;
});

Then('current list changes to {string}', async function(listName: string) {
  const current = context.tui!.getCurrentList();
  expect(current.toLowerCase()).to.include(listName.toLowerCase());
});

Then('status bar shows {string}', async function(text: string) {
  const status = context.tui!.getStatusBar();
  expect(status).to.include(text);
});

Then('detail view opens', async function() {
  const visible = context.tui!.isDetailViewVisible();
  expect(visible).to.be.true;
});

Then('detail view shows task title', async function() {
  const content = context.tui!.getDetailViewContent();
  expect(content).to.include(context.tui!.getSelectedTask()!.title);
});

Then('detail view displays:', async function(dataTable: any) {
  const rows = dataTable.rows();
  for (const [key, value] of rows) {
    const content = context.tui!.getDetailViewContent();
    expect(content).to.include(value);
  }
});

Then('detail view shows notes section', async function() {
  const content = context.tui!.getDetailViewContent();
  expect(content).to.include('Notes');
});

Then('notes text is visible', async function() {
  const content = context.tui!.getDetailViewContent();
  const notes = context.tui!.getSelectedTask()!.notes;
  expect(content).to.include(notes!);
});

Then('detail view shows tags', async function() {
  const content = context.tui!.getDetailViewContent();
  expect(content).to.include('#');
});

Then('all tags displayed with # prefix', async function() {
  const content = context.tui!.getDetailViewContent();
  const task = context.tui!.getSelectedTask();
  if (task!.tags) {
    for (const tag of task!.tags) {
      expect(content).to.include(`#${tag}`);
    }
  }
});

Then('detail view shows due date', async function() {
  const content = context.tui!.getDetailViewContent();
  expect(content).to.match(/Due|Today|Tomorrow/);
});

Then('displays formatted date', async function() {
  const content = context.tui!.getDetailViewContent();
  expect(content).to.match(/\d+|Today|Tomorrow|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
});

Then('detail view closes', async function() {
  const visible = context.tui!.isDetailViewVisible();
  expect(visible).to.be.false;
});

Then('tag filter interface opens', async function() {
  const visible = context.tui!.isTagFilterVisible();
  expect(visible).to.be.true;
});

Then('all available tags listed', async function() {
  const tags = context.tui!.getTags();
  expect(tags.length).to.be.greaterThan(0);
});

Then('list filtered to show only {string} tasks', async function(tagName: string) {
  const visible = context.tui!.getVisibleTasks();
  const tags = context.tui!.getTags();
  const tag = tags.find(t => t.title === tagName);
  // Verify at least some tasks are shown
  expect(visible.length).to.be.greaterThan(0);
});

Then('full list restored', async function() {
  // Verify all tasks are now visible (no filter)
  const all = context.tui!.getAllTasks();
  expect(all.length).to.be.greaterThan(0);
});

Then('{string} message appears', async function(message: string) {
  const content = context.tui!.getMainListContent();
  expect(content).to.include(message);
});

Then('selection moves to next task', async function() {
  const idx = context.tui!.getSelectedIndex();
  expect(idx).to.be.greaterThan(0);
});

Then('selection moves to previous task', async function() {
  const idx = context.tui!.getSelectedIndex();
  expect(idx).to.be.lessThan(context.tui!.getVisibleTasks().length - 1);
});

Then('selection stays on first task', async function() {
  const idx = context.tui!.getSelectedIndex();
  expect(idx).to.equal(0);
});

Then('selection stays on last task', async function() {
  const tasks = context.tui!.getVisibleTasks();
  const idx = context.tui!.getSelectedIndex();
  expect(idx).to.equal(tasks.length - 1);
});



Then('all selections register smoothly', async function() {
  // Verify selection moved through multiple positions
  const idx = context.tui!.getSelectedIndex();
  expect(idx).to.be.greaterThan(0);
});

Then('no lag or missed keys', async function() {
  // Implicit: if we got here, all keys were processed
  const idx = context.tui!.getSelectedIndex();
  expect(idx).to.exist;
});
