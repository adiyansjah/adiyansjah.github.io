// ===== State =====
const state = {
    arr: [],
    target: 0,
    left: null,
    right: null,
    iteration: 0,
    found: false,
    done: false,
    foundPair: null,
    playing: false,
    timer: null,
    currentLine: -1,
    runId: 0,
    pendingTimers: [],
    subStep: 'check' // 'check' or 'move'
};

// ===== DOM Elements =====
const $ = id => document.getElementById(id);
const arrayInput = $('arrayInput');
const targetInput = $('targetInput');
const arrayViz = $('arrayViz');
const iterCount = $('iterCount');
const statusBar = $('statusBar');
const pseudocode = $('pseudocode');
const explanation = $('explanation');
const btnLoad = $('btnLoad');
const btnRandom = $('btnRandom');
const btnStep = $('btnStep');
const btnPlay = $('btnPlay');
const btnReset = $('btnReset');
const speedSlider = $('speedSlider');
const speedValue = $('speedValue');

// ===== Utilities =====
function parseArray(text) {
    const parts = text.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return [];
    const nums = parts.map(p => Number(p));
    if (nums.some(n => isNaN(n))) {
        throw new Error('Array contains non-numeric values');
    }
    return nums;
}

function generateRandomArray() {
    const length = Math.floor(Math.random() * 6) + 5; // 5-10 elements
    const arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(Math.floor(Math.random() * 30) + 1);
    }
    return [...new Set(arr)].sort((a, b) => a - b);
}

function generateTarget(arr) {
    if (arr.length < 2) return 0;
    // 70% chance to pick a valid pair
    if (Math.random() < 0.7) {
        const i = Math.floor(Math.random() * (arr.length - 1));
        const j = Math.floor(Math.random() * (arr.length - i - 1)) + i + 1;
        return arr[i] + arr[j];
    }
    return Math.floor(Math.random() * 50) + 1;
}

