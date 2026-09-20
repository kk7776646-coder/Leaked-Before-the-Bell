import { isValidCompactJws } from './supabase';

console.log('Running Supabase Key Validator Unit Tests...');

const testCases = [
  { key: 'sb_secret_test', expected: true, description: 'sb_secret_test should be true' },
  { key: 'abc.def.ghi', expected: true, description: 'syntactically valid 3-part JWT should be true' },
  { key: '', expected: false, description: 'empty string should be false' },
  { key: 'arbitrary_string', expected: false, description: 'arbitrary string should be false' },
  { key: undefined, expected: false, description: 'undefined should be false' },
  { key: 'sb_secret_', expected: false, description: 'only sb_secret_ without payload should be false' },
];

let passedCount = 0;
let failedCount = 0;

for (const tc of testCases) {
  const result = isValidCompactJws(tc.key);
  if (result === tc.expected) {
    passedCount++;
    console.log(`✓ PASS: ${tc.description}`);
  } else {
    failedCount++;
    console.error(`✗ FAIL: ${tc.description} (Got ${result}, expected ${tc.expected})`);
  }
}

console.log(`\nTest Summary: ${passedCount} passed, ${failedCount} failed.`);

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('All validator tests passed successfully!');
  process.exit(0);
}
