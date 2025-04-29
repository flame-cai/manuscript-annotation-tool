// InputClusterCode.js

export function logCharactersBeforeCursor(input) {
  const cursorPosition = input.selectionStart;
  const currentValue = input.value;
  // Log more characters for debugging multi-char sequences
  console.log({
    '-5': currentValue[cursorPosition - 5],
    '-4': currentValue[cursorPosition - 4],
    '-3': currentValue[cursorPosition - 3],
    '-2': currentValue[cursorPosition - 2],
    '-1': currentValue[cursorPosition - 1]
  });
    return
}

// --- Character Constants ---
export const HALANT = '\u094D';
export const ZWNJ = '\u200C'; // Zero-Width Non-Joiner

// --- Consonant Mappings ---
// Maps single Roman keys directly to Devanagari base consonants
export const singleConsonantMap = {
  'k': 'क',
  'g': 'ग',
  'c': 'च', // Assuming 'c' maps to 'च' for 'ch'/'chh' combinations
  'j': 'ज',
  'T': 'ट',
  't': 'त',
  'D': 'ड',
  'd': 'द',
  'N': 'ण',
  'n': 'न',
  'p': 'प',
  'b': 'ब',
  'm': 'म',
  'y': 'य',
  'r': 'र',
  'l': 'ल',
  'v': 'व',
  'V': 'ङ', // Typically 'G' or 'N^', but using 'V' as per original comment
  'S': 'ष',
  's': 'स',
  'h': 'ह',
  'L': 'ळ',
  'Y': 'ञ', // Typically 'J' or 'n^', but using 'Y' as per original comment
  'f': 'फ', // Added common mapping
  'z': 'ज', // Added common mapping (base 'z', Nukta handled separately if needed)
};

// Structure: triggerKey: { precedingDevanagariBase: { resultChar: devanagariBase, remove: count } }
export const doubleCharMap = {
  'h': { // Aspirates + sh
    'क': { resultChar: 'ख', remove: 3 }, // k + h -> kh
    'ग': { resultChar: 'घ', remove: 3 }, // g + h -> gh
    'च': { resultChar: 'छ', remove: 3 }, // c + h -> chh
    'ज': { resultChar: 'झ', remove: 3 }, // j + h -> jh
    'ट': { resultChar: 'ठ', remove: 3 }, // T + h -> Th
    'ड': { resultChar: 'ढ', remove: 3 }, // D + h -> Dh
    'त': { resultChar: 'थ', remove: 3 }, // t + h -> th
    'द': { resultChar: 'ध', remove: 3 }, // d + h -> dh
    'प': { resultChar: 'फ', remove: 3 }, // p + h -> ph
    'ब': { resultChar: 'भ', remove: 3 }, // b + h -> bh
    'स': { resultChar: 'श', remove: 3 }, // s + h -> sh
    // Need to handle 'Q'-like prefixes if using nuktas e.g. क़ -> ख़
  },
  's': {
    'क': { resultChar: 'क्ष', remove: 3 }, // k + s -> ks (maps to kS = क्ष)
  },
  'S': { // Assuming capital S for ष, also forms kS = क्ष
    'क': { resultChar: 'क्ष', remove: 3 }  // k + S -> kS
  },
  // Add nukta combinations if needed, e.g. 'H' for nukta
  // 'H': {
  //   'क': { resultChar: 'क़', remove: 3 }, // k + H -> क़
  //   'ख': { resultChar: 'ख़', remove: 3 }, // kh + H -> ख़
  //   'ग': { resultChar: 'ग़', remove: 3 }, // g + H -> ग़
  //   'ज': { resultChar: 'ज़', remove: 3 }, // j + H -> ज़
  //   'ड': { resultChar: 'ड़', remove: 3 }, // D + H -> ड़
  //   'ढ': { resultChar: 'ढ़', remove: 3 }, // Dh + H -> ढ़
  //   'फ': { resultChar: 'फ़', remove: 3 }, // p + H -> फ़ (or f?)
  // }
};

