const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const pointsDisplay = document.getElementById("points");
const withdrawBtn = document.getElementById("withdrawBtn");
const instructionBtn = document.getElementById("instructionBtn");
const instructionPopup = document.getElementById("instructionPopup");
const closeInstruction = document.getElementById("closeInstruction");

// Create a spins progress element on top
let spinsDisplay = document.createElement("div");
spinsDisplay.style.fontSize = "16px";
spinsDisplay.style.marginBottom = "10px";
spinsDisplay.innerText = "Spins: 0/10";
pointsDisplay.parentNode.insertBefore(spinsDisplay, pointsDisplay);

// Confetti canvas
let confettiCanvas = document.createElement("canvas");
confettiCanvas.style.position = "fixed";
confettiCanvas.style.top = "0";
confettiCanvas.style.left = "0";
confettiCanvas.style.width = "100%";
confettiCanvas.style.height = "100%";
confettiCanvas.style.pointerEvents = "none";
confettiCanvas.style.display = "none";
document.body.appendChild(confettiCanvas);
const ctx = confettiCanvas.getContext("2d");

// Confetti functions
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
  if (confettiCanvas.style.display === "block") requestAnimationFrame(updateConfetti);
}
function stopConfetti() { confettiCanvas.style.display = "none"; }

// Wheel segments and rewards
const segments = ["1","2","3","4","5","6","7","NA"];
const rewards = { "1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"NA":0 };

// Load balance & spins from localStorage
let balance = parseInt(localStorage.getItem("dogBalance")) || 0;
let spinsDone = parseInt(localStorage.getItem("spinsDone")) || 0;
let nextSpinTime = parseInt(localStorage.getItem("nextSpinTime")) || 0;
pointsDisplay.innerText = `Balance: ₹${balance}`;
spinsDisplay.innerText = `Spins: ${spinsDone}/10`;
let spinning = false;
let currentRotation = 0;

// Cooldown check
if (spinsDone >= 10) setCooldown();

function spinWheel() {
  const pickedIndex = Math.floor(Math.random() * segments.length);
  const pickedSegment = segments[pickedIndex];

  const segmentDeg = pickedIndex * 45 + 22.5; // center of segment
  const extraSpins = 1; // minimal extra spins for fast effect
  const totalDeg = extraSpins * 360 + segmentDeg;

  currentRotation += totalDeg;

  // Immediate fast spin: 1s
  wheel.style.transition = "transform 1s cubic-bezier(0.33, 1, 0.68, 1)";
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    const reward = rewards[pickedSegment];
    balance += reward;
    spinsDone++;
    localStorage.setItem("dogBalance", balance);
    localStorage.setItem("spinsDone", spinsDone);
    pointsDisplay.innerText = `Balance: ₹${balance} (+₹${reward})`;
    spinsDisplay.innerText = `Spins: ${spinsDone}/10`;

    spinning = false;

    // Start confetti
    startConfetti();
    setTimeout(stopConfetti, 4000); // short confetti burst

    // Enable withdraw if balance >= 1000
    withdrawBtn.disabled = balance < 1000;

    // Set cooldown if max spins reached
    if (spinsDone >= 10) setCooldown();
  }, 1100); // slightly more than transition
}

instructionBtn.addEventListener("click", () => {
  instructionPopup.style.display = "flex";
});

closeInstruction.addEventListener("click", () => {
  instructionPopup.style.display = "none";
});

// Close when clicking outside the popup content
instructionPopup.addEventListener("click", (e) => {
  if (e.target === instructionPopup) instructionPopup.style.display = "none";
});

// Cooldown functions
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
      spinsDisplay.innerText = `Spins: 0/10`;
      clearInterval(interval);
      return;
    }
    const diff = nextSpinTime - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    spinsDisplay.innerText = `⏳ Next spin in ${h}h ${m}m ${s}s`;
  }, 1000);
}

// Withdraw button
withdrawBtn.disabled = balance < 1000;
withdrawBtn.addEventListener("click", () => {
  if (balance >= 1000) window.location.href = "https://t.me/yourTelegramID";
});

// Show ad by type
function showAd(adType) {
  return new Promise((resolve) => {
    if (typeof show_9734652 === "function") {
      switch(adType) {
        case "rewardedInterstitial":
          show_9734652().then(() => resolve()).catch(() => resolve());
          break;
        case "rewardedPopup":
          show_9734652('pop').then(() => resolve()).catch(() => resolve());
          break;
        case "inAppInterstitial":
          show_9734652({
            type: 'inApp',
            inAppSettings: {
              frequency: 2,
              capping: 0.1,
              interval: 30,
              timeout: 5,
              everyPage: false
            }
          }).then(() => resolve()).catch(() => resolve());
          break;
        default:
          resolve();
      }
    } else {
      resolve();
    }
  });
}

// Show ads then spin
async function showAdsThenSpin() {
  if (spinning) return;

  // Check cooldown
  if (spinsDone >= 10) {
    setCooldown();
    return;
  }

  spinning = true;

  try {
    await showAd("rewardedInterstitial");
    await new Promise(res => setTimeout(res, 2000));

    await showAd("rewardedPopup");
    await new Promise(res => setTimeout(res, 2000));

    await showAd("inAppInterstitial");
    await new Promise(res => setTimeout(res, 1000));
  } catch(err) {
    console.error("Ad error:", err);
  }

  // Spin wheel after ads
  spinWheel();
}

// Attach click
spinBtn.addEventListener("click", showAdsThenSpin);
