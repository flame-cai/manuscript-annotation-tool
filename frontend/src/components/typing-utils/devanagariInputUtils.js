// devanagariInputUtils.js
import {
  singleConsonantMap,
  doubleCharMap,
  tripleCharMap,
  handleSingleConsonant, // Use the modified single handler
  insertConsonantSequence, // Use helper
  replaceConsonantSequence, // Use helper
  logCharactersBeforeCursor,
  HALANT,
  ZWNJ
} from './InputClusterCode'

export function handleInput(event, devanagariRef) {
  // Ignore modifier keys Shift, Ctrl, Alt, Meta
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
      // Allow Shift + Key for capital letters used in mappings (like 'S', 'T', 'D')
      if (event.shiftKey && event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
           // Proceed, but use event.key which will be uppercase
      } else {
          return; // Ignore other modifier combinations
      }
  }
  // Ignore non-printing keys except Backspace and functional keys like Enter, Tab etc.
  // We only care about character input keys and Backspace for this logic.
  // Check if key is a single character or Backspace
  if (event.key.length > 1 && event.key !== 'Backspace') {
    // Allow specific function keys if needed, otherwise ignore keys like ArrowLeft, etc.
    // For now, we primarily focus on character input.
    return;
  }


  // --- Log current state ---
  const input = event.target;
  const cursorPosition = input.selectionStart; // Get initial position
  const currentValue = input.value;       // Get initial value
  const key = event.key;

  console.log("-------------------------");
  console.log(`Key pressed: ${key} (at pos ${cursorPosition})`);
  console.log("State BEFORE processing:");
  logCharactersBeforeCursor(input); // <<< LOGGING POINT 1 (Before)

  // --- Get Context Characters (handle potential undefined) ---
  const charM1 = currentValue[cursorPosition - 1]; // Character immediately before cursor
  const charM2 = currentValue[cursorPosition - 2];
  const charM3 = currentValue[cursorPosition - 3]; // Base consonant for double check
  const charM4 = currentValue[cursorPosition - 4];
  const charM5 = currentValue[cursorPosition - 5]; // Base consonant 1 for triple check

  // --- Explicit Halant ('q' key) ---
  // Keep this unchanged as requested
  if (key === 'q') {
      event.preventDefault();
      const newValue =
          currentValue.slice(0, cursorPosition) +
          HALANT + ZWNJ +
          currentValue.slice(cursorPosition);
      console.log('Inserted explicit halant + ZWNJ');
      devanagariRef.value = newValue;
      input.value = newValue;
      input.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
      logCharactersBeforeCursor(input);
      return;
  }

  // --- Backspace Handling ---
  // Keep this unchanged as requested
  if (key === 'Backspace') {
      // Check if we have enough characters to check context
      // The original logic checked cursorPosition < 3, let's respect that,
      // although backspace itself works even at position 1.
      // The specific ZWNJ/Halant checks need at least 2 preceding chars.

      // Condition 1: Default backspace when ZWNJ is at relative -1 and halant is at relative -2
      if (charM1 === ZWNJ && charM2 === HALANT) {
          event.preventDefault();
          console.log('Backspace: removing Base + Halant + ZWNJ'); // Logged context is often Base+Halant+ZWNJ

          const newValue =
              currentValue.slice(0, cursorPosition - 3) + // Remove 3 chars: Base, Halant, ZWNJ
              currentValue.slice(cursorPosition);

          devanagariRef.value = newValue;
          input.value = newValue;
          input.setSelectionRange(cursorPosition - 3, cursorPosition - 3);
          logCharactersBeforeCursor(input);
          return;
      }
      // Condition 2: Special ZWNJ handling when halant is two indices behind
      // This condition seems less common in standard typing IME, often means deleting just the last char.
      // The original code inserted ZWNJ here, which seems counter-intuitive for backspace.
      // Let's stick to the original code's *behavior* if it was intentional.
      else if (charM2 === HALANT && cursorPosition >= 2) { // Ensure we have at least 2 chars before cursor
           event.preventDefault();

           const newValue =
             currentValue.slice(0, cursorPosition - 1) + // Remove charM1
             ZWNJ +                                      // Insert ZWNJ
             currentValue.slice(cursorPosition);
           console.log('Backspace: Removed last char, Inserted ZWNJ after halant (original logic)');

           devanagariRef.value = newValue;
           input.value = newValue;
           // Cursor should be after the inserted ZWNJ. Original cursor was `cursorPosition`. We removed 1 char, inserted 1 char.
           // So the length change is 0, cursor remains `cursorPosition`.
           input.setSelectionRange(cursorPosition, cursorPosition);
           logCharactersBeforeCursor(input);
           return;
      }
      // Condition 3: Default backspace behavior if no special context matches
      else {
          // No preventDefault() here, let the browser handle default backspace
          console.log('Backspace: Default behavior');
           // We still need to update the ref AFTER the browser handles it.
           // Use a microtask to update the ref after the default action.
           queueMicrotask(() => {
               devanagariRef.value = input.value;
               logCharactersBeforeCursor(input);
           });
          return;
      }
       // Note: The original code had preventDefault() even in the else block.
       // If that was truly required, uncomment the block below and comment out the above 'else'.
       /*
       else {
           event.preventDefault()
           const newValue =
             currentValue.slice(0, cursorPosition - 1) +
             currentValue.slice(cursorPosition)
           // Update the ref value
           devanagariRef.value = newValue

           input.value = newValue
           input.setSelectionRange(cursorPosition-1, cursorPosition-1)
           logCharactersBeforeCursor(input);
           console.log('Backspace: Default behavior (manual implementation)');
           return
       }
       */
  }


  // --- Check for Triple Character Sequence Completion ---
  const tripleMappings = tripleCharMap[key];
  if (tripleMappings && cursorPosition >= 5) { // Need at least 5 chars for Base1+H+Base2+H+ZWNJ
      // Check context: Base1 (charM5) + Halant (charM4) + Base2 (charM3) + Halant (charM2) + ZWNJ (charM1)
      if (charM1 === ZWNJ && charM2 === HALANT && charM4 === HALANT) {
          const precedingSequence = charM5 + charM3; // e.g., "दन" or "गन"
          if (tripleMappings[precedingSequence]) {
              const mapping = tripleMappings[precedingSequence];
              event.preventDefault();
              replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
              return; // Handled as triple
          }
      }
       // Check context for shr: Base (charM3) + Halant (charM2) + ZWNJ (charM1) -> Needs preceding base 'श'
       if (key === 'r' && charM1 === ZWNJ && charM2 === HALANT && charM3 === 'श' && tripleMappings['श']) {
            const mapping = tripleMappings['श'];
            event.preventDefault();
            replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
            return; // Handled shr
       }
  }

  // --- Check for Double Character Sequence Completion ---
  const doubleMappings = doubleCharMap[key];
  // Need at least 3 chars for Base + Halant + ZWNJ context
  if (doubleMappings && cursorPosition >= 3) {
      // Check context: Base consonant (charM3) + Halant (charM2) + ZWNJ (charM1)
      if (charM1 === ZWNJ && charM2 === HALANT) {
          const precedingBase = charM3;
          if (doubleMappings[precedingBase]) {
              const mapping = doubleMappings[precedingBase];
              event.preventDefault();
              replaceConsonantSequence(input, devanagariRef, mapping.resultChar, cursorPosition, mapping.remove);
              return; // Handled as double
          }
      }
  }

  // --- Handle Single Consonants ---
  if (singleConsonantMap[key]) {
      event.preventDefault(); // Prevent default insertion of the Roman char
      handleSingleConsonant(event, devanagariRef, singleConsonantMap[key]);
      return; // Handled as single
  }

  // --- Handle 'h' as a single consonant if it didn't form a double/triple ---
  // This covers the case where 'h' is typed initially or after a vowel/space.
  if (key === 'h' && !doubleMappings && !tripleMappings) { // Check if 'h' wasn't handled above
      // Or more accurately, check if the context didn't match for double/triple
      // Let's refine: if 'h' is pressed, and it didn't match any double/triple rule above:
      if (key === 'h') {
           // Check if the code reached here, meaning no preceding consonant context matched double/triple map.
           // Use the logic from handleSingleConsonant to insert 'ह' + HALANT + ZWNJ
           event.preventDefault();
           handleSingleConsonant(event, devanagariRef, 'ह'); // 'ह' is the Devanagari for 'h'
           return;
      }
  }


  // --- Fallback ---
  // If the key is not handled by any rule (e.g., vowels, symbols, other keys),
  // let the default action proceed (or add specific handling for vowels etc. later).
  console.log(`Key "${key}" not handled by custom logic. Default behavior might occur.`);
  // To allow default behavior for unmapped keys (like numbers, symbols, potentially vowels):
  // Do nothing here, let the browser insert the character.
  // But we need to update the ref value if default happens.
  queueMicrotask(() => {
      devanagariRef.value = input.value;
       logCharactersBeforeCursor(input); // Log state after potential default insertion
  });

}