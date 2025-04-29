// devanagariInputUtils.js
import {
    // Consonants
    singleConsonantMap, doubleCharMap, tripleCharMap,
    handleSingleConsonant, insertConsonantSequence, replaceConsonantSequence,
    // Vowels (New Imports)
    independentVowelMap, dependentVowelMap, vowelInputOrder,
    insertIndependentVowel, applyDependentVowel, replaceIndependentVowel,
    // Utils
    logCharactersBeforeCursor, HALANT, ZWNJ
} from './InputClusterCode'

// Helper to check if a character is a Devanagari base consonant
function isDevanagariConsonant(char) {
    if (!char) return false;
    const code = char.charCodeAt(0);
    // Range U+0915 to U+0939 (क to ह), plus U+0958 to U+095F (क़ to य़), plus others
    return (code >= 0x0915 && code <= 0x0939) || (code >= 0x0958 && code <= 0x095F) ||
           ['ळ', 'ङ', 'ञ', 'ण', 'ष'].includes(char); // Add specific consonants if needed
}

// Helper to check if a character is a Devanagari independent vowel
function isIndependentVowel(char) {
     if (!char) return false;
     // Check against the values in the independentVowelMap for single chars
     return Object.values(independentVowelMap).includes(char);
    // More specific range check: U+0904 to U+0914, plus U+0960 to U+0961, etc.
    // const code = char.charCodeAt(0);
    // return (code >= 0x0904 && code <= 0x0914) || (code >= 0x0960 && code <= 0x0961);
}


