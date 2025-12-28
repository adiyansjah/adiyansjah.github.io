// ===== State =====
const state = {
    arr1: [],
    arr2: [],
    merged: [],
    i: 0,
    j: 0,
    k: 0,
    iteration: 0,
    done: false,
    phase: 'mainLoop',
    subStep: 'compare',
    playing: false,
    timer: null,
    runId: 0,
    pendingTimers: [],
    currentLine: -1,
    lastComparison: null,
    lastCopy: null
};

// ===== DOM Elements =====
const $ = id => document.getElementById(id);
const array1Input = $('array1Input');
const array2Input = $('array2Input');
const array1Viz = $('array1Viz');
const array2Viz = $('array2Viz');
const mergedViz = $('mergedViz');
const iterCount = $('iterCount');
const mergedLength = $('mergedLength');
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

function generateRandomArrayPair() {
    const len1 = Math.floor(Math.random() * 5) + 3;
    const len2 = Math.floor(Math.random() * 5) + 3;

    const arr1 = Array.from({ length: len1 }, () =>
        Math.floor(Math.random() * 20) + 1
    ).sort((a, b) => a - b);

    const arr2 = Array.from({ length: len2 }, () =>
        Math.floor(Math.random() * 20) + 1
    ).sort((a, b) => a - b);

    return { arr1, arr2 };
}

// ===== Rendering =====
function renderSingleArray(arr, containerId, activeIndex, pointerLabel, arrayType) {
    const container = $(containerId);

    if (arr.length === 0) {
        container.innerHTML = '<div class="empty-cell">Empty</div>';
        return;
    }

    container.innerHTML = arr.map((value, index) => {
        const classes = ['cell'];

        if (index === activeIndex && activeIndex < arr.length) {
            classes.push(`active-${pointerLabel}`, `show-${pointerLabel}`);
        }

        if (index < activeIndex) {
            classes.push('exhausted');
        }

        if (state.subStep === 'compare' && index === activeIndex && state.phase === 'mainLoop') {
            classes.push('comparing');
        }

        if (state.subStep === 'copy' && index === activeIndex &&
            state.lastComparison?.chosen === arrayType && state.phase === 'mainLoop') {
            classes.push('copying');
        }

        return `
            <div class="${classes.join(' ')}">
                ${value}
                <span class="pointer ${pointerLabel}">${pointerLabel.toUpperCase()}</span>
            </div>
        `;
    }).join('');
}

function renderMergedArray() {
    const container = mergedViz;

    if (state.merged.length === 0) {
        container.innerHTML = '<div class="empty-cell">Empty - waiting for merge</div>';
        return;
    }

    const totalExpected = state.arr1.length + state.arr2.length;
    const cells = [];

    for (let idx = 0; idx < state.merged.length; idx++) {
        const classes = ['cell', 'completed'];

        if (idx === state.merged.length - 1 && state.lastCopy) {
            classes.push('copying');
        }

        cells.push(`
            <div class="${classes.join(' ')}">
                ${state.merged[idx]}
            </div>
        `);
    }

    if (!state.done && state.merged.length < totalExpected) {
        cells.push(`
            <div class="cell active-k show-k">
                ?
                <span class="pointer k">K</span>
            </div>
        `);
    }

    for (let idx = state.merged.length + 1; idx < totalExpected; idx++) {
        cells.push(`<div class="cell placeholder">?</div>`);
    }

    container.innerHTML = cells.join('');
}

function renderArrays() {
    renderSingleArray(state.arr1, 'array1Viz', state.i, 'i', 'arr1');
    renderSingleArray(state.arr2, 'array2Viz', state.j, 'j', 'arr2');
    renderMergedArray();
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
                Two pointers (i, j) start at the beginning of each array.
                Pointer k tracks where to write in the merged result.
            </div>
            <div class="calculation">
                i = 0 (arr1), j = 0 (arr2), k = 0 (merged)
                <br>
                arr1: ${state.arr1.length} elements
                <br>
                arr2: ${state.arr2.length} elements
                <br>
                Expected merged: ${state.arr1.length + state.arr2.length} elements
            </div>
        `,

        compare: () => {
            const val1 = state.arr1[state.i];
            const val2 = state.arr2[state.j];
            const chosen = state.lastComparison.chosen;

            return `
                <div class="step-title">Comparing Values</div>
                <div class="step-detail">
                    Compare current elements from both arrays to find the smaller one.
                </div>
                <div class="calculation">
                    arr1[<span class="highlight-arr1">i=${state.i}</span>] = <span class="highlight-arr1">${val1}</span>
                    <br>
                    arr2[<span class="highlight-arr2">j=${state.j}</span>] = <span class="highlight-arr2">${val2}</span>
                    <br>
                    ${val1 <= val2 ? `${val1} <= ${val2}` : `${val2} < ${val1}`}
                </div>
                <div class="reason ${chosen === 'arr2' ? 'arr2' : ''}">
                    Choose ${chosen === 'arr1' ? `arr1[${state.i}] = ${val1}` : `arr2[${state.j}] = ${val2}`}
                    as it's smaller${val1 === val2 ? ' (or equal)' : ''}.
                </div>
            `;
        },

        copy: (chosen) => {
            const copy = state.lastCopy;
            return `
                <div class="step-title">Copy to Merged</div>
                <div class="step-detail">
                    Copy the smaller value to the merged array and advance pointers.
                </div>
                <div class="calculation">
                    merged[<span class="highlight-merged">k=${copy.toIndex}</span>] = ${copy.value}
                    <br>
                    ${chosen === 'arr1' ? `i: ${state.i - 1} -> ${state.i}` : `j: ${state.j - 1} -> ${state.j}`}
                    <br>
                    k: ${state.k - 1} -> ${state.k}
                </div>
                <div class="reason found">
                    Merged array now has ${state.merged.length} element(s).
                </div>
            `;
        },

        cleanupArr1: () => `
            <div class="step-title">Copy Remaining from Array 1</div>
            <div class="step-detail">
                Array 2 is exhausted. Copy all remaining elements from Array 1.
            </div>
            <div class="calculation">
                Copying arr1[${state.i - 1}] = ${state.lastCopy.value}
                <br>
                Remaining in arr1: ${state.arr1.length - state.i} elements
            </div>
        `,

        cleanupArr2: () => `
            <div class="step-title">Copy Remaining from Array 2</div>
            <div class="step-detail">
                Array 1 is exhausted. Copy all remaining elements from Array 2.
            </div>
            <div class="calculation">
                Copying arr2[${state.j - 1}] = ${state.lastCopy.value}
                <br>
                Remaining in arr2: ${state.arr2.length - state.j} elements
            </div>
        `,

        complete: () => `
            <div class="step-title">Merge Complete!</div>
            <div class="step-detail">
                All elements from both arrays have been merged in sorted order.
            </div>
            <div class="calculation">
                Original arrays: ${state.arr1.length} + ${state.arr2.length} = ${state.arr1.length + state.arr2.length}
                <br>
                Merged result: ${state.merged.length} elements
                <br>
                Merged: [${state.merged.join(', ')}]
            </div>
            <div class="reason found">
                Algorithm completed in O(n + m) time with O(n + m) space!
            </div>
        `,

        ready: () => `
            <div class="step-title">Ready to Start</div>
            <div class="step-detail">
                This algorithm merges two sorted arrays into one sorted array.
                It uses two pointers, one for each array, to compare elements.
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
    const canRun = (state.arr1.length > 0 || state.arr2.length > 0) && !state.done;
    btnStep.disabled = !canRun || state.playing;
    btnPlay.disabled = !canRun;
    btnReset.disabled = state.arr1.length === 0 && state.arr2.length === 0;
    btnPlay.textContent = state.playing ? 'Pause' : 'Play';
}

function renderAll() {
    renderArrays();
    iterCount.textContent = state.iteration;
    mergedLength.textContent = state.merged.length;
    updateButtons();
}

// ===== Algorithm =====
function initRun() {
    stopPlaying();
    state.runId += 1;

    try {
        const arr1 = parseArray(array1Input.value);
        const arr2 = parseArray(array2Input.value);

        if (arr1.length === 0 && arr2.length === 0) {
            throw new Error('At least one array must have elements');
        }

        const sortedArr1 = [...arr1].sort((a, b) => a - b);
        const sortedArr2 = [...arr2].sort((a, b) => a - b);

        let initialPhase = 'mainLoop';
        if (sortedArr1.length === 0) initialPhase = 'cleanup2';
        else if (sortedArr2.length === 0) initialPhase = 'cleanup1';

        Object.assign(state, {
            arr1: sortedArr1,
            arr2: sortedArr2,
            merged: [],
            i: 0,
            j: 0,
            k: 0,
            iteration: 0,
            done: false,
            phase: initialPhase,
            subStep: 'compare',
            playing: false,
            currentLine: 1,
            lastComparison: null,
            lastCopy: null
        });

        setStatus(`Loaded: ${sortedArr1.length} + ${sortedArr2.length} elements. Click Step or Play.`, 'info');
        renderExplanation('init');
        renderPseudocode(1);
        renderAll();

    } catch (e) {
        setStatus(e.message, 'error');
        Object.assign(state, {
            arr1: [],
            arr2: [],
            merged: [],
            i: 0,
            j: 0,
            k: 0,
            iteration: 0,
            done: true
        });
        renderAll();
    }
}

function step() {
    if (state.done) return;

    // Phase 1: Main merge loop
    if (state.phase === 'mainLoop') {
        if (state.i >= state.arr1.length || state.j >= state.arr2.length) {
            if (state.i < state.arr1.length) {
                state.phase = 'cleanup1';
            } else if (state.j < state.arr2.length) {
                state.phase = 'cleanup2';
            } else {
                state.phase = 'complete';
                state.done = true;
                renderComplete();
                return;
            }
            renderAll();
            return;
        }

        if (state.subStep === 'compare') {
            const val1 = state.arr1[state.i];
            const val2 = state.arr2[state.j];

            state.lastComparison = {
                arr1Val: val1,
                arr2Val: val2,
                chosen: val1 <= val2 ? 'arr1' : 'arr2'
            };

            state.iteration++;
            renderPseudocode(4);
            renderExplanation('compare');
            setStatus(`Comparing: arr1[${state.i}]=${val1} vs arr2[${state.j}]=${val2}`, 'info');

            state.subStep = 'copy';
            renderAll();
            return;
        }

        if (state.subStep === 'copy') {
            const chosen = state.lastComparison.chosen;

            if (chosen === 'arr1') {
                const val = state.arr1[state.i];
                state.merged.push(val);
                state.lastCopy = { value: val, from: 'arr1', toIndex: state.k };
                state.i++;
                renderPseudocode(5);
            } else {
                const val = state.arr2[state.j];
                state.merged.push(val);
                state.lastCopy = { value: val, from: 'arr2', toIndex: state.k };
                state.j++;
                renderPseudocode(8);
            }

            state.k++;
            renderExplanation('copy', chosen);
            setStatus(`Copied ${state.lastCopy.value} to merged[${state.lastCopy.toIndex}]`, 'success');

            state.subStep = 'compare';
            renderAll();
            return;
        }
    }

    // Phase 2: Cleanup arr1
    if (state.phase === 'cleanup1') {
        if (state.i >= state.arr1.length) {
            state.phase = 'complete';
            state.done = true;
            renderComplete();
            return;
        }

        const val = state.arr1[state.i];
        state.merged.push(val);
        state.lastCopy = { value: val, from: 'arr1', toIndex: state.k };
        state.i++;
        state.k++;

        renderPseudocode(11);
        renderExplanation('cleanupArr1');
        setStatus(`Copying remaining arr1[${state.i - 1}]=${val}`, 'info');
        renderAll();
        return;
    }

    // Phase 3: Cleanup arr2
    if (state.phase === 'cleanup2') {
        if (state.j >= state.arr2.length) {
            state.phase = 'complete';
            state.done = true;
            renderComplete();
            return;
        }

        const val = state.arr2[state.j];
        state.merged.push(val);
        state.lastCopy = { value: val, from: 'arr2', toIndex: state.k };
        state.j++;
        state.k++;

        renderPseudocode(14);
        renderExplanation('cleanupArr2');
        setStatus(`Copying remaining arr2[${state.j - 1}]=${val}`, 'info');
        renderAll();
        return;
    }
}

function renderComplete() {
    setStatus('Merge complete! All elements merged in sorted order.', 'success');
    renderExplanation('complete');
    renderPseudocode(16);
    renderAll();
    stopPlaying();
}

function play() {
    if (state.done || (state.arr1.length === 0 && state.arr2.length === 0)) return;

    if (state.playing) {
        stopPlaying();
        setStatus('Paused. Click Step or Play to continue.', 'info');
        return;
    }

    state.playing = true;
    updateButtons();
    setStatus('Playing...', 'info');

    const currentRunId = state.runId;
    const tick = () => {
        if (!state.playing || state.done || state.runId !== currentRunId) {
            stopPlaying();
            return;
        }
        step();
        if (state.playing && !state.done && state.runId === currentRunId) {
            state.timer = setTimeout(tick, Number(speedSlider.value));
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
    const { arr1, arr2 } = generateRandomArrayPair();
    array1Input.value = arr1.join(', ');
    array2Input.value = arr2.join(', ');
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

array1Input.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});
array2Input.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});

// Initialize on load
speedValue.textContent = `${speedSlider.value}ms`;
initRun();
