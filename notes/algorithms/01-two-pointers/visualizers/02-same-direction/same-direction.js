// ===== State =====
const state = {
    arr: [],
    slow: 0,
    fast: 1,
    iteration: 0,
    done: false,
    playing: false,
    timer: null,
    currentLine: -1,
    runId: 0,
    pendingTimers: [],
    subStep: 'compare', // 'compare', 'skip', 'copy'
    newLength: 0
};

// ===== DOM Elements =====
const $ = id => document.getElementById(id);
const arrayInput = $('arrayInput');
const arrayViz = $('arrayViz');
const iterCount = $('iterCount');
const lengthCount = $('lengthCount');
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
    const length = Math.floor(Math.random() * 7) + 6; // 6-12 elements
    const arr = [];
    for (let i = 0; i < length; i++) {
        // Ensure duplicates by repeating values
        const value = Math.floor(Math.random() * 15) + 1;
        const repeat = Math.random() < 0.5 ? 1 : Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < repeat && arr.length < length; j++) {
            arr.push(value);
        }
    }
    return arr.sort((a, b) => a - b);
}

function clearPendingTimers() {
    state.pendingTimers.forEach(id => clearTimeout(id));
    state.pendingTimers = [];
}

// ===== Rendering =====
function renderArray() {
    const { arr, slow, fast, done, newLength } = state;

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

        // Valid region (deduplicated portion)
        if (index <= slow && !done) {
            classes.push('valid-region');
        }

        // Show pointers
        if (slow !== null && index === slow) {
            classes.push('active-slow', 'show-slow');
        }
        if (fast !== null && index === fast && fast < arr.length) {
            classes.push('active-fast', 'show-fast');
        }

        // Mark duplicates (cells beyond slow that have been checked)
        if (!done && fast > index && index > slow) {
            classes.push('duplicate');
        }

        // Completed state
        if (done) {
            if (index < newLength) {
                classes.push('valid-region');
            } else {
                classes.push('duplicate');
            }
        }

        return `
            <div class="${classes.join(' ')}">
                ${value}
                <span class="pointer slow">S</span>
                <span class="pointer fast">F</span>
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
                Slow pointer starts at index 0 (first element is always unique).
                Fast pointer starts at index 1 to begin searching for the next unique element.
            </div>
            <div class="calculation">
                <span class="highlight-slow">slow = 0</span>,
                <span class="highlight-fast">fast = 1</span>
                <br>
                Array has ${state.arr.length} elements
            </div>
        `,
        compare: () => {
            const slowVal = state.arr[state.slow];
            const fastVal = state.arr[state.fast];
            const isDuplicate = slowVal === fastVal;
            return `
                <div class="step-title">Comparing Values</div>
                <div class="step-detail">
                    Check if the element at fast is different from the element at slow.
                </div>
                <div class="calculation">
                    nums[<span class="highlight-slow">slow=${state.slow}</span>] vs nums[<span class="highlight-fast">fast=${state.fast}</span>]
                    <br>
                    <span class="highlight-slow">${slowVal}</span> ${isDuplicate ? '==' : '!='} <span class="highlight-fast">${fastVal}</span>
                </div>
                ${isDuplicate ?
                    '<div class="reason skip">Values are equal - this is a duplicate that should be skipped.</div>' :
                    '<div class="reason">Values are different - found a unique element to keep!</div>'
                }
            `;
        },
        skip: () => `
            <div class="step-title">Skip Duplicate</div>
            <div class="step-detail">
                Element at fast (${state.arr[state.fast]}) is a duplicate of slow (${state.arr[state.slow]}).
                Move fast forward to continue searching.
            </div>
            <div class="reason skip">
                Slow stays at ${state.slow}, fast moves from ${state.fast - 1} → ${state.fast}
                <br>
                We don't copy duplicates - just skip over them.
            </div>
        `,
        copy: (oldSlow) => `
            <div class="step-title">Copy Unique Element</div>
            <div class="step-detail">
                Found a unique element! Move slow forward and copy the value from fast.
            </div>
            <div class="calculation">
                1. <span class="highlight-slow">slow</span> moves: ${oldSlow} → ${state.slow}
                <br>
                2. Copy: nums[<span class="highlight-slow">${state.slow}</span>] = nums[<span class="highlight-fast">${state.fast}</span>] = ${state.arr[state.slow]}
                <br>
                3. <span class="highlight-fast">fast</span> continues forward
            </div>
            <div class="reason">
                The deduplicated array now has ${state.slow + 1} unique element(s).
            </div>
        `,
        complete: () => `
            <div class="step-title">Complete!</div>
            <div class="step-detail">
                All elements have been processed. The deduplicated array is in the first ${state.newLength} positions.
            </div>
            <div class="calculation">
                Original length: ${state.arr.length}
                <br>
                New length: <strong>${state.newLength}</strong>
                <br>
                Duplicates removed: ${state.arr.length - state.newLength}
            </div>
            <div class="reason found">
                Algorithm completed in O(n) time with O(1) extra space!
            </div>
        `,
        ready: () => `
            <div class="step-title">Ready to Start</div>
            <div class="step-detail">
                This algorithm removes duplicates from a sorted array in-place.
                The slow pointer marks where the next unique element should go,
                while the fast pointer scans ahead to find unique elements.
            </div>
        `
    };

    explanation.innerHTML = templates[type] ? templates[type](data) : templates.ready();
}

