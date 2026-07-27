/**
 * Gemini API Connectivity Test
 * ─────────────────────────────
 * Run this script BEFORE starting the server to verify your API key works.
 *
 * Usage:
 *   node test_gemini.js
 *
 * Make sure GEMINI_API_KEY is set in server/.env before running.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

async function runTest() {
    console.log('\n🔍 ─── Gemini API Connectivity Test ───────────────────────\n');

    // ── Step 1: Check if key exists ──────────────────────────────────────────
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
        console.error('❌ FAIL: GEMINI_API_KEY is not set in server/.env');
        console.error('   → Get a free key from: https://aistudio.google.com/app/apikey');
        console.error('   → Then paste it in: server/.env  →  GEMINI_API_KEY=AIza...\n');
        process.exit(1);
    }

    console.log('✅ PASS: GEMINI_API_KEY is present in .env');
    console.log(`   → Key starts with: ${API_KEY.substring(0, 8)}...`);

    // ── Step 2: Try a simple API call ────────────────────────────────────────
    try {
        console.log('\n⏳ Sending test message to Gemini (gemini-1.5-flash)...\n');

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(
            'Say "Hello from MediAI! Gemini API is working correctly." and nothing else.'
        );

        const text = result.response.text();

        console.log('✅ PASS: Gemini API responded successfully!');
        console.log('─'.repeat(55));
        console.log('📨 Response:', text.trim());
        console.log('─'.repeat(55));
        console.log('\n🎉 All tests passed! Your chatbot should work correctly.\n');
    } catch (err) {
        console.error('\n❌ FAIL: Gemini API call failed!');
        console.error('   Error:', err.message);

        // ── Friendly error hints ──────────────────────────────────────────────
        if (err.message.includes('API_KEY_INVALID') || err.message.includes('400')) {
            console.error('\n   💡 Hint: Your API key is invalid or malformed.');
            console.error('      → Generate a new key at: https://aistudio.google.com/app/apikey');
        } else if (err.message.includes('403') || err.message.includes('PERMISSION_DENIED')) {
            console.error('\n   💡 Hint: API key permissions denied.');
            console.error('      → Make sure the key has no IP/referrer restrictions.');
            console.error('      → Make sure "Generative Language API" is enabled.');
        } else if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) {
            console.error('\n   💡 Hint: Rate limit / quota exceeded.');
            console.error('      → Free tier allows 15 req/min. Wait a moment and retry.');
        } else if (err.message.includes('404') || err.message.includes('NOT_FOUND')) {
            console.error('\n   💡 Hint: Model not found. "gemini-1.5-flash" should be available.');
            console.error('      → Check: https://ai.google.dev/models/gemini');
        } else if (err.code === 'ENOTFOUND' || err.message.includes('network')) {
            console.error('\n   💡 Hint: Network error — check your internet connection.');
        }

        process.exit(1);
    }
}

runTest();
