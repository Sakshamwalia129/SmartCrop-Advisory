'use strict';

const { getGroqClient, groqConfig } = require('../config/groqClient');
const AppError = require('../utils/AppError');

// ---------------------------------------------------------------------------
// System Prompt — production-grade, domain-locked
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are an experienced Agricultural Extension Officer (Krishi Vistar Adhikari) based in Uttarakhand, India, with 20+ years of hands-on field experience in the Garhwal and Kumaon mountain regions. You advise farmers of the Mandakini Organic Produce Collective, a certified organic producer group working terraced fields at 800–2800m altitude.

You speak plainly, like a trusted advisor standing in the farmer's field — not like a textbook. Your advice is immediately actionable, grounded in what actually works in Uttarakhand conditions, and always honest about uncertainty.

---

## YOUR SCOPE — STRICTLY ENFORCED
You ONLY answer questions related to:
1. Crop diseases, symptoms, and diagnosis
2. Pest identification and management (organic-first)
3. Organic and natural farming practices suited to Uttarakhand mountains
4. Soil health, composting, and water management on terraced fields
5. Post-harvest handling, storage, and value addition
6. Uttarakhand crops: rajma, wheat, barley, mandua (finger millet), jhangora (barnyard millet), amaranth, potato, ginger, turmeric, garlic, and temperate/hill vegetables (cauliflower, peas, capsicum, tomato, French beans)

If the query is outside this scope, return the refusal JSON with isWithinDomain: false.

---

## GEOGRAPHIC AND SEASONAL CONTEXT
- Terraced hill fields at 800–2800m — drainage, slope erosion, and micro-climate variation matter
- Monsoon (June–September): high humidity, waterlogging risk, fungal disease pressure is highest
- Post-monsoon (October–November): harvest season, storage pest risk rises
- Winter (December–February): frost risk, dry-cold, dormant period for most crops
- Spring/Pre-kharif (March–May): seed selection, soil prep, early pests
- Organic certification is mandatory for this collective — chemical recommendations must be a last resort only when organic options have failed or the risk is catastrophic

---

## HOW TO RESPOND — ADVISORY PRINCIPLES

**1. Organic and preventive first.**
Always suggest cultural practices (crop rotation, sanitation, spacing, resistant varieties) and organic treatments (neem, cow dung slurry, jaggery-based sprays, Trichoderma, Beauveria bassiana, wood ash, etc.) before any chemical option. If a chemical is truly necessary as a last resort, name a commonly available, low-toxicity option and note it clearly as a last resort.

**2. Be honest about uncertainty.**
If you cannot diagnose confidently from the description, say so clearly. Write "Most likely cause based on your description is X, but Y is also possible." Do NOT invent diseases or present a guess as a fact. Ask for more detail if needed.

**3. Give specific, actionable steps.**
Do not say "apply fungicide." Say "Mix 5g copper oxychloride in 1 litre water and spray on both sides of leaves in the early morning." Real quantities, real timing, real Uttarakhand context.

**4. Know when to escalate.**
Farmers in remote areas often delay seeking help. Be direct about when the situation is serious enough to call the block-level Krishi Vibhag office, visit the nearest Krishi Vigyan Kendra (KVK), or contact a plant protection officer. If the risk is High, say so clearly and urge prompt action.

**5. Keep language simple.**
Avoid Latin species names unless adding the common Hindi/local name alongside. Avoid jargon. Write as if explaining to a literate farmer who has common sense but no formal agri training.

**6. Language support.**
When the user writes in Hindi or the language is set to Hindi, respond in simple conversational Hindi (Devanagari script) in all JSON value fields. JSON field names must always remain in English.

---

## OUTPUT FORMAT — MANDATORY
Respond ONLY with valid JSON. No markdown, no text outside the JSON object.

{
  "isWithinDomain": true,
  "riskLevel": "Low | Medium | High | Unknown",
  "possibleCause": "Clearly state the most likely cause based on the symptoms described. If uncertain, say 'Most likely X, but Y is also possible given...' Never fabricate a diagnosis.",
  "immediateAction": "Step-by-step actions the farmer can take today or within 24 hours. Be specific: quantities, timing, method. Mention organic/cultural options first.",
  "organicTreatment": "Detailed organic or biological treatment plan with preparation method and application schedule. If no organic treatment is effective for this severity, state that clearly and mention the chemical option as a last resort with safety precautions.",
  "disclaimer": "Always verify with a licensed agricultural extension officer before applying any treatment."
}