export function handleInput(event, devanagariRef) {
    // --- Initial Setup & Logging ---
    if (event.metaKey || event.ctrlKey || event.altKey) { // Allow Shift
        return;
    }
    if (event.key.length > 1 && !['Backspace', 'Shift'].includes(event.key)) { // Allow Shift for capitals
       // Ignore arrow keys, Enter, Tab etc. for typing logic
       // Could add specific handling for Enter/Tab if needed later
       return;
    }
    // If only Shift is pressed, do nothing
    if (event.key === 'Shift') return;


    const input = event.target;
    let cursorPosition = input.selectionStart; // Use let as it might change before processing
    const currentValue = input.value;
    const key = event.key; // The Roman key pressed (could be upper or lower)

    console.log("-------------------------");
    console.log(`Key pressed: ${key} (at pos ${cursorPosition})`);
    console.log("State BEFORE processing:");
    logCharactersBeforeCursor(input);

    // Get Context Characters
    const charM1 = currentValue[cursorPosition - 1];
    const charM2 = currentValue[cursorPosition - 2];
    const charM3 = currentValue[cursorPosition - 3];
    const charM4 = currentValue[cursorPosition - 4];
    const charM5 = currentValue[cursorPosition - 5];

    // --- Explicit Halant ('q' key) ---
    if (key === 'q') {
        event.preventDefault();
        // Insert Halant + ZWNJ
        const sequence = HALANT + ZWNJ;
        const newValue =
            currentValue.slice(0, cursorPosition) +
            sequence +
            currentValue.slice(cursorPosition);
        devanagariRef.value = newValue;
        input.value = newValue;
        input.setSelectionRange(cursorPosition + sequence.length, cursorPosition + sequence.length);
        console.log('Inserted explicit halant + ZWNJ');
        logCharactersBeforeCursor(input);
        return;
    }

    // --- Backspace Handling (Keep Unchanged) ---
    if (key === 'Backspace') {
        // Condition 1: Remove Base + Halant + ZWNJ cluster
        if (charM1 === ZWNJ && charM2 === HALANT && isDevanagariConsonant(charM3)) {
            event.preventDefault();
            console.log('Backspace: removing Base + Halant + ZWNJ');
            const newValue =
                currentValue.slice(0, cursorPosition - 3) +
                currentValue.slice(cursorPosition);
            devanagariRef.value = newValue;
            input.value = newValue;
            input.setSelectionRange(cursorPosition - 3, cursorPosition - 3);
            logCharactersBeforeCursor(input);
            return;
        }
        // Condition 2: Original special ZWNJ insertion logic (kept as requested)
        else if (charM2 === HALANT && cursorPosition >= 2) {
             event.preventDefault();
             const newValue =
               currentValue.slice(0, cursorPosition - 1) + ZWNJ + currentValue.slice(cursorPosition);
             console.log('Backspace: Removed last char, Inserted ZWNJ after halant (original logic)');
             devanagariRef.value = newValue;
             input.value = newValue;
             input.setSelectionRange(cursorPosition, cursorPosition); // Cursor position remains same
             logCharactersBeforeCursor(input);
             return;
        }
        // Condition 3: Default backspace
        else {
            console.log('Backspace: Default behavior');
             queueMicrotask(() => {
                 devanagariRef.value = input.value;
                 logCharactersBeforeCursor(input);
             });
            // No preventDefault, let browser handle it
            return;
        }
    }


    // --- Consonant Handling ---

    // Check Triple Consonants
    const tripleCheckKey = key === 'Shift' ? event.code : key; // Use key unless it's Shift
    const tripleMappings = tripleCharMap[tripleCheckKey.toLowerCase()] || tripleCharMap[tripleCheckKey]; // Check lower/upper
    if (tripleMappings && cursorPosition >= 5 && charM1 === ZWNJ && charM2 === HALANT && charM4 === HALANT) {
        const precedingSequence = charM5 + charM3; // e.g., "दन"
        if (tripleMappings[precedingSequence]) {
            const mapping = tripleMappings[precedingSequence];
            event.preventDefault();
            replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
            console.log("State AFTER processing (Triple Consonant):");
            logCharactersBeforeCursor(input);
            return;
        }
    }
     if (key === 'r' && tripleCharMap['r'] && cursorPosition >= 3 && charM1 === ZWNJ && charM2 === HALANT && charM3 === 'श') {
         // Special case for 'shr'
         const mapping = tripleCharMap['r']['श'];
         event.preventDefault();
         replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
         console.log("State AFTER processing (Triple Consonant - shr):");
         logCharactersBeforeCursor(input);
         return;
     }


    // Check Double Consonants
    const doubleCheckKey = key === 'Shift' ? event.code : key;
    const doubleMappings = doubleCharMap[doubleCheckKey.toLowerCase()] || doubleCharMap[doubleCheckKey];
    if (doubleMappings && cursorPosition >= 3 && charM1 === ZWNJ && charM2 === HALANT) {
        const precedingBase = charM3;
        if (doubleMappings[precedingBase]) {
            const mapping = doubleMappings[precedingBase];
            event.preventDefault();
             if (mapping.type === 'VOWEL_SIGN_DIRECT') {
                 // Special case from map: replace consonant cluster with vowel applied form
                 const newValue = currentValue.slice(0, cursorPosition - mapping.remove) +
                                  mapping.resultChar + // Direct insertion (e.g., 'रि')
                                  currentValue.slice(cursorPosition);
                 const newCursorPos = cursorPosition - mapping.remove + mapping.resultChar.length;
                 devanagariRef.value = newValue;
                 input.value = newValue;
                 input.setSelectionRange(newCursorPos, newCursorPos);
                 console.log(`Applied Vowel Sign Directly: ${mapping.resultChar}`);

             } else {
                 // Standard consonant replacement
                 replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
             }
            console.log("State AFTER processing (Double Consonant):");
            logCharactersBeforeCursor(input);
            return;
        }
    }

    // Check Single Consonants
    const singleCheckKey = key === 'Shift' ? event.code : key;
    const singleConsonant = singleConsonantMap[singleCheckKey]; // Case sensitive check first
    if (singleConsonant) {
        event.preventDefault();
        handleSingleConsonant(event, devanagariRef, singleConsonant);
        // Logging is inside handleSingleConsonant now
        return;
    }


    // --- Vowel Handling ---
    let vowelHandled = false;
    // Iterate through possible vowel inputs, checking longest first
    for (const romanKey of vowelInputOrder) {
        // Check if the current key *completes* this romanKey sequence
        if (key === romanKey[romanKey.length - 1]) { // Match last char of sequence
             // Need to reconstruct the potential full sequence based *only* on the Devanagari context
             // This is hard without a Roman buffer. Let's simplify: Check if the current key *is* a vowel input.

             if (key !== romanKey) continue; // For now, only check exact key matches in the loop

             const indVowel = independentVowelMap[romanKey];
             const depVowel = dependentVowelMap[romanKey];

             if (!indVowel && !depVowel) continue; // Should not happen due to filter

             event.preventDefault(); // Assume we'll handle it

             // Context Check:
             // 1. Preceded by Consonant + Halant + ZWNJ? Apply dependent vowel.
             if (charM1 === ZWNJ && charM2 === HALANT && isDevanagariConsonant(charM3)) {
                 applyDependentVowel(input, devanagariRef, depVowel, cursorPosition);
                 vowelHandled = true;
                 break; // Stop checking shorter vowels
             }
             // 2. Preceded by an Independent Vowel? Check for combination (aa, ii etc.)
             //    This requires checking if the *previous* Roman key logically matches charM1. Too complex.
             //    Let's simplify: Only combine if the current *romanKey* implies it (e.g. "aa", "ii").
             //    If romanKey length > 1 and charM1 is the independent vowel of the *first part* of romanKey.
             if (romanKey.length > 1 && isIndependentVowel(charM1)) {
                  // Get the expected preceding vowel for this combination
                  const firstPartKey = romanKey.slice(0, -1); // e.g., "a" from "aa"
                  const expectedPrecedingVowel = independentVowelMap[firstPartKey];
                  if (charM1 === expectedPrecedingVowel) {
                       replaceIndependentVowel(input, devanagariRef, indVowel, cursorPosition, charM1.length);
                       vowelHandled = true;
                       break;
                  }
             }

             // 3. Special R/L Vowel Signs (e.g., Rri -> ृ)
             //    Check if the key implies one and the context matches Consonant + Halant + ZWNJ
              if (['Rri', 'RRI', 'Lli', 'LlI'].includes(romanKey)) {
                   const expectedConsonant = romanKey.startsWith('R') ? 'र' : 'ल';
                   if (charM1 === ZWNJ && charM2 === HALANT && charM3 === expectedConsonant) {
                        applyDependentVowel(input, devanagariRef, depVowel, cursorPosition); // depVowel is ृ, ॄ etc.
                        vowelHandled = true;
                        break;
                   }
              }


             // 4. Default: Insert Independent Vowel
             //    Handles start of input, after space, after full consonant, after different vowel
             insertIndependentVowel(input, devanagariRef, indVowel, cursorPosition);
             vowelHandled = true;
             break; // Stop checking shorter vowels
        }
    }

    if (vowelHandled) {
        console.log("State AFTER processing (Vowel):");
        logCharactersBeforeCursor(input);
        return;
    }


    // --- Fallback ---
    console.log(`Key "${key}" not handled by custom logic. Default behavior might occur.`);
    queueMicrotask(() => {
        if(input.value !== devanagariRef.value) { // Update ref only if default action caused change
           devanagariRef.value = input.value;
        }
        logCharactersBeforeCursor(input); // Log state after potential default insertion
    });

} // End of handleInput