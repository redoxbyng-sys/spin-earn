const wheel = document.getElementById("wheel");
const pointsDisplay = document.getElementById("points");
const centerNumber = document.getElementById("centerNumber");
const spinBtn = document.getElementById("spinBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
const cooldownMsg = document.getElementById("cooldownMsg");
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");
const progress = document.getElementById("progress");
const instructionBtn = document.getElementById("instructionBtn");
const instructionPopup = document.getElementById("instructionPopup");
const closeInstruction = document.getElementById("closeInstruction");


let balance = parseInt(localStorage.getItem("dogBalance")) || 0;
let spinsDone = parseInt(localStorage.getItem("spinsDone")) || 0;
let nextSpinTime = parseInt(localStorage.getItem("nextSpinTime")) || 0;
let currentRotation = 0;
pointsDisplay.innerText = "Balance: ₹" + balance;


// update progress counter
function updateProgress() {
  progress.innerText = `Spins: ${spinsDone}/10`;
}
updateProgress();

// Spin wheel logic
function spinWheel() {
  const randomNumber = Math.floor(Math.random() * 8) + 1;
  const segmentAngle = 360 / 8;
  const stopAngle = (8 - randomNumber) * segmentAngle + (segmentAngle / 2);
  const spinRounds = 5 * 360;
  const newRotation = spinRounds + stopAngle;

  currentRotation += newRotation;
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
  const segments = [
    "₹1", "₹2", "₹3", "₹4",
    "₹5", "₹NA", "₹7", "₹8"
  ];

  const prizeText = segments[randomNumber - 1]; // get actual segment text
  centerNumber.innerText = prizeText;

  // if it's not NA, add to balance
  if (prizeText !== "₹NA") {
    const prizeValue = parseInt(prizeText.replace("₹", ""));
    balance += prizeValue;
    pointsDisplay.innerText = `Balance: ₹${balance} (+${prizeText})`;
  } else {
    pointsDisplay.innerText = `Balance: ₹${balance} (No Win)`;
  }

  spinsDone++;
  localStorage.setItem("dogBalance", balance);
  localStorage.setItem("spinsDone", spinsDone);

  updateProgress();
  startConfetti();
  setTimeout(stopConfetti, 3000);

  if (balance >= 1000) withdrawBtn.disabled = false;
  if (spinsDone >= 10) setCooldown();
}, 4200);
}

instructionBtn.addEventListener("click", () => {
  instructionPopup.style.display = "flex";
});
closeInstruction.addEventListener("click", () => {
  instructionPopup.style.display = "none";
});

// Ads flow
function showAd(adId, closeId, nextFn) {
  const popup = document.getElementById(adId);
  const closeBtn = document.getElementById(closeId);
  popup.style.display = "flex";
  closeBtn.disabled = true;
  let timer = 5;
  closeBtn.innerText = "Wait 5s...";
  const interval = setInterval(() => {
    timer--;
    closeBtn.innerText = timer > 0 ? `Wait ${timer}s...` : "❌ Close";
    if (timer <= 0) {
      clearInterval(interval);
      closeBtn.disabled = false;
    }
  }, 1000);

  closeBtn.onclick = () => {
    popup.style.display = "none";
    if (nextFn) nextFn();
  };
}

spinBtn.addEventListener("click", () => {
  if (spinsDone >= 10) {
    setCooldown();
    return;
  }
  showAd("adPopup1", "closeAd1", () =>
    showAd("adPopup2", "closeAd2", () =>
      showAd("adPopup3", "closeAd3", spinWheel)
    )
  );
});

// Cooldown (2 hours)
function setCooldown() {
  if (!nextSpinTime) {
    nextSpinTime = Date.now() + 2 * 60 * 60 * 1000;
    localStorage.setItem("nextSpinTime", nextSpinTime);
  }
  spinBtn.disabled = true;
  updateCooldown();
}

function updateCooldown() {
  const interval = setInterval(() => {
    const now = Date.now();
    if (now >= nextSpinTime) {
      spinsDone = 0;
      nextSpinTime = 0;
      localStorage.setItem("spinsDone", 0);
      localStorage.setItem("nextSpinTime", 0);
      spinBtn.disabled = false;
      cooldownMsg.innerText = "";
      clearInterval(interval);
      return;
    }
    const diff = nextSpinTime - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    cooldownMsg.innerText = `⏳ You can spin after ${h}h ${m}m ${s}s`;
  }, 1000);
}

if (spinsDone >= 10) {
  setCooldown();
}

// Withdraw button
withdrawBtn.addEventListener("click", () => {
  if (balance >= 1000) {
    window.location.href = "https://t.me/yourTelegramID";
  }
});

// 🎉 Confetti
let confettiParticles = [];
function startConfetti() {
  confettiCanvas.style.display = "block";
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiParticles = Array.from({ length: 120 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
    r: Math.random() * 6 + 2,
    color: `hsl(${Math.random() * 360},100%,50%)`
  }));
  requestAnimationFrame(updateConfetti);
}
function updateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.r, p.r * 2);
    p.y += 2;
    if (p.y > confettiCanvas.height) p.y = -10;
  });
  if (confettiCanvas.style.display === "block") {
    requestAnimationFrame(updateConfetti);
  }
}
function stopConfetti() {
  confettiCanvas.style.display = "none";
}
