import React from 'react';

const EXAMPLES = [
  { text: 'My beans have yellow spots on the leaves.', crop: 'beans', emoji: '🫘' },
  { text: 'Wheat leaves are turning brown at the edges.', crop: 'wheat', emoji: '🌾' },
  { text: 'How should I store harvested potatoes?', crop: 'potato', emoji: '🥔' },
  { text: 'Potato leaves are curling inward. What is wrong?', crop: 'potato', emoji: '🥔' },
  { text: 'What organic spray can I use for aphids on tomato?', crop: 'tomato', emoji: '🍅' },
];

export default function EmptyState({ onSelectExample }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      {/* Illustration */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center mb-5 shadow-sm">
        <span className="text-4xl">🌿</span>
      </div>

      <h2 className="text-xl font-semibold text-forest-900 mb-1">Agri-Allied AI</h2>
      <p className="text-sm text-gray-500 mb-1 max-w-xs leading-relaxed">
        AI-powered crop advisory for Uttarakhand mountain farming
      </p>
      <p className="text-xs text-gray-400 mb-8 max-w-sm">
        Ask about crop diseases, pests, organic treatment, or post-harvest handling.
      </p>

      {/* Example chips */}
      <div className="w-full max-w-md space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Try an example
        </p>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.text}
            onClick={() => onSelectExample(ex.text, ex.crop)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-green-100 hover:border-forest-300 hover:bg-forest-50 text-left transition-all duration-150 shadow-sm hover:shadow group"
          >
            <span className="text-lg flex-shrink-0">{ex.emoji}</span>
            <span className="text-sm text-gray-600 group-hover:text-forest-800 leading-snug">
              {ex.text}
            </span>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-forest-500 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
