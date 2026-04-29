const zxcvbn = require('zxcvbn');
const { isCommonPassword, isNearCommonPassword, detectPatterns } = require('./passwordData');

function getCharsetSize(password) {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[!@#$%^&*()\-_=+\[\]{};:'",.<>?\/\\|`~]/.test(password)) size += 32;
  return size || 26;
}

function formatTime(seconds) {
  if (seconds < 1) return 'Instant (< 1 second)';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  const years = seconds / 31536000;
  if (years < 1e6) return `${years.toExponential(1)} years`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} billion years`;
  return `${(years / 1e12).toFixed(1)} trillion years`;
}

function getStrengthLabel(score) {
  if (score <= 1) return 'Very Weak';
  if (score === 2) return 'Weak';
  if (score === 3) return 'Medium';
  if (score === 4) return 'Strong';
  return 'Very Strong';
}

function calculateEntropy(password) {
  const charsetSize = getCharsetSize(password);
  const length = password.length;
  const entropy = Math.log2(Math.pow(charsetSize, length));
  return {
    bits: Math.round(entropy * 10) / 10,
    charsetSize,
    length,
    combinations: Math.pow(charsetSize, length),
  };
}

function analyzeBruteForce(password) {
  const GUESSES_PER_SECOND_ONLINE = 100;
  const GUESSES_PER_SECOND_OFFLINE_SLOW = 1e4;
  const GUESSES_PER_SECOND_OFFLINE_FAST = 1e10;

  const entropy = calculateEntropy(password);
  const combinations = Math.pow(entropy.charsetSize, entropy.length);
  const avgCombinations = combinations / 2;

  const timeOnline = avgCombinations / GUESSES_PER_SECOND_ONLINE;
  const timeOfflineSlow = avgCombinations / GUESSES_PER_SECOND_OFFLINE_SLOW;
  const timeOfflineFast = avgCombinations / GUESSES_PER_SECOND_OFFLINE_FAST;

  return {
    technique: 'Brute Force',
    icon: '🔴',
    color: '#ef4444',
    times: {
      online: formatTime(timeOnline),
      offlineSlow: formatTime(timeOfflineSlow),
      offlineFast: formatTime(timeOfflineFast),
    },
    rawSeconds: timeOfflineFast,
    entropy,
    explanation: {
      what: 'Brute force systematically tries every possible combination of characters until the correct password is found.',
      how: `With a ${entropy.charsetSize}-character charset and length ${entropy.length}, there are ${entropy.combinations.toExponential(2)} possible combinations. Modern GPUs can try ~10 billion MD5 hashes/second.`,
      realWorld: 'Hashcat with a gaming GPU (RTX 4090) can crack 8-character MD5 passwords in minutes. Longer passwords make this exponentially harder.',
      advantage: 'Guaranteed to find the password eventually — it never misses.',
      limitation: 'Becomes computationally infeasible for passwords longer than 12 characters with mixed character sets.',
      mitigation: 'Use passwords > 12 characters. Use bcrypt/Argon2 for hashing (slows attackers to thousands/sec).',
    },
  };
}

function analyzeDictionaryAttack(password) {
  const isCommon = isCommonPassword(password);
  const DICT_SIZE = 10_000_000;
  const GUESSES_PER_SECOND = 1e9;

  let crackTimeSeconds;
  let warning = null;

  if (isCommon) {
    crackTimeSeconds = 0.001;
    warning = '⚠️ This is a known common password! It appears in breach databases.';
  } else {
    const lower = password.toLowerCase().replace(/[^a-z]/g, '');
    const wordLikeness = lower.length >= 4 && lower.length <= 12 ? 0.6 : 0.1;
    crackTimeSeconds = (DICT_SIZE * (1 - wordLikeness)) / GUESSES_PER_SECOND;
  }

  return {
    technique: 'Dictionary Attack',
    icon: '🟡',
    color: '#f59e0b',
    time: formatTime(crackTimeSeconds),
    rawSeconds: crackTimeSeconds,
    isCommonPassword: isCommon,
    warning,
    explanation: {
      what: 'Dictionary attacks use pre-built lists of common words, phrases, and previously leaked passwords (e.g., rockyou.txt with 14M+ passwords).',
      how: "The attacker hashes each word in the list and compares it to the stolen hash. If your password is in the list, it's cracked in seconds.",
      realWorld: 'The 2009 RockYou breach exposed 32M plaintext passwords. These now form the basis of every password cracking wordlist.',
      advantage: 'Extremely fast — can try millions of common passwords per second.',
      limitation: 'Ineffective against random or unique passwords not in any wordlist.',
      mitigation: 'Never use dictionary words, names, or common phrases. Use passphrases with 4+ random words.',
    },
  };
}

function analyzeHybridAttack(password) {
  const nearMatch = isNearCommonPassword(password);
  const patterns = detectPatterns(password);
  const GUESSES_PER_SECOND = 5e8;

  let crackTimeSeconds;
  let patternWarning = null;

  if (nearMatch.match) {
    crackTimeSeconds = nearMatch.variant === 'leet' ? 0.5 : 2;
    patternWarning = `Common password variant detected (${nearMatch.variant} substitution). Easily cracked by hybrid rules.`;
  } else if (patterns.length > 0) {
    const patternMultiplier = Math.pow(10, patterns.length);
    crackTimeSeconds = patternMultiplier / GUESSES_PER_SECOND;
  } else {
    crackTimeSeconds = 1e8 / GUESSES_PER_SECOND;
  }

  return {
    technique: 'Hybrid Attack',
    icon: '🟠',
    color: '#f97316',
    time: formatTime(crackTimeSeconds),
    rawSeconds: crackTimeSeconds,
    patternsDetected: patterns,
    patternWarning,
    explanation: {
      what: 'Hybrid attacks combine dictionary words with rule-based mutations — adding numbers, capitalizing letters, replacing letters with symbols (l33t speak), appending years, etc.',
      how: `Rules like "capitalize first letter + add year at end" (Password2024) or leet substitutions (p@ssw0rd) are pre-programmed. Tools like Hashcat support thousands of rules. ${patterns.length} pattern(s) detected in your password.`,
      realWorld: 'Most users think "P@ssw0rd123" is secure. Hybrid attacks crack it in seconds because these substitutions are the first rules attackers apply.',
      advantage: 'Catches passwords that seem complex but follow predictable human patterns.',
      limitation: 'Misses truly random passwords with no predictable structure.',
      mitigation: "Avoid predictable patterns. Don't just substitute letters with symbols — use a password manager to generate truly random passwords.",
    },
  };
}

function analyzeRainbowTable(password) {
  const entropy = calculateEntropy(password);
  const isLikelySalted = true;
  const isShortWeak = password.length <= 8 && entropy.charsetSize <= 36;

  let crackTime, saltedTime;

  if (isShortWeak) {
    crackTime = 'Instant (table lookup)';
    saltedTime = formatTime(Math.pow(2, entropy.bits) / 1e10);
  } else {
    crackTime = entropy.bits < 40 ? 'Minutes (table exists)' : 'Hours-Days (partial match)';
    saltedTime = formatTime(Math.pow(2, entropy.bits) / 1e10);
  }

  return {
    technique: 'Rainbow Table Attack',
    icon: '🔵',
    color: '#3b82f6',
    timeUnsalted: crackTime,
    timeSalted: saltedTime,
    rawSeconds: isShortWeak ? 1 : 3600,
    isSalted: isLikelySalted,
    explanation: {
      what: 'Rainbow tables are massive precomputed databases of hash→password mappings. Instead of cracking a hash, attackers simply look it up.',
      how: 'A 1TB rainbow table can cover all MD5 hashes of passwords up to 8 characters. The lookup takes milliseconds. Salting defeats this by adding a unique random string to each password before hashing — making precomputation impossible.',
      realWorld: 'The 2012 LinkedIn breach exposed 6.5M unsalted SHA1 hashes. 90%+ were cracked using rainbow tables within days.',
      advantage: 'Near-instantaneous cracking for unsalted hashes of short passwords.',
      limitation: 'Completely defeated by salting. Ineffective against long or complex passwords.',
      mitigation: 'Always use bcrypt, Argon2, or scrypt — they automatically salt and are slow by design. Never use MD5/SHA1 for passwords.',
    },
  };
}

function analyzeCredentialStuffing(password) {
  const isCommon = isCommonPassword(password);
  const patterns = detectPatterns(password);
  const looksReused = isCommon || patterns.length >= 2;

  let riskLevel, riskColor;
  if (isCommon) { riskLevel = 'Critical'; riskColor = '#ef4444'; }
  else if (looksReused) { riskLevel = 'High'; riskColor = '#f97316'; }
  else if (patterns.length > 0) { riskLevel = 'Medium'; riskColor = '#f59e0b'; }
  else { riskLevel = 'Low'; riskColor = '#22c55e'; }

  return {
    technique: 'Credential Stuffing',
    icon: '🟣',
    color: '#a855f7',
    riskLevel,
    riskColor,
    looksReused,
    explanation: {
      what: 'Attackers use username/password pairs from one data breach to automatically try logging into other websites, exploiting password reuse.',
      how: 'Tools like Sentry MBA or OpenBullet can try thousands of credential pairs per second across multiple sites. If you reuse passwords, one breach exposes all your accounts.',
      realWorld: 'The 2023 23andMe breach started as credential stuffing — attackers used credentials from OTHER breaches to access millions of genetic profiles.',
      advantage: 'Requires no cracking — uses already-valid credentials from breaches.',
      limitation: 'Only works if the user reuses passwords across sites.',
      mitigation: 'Use a unique password for every site. Enable 2FA. Use a password manager (Bitwarden, 1Password).',
    },
  };
}

function analyzeZxcvbn(password) {
  const result = zxcvbn(password);
  return {
    technique: 'zxcvbn (Realistic Estimator)',
    icon: '🟢',
    color: '#22c55e',
    score: result.score,
    strengthLabel: getStrengthLabel(result.score),
    crackTimes: result.crack_times_display,
    guessesLog10: result.guesses_log10,
    feedback: result.feedback,
    sequence: result.sequence?.map(s => ({
      pattern: s.pattern,
      token: s.token,
      entropy: s.entropy,
    })),
    explanation: {
      what: 'zxcvbn is a realistic password strength estimator created by Dropbox. It models attacker behavior rather than just checking character diversity.',
      how: 'It detects dictionary words, keyboard patterns, dates, repeats, and sequences — then calculates real guesses needed. Score 0-4 maps to crack time under different attack scenarios.',
      realWorld: 'Unlike naive strength checkers that accept "P@ssw0rd!" as strong, zxcvbn correctly identifies it as weak because of l33t substitution patterns.',
      advantage: 'Most realistic estimate — accounts for human patterns that simple entropy misses.',
      limitation: 'May underestimate truly random-looking passwords that happen to match patterns.',
      mitigation: 'Use this score as your primary strength indicator.',
    },
  };
}

function generateSuggestions(password, zxcvbnResult) {
  const suggestions = [];
  const zxFeedback = zxcvbnResult.feedback;

  if (zxFeedback.warning) suggestions.push({ type: 'warning', message: zxFeedback.warning });
  zxFeedback.suggestions?.forEach(s => suggestions.push({ type: 'tip', message: s }));

  if (password.length < 8) suggestions.push({ type: 'critical', message: 'Password is too short — use at least 12 characters' });
  else if (password.length < 12) suggestions.push({ type: 'improve', message: 'Increase length to 12+ characters for much better security' });
  else if (password.length < 16) suggestions.push({ type: 'tip', message: 'Consider 16+ characters for maximum security' });

  if (!/[A-Z]/.test(password)) suggestions.push({ type: 'improve', message: 'Add uppercase letters (A-Z)' });
  if (!/[a-z]/.test(password)) suggestions.push({ type: 'improve', message: 'Add lowercase letters (a-z)' });
  if (!/\d/.test(password)) suggestions.push({ type: 'improve', message: 'Add numbers (0-9)' });
  if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>?\/\\|`~]/.test(password)) {
    suggestions.push({ type: 'improve', message: 'Add special characters (!@#$%^&*)' });
  }

  if (isCommonPassword(password)) {
    suggestions.push({ type: 'critical', message: 'This is a known common password — change it immediately!' });
  }

  const patterns = detectPatterns(password);
  patterns.forEach(p => suggestions.push({ type: 'warning', message: `Avoid predictable patterns: ${p.description}` }));

  return suggestions.filter((s, i, arr) => arr.findIndex(x => x.message === s.message) === i);
}

function analyzePassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password input');
  }

  const pwd = password.slice(0, 128);

  const entropy = calculateEntropy(pwd);
  const bruteForce = analyzeBruteForce(pwd);
  const dictionary = analyzeDictionaryAttack(pwd);
  const hybrid = analyzeHybridAttack(pwd);
  const rainbow = analyzeRainbowTable(pwd);
  const credStuffing = analyzeCredentialStuffing(pwd);
  const zxcvbnAnalysis = analyzeZxcvbn(pwd);
  const suggestions = generateSuggestions(pwd, zxcvbn(pwd));

  const overallScore = zxcvbnAnalysis.score;
  const overallStrength = getStrengthLabel(overallScore);

  return {
    entropy,
    overallScore,
    overallStrength,
    attacks: {
      bruteForce,
      dictionary,
      hybrid,
      rainbow,
      credentialStuffing: credStuffing,
      zxcvbn: zxcvbnAnalysis,
    },
    suggestions,
    metadata: {
      length: pwd.length,
      hasLower: /[a-z]/.test(pwd),
      hasUpper: /[A-Z]/.test(pwd),
      hasDigit: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*()\-_=+\[\]{};:'",.<>?\/\\|`~]/.test(pwd),
      charsetSize: entropy.charsetSize,
    },
  };
}

module.exports = { analyzePassword, calculateEntropy, formatTime };