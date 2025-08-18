const wheel = document.getElementById("wheel");
const pointsDisplay = document.getElementById("points");
const spinBtn = document.getElementById("spinBtn");

// Load balance from localStorage
let balance = parseInt(localStorage.getItem("dogBalance")) || 0;
pointsDisplay.innerText = "Balance: ₹" + balance;

let spinning = false;

// Spin wheel logic
function spinWheel() {
  const randomDeg = 360 * 3 + Math.floor(Math.random() * 360);
  wheel.style.transform = `rotate(${randomDeg}deg)`;

  setTimeout(() => {
    balance += 1; // reward per spin
    localStorage.setItem("dogBalance", balance);
    pointsDisplay.innerText = "Balance: ₹" + balance + " (+₹1)";
    spinning = false;
  }, 4200);
}

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
      console.warn("SDK not loaded, skipping ad");
      resolve();
    }
  });
}

// Show 3 ads sequentially with delay
async function showAdsThenSpin() {
  if (spinning) return;
  spinning = true;

  // 1st ad - Rewarded Interstitial
  await showAd("rewardedInterstitial");

  // Wait 2 seconds before next ad
  await new Promise(res => setTimeout(res, 2000));

  // 2nd ad - Rewarded Popup
  await showAd("rewardedPopup");

  // Wait 3 seconds before next ad
  await new Promise(res => setTimeout(res, 3000));

  // 3rd ad - In-App Interstitial
  await showAd("inAppInterstitial");

  // Spin after all ads
  spinWheel();
}

spinBtn.addEventListener("click", showAdsThenSpin);
