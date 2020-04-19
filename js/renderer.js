const electron = require('electron');
const ipc = electron.ipcRenderer;

let startButton = document.getElementById('start');
let pauseButton = document.getElementById('pause');
let resetButton = document.getElementById('reset');

let timer = document.getElementById('timer');
let phase = document.getElementById('phase');
let isTimerPaused = false;
let isTimerActive = false;

let modes = document.getElementById('modes');
let classicModeButton = document.getElementById('classicMode');
let classicModeTable = document.getElementById('classicModeTable');
let deepFocusModeButton = document.getElementById('deepFocusMode');
let deepFocusModeTable = document.getElementById('deepFocusModeTable');

// Initial setup of active mode
classicModeTable.style.display = 'inline-table';
deepFocusModeTable.style.display = 'none';

// let audio = document.getElementById('audio');
// audio.volume = 0.1;
let bell = document.getElementById('bell');
let areNotificationsEnabled = true;

class cycle {
    constructor(title, htmlTitle, minutes) {
        this.title = title;
        this.htmlTitle = htmlTitle;
        this.minutes = minutes;
        this.currentMinute = minutes;
        this.currentSecond = 0;
    }
}

let classicCycles = [
    new cycle('1st Work Cycle', '<b><u>1st</u></b> Work Cycle', 25),
    new cycle('Break - 1st Work Cycle', '<b><u>Break</u></b> - 1st Work Cycle', 5),
    new cycle('2nd Work Cycle', '<b><u>2nd</u></b> Work Cycle', 25),
    new cycle('Break - 2nd Work Cycle', '<b><u>Break</u></b> - 2nd Work Cycle', 5),
    new cycle('3rd Work Cycle', '<b><u>3rd</u></b> Work Cycle', 25),
    new cycle('Break - 3rd Work Cycle', '<b><u>Break</u></b> - 3rd Work Cycle', 5),
    new cycle('4th Work Cycle', '<b><u>4th</u></b> Work Cycle', 25),
    new cycle('Long Break', 'Long Break', 30),
];

let deepFocusCycles = [
    new cycle('1st Work Cycle', '<b><u>1st</u></b> Work Cycle', 90),
    new cycle('Long Break', 'Long Break', 30),
];

let cycles = classicCycles;
let timerLoop;
let currentCycleIndex = 0;
let currentCycle;

function setup() {
    currentCycle = cycles[0];
    timer.innerText =
        (currentCycle.currentMinute > 9 ?
            currentCycle.currentMinute : '0' + currentCycle.currentMinute) + ':' +
        (currentCycle.currentSecond > 9 ?
            currentCycle.currentSecond : '0' + currentCycle.currentSecond);
        
    let trayMessage = `${currentCycle.title} - ${isTimerPaused ? 'Paused' : 'Active'} \n${timer.innerText}`;
    ipc.send('updateTrayTimer', trayMessage);
}

startButton.addEventListener('click', () => {
    isTimerActive = true;
    isTimerPaused = false;
    if (pauseButton.classList.contains('active')) {
        pauseButton.classList.remove('active');
        pauseButton.innerText = 'Pause';
    }

    startButton.classList.add('active');

    setup();
    clearInterval(timerLoop);
    timerLoop = setInterval(init, 1000);
    phase.innerHTML = cycles[0].htmlTitle;
});

resetButton.addEventListener('click', () => {
    if (pauseButton.classList.contains('active')) {
        pauseButton.classList.remove('active');
        pauseButton.innerText = 'Pause';
    }

    if (startButton.classList.contains('active')) {
        startButton.classList.remove('active');
    }

    resetTimer();
    
    if (classicModeTable.style.display != 'none') {
        cycles = classicCycles;
        deepFocusModeTable.style.display = 'none';
    }
    if (deepFocusModeTable.style.display != 'none') {
        cycles = deepFocusCycles;
        classicModeTable.style.display = 'none';
    }
    
    setup();
});