// Structure: triggerKey: { precedingDevSequence: { resultChar: devanagariBase, remove: count } }
export const tripleCharMap = {
  'y': {
    'दन': { resultChar: 'ज्ञ', remove: 5 }, // d + n + y -> dny (ज्ञ) - Removes द् + ् + न + ् + ZWNJ
    'गञ': { resultChar: 'ज्ञ', remove: 5 }, // g + Y + y (?) -> gny (ज्ञ) - Removes ग् + ् + ञ + ् + ZWNJ
    'गन': { resultChar: 'ज्ञ', remove: 5 }, // g + n + y -> gny (ज्ञ) - Removes ग् + ् + न + ् + ZWNJ
  },
  'r': {
    'श': { resultChar: 'श्र', remove: 3 }, // sh + r -> shr - Context: श् + ZWNJ. Replace with श्र् + ZWNJ.
  },
};

// --- Vowel Mappings ---

// Dependent Vowels (Matras)
export const dependentVowelMap = {
    // Basic
    'a':'ा', // ka -> का
    'e':'े', // ke -> के
    'i':'ि', // ki -> कि
    'o':'ो', // ko -> को
    'u':'ु', // ku -> कु

    // Long / Diphthong
    'aa': 'ा', // kaa -> का (same as 'a')
    'ee': 'ी', // kee -> की
    'ii': 'ी', // kii -> की
    'uu': 'ू', // kuu -> कू
    'oo': 'ू', // koo -> कू
    'ai':'ै', // kai -> कै
    'au':'ौ', // kau -> कौ (standard way, simpler than ा + ै)
    'ou':'ौ', // kou -> कौ (alternative)

    // R/L Vocalics
    'Rri':'ृ', // kRri -> कृ
    'RrI':'ॄ', // kRrI -> कॄ
    'Lli':'ॢ', // kLli -> कॢ (rare)
    'LlI':'ॣ', // kLlI -> कॣ (rare)

    // Less Common / Specific Uses (Keep mappings, ensure handling)
    'ze':'ॆ', // (Short E - South Indian) kze -> कॆ
    'zo':'ॊ', // (Short O - South Indian) kzo -> कॊ

    'aE':'ॅ', // (Candra E - Marathi) kaE -> कॅ
    'aO':'ॉ', // (Candra O - Marathi/Borrowed) kaO -> कॉ

    // Kashmiri / Bihari / Historic (May require AltGr or specific handling)
    // For now, map them, handleInput can decide if they are triggered
    'zau':'\u094F', // k + zau -> कॏ
    // Empty keys omitted as they require special trigger (like AltGr)
    // '\u093A': '', // Needs key
    // '\u093B': '', // Needs key
    // '\u094E': '', // Needs key
    // '\u0955': '', // Needs key
    // '\u0956': '', // Needs key
    // '\u0957': '', // Needs key
};

// Independent Vowels
export const independentVowelMap = {
    // Basic
    'a':'अ',
    'A':'अ',
    'i':'इ',
    'I':'इ',
    'u':'उ',
    'U':'उ',
    'e':'ए',
    'E':'ए',
    'o':'ओ',
    'O':'ओ',

    // Long / Diphthong
    'aa':'आ',
    'AA':'आ',
    'ii':'ई',
    'II':'ई',
    'ee':'ई', // ee -> ई
    'uu':'ऊ',
    'UU':'ऊ',
    'oo':'ऊ', // oo -> ऊ
    'ai':'ऐ',
    'AI':'ऐ', // Assuming AI maps like ai
    'au':'औ',
    'AU':'औ',
    'ou':'औ', // ou -> औ

    // R/L Vocalics
    'RRi':'ऋ', // RRi -> ऋ
    'RRI':'ॠ', // RRI -> ॠ
    'LLi':'ऌ', // LLi -> ऌ
    'LLI':'ॡ', // LLI -> ॡ

    // Less Common / Specific Uses
    'AE':'ॲ', // Marathi AE -> ॲ
    'AO':'ऑ', // Marathi/Borrowed AO -> ऑ

    // 'aE':'ऍ', // Historic/Less common variant of AE
    // 'aO':'ऑ', // This seems redundant with AO, usually AO is preferred

    'zEE':'ऎ', // South Indian Short E
    'zO':'ऒ',  // South Indian Short O (Note: Map had \u0912 which is ओ, corrected to ऒ U+0912)

    // Kashmiri / Bihari / Historic (May require AltGr or specific handling)
    'zA':'ऄ',
    'zAU':'ॵ',
    // Empty keys omitted
};