// ===== Rendering =====
function renderArray() {
    const { arr, left, right, foundPair, done } = state;

    if (arr.length === 0) {
        arrayViz.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h7" />
                </svg>
                <p>Enter an array and click Load to begin</p>
            </div>
        `;
        return;
    }

    arrayViz.innerHTML = arr.map((value, index) => {
        const classes = ['cell'];

        if (foundPair && (index === foundPair.left || index === foundPair.right)) {
            classes.push('found');
        } else {
            if (left !== null && index === left) {
                classes.push('active-l', 'show-l');
            }
            if (right !== null && index === right) {
                classes.push('active-r', 'show-r');
            }
            // Mark eliminated cells
            if (done && !foundPair) {
                classes.push('eliminated');
            } else if (left !== null && right !== null) {
                if (index < left || index > right) {
                    classes.push('eliminated');
                }
            }
        }

        return `
            <div class="${classes.join(' ')}">
                ${value}
                <span class="pointer left">L</span>
                <span class="pointer right">R</span>
            </div>
        `;
    }).join('');
}

function renderPseudocode(line) {
    const lines = pseudocode.querySelectorAll('.code-line');
    lines.forEach(el => {
        el.classList.remove('highlight');
        if (parseInt(el.dataset.line) === line) {
            el.classList.add('highlight');
        }
    });
}

function renderExplanation(type, data = {}) {
    const templates = {
        init: () => `
            <div class="step-title">Initialized</div>
            <div class="step-detail">
                Pointers set to opposite ends of the sorted array.
                <br><br>
                <strong>L</strong> points to the smallest value (index 0).
                <br>
                <strong>R</strong> points to the largest value (index ${state.arr.length - 1}).
            </div>
            <div class="calculation">
                Target sum: <strong>${state.target}</strong>
            </div>
        `,
        check: () => {
            const sum = state.arr[state.left] + state.arr[state.right];
            const comparison = sum === state.target ? '=' : (sum < state.target ? '<' : '>');
            return `
                <div class="step-title">Checking Sum</div>
                <div class="step-detail">
                    Comparing current sum with target.
                </div>
                <div class="calculation">
                    arr[<span class="highlight-l">L=${state.left}</span>] + arr[<span class="highlight-r">R=${state.right}</span>]
                    <br>
                    = <span class="highlight-l">${state.arr[state.left]}</span> + <span class="highlight-r">${state.arr[state.right]}</span>
                    <br>
                    = <strong>${sum}</strong> ${comparison} ${state.target}
                </div>
            `;
        },
        moveLeft: (oldLeft) => {
            const oldSum = state.arr[oldLeft] + state.arr[state.right];
            return `
                <div class="step-title">Move L Right</div>
                <div class="step-detail">
                    Sum <strong>${oldSum}</strong> is less than target <strong>${state.target}</strong>.
                </div>
                <div class="reason">
                    Since the array is sorted, moving L right increases the sum.
                    We need a larger sum, so L moves from ${oldLeft} to ${state.left}.
                </div>
            `;
        },
        moveRight: (oldRight) => {
            const oldSum = state.arr[state.left] + state.arr[oldRight];
            return `
                <div class="step-title">Move R Left</div>
                <div class="step-detail">
                    Sum <strong>${oldSum}</strong> is greater than target <strong>${state.target}</strong>.
                </div>
                <div class="reason move-r">
                    Since the array is sorted, moving R left decreases the sum.
                    We need a smaller sum, so R moves from ${oldRight} to ${state.right}.
                </div>
            `;
        },
        found: () => `
            <div class="step-title">Pair Found!</div>
            <div class="step-detail">
                Found two numbers that sum to <strong>${state.target}</strong>.
            </div>
            <div class="calculation">
                arr[<span class="highlight-l">${state.foundPair.left}</span>] + arr[<span class="highlight-r">${state.foundPair.right}</span>]
                <br>
                = <span class="highlight-l">${state.arr[state.foundPair.left]}</span> + <span class="highlight-r">${state.arr[state.foundPair.right]}</span>
                <br>
                = <strong>${state.target}</strong>
            </div>
            <div class="reason found">
                The algorithm terminates with the solution in O(n) time!
            </div>
        `,
        notFound: () => `
            <div class="step-title">No Pair Found</div>
            <div class="step-detail">
                Pointers have crossed (L >= R). The search space is exhausted.
            </div>
            <div class="reason move-r">
                No two numbers in this array sum to ${state.target}.
                The algorithm explored all possibilities in O(n) time.
            </div>
        `,
        ready: () => `
            <div class="step-title">Ready to Start</div>
            <div class="step-detail">
                This algorithm finds two numbers that add up to a target sum.
                It uses two pointers starting at opposite ends of a sorted array.
            </div>
        `
    };

    explanation.innerHTML = templates[type] ? templates[type](data) : templates.ready();
}

function setStatus(message, type = '') {
    statusBar.textContent = message;
    statusBar.className = 'status-bar' + (type ? ` ${type}` : '');
}

function clearPendingTimers() {
    state.pendingTimers.forEach(id => clearTimeout(id));
    state.pendingTimers = [];
}

function schedule(fn, delay) {
    const id = setTimeout(fn, delay);
    state.pendingTimers.push(id);
    return id;
}

function updateButtons() {
    const canRun = state.arr.length >= 2 && !state.done;
    btnStep.disabled = !canRun || state.playing;
    btnPlay.disabled = !canRun;
    btnReset.disabled = state.arr.length === 0;
    btnPlay.textContent = state.playing ? 'Pause' : 'Play';
}

function renderAll() {
    renderArray();
    iterCount.textContent = state.iteration;
    updateButtons();
}

// ===== Algorithm =====
function initRun() {
    stopPlaying();
    clearPendingTimers();
    state.runId += 1;
    const currentRunId = state.runId;

    try {
        let arr = parseArray(arrayInput.value);
        const target = Number(targetInput.value);

        if (isNaN(target)) {
            throw new Error('Target must be a number');
        }

        // Sort the array
        arr = [...arr].sort((a, b) => a - b);

        // Reset state
        Object.assign(state, {
            arr,
            target,
            left: arr.length >= 2 ? 0 : null,
            right: arr.length >= 2 ? arr.length - 1 : null,
            iteration: 0,
            found: false,
            done: arr.length < 2,
            foundPair: null,
            playing: false,
            timer: null,
            currentLine: 1,
            runId: currentRunId,
            pendingTimers: [],
            subStep: 'check'
        });

        if (arr.length < 2) {
            setStatus('Array needs at least 2 elements', 'error');
            renderExplanation('ready');
            renderPseudocode(-1);
        } else {
            setStatus(`Loaded ${arr.length} elements. Target: ${target}. Click Step or Play.`, 'info');
            renderExplanation('init');
            renderPseudocode(1);
        }

        renderAll();
    } catch (e) {
        setStatus(e.message, 'error');
        Object.assign(state, {
            arr: [],
            target: 0,
            left: null,
            right: null,
            iteration: 0,
            found: false,
            done: true,
            foundPair: null
        });
        renderAll();
    }
}

function step() {
    if (state.done || state.arr.length < 2) return;

    const { arr, target, left, right } = state;

    // Check termination
    if (left >= right) {
        state.done = true;
        state.found = false;
        setStatus('Pointers crossed. No pair found.', 'error');
        renderExplanation('notFound');
        renderPseudocode(10);
        renderAll();
        stopPlaying();
        return;
    }

    const leftVal = arr[left];
    const rightVal = arr[right];
    const sum = leftVal + rightVal;

    // Phase 1: Check sum
    if (state.subStep === 'check') {
        state.iteration++;
        renderPseudocode(3);
        renderExplanation('check');
        setStatus(`Checking: ${leftVal} + ${rightVal} = ${sum}`, 'info');
        state.subStep = 'move';
        renderAll();
        return;
    }

    // Phase 2: Move pointer based on comparison
    if (sum === target) {
        // Found!
        state.found = true;
        state.done = true;
        state.foundPair = { left, right };
        setStatus(`Found! ${leftVal} + ${rightVal} = ${target}`, 'success');
        renderPseudocode(5);
        renderExplanation('found');
        renderAll();
        stopPlaying();
        return;
    }

    if (sum < target) {
        // Move left pointer right
        const oldLeft = left;
        state.left = left + 1;
        setStatus(`Sum ${sum} < ${target}. Moving L right.`, 'info');
        renderPseudocode(7);
        renderExplanation('moveLeft', oldLeft);
    } else {
        // Move right pointer left
        const oldRight = right;
        state.right = right - 1;
        setStatus(`Sum ${sum} > ${target}. Moving R left.`, 'info');
        renderPseudocode(9);
        renderExplanation('moveRight', oldRight);
    }

    // Reset to check phase for next iteration
    state.subStep = 'check';

    // Check if pointers crossed after move
    if (state.left >= state.right) {
        state.done = true;
        state.found = false;
        setStatus('Search exhausted. No pair found.', 'error');
        renderExplanation('notFound');
        renderPseudocode(10);
        renderAll();
        stopPlaying();
        return;
    }

    renderAll();
}

function play() {
    if (state.arr.length < 2 || state.done) return;
    const currentRunId = state.runId;

    if (state.playing) {
        stopPlaying();
        setStatus('Paused. Click Step or Play to continue.', 'info');
        return;
    }

    state.playing = true;
    updateButtons();
    setStatus('Playing...', 'info');

    const tick = () => {
        if (!state.playing || state.done || state.runId !== currentRunId) {
            stopPlaying();
            return;
        }
        step();
        if (state.playing && !state.done && state.runId === currentRunId) {
            const delay = Number(speedSlider.value);
            state.timer = setTimeout(tick, delay);
        }
    };

    state.timer = setTimeout(tick, Number(speedSlider.value));
}

function stopPlaying() {
    state.playing = false;
    if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
    }
    updateButtons();
}

function reset() {
    stopPlaying();
    initRun();
}

function loadRandom() {
    const arr = generateRandomArray();
    const target = generateTarget(arr);
    arrayInput.value = arr.join(', ');
    targetInput.value = target;
    initRun();
}

// ===== Event Listeners =====
btnLoad.addEventListener('click', initRun);
btnRandom.addEventListener('click', loadRandom);
btnStep.addEventListener('click', step);
btnPlay.addEventListener('click', play);
btnReset.addEventListener('click', reset);

speedSlider.addEventListener('input', () => {
    speedValue.textContent = `${speedSlider.value}ms`;
});

// Allow Enter key to load
arrayInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});
targetInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});

// Initialize on load
speedValue.textContent = `${speedSlider.value}ms`;
initRun();
