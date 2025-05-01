document.addEventListener('DOMContentLoaded', () => {
    const dayCounterEl = document.getElementById('day-counter');
    const flashcardAreaEl = document.getElementById('flashcard-area');
    const startFinishAreaEl = document.getElementById('start-finish-area');
    const cardFrontEl = document.getElementById('card-front');
    const cardBackEl = document.getElementById('card-back');
    const revealBtn = document.getElementById('reveal-btn');
    const feedbackControlsEl = document.getElementById('feedback-controls');
    const correctBtn = document.getElementById('correct-btn');
    const incorrectBtn = document.getElementById('incorrect-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const messageEl = document.getElementById('message');
    const loadingIndicatorEl = document.getElementById('loading-indicator');

    
    let currentDay = 0; 
    let allCards = [];
    let cardsForToday = [];
    let currentCardIndex = 0;
    let currentCard = null; 
    let isBackVisible = false;
    let isLoading = false;

    const API_BASE_URL = 'http://localhost:3000'; 


    function updateDayCounter() {
        dayCounterEl.textContent = `Day ${currentDay}`;
    }

    function showLoading(show) {
        isLoading = show;
        loadingIndicatorEl.classList.toggle('hidden', !show);
        revealBtn.disabled = show;
        correctBtn.disabled = show;
        incorrectBtn.disabled = show;
        nextDayBtn.disabled = show;
    }

    async function fetchAllCards() {
        showLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/flashcards`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allCards = await response.json();
            console.log("Fetched all cards:", allCards);
            cardsForToday = [...allCards];
            cardsForToday.sort(() => Math.random() - 0.5);

        } catch (error) {
            console.error("Failed to fetch flashcards:", error);
            messageEl.textContent = "Error fetching cards. Is the backend running?";
            allCards = [];
            cardsForToday = [];
            showEndOfDayScreen();
        } finally {
            showLoading(false);
        }
    }

    function displayCard(index) {
        if (index >= cardsForToday.length) {
            showEndOfDayScreen();
            return;
        }

        currentCardIndex = index;
        currentCard = cardsForToday[currentCardIndex];
        isBackVisible = false;

        console.log(`Displaying card ${index + 1}/${cardsForToday.length}:`, currentCard);

        cardFrontEl.textContent = currentCard.front;
        cardBackEl.textContent = currentCard.back || '(No back text)';
        cardBackEl.classList.add('hidden');

        revealBtn.classList.remove('hidden');
        feedbackControlsEl.classList.add('hidden');

        flashcardAreaEl.classList.remove('hidden');
        startFinishAreaEl.classList.add('hidden');
    }

    function revealAnswer() {
        if (!currentCard || isLoading) return;

        console.log("Revealing answer");
        isBackVisible = true;
        cardBackEl.classList.remove('hidden');
        revealBtn.classList.add('hidden');
        feedbackControlsEl.classList.remove('hidden');
    }

    async function handleFeedback(wasCorrect) {
        if (!currentCard || isLoading) return;

        console.log(`Card feedback: ${wasCorrect ? 'Correct' : 'Incorrect'}`);
        const newDifficulty = wasCorrect ? 'easy' : 'hard';
        try {
            await fetch(`${API_BASE_URL}/flashcards/${currentCard.id}/difficulty`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty: newDifficulty })
            });
            console.log(`Updated difficulty for card ${currentCard.id} to ${newDifficulty}`);
        } catch (error) {
            console.error(`Failed to update difficulty for card ${currentCard.id}:`, error);
        }
        displayCard(currentCardIndex + 1);
    }

    function showEndOfDayScreen() {
        console.log("End of day/practice session reached.");
        flashcardAreaEl.classList.add('hidden');
        startFinishAreaEl.classList.remove('hidden');
        messageEl.textContent = `Finished Day ${currentDay}. Ready for the next?`;
        nextDayBtn.textContent = "Go to Next Day";
    }

    async function startNextDay() {
        if (isLoading) return;

        currentDay++;
        console.log(`Starting Day ${currentDay}`);
        updateDayCounter();
        messageEl.textContent = `Loading cards for Day ${currentDay}...`;
        startFinishAreaEl.classList.remove('hidden');
        flashcardAreaEl.classList.add('hidden');

        await fetchAllCards(); 

        if (cardsForToday.length > 0) {
            displayCard(0); 
        } else {
            messageEl.textContent = `No cards found to practice for Day ${currentDay}.`;
            showEndOfDayScreen(); 
        }
    }

    
    nextDayBtn.addEventListener('click', startNextDay);
    revealBtn.addEventListener('click', revealAnswer);
    correctBtn.addEventListener('click', () => handleFeedback(true));
    incorrectBtn.addEventListener('click', () => handleFeedback(false));

    
    function initializeApp() {
        console.log("Initializing Flashcard Learner");
        updateDayCounter();
        messageEl.textContent = `Ready to start Day ${currentDay + 1}?`;
        nextDayBtn.textContent = "Start Practice"; 
        showEndOfDayScreen(); 
    }

    initializeApp();

}); 