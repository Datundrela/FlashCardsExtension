document.getElementById('saveCard').addEventListener('click', async () => {
    const front = document.getElementById('front').value;
    const back = document.getElementById('back').value;

    const response = await fetch('http://localhost:5000/flashcard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ front, back })
    });
    const data = await response.json();
    alert('Flashcard Saved: ' + data.front);
});