// Combined lookup for potential vowel starting keys/sequences
// Used to quickly identify if a key press *could* be a vowel
// Add all keys that start any vowel sequence from both maps
export const potentialVowelKeys = new Set([
    'a', 'A', 'e', 'E', 'i', 'I', 'o', 'O', 'u', 'U',
    'R', 'L', 'z' // Covers Rri, Lli, ze, zo, zau etc.
]);

// --- Helper Functions ---

// Insert Character Sequence (Generic) - Useful for independent vowels
export function insertCharacter(input, devanagariRef, charToInsert, cursorPosition) {
    const currentValue = input.value;
    const newValue =
      currentValue.slice(0, cursorPosition) +
      charToInsert +
      currentValue.slice(cursorPosition);
    const newCursorPosition = cursorPosition + charToInsert.length;

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Inserted: ${charToInsert}`);
    logCharactersBeforeCursor(input);
}

// Replace Previous Characters (Generic) - Useful for vowel modifications
export function replacePreviousChars(input, devanagariRef, charsToRemove, charToInsert, cursorPosition) {
    const currentValue = input.value;
    const startReplacePos = cursorPosition - charsToRemove;

    // Ensure we don't go below index 0
    if (startReplacePos < 0) {
        console.error("replacePreviousChars: Attempting to remove too many characters.");
        return; // Or handle differently
    }

    const newValue =
      currentValue.slice(0, startReplacePos) +
      charToInsert +
      currentValue.slice(cursorPosition); // Slice from original cursor pos

    // New cursor position: start of replacement + length of inserted char
    const newCursorPosition = startReplacePos + charToInsert.length;

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Replaced ${charsToRemove} chars with ${charToInsert}`);
    logCharactersBeforeCursor(input);
}


// Helper to apply Dependent Vowel (Matra)
export function applyDependentVowel(input, devanagariRef, matra, cursorPosition) {
    const currentValue = input.value;
    // Context assumes: Base + Halant + ZWNJ before cursor
    const baseConsonant = currentValue[cursorPosition - 3];
    const charsToRemove = 3; // Base + Halant + ZWNJ
    const charToInsert = baseConsonant + matra;

    // Use the generic replace function
    replacePreviousChars(input, devanagariRef, charsToRemove, charToInsert, cursorPosition);
    console.log(`Applied Matra: ${matra} to ${baseConsonant}`);
}

// Insert Consonant Sequence (Existing Helper)
export function insertConsonantSequence(input, devanagariRef, baseChar, cursorPosition) {
    const currentValue = input.value;
    const sequence = baseChar + HALANT + ZWNJ;
    const sequenceLength = sequence.length; // Should be 3

    const newValue =
      currentValue.slice(0, cursorPosition) +
      sequence +
      currentValue.slice(cursorPosition);

    const newCursorPosition = cursorPosition + sequenceLength;

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Inserted ${baseChar} + Halant + ZWNJ`);
    logCharactersBeforeCursor(input);
}

// Replace Consonant Sequence (Existing Helper)
export function replaceConsonantSequence(input, devanagariRef, baseChar, cursorPosition, charsToRemove) {
    const currentValue = input.value;
    const sequence = baseChar + HALANT + ZWNJ;
    const sequenceLength = sequence.length; // Should be 3

    const newValue =
      currentValue.slice(0, cursorPosition - charsToRemove) +
      sequence +
      currentValue.slice(cursorPosition);

    // New cursor position: original position - removed chars + inserted chars
    const newCursorPosition = cursorPosition - charsToRemove + sequenceLength;

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Replaced ${charsToRemove} chars with ${baseChar} + Halant + ZWNJ`);
    logCharactersBeforeCursor(input);
}

