// ===== State =====
const state = {
    arr: [],
    low: 0,
    mid: 0,
    high: 0,
    iteration: 0,
    done: false,
    playing: false,
    timer: null,
    currentLine: -1,
    runId: 0,
    pendingTimers: [],
    subStep: 'check', // 'check', 'swap', 'advance'
    lastSwap: null
};

// ===== DOM Elements =====
const $ = id => document.getElementById(id);
const arrayInput = $('arrayInput');
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
    if (nums.some(n => n !== 0 && n !== 1 && n !== 2)) {
        throw new Error('Array must only contain 0, 1, or 2');
    }
    return nums;
}

function generateRandomArray() {
    const length = Math.floor(Math.random() * 5) + 8; // 8-12 elements
    const arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(Math.floor(Math.random() * 3)); // 0, 1, or 2
    }
    // Ensure we have at least one of each value
    if (!arr.includes(0)) arr[0] = 0;
    if (!arr.includes(1)) arr[1] = 1;
    if (!arr.includes(2)) arr[2] = 2;
    return arr;
}

// ===== Rendering =====
function renderArray() {
    const { arr, low, mid, high, done, lastSwap } = state;

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

        // Color sections when done
        if (done) {
            if (value === 0) classes.push('section-zeros');
            else if (value === 1) classes.push('section-ones');
            else if (value === 2) classes.push('section-twos');
        } else {
            // Show partitioned sections as we go
            if (index < low) {
                classes.push('section-zeros');
            } else if (index > high) {
                classes.push('section-twos');
            } else if (index >= low && index < mid) {
                classes.push('section-ones');
            } else {
                classes.push('unprocessed');
            }

            // Highlight active pointers
            if (index === low) {
                classes.push('active-low', 'show-low');
            }
            if (index === mid) {
                classes.push('active-mid', 'show-mid');
            }
            if (index === high) {
                classes.push('active-high', 'show-high');
            }

            // Highlight recently swapped cells
            if (lastSwap && (index === lastSwap.i || index === lastSwap.j)) {
                classes.push('swapped');
            }
        }

        return `
            <div class="${classes.join(' ')}">
                ${value}
                <span class="pointer low">LOW</span>
                <span class="pointer mid">MID</span>
                <span class="pointer high">HIGH</span>
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
                Three pointers set to partition the array.
                <br><br>
                <strong>LOW</strong> marks the boundary for 0s (index 0).
                <br>
                <strong>MID</strong> is the current element being examined (index 0).
                <br>
                <strong>HIGH</strong> marks the boundary for 2s (index ${state.arr.length - 1}).
            </div>
            <div class="calculation">
                Goal: Partition into <span class="highlight-low">[0s]</span> <span class="highlight-mid">[1s]</span> <span class="highlight-high">[2s]</span>
            </div>
        `,
        check: () => {
            const value = state.arr[state.mid];
            return `
                <div class="step-title">Examining Element</div>
                <div class="step-detail">
                    Checking value at MID pointer to determine which section it belongs to.
                </div>
                <div class="calculation">
                    arr[<span class="highlight-mid">MID=${state.mid}</span>] = <strong>${value}</strong>
                    <br>
                    ${value === 0 ? '-> Belongs in 0s section (swap with LOW)' : ''}
                    ${value === 1 ? '-> Already in 1s section (just advance MID)' : ''}
                    ${value === 2 ? '-> Belongs in 2s section (swap with HIGH)' : ''}
                </div>
            `;
        },
        swapLow: () => {
            return `
                <div class="step-title">Swap with LOW</div>
                <div class="step-detail">
                    Found a <strong>0</strong>! It belongs in the 0s section at the left.
                </div>
                <div class="calculation">
                    Swap arr[<span class="highlight-low">LOW=${state.low - 1}</span>] <-> arr[<span class="highlight-mid">MID=${state.mid - 1}</span>]
                    <br>
                    Then increment both LOW and MID
                </div>
                <div class="reason swap-low">
                    After swap, we know the element at LOW is 0 (correct), and the element now at MID came from the 1s section (already verified), so we can safely advance both pointers.
                </div>
            `;
        },
        swapHigh: () => {
            return `
                <div class="step-title">Swap with HIGH</div>
                <div class="step-detail">
                    Found a <strong>2</strong>! It belongs in the 2s section at the right.
                </div>
                <div class="calculation">
                    Swap arr[<span class="highlight-mid">MID=${state.mid}</span>] <-> arr[<span class="highlight-high">HIGH=${state.high + 1}</span>]
                    <br>
                    Then decrement HIGH (but DON'T increment MID!)
                </div>
                <div class="reason swap-high">
                    Critical: The element we swapped from HIGH hasn't been examined yet. We must check it in the next iteration before advancing MID.
                </div>
            `;
        },
        advanceMid: () => {
            return `
                <div class="step-title">Advance MID</div>
                <div class="step-detail">
                    Found a <strong>1</strong>! It's already in the correct section (between LOW and HIGH).
                </div>
                <div class="calculation">
                    arr[<span class="highlight-mid">MID=${state.mid - 1}</span>] = 1
                    <br>
                    Just increment MID to continue
                </div>
                <div class="reason">
                    1s naturally accumulate between LOW and MID as we partition 0s to the left and 2s to the right.
                </div>
            `;
        },
        complete: () => {
            const zeros = state.arr.filter(x => x === 0).length;
            const ones = state.arr.filter(x => x === 1).length;
            const twos = state.arr.filter(x => x === 2).length;
            return `
                <div class="step-title">Partitioning Complete!</div>
                <div class="step-detail">
                    MID has crossed HIGH. Array is now partitioned into three sections.
                </div>
                <div class="calculation">
                    <span class="highlight-low">${zeros} zero(s)</span> |
                    <span class="highlight-mid">${ones} one(s)</span> |
                    <span class="highlight-high">${twos} two(s)</span>
                </div>
                <div class="reason complete">
                    The Dutch National Flag algorithm partitioned the array in O(n) time with O(1) space!
                </div>
            `;
        },
        ready: () => `
            <div class="step-title">Ready to Start</div>
            <div class="step-detail">
                This algorithm sorts an array of 0s, 1s, and 2s in-place.
                It uses three pointers to partition the array into three sections.
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

function updateButtons() {
    const canRun = state.arr.length >= 1 && !state.done;
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
        const arr = parseArray(arrayInput.value);

        // Reset state
        Object.assign(state, {
            arr,
            low: 0,
            mid: 0,
            high: arr.length - 1,
            iteration: 0,
            done: arr.length === 0,
            playing: false,
            timer: null,
            currentLine: 1,
            runId: currentRunId,
            pendingTimers: [],
            subStep: 'check',
            lastSwap: null
        });

        if (arr.length === 0) {
            setStatus('Array is empty', 'error');
            renderExplanation('ready');
            renderPseudocode(-1);
        } else {
            setStatus(`Loaded ${arr.length} elements. Click Step or Play.`, 'info');
            renderExplanation('init');
            renderPseudocode(1);
        }

        renderAll();
    } catch (e) {
        setStatus(e.message, 'error');
        Object.assign(state, {
            arr: [],
            low: 0,
            mid: 0,
            high: 0,
            iteration: 0,
            done: true
        });
        renderAll();
    }
}

function step() {
    if (state.done || state.arr.length === 0) return;

    const { arr, low, mid, high } = state;

    // Check termination
    if (mid > high) {
        state.done = true;
        setStatus('Array partitioned successfully!', 'success');
        renderExplanation('complete');
        renderPseudocode(-1);
        renderAll();
        stopPlaying();
        return;
    }

    const value = arr[mid];
    state.lastSwap = null;

    // Phase 1: Check current element
    if (state.subStep === 'check') {
        state.iteration++;
        renderPseudocode(6);
        renderExplanation('check');
        setStatus(`Checking arr[${mid}] = ${value}`, 'info');
        state.subStep = 'swap';
        renderAll();
        return;
    }

    // Phase 2: Swap or advance based on value
    if (value === 0) {
        // Swap with low
        [arr[low], arr[mid]] = [arr[mid], arr[low]];
        state.lastSwap = { i: low, j: mid };
        state.low++;
        state.mid++;
        setStatus(`Found 0! Swapped with LOW. Advancing both pointers.`, 'info');
        renderPseudocode(7);
        renderExplanation('swapLow');
    } else if (value === 2) {
        // Swap with high
        [arr[mid], arr[high]] = [arr[high], arr[mid]];
        state.lastSwap = { i: mid, j: high };
        state.high--;
        // Don't increment mid!
        setStatus(`Found 2! Swapped with HIGH. MID stays to check swapped element.`, 'info');
        renderPseudocode(11);
        renderExplanation('swapHigh');
    } else {
        // value === 1, just advance mid
        state.mid++;
        setStatus(`Found 1! Already in correct section. Advancing MID.`, 'info');
        renderPseudocode(15);
        renderExplanation('advanceMid');
    }

    // Reset to check phase for next iteration
    state.subStep = 'check';

    // Check if done after this step
    if (state.mid > state.high) {
        state.done = true;
        setStatus('Array partitioned successfully!', 'success');
        renderExplanation('complete');
        renderPseudocode(-1);
        renderAll();
        stopPlaying();
        return;
    }

    renderAll();
}

function play() {
    if (state.arr.length === 0 || state.done) return;
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
    arrayInput.value = arr.join(', ');
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

// Initialize on load
speedValue.textContent = `${speedSlider.value}ms`;
initRun();