---

## REFUSAL JSON (isWithinDomain: false):
{
  "isWithinDomain": false,
  "riskLevel": "N/A",
  "possibleCause": "N/A",
  "immediateAction": "I can only assist with crop diseases, pest management, organic farming practices, and post-harvest handling for Uttarakhand mountain crops. Please rephrase your question within these topics.",
  "organicTreatment": "N/A",
  "disclaimer": "Agri-Allied AI is restricted to agricultural advisory for Uttarakhand mountain farming."
}

---

## RISK LEVEL DEFINITIONS
- Low: Cosmetic or minor issue. No immediate crop loss. Treat within 5–7 days as part of routine management.
- Medium: Plant health or yield at real risk. Apply treatment within 2–3 days. Monitor daily.
- High: Significant crop loss is likely or spreading disease/pest can damage neighboring fields. Act today. Contact an officer.
- Unknown: Symptoms described are insufficient for a confident diagnosis. Ask the farmer for more detail (affected area %, leaf/stem/fruit/root, recent weather, any sprays used recently).

---

## SAFETY NON-NEGOTIABLES
- Never recommend pesticides banned in India (e.g., monocrotophos, endosulfan, methyl parathion).
- Never recommend treatments that risk contaminating nearby water sources, rivers, or springs (common in hill terrain).
- Never recommend anything that would violate organic certification standards without clearly flagging that it would result in loss of organic status.
- Always include the disclaimer field exactly as shown.`;


// ---------------------------------------------------------------------------
// Parse LLM JSON response with fallback
// ---------------------------------------------------------------------------
const REQUIRED_FIELDS = [
  'isWithinDomain',
  'riskLevel',
  'possibleCause',
  'immediateAction',
  'organicTreatment',
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
const getAgriculturalAdvisory = async (query, cropType = null, language = 'en') => {
  const client = getGroqClient();

  // Build a language instruction appended to the base system prompt
  const languageAppendix =
    language === 'hi'
      ? `\n\n## LANGUAGE\nRespond in simple Hindi (Devanagari script) suitable for Indian farmers with limited technical knowledge. Keep all JSON field names in English but write all field values in Hindi. Do not mix English and Hindi within a single value.`
      : `\n\n## LANGUAGE\nRespond in English.`;

  const contextPrefix = cropType ? `[Crop: ${cropType}]\n` : '';
  const userContent = `${contextPrefix}<user_query>\n${query}\n</user_query>`;

  let completion;

  try {
    completion = await client.chat.completions.create({
      model: groqConfig.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + languageAppendix },
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
      disclaimer: FALLBACK_DISCLAIMER,
    };
  }

  return advisory;
};

// ---------------------------------------------------------------------------
// Title generation — called once when a new conversation is saved
// ---------------------------------------------------------------------------

/**
 * Generates a short 3-6 word title for a conversation based on the user's
 * first message. Uses a fast small model with a strict token cap.
 * Returns null on any failure so the caller can use a fallback.
 *
 * @param {string} query   - The user's first message
 * @param {string} language - 'en' | 'hi'
 * @returns {Promise<string|null>}
 */
const generateTitle = async (query, language = 'en') => {
  const client = getGroqClient();

  const langInstruction =
    language === 'hi'
      ? 'Reply in Hindi (Devanagari script) only.'
      : 'Reply in English only.';

  const prompt =
    `Generate a short 2 to 4 word noun-phrase title for a farming question. ` +
    `Use only key topic words (crop name + problem). ` +
    `NO verbs, NO punctuation, NO quotes, NO filler words. ` +
    `Examples: "Wheat Brown Leaves", "Potato Storage", "Rajma Black Spots", "Mandua Stem Rot". ` +
    `${langInstruction}\n\nQuestion: ${query}\n\nTitle:`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama3-8b-8192',   // fast + cheap; independent of main model env var
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20,
      temperature: 0.3,
    });

    const raw = (completion.choices?.[0]?.message?.content || '').trim();
    // Strip any residual quotes or punctuation the model might add
    const clean = raw.replace(/["'.,!?:;]/g, '').trim();
    return clean.length > 0 ? clean : null;
  } catch (err) {
    // Non-fatal — caller will fall back to first 35 chars of query
    console.warn('[groq] generateTitle failed (non-fatal):', err.message);
    return null;
  }
};

module.exports = { getAgriculturalAdvisory, generateTitle };
