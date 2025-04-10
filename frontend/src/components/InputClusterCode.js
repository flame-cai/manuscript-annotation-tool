
export function logCharactersBeforeCursor(input) {
  const cursorPosition = input.selectionStart;
  const currentValue = input.value;
  console.log({
    '-3': currentValue[cursorPosition - 3],
    '-2': currentValue[cursorPosition - 2],
    '-1': currentValue[cursorPosition - 1]
  });
    return
}

// const keyClusters = {
//   // Multi-character consonants (3+ characters)
//   threeCharPlus: ['ksh', 'chh', 'Qkh', 'QDh', 'shr', 'kSh', 'dny', 'gny'],
  
//   // Two-character consonants
//   twoChar: ['kh', 'gh', 'ch', 'jh', 'Th', 'th', 'Dh', 'dh', 'ph', 'bh', 'sh', 'kS'],
  
//   // Single consonants
//   singleChar: ['k', 'g', 'j', 'T', 't', 'D', 'd', 'N', 'n', 'p', 'b', 'm', 'y', 'r', 'l', 'v', 'V', 'S', 's', 'h', 'L', 'Y'],
  
//   // Special Q-prefixed consonants
//   qPrefixed: ['Qk', 'Qg', 'Qj', 'QP', 'QD', 'Qy', 'Qn', 'Qr', 'QL', 'Qv'],
  
//   // Z-prefixed consonants
//   zPrefixed: ['Zg', 'Zj', 'ZD', 'Zb', 'ZK'],
  
//   // Special characters
//   special: ['DDA', 'ZHA', 'JYA']
// };

// // Full mapping from Roman to Devanagari
// const romanToDevanagari = {
//   // Consonants
//   'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ch': 'च', 'chh': 'छ', 
//   'j': 'ज', 'jh': 'झ', 'T': 'ट', 't': 'त', 'Th': 'ठ', 'th': 'थ', 
//   'D': 'ड', 'd': 'द', 'Dh': 'ढ', 'dh': 'ध', 'N': 'ण', 'n': 'न', 
//   'p': 'प', 'ph': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म', 'y': 'य', 
//   'Y': 'ञ', 'r': 'र', 'l': 'ल', 'v': 'व', 'V': 'ङ', 'sh': 'श', 
//   'S': 'ष', 's': 'स', 'h': 'ह', 'L': 'ळ', 'kS': 'क्ष', 'kSh': 'क्ष', 
//   'ksh': 'क्ष', 'dny': 'ज्ञ', 'gny': 'ज्ञ', 'shr': 'श्र', 'Qk': 'क़', 
//   'Qkh': 'ख़', 'Qg': 'ग़', 'Qj': 'ज़', 'QP': 'फ़', 'QD': 'ड़', 'Qy': 'य़', 
//   'Qn': 'ऩ', 'Qr': 'ऱ', 'QL': 'ऴ', 'QDh': 'ढ़', 'Qv': 'व़', 'Zg': '\u097B', 
//   'Zj': '\u097C', 'ZD': '\u097E', 'Zb': '\u097F', 'DDA': '\u0978', 
//   'ZHA': '\u0979', 'JYA': '\u097A', 'ZK': '\u097D',
  
//   // Other characters can be added as needed from your original mappings
//   'q': '्'
// };

export const singleConsonantMap = {
  'k': 'क',
  'g': 'ग',
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
  'V': 'ङ',
  'S': 'ष',
  's': 'स',
  'h': 'ह',
  'L': 'ळ',
  'Y': 'ञ'
  // Add any other single consonants here
};

export function handleSingleConsonant(event, devanagariRef, consonant, devanagariChar) {
  const input = event.target;
  const cursorPosition = input.selectionStart;
  const currentValue = input.value;
  const characterRelativeMinus1 = currentValue[cursorPosition - 1];
  const zwnj = '\u200C'; // Zero-Width Non-Joiner
  
  event.preventDefault();
  
  let newValue;
  let newCursorPosition;
  
  if (characterRelativeMinus1 === zwnj) {
    // If ZWNJ is before cursor, replace it with consonant + halant + ZWNJ
    newValue = 
      currentValue.slice(0, cursorPosition - 1) + 
      devanagariChar + '्' + zwnj +
      currentValue.slice(cursorPosition);
    
    console.log(`Removed ZWNJ and Inserted ${devanagariChar} + halant + zwnj`);
    newCursorPosition = cursorPosition + 2;
  } else {
    // Otherwise, just insert consonant + halant + ZWNJ
    newValue = 
      currentValue.slice(0, cursorPosition) + 
      devanagariChar + '्' + zwnj +
      currentValue.slice(cursorPosition);
    
    console.log(`Inserted ${devanagariChar}`);
    newCursorPosition = cursorPosition + 3;
  }
  
  // Update the ref value
  devanagariRef.value = newValue;
  
  input.value = newValue;
  input.setSelectionRange(newCursorPosition, newCursorPosition);
  logCharactersBeforeCursor(input);
  return;
}