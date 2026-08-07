import { expect, test } from 'vitest';

test('the unit test runner is configured', () => {
  expect(import.meta.env.MODE).toBe('test');
});
