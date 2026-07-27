const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Initialize Gemini Client ────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback models to cycle through if a model hits rate-limits (429) or is unavailable (404)
const FALLBACK_MODELS = [
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-pro-latest'
];

// Helper to execute a task with fallback models
async function runWithFallback(taskFn) {
    let lastError = null;
    for (const modelName of FALLBACK_MODELS) {
        try {
            return await taskFn(modelName);
        } catch (error) {
            console.warn(`Model ${modelName} failed. Error: ${error.message || error}. Trying next model...`);
            lastError = error;
        }
    }
    throw new Error(`All Gemini models failed. Last error: ${lastError ? lastError.message : 'Unknown'}`);
}

// Helper: Convert OpenAI-style messages → Gemini format
function toGeminiHistory(messages) {
    return messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));
}

// ─── 1. Symptom Analysis / Chat ─────────────────────────────────────────────
exports.analyzeSymptoms = async (messages) => {
    return runWithFallback(async (modelName) => {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: `You are a helpful medical assistant for the MediAI platform. Your goal is to help users understand their symptoms and guide them to the right specialist.

RULES:
1. Never provide a final medical diagnosis or prescribe medication.
2. Gently ask follow-up questions to clarify symptoms (duration, severity, triggers).
3. Suggest possible next steps (e.g., rest, hydration).
4. Recommend the type of doctor/specialist if appropriate (e.g., "Consider seeing a cardiologist for chest-related concerns").
5. EMERGENCY PROTOCOL: If the user mentions chest pain, severe breathing difficulty, fainting, or uncontrolled bleeding, strongly advise seeking emergency care immediately.
6. MANDATORY DISCLAIMER: Every response MUST end with: "Disclaimer: This is not medical advice. Please consult a healthcare professional for diagnosis and treatment."`,
        });

        const history = messages.slice(0, -1);
        const lastMessage = messages[messages.length - 1];

        const rawHistory = toGeminiHistory(history);
        const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
        const geminiHistory = firstUserIdx === -1 ? [] : rawHistory.slice(firstUserIdx);

        const chat = model.startChat({
            history: geminiHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(lastMessage.content);
        return result.response.text();
    });
};

// ─── 2. Medical Report Analyzer ─────────────────────────────────────────────
exports.analyzeMedicalReport = async (reportText) => {
    return runWithFallback(async (modelName) => {
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `You are a medical report analyst. Your task is to explain complex medical jargon from laboratory reports in simple, easy-to-understand language for a patient. Identify key findings, what they mean, and potential next steps to discuss with a doctor. Always include a medical disclaimer.

Analyze this medical report and explain it simply:
${reportText}`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    });
};

// ─── 3. Personalized Diet Plan ───────────────────────────────────────────────
exports.generateDietPlan = async (userProfile) => {
    return runWithFallback(async (modelName) => {
        const {
            name, bloodGroup, gender, bio, dateOfBirth,
            weight, height, activityLevel, goal,
            medicalConditions, allergies, foodPreference
        } = userProfile;

        const age = dateOfBirth
            ? Math.floor((new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
            : 'Unknown';

        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `You are a professional nutritionist and dietitian. Create a highly personalized, detailed, and structured nutrition and diet plan using the following health data.

## Patient Profile:
- **Name:** ${name || 'Patient'}
- **Age:** ${age} years
- **Gender:** ${gender || 'Not specified'}
- **Blood Group:** ${bloodGroup || 'Not specified'}
- **Weight:** ${weight ? weight + ' kg' : 'Not specified'}
- **Height:** ${height ? height + ' cm' : 'Not specified'}
- **Activity Level:** ${activityLevel || 'Not specified'}
- **Primary Goal:** ${goal || 'General health'}
- **Medical Conditions:** ${medicalConditions || 'None'}
- **Food Allergies/Intolerances:** ${allergies || 'None'}
- **Food Preference:** ${foodPreference || 'No preference'}
- **Medical Background:** ${bio || 'None'}

## Instructions:
1. Calculate approximate daily calorie needs based on the above data.
2. Create a full day meal plan: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner.
3. For each meal, provide specific Indian food options with approximate portions.
4. Add a "Foods to Avoid" section based on their conditions and allergies.
5. Add a "Weekly Tips" section with 3 practical nutrition tips.
6. End with a medical disclaimer.

Format the response with clear headings and bullet points.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    });
};

// ─── 4. Daily Health Tip ─────────────────────────────────────────────────────
exports.getHealthTip = async (userProfile) => {
    try {
        if (!userProfile) {
            return 'Keep moving! A 30-minute walk every day can significantly improve your cardiovascular health.';
        }

        return await runWithFallback(async (modelName) => {
            const { bloodGroup, gender, dateOfBirth } = userProfile;
            const age = dateOfBirth
                ? Math.floor((new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                : 'Unknown';

            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `You are a medical advisor. Provide a single, concise, and helpful daily health tip (max 2 sentences) based on the user health profile. Be encouraging but clinical.

User Profile - Age: ${age}, Gender: ${gender}, Blood Group: ${bloodGroup}. Provide a health tip.`;

            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    } catch (error) {
        console.error('Health Tip Error:', error.message || error);
        return 'Stay hydrated and maintain a balanced lifestyle for optimal health.';
    }
};
