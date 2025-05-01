console.log("Create Flashcard Window script started.");

// Get elements within THIS window's document
const saveButton = document.getElementById('save');
const clearButton = document.getElementById('clear');
const frontInput = document.getElementById('front');
const backInput = document.getElementById('back');
const hintInput = document.getElementById('hint');

// Log element selection result within the new window
console.log("Elements selected in new window:", { saveButton, clearButton, frontInput, backInput, hintInput });

// --- Retrieve selectedText passed via sessionStorage ---
const selectedText = sessionStorage.getItem('flashcardSelectedText') || '';

// ***** THIS IS THE CHANGED SECTION *****
// Now target the 'backInput' instead of 'frontInput'
if (backInput) { // Check if the Back input exists
    backInput.value = selectedText; // Set the Back input's value
    console.log("Retrieved selectedText from sessionStorage and set BACK input:", selectedText);
} else {
    console.error("Back input not found when trying to set selectedText."); // Updated error message
}
// ***** END OF CHANGED SECTION *****

// Optional: Clean up session storage after reading
// sessionStorage.removeItem('flashcardSelectedText');


// --- Setup Save Button Listener (Remains the same) ---
if (saveButton && frontInput && backInput && hintInput) {
    saveButton.addEventListener('click', async function() {
        // ... (rest of the save logic is unchanged) ...
        console.log("Save button clicked in new window!");

        const front = frontInput.value.trim();
        const back = backInput.value.trim();
        const hint = hintInput.value.trim();

        console.log("Input values from new window:", { front, back, hint });

        if (!front || !back) {
            console.log("Validation failed: Front or Back is empty.");
            alert('Please fill in both the front and back of the flashcard.');
            return;
        }
        console.log("Validation passed.");

        const flashcardData = {
            front,
            back,
            ...(hint && { hint }),
        };

        console.log('Attempting to send data from new window:', flashcardData);

        try {
            const response = await fetch('http://localhost:3000/flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(flashcardData),
            });

            console.log('Fetch response received in new window. Status:', response.status, 'Ok:', response.ok);

            if (response.ok) {
                console.log('Response is OK (2xx status). Trying to parse JSON...');
                try {
                    const data = await response.json();
                    console.log('Flashcard created successfully (from response JSON):', data);
                    alert('Flashcard saved successfully!');
                    window.close();
                } catch (jsonError) {
                    console.warn('Response was OK, but body parsing failed:', jsonError);
                    alert('Flashcard saved (status OK), but response format was unexpected.');
                    window.close();
                }
            } else {
                console.error(`Response not OK. Status: ${response.status}`);
                let errorMessage = `Error saving flashcard. Status: ${response.status}`;
                try {
                    const errorText = await response.text();
                    console.error('Error response body:', errorText);
                    try {
                        const parsedError = JSON.parse(errorText);
                        errorMessage = parsedError.message || parsedError.error || errorText;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                } catch (readError) {
                    console.error('Could not read error response body:', readError);
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Fetch request failed entirely from new window:', error);
            alert(`Failed to connect or send request. Is the server running and CORS configured?\nError: ${error.message}`);
        }

    });
    console.log("Save button event listener attached successfully in new window.");

} else {
    console.error("Could not attach Save button listener in new window - one or more required elements not found!");
}

// --- Setup Clear Button Listener (Remains the same) ---
if (clearButton && frontInput && backInput && hintInput) {
    clearButton.addEventListener('click', function() {
        console.log("Clear button clicked in new window!");
        frontInput.value = '';
        backInput.value = '';
        hintInput.value = '';
    });
    console.log("Clear button event listener attached successfully in new window.");
} else {
    console.error("Could not attach Clear button listener in new window - one or more required elements not found!");
}

console.log("Create Flashcard Window script finished setup.");