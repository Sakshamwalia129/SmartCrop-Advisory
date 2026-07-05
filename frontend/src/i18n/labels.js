/**
 * UI label translations for AdvisoryCard section headings.
 * Add new languages here — components consume this object instead of
 * hardcoding strings, keeping every translation in one place.
 */
export const SECTION_LABELS = {
  en: {
    // Advisory section headings
    possibleCause: 'Possible Cause',
    immediateAction: 'Immediate Action',
    organicTreatment: 'Organic Treatment',
    // Risk badge labels
    riskLabels: {
      Low: 'Low Risk',
      Medium: 'Medium Risk',
      High: 'High Risk',
      Unknown: 'Unknown Risk',
      'N/A': 'N/A',
    },
  },
  hi: {
    // Advisory section headings
    possibleCause: 'संभावित कारण',
    immediateAction: 'तुरंत क्या करें',
    organicTreatment: 'जैविक उपचार',
    // Risk badge labels
    riskLabels: {
      Low: 'कम जोखिम',
      Medium: 'मध्यम जोखिम',
      High: 'उच्च जोखिम',
      Unknown: 'अज्ञात जोखिम',
      'N/A': 'लागू नहीं',
    },
  },
};

/**
 * Returns the label map for the given language code.
 * Falls back to English if the language is not found.
 *
 * @param {string} lang - Language code, e.g. 'en' | 'hi'
 * @returns {Record<string, string>}
 */
export function getLabels(lang) {
  return SECTION_LABELS[lang] ?? SECTION_LABELS.en;
}
