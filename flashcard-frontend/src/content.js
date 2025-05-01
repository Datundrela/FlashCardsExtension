document.addEventListener('selectionchange', function(event) {
    // Get the selected text
    const selectedText = window.getSelection().toString().trim();
    console.log("SADAGHGA MUTELIAAAAAAAAAAAAAAAAAAAAA")

    // If there is selected text, show the button
    if (selectedText) {
        console.log("DEAME YLEAAAA")
        
        // Get the current selection and position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect(); // Get the position of the selection
        
        // Remove any existing buttons
        const existingButtons = document.querySelectorAll('.flashcard-button');
        existingButtons.forEach(button => button.remove());

        // Create the button
        const button = document.createElement('button');
        button.textContent = 'Save as Flashcard';
        button.style.position = 'absolute';
        button.style.left = `${rect.left + window.scrollX}px`;  // Position relative to page
        button.style.top = `${rect.bottom + window.scrollY + 5}px`;  // 5px below the selected text
        button.style.zIndex = '99999999';  // Make sure it's on top of other elements
        button.style.padding = '5px 10px';
        button.style.fontSize = '12px';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.backgroundColor = 'red';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        
        // Add a class to identify the button for removal later
        button.classList.add('flashcard-button');

        // Append the button to the body
        console.log(button);
        document.body.appendChild(button);

        // Button click event listener
        button.addEventListener('click', function() {
            console.log('Selected Text: ', selectedText);
            chrome.storage.local.set({ selectedText: selectedText });

            // Deselect the text
            window.getSelection().removeAllRanges();

            // Remove the button after clicking
            button.remove();
        });
    }
});
