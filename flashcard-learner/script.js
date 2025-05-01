// script.js
import { initializeGestureRecognizer, startGestureRecognition, stopGestureRecognition } from './gesture-recognizer.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dayCounterEl = document.getElementById('day-counter');
    const flashcardAreaEl = document.getElementById('flashcard-area');
    const startFinishAreaEl = document.getElementById('start-finish-area');
    const cardFrontEl = document.getElementById('card-front');
    const cardBackEl = document.getElementById('card-back');
    const revealBtn = document.getElementById('reveal-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const messageEl = document.getElementById('message');
    const loadingIndicatorEl = document.getElementById('loading-indicator');
    const gestureAreaEl = document.getElementById('gesture-area');
    const gestureStatusEl = document.getElementById('gesture-status'); // Get status P element
    const controlsEl = document.getElementById('controls'); // Get controls container
    const enableWebcamBtn = document.getElementById('enable-webcam-button'); // Button in practice controls
    const disableWebcamBtn = document.getElementById('disable-webcam-button'); // Button in practice controls
    const startEnableWebcamBtn = document.getElementById('start-enable-webcam-button'); // Button on start screen

    // --- State Variables ---
    let currentDay = 0;
    let allCards = [];
    let cardsForToday = [];
    let currentCardIndex = 0;
    let currentCard = null;
    let isBackVisible = false;
    let isLoading = false;
    let isGestureControlActive = false; // Master state for gesture mode

    // --- Constants ---
    const API_BASE_URL = 'http://localhost:3000';

    // --- Core Functions ---

    function updateDayCounter() { /* ... (no change) ... */ }

    function showLoading(show) {
        isLoading = show;
        loadingIndicatorEl.classList.toggle('hidden', !show);
        // Disable all interactive buttons during load
        revealBtn.disabled = show;
        nextDayBtn.disabled = show;
        enableWebcamBtn.disabled = show;
        disableWebcamBtn.disabled = show;
        startEnableWebcamBtn.disabled = show;
    }

    async function fetchAllCards() { /* ... (no change) ... */ }

    /** Displays the flashcard, managing UI based on gesture state */
    function displayCard(index) {
        if (index >= cardsForToday.length) {
            showEndOfDayScreen("Practice Finished!"); // Pass specific message
            return;
        }

        // Don't stop gestures here automatically anymore
        currentCardIndex = index;
        currentCard = cardsForToday[currentCardIndex];
        isBackVisible = false; // Reset visibility for the new card

        console.log(`Displaying card ${index + 1}/${cardsForToday.length}:`, currentCard);

        // Update card content
        cardFrontEl.textContent = currentCard.front;
        cardBackEl.textContent = currentCard.back || '(No back text)';

        // Update UI visibility
        cardBackEl.classList.add('hidden'); // Hide back initially
        revealBtn.classList.remove('hidden'); // Always show reveal button for front
        controlsEl.classList.remove('hidden'); // Ensure controls div is visible

        // Manage gesture button visibility within controls
        enableWebcamBtn.classList.toggle('hidden', isGestureControlActive); // Show if gestures OFF
        disableWebcamBtn.classList.toggle('hidden', !isGestureControlActive); // Show if gestures ON

        // Keep gesture area visible if active, hide otherwise
        gestureAreaEl.classList.toggle('hidden', !isGestureControlActive);

        // Show main card area, hide start/finish area
        flashcardAreaEl.classList.remove('hidden');
        startFinishAreaEl.classList.add('hidden');
    }

    /** Reveals the back of the current card */
    function revealAnswer() {
        if (!currentCard || isLoading || isBackVisible) return;

        console.log("Revealing answer");
        isBackVisible = true;

        // Update UI
        cardBackEl.classList.remove('hidden');
        revealBtn.classList.add('hidden'); // Hide reveal btn, wait for gesture/action

        // Ensure gesture buttons are correctly shown/hidden based on state
        enableWebcamBtn.classList.toggle('hidden', isGestureControlActive);
        disableWebcamBtn.classList.toggle('hidden', !isGestureControlActive);

        // If gesture control IS active, the gesture area should already be visible.
        // If it's NOT active, the user now has the option to enable it via enableWebcamBtn.
        // We don't automatically show the gesture area here unless it was already active.
    }

    /** Processes the outcome, updates backend (optional), moves to next card */
    async function processCardOutcome(remembered) {
        if (!currentCard || isLoading) return;

        console.log(`Processing card outcome: ${remembered ? 'Remembered' : 'Forgot'}`);
        // *** DO NOT stop gesture mode here ***

        // --- Optional: Update difficulty on backend ---
        const newDifficulty = remembered ? 'easy' : 'hard';
        try {
            const response = await fetch(`${API_BASE_URL}/flashcards/${currentCard.id}/difficulty`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty: newDifficulty })
            });
            if(response.ok){
                console.log(`Updated difficulty for card ${currentCard.id} to ${newDifficulty}`);
            } else {
                 console.warn(`Failed to update difficulty (Status: ${response.status}) for card ${currentCard.id}`);
            }
        } catch (error) {
            console.error(`Network error updating difficulty for card ${currentCard.id}:`, error);
        }

        // --- Move to next card ---
        // The displayCard function will handle showing the next front and keeping
        // the gesture UI visible if isGestureControlActive is true.
        displayCard(currentCardIndex + 1);
    }

    /** Shows the start/finish screen, stops gestures */
    function showEndOfDayScreen(endMessage = "Ready for the next day?") {
        console.log("End of day/practice session reached.");
        stopGestureMode(); // Explicitly stop gestures when session ends

        flashcardAreaEl.classList.add('hidden');
        controlsEl.classList.add('hidden'); // Hide practice controls
        startFinishAreaEl.classList.remove('hidden');
        messageEl.textContent = endMessage; // Use provided message

        // Show/hide the start screen webcam button based on current gesture state (which should be off now)
        startEnableWebcamBtn.classList.toggle('hidden', isGestureControlActive);
        nextDayBtn.textContent = "Go to Next Day";
    }

    async function startNextDay() {
        if (isLoading) return;

        currentDay++; // Increment day at the start
        console.log(`Attempting to start Day ${currentDay}`);
        updateDayCounter(); // Update display to the new day immediately

        // Update UI for loading state
        messageEl.textContent = `Loading cards for Day ${currentDay}...`;
        startFinishAreaEl.classList.remove('hidden');
        flashcardAreaEl.classList.add('hidden');
        controlsEl.classList.add('hidden');

        // Show gesture area if it was already active, otherwise keep hidden
        gestureAreaEl.classList.toggle('hidden', !isGestureControlActive);

        await fetchAllCards(); // Fetch cards for the new "day"

        // Start practice if cards were found
        if (cardsForToday.length > 0) {
            displayCard(0); // Display the first card
        } else {
            // --- No cards found ---
            const noCardsMessage = `No cards found to practice for Day ${currentDay}.`; // Create message using currentDay
            console.log(noCardsMessage); // Log it
            messageEl.textContent = noCardsMessage; // Set the message area text

            // currentDay--; // <-- REMOVE THIS LINE (Don't decrement back)
            // updateDayCounter(); // <-- REMOVE THIS LINE (Don't update counter back to previous day)

            showEndOfDayScreen(noCardsMessage); // Show end screen, passing the specific message
                                                // The day counter will correctly show the day we *tried* to start
        }
    }

    // --- Gesture Control Functions ---

    /** Activates gesture mode: enables webcam and prediction loop */
    function startGestureMode() {
        if (isLoading || isGestureControlActive) return;

        console.log("Activating gesture mode...");
        isGestureControlActive = true;
        startGestureRecognition(); // Call library function

        // Update UI
        gestureAreaEl.classList.remove('hidden'); // Show webcam area
        gestureStatusEl.textContent = "Gesture Control ACTIVE";
        enableWebcamBtn.classList.add('hidden'); // Hide "Enable" button in controls
        disableWebcamBtn.classList.remove('hidden'); // Show "Stop" button in controls
        startEnableWebcamBtn.classList.add('hidden'); // Hide start screen enable button
    }

    /** Deactivates gesture mode: stops webcam and prediction loop */
    function stopGestureMode() {
        if (!isGestureControlActive) return; // Only stop if active

        console.log("Deactivating gesture mode...");
        isGestureControlActive = false;
        stopGestureRecognition(); // Call library function

        // Update UI
        gestureAreaEl.classList.add('hidden'); // Hide webcam area
        gestureStatusEl.textContent = "Gesture Control Inactive";
        // Only manage visibility of buttons if the controls area itself should be visible
        if (!flashcardAreaEl.classList.contains('hidden')) {
            enableWebcamBtn.classList.remove('hidden'); // Show "Enable" button in controls
            disableWebcamBtn.classList.add('hidden'); // Hide "Stop" button in controls
        }
         // Always ensure start screen enable button reflects state
        startEnableWebcamBtn.classList.remove('hidden');
    }

    /** Callback function passed to gesture-recognizer.js */
    function handleGestureRecognized(gesture) {
        console.log("Gesture recognized in main script:", gesture);

        // Ignore gestures if mode isn't active or card front is showing
        if (!isGestureControlActive || !isBackVisible) {
            console.log("Ignoring gesture (Reason: Not active or front visible).");
            return;
        }

        // Process recognized gestures
        switch (gesture) {
            case "THUMBS_UP":
                processCardOutcome(true); // Remembered
                break;
            case "THUMBS_DOWN":
                processCardOutcome(false); // Forgot
                break;
            default:
                console.log("Unknown or unhandled gesture received:", gesture);
        }
    }

    // --- Event Listeners Setup ---
    nextDayBtn.addEventListener('click', startNextDay);
    revealBtn.addEventListener('click', revealAnswer);
    enableWebcamBtn.addEventListener('click', startGestureMode); // Button during practice
    disableWebcamBtn.addEventListener('click', stopGestureMode); // Button during practice
    startEnableWebcamBtn.addEventListener('click', startGestureMode); // Button on start screen

    // --- Initial Application Setup ---
    async function initializeApp() {
        console.log("Initializing Flashcard Learner with Gesture Support");
        await initializeGestureRecognizer(handleGestureRecognized);
        updateDayCounter();
        messageEl.textContent = `Ready to start Day ${currentDay + 1}?`;
        nextDayBtn.textContent = "Start Practice";
        showLoading(false);
        showEndOfDayScreen(messageEl.textContent); // Pass initial message
    }

    // Start the application initialization
    initializeApp();

}); // End DOMContentLoaded