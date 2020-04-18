let startButton = document.getElementById("start");
let pauseButton = document.getElementById("pause");
let resetButton = document.getElementById("reset");

let timer = document.getElementById("timer");
let phase = document.getElementById("phase");
let isTimerPaused = false;

class cycle {
    constructor(title, minutes) {
        this.title = title;
        this.minutes = minutes;
        this.currentMinute = minutes;
        this.currentSecond = 0;
    }
}

let cycles = [
    new cycle("<b><u>1st</u></b> Work Cycle", 1),
    new cycle("<b><u>Break</u></b> - 1st Work Cycle", 1),
    // new cycle("<b><u>2nd</u></b> Work Cycle", 25),
    // new cycle("<b><u>Break</u></b> - 2nd Work Cycle", 5),
    // new cycle("<b><u>3rd</u></b> Work Cycle", 25),
    // new cycle("<b><u>Break</u></b> - 3rd Work Cycle", 5),
    // new cycle("<b><u>4th</u></b> Work Cycle", 25),
    // new cycle("Long Break", 30),
];

let timerLoop;
let currentCycleIndex = 0;
let currentCycle = cycles[0];
timer.innerText = currentCycle.minutes + ":" + currentCycle.currentSecond;

startButton.addEventListener('click', () => {
    isTimerPaused = false;

    clearInterval(timerLoop);
    timerLoop = setInterval(init, 1000);
});

resetButton.addEventListener('click', () => {
    resetTimer();
});

pauseButton.addEventListener('click', () => {
    isTimerPaused = !isTimerPaused;
});

function resetTimer() {
    timer.innerText = cycles[0].minutes + ":00";
    phase.innerHTML = "READY TO START";

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

                currentCycleIndex++;
                currentCycle = cycles[currentCycleIndex];
            }

            cycle.currentSecond--;
            phase.innerHTML = cycle.title;
            timer.innerText = cycle.currentMinute + ":" + cycle.currentSecond;
        }
    }
}

function resetSecondsInCycles() {
    for (let i = 0; i < cycles.length; i++) {
        cycles[i].currentSecond = 60;
    }
}