import React, { useState } from 'react';

function ExplanationSection({ explanation }) {
  if (!explanation) return null;
  const items = [
    { key: 'What is it?',        val: explanation.what },
    { key: 'How it works',       val: explanation.how },
    { key: 'Real-world example', val: explanation.realWorld },
    { key: 'Advantage',          val: explanation.advantage },
    { key: 'Limitation',         val: explanation.limitation },
    { key: 'Protection',         val: explanation.mitigation },
  ].filter(i => i.val);

  return (
    <div className="explanation-body">
      {items.map(item => (
        <div className="explanation-item" key={item.key}>
          <div className="explanation-key">{item.key}</div>
          <div className="explanation-val">{item.val}</div>
        </div>
      ))}
    </div>
  );
}

export default function AttackCard({ attack, style }) {
  const [open, setOpen] = useState(false);

  const renderBody = () => {
    switch (attack.technique) {
      case 'Brute Force':                  return <BruteForceBody attack={attack} />;
      case 'Dictionary Attack':            return <DictionaryBody attack={attack} />;
      case 'Hybrid Attack':               return <HybridBody attack={attack} />;
      case 'Rainbow Table Attack':         return <RainbowBody attack={attack} />;
      case 'Credential Stuffing':          return <CredStuffBody attack={attack} />;
      case 'zxcvbn (Realistic Estimator)': return <ZxcvbnBody attack={attack} />;
      default: return null;
    }
  };

  return (
    <div className="attack-card" style={style}>
      <div className="attack-card-header">
        <div
          className="attack-icon"
          style={{ background: `${attack.color}18`, border: `1px solid ${attack.color}30` }}
        >
          {attack.icon}
        </div>
        <div>
          <div className="attack-title">{attack.technique}</div>
          <div className="attack-subtitle">Click below for full explanation</div>
        </div>
      </div>

      <div className="attack-card-body">{renderBody()}</div>

      <button className="explanation-toggle" onClick={() => setOpen(!open)}>
        <span>{open ? '▲ Hide Explanation' : '▼ How This Attack Works'}</span>
      </button>

      {open && <ExplanationSection explanation={attack.explanation} />}
    </div>
  );
}

function BruteForceBody({ attack }) {
  const { times, entropy } = attack;
  return (
    <>
      <div className="crack-time-display">
        <div className="crack-time-label">Estimated Crack Time</div>
      </div>
      <div>
        <div className="crack-time-row">
          <span className="label">🌐 Online (100 guess/s)</span>
          <span className="val" style={{ color: attack.color }}>{times.online}</span>
        </div>
        <div className="crack-time-row">
          <span className="label">🔒 Offline slow (bcrypt)</span>
          <span className="val">{times.offlineSlow}</span>
        </div>
        <div className="crack-time-row">
          <span className="label">⚡ Offline fast (GPU/MD5)</span>
          <span className="val">{times.offlineFast}</span>
        </div>
        <div className="crack-time-row">
          <span className="label">📐 Entropy</span>
          <span className="val" style={{ color: 'var(--cyan)' }}>{entropy.bits} bits</span>
        </div>
        <div className="crack-time-row">
          <span className="label">🔤 Charset size</span>
          <span className="val">{entropy.charsetSize} chars</span>
        </div>
      </div>
    </>
  );
}

function DictionaryBody({ attack }) {
  return (
    <>
      {attack.warning && <div className="warning-box danger">{attack.warning}</div>}
      <div className="crack-time-display">
        <div className="crack-time-label">Crack Time</div>
        <div className="crack-time-value" style={{ color: attack.isCommonPassword ? 'var(--red)' : attack.color }}>
          {attack.time}
        </div>
      </div>
      {attack.isCommonPassword
        ? <div className="warning-box danger">⛔ Exact match in common password lists</div>
        : <div className="warning-box safe">✅ Not found in common wordlists</div>
      }
    </>
  );
}

