// ===== State =====
const state = {
    str: "",
    centerIndex: 0,
    mode: 'odd',
    left: null,
    right: null,
    longestStart: 0,
    longestEnd: 0,
    longestLength: 1,
    currentStart: null,
    currentEnd: null,
    currentLength: 0,
    phase: 'init',
    subStep: 'compare',
    iteration: 0,
    done: false,
    playing: false,
    timer: null,
    runId: 0,
    pendingTimers: []
};

// ===== DOM Elements =====
const $ = id => document.getElementById(id);
const stringInput = $('stringInput');
const stringViz = $('stringViz');
const modeBadge = $('modeBadge');
const trackingInfo = $('trackingInfo');
const centerProgress = $('centerProgress');
const modeText = $('modeText');
const longestText = $('longestText');
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
function clearPendingTimers() {
    state.pendingTimers.forEach(id => clearTimeout(id));
    state.pendingTimers = [];
}

function generateRandomString() {
    const length = Math.floor(Math.random() * 5) + 6;
    const chars = 'abcdefgh';

    if (Math.random() < 0.4) {
        const palindromes = ['aba', 'abba', 'noon', 'deed', 'level'];
        const pal = palindromes[Math.floor(Math.random() * palindromes.length)];
        const padding = Math.max(0, length - pal.length);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;

        let result = '';
        for (let i = 0; i < leftPad; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        result += pal;
        for (let i = 0; i < rightPad; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result.substring(0, length);
    }

    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// ===== Rendering =====
function renderString() {
    const { str, left, right, centerIndex, mode, phase, longestStart, longestEnd } = state;

    if (str.length === 0) {
        stringViz.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h7" />
                </svg>
                <p>Enter a string and click Load to begin</p>
            </div>
        `;
        return;
    }

    stringViz.innerHTML = str.split('').map((char, index) => {
        const classes = ['cell'];

        // Center highlight
        if (phase === 'select_center' || phase === 'expand') {
            if (mode === 'odd' && index === centerIndex) {
                classes.push('center', 'show-center');
            } else if (mode === 'even' && (index === centerIndex || index === centerIndex + 1)) {
                classes.push('center', 'show-center');
            }
        }

        // Pointer highlights
        if (left !== null && index === left) {
            classes.push('active-l', 'show-l');
        }
        if (right !== null && index === right) {
            classes.push('active-r', 'show-r');
        }

        // Matching region
        if (phase === 'expand' && left !== null && right !== null && index > left && index < right) {
            classes.push('matching');
        }

        // Longest palindrome highlight
        if (phase === 'complete' && index >= longestStart && index <= longestEnd) {
            classes.push('longest');
        }

        // Inactive regions
        if (phase === 'expand' && left !== null && right !== null && (index < left || index > right)) {
            classes.push('inactive');
        }

        return `
            <div class="${classes.join(' ')}">
                ${char}
                <span class="pointer center">C</span>
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
            <div class="step-title">Ready to Start</div>
            <div class="step-detail">
                We'll try each position as a potential palindrome center.
                For each center, we test both odd-length (single center) and
                even-length (double center) palindromes.
            </div>
            <div class="calculation">
                String: "${state.str}"<br>
                Length: ${state.str.length}<br>
                Total tests: ${state.str.length * 2}
            </div>
        `,

        selectCenter: () => {
            const modeText = state.mode === 'odd'
                ? 'Odd-length (single center)'
                : 'Even-length (double center)';
            const initText = state.mode === 'odd'
                ? `L = R = ${state.centerIndex}`
                : `L = ${state.centerIndex}, R = ${state.centerIndex + 1}`;
            const chars = state.mode === 'odd'
                ? `'${state.str[state.left]}'`
                : `'${state.str[state.left]}' and '${state.str[state.right]}'`;

            return `
                <div class="step-title">Select Center</div>
                <div class="step-detail">
                    Testing position ${state.centerIndex} as center.<br>
                    <strong>${modeText}</strong>
                </div>
                <div class="calculation">
                    ${initText}<br>
                    Starting character(s): ${chars}
                </div>
            `;
        },

        expandMatch: () => `
            <div class="step-title">Characters Match!</div>
            <div class="step-detail">
                s[<span class="highlight-l">L=${state.left}</span>] ==
                s[<span class="highlight-r">R=${state.right}</span>]
            </div>
            <div class="calculation">
                '<span class="highlight-l">${state.str[state.left]}</span>' ==
                '<span class="highlight-r">${state.str[state.right]}</span>' ✓
            </div>
            <div class="reason found">
                Valid palindrome continues! Moving L left and R right.
            </div>
        `,

        expandStop: (data) => {
            const reason = data.reason === 'mismatch'
                ? `Characters don't match: '${state.str[state.left]}' ≠ '${state.str[state.right]}'`
                : 'Reached string boundary';

            return `
                <div class="step-title">Stop Expanding</div>
                <div class="step-detail">
                    ${reason}
                </div>
                <div class="reason mismatch">
                    Palindrome ends here. Recording result...
                </div>
            `;
        },

        newLongest: () => {
            const palindrome = state.str.substring(state.longestStart, state.longestEnd + 1);
            return `
                <div class="step-title">New Longest Palindrome!</div>
                <div class="step-detail">
                    Found: <strong>"${palindrome}"</strong>
                </div>
                <div class="calculation">
                    Start: ${state.longestStart}, End: ${state.longestEnd}<br>
                    Length: <strong>${state.longestLength}</strong> (new record!)
                </div>
                <div class="reason found">
                    This is now the longest palindrome found so far.
                </div>
            `;
        },

        notLonger: () => {
            const palindrome = state.str.substring(state.currentStart, state.currentEnd + 1);
            return `
                <div class="step-title">Palindrome Recorded</div>
                <div class="step-detail">
                    Found: "${palindrome}" (length ${state.currentLength})
                </div>
                <div class="reason">
                    Not longer than current best (${state.longestLength}). Continuing search...
                </div>
            `;
        },

        complete: () => {
            const palindrome = state.str.substring(state.longestStart, state.longestEnd + 1);
            return `
                <div class="step-title">Search Complete!</div>
                <div class="step-detail">
                    Tested all ${state.str.length} positions as centers
                    (${state.str.length * 2} total tests: odd + even).
                </div>
                <div class="calculation">
                    Longest palindrome: <strong>"${palindrome}"</strong><br>
                    Length: ${state.longestLength}<br>
                    Position: [${state.longestStart}, ${state.longestEnd}]
                </div>
                <div class="reason found">
                    Time complexity: O(n²), Space: O(1)
                </div>
            `;
        }
    };

    explanation.innerHTML = templates[type] ? templates[type](data) : templates.init ? templates.init() : '';
}

function setStatus(message, type = '') {
    statusBar.textContent = message;
    statusBar.className = 'status-bar' + (type ? ` ${type}` : '');
}

function updateTracking() {
    if (state.str.length === 0) {
        trackingInfo.style.display = 'none';
        modeBadge.style.display = 'none';
        return;
    }

    trackingInfo.style.display = 'flex';
    centerProgress.textContent = `${state.centerIndex + 1}/${state.str.length}`;
    modeText.textContent = state.mode === 'odd' ? 'Odd' : 'Even';

    const longest = state.str.substring(state.longestStart, state.longestEnd + 1);
    longestText.textContent = `"${longest}" (${state.longestLength})`;

    if (state.phase === 'select_center' || state.phase === 'expand') {
        modeBadge.style.display = 'inline-flex';
        modeBadge.className = `mode-badge ${state.mode}`;
        modeBadge.textContent = state.mode === 'odd'
            ? 'Odd-length (single center)'
            : 'Even-length (double center)';
    } else {
        modeBadge.style.display = 'none';
    }
}

function updateButtons() {
    const canRun = state.str.length >= 1 && !state.done;
    btnStep.disabled = !canRun || state.playing;
    btnPlay.disabled = !canRun;
    btnReset.disabled = state.str.length === 0;
    btnPlay.textContent = state.playing ? 'Pause' : 'Play';
}

function renderAll() {
    renderString();
    updateTracking();
    updateButtons();
}

// ===== Algorithm =====
function initRun() {
    stopPlaying();
    clearPendingTimers();
    state.runId++;

    try {
        const str = stringInput.value.trim();

        if (str.length === 0) {
            throw new Error('String cannot be empty');
        }

        Object.assign(state, {
            str,
            centerIndex: 0,
            mode: 'odd',
            left: null,
            right: null,
            longestStart: 0,
            longestEnd: 0,
            longestLength: 1,
            currentStart: null,
            currentEnd: null,
            currentLength: 0,
            phase: 'select_center',
            subStep: 'compare',
            iteration: 0,
            done: false,
            playing: false,
            timer: null
        });

        setStatus(`Loaded ${str.length} characters. Click Step or Play.`, 'info');
        renderExplanation('init');
        renderPseudocode(6);
        renderAll();
    } catch (e) {
        setStatus(e.message, 'error');
        Object.assign(state, {
            str: '',
            centerIndex: 0,
            mode: 'odd',
            left: null,
            right: null,
            done: true
        });
        renderAll();
    }
}

function selectCenter() {
    if (state.mode === 'odd') {
        state.left = state.centerIndex;
        state.right = state.centerIndex;
        renderPseudocode(8);
    } else {
        if (state.centerIndex + 1 >= state.str.length) {
            advanceToNextCenter();
            return;
        }
        state.left = state.centerIndex;
        state.right = state.centerIndex + 1;
        renderPseudocode(13);
    }

    state.phase = 'expand';
    state.subStep = 'compare';
    renderExplanation('selectCenter');
    setStatus(`Testing ${state.mode}-length palindrome at center ${state.centerIndex}`, 'info');
}

function expandStep() {
    const { str, left, right, subStep } = state;

    if (subStep === 'compare') {
        state.iteration++;

        const leftInBounds = left >= 0;
        const rightInBounds = right < str.length;
        const charsMatch = leftInBounds && rightInBounds && str[left] === str[right];

        if (!leftInBounds || !rightInBounds || !charsMatch) {
            renderExplanation('expandStop', {
                reason: !charsMatch ? 'mismatch' : 'bounds'
            });
            renderPseudocode(25);
            state.phase = 'record';
            setStatus('Expansion stopped. Recording result...', 'info');
        } else {
            renderExplanation('expandMatch');
            renderPseudocode(22);
            setStatus(`Match: '${str[left]}' == '${str[right]}'. Expanding...`, 'success');
            state.subStep = 'move';
        }
    } else if (subStep === 'move') {
        state.left--;
        state.right++;
        state.subStep = 'compare';
    }
}

function recordResult() {
    const start = state.left + 1;
    const end = state.right - 1;
    const length = end - start + 1;

    state.currentStart = start;
    state.currentEnd = end;
    state.currentLength = length;

    if (length > state.longestLength) {
        state.longestStart = start;
        state.longestEnd = end;
        state.longestLength = length;
        renderExplanation('newLongest');
        renderPseudocode(state.mode === 'odd' ? 10 : 15);
        const pal = state.str.substring(start, end + 1);
        setStatus(`New longest: "${pal}" (${length})`, 'success');
    } else {
        renderExplanation('notLonger');
        const pal = state.str.substring(start, end + 1);
        setStatus(`Found "${pal}" (${length}), not longer than ${state.longestLength}`, 'info');
    }

    advanceToNextCenter();
}

function advanceToNextCenter() {
    if (state.mode === 'odd') {
        state.mode = 'even';
        state.phase = 'select_center';
    } else {
        state.mode = 'odd';
        state.centerIndex++;

        if (state.centerIndex >= state.str.length) {
            state.done = true;
            state.phase = 'complete';
            renderExplanation('complete');
            renderPseudocode(17);
            const pal = state.str.substring(state.longestStart, state.longestEnd + 1);
            setStatus(`Complete! Longest: "${pal}"`, 'success');
            stopPlaying();
        } else {
            state.phase = 'select_center';
        }
    }
}

function step() {
    if (state.done || state.str.length === 0) return;

    switch (state.phase) {
        case 'select_center':
            selectCenter();
            break;
        case 'expand':
            expandStep();
            break;
        case 'record':
            recordResult();
            break;
    }

    renderAll();
}

function play() {
    if (state.str.length === 0 || state.done) return;

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
    const str = generateRandomString();
    stringInput.value = str;
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

stringInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});

// Initialize on load
speedValue.textContent = `${speedSlider.value}ms`;
