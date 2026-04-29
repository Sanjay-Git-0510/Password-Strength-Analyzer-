import React from 'react';
import './App.css';
import { usePasswordAnalyzer } from './hooks/usePasswordAnalyzer';
import PasswordInput from './components/PasswordInput';
import OverallScore from './components/OverallScore';
import AttackCard from './components/AttackCard';
import SuggestionsPanel from './components/SuggestionsPanel';
import InterviewSection from './components/InterviewSection';

const ATTACK_ORDER = ['bruteForce','dictionary','hybrid','rainbow','credentialStuffing','zxcvbn'];

export default function App() {
  const {
    password, setPassword,
    showPassword, setShowPassword,
    result, loading, error,
    realtimeStrength,
    analyze,
  } = usePasswordAnalyzer();

  const attacks = result?.attacks;

  return (
    <div className="app">
      <div className="container">

        {/* ── Header ── */}
        <header className="header">
          <div className="header-pill">
            <span className="pulse" /> Educational Security Tool
          </div>
          <h1 className="header-title">
            Password<br /><span>Strength Analyzer</span>
          </h1>
          <p className="header-sub">
            Discover how attackers crack passwords using 6 real-world techniques.
            Nothing you type is ever stored.
          </p>
        </header>

        {/* ── Input ── */}
        <PasswordInput
          password={password}
          onChange={setPassword}
          showPassword={showPassword}
          onToggleVisibility={() => setShowPassword(!showPassword)}
          onAnalyze={analyze}
          loading={loading}
          realtimeStrength={realtimeStrength}
        />

        {/* ── Error ── */}
        {error && (
          <div className="err-banner">
            <span className="err-icon">⚠</span>
            <div>
              <strong>Analysis failed.</strong>&nbsp;
              {error.includes('backend') || error.includes('Network')
                ? 'Cannot reach the backend. Make sure the server is running: cd backend && npm start'
                : error}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="loading-box">
            <div className="spinner" />
            Running 6-layer security analysis...
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <>
            <OverallScore result={result} />

            <div className="section-head">
              <span className="section-head-text">Attack Vector Analysis</span>
              <span className="section-line" />
            </div>

            <div className="attacks-grid">
              {ATTACK_ORDER.map((key, i) => {
                const attack = attacks[key];
                if (!attack) return null;
                return (
                  <AttackCard
                    key={key}
                    attack={attack}
                    style={{ animationDelay: `${i * 70}ms` }}
                  />
                );
              })}
            </div>

            <SuggestionsPanel suggestions={result.suggestions} />
            <InterviewSection />
          </>
        )}

        {/* ── Empty State ── */}
        {!result && !loading && !password && (
          <div className="empty-state">
            <span className="empty-icon">🔐</span>
            <div className="empty-title">Enter a password to begin</div>
            <div className="empty-sub">Real-time strength analysis activates as you type</div>

            <div className="tips-row">
              {[
                { color: '#22d97a', text: 'Use 16+ characters for strong protection' },
                { color: '#4f7cff', text: 'Mix uppercase, lowercase, numbers & symbols' },
                { color: '#ff8a3d', text: 'Never reuse passwords across sites' },
                { color: '#b96eff', text: 'Use a password manager like Bitwarden' },
              ].map((t, i) => (
                <div className="tip-card" key={i}>
                  <span className="tip-dot" style={{ background: t.color }} />
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="footer">
          <strong>Password Strength Analyzer</strong>&nbsp;·&nbsp;
          Educational use only&nbsp;·&nbsp;No passwords stored
        </footer>
      </div>
    </div>
  );
}