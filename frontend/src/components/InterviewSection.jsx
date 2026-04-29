import React, { useState } from 'react';

const QUESTIONS = [
  {
    q: 'How does this project work end-to-end?',
    a: `The user enters a password in the React frontend. On each keystroke, a client-side zxcvbn check gives instant real-time feedback. When the user clicks "Analyze" (or after a 600ms debounce), the password is sent via POST request to the Express backend at /api/analyze-password. The backend runs six independent analysis modules — brute force entropy calculation, dictionary lookup, hybrid pattern detection, rainbow table simulation, credential stuffing risk assessment, and full zxcvbn analysis — then returns structured JSON. The frontend renders results in categorized attack cards with expandable explanations. The password is NEVER stored, logged, or persisted anywhere.`,
  },
  {
    q: 'Why is brute force attack not practical for strong passwords?',
    a: `Brute force scales exponentially. A password with charset size C and length L requires up to C^L attempts. An 8-char lowercase-only password has 26^8 = 208 billion combinations — crackable in ~20s on a GPU. But a 16-char mixed-case+special password has ~95^16 = 4.4×10^31 combinations. Even at 10 billion guesses/second (RTX 4090 on MD5), that's 1.4×10^14 years. Adding length or character types multiplies the search space exponentially, not linearly.`,
  },
  {
    q: 'What is the difference between all six attack techniques?',
    a: `(1) Brute Force: Tries every possible combination — guaranteed to work but exponentially slow for long passwords. (2) Dictionary Attack: Uses pre-built wordlists from real breaches — fast against common passwords, useless against random ones. (3) Hybrid Attack: Combines wordlists with mutation rules (leet speak, appended years, capitalization) — catches "clever" variations. (4) Rainbow Table: Uses precomputed hash→password lookups — near-instant for short unsalted passwords, completely defeated by salting. (5) Credential Stuffing: Doesn't crack at all — uses already-stolen credentials to log into other services. (6) zxcvbn: Not an attack, but a realistic strength estimator that models all the above patterns.`,
  },
  {
    q: 'Why is zxcvbn more accurate than a simple entropy calculator?',
    a: `Simple entropy calculation assumes passwords are random — "Password123!" scores high because it uses 4 character sets. But it ignores that humans follow predictable patterns. zxcvbn models the actual search space an attacker would use: it checks dictionaries, detects keyboard walks (qwerty), identifies leet substitutions, spots repeats and sequences, and recognizes date patterns. "Password123!" is flagged as guessable in ~10,000 attempts — far less than naive entropy suggests.`,
  },
  {
    q: 'How does salting protect against rainbow table attacks?',
    a: `A salt is a random unique string appended to a password before hashing. bcrypt(password + salt) produces a completely different hash than bcrypt(password). Even if two users have identical passwords, their hashes differ due to different salts. This defeats rainbow tables because precomputed tables map hash→password for unsalted inputs only. A salted hash has 2^128 possible salts, making precomputation infeasible. Attackers must restart from scratch for each salted hash, effectively turning rainbow table attacks back into brute force.`,
  },
  {
    q: 'What are the best practices for password security?',
    a: `(1) Length first: 16+ characters beats complex short passwords. (2) Use a password manager: Bitwarden or 1Password generate and store truly random passwords. (3) Unique passwords: Never reuse — one breach shouldn't expose all accounts. (4) Enable 2FA: Even a compromised password can't log in without the second factor. (5) Use passphrases: "correct-horse-battery-staple" is memorable and has high entropy. (6) Check breaches: Use HaveIBeenPwned.com to see if your email appeared in known breaches. (7) For storage: Always use Argon2, bcrypt, or scrypt — never MD5, SHA1, or SHA256 directly.`,
  },
];

export default function InterviewSection() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="interview-section">
      <div className="section-title">Interview Preparation Q&amp;A</div>
      {QUESTIONS.map((item, i) => (
        <div className="interview-q" key={i}>
          <div
            className="interview-question"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            style={{ cursor: 'pointer' }}
          >
            {item.q}
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>
              {openIdx === i ? '▲' : '▼'}
            </span>
          </div>
          {openIdx === i && (
            <div className="interview-answer">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}