// Handle Single Consonant (Existing Helper)
export function handleSingleConsonant(event, devanagariRef, devanagariChar) {
  const input = event.target;
  const cursorPosition = input.selectionStart;
  const currentValue = input.value;
  const characterRelativeMinus1 = currentValue[cursorPosition - 1];

  // No preventDefault needed here, it's handled in handleInput before calling this

  if (characterRelativeMinus1 === ZWNJ) {
    // If ZWNJ is just before cursor (likely from explicit halant or previous op),
    // remove it before inserting the new consonant sequence.
    // We need to replace the ZWNJ, not just insert after it.
    replacePreviousChars(input, devanagariRef, 1, devanagariChar + HALANT + ZWNJ, cursorPosition);
    console.log(`Replaced ZWNJ with ${devanagariChar} + Halant + ZWNJ`);

  } else {
    // Standard insertion
    insertConsonantSequence(input, devanagariRef, devanagariChar, cursorPosition);
  }
}

// --- Vowel Sequence Handling Logic ---
// This map helps determine potential replacements for multi-key vowels
// Structure: { precedingDevChar: { currentKey: replacementDevChar } }
// Needs to cover both dependent and independent forms
export const vowelReplacementMap = {
    // --- Dependent Vowel Replacements (Matras) ---
    'ि': { // Preceding character is short i matra (from 'i')
        'i': 'ी', // 'i' + 'i' -> long ii matra
        'e': 'ी', // 'i' + 'e' -> long ee matra (assuming ie -> ee)
        // 'a': ? No common ia combination like this
        // 'u': ? No common iu combination like this
    },
    'ु': { // Preceding character is short u matra (from 'u')
        'u': 'ू', // 'u' + 'u' -> long uu matra
        'o': 'ू', // 'u' + 'o' -> long oo matra (assuming uo -> oo)
    },
    'े': { // Preceding character is e matra (from 'e')
        'e': 'ी', // 'e' + 'e' -> long ee matra (common alternative)
        'i': 'ै', // 'e' + 'i' -> ai matra
    },
    'ो': { // Preceding character is o matra (from 'o')
        'o': 'ू', // 'o' + 'o' -> long oo matra (common alternative)
        'u': 'ौ', // 'o' + 'u' -> au matra
        'i': 'ौ', // 'o' + 'i' -> oi -> au matra (less common, maybe?)
    },
    'ृ': { // Preceding character is Rri matra (from 'Rri')
        'I': 'ॄ', // 'Rri' + 'I' -> RrI matra
        'i': 'ॄ', // 'Rri' + 'i' -> RrI matra (alternative?)
    },
    'ॢ': { // Preceding character is Lli matra (from 'Lli')
        'I': 'ॣ', // 'Lli' + 'I' -> LlI matra
        'i': 'ॣ', // 'Lli' + 'i' -> LlI matra (alternative?)
    },
    'ा': { // Preceding character is aa matra (from 'a'/'aa')
        'a': 'ा', // 'a' + 'a' -> aa matra (no change)
        'E': 'ॅ', // 'a' + 'E' -> aE matra
        'O': 'ॉ', // 'a' + 'O' -> aO matra
        // 'i': 'ै', // a + i -> ai ? Usually e + i -> ai
        // 'u': 'ौ', // a + u -> au ? Usually o + u -> au
    },
    // Add other specific matra combinations if needed (ze, zo etc.)

    // --- Independent Vowel Replacements ---
    'इ': { // Preceding character is short I (from 'i'/'I')
        'i': 'ई', // 'i' + 'i' -> long II
        'I': 'ई', // 'i' + 'I' -> long II
        'e': 'ई', // 'i' + 'e' -> long EE
        'E': 'ई', // 'i' + 'E' -> long EE
    },
    'उ': { // Preceding character is short U (from 'u'/'U')
        'u': 'ऊ', // 'u' + 'u' -> long UU
        'U': 'ऊ', // 'u' + 'U' -> long UU
        'o': 'ऊ', // 'u' + 'o' -> long OO
        'O': 'ऊ', // 'u' + 'O' -> long OO
    },
    'ए': { // Preceding character is E (from 'e'/'E')
        'e': 'ई', // 'e' + 'e' -> long EE
        'E': 'ई', // 'e' + 'E' -> long EE
        'i': 'ऐ', // 'e' + 'i' -> AI
        'I': 'ऐ', // 'e' + 'I' -> AI
    },
    'ओ': { // Preceding character is O (from 'o'/'O')
        'o': 'ऊ', // 'o' + 'o' -> long OO
        'O': 'ऊ', // 'o' + 'O' -> long OO
        'u': 'औ', // 'o' + 'u' -> AU
        'U': 'औ', // 'o' + 'U' -> AU
    },
    'अ': { // Preceding character is A (from 'a'/'A')
        'a': 'आ', // 'a' + 'a' -> AA
        'A': 'आ', // 'a' + 'A' -> AA
        'E': 'ॲ', // 'a' + 'E' -> AE (Marathi)
        'O': 'ऑ', // 'a' + 'O' -> AO (Marathi/Borrowed)
        // 'i': 'ऐ', // a + i -> ai? Usually e + i -> ai
        // 'u': 'औ', // a + u -> au? Usually o + u -> au
        // 'e': 'ऍ', // a + e -> aE (Historic?)
    },
    'ऋ': { // Preceding character is RRi (from 'RRi')
        'I': 'ॠ', // 'RRi' + 'I' -> RRI
    },
    'ऌ': { // Preceding character is LLi (from 'LLi')
        'I': 'ॡ', // 'LLi' + 'I' -> LLI
    },
     // Add other specific independent vowel combinations if needed
};