function HybridBody({ attack }) {
  return (
    <>
      {attack.patternWarning && <div className="warning-box caution">⚠️ {attack.patternWarning}</div>}
      <div className="crack-time-display">
        <div className="crack-time-label">Hybrid Attack Estimate</div>
        <div className="crack-time-value" style={{ color: attack.color }}>{attack.time}</div>
      </div>
      {attack.patternsDetected?.length > 0 ? (
        <div>
          <div className="crack-time-label" style={{ marginBottom: 8 }}>Patterns Detected</div>
          <div>
            {attack.patternsDetected.map((p, i) => (
              <span key={i} className="pattern-chip">⚠ {p.description}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="warning-box safe">✅ No predictable patterns detected</div>
      )}
    </>
  );
}

function RainbowBody({ attack }) {
  return (
    <>
      <div className="crack-time-row">
        <span className="label">🌈 Without salt (MD5)</span>
        <span className="val" style={{ color: 'var(--red)' }}>{attack.timeUnsalted}</span>
      </div>
      <div className="crack-time-row">
        <span className="label">🧂 With salt (bcrypt)</span>
        <span className="val" style={{ color: 'var(--green)' }}>{attack.timeSalted}</span>
      </div>
      <div style={{ marginTop: 12 }}>
        {attack.isSalted
          ? <div className="warning-box safe">✅ Modern systems use salted hashing — rainbow tables ineffective</div>
          : <div className="warning-box danger">⛔ Unsalted hash detected — extremely vulnerable</div>
        }
      </div>
    </>
  );
}

function CredStuffBody({ attack }) {
  const riskColors = {
    Critical: 'var(--red)',
    High: 'var(--orange)',
    Medium: 'var(--amber)',
    Low: 'var(--green)'
  };
  return (
    <>
      <div className="crack-time-display">
        <div className="crack-time-label">Reuse / Stuffing Risk</div>
        <div className="crack-time-value" style={{ color: riskColors[attack.riskLevel] }}>
          {attack.riskLevel} Risk
        </div>
      </div>
      {attack.looksReused
        ? <div className="warning-box caution">⚠️ Password appears to follow common patterns — likely reused or predictable across sites</div>
        : <div className="warning-box safe">✅ Password looks unique — lower reuse risk</div>
      }
      <div className="crack-time-label" style={{ marginTop: 12, marginBottom: 4 }}>Key Protection</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        Use a unique password for every website. Enable 2FA wherever possible.
      </div>
    </>
  );
}

function ZxcvbnBody({ attack }) {
  const scoreColors = ['#ff4757','#ff6b35','#ffa502','#3d7fff','#2ed573'];
  const color = scoreColors[attack.score];
  const times = attack.crackTimes || {};

  return (
    <>
      <div className="crack-time-display">
        <div className="crack-time-label">zxcvbn Score</div>
        <div className="crack-time-value" style={{ color }}>{attack.strengthLabel}</div>
      </div>
      <div className="zxcvbn-score-bar">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="score-pip" style={{
            background: i <= attack.score ? scoreColors[i] : undefined,
            opacity: i <= attack.score ? 1 : 0.2,
          }} />
        ))}
      </div>
      <div>
        {times.online_throttling_100_per_hour && (
          <div className="crack-time-row">
            <span className="label">🌐 Online (throttled)</span>
            <span className="val">{times.online_throttling_100_per_hour}</span>
          </div>
        )}
        {times.online_no_throttling_10_per_second && (
          <div className="crack-time-row">
            <span className="label">🌐 Online (unthrottled)</span>
            <span className="val">{times.online_no_throttling_10_per_second}</span>
          </div>
        )}
        {times.offline_slow_hashing_1e4_per_second && (
          <div className="crack-time-row">
            <span className="label">🔒 Offline (bcrypt)</span>
            <span className="val">{times.offline_slow_hashing_1e4_per_second}</span>
          </div>
        )}
        {times.offline_fast_hashing_1e10_per_second && (
          <div className="crack-time-row">
            <span className="label">⚡ Offline (GPU fast)</span>
            <span className="val">{times.offline_fast_hashing_1e10_per_second}</span>
          </div>
        )}
      </div>
      {attack.feedback?.warning && (
        <div className="warning-box caution" style={{ marginTop: 12 }}>
          ⚠️ {attack.feedback.warning}
        </div>
      )}
    </>
  );
}