// InputClusterCode.js

export function logCharactersBeforeCursor(input) {
  const cursorPosition = input.selectionStart;
  const currentValue = input.value;
  console.log("Chars before cursor:", {
    'Pos': cursorPosition,
    '-5': currentValue[cursorPosition - 5] || '[Start]',
    '-4': currentValue[cursorPosition - 4] || '[Start]',
    '-3': currentValue[cursorPosition - 3] || '[Start]',
    '-2': currentValue[cursorPosition - 2] || '[Start]',
    '-1': currentValue[cursorPosition - 1] || '[Start]',
  });
}

// --- Character Constants ---
export const HALANT = '\u094D';
export const ZWNJ = '\u200C'; // Zero-Width Non-Joiner

// --- Consonant Mappings (Keep Existing) ---
export const singleConsonantMap = {
  'k': 'क', 'g': 'ग', 'c': 'च', 'j': 'ज', 'T': 'ट', 't': 'त',
  'D': 'ड', 'd': 'द', 'N': 'ण', 'n': 'न', 'p': 'प', 'b': 'ब',
  'm': 'म', 'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'V': 'ङ',
  'S': 'ष', 's': 'स', 'h': 'ह', 'L': 'ळ', 'Y': 'ञ',
};

export const doubleCharMap = {
  'h': {
    'क': { resultChar: 'ख', remove: 3 }, 'ग': { resultChar: 'घ', remove: 3 },
    'च': { resultChar: 'छ', remove: 3 }, 'ज': { resultChar: 'झ', remove: 3 },
    'ट': { resultChar: 'ठ', remove: 3 }, 'ड': { resultChar: 'ढ', remove: 3 },
    'त': { resultChar: 'थ', remove: 3 }, 'द': { resultChar: 'ध', remove: 3 },
    'प': { resultChar: 'फ', remove: 3 }, 'ब': { resultChar: 'भ', remove: 3 },
    'स': { resultChar: 'श', remove: 3 },
  },
  's': { 'क': { resultChar: 'क्ष', remove: 3 } },
  'S': { 'क': { resultChar: 'क्ष', remove: 3 } },
  // Add special R/L vowel sign triggers here
  // Triggered by 'i' or 'I' after 'r' or 'l' consonant context
  'i': {
      'र': { resultChar: 'रि', remove: 3, type: 'VOWEL_SIGN_DIRECT' }, // r + i -> रि (Direct replace)
      'ल': { resultChar: 'लि', remove: 3, type: 'VOWEL_SIGN_DIRECT' }, // l + i -> लि
      // How to handle Rri -> ऋ? This needs a 3-char context r+r+i
  },
  'I': { // Assuming capital I triggers capital vowel signs
      'र': { resultChar: 'री', remove: 3, type: 'VOWEL_SIGN_DIRECT' }, // r + I -> री
      'ल': { resultChar: 'ली', remove: 3, type: 'VOWEL_SIGN_DIRECT' }, // l + I -> ली
       // How to handle RRI -> ॠ? Needs r+r+I context
  }
  // Rri/Lli: Let's handle these via the vowel logic checking the *input sequence*
};

export const tripleCharMap = {
  'y': {
    'दन': { resultChar: 'ज्ञ', remove: 5 }, // d + n + y -> dny (ज्ञ)
    'गञ': { resultChar: 'ज्ञ', remove: 5 }, // g + Y + y -> gny (ज्ञ)
    'गन': { resultChar: 'ज्ञ', remove: 5 }, // g + n + y -> gny (ज्ञ)
  },
  'r': {
    'श': { resultChar: 'श्र', remove: 3 }, // sh + r -> shr
  },
   // Add Rri/RrI/Lli/LlI?
   // Trigger 'i', context 'rr', result 'ृ'?
   // Need to check preceding BASE consonants carefully.
   // Example Rri: Context needs to be र् + ZWNJ + र् + ZWNJ. Key 'i'. Remove 5, add ृ.
   // Let's add this logic directly in handleInput for clarity.
};


// --- Vowel Maps (New) ---
export const independentVowelMap = {
    'a': 'अ', 'A': 'अ',
    'i': 'इ', 'I': 'इ',
    'u': 'उ', 'U': 'उ',
    'e': 'ए', 'E': 'ए',
    'o': 'ओ', 'O': 'ओ',
    'aa': 'आ', 'AA': 'आ',
    'ii': 'ई', 'II': 'ई', 'ee': 'ई',
    'uu': 'ऊ', 'UU': 'ऊ', 'oo': 'ऊ',
    'ai': 'ऐ', 'AI': 'ऐ', 'EE': 'ऐ',
    'au': 'औ', 'AU': 'औ', 'ou': 'औ', 'OU': 'औ',
    'aE': 'ॲ', 'AE': 'ॲ',
    'aO': 'ऑ', 'AO': 'ऑ',
    'RRi': 'ऋ', 'RRI': 'ॠ', // Independent forms
    'LLi': 'ऌ', 'LLI': 'ॡ',
};

