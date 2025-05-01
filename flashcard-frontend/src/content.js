document.addEventListener('selectionchange', function(event) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect(); 
        
        const existingButtons = document.querySelectorAll('.flashcard-button');
        existingButtons.forEach(button => button.remove());

        const button = document.createElement('button');
        button.textContent = 'Save as Flashcard';
        button.style.position = 'absolute';
        button.style.left = `${rect.left + window.scrollX}px`;  
        button.style.top = `${rect.bottom + window.scrollY + 5}px`;  
        button.style.zIndex = '99999999'; 
        button.style.padding = '5px 10px';
        button.style.fontSize = '12px';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.backgroundColor = 'red';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        
        button.classList.add('flashcard-button');

        console.log(button);
        document.body.appendChild(button);

        button.addEventListener('click', function() {
            console.log('Selected Text: ', selectedText);
            chrome.storage.local.set({ selectedText: selectedText });

            window.getSelection().removeAllRanges();

            button.remove();    

            openFlashcardWindow(selectedText);

        });
    }
});


// Function to open a new window for flashcard creation
// Function to open a new window for flashcard creation
function openFlashcardWindow(selectedText) {
    console.log("Opening flashcard window for text:", selectedText); // Log input

    // --- Pass data via sessionStorage ---
    // Use sessionStorage because it's isolated per session and cleared when tab/window closes
    try {
        // Clear any previous value first in case of errors
        sessionStorage.removeItem('flashcardSelectedText');
        sessionStorage.setItem('flashcardSelectedText', selectedText || ''); // Store the text, handle null/undefined
        console.log("Stored selectedText in sessionStorage.");
    } catch (e) {
        console.error("Failed to set sessionStorage:", e);
        // Handle potential storage errors (e.g., disabled, quota exceeded)
        alert("Could not store selected text for the new window. Please copy/paste manually.");
        // Optionally, don't open the window or open it without pre-filled text
        // return;
    }


    // --- Open the new window ---
    const newWindow = window.open("", "Flashcard Window", "width=400,height=350,top=100,left=100,resizable=yes,scrollbars=yes"); // Added resizable/scrollbars

    if (!newWindow) {
        alert("Failed to open new window. Please check your browser's popup blocker settings.");
        return;
    }
    console.log("New window opened:", newWindow);

    // --- Write HTML structure WITHOUT inline script ---
    // Get the correct URL for the script within the extension package
    // IMPORTANT: Adjust the path 'src/popup/create-flashcard-logic.js' if your file is elsewhere!
    const scriptURL = chrome.runtime.getURL('src/create-flashcard-logic.js');
    console.log("Script URL for new window:", scriptURL);

    newWindow.document.write(`
        <!DOCTYPE html> <!-- Add doctype -->
        <html>
            <head>
                <meta charset="UTF-8"> <!-- Add charset -->
                <title>Create Flashcard</title>
                <style>
                    /* Use the same styles as before */
                    body { font-family: Arial, sans-serif; padding: 20px; min-width: 300px; }
                    label { display: block; margin-bottom: 3px; font-weight: bold; }
                    input { width: 95%; margin-bottom: 10px; padding: 8px; border-radius: 3px; border: 1px solid #ddd; box-sizing: border-box; }
                    button { padding: 8px 15px; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px; }
                    #save { background-color: green; color: white; }
                    #clear { background-color: red; color: white; }
                </style>
            </head>
            <body>
                <h2>Create Flashcard</h2>
                <label for="front">Front:</label>
                <!-- The value will now be set by the external script after reading sessionStorage -->
                <input type="text" id="front" value="" placeholder="Enter the front of the flashcard">
                <label for="back">Back:</label>
                <input type="text" id="back" placeholder="Enter the back of the flashcard">
                <label for="hint">Hint (Optional):</label>
                <input type="text" id="hint" placeholder="Enter an optional hint">
                <br><br>
                <button id="save">Save</button>
                <button id="clear">Clear</button>

                <!-- Load the script externally using its extension URL -->
                <script src="${scriptURL}" defer></script>

            </body>
        </html>
    `);

    // Close the document stream (important after document.write)
    newWindow.document.close();
    console.log("Finished writing content to new window.");
}