import React from 'react';

const ICONS = {
  critical: '🚨',
  warning:  '⚠️',
  improve:  '🔧',
  tip:      '💡',
};

export default function SuggestionsPanel({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="suggestions-panel">
      <div className="section-title">Suggestions to Improve</div>
      <div className="suggestion-list">
        {suggestions.map((s, i) => (
          <div key={i} className={`suggestion-item ${s.type}`}>
            <span className="suggestion-icon">{ICONS[s.type] || '•'}</span>
            <span>{s.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}