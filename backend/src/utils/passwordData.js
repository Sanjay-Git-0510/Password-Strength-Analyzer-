// Top 200 most common passwords for dictionary attack simulation
const COMMON_PASSWORDS = [
  "password", "123456", "password123", "admin", "letmein", "qwerty",
  "abc123", "monkey", "1234567", "12345678", "123456789", "1234567890",
  "welcome", "login", "hello", "master", "dragon", "pass", "test",
  "111111", "iloveyou", "sunshine", "princess", "football", "shadow",
  "superman", "michael", "qwerty123", "trustno1", "baseball", "batman",
  "access", "hello123", "passw0rd", "starwars", "mustang", "696969",
  "thomas", "robert", "jessica", "daniel", "charlie", "hockey",
  "ranger", "cookie", "hunter", "cheese", "secret", "summer",
  "bailey", "harley", "winter", "joshua", "george", "jordan",
  "tigger", "wizard", "killer", "matrix", "freedom", "fucker",
  "phoenix", "steven", "dallas", "bandit", "donald", "password1",
  "maggie", "merlin", "victor", "gandalf", "jackie", "lovely",
  "1qaz2wsx", "qazwsx", "zxcvbnm", "asdfgh", "123qwe", "1q2w3e",
  "q1w2e3r4", "1234qwer", "abc1234", "password2", "password12",
  "P@ssw0rd", "Passw0rd", "P@$$w0rd", "Admin123", "Welcome1",
  "monkey123", "sunshine1", "football1", "baseball1", "soccer",
  "iloveyou1", "princess1", "qwerty1", "654321", "555555",
  "112233", "121212", "123123", "131313", "159753", "123321",
  "987654321", "pass123", "master123", "admin123", "root",
  "toor", "user", "guest", "default", "changeme", "temp",
  "test123", "demo", "system", "server", "super", "login123",
  "mypassword", "letmein1", "welcome1", "hello1", "123456a",
  "a123456", "1234abcd", "abcd1234", "pass1234", "1234pass",
  "google", "facebook", "twitter", "amazon", "apple", "microsoft",
  "netflix", "instagram", "linkedin", "youtube", "reddit",
  "nintendo", "playstation", "xbox360", "pokemon", "pikachu",
  "naruto", "sasuke", "anime", "manga", "gaming",
  "love", "angel", "baby", "devil", "dream", "fire",
  "star", "moon", "sun", "sky", "ocean", "earth",
  "forever", "always", "never", "life", "time", "home",
  "work", "money", "power", "king", "queen", "prince",
  "ninja", "samurai", "warrior", "legend", "hero", "god",
  "titan", "zeus", "thor", "odin", "wolf", "eagle",
  "tiger", "lion", "bear", "shark", "snake", "fox",
  "black", "white", "red", "blue", "green", "gold",
  "silver", "purple", "orange", "yellow", "pink", "dark",
  "light", "night", "day", "dawn", "dusk", "storm",
  "thunder", "lightning", "blaze", "ice", "frost", "snow",
  "rock", "stone", "iron", "steel", "blade", "sword",
  "2024", "2023", "2022", "2021", "2020", "1999",
  "1990", "1985", "1980", "1970", "0000", "9999",
  "qweasdzxc", "asdfghjkl", "zxcvbn", "poiuytrewq",
  "1q2w3e4r", "q2w3e4r5", "zaq12wsx", "xsw2zaq1",
  "newpass", "oldpass", "changed", "updated", "reset",
  "temporary", "passwd", "passphrase", "secret123", "hidden"
];

const YEAR_PATTERN = /\b(19|20)\d{2}\b/;
const LEET_SPEAK = { '@': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '7': 't', '$': 's', '!': 'i' };

function isCommonPassword(password) {
  const lower = password.toLowerCase();
  return COMMON_PASSWORDS.includes(lower);
}

function isNearCommonPassword(password) {
  const lower = password.toLowerCase();
  let deLeeted = lower;
  for (const [leet, char] of Object.entries(LEET_SPEAK)) {
    deLeeted = deLeeted.split(leet).join(char);
  }
  if (COMMON_PASSWORDS.includes(deLeeted)) return { match: true, variant: 'leet' };

  for (const common of COMMON_PASSWORDS) {
    if (lower.startsWith(common) || lower.endsWith(common)) {
      return { match: true, variant: 'augmented' };
    }
  }

  for (const common of COMMON_PASSWORDS) {
    if (common.length > 4 && lower.includes(common)) {
      return { match: true, variant: 'contains' };
    }
  }

  return { match: false };
}

function detectPatterns(password) {
  const detected = [];
  if (YEAR_PATTERN.test(password)) detected.push({ type: 'year', description: 'Contains a year (19xx or 20xx)' });
  if (/123|234|345|456|567|678|789/.test(password)) detected.push({ type: 'sequential_num', description: 'Contains sequential numbers' });
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl/i.test(password)) detected.push({ type: 'sequential_alpha', description: 'Contains sequential letters' });
  if (/(.)\1{2,}/.test(password)) detected.push({ type: 'repeated_chars', description: 'Contains repeated characters' });
  if (/qwerty|asdf|zxcv|poiuy|lkjhg|mnbvc/i.test(password)) detected.push({ type: 'keyboard', description: 'Keyboard pattern detected' });
  if (/^[A-Z][a-z]/.test(password)) detected.push({ type: 'title_case', description: 'Starts with capital letter (common pattern)' });
  if (/[!@#$%^&*]$/.test(password)) detected.push({ type: 'trailing_special', description: 'Special character at end (predictable placement)' });
  if (/\d+$/.test(password)) detected.push({ type: 'trailing_numbers', description: 'Numbers at end (very common pattern)' });
  if (/^\d+/.test(password)) detected.push({ type: 'leading_numbers', description: 'Numbers at beginning' });
  return detected;
}

module.exports = { COMMON_PASSWORDS, isCommonPassword, isNearCommonPassword, detectPatterns };