function setStatus(message, type = '') {
    statusBar.textContent = message;
    statusBar.className = 'status-bar' + (type ? ` ${type}` : '');
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
    lengthCount.textContent = state.done ? state.newLength : (state.slow + 1);
    updateButtons();
}

// ===== Algorithm =====
function initRun() {
    stopPlaying();
    clearPendingTimers();
    state.runId += 1;

    try {
        let arr = parseArray(arrayInput.value);

        if (arr.length === 0) {
            throw new Error('Array cannot be empty');
        }

        // Sort the array
        arr = [...arr].sort((a, b) => a - b);

        // Reset state
        Object.assign(state, {
            arr,
            slow: 0,
            fast: 1,
            iteration: 0,
            done: arr.length === 1,
            playing: false,
            timer: null,
            currentLine: 3,
            pendingTimers: [],
            subStep: 'compare',
            newLength: arr.length === 1 ? 1 : 0
        });

        if (arr.length === 1) {
            setStatus('Array has only 1 element - already unique!', 'success');
            renderExplanation('complete');
            renderPseudocode(8);
        } else {
            setStatus(`Loaded ${arr.length} elements. Click Step or Play.`, 'info');
            renderExplanation('init');
            renderPseudocode(3);
        }

        renderAll();
    } catch (e) {
        setStatus(e.message, 'error');
        Object.assign(state, {
            arr: [],
            slow: 0,
            fast: 1,
            iteration: 0,
            done: true,
            newLength: 0
        });
        renderAll();
    }
}

function step() {
    if (state.done || state.arr.length === 0) return;

    const { arr, slow, fast } = state;

    // Check if fast reached the end
    if (fast >= arr.length) {
        state.done = true;
        state.newLength = slow + 1;
        setStatus(`Complete! New length: ${state.newLength}`, 'success');
        renderExplanation('complete');
        renderPseudocode(8);
        renderAll();
        stopPlaying();
        return;
    }

    // Phase 1: Compare
    if (state.subStep === 'compare') {
        state.iteration++;
        renderPseudocode(5);
        renderExplanation('compare');
        setStatus(`Comparing: nums[${slow}]=${arr[slow]} vs nums[${fast}]=${arr[fast]}`, 'info');
        state.subStep = 'action';
        renderAll();
        return;
    }

    // Phase 2: Skip or Copy
    if (arr[fast] === arr[slow]) {
        // Skip duplicate
        state.fast++;
        renderPseudocode(4);
        renderExplanation('skip');
        setStatus(`Duplicate found. Fast moves to ${state.fast}`, 'info');
    } else {
        // Copy unique element
        const oldSlow = slow;
        state.slow++;
        state.arr[state.slow] = state.arr[fast];
        state.fast++;
        renderPseudocode(7);
        renderExplanation('copy', oldSlow);
        setStatus(`Unique element found! Copied to position ${state.slow}`, 'success');
    }

    // Reset to compare phase
    state.subStep = 'compare';

    // Check if done after move
    if (state.fast >= arr.length) {
        state.done = true;
        state.newLength = state.slow + 1;
        setStatus(`Complete! New length: ${state.newLength}`, 'success');
        renderExplanation('complete');
        renderPseudocode(8);
        stopPlaying();
    }

    renderAll();
}

function play() {
    if (state.arr.length === 0 || state.done) return;

    if (state.playing) {
        stopPlaying();
        setStatus('Paused. Click Step or Play to continue.', 'info');
        return;
    }

    state.playing = true;
    updateButtons();
    setStatus('Playing...', 'info');

    const tick = () => {
        if (!state.playing || state.done) {
            stopPlaying();
            return;
        }
        step();
        if (state.playing && !state.done) {
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

arrayInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});

// Initialize on load
speedValue.textContent = `${speedSlider.value}ms`;
initRun();
