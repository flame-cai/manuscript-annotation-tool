// devanagariInputUtils.js
import { singleConsonantMap, handleSingleConsonant, logCharactersBeforeCursor } from './InputClusterCode'  // Import the new utility function



export function handleBackspace(event, devanagariRef) {
    const input = event.target

    // function start (takes in input)
    const cursorPosition = input.selectionStart
    const currentValue = input.value
    // console.log("currentValue:", currentValue);
    
    // Get characters at specific positions
    console.log("-------------------------");
    const characterRelativeMinus1 = currentValue[cursorPosition - 1]
    const characterRelativeMinus2 = currentValue[cursorPosition - 2]
    const characterRelativeMinus3 = currentValue[cursorPosition - 3]
    console.log({
      '-3': currentValue[cursorPosition - 3],
      '-2': currentValue[cursorPosition - 2],
      '-1': currentValue[cursorPosition - 1]
    });
    // function ends


    // Define special characters
    const halantCharacter = '\u094D' // Devanagari Halant
    const zwnj = '\u200C' // Zero-Width Non-Joiner




    if (event.key === 'q'){
      event.preventDefault()
      const newValue = 
          currentValue.slice(0, cursorPosition) + 
          '्' + '\u200C' +
          currentValue.slice(cursorPosition)
      console.log('Inserted halant')
      // Update the ref value
      devanagariRef.value = newValue

      input.value = newValue
      input.setSelectionRange(cursorPosition+2, cursorPosition+2)
      logCharactersBeforeCursor(input);
      return
    }

    if (event.key === 'Backspace') {
      // Check if we have enough characters to check
      if (cursorPosition < 3) return
    
      // Condition 1: Default backspace when ZWNJ is at relative -1 and halant is at relative -2
      if (
        characterRelativeMinus1 === zwnj && 
        characterRelativeMinus2 === halantCharacter
      ) {
        event.preventDefault()
        console.log('removing both ZWNJ and Halant')

        const newValue = 
          currentValue.slice(0, cursorPosition - 2) + 
          currentValue.slice(cursorPosition)
        console.log('Inserted ZWNJ after halant')
        // Update the ref value
        devanagariRef.value = newValue
  
        input.value = newValue
        input.setSelectionRange(cursorPosition-2, cursorPosition-2)
        logCharactersBeforeCursor(input);
        return
      }
      // Condition 2: Special ZWNJ handling when halant is two indices behind
      else if (characterRelativeMinus2 === halantCharacter) {
        event.preventDefault()
  
        const newValue = 
          currentValue.slice(0, cursorPosition - 1) + 
          '\u200C' + 
          currentValue.slice(cursorPosition)
        console.log('Inserted ZWNJ after halant')
        // Update the ref value
        devanagariRef.value = newValue
  
        input.value = newValue
        input.setSelectionRange(cursorPosition, cursorPosition)
        logCharactersBeforeCursor(input);
        return
      }
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
        return
      }
    }


    else if (event.key === 'h') {
      if (characterRelativeMinus1 === zwnj && 
        characterRelativeMinus2 === halantCharacter && 
        characterRelativeMinus3 === 'क'
        ) {
          event.preventDefault()
    
          const newValue = 
            currentValue.slice(0, cursorPosition - 3) + 
            'ख' + '्' + '\u200C' +
            currentValue.slice(cursorPosition)
          console.log('KH detected')
          // Update the ref value
          devanagariRef.value = newValue
    
          input.value = newValue
          input.setSelectionRange(cursorPosition, cursorPosition)
          logCharactersBeforeCursor(input);
          return
      }

      else if (characterRelativeMinus1 === zwnj) {
        event.preventDefault()
  
        const newValue = 
          currentValue.slice(0, cursorPosition - 1) + 
          'ह' + '्' + '\u200C' +
          currentValue.slice(cursorPosition)
        console.log('Removed ZWNJ and Inserted ह + halant + zwnj')
        // Update the ref value
        devanagariRef.value = newValue
  
        input.value = newValue
        input.setSelectionRange(cursorPosition+2, cursorPosition+2)
        logCharactersBeforeCursor(input);
        return
      }

      else  {
        event.preventDefault()
  
        const newValue = 
          currentValue.slice(0, cursorPosition) + 
          'ह' + '्' + '\u200C' +
          currentValue.slice(cursorPosition)
        console.log('Inserted ह')
        // Update the ref value
        devanagariRef.value = newValue
  
        input.value = newValue
        input.setSelectionRange(cursorPosition+3, cursorPosition+3)
        logCharactersBeforeCursor(input);
        return
      }
    }
    

    // Inside your event handler:
    else if (singleConsonantMap[event.key]) {
      logCharactersBeforeCursor(input);
      handleSingleConsonant(event, devanagariRef, event.key, singleConsonantMap[event.key]);
      return;
    }

    // else if (event.key === 'k') {
    //   if (characterRelativeMinus1 === zwnj) {
    //     event.preventDefault()
  
    //     const newValue = 
    //       currentValue.slice(0, cursorPosition - 1) + 
    //       'क' + '्' + '\u200C' +
    //       currentValue.slice(cursorPosition)
    //     console.log('Removed ZWNJ and Inserted ह + halant + zwnj')
    //     // Update the ref value
    //     devanagariRef.value = newValue
  
    //     input.value = newValue
    //     input.setSelectionRange(cursorPosition+2, cursorPosition+2)
    //     logCharactersBeforeCursor(input);
    //     return
    //   }

    //   else  {
    //     event.preventDefault()
  
    //     const newValue = 
    //       currentValue.slice(0, cursorPosition) + 
    //       'क' + '्' + '\u200C' +
    //       currentValue.slice(cursorPosition)
    //     console.log('Inserted ह')
    //     // Update the ref value
    //     devanagariRef.value = newValue
  
    //     input.value = newValue
    //     input.setSelectionRange(cursorPosition+3, cursorPosition+3)
    //     logCharactersBeforeCursor(input);
    //     return
    //   }
    // }
  }