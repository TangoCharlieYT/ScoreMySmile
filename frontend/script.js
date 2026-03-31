const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start-btn");
const captureBtn = document.getElementById("capture-btn");
const targetEl = document.getElementById("target-emotion");
const roundInfo = document.getElementById("round-info");
const scoreInfo = document.getElementById("score-info");
const feedback = document.getElementById("feedback");
const finalScoreEl = document.getElementById("final-score");
const resultSection = document.getElementById("result-section");
const playerNameInput = document.getElementById("player-name");
const playerRatingSelect = document.getElementById("player-rating");
const submitRatingBtn = document.getElementById("submit-rating-btn");
const leaderboardEl = document.getElementById("leaderboard");
const cameraStatus = document.getElementById("camera-status");
const retryBtn = document.getElementById("retry-btn");

// 🔥 more emotions
const emotions = ["happy", "sad", "angry", "surprise", "fear"];

let selectedEmotions = [];
let currentRound = 0;
let scores = [];

async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    cameraStatus.innerText = "Camera is on. Ready!";
  } catch (error) {
    cameraStatus.innerText = "Camera error: " + error.message;
    cameraStatus.style.color = "red";
    startBtn.disabled = true;
    captureBtn.disabled = true;
  }
}

function chooseEmotions() {
  const shuffled = [...emotions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// 🔥 normalize probabilities
function normalize(emotionsObj) {
  const total = Object.values(emotionsObj).reduce((a, b) => a + b, 0);
  const normalized = {};
  for (let k in emotionsObj) {
    normalized[k] = emotionsObj[k] / total;
  }
  return normalized;
}

// 🔥 improved scoring
function calculateScore(emotionsResult, target) {
  const normalized = normalize(emotionsResult);

  const targetScore = normalized[target] || 0;

  const maxOther = Math.max(
    ...Object.entries(normalized)
      .filter(([k]) => k !== target)
      .map(([_, v]) => v)
  );

  return Math.max(0, targetScore - 0.5 * maxOther);
}

async function sendImageToServer(imageData) {
  const response = await fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageData }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "prediction failed");
  }

  return data.emotions;
}

// 🔥 better compression
async function captureCurrentRound() {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.6);
}

// 🔥 show top detected emotion
function getTopEmotion(emotionsResult) {
  return Object.entries(emotionsResult)
    .sort((a, b) => b[1] - a[1])[0][0];
}

async function processCapture() {
  captureBtn.disabled = true;
  captureBtn.innerText = "Processing...";
  feedback.innerText = "Analyzing...";

  try {
    const imageData = await captureCurrentRound();
    const emotionsResult = await sendImageToServer(imageData);

    const target = selectedEmotions[currentRound];
    const score = calculateScore(emotionsResult, target);

    scores.push(score);
    retryBtn.disabled = false;
    const topEmotion = getTopEmotion(emotionsResult);

    scoreInfo.innerText += `Round ${currentRound + 1} (${target}): ${(score * 100).toFixed(1)}%\n`;

    feedback.innerText = `
Target: ${target}
Detected: ${topEmotion}
Score: ${(score * 100).toFixed(1)}%
`;
    currentRound++;

    if (currentRound < selectedEmotions.length) {
      targetEl.innerText = selectedEmotions[currentRound];
      roundInfo.innerText = `Round ${currentRound + 1} of 3`;
    } else {
      endGame();
      return; // important
    }

  } catch (error) {
    feedback.innerText = `Error: ${error.message}`;
  }

  // 🔥 ALWAYS reset button (key fix)
  captureBtn.disabled = false;
  captureBtn.innerText = "Capture";
}

function endGame() {
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  finalScoreEl.innerText = (avgScore * 100).toFixed(1);

  resultSection.classList.remove("hidden");

  startBtn.disabled = false;
  captureBtn.disabled = true;
  targetEl.innerText = "-";
  roundInfo.innerText = "Game complete!";
}

startBtn.addEventListener("click", () => {
  selectedEmotions = chooseEmotions();
  currentRound = 0;
  scores = [];
  
  retryBtn.disabled = true;
  scoreInfo.innerText = "";
  feedback.innerText = "";
  resultSection.classList.add("hidden");

  targetEl.innerText = selectedEmotions[0];
  roundInfo.innerText = "Round 1 of 3";

  startBtn.disabled = true;
  captureBtn.disabled = false;
});

captureBtn.addEventListener("click", processCapture);

window.addEventListener("load", () => {
  setupCamera();
});

retryBtn.addEventListener("click", () => {
  if (currentRound === 0) return;

  // go back one round
  currentRound--;
  scores.pop();

  targetEl.innerText = selectedEmotions[currentRound];
  roundInfo.innerText = `Round ${currentRound + 1} of 3`;

  feedback.innerText = "Retake your expression!";
  
  captureBtn.disabled = false;
  captureBtn.innerText = "Capture";

  retryBtn.disabled = true;
});