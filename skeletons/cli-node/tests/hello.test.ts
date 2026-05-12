import { test } from 'node:test';
import assert from 'node:assert/strict';
import { helloCommand } from '../src/commands/hello.js';

test('hello command exposes its name', () => {
  const cmd = helloCommand();
  assert.equal(cmd.name(), 'hello');
});
