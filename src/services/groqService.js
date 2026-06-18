'use strict';

const { getGroqClient, groqConfig } = require('../config/groqClient');
const AppError = require('../utils/AppError');

// ---------------------------------------------------------------------------
// System Prompt — production-grade, domain-locked
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are Agri-Allied AI, an agricultural advisory assistant exclusively for field supervisors of Mandakini Organic Produce Collective operating in Uttarakhand mountain farming conditions (altitudes 800m–2800m, Garhwal and Kumaon regions, India).

## YOUR SCOPE — STRICTLY ENFORCED
You ONLY answer questions related to:
1. Crop diseases and symptoms
2. Pest identification and organic pest management
3. Organic and natural farming practices
4. Post-harvest handling, storage, and processing
5. Uttarakhand mountain crops: rajma (kidney beans), wheat, barley, mandua (finger millet), jhangora (barnyard millet), amaranth, potato, ginger, turmeric, and temperate vegetables

## REFUSAL RULE
If the query is outside the above scope, respond with the refusal JSON and set isWithinDomain to false. Do not partially answer. Redirect briefly.

## GEOGRAPHIC CONTEXT
- High altitude terraced fields (800–2800m)
- Monsoon June–September (high humidity, fungal risk)
- Dry winters with frost risk
- Organic methods preferred
- Limited access to extension officers — advice must be immediately actionable

## OUTPUT FORMAT — MANDATORY
Respond ONLY with valid JSON. No markdown, no text outside the JSON.

{
  "isWithinDomain": true,
  "riskLevel": "Low | Medium | High | Unknown",
  "possibleCause": "...",
  "immediateAction": "...",
  "organicTreatment": "...",
  "whenToContactOfficer": "...",
  "disclaimer": "Always verify with a licensed agricultural extension officer before applying any treatment."
}

## REFUSAL JSON (isWithinDomain false):
{
  "isWithinDomain": false,
  "riskLevel": "N/A",
  "possibleCause": "N/A",
  "immediateAction": "I can only assist with crop diseases, pest management, organic farming, and post-harvest handling for Uttarakhand mountain crops. Please rephrase your question within these topics.",
  "organicTreatment": "N/A",
  "whenToContactOfficer": "N/A",
  "disclaimer": "Agri-Allied AI is restricted to agricultural advisory for Uttarakhand mountain farming."
}

## RISK LEVELS
- Low: Cosmetic issue, treat within 1 week
- Medium: Plant health at risk, treat within 2–3 days
- High: Crop loss likely, treat immediately
- Unknown: Insufficient info — ask for clarification in immediateAction

## SAFETY
Never recommend banned pesticides or treatments that could harm nearby water sources or livestock. Always include the disclaimer.`;

// ---------------------------------------------------------------------------
// Parse LLM JSON response with fallback
// ---------------------------------------------------------------------------
const REQUIRED_FIELDS = [
  'isWithinDomain',
  'riskLevel',
  'possibleCause',
  'immediateAction',
  'organicTreatment',
  'whenToContactOfficer',
  'disclaimer',
];

const VALID_RISK_LEVELS = ['Low', 'Medium', 'High', 'Unknown', 'N/A'];

const FALLBACK_DISCLAIMER =
  'Always verify with a licensed agricultural extension officer before applying any treatment.';

const parseResponse = (raw) => {
  let parsed;

  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  // Inject defaults for any missing fields
  for (const field of REQUIRED_FIELDS) {
    if (parsed[field] === undefined || parsed[field] === null) {
      if (field === 'isWithinDomain') parsed[field] = true;
      else if (field === 'riskLevel') parsed[field] = 'Unknown';
      else if (field === 'disclaimer') parsed[field] = FALLBACK_DISCLAIMER;
      else parsed[field] = 'Please consult an agricultural extension officer.';
    }
  }

  if (!VALID_RISK_LEVELS.includes(parsed.riskLevel)) {
    parsed.riskLevel = 'Unknown';
  }

  return parsed;
};

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------
const getAgriculturalAdvisory = async (query, cropType = null) => {
  const client = getGroqClient();

  const contextPrefix = cropType ? `[Crop: ${cropType}]\n` : '';
  const userContent = `${contextPrefix}<user_query>\n${query}\n</user_query>`;

  let completion;

  try {
    completion = await client.chat.completions.create({
      model: groqConfig.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_tokens: groqConfig.maxTokens,
      temperature: groqConfig.temperature,
      response_format: { type: 'json_object' },
    });
  } catch (err) {
    console.error('[groq] API call failed:', err.message);
    throw new AppError(
      'Advisory service temporarily unavailable. Please try again.',
      503,
      'LLM_SERVICE_ERROR'
    );
  }

  const raw = completion.choices?.[0]?.message?.content || '';
  const advisory = parseResponse(raw);

  if (!advisory) {
    console.warn('[groq] JSON parse failed. Raw:', raw.substring(0, 200));
    return {
      isWithinDomain: true,
      riskLevel: 'Unknown',
      possibleCause: 'Could not process the response.',
      immediateAction: 'Please rephrase your question or contact your nearest Krishi Vigyan Kendra.',
      organicTreatment: 'N/A',
      whenToContactOfficer: 'If the issue is urgent, contact your extension officer immediately.',
      disclaimer: FALLBACK_DISCLAIMER,
    };
  }

  return advisory;
};

module.exports = { getAgriculturalAdvisory };
