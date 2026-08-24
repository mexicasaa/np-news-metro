/**
 * Hindi Devanagari & Multilingual SEO Slugifier
 * Converts Hindi and English text into clean, URL-friendly Latin slugs.
 */

const DEVANAGARI_MAP: Record<string, string> = {
  // Independent Vowels
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'अं': 'an', 'अः': 'ah', 'ऑ': 'o', 'ऍ': 'e',

  // Consonants
  'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
  'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
  'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
  'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
  'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
  'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha',
  'ष': 'sha', 'स': 'sa', 'ह': 'ha',

  // Conjuncts / Nukta consonants
  'क़': 'qa', 'ख़': 'kha', 'ग़': 'gha', 'ज़': 'za', 'ड़': 'da',
  'ढ़': 'dha', 'फ़': 'fa', 'य़': 'ya', 'क्ष': 'ksha', 'त्र': 'tra', 'ज्ञ': 'gya', 'श्र': 'shra',

  // Dependent Vowel Signs (Matras) - applied to replace inherent 'a'
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ॉ': 'o', 'ॅ': 'e',

  // Modifiers
  'ं': 'n', 'ँ': 'n', 'ः': 'h', '़': '',

  // Numbers (Hindi)
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

const HALANT = '्';

/**
 * Transliterate Devanagari Hindi text to Romanized Latin text
 */
export function transliterateHindi(text: string): string {
  let result = '';
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const char = text[i];
    const nextChar = i + 1 < len ? text[i + 1] : '';

    if (char === HALANT) {
      // Halant cancels the inherent 'a' of the preceding consonant
      if (result.endsWith('a')) {
        result = result.slice(0, -1);
      }
      continue;
    }

    // Check for two-character nukta forms like क़
    const twoChar = char + nextChar;
    if (DEVANAGARI_MAP[twoChar] !== undefined) {
      result += DEVANAGARI_MAP[twoChar];
      i++; // Skip next character
      continue;
    }

    if (DEVANAGARI_MAP[char] !== undefined) {
      const mapped = DEVANAGARI_MAP[char];

      // If this is a matra and previous char had an inherent 'a', replace it
      if ('ािीुूृेैोौॉॅ'.includes(char)) {
        if (result.endsWith('a')) {
          result = result.slice(0, -1) + mapped;
        } else {
          result += mapped;
        }
      } else {
        result += mapped;
      }
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Creates a clean URL-friendly slug from any string (Hindi, English, etc.)
 */
export function slugifyText(text: string, maxLength: number = 70): string {
  if (!text || typeof text !== 'string') {
    return `story-${Date.now().toString(36)}`;
  }

  // 1. Transliterate Hindi/Devanagari characters
  const romanized = transliterateHindi(text);

  // 2. Normalize and strip non-alphanumeric characters
  const clean = romanized
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '') // remove special symbols
    .replace(/[\s_]+/g, '-')   // replace whitespace/underscore with hyphens
    .replace(/-+/g, '-')       // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')   // trim leading and trailing hyphens
    .slice(0, maxLength)
    .replace(/-+$/, '');

  if (!clean || clean.length < 2) {
    return `story-${Date.now().toString(36)}`;
  }

  return clean;
}
