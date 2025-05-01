// Get the selected text from local storage
chrome.storage.local.get('selectedText', function(result) {
    const selectedText = result.selectedText;

    if (selectedText) {
        document.getElementById('selectedText').textContent = selectedText;
        document.getElementById('saveCard').addEventListener('click', function() {
            saveFlashcard(selectedText);
        });
    }
});

function saveFlashcard(text) {
    // Save the flashcard (send it to your backend or store locally)
    console.log("Saving flashcard with text: ", text);
    // Here you can send the text to your backend or use local storage
}


// document.getElementById('saveCard').addEventListener('click', async () => {
//     const front = document.getElementById('front').value;
//     const back = document.getElementById('back').value;

//     const response = await fetch('http://localhost:5000/flashcard', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ front, back })
//     });
//     const data = await response.json();
//     alert('Flashcard Saved: ' + data.front);
// });
