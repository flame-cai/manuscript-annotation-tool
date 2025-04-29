import {
    singleConsonantMap,
    doubleCharMap,
    tripleCharMap,
    dependentVowelMap,      // Import new map
    independentVowelMap,    // Import new map
    combinedVowelMap,       // Import new map
    potentialVowelKeys,     // Import helper set
    vowelReplacementMap,    // Import replacement logic map
    sequencePrefixes,       // Import sequence prefix info
    handleSingleConsonant,
    insertCharacter,        // Import new helper
    replacePreviousChars,   // Import new helper
    applyDependentVowel,    // Import new helper
    insertConsonantSequence,
    replaceConsonantSequence,
    logCharactersBeforeCursor,
    HALANT,
    ZWNJ
  } from './InputClusterCode'
  
  // Store the effective last typed key (ignoring modifiers, used for sequences)
  let lastEffectiveKey = null;
  
  export function handleInput(event, devanagariRef) {
    const key = event.key;
    const input = event.target;
    const cursorPosition = input.selectionStart;
    const currentValue = input.value;
  
    // --- Basic Filtering ---
    // Ignore keys with Ctrl/Meta/Alt (allow AltGr later if needed)
    // Allow Shift only if it produces a capital letter used in maps
    if (event.metaKey || event.ctrlKey || event.altKey) { // Removed Shift check here
        console.log("Ignoring Ctrl/Meta/Alt key press");
        return;
    }
  
     // Check if Shift resulted in a symbol not in maps (e.g., Shift+1 = !)
     // Or if it's a non-printing key (except Backspace)
     let effectiveKey = key; // Use 'key' by default
     if (event.shiftKey && key.length === 1 && !key.match(/[a-zA-Z]/)) {
          console.log("Ignoring Shift + Symbol key press");
          lastEffectiveKey = null; // Reset sequence tracking
          return; // Ignore Shift+Number, Shift+Symbol etc.
     } else if (key.length > 1 && key !== 'Backspace') {
         console.log(`Ignoring functional key: ${key}`);
         lastEffectiveKey = null; // Reset sequence tracking
         return; // Ignore Arrow Keys, Enter, Tab, etc.
     } else if (event.shiftKey && key.length === 1 && key.match(/[A-Z]/)) {
         effectiveKey = key; // Use the uppercase key produced by Shift
     } else if (key.length === 1 && key.match(/[a-z]/)) {
         effectiveKey = key; // Use the lowercase key
     } else if (key === 'Backspace') {
          effectiveKey = 'Backspace';
     } else {
          // Allow numbers, basic symbols? Or ignore them too?
          // For now, let unmapped chars pass through fallback.
          console.log(`Key "${key}" might pass to fallback`);
          effectiveKey = key; // Pass it along
     }
  
  
    // --- Log current state ---
    console.log("-------------------------");
    console.log(`Effective Key: ${effectiveKey} (at pos ${cursorPosition}) | Last Key: ${lastEffectiveKey}`);
    console.log("State BEFORE processing:");
    logCharactersBeforeCursor(input);
  
    // --- Get Context Characters ---
    const charM1 = currentValue[cursorPosition - 1];
    const charM2 = currentValue[cursorPosition - 2];
    const charM3 = currentValue[cursorPosition - 3];
    const charM4 = currentValue[cursorPosition - 4];
    const charM5 = currentValue[cursorPosition - 5];
  
    // --- Explicit Halant ('q' key - now mapped to 'क') ---
    // Re-purpose 'q' or choose another key (e.g., '~') for explicit Halant+ZWNJ
    // Using '`' (backtick) as an example for explicit halant inserter
    if (effectiveKey === '`') {
        event.preventDefault();
        // Insert only Halant+ZWNJ, useful for explicit conjunct control
        const sequence = HALANT + ZWNJ;
        insertCharacter(input, devanagariRef, sequence, cursorPosition);
        console.log('Inserted explicit halant + ZWNJ');
        lastEffectiveKey = effectiveKey; // Update last key
        return;
    }
  
    // --- Backspace Handling (Keep existing logic) ---
    if (effectiveKey === 'Backspace') {
        lastEffectiveKey = null; // Reset sequence tracking on backspace
        // Condition 1: Remove Base + Halant + ZWNJ
        if (charM1 === ZWNJ && charM2 === HALANT && cursorPosition >=3 ) {
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
        // Condition 2: Original logic - Remove char before cursor, insert ZWNJ if charM2 was Halant
         else if (charM2 === HALANT && cursorPosition >= 2) {
             event.preventDefault();
             const newValue =
               currentValue.slice(0, cursorPosition - 1) + // Remove charM1
               ZWNJ +                                      // Insert ZWNJ
               currentValue.slice(cursorPosition);
             console.log('Backspace: Removed last char, Inserted ZWNJ after halant (original logic)');
             devanagariRef.value = newValue;
             input.value = newValue;
             input.setSelectionRange(cursorPosition, cursorPosition); // Cursor moves forward by 1 (relative to removal)
             logCharactersBeforeCursor(input);
             return;
         }
        // Condition 3: Default backspace behavior
        else {
            console.log('Backspace: Default behavior');
            // Let browser handle, update ref in microtask
            queueMicrotask(() => {
                devanagariRef.value = input.value;
                logCharactersBeforeCursor(input);
            });
            // No preventDefault here
            return;
        }
    }
  
  
    // --- Check for Consonant Sequence Completion (Triples, Doubles) ---
    // Keep this logic exactly as it was
    // Triple Check
    const tripleMappings = tripleCharMap[effectiveKey];
    if (tripleMappings && cursorPosition >= 5) {
        if (charM1 === ZWNJ && charM2 === HALANT && charM4 === HALANT) {
            const precedingSequence = charM5 + charM3;
            if (tripleMappings[precedingSequence]) {
                const mapping = tripleMappings[precedingSequence];
                event.preventDefault();
                replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
                lastEffectiveKey = effectiveKey; // Update last key
                return;
            }
        }
         if (effectiveKey === 'r' && charM1 === ZWNJ && charM2 === HALANT && charM3 === 'श' && tripleMappings['श']) {
              const mapping = tripleMappings['श'];
              event.preventDefault();
              replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
              lastEffectiveKey = effectiveKey; // Update last key
              return;
         }
    }
  
    // Double Check
    const doubleMappings = doubleCharMap[effectiveKey];
    if (doubleMappings && cursorPosition >= 3) {
        if (charM1 === ZWNJ && charM2 === HALANT) {
            const precedingBase = charM3;
            if (doubleMappings[precedingBase]) {
                const mapping = doubleMappings[precedingBase];
                event.preventDefault();
                replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
                lastEffectiveKey = effectiveKey; // Update last key
                return;
            }
        }
    }
  
    // --- *** NEW VOWEL HANDLING LOGIC *** ---
  
    let potentialSequence = '';
    if (lastEffectiveKey && sequencePrefixes[lastEffectiveKey]?.includes(effectiveKey)) {
        potentialSequence = lastEffectiveKey + effectiveKey;
        console.log("Potential Multi-char sequence:", potentialSequence);
  
        // Check 2-char sequences first (e.g., 'aa', 'ii', 'ai', 'au', 'Rr', 'Ll', 'aE' etc.)
        if (combinedVowelMap[potentialSequence]) {
              // Check context: Does this sequence modify a preceding consonant or vowel?
              const isDependentContext = charM1 === ZWNJ && charM2 === HALANT && cursorPosition >= 3;
              const isVowelReplacementContext = vowelReplacementMap[charM1]?.[effectiveKey]; // Check if prev char can be replaced by this key
  
              if (isVowelReplacementContext) {
                  // Handle replacements like i -> ii, e -> ai, a -> aa
                  event.preventDefault();
                  const replacementChar = vowelReplacementMap[charM1][effectiveKey];
                  replacePreviousChars(input, devanagariRef, 1, replacementChar, cursorPosition);
                  console.log(`Vowel Replacement: ${charM1} + ${effectiveKey} -> ${replacementChar}`);
                  lastEffectiveKey = effectiveKey;
                  return;
              } else if (isDependentContext && dependentVowelMap[potentialSequence]) {
                   // Apply complex dependent vowel like Rri, RrI, Lli, LlI, aE, aO
                  event.preventDefault();
                  applyDependentVowel(input, devanagariRef, dependentVowelMap[potentialSequence], cursorPosition);
                  console.log(`Applied complex matra: ${dependentVowelMap[potentialSequence]}`);
                  lastEffectiveKey = effectiveKey; // Handled sequence
                  return;
              } else if (!isDependentContext && independentVowelMap[potentialSequence]) {
                  // Insert complex independent vowel like RRi, RRI, LLi, LLI, AE, AO
                  event.preventDefault();
                  insertCharacter(input, devanagariRef, independentVowelMap[potentialSequence], cursorPosition);
                  console.log(`Inserted complex independent vowel: ${independentVowelMap[potentialSequence]}`);
                  lastEffectiveKey = effectiveKey; // Handled sequence
                  return;
              } else {
                   console.log(`Sequence ${potentialSequence} valid but context mismatch?`);
                   // Fall through to single key handling maybe? Or block? Let's block for now.
                   // event.preventDefault(); // Prevent default if sequence is valid but context wrong?
                   // return;
              }
        }
        // Add 3-char sequence checks if needed (e.g., Rri, LlI ?)
        // Example: R + r + i = Rri (ृ)
        // Need to track maybe last *two* keys, or check context more deeply
        // Let's stick to 2-char for now for simplicity matching the maps provided.
        // If a sequence like 'Rri' is hit, the combined map should handle it.
    }
  
     // --- Vowel Replacement Check (based on single key press modifying previous vowel) ---
     // This handles cases like typing 'i' after 'क' resulted in 'कि', then typing 'i' again.
     if (potentialVowelKeys.has(effectiveKey) && charM1 && vowelReplacementMap[charM1]?.[effectiveKey]) {
          event.preventDefault();
          const replacementChar = vowelReplacementMap[charM1][effectiveKey];
          replacePreviousChars(input, devanagariRef, 1, replacementChar, cursorPosition);
          console.log(`Vowel Replacement (single key): ${charM1} + ${effectiveKey} -> ${replacementChar}`);
          lastEffectiveKey = effectiveKey;
          return;
     }
  
  
    // --- Single Vowel / Single Consonant Handling ---
    const isDependentContext = charM1 === ZWNJ && charM2 === HALANT && cursorPosition >= 3;
    const devanagariDependent = dependentVowelMap[effectiveKey];
    const devanagariIndependent = independentVowelMap[effectiveKey];
    const devanagariConsonant = singleConsonantMap[effectiveKey];
  
    if (isDependentContext) {
        // Preceded by Consonant + Halant + ZWNJ
        if (devanagariDependent) {
            // Apply dependent vowel (matra)
            event.preventDefault();
            applyDependentVowel(input, devanagariRef, devanagariDependent, cursorPosition);
            lastEffectiveKey = effectiveKey;
            return;
        } else if (devanagariConsonant) {
            // Insert a new consonant after the previous one (forms conjunct implicitly)
            // We need to REMOVE the ZWNJ first, then insert Consonant+Halant+ZWNJ
            event.preventDefault();
            replacePreviousChars(input, devanagariRef, 1, devanagariConsonant + HALANT + ZWNJ, cursorPosition);
            console.log(`Forming conjunct: Removed ZWNJ, added ${devanagariConsonant}+H+ZWNJ`);
            lastEffectiveKey = effectiveKey;
            return;
        } else if (devanagariIndependent) {
             // Typing an independent vowel after C+H+ZWNJ? Unusual.
             // Treat as error? Or remove H+ZWNJ and insert Independent vowel?
             // Let's remove H+ZWNJ and insert the independent vowel.
             event.preventDefault();
             replacePreviousChars(input, devanagariRef, 2, devanagariIndependent, cursorPosition);
             console.log(`WARN: Independent vowel after C+H+ZWNJ. Replaced H+ZWNJ with ${devanagariIndependent}`);
             lastEffectiveKey = effectiveKey;
             return;
        }
    } else {
        // Not preceded by C+H+ZWNJ (e.g., start, after space, after vowel, after explicit halant)
        if (devanagariIndependent) {
            // Insert independent vowel
            event.preventDefault();
            insertCharacter(input, devanagariRef, devanagariIndependent, cursorPosition);
            lastEffectiveKey = effectiveKey;
            return;
        } else if (devanagariConsonant) {
             // Insert single consonant normally
            event.preventDefault();
            handleSingleConsonant(event, devanagariRef, devanagariConsonant); // Uses helpers internally now
            lastEffectiveKey = effectiveKey;
            return;
        } else if (devanagariDependent) {
            // Typing a matra without a preceding consonant?
            // Maybe insert the standalone matra? Or dotted circle + matra? Or ignore?
            // Let's insert dotted circle + matra for clarity.
            event.preventDefault();
            const standaloneMatra = '\u25CC' + devanagariDependent; // Dotted Circle
            insertCharacter(input, devanagariRef, standaloneMatra, cursorPosition);
            console.log(`WARN: Dependent vowel in independent context. Inserted ${standaloneMatra}`);
            lastEffectiveKey = effectiveKey;
            return;
        }
    }
  
    // --- Handle 'h' as a single consonant if it didn't form a double/triple ---
    // Refined check: If effectiveKey is 'h' and it wasn't handled above
    if (effectiveKey === 'h' && !doubleMappings?.[charM3] && !tripleMappings?.[charM5+charM3]) {
         // Use the logic from handleSingleConsonant to insert 'ह' + HALANT + ZWNJ
         event.preventDefault();
         handleSingleConsonant(event, devanagariRef, 'ह'); // 'ह' is the Devanagari for 'h'
         lastEffectiveKey = effectiveKey;
         return;
    }
  
  
    // --- Fallback ---
    console.log(`Key "${effectiveKey}" not handled by custom logic. Default behavior might occur.`);
    lastEffectiveKey = effectiveKey; // Update last key even if default occurs
    queueMicrotask(() => {
        devanagariRef.value = input.value;
        logCharactersBeforeCursor(input);
    });
  }