let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;
let laps = [];
let lastLapTime = 0;

const display = document.getElementById('display');
const currentLapEl = document.getElementById('currentLap');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const exportBtnMobile = document.getElementById('exportBtnMobile');
const lapsList = document.getElementById('lapsList');
const lapHeader = document.getElementById('lapHeader');
const legend = document.getElementById('legend');
const themeBtn = document.getElementById('themeBtn');

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}<span class="ms">.${String(milliseconds).padStart(2, '0')}</span>`;
}

function updateDisplay() {
  elapsedTime = Date.now() - startTime;
  display.innerHTML = formatTime(elapsedTime);
  
  const currentLap = elapsedTime - lastLapTime;
  currentLapEl.textContent = `Current Lap: ${formatTime(currentLap).replace('<span class="ms">', '').replace('</span>', '')}`;
}

function startStop() {
  if (!isRunning) {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateDisplay, 10);
    isRunning = true;
    
    startStopBtn.textContent = 'Stop';
    startStopBtn.classList.remove('btn-start');
    startStopBtn.classList.add('btn-stop');
    lapBtn.disabled = false;
    resetBtn.disabled = false;
  } else {
    clearInterval(timerInterval);
    isRunning = false;
    
    startStopBtn.textContent = 'Start';
    startStopBtn.classList.remove('btn-stop');
    startStopBtn.classList.add('btn-start');
  }
}

function addLap() {
  if (!isRunning) return;
  
  const lapTime = elapsedTime - lastLapTime;
  const totalTime = elapsedTime;
  laps.push({ lap: laps.length + 1, split: lapTime, total: totalTime });
  lastLapTime = elapsedTime;
  
  renderLaps();
  exportBtn.disabled = false;
  exportBtnMobile.classList.add('show');
  lapHeader.style.display = 'grid';
  legend.style.display = 'flex';
}

function renderLaps() {
  const fastest = Math.min(...laps.map(l => l.split));
  const slowest = Math.max(...laps.map(l => l.split));
  
  lapsList.innerHTML = '';
  
  [...laps].reverse().forEach(lap => {
    const lapDiv = document.createElement('div');
    lapDiv.className = 'lap';
    if (lap.split === fastest) lapDiv.classList.add('lap-fastest');
    if (lap.split === slowest) lapDiv.classList.add('lap-slowest');
    
    lapDiv.innerHTML = `
      <span class="lap-number">${lap.lap}</span>
      <span class="lap-split">${formatTime(lap.split).replace('<span class="ms">', '').replace('</span>', '')}</span>
      <span class="lap-total">${formatTime(lap.total).replace('<span class="ms">', '').replace('</span>', '')}</span>
    `;
    lapsList.appendChild(lapDiv);
  });
}

function reset() {
  clearInterval(timerInterval);
  isRunning = false;
  elapsedTime = 0;
  lastLapTime = 0;
  laps = [];
  
  display.innerHTML = '00:00<span class="ms">.00</span>';
  currentLapEl.textContent = '';
  lapsList.innerHTML = '<div class="empty-laps">Press Lap to record your first lap</div>';
  
  startStopBtn.textContent = 'Start';
  startStopBtn.classList.remove('btn-stop');
  startStopBtn.classList.add('btn-start');
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  exportBtn.disabled = true;
  exportBtnMobile.classList.remove('show');
  lapHeader.style.display = 'none';
  legend.style.display = 'none';
}

function exportCSV() {
  if (laps.length === 0) return;
  
  let csv = 'Lap,Split Time,Total Time\n';
  laps.forEach(lap => {
    const split = formatTime(lap.split).replace(/<[^>]*>/g, '');
    const total = formatTime(lap.total).replace(/<[^>]*>/g, '');
    csv += `${lap.lap},${split},${total}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stopwatch-laps.csv';
  a.click();
}

// Theme toggle
themeBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    themeBtn.textContent = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = '☀️';
  }
});

// Event listeners
startStopBtn.addEventListener('click', startStop);
lapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', reset);
exportBtn.addEventListener('click', exportCSV);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    startStop();
  }
  if (e.code === 'KeyL') addLap();
  if (e.code === 'KeyR') reset();
});