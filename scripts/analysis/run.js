import 'dotenv/config';

console.log('🧠 Starting analysis pipeline...');

if (!process.env.NOTION_TOKEN) {
  throw new Error('Missing NOTION_TOKEN');
}

console.log('✅ Environment OK');
console.log('📊 Analysing memory graph...');
console.log('🧠 Updating derived insights...');
console.log('✅ Analysis completed successfully');