// --- Complex Sequence Prefixes ---
// Helps identify potential multi-character sequences like 'Rr' or 'Ll'
// Structure: { key: potentialNextKey[] }
export const sequencePrefixes = {
    'R': ['r', 'R'], // R can be followed by r/i (Rr) or R/I (RR)
    'L': ['l', 'L'], // L can be followed by l/i (Ll) or L/I (LL)
    'z': ['e', 'o', 'a', 'E', 'A', 'O', 'U'], // z can start ze, zo, za, zE, zA etc.
    'a': ['a', 'e', 'i', 'u', 'E', 'O'], // a can start aa, ae, ai, au, aE, aO
    'A': ['A', 'E', 'I', 'O', 'U'], // A can start AA, AE, AI, AO, AU
    'e': ['e', 'i'], // e can start ee, ei (ai)
    'E': ['E', 'I'], // E can start EE, EI (ai)
    'i': ['i', 'e'], // i can start ii, ie (ee)
    'I': ['I', 'E'], // I can start II, IE (ee)
    'o': ['o', 'u', 'i'], // o can start oo, ou (au), oi (au?)
    'O': ['O', 'U', 'I'], // O can start OO, OU (au), OI (au?)
    'u': ['u', 'o'], // u can start uu, uo (oo)
    'U': ['U', 'O'], // U can start UU, UO (oo)
};

// Create combined maps for easier lookup during processing
// Map Roman sequences to their Devanagari outputs (both dep/indep where applicable)
// This helps resolve sequences like 'Rri', 'aE' etc directly.
export const combinedVowelMap = { ...dependentVowelMap, ...independentVowelMap };