pauseButton.addEventListener('click', () => {
    isTimerPaused = !isTimerPaused;

    if (isTimerPaused) {
        pauseButton.innerText = 'Unpause';
        pauseButton.classList.add('active');

        let trayMessage = `${currentCycle.title} - ${isTimerPaused ? 'Paused' : 'Active'} \n${timer.innerText}`;
        ipc.send('updateTrayTimer', trayMessage);
    } else {
        pauseButton.innerText = 'Pause';
        pauseButton.classList.remove('active');
    }
});

bell.addEventListener('click', () => {
    areNotificationsEnabled = !areNotificationsEnabled;

    if (areNotificationsEnabled) {
        bell.innerHTML = '<i class="fas fa-bell"></i>';
    } else {
        bell.innerHTML = '<i class="fas fa-bell-slash"></i>';
    }
});

classicModeButton.addEventListener('click', () => {
    resetModesClasses();

    classicModeButton.classList.add('active');
    classicModeTable.style.display = 'inline-table';
    deepFocusModeTable.style.display = 'none';

    if (isTimerActive == false) {
        cycles = classicCycles;
        setup();
    }
});

deepFocusModeButton.addEventListener('click', () => {
    resetModesClasses();

    deepFocusModeButton.classList.add('active');
    deepFocusModeTable.style.display = 'inline-table';
    classicModeTable.style.display = 'none';

    if (isTimerActive == false) {
        cycles = deepFocusCycles;
        setup();
    }
});

function resetModesClasses() {
    for (let i = 0; i < modes.children.length; i++) {
        modes.children[i].classList = '';
    }
}

function resetTimer() {
    timer.innerText =
        (cycles[0].minutes > 9 ?
            cycles[0].minutes : '0' + cycles[0].minutes) + ':00';
    phase.innerHTML = 'Ready to start';

    if (startButton.classList.contains('active')) {
        startButton.classList.remove('active');
    }

    resetSecondsInCycles();
    clearInterval(timerLoop);
    currentCycleIndex = 0;
    currentCycle = cycles[currentCycleIndex];
    isTimerActive = false;
}

function init() {
    if (isTimerPaused) {
        return;
    }

    for (let i = 0; i < cycles.length; i++) {
        let cycle = cycles[i];
        if (cycle == currentCycle) {
            if (cycle.currentSecond == 0 &&
                cycle.currentMinute == 0 &&
                currentCycleIndex == cycles.length - 1) {

                if (areNotificationsEnabled) {
                    // audio.play();

                    new Notification('Pomodoro', {
                        body: currentCycle.title + ' has passed.',
                        icon: 'images/tomato.png'
                    });
                }
                resetTimer();
                return;
            }

            if (cycle.currentSecond == 0 && cycle.currentMinute > 0) {
                cycle.currentSecond = 60;
                cycle.currentMinute--;
            } else if (
                cycle.currentSecond == 0 &&
                cycle.currentMinute == 0 &&
                currentCycleIndex < cycles.length) {

                if (areNotificationsEnabled) {
                    // audio.play();

                    new Notification('Pomodoro', {
                        body: currentCycle.title + ' has passed.',
                        icon: 'images/tomato.png'
                    });
                }

                cycle.currentMinute--;
                currentCycleIndex++;
                currentCycle = cycles[currentCycleIndex];
            }

            cycle.currentSecond--;
            phase.innerHTML = cycle.htmlTitle;
            timer.innerText =
                (cycle.currentMinute > 9 ?
                    cycle.currentMinute : '0' + cycle.currentMinute) + ':' +
                (cycle.currentSecond > 9 ?
                    cycle.currentSecond : '0' + cycle.currentSecond);
            let trayMessage = `${cycle.title} - ${isTimerPaused ? 'Paused' : 'Active'} \n${timer.innerText}`;
            ipc.send('updateTrayTimer', trayMessage);
        }
    }
}

function resetSecondsInCycles() {
    for (let i = 0; i < classicCycles.length; i++) {
        classicCycles[i].currentMinute = classicCycles[i].minutes;
        classicCycles[i].currentSecond = 0;
    }
    for (let i = 0; i < deepFocusCycles.length; i++) {
        deepFocusCycles[i].currentMinute = deepFocusCycles[i].minutes;
        deepFocusCycles[i].currentSecond = 0;
    }
}