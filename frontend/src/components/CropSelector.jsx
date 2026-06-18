import React from 'react';

const CROPS = [
  { value: '', label: 'Select Crop (optional)', emoji: '🌾' },
  { value: 'beans', label: 'Beans / Rajma', emoji: '🫘' },
  { value: 'potato', label: 'Potato', emoji: '🥔' },
  { value: 'wheat', label: 'Wheat', emoji: '🌾' },
  { value: 'millet', label: 'Millet (Mandua)', emoji: '🌿' },
  { value: 'tomato', label: 'Tomato', emoji: '🍅' },
  { value: 'peas', label: 'Peas', emoji: '🫛' },
  { value: 'ginger', label: 'Ginger', emoji: '🌱' },
  { value: 'turmeric', label: 'Turmeric', emoji: '🌿' },
  { value: 'other', label: 'Other', emoji: '🪴' },
];

export default function CropSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4 text-forest-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm bg-forest-50 border border-forest-200 text-forest-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent cursor-pointer transition-colors hover:bg-forest-100 min-w-[180px]"
      >
        {CROPS.map((crop) => (
          <option key={crop.value} value={crop.value}>
            {crop.emoji} {crop.label}
          </option>
        ))}
      </select>
    </div>
  );
}
