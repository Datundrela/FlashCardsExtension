import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9";

let handLandmarker = undefined;
let handLandmarkerPromise = null;
let runningMode = "VIDEO";
let webcamRunning = false;
let lastVideoTime = -1;
let detectionResults = null;
let gestureCallback = null;
let lastGesture = null;
let gestureDebounceTimeout = null;
const DEBOUNCE_DELAY = 300;

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output-canvas");
const canvasCtx = canvasElement.getContext("2d");

async function createHandLandmarkerInternal() {
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: runningMode,
            numHands: 1
        });
    } catch (error) {
        console.error("Error creating Hand Landmarker:", error);
        handLandmarker = null;
    }
}

handLandmarkerPromise = createHandLandmarkerInternal();

async function enableCam() {
    if (!handLandmarker) {
        await handLandmarkerPromise;
        if (!handLandmarker) {
             console.error("HandLandmarker still not available after waiting.");
             alert("Gesture system failed to initialize. Please try reloading.");
             return;
        }
    }

    if (webcamRunning) {
        return;
    }
    webcamRunning = true;

    const constraints = { video: true };
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.addEventListener("loadeddata", startPredictionLoop);
        video.setAttribute('data-ready', 'true');
        canvasElement.setAttribute('data-ready', 'true');
    } catch (err) {
        console.error("getUserMedia error:", err);
        webcamRunning = false;
        video.removeAttribute('data-ready');
        canvasElement.removeAttribute('data-ready');
        alert("Could not access webcam. Please check permissions and reload.");
    }
}

function disableCam() {
    if (!webcamRunning) return;

    webcamRunning = false;
    video.removeEventListener("loadeddata", startPredictionLoop);

    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    video.removeAttribute('data-ready');
    canvasElement.removeAttribute('data-ready');

    lastGesture = null;
    clearTimeout(gestureDebounceTimeout);
}

function startPredictionLoop() {
    if (!webcamRunning) {
         return;
     };
    lastVideoTime = -1;
    predictWebcam();
}

async function predictWebcam() {
    if (!webcamRunning) return;

    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    if (canvasElement.width !== displayWidth || canvasElement.height !== displayHeight) {
        canvasElement.width = displayWidth;
        canvasElement.height = displayHeight;
    }

    const startTimeMs = performance.now();
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        if (handLandmarker) {
            detectionResults = handLandmarker.detectForVideo(video, startTimeMs);
        } else {
             detectionResults = null;
        }
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (detectionResults && detectionResults.landmarks && detectionResults.landmarks.length > 0) {
        for (const landmarks of detectionResults.landmarks) {
            interpretHandGestures(landmarks);
        }
    } else {
         if (lastGesture !== null) {
              clearTimeout(gestureDebounceTimeout);
              gestureDebounceTimeout = setTimeout(() => {
                  lastGesture = null;
              }, DEBOUNCE_DELAY / 2);
         }
    }

    canvasCtx.restore();
    window.requestAnimationFrame(predictWebcam);
}

function interpretHandGestures(landmarks) {
    if (!landmarks || landmarks.length < 21) return;

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexPip = landmarks[6];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    let detectedGesture = null;
    const verticalThreshold = 0.05;

    if (thumbTip.y < (indexPip.y - verticalThreshold) &&
        thumbTip.y < middleTip.y &&
        thumbTip.y < ringTip.y &&
        thumbTip.y < pinkyTip.y)
    {
        detectedGesture = "THUMBS_UP";
    }
    else if (thumbTip.y > (wrist.y + verticalThreshold) &&
             thumbTip.y > indexTip.y &&
             thumbTip.y > middleTip.y &&
             thumbTip.y > ringTip.y &&
             thumbTip.y > pinkyTip.y)
     {
        detectedGesture = "THUMBS_DOWN";
    }

    if (detectedGesture) {
        if (detectedGesture !== lastGesture) {
            clearTimeout(gestureDebounceTimeout);
            lastGesture = detectedGesture;
            gestureDebounceTimeout = setTimeout(() => {
                if (lastGesture === detectedGesture && gestureCallback) {
                    gestureCallback(detectedGesture);
                    lastGesture = null;
                }
            }, DEBOUNCE_DELAY);
        }
    } else {
        if (lastGesture !== null) {
             clearTimeout(gestureDebounceTimeout);
             gestureDebounceTimeout = setTimeout(() => {
                 lastGesture = null;
             }, DEBOUNCE_DELAY / 2);
        }
    }
}

export async function initializeGestureRecognizer(callback) {
    gestureCallback = callback;
    await handLandmarkerPromise;
    if (!handLandmarker) {
         console.error("Hand Landmarker failed to initialize (checked after await).");
    } else {
         console.log("Gesture Recognizer Initialized and Landmarker ready.");
    }
}

export function startGestureRecognition() {
    enableCam();
}

export function stopGestureRecognition() {
    disableCam();
}