export const dependentVowelMap = {
    'a': 'ा', 'A': 'ा',
    'i': 'ि', 'I': 'ि',
    'u': 'ु', 'U': 'ु',
    'e': 'े', 'E': 'े',
    'o': 'ो', 'O': 'ो',
    'aa': 'ा', 'AA': 'ा',
    'ii': 'ी', 'II': 'ी', 'ee': 'ी',
    'uu': 'ू', 'UU': 'ू', 'oo': 'ू',
    'ai': 'ै', 'AI': 'ै', 'EE': 'ै',
    'au': 'ौ', 'AU': 'ौ', 'ou': 'ौ', 'OU': 'ौ',
    'aE': 'ॅ', 'AE': 'ॅ',
    'aO': 'ॉ', 'AO': 'ॉ',
    // Dependent R/L vowel signs
    'Rri': 'ृ', 'RRI': 'ॄ',
    'Lli': '\u0962', 'LlI': '\u0963',
};

// Order for checking vowel inputs (longest first)
export const vowelInputOrder = [
    'RRI', 'LLI', 'RRi', 'LLi', // 3 chars
    'aa', 'AA', 'ii', 'II', 'ee', 'uu', 'UU', 'oo', 'ai', 'AI', 'EE', 'au', 'AU', 'ou', 'OU', 'aE', 'AE', 'aO', 'AO', // 2 chars
    'a', 'A', 'i', 'I', 'u', 'U', 'e', 'E', 'o', 'O' // 1 char
].filter(key => independentVowelMap[key] !== undefined); // Use keys present in the map


// --- Helper Functions (Keep Existing + Additions) ---

// Inserts Base Consonant + Halant + ZWNJ
export function insertConsonantSequence(input, devanagariRef, baseChar, cursorPosition) {
    // ... (keep existing implementation)
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
    console.log(`Inserted Consonant: ${baseChar} + Halant + ZWNJ`);
}

// Replaces preceding chars with Base Consonant + Halant + ZWNJ
export function replaceConsonantSequence(input, devanagariRef, baseChar, cursorPosition, charsToRemove) {
    // ... (keep existing implementation)
      const currentValue = input.value;
    const sequence = baseChar + HALANT + ZWNJ;
    const sequenceLength = sequence.length; // Should be 3

    const newValue =
      currentValue.slice(0, cursorPosition - charsToRemove) +
      sequence +
      currentValue.slice(cursorPosition);

    const newCursorPosition = cursorPosition - charsToRemove + sequenceLength;

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Replaced ${charsToRemove} chars with Consonant: ${baseChar} + Halant + ZWNJ`);
}

// Handles insertion of single consonants (no multi-match)
export function handleSingleConsonant(event, devanagariRef, devanagariChar) {
     // ... (keep existing implementation, but check if ZWNJ removal is always desired)
     const input = event.target;
     const cursorPosition = input.selectionStart;
     const currentValue = input.value;
     const characterRelativeMinus1 = currentValue[cursorPosition - 1];

     event.preventDefault();

     // Original logic removed ZWNJ if present. This might interfere with explicit ZWNJ use.
     // Let's simplify: Always insert the sequence. If ZWNJ was there, it gets overwritten or pushed.
     // if (characterRelativeMinus1 === ZWNJ) { ... } else { ... }
     insertConsonantSequence(input, devanagariRef, devanagariChar, cursorPosition);

     console.log(`State AFTER processing (Single Consonant):`);
     logCharactersBeforeCursor(input);
}

// **NEW**: Inserts an Independent Vowel
export function insertIndependentVowel(input, devanagariRef, vowelChar, cursorPosition) {
    const currentValue = input.value;
    const newValue =
        currentValue.slice(0, cursorPosition) +
        vowelChar +
        currentValue.slice(cursorPosition);
    const newCursorPosition = cursorPosition + vowelChar.length;

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Inserted Independent Vowel: ${vowelChar}`);
}

// **NEW**: Applies a Dependent Vowel (Matra)
// Replaces the preceding Halant + ZWNJ with the matra
export function applyDependentVowel(input, devanagariRef, matraChar, cursorPosition) {
    const currentValue = input.value;
    // Assumes cursor is after Halant + ZWNJ (remove 2 chars)
    const charsToRemove = 2;
    if (cursorPosition < charsToRemove) return; // Cannot apply if not enough chars

    const newValue =
        currentValue.slice(0, cursorPosition - charsToRemove) +
        matraChar +
        currentValue.slice(cursorPosition);
    // Cursor position moves back by 2, then forward by matra length
    const newCursorPosition = cursorPosition - charsToRemove + matraChar.length;

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Applied Dependent Vowel: ${matraChar}`);
}

// **NEW**: Replaces a preceding Independent Vowel with a new one (for aa, ii etc.)
export function replaceIndependentVowel(input, devanagariRef, newVowelChar, cursorPosition, charsToRemove) {
    const currentValue = input.value;
    if (cursorPosition < charsToRemove) return;

    const newValue =
        currentValue.slice(0, cursorPosition - charsToRemove) +
        newVowelChar +
        currentValue.slice(cursorPosition);
    const newCursorPosition = cursorPosition - charsToRemove + newVowelChar.length;

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Replaced Independent Vowel (${charsToRemove} chars) with: ${newVowelChar}`);
}
// todo backspace not working when 3 consonents join