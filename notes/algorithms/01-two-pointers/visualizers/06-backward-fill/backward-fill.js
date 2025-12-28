// ===== State =====
const state = {
    nums1: [],
    nums2: [],
    m: 0,
    n: 0,
    p1: 0,
    p2: 0,
    write: 0,
    iteration: 0,
    done: false,
    playing: false,
    timer: null,
    currentLine: -1,
    runId: 0,
    pendingTimers: [],
    subStep: 'compare',
    lastComparison: null,
    lastWrite: null
};

// ===== DOM Elements =====
const $ = id => document.getElementById(id);
const nums1Input = $('nums1Input');
const nums2Input = $('nums2Input');
const arrayViz = $('arrayViz');
const nums2Reference = $('nums2Reference');
const nums2MiniArray = $('nums2MiniArray');
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

function isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < arr[i-1]) return false;
    }
    return true;
}

function generateRandomArrayPair() {
    const m = Math.floor(Math.random() * 4) + 2; // 2-5 elements
    const n = Math.floor(Math.random() * 4) + 2; // 2-5 elements

    const nums1Data = Array.from({ length: m }, () =>
        Math.floor(Math.random() * 15) + 1
    ).sort((a, b) => a - b);

    const nums2 = Array.from({ length: n }, () =>
        Math.floor(Math.random() * 15) + 1
    ).sort((a, b) => a - b);

    return { nums1Data, nums2 };
}

// ===== Rendering =====
function renderNums2Reference() {
    const { nums2, p2, done } = state;

    if (nums2.length === 0) {
        nums2Reference.style.display = 'none';
        return;
    }

    nums2Reference.style.display = 'flex';
    nums2Reference.className = 'nums2-reference' + (p2 < 0 ? ' exhausted' : '');

    nums2MiniArray.innerHTML = nums2.map((value, index) => {
        const classes = ['mini-cell'];
        if (index === p2) classes.push('active-p2');
        if (index > p2) classes.push('exhausted');

        return `
            <div class="${classes.join(' ')}">
                ${value}
                <span class="mini-pointer">P2</span>
            </div>
        `;
    }).join('');
}

function renderArray() {
    const { nums1, m, p1, write, done, lastWrite } = state;

    if (nums1.length === 0) {
        arrayViz.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h7" />
                </svg>
                <p>Enter two sorted arrays and click Load to begin</p>
            </div>
        `;
        return;
    }

    arrayViz.innerHTML = nums1.map((value, index) => {
        const classes = ['cell'];

        // Show extra space (unfilled positions)
        if (index >= m && value === 0 && !done) {
            classes.push('extra-space');
        }

        // Show filled positions (after write)
        if (index > write && !done) {
            classes.push('filled');
        }

        // Highlight active pointers
        if (index === p1 && p1 >= 0) {
            classes.push('p1-active', 'show-p1');
        }
        if (index === write) {
            classes.push('write-active', 'show-write');
        }

        // Highlight just written cell
        if (lastWrite && index === lastWrite.index) {
            classes.push('just-written');
        }

        const displayValue = (index >= m && value === 0 && !done) ? '_' : value;

        return `
            <div class="${classes.join(' ')}">
                ${displayValue}
                <span class="pointer p1">P1</span>
                <span class="pointer write">WRITE</span>
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
                Three pointers set for backward fill merge:
                <br><br>
                <strong>P1</strong> at last element of nums1 data (index ${state.m - 1}).
                <br>
                <strong>P2</strong> at last element of nums2 (index ${state.n - 1}).
                <br>
                <strong>WRITE</strong> at end of result space (index ${state.m + state.n - 1}).
            </div>
            <div class="calculation">
                Goal: Merge into <span class="highlight-write">[${state.m + state.n} total positions]</span>
            </div>
            <div class="reason">
                Why backward? Filling forward would overwrite unprocessed nums1 elements. Backward fill uses unused space!
            </div>
        `,
        compare: () => {
            const val1 = state.p1 >= 0 ? state.nums1[state.p1] : -Infinity;
            const val2 = state.nums2[state.p2];
            const chosen = val1 > val2 ? 'nums1' : 'nums2';
            const chosenVal = chosen === 'nums1' ? val1 : val2;

            return `
                <div class="step-title">Comparing Elements</div>
                <div class="step-detail">
                    Comparing elements from both ends to determine which goes to write position.
                </div>
                <div class="calculation">
                    ${state.p1 >= 0 ? `nums1[<span class="highlight-p1">P1=${state.p1}</span>] = <strong>${val1}</strong>` : '<em>nums1 exhausted</em>'}
                    <br>
                    nums2[<span class="highlight-p2">P2=${state.p2}</span>] = <strong>${val2}</strong>
                    <br><br>
                    -> Choose <strong>${chosenVal}</strong> from ${chosen}
                </div>
            `;
        },
        copyFromNums1: () => {
            return `
                <div class="step-title">Copy from nums1</div>
                <div class="step-detail">
                    nums1[P1] is larger! Write it to the write position.
                </div>
                <div class="calculation">
                    nums1[<span class="highlight-write">WRITE=${state.write + 1}</span>] = nums1[<span class="highlight-p1">P1=${state.p1 + 1}</span>] = <strong>${state.lastWrite.value}</strong>
                    <br>
                    Decrement P1 and WRITE
                </div>
                <div class="reason p1">
                    The larger value fills from the end. P1 moves left to next nums1 element.
                </div>
            `;
        },
        copyFromNums2: () => {
            return `
                <div class="step-title">Copy from nums2</div>
                <div class="step-detail">
                    ${state.p1 < 0 ? 'nums1 exhausted!' : 'nums2[P2] is larger or equal!'} Write it to the write position.
                </div>
                <div class="calculation">
                    nums1[<span class="highlight-write">WRITE=${state.write + 1}</span>] = nums2[<span class="highlight-p2">P2=${state.p2 + 1}</span>] = <strong>${state.lastWrite.value}</strong>
                    <br>
                    Decrement P2 and WRITE
                </div>
                <div class="reason p2">
                    The larger value fills from the end. P2 moves left to next nums2 element.
                </div>
            `;
        },
        complete: () => {
            return `
                <div class="step-title">Merge Complete!</div>
                <div class="step-detail">
                    All nums2 elements have been merged! The algorithm terminates when P2 < 0.
                </div>
                <div class="calculation">
                    Final result: [${state.nums1.join(', ')}]
                </div>
                <div class="reason complete">
                    Key insight: Remaining nums1 elements (if any) are already in their correct positions! No cleanup needed.
                    <br><br>
                    Time: O(m+n) | Space: O(1) in-place merge
                </div>
            `;
        },
        ready: () => `
            <div class="step-title">Ready to Start</div>
            <div class="step-detail">
                This algorithm merges two sorted arrays in-place using backward fill.
                By filling from the end, we avoid overwriting unprocessed elements.
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
    const canRun = state.nums1.length >= 1 && !state.done;
    btnStep.disabled = !canRun || state.playing;
    btnPlay.disabled = !canRun;
    btnReset.disabled = state.nums1.length === 0;
    btnPlay.textContent = state.playing ? 'Pause' : 'Play';
}

function renderAll() {
    renderArray();
    renderNums2Reference();
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
        const nums1Data = parseArray(nums1Input.value);
        const nums2Data = parseArray(nums2Input.value);

        // Validate sorted
        if (!isSorted(nums1Data)) {
            throw new Error('Array 1 must be sorted');
        }
        if (!isSorted(nums2Data)) {
            throw new Error('Array 2 must be sorted');
        }

        const m = nums1Data.length;
        const n = nums2Data.length;

        // Create nums1 with extra space
        const nums1 = [...nums1Data, ...Array(n).fill(0)];

        // Reset state
        Object.assign(state, {
            nums1,
            nums2: nums2Data,
            m,
            n,
            p1: m - 1,
            p2: n - 1,
            write: m + n - 1,
            iteration: 0,
            done: n === 0,
            playing: false,
            timer: null,
            currentLine: 1,
            runId: currentRunId,
            pendingTimers: [],
            subStep: 'compare',
            lastComparison: null,
            lastWrite: null
        });

        if (n === 0) {
            setStatus('nums2 is empty. No merge needed.', 'success');
            renderExplanation('complete');
            renderPseudocode(-1);
        } else {
            setStatus(`Loaded nums1 (m=${m}) and nums2 (n=${n}). Total space: ${m+n}. Click Step or Play.`, 'info');
            renderExplanation('init');
            renderPseudocode(1);
        }

        renderAll();
    } catch (e) {
        setStatus(e.message, 'error');
        Object.assign(state, {
            nums1: [],
            nums2: [],
            m: 0,
            n: 0,
            p1: 0,
            p2: 0,
            write: 0,
            iteration: 0,
            done: true
        });
        renderAll();
    }
}

