import React from 'react';

// Risk level visual config
const RISK_CONFIG = {
  Low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500', label: 'Low Risk' },
  Medium: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Medium Risk' },
  High: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500', label: 'High Risk' },
  Unknown: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400', label: 'Unknown Risk' },
  'N/A': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-300', label: 'N/A' },
};

// Ordered advisory sections
const SECTIONS = [
  {
    key: 'possibleCause',
    label: 'Possible Cause',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    key: 'immediateAction',
    label: 'Immediate Action',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'organicTreatment',
    label: 'Organic Treatment',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-100',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    key: 'whenToContactOfficer',
    label: 'When to Contact Officer',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
];

/**
 * Returns true if a field value should be hidden.
 * Hides null, undefined, empty string, "N/A", "n/a".
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  const s = String(value).trim();
  return s === '' || s.toLowerCase() === 'n/a';
}

/**
 * AdvisoryCard renders structured AI advisory data.
 *
 * Accepts data from two sources:
 *  1. POST /api/chat → res.data (flat object with conversationId + advisory fields)
 *  2. GET /api/chat/history → item.response (nested advisory object, no conversationId)
 *
 * Both shapes contain riskLevel, possibleCause, immediateAction, organicTreatment,
 * whenToContactOfficer, disclaimer — so the same component works for both.
 */
export default function AdvisoryCard({ data }) {
  if (!data) return null;

  const riskLevel = data.riskLevel || 'Unknown';
  const risk = RISK_CONFIG[riskLevel] || RISK_CONFIG['Unknown'];
  const showRiskBadge = riskLevel !== 'N/A';

  // Count visible sections so we can show a fallback if all are empty
  const visibleSections = SECTIONS.filter(({ key }) => !isEmpty(data[key]));

  return (
    <div className="w-full space-y-3">
      {/* Risk Level Badge */}
      {showRiskBadge && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${risk.bg} ${risk.border}`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${risk.dot}`} />
          <span className={`text-sm font-semibold ${risk.text}`}>{risk.label}</span>
        </div>
      )}

      {/* No sections at all — shouldn't normally happen, but graceful fallback */}
      {visibleSections.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No detailed advisory available. Please consult an agricultural extension officer.
        </p>
      )}

      {/* Advisory section cards */}
      <div className="grid gap-2.5">
        {visibleSections.map(({ key, label, icon, color, bg, border }) => (
          <div key={key} className={`rounded-xl border ${border} ${bg} p-3.5`}>
            <div className={`flex items-center gap-2 mb-1.5 ${color}`}>
              {icon}
              <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{data[key]}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      {!isEmpty(data.disclaimer) && (
        <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2.5 leading-relaxed">
          ⚠ {data.disclaimer}
        </p>
      )}
    </div>
  );
}
