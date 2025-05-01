
let flashcardButton = null;

function removeFlashcardButton() {
    if (flashcardButton && flashcardButton.parentNode) {
        console.log("Removing flashcard button.");
        flashcardButton.remove();
        flashcardButton = null; 
    }
}

document.addEventListener('selectionchange', function(event) {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText) {

        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            removeFlashcardButton(); 
            return;
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (!flashcardButton) {
            console.log("Creating flashcard button for selected text.");
            flashcardButton = document.createElement('button');
            flashcardButton.textContent = 'Save as Flashcard';
            flashcardButton.style.position = 'absolute';
            flashcardButton.style.zIndex = '2147483647'; 
            flashcardButton.style.padding = '5px 10px';
            flashcardButton.style.fontSize = '12px';
            flashcardButton.style.border = 'none';
            flashcardButton.style.borderRadius = '5px';
            flashcardButton.style.backgroundColor = 'red';
            flashcardButton.style.color = 'white';
            flashcardButton.style.cursor = 'pointer';
            flashcardButton.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.3)'; 
            flashcardButton.classList.add('flashcard-button'); 

            flashcardButton.addEventListener('click', function(clickEvent) {
                clickEvent.stopPropagation();

                console.log('Button clicked. Selected Text: ', selectedText);

                openFlashcardWindow(selectedText); 

                window.getSelection().removeAllRanges();
                removeFlashcardButton();
            });

            document.body.appendChild(flashcardButton);
        }

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        flashcardButton.style.left = `${rect.left + scrollX}px`;
        flashcardButton.style.top = `${rect.bottom + scrollY + 5}px`; 

    } else {
        removeFlashcardButton();
    }
});

document.addEventListener('mousedown', function(event) {
    if (flashcardButton && !flashcardButton.contains(event.target)) {
        console.log("Clicked outside the button, removing selection and button.");
        if (window.getSelection().toString().trim().length > 0) {
             window.getSelection().removeAllRanges(); 
        }
        removeFlashcardButton(); 
    }
}, true);


function openFlashcardWindow(selectedText) {
    console.log("Opening flashcard window for text:", selectedText);
    try {
        sessionStorage.removeItem('flashcardSelectedText');
        sessionStorage.setItem('flashcardSelectedText', selectedText || '');
        console.log("Stored selectedText in sessionStorage.");
    } catch (e) {
        console.error("Failed to set sessionStorage:", e);
        alert("Could not store selected text for the new window.");
    }

    const newWindow = window.open("", "Flashcard Window", "width=400,height=350,top=100,left=100,resizable=yes,scrollbars=yes");
    if (!newWindow) {
        alert("Failed to open new window. Check popup blockers.");
        return;
    }
    console.log("New window opened:", newWindow);

    let scriptURL;
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
         scriptURL = chrome.runtime.getURL('src/create-flashcard-logic.js');
         console.log("Script URL for new window:", scriptURL);
    } else {
        console.error("chrome.runtime.getURL is not available in this context. Cannot load script.");
        newWindow.document.write("<body>Error: Could not load necessary script.</body>");
        newWindow.document.close();
        return;
    }


    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Create Flashcard</title>
                <style>
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
                <input type="text" id="front" value="" placeholder="Enter the front of the flashcard">
                <label for="back">Back:</label>
                <input type="text" id="back" placeholder="Enter the back of the flashcard">
                <label for="hint">Hint (Optional):</label>
                <input type="text" id="hint" placeholder="Enter an optional hint">
                <br><br>
                <button id="save">Save</button>
                <button id="clear">Clear</button>
                <script src="${scriptURL}" defer></script>
            </body>
        </html>
    `);
    newWindow.document.close();
    console.log("Finished writing content to new window.");
}