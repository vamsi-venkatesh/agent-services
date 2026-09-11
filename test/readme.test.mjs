import test from 'node:test';
import assert from 'node:assert/strict';
import { readmeErrors } from '../tools/readme-check.mjs';

test('every number in the README comes from the data', () => {
  assert.deepEqual(readmeErrors(), []);
});
