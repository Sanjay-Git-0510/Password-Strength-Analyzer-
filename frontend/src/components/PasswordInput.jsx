import React from 'react';

const SCFG = [
  { label: 'Very Weak',   color: '#ff4560' },
  { label: 'Weak',        color: '#ff8a3d' },
  { label: 'Fair',        color: '#ffb830' },
  { label: 'Strong',      color: '#4f7cff' },
  { label: 'Very Strong', color: '#22d97a' },
];

export default function PasswordInput({
  password, onChange, showPassword, onToggleVisibility,
  onAnalyze, loading, realtimeStrength,
}) {
  const s = realtimeStrength;
  const cfg = s ? SCFG[s.score] : null;
  const pct = s ? ((s.score + 1) / 5) * 100 : 0;

  const hasL = /[a-z]/.test(password);
  const hasU = /[A-Z]/.test(password);
  const hasD = /\d/.test(password);
  const hasS = /[^a-zA-Z\d]/.test(password);

  return (
    <div className="input-card">
      <label className="input-label" htmlFor="pwd">Enter Password to Analyze</label>

      <div className="input-row">
        <div className="input-wrap">
          <input
            id="pwd"
            className="pwd-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onAnalyze()}
            placeholder="Type or paste your password..."
            autoComplete="off"
            spellCheck={false}
          />
          <button className="eye-btn" onClick={onToggleVisibility} type="button"
            title={showPassword ? 'Hide' : 'Show'}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <button
          className="analyze-btn"
          onClick={onAnalyze}
          disabled={loading || !password}
          type="button"
        >
          {loading ? '⟳ Analyzing…' : '⚡ Analyze'}
        </button>
      </div>

      {password && s && (
        <div className="strength-wrap">
          {/* Label + value */}
          <div className="strength-top">
            <span className="strength-lbl">Strength</span>
            <span className="strength-val" style={{ color: cfg?.color }}>{cfg?.label}</span>
          </div>

          {/* Main bar */}
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${pct}%`, background: cfg?.color }} />
          </div>

          {/* 5 segments */}
          <div className="seg-row">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="seg" style={{
                background: i <= s.score ? SCFG[i].color : undefined,
                opacity: i <= s.score ? 1 : 0.15,
              }} />
            ))}
          </div>

          {/* Entropy row */}
          <div className="entropy-row">
            <span>⚡ Entropy:</span>
            <span className="eval">{s.entropy.toFixed(1)} bits</span>
            <span className="edot">·</span>
            <span>Charset: <span className="eval">{s.charsetSize}</span></span>
            <span className="edot">·</span>
            <span>Length: <span className="eval">{s.length}</span></span>
          </div>

          {/* Character type badges */}
          <div className="badge-row">
            {[
              { label: 'Lowercase', ok: hasL },
              { label: 'Uppercase', ok: hasU },
              { label: 'Numbers',   ok: hasD },
              { label: 'Special',   ok: hasS },
            ].map(b => (
              <span key={b.label} className={`cbadge ${b.ok ? 'yes' : 'no'}`}>
                {b.ok ? '✓' : '✗'} {b.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}