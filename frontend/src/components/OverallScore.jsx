import React from 'react';

const COLORS = ['#ff4560','#ff8a3d','#ffb830','#4f7cff','#22d97a'];
const LABELS = ['Very Weak','Weak','Fair','Strong','Very Strong'];

export default function OverallScore({ result }) {
  const score  = result.overallScore;
  const color  = COLORS[score];
  const label  = LABELS[score];
  const pct    = ((score + 1) / 5) * 100;
  const R      = 42;
  const circ   = 2 * Math.PI * R;
  const dash   = (pct / 100) * circ;

  return (
    <div className="score-card" style={{ '--accent-col': color }}>
      {/* Animated ring */}
      <div className="score-ring">
        <svg width="110" height="110" viewBox="0 0 110 110">
          {/* Track */}
          <circle cx="55" cy="55" r={R} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
          {/* Fill */}
          <circle cx="55" cy="55" r={R} fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.75s cubic-bezier(.4,0,.2,1), stroke .4s ease',
              filter: `drop-shadow(0 0 8px ${color}60)`,
            }}
          />
        </svg>
        <div className="score-ring-inner">
          <span className="score-num" style={{ color }}>{score}</span>
          <span className="score-denom">/ 4</span>
        </div>
      </div>

      {/* Label */}
      <div className="score-label" style={{ color }}>{label}</div>

      {/* Meta */}
      <div className="score-meta">
        Entropy:&nbsp;<strong style={{ color: '#22d4e6' }}>{result.entropy.bits} bits</strong>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Charset:&nbsp;<strong style={{ color: '#22d4e6' }}>{result.entropy.charsetSize}</strong>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        {result.entropy.combinations.toExponential(2)} combinations
      </div>
    </div>
  );
}