function step() {
    if (state.done || state.nums1.length === 0) return;

    const { nums1, nums2, p1, p2, write } = state;

    // Check termination
    if (p2 < 0) {
        state.done = true;
        setStatus('Merge complete! All elements merged in sorted order.', 'success');
        renderExplanation('complete');
        renderPseudocode(-1);
        renderAll();
        stopPlaying();
        return;
    }

    state.lastWrite = null;

    // Phase 1: Compare
    if (state.subStep === 'compare') {
        state.iteration++;
        renderPseudocode(6);
        renderExplanation('compare');
        setStatus(`Comparing nums1[${p1}] vs nums2[${p2}]...`, 'info');
        state.subStep = 'copy';
        renderAll();
        return;
    }

    // Phase 2: Copy
    const val1 = p1 >= 0 ? nums1[p1] : -Infinity;
    const val2 = nums2[p2];

    if (val1 > val2) {
        // Copy from nums1
        nums1[write] = val1;
        state.lastWrite = { index: write, value: val1, from: 'nums1' };
        state.p1--;
        setStatus(`Wrote ${val1} from nums1. Decremented P1 and WRITE.`, 'info');
        renderPseudocode(7);
        renderExplanation('copyFromNums1');
    } else {
        // Copy from nums2
        nums1[write] = val2;
        state.lastWrite = { index: write, value: val2, from: 'nums2' };
        state.p2--;
        setStatus(`Wrote ${val2} from nums2. Decremented P2 and WRITE.`, 'info');
        renderPseudocode(10);
        renderExplanation('copyFromNums2');
    }

    state.write--;
    state.subStep = 'compare';

    // Check if done after this step
    if (state.p2 < 0) {
        state.done = true;
        setStatus('Merge complete! All elements merged in sorted order.', 'success');
        renderExplanation('complete');
        renderPseudocode(-1);
        renderAll();
        stopPlaying();
        return;
    }

    renderAll();
}

function play() {
    if (state.nums1.length === 0 || state.done) return;
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
    const { nums1Data, nums2 } = generateRandomArrayPair();
    nums1Input.value = nums1Data.join(', ');
    nums2Input.value = nums2.join(', ');
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
nums1Input.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});
nums2Input.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});

// Initialize on load
speedValue.textContent = `${speedSlider.value}ms`;
renderAll();
