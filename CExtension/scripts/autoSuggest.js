// Function to replace {f with {FirstName} at cursor position
function autocorrectFirstName() {
  // Fetch variables from sessionStorage
  let variables;
  try {
    variables = JSON.parse(sessionStorage.getItem("variables"));
    if (!variables) {
      console.error("No variables found in sessionStorage.");
      return;
    }
  } catch (error) {
    console.error("Failed to parse variables from sessionStorage:", error);
    return;
  }

  const Words = Object.keys(variables);
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  const cursorPosition = range.startOffset;

  // Check if the cursor is in a text node
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;

    // Check if the 2 characters before the cursor match a shortcut
    if (cursorPosition >= 2) {
      const charsBeforeCursor = text.substring(
        cursorPosition - 2,
        cursorPosition
      );

      // Iterate through the words to find a match
      for (const word of Words) {
        if (charsBeforeCursor === `{${word[0]}`) {
          // Replace {f with {word}
          const replacement = `{${word}}`;
          const newText =
            text.substring(0, cursorPosition - 2) +
            replacement +
            text.substring(cursorPosition);

          // Update the text content
          node.textContent = newText;

          // Move the cursor to the end of the replacement
          const newCursorPosition = cursorPosition - 2 + replacement.length;
          const newRange = document.createRange();
          newRange.setStart(node, newCursorPosition);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);

          // Exit the loop after the first match
          break;
        }
      }
    }
  }
}

// Listen for input events (typing, pasting, etc.)
document.addEventListener("input", autocorrectFirstName);
