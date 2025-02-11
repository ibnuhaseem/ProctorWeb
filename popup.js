// popup.js
let timerInterval = null;
let fullscreenActive = false;

document.getElementById('timer-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const duration = parseInt(document.getElementById('duration').value);

  chrome.runtime.sendMessage({ command: 'startTimer', duration }, (response) => {
    if (response && response.endTime) {
      console.log('Timer started. End time:', new Date(response.endTime));
      if (!document.getElementById('timer-display')) {
        showTimerDisplay();
      }
      if (!fullscreenActive) {
        enableFullscreenProtection();
      }
    }
  });
});

window.addEventListener('beforeunload', () => {
  chrome.runtime.sendMessage({ command: 'resetTimer' });
});

function showTimerDisplay() {
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timer-display';
  timerDisplay.style.position = 'fixed';
  timerDisplay.style.top = '50%';
  timerDisplay.style.left = '50%';
  timerDisplay.style.transform = 'translate(-50%, -50%)';
  timerDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  timerDisplay.style.color = 'white';
  timerDisplay.style.padding = '20px';
  timerDisplay.style.borderRadius = '8px';
  timerDisplay.style.fontSize = '24px';
  document.body.appendChild(timerDisplay);
}

function enableFullscreenProtection() {
  fullscreenActive = true;
  document.documentElement.requestFullscreen().catch((err) => {
    console.error('Failed to enter fullscreen:', err);
  });

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
}

let ctrlPressed = false;
let cPressed = false;
let bPressed = false;

function handleKeyDown(e) {
  if (e.key === 'Control') ctrlPressed = true;
  if (e.key.toLowerCase() === 'c') cPressed = true;
  if (e.key.toLowerCase() === 'b') bPressed = true;

  if (e.key === 'F11' || (e.altKey && (e.key === 'Tab' || e.key === 'F4')) || (e.ctrlKey && e.key === 'w')) {
    e.preventDefault();
  }

  if (ctrlPressed && cPressed && bPressed) {
    console.log('Exiting fullscreen protection');
    document.exitFullscreen();
    fullscreenActive = false;
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }
}

function handleKeyUp(e) {
  if (e.key === 'Control') ctrlPressed = false;
  if (e.key.toLowerCase() === 'c') cPressed = false;
  if (e.key.toLowerCase() === 'b') bPressed = false;
}

function handleFullscreenChange() {
  if (!document.fullscreenElement && fullscreenActive) {
    console.log('Re-entering fullscreen');
    document.documentElement.requestFullscreen();
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.command === 'updateTimer') {
    const timeLeft = Math.max(0, Math.floor(request.timeLeft / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
      timerDisplay.style.display = 'block';
      timerDisplay.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      document.title = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  } else if (request.command === 'timerEnded') {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = 'Time is up!';
      setTimeout(() => timerDisplay.remove(), 3000);
    }
    document.title = 'Time is up!';
    alert('Time is up!');
    clearInterval(timerInterval);
  }
});
