import React, { useState } from 'react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-start gap-2.5 px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex-shrink-0">
      <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd" />
      </svg>
      <p className="text-xs text-amber-800 leading-relaxed flex-1">
        <span className="font-semibold">Advisory Disclaimer: </span>
        AI-generated recommendations should always be verified with a licensed agricultural extension officer before application.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-700 flex-shrink-0 transition-colors"
        aria-label="Dismiss disclaimer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
