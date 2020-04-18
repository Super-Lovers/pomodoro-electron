let startButton = document.getElementById('start');
let pauseButton = document.getElementById('pause');
let resetButton = document.getElementById('reset');

let timer = document.getElementById('timer');
let phase = document.getElementById('phase');
let isTimerPaused = false;

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

let cycles = [
    new cycle('1st Work Cycle' ,'<b><u>1st</u></b> Work Cycle', 25),
    new cycle('Break - 1st Work Cycle', '<b><u>Break</u></b> - 1st Work Cycle', 5),
    new cycle('2nd Work Cycle', '<b><u>2nd</u></b> Work Cycle', 25),
    new cycle('Break - 2nd Work Cycle', '<b><u>Break</u></b> - 2nd Work Cycle', 5),
    new cycle('3rd Work Cycle', '<b><u>3rd</u></b> Work Cycle', 25),
    new cycle('Break - 3rd Work Cycle', '<b><u>Break</u></b> - 3rd Work Cycle', 5),
    new cycle('4th Work Cycle', '<b><u>4th</u></b> Work Cycle', 25),
    new cycle('Long Break', 'Long Break', 30),
];

let timerLoop;
let currentCycleIndex = 0;
let currentCycle = cycles[0];
timer.innerText =
    (currentCycle.currentMinute > 9 ?
        currentCycle.currentMinute : '0' + currentCycle.currentMinute) + ':' +
    (currentCycle.currentSecond > 9 ?
        currentCycle.currentSecond : '0' + currentCycle.currentSecond);

startButton.addEventListener('click', () => {
    isTimerPaused = false;
    if (pauseButton.classList.contains('active')) {
        pauseButton.classList.remove('active');
        pauseButton.innerText = 'Pause';
    }

    startButton.classList.add('active');

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
});

pauseButton.addEventListener('click', () => {
    isTimerPaused = !isTimerPaused;

    if (isTimerPaused) {
        pauseButton.innerText = 'Unpause';
        pauseButton.classList.add('active');
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
        }
    }
}

function resetSecondsInCycles() {
    for (let i = 0; i < cycles.length; i++) {
        cycles[i].currentSecond = 60;
    }
}