const COMMON_WORDS = [
  'password',
  'admin',
  'qwerty',
  'welcome',
  'letmein',
  'login',
  'cybershield',
  'iloveyou',
  'abc123',
  '123456'
];

const SEQUENCES = [
  'abcdefghijklmnopqrstuvwxyz',
  'zyxwvutsrqponmlkjihgfedcba',
  '0123456789',
  '9876543210',
  'qwertyuiop',
  'poiuytrewq',
  'asdfghjkl',
  'lkjhgfdsa',
  'zxcvbnm',
  'mnbvcxz'
];

const SPECIAL_ASCII = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const hasUpper = (value) => /\p{Lu}/u.test(value);
const hasLower = (value) => /\p{Ll}/u.test(value);
const hasNumber = (value) => /\p{Nd}/u.test(value);
const hasSpecial = (value) => /[^\p{L}\p{N}\s]/u.test(value);

function getCharacterPoolSize(password) {
  let size = 0;

  if (hasLower(password)) size += 26;
  if (hasUpper(password)) size += 26;
  if (hasNumber(password)) size += 10;
  if (hasSpecial(password)) size += SPECIAL_ASCII.length;

  // Boost entropy estimation if non-ASCII chars are present.
  if ([...password].some((char) => char.codePointAt(0) > 127)) size += 100;

  return size || 1;
}

function hasSequentialRun(segment) {
  if (segment.length < 4) return false;

  let asc = true;
  let desc = true;

  for (let i = 1; i < segment.length; i += 1) {
    const prev = segment.charCodeAt(i - 1);
    const current = segment.charCodeAt(i);

    if (current - prev !== 1) asc = false;
    if (prev - current !== 1) desc = false;
  }

  return asc || desc;
}

function detectSequentialPatterns(password) {
  const findings = [];
  const lower = password.toLowerCase();

  for (let i = 0; i <= lower.length - 4; i += 1) {
    const segment = lower.slice(i, i + 4);
    if (hasSequentialRun(segment)) {
      findings.push(`Sequential pattern detected: ${segment}`);
      break;
    }
  }

  for (const sequence of SEQUENCES) {
    for (let len = 4; len <= Math.min(6, sequence.length); len += 1) {
      for (let i = 0; i <= sequence.length - len; i += 1) {
        const part = sequence.slice(i, i + len);
        if (lower.includes(part)) {
          findings.push(`Keyboard/alphabetic sequence detected: ${part}`);
          return findings;
        }
      }
    }
  }

  return findings;
}

function detectRepeatedPatterns(password) {
  const findings = [];
  const repeated = password.match(/(.)\1{2,}/gu);

  if (repeated && repeated.length > 0) {
    findings.push(`Repeated characters detected: ${repeated[0]}`);
  }

  return findings;
}

function detectDictionaryWords(password) {
  const lower = password.toLowerCase();
  const found = [];

  for (const word of COMMON_WORDS) {
    if (lower.includes(word)) {
      found.push(`Common word detected: ${word}`);
    }
  }

  return found;
}

function calculateEntropy(password) {
  const pool = getCharacterPoolSize(password);
  const entropy = password.length * Math.log2(pool);
  return Number.isFinite(entropy) ? Number(entropy.toFixed(2)) : 0;
}

function estimateCrackTime(entropy) {
  // Conservative modern cracking assumption.
  const guessesPerSecond = 1e10;
  const attempts = 2 ** entropy;
  const seconds = attempts / 2 / guessesPerSecond;

  if (!Number.isFinite(seconds) || seconds > 1e20) return 'Centuries+';
  if (seconds < 1) return '< 1 second';
  if (seconds < 60) return `${Math.floor(seconds)} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.floor(seconds / 86400)} days`;
  return `${Math.floor(seconds / 31536000)} years`;
}

function classifyStrength(entropy, length) {
  if (entropy > 80 && length >= 12) return 'Very Strong';
  if (entropy > 70 && length >= 10) return 'Strong';
  if (entropy >= 40 && entropy <= 70) return 'Moderate';
  return 'Weak';
}

function calculateWeightedScore(password, entropy, vulnerabilities) {
  const lengthFactor = clamp((password.length / 20) * 100, 0, 100);

  const diversityCount = [
    hasUpper(password),
    hasLower(password),
    hasNumber(password),
    hasSpecial(password)
  ].filter(Boolean).length;

  const complexityFactor = clamp((diversityCount / 4) * 100, 0, 100);
  const entropyFactor = clamp((entropy / 90) * 100, 0, 100);

  let penaltyPoints = 0;
  for (const item of vulnerabilities) {
    if (item.includes('Sequential') || item.includes('Keyboard')) penaltyPoints += 8;
    else if (item.includes('Repeated')) penaltyPoints += 6;
    else if (item.includes('Common word')) penaltyPoints += 10;
    else penaltyPoints += 4;
  }

  const penaltyWeighted = clamp(penaltyPoints, 0, 20);
  let score =
    lengthFactor * 0.25 +
    complexityFactor * 0.25 +
    entropyFactor * 0.30 -
    penaltyWeighted;

  const strength = classifyStrength(entropy, password.length);
  if (strength === 'Strong' && score < 72) score = 72;
  if (strength === 'Very Strong' && score < 86) score = 86;

  return Math.round(clamp(score, 0, 100));
}

