const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const outputText = document.getElementById('output-text');

let lastGesture = '';
let lastTime = 0;

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5
});

function showGesture(text) {
  if (text !== lastGesture || Date.now() - lastTime > 1500) {
    lastGesture = text;
    lastTime = Date.now();
    outputText.textContent = text;
  }
}

function isHiGesture(landmarks) {
  return landmarks[8].y < landmarks[6].y &&
         landmarks[12].y < landmarks[10].y &&
         landmarks[16].y < landmarks[14].y &&
         landmarks[20].y < landmarks[18].y;
}

function isFist(landmarks) {
  return landmarks[8].y > landmarks[6].y &&
         landmarks[12].y > landmarks[10].y &&
         landmarks[16].y > landmarks[14].y &&
         landmarks[20].y > landmarks[18].y;
}

function isThumbsUp(landmarks) {
  return landmarks[4].y < landmarks[3].y &&
         landmarks[8].y > landmarks[6].y &&
         landmarks[12].y > landmarks[10].y &&
         landmarks[16].y > landmarks[14].y &&
         landmarks[20].y > landmarks[18].y;
}

function isPeace(landmarks) {
  return landmarks[8].y < landmarks[6].y &&
         landmarks[12].y < landmarks[10].y &&
         landmarks[16].y > landmarks[14].y &&
         landmarks[20].y > landmarks[18].y;
}

hands.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    showGesture("No hand gesture detected");
  } else if (results.multiHandLandmarks.length > 1) {
    showGesture("Only 1 hand allowed");
  } else {
    const landmarks = results.multiHandLandmarks[0];
    let gesture = "...";

    if (isHiGesture(landmarks)) gesture = "Hi / Hello 👋";
    else if (isThumbsUp(landmarks)) gesture = "Thumbs Up 👍";
    else if (isPeace(landmarks)) gesture = "Peace ✌️";
    else if (isFist(landmarks)) gesture = "Fist Bomb👊";

    showGesture(gesture);

    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
    drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
  }

  canvasCtx.restore();
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});
camera.start();
