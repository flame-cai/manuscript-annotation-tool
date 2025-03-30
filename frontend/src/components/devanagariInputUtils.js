// devanagariInputUtils.js
export function handleBackspace(event, devanagariRef) {
    const input = event.target
    const cursorPosition = input.selectionStart
    const currentValue = input.value
    console.log("currentValue:", currentValue);

    // Get characters at specific positions
    const characterRelativeMinus1 = currentValue[cursorPosition - 1]
    const characterRelativeMinus2 = currentValue[cursorPosition - 2]
    const characterRelativeMinus3 = currentValue[cursorPosition - 3]
    console.log({
      characterRelativeMinus1: currentValue[cursorPosition - 1],
      characterRelativeMinus2: currentValue[cursorPosition - 2],
      characterRelativeMinus3: currentValue[cursorPosition - 3]
    });

    // Define special characters
    const halantCharacter = '\u094D' // Devanagari Halant
    const zwnj = '\u200C' // Zero-Width Non-Joiner

    if (event.key === 'Backspace') {
      // Check if we have enough characters to check
      if (cursorPosition < 3) return
    
      // Condition 1: Default backspace when ZWNJ is at relative -1 and halant is at relative -2
      if (
        characterRelativeMinus1 === zwnj && 
        characterRelativeMinus2 === halantCharacter
      ) {
        // Do nothing, allow default backspace behavior
        console.log('Default Backspace (ZWNJ after Halant)')
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
          input.setSelectionRange(cursorPosition-2, cursorPosition-2)
    
          return
      }

      else if (characterRelativeMinus1 === zwnj && 
        characterRelativeMinus2 === halantCharacter) {
        event.preventDefault()
  
        const newValue = 
          currentValue.slice(0, cursorPosition - 1) + 
          'ह' + '्' + '\u200C' +
          currentValue.slice(cursorPosition)
        console.log('Removed ZWNJ and Inserted ह after halant')
        // Update the ref value
        devanagariRef.value = newValue
  
        input.value = newValue
        input.setSelectionRange(cursorPosition, cursorPosition)
  
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
        input.setSelectionRange(cursorPosition+1, cursorPosition+1)
  
        return
      }
    }
  }