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

// --- Single Character Mappings ---
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
  // Add others if needed: 'f': 'फ', 'z': 'ज' (or 'ज़' if needed later)
  // Note: 'q' is handled separately for explicit halant.
  // Keys like 'h' will primarily trigger multi-char checks first.
};

// --- Double Character Mappings ---
// Structure: triggerKey: { precedingDevanagariBase: { resultChar: devanagariBase, remove: count } }
// 'remove: count' indicates how many chars (Base + Halant + ZWNJ) to remove before inserting the new char.
export const doubleCharMap = {
  'h': { // Aspirates + sh
    'क': { resultChar: 'ख', remove: 3 }, // k + h -> kh
    'ग': { resultChar: 'घ', remove: 3 }, // g + h -> gh
    'च': { resultChar: 'च', remove: 3 }, // c + h -> ch - WAIT: 'ch' is often 'च'. Let's map 'c' to 'च' and handle 'chh' in triples.
    // Let's rethink 'ch'. If 'c' is 'च', then 'h' following makes 'छ'.
    // 'च': { resultChar: 'छ', remove: 3 }, // c + h -> chh (Incorrect based on provided map, ch=च, chh=छ)
    // Let's assume 'c'='च' is handled by single map. 'h' handles aspiration.
    'ज': { resultChar: 'झ', remove: 3 }, // j + h -> jh
    'ट': { resultChar: 'ठ', remove: 3 }, // T + h -> Th
    'ड': { resultChar: 'ढ', remove: 3 }, // D + h -> Dh
    'त': { resultChar: 'थ', remove: 3 }, // t + h -> th
    'द': { resultChar: 'ध', remove: 3 }, // d + h -> dh
    'प': { resultChar: 'फ', remove: 3 }, // p + h -> ph
    'ब': { resultChar: 'भ', remove: 3 }, // b + h -> bh
    'स': { resultChar: 'श', remove: 3 }, // s + h -> sh
    // Q-prefixed aspiration needs context from 'Q' key, tricky without buffer. Let's ignore Q for now.
    // 'क़': { resultChar: 'ख़', remove: 3 }, // Qk + h -> Qkh
    // 'ड़': { resultChar: 'ढ़', remove: 3 }, // QD + h -> QDh
  },
  's': {
    'क': { resultChar: 'क्ष', remove: 3 }, // k + s -> ks (maps to kS = क्ष)
  },
  'S': { // Assuming capital S for ष, also forms kS = क्ष
    'क': { resultChar: 'क्ष', remove: 3 }  // k + S -> kS
  },
  // Other potential doubles? 'gy' -> 'ज्ञ'? Often 'j' + 'n' + 'y'. Handled in triple.
};

// --- Triple Character Mappings ---
// Structure: triggerKey: { precedingDevSequence: { resultChar: devanagariBase, remove: count } }
// 'precedingDevSequence' is the sequence of Devanagari *base* consonants.
// 'remove: count' is the total chars to remove (Consonants + Halants + ZWNJs).
export const tripleCharMap = {
  'h': {
     // If 'c' maps to 'च', then 'ch' is 'च' + 'h'. What about 'chh'?
     // Let's assume 'ch' ('च्' + ZWNJ) needs another 'h' to become 'छ'.
    'च': { resultChar: 'छ', remove: 3 }, // Assuming 'ch' was formed by c+h, now another h makes chh. Check context carefully in handleInput. OR: Maybe 'c'='च', 'h' makes 'छ'. Let's assume 'c'='च', 'h' makes 'छ' from 'च'.
    // If 'c'='च', 'h' makes 'छ' -> This should be in doubleCharMap['h']['च'] = 'छ'. Let's update doubleCharMap.
    // 'kS' + 'h' -> kSh (which is also क्ष). Already handled by ks/kS. No change needed.
    // 's' + 'h' + 'r' -> shr ? Handled by 'sh' then 'r'.
  },
  'y': {
    // 'd'+'n'+'y' -> 'dny' -> ज्ञ. Context: द् + ् + ZWNJ + न + ् + ZWNJ. Press 'y'. Check chars -5,-4,-3,-2,-1 = द्, ्, न, ्, ZWNJ.
    // Careful: ZWNJ might be missing if typing fast or depending on previous logic. Check for base consonants + halants primarily.
    // Let's simplify context check: Look for Base1 + Halant + Base2 + Halant + ZWNJ
    'दन': { resultChar: 'ज्ञ', remove: 5 }, // d + n + y -> dny (ज्ञ) - Removes द् + ् + न + ् + ZWNJ
    'गञ': { resultChar: 'ज्ञ', remove: 5 }, // g + Y + y (?) -> gny (ज्ञ) - Requires 'Y' mapping to 'ञ'. Removes ग् + ् + ञ + ् + ZWNJ
     // Alternative for gny: 'g' + 'n' + 'y'. Context: ग् + ् + न + ् + ZWNJ
    'गन': { resultChar: 'ज्ञ', remove: 5 }, // g + n + y -> gny (ज्ञ) - Removes ग् + ् + न + ् + ZWNJ
  },
  'r': {
    'श': { resultChar: 'श्र', remove: 3 }, // sh + r -> shr - Context: श् + ZWNJ. Press 'r'. Replace with श्र् + ZWNJ.
  },
  // Add other triples as needed, e.g., from Q-prefixed list if logic is adapted.
};

// --- Helper Function to Insert Character Sequence ---
// This function handles inserting the Devanagari Base + Halant + ZWNJ correctly.
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

// --- Helper Function to Replace Character Sequence ---
// This function replaces a certain number of chars before the cursor with the new sequence.
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


// --- Original handleSingleConsonant - Modified to use Helpers ---
// This is now primarily for inserting a consonant when no multi-char sequence is formed.
export function handleSingleConsonant(event, devanagariRef, devanagariChar) {
  const input = event.target;
  const cursorPosition = input.selectionStart;
  const currentValue = input.value;
  const characterRelativeMinus1 = currentValue[cursorPosition - 1];

  event.preventDefault();

  if (characterRelativeMinus1 === ZWNJ) {
    // If ZWNJ is just before cursor (likely from a previous incomplete sequence or vowel),
    // remove it before inserting the new consonant sequence.
    const newValue =
      currentValue.slice(0, cursorPosition - 1) +
      devanagariChar + HALANT + ZWNJ +
      currentValue.slice(cursorPosition);

    const newCursorPosition = cursorPosition - 1 + 3; // Removed 1, Added 3

    devanagariRef.value = newValue;
    input.value = newValue;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    console.log(`Removed ZWNJ, Inserted ${devanagariChar} + Halant + ZWNJ`);
    logCharactersBeforeCursor(input);

  } else {
    // Standard insertion
    insertConsonantSequence(input, devanagariRef, devanagariChar, cursorPosition);
  }
}


// Update doubleCharMap based on clarification for 'ch'/'chh'
// Assuming 'c' -> 'च', 'h' following 'च' makes 'छ'.
doubleCharMap['h']['च'] = { resultChar: 'छ', remove: 3 }; // c + h -> chh (mapping 'ch' to 'छ')
// Remove the triple map entry for 'h'/'च' as it's now handled by double map.
delete tripleCharMap['h']['च'];
if (Object.keys(tripleCharMap['h']).length === 0) {
    delete tripleCharMap['h']; // Clean up empty entry
}

// Ensure base map reflects 'c' -> 'च'
singleConsonantMap['c'] = 'च';

//todo
// decent typing - backspace failling for triple conjoins