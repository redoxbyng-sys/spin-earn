const wheel = document.getElementById("wheel");
const pointsDisplay = document.getElementById("points");
const spinBtn = document.getElementById("spinBtn");

const popupAd = document.getElementById("popupAd");
const adBox = popupAd.querySelector(".ad-box");

// Load balance from localStorage
let balance = parseInt(localStorage.getItem("dogBalance")) || 0;
pointsDisplay.innerText = "Balance: ₹" + balance;

let spinning = false;

// Spin wheel function
function spinWheel() {
  const randomDeg = 360 * 3 + Math.floor(Math.random() * 360);
  wheel.style.transform = `rotate(${randomDeg}deg)`;

  setTimeout(() => {
    balance += 1; // reward
    localStorage.setItem("dogBalance", balance);
    pointsDisplay.innerText = "Balance: ₹" + balance + " (+₹1)";
    spinning = false;
  }, 4200);
}

// Show interstitial ad in popup overlay
function showInterstitialAd(adConfig) {
  return new Promise((resolve) => {
    popupAd.style.display = "flex";
    adBox.innerText = "Loading ad...";

    if (typeof show_9734652 === "function") {
      show_9734652(adConfig) // pass different config for different ads
        .then(() => {
          adBox.innerText = "Ad finished!";
          setTimeout(() => {
            popupAd.style.display = "none";
            resolve();
          }, 1000);
        })
        .catch(() => {
          adBox.innerText = "Ad failed or skipped.";
          setTimeout(() => {
            popupAd.style.display = "none";
            resolve();
          }, 1000);
        });
    } else {
      console.warn("SDK not loaded, skipping ad");
      adBox.innerText = "SDK not loaded.";
      setTimeout(() => {
        popupAd.style.display = "none";
        resolve();
      }, 1000);
    }
  });
}

// Show 3 different interstitial ads then spin
async function show3DifferentAdsThenSpin() {
  if (spinning) return;
  spinning = true;

  const adConfigs = [
    { type: 'inApp', placementId: 'ad1' },
    { type: 'inApp', placementId: 'ad2' },
    { type: 'inApp', placementId: 'ad3' }
  ];

  for (let config of adConfigs) {
    await showInterstitialAd(config);
    await new Promise(res => setTimeout(res, 2000)); // 2s gap
  }

  spinWheel();
}

spinBtn.addEventListener("click", show3DifferentAdsThenSpin);