function getSuggestions(password, vulnerabilities) {
  const suggestions = [];

  if (password.length < 12) suggestions.push('Use at least 12 characters for better resilience.');
  if (!hasUpper(password)) suggestions.push('Add uppercase letters.');
  if (!hasLower(password)) suggestions.push('Add lowercase letters.');
  if (!hasNumber(password)) suggestions.push('Add numbers.');
  if (!hasSpecial(password)) suggestions.push('Add special characters (for example !@#$%^&*).');

  vulnerabilities.forEach((item) => {
    if (item.includes('Sequential')) suggestions.push('Avoid sequential strings like 12345 or abcde.');
    if (item.includes('Keyboard')) suggestions.push('Avoid keyboard-like runs such as qwerty/asdf.');
    if (item.includes('Repeated')) suggestions.push('Avoid repeated characters such as aaaa or 1111.');
    if (item.includes('Common word')) suggestions.push('Remove dictionary words and use random combinations.');
  });

  return Array.from(new Set(suggestions));
}

export function validatePasswordInput(password) {
  if (typeof password !== 'string') {
    return { valid: false, error: 'Password cannot be empty' };
  }

  if (password.trim().length === 0) {
    return { valid: false, error: 'Password cannot be empty' };
  }

  return { valid: true, error: '' };
}

export function analyzePassword(password) {
  const inputValidation = validatePasswordInput(password);
  if (!inputValidation.valid) {
    return {
      valid: false,
      error: inputValidation.error,
      score: 0,
      strength: 'Weak',
      entropy: 0,
      timeToCrack: '< 1 second',
      vulnerabilities: [],
      suggestions: []
    };
  }

  const entropy = calculateEntropy(password);
  const vulnerabilities = [
    ...detectSequentialPatterns(password),
    ...detectRepeatedPatterns(password),
    ...detectDictionaryWords(password)
  ];

  const strength = classifyStrength(entropy, password.length);
  const score = calculateWeightedScore(password, entropy, vulnerabilities);
  const suggestions = getSuggestions(password, vulnerabilities);

  return {
    valid: true,
    error: '',
    length: password.length,
    entropy,
    timeToCrack: estimateCrackTime(entropy),
    strength,
    score,
    complexity: {
      uppercase: hasUpper(password),
      lowercase: hasLower(password),
      numbers: hasNumber(password),
      special: hasSpecial(password)
    },
    vulnerabilities,
    suggestions
  };
}

function getCryptoRandomInt(maxExclusive) {
  const cryptoObj = window.crypto || window.msCrypto;
  if (!cryptoObj || maxExclusive <= 0) return 0;

  const random = new Uint32Array(1);
  cryptoObj.getRandomValues(random);
  return random[0] % maxExclusive;
}

function secureShuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = getCryptoRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateFromPool(length, pool, requiredSets) {
  const chars = [];

  requiredSets.forEach((set) => {
    const idx = getCryptoRandomInt(set.length);
    chars.push(set[idx]);
  });

  while (chars.length < length) {
    const idx = getCryptoRandomInt(pool.length);
    chars.push(pool[idx]);
  }

  return secureShuffle(chars).join('');
}

function hasPredictablePattern(password) {
  return /(.)\1{3,}/u.test(password) || detectSequentialPatterns(password).length > 0;
}

export function generateSecurePassword(options) {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecial = true
  } = options;

  const normalizedLength = clamp(Number(length) || 16, 8, 32);

  const sets = [];
  if (includeUppercase) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (includeLowercase) sets.push('abcdefghijklmnopqrstuvwxyz');
  if (includeNumbers) sets.push('0123456789');
  if (includeSpecial) sets.push(SPECIAL_ASCII);

  if (sets.length === 0) {
    throw new Error('Select at least one character set.');
  }

  const pool = sets.join('');
  const theoreticalEntropy = normalizedLength * Math.log2(pool.length);
  const targetEntropy = Math.min(75, theoreticalEntropy * 0.95);

  let fallback = '';

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = generateFromPool(normalizedLength, pool, sets);
    const entropy = calculateEntropy(candidate);

    fallback = candidate;

    if (!hasPredictablePattern(candidate) && entropy >= targetEntropy) {
      return candidate;
    }
  }

  return fallback;
}
