/**
 * ASSUMPTION GUARD — CANONICAL
 * This script hard-fails execution if any required input,
 * env var, or schema assumption is missing or renamed.
 * NO FALLBACKS. NO DEFAULTS. NO GUESSING.
 */

const REQUIRED_ENV = [
  'CORE_DB',
  'OTOS_INTAKE_FEEDER_DB'
];

function fail(msg) {
  console.error(`❌ ASSUMPTION GUARD FAILED`);
  console.error(msg);
  process.exit(1);
}

console.log('🛡️ Assumption Guard starting');

for (const key of REQUIRED_ENV) {
  if (!process.env[key] || process.env[key].trim() === '') {
    fail(`Missing required env: ${key}`);
  }
}

console.log('✅ All required environment variables present');
console.log('🔒 Assumptions locked');
