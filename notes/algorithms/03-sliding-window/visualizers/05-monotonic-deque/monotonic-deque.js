/**
 * Monotonic Deque Window Visualizer
 * Sliding Window Maximum - Find max element in each window of size K
 */

(function() {
    'use strict';

    const {
        renderArraySVG,
        renderDeque,
        highlightPseudocode,
        updateStatusBar,
        parseArrayInput,
        PRESETS
    } = window.SlidingWindowShared;

    // ========================================================================
    // State
    // ========================================================================

    const state = {
        array: [],
        k: 3,
        left: 0,
        right: -1,
        deque: [],               // stores indices, monotonically decreasing values
        result: [],              // max for each window position
        step: 0,
        phase: 'idle',           // 'idle', 'building', 'sliding', 'complete'
        subPhase: 'start',       // 'start', 'removeOld', 'removeSmaller', 'push', 'record'
        playing: false,
        timer: null
    };

    // ========================================================================
    // DOM Elements
    // ========================================================================

    const elements = {
        presetSelect: document.getElementById('presetSelect'),
        arrayInput: document.getElementById('arrayInput'),
        kInput: document.getElementById('kInput'),
        loadBtn: document.getElementById('loadBtn'),
        stepBtn: document.getElementById('stepBtn'),
        playBtn: document.getElementById('playBtn'),
        resetBtn: document.getElementById('resetBtn'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        stepCount: document.getElementById('stepCount'),
        arrayViz: document.getElementById('arrayViz'),
        auxContainer: document.getElementById('auxContainer'),
        dequeViz: document.getElementById('dequeViz'),
        resultContainer: document.getElementById('resultContainer'),
        resultViz: document.getElementById('resultViz'),
        statusBar: document.getElementById('statusBar'),
        pseudocode: document.getElementById('pseudocode'),
        explanation: document.getElementById('explanation')
    };

    // ========================================================================
    // Preset Management
    // ========================================================================

    function loadPreset(key) {
        const preset = PRESETS.monotonicDeque[key];
        if (!preset) return;

        elements.arrayInput.value = preset.values.join(', ');
        elements.kInput.value = preset.k;
    }

    // ========================================================================
    // Deque Operations
    // ========================================================================

    function dequeFront() {
        return state.deque.length > 0 ? state.deque[0] : null;
    }

    function dequeBack() {
        return state.deque.length > 0 ? state.deque[state.deque.length - 1] : null;
    }

    function dequePopFront() {
        return state.deque.shift();
    }

    function dequePopBack() {
        return state.deque.pop();
    }

    function dequePushBack(value) {
        state.deque.push(value);
    }

    function dequeIsEmpty() {
        return state.deque.length === 0;
    }

    // ========================================================================
    // Rendering
    // ========================================================================

    function render() {
        // Calculate current window bounds
        const windowLeft = Math.max(0, state.right - state.k + 1);
        const windowRight = state.right;

        // Highlight deque indices in array
        const highlightIndices = new Set(state.deque);

        renderArraySVG(elements.arrayViz, state.array, {
            left: state.right >= 0 ? windowLeft : -1,
            right: windowRight,
            bestWindow: null,
            isValid: true,
            highlightIndices: highlightIndices
        });

        renderDeque(elements.dequeViz, state.deque, state.array);
        renderResult();
    }

    function renderResult() {
        elements.resultViz.innerHTML = '';

        if (state.result.length === 0) {
            elements.resultViz.innerHTML = '<span style="color: var(--muted); font-style: italic;">empty</span>';
            return;
        }

        state.result.forEach((value, index) => {
            const item = document.createElement('span');
            item.className = 'result-item' + (index === state.result.length - 1 ? ' latest' : '');
            item.textContent = String(value);
            elements.resultViz.appendChild(item);
        });
    }

    function renderExplanation(type, data = {}) {
        const templates = {
            init: () => ({
                title: 'Initialization',
                detail: `Starting with empty deque and result array.
                        <br><br>Window size K = ${state.k}
                        <br>We need ${state.array.length - state.k + 1} windows.`,
                calculation: null,
                reason: 'Deque stores indices of potentially maximum elements, maintaining decreasing order of values.'
            }),

            removeOld: () => ({
                title: `Remove Out-of-Window Index (Step ${data.step})`,
                detail: `Front of deque (index ${data.removedIndex}) is outside current window [${data.windowLeft}, ${data.right}].
                        <br><br>
                        Condition: ${data.removedIndex} < ${data.right} - ${state.k} + 1 = ${data.right - state.k + 1}`,
                calculation: `Removed index ${data.removedIndex} (value: ${data.removedValue})`,
                reason: 'Index no longer in window, cannot be maximum for any future window.'
            }),

            removeSmaller: () => ({
                title: `Remove Smaller Elements (Step ${data.step})`,
                detail: `Back of deque has smaller value than current element.
                        <br><br>
                        arr[${data.removedIndex}] = ${data.removedValue} < arr[${data.right}] = ${data.currentValue}`,
                calculation: `Removed index ${data.removedIndex} from back`,
                reason: 'Elements smaller than current can never be maximum while current is in window.'
            }),

            push: () => ({
                title: `Push Current Index (Step ${data.step})`,
                detail: `Adding current index ${data.right} to deque.
                        <br>Value: ${data.value}
                        <br><br>
                        Deque maintains decreasing order: [${state.deque.map(i => state.array[i]).join(' >= ')}]`,
                calculation: `Deque indices: [${state.deque.join(', ')}]`,
                reason: 'Current element is a candidate for maximum in current and future windows.'
            }),

            record: () => ({
                title: `Record Window Maximum (Step ${data.step})`,
                detail: `Window [${data.windowLeft}, ${data.right}] is complete (size = ${state.k}).
                        <br><br>
                        Front of deque: index ${data.maxIndex}, value ${data.maxValue}`,
                calculation: `Result: [${state.result.join(', ')}]`,
                reason: 'found',
                reasonText: `Maximum for window ${state.result.length}: ${data.maxValue}`
            }),

            building: () => ({
                title: `Building Initial Window (Step ${data.step})`,
                detail: `Processing index ${data.right}, value ${data.value}.
                        <br><br>
                        Window not yet complete: ${data.right + 1} < ${state.k} elements.`,
                calculation: `Need ${state.k - data.right - 1} more elements`,
                reason: 'Still building first window, will start recording once we have K elements.'
            }),

            done: () => ({
                title: 'Algorithm Complete!',
                detail: `Processed all ${state.array.length} elements.
                        <br>Found maximums for ${state.result.length} windows of size ${state.k}.`,
                calculation: `Result: [${state.result.join(', ')}]`,
                reason: 'found',
                reasonText: `Sliding window maximums: [${state.result.join(', ')}]`
            })
        };

        const template = templates[type];
        if (!template) return;

        const content = template();

        let html = `<div class="step-title">${content.title}</div>`;
        html += `<div class="step-detail">${content.detail}</div>`;

        if (content.calculation) {
            html += `<div class="calculation">${content.calculation}</div>`;
        }

        if (content.reason) {
            const isFound = content.reason === 'found';
            html += `<div class="reason${isFound ? ' found' : ''}">${content.reasonText || content.reason}</div>`;
        }

        elements.explanation.innerHTML = html;
    }

    function updateStepCount() {
        elements.stepCount.textContent = state.step;
    }

    // ========================================================================
    // Algorithm Steps
    // ========================================================================

    function algorithmStep() {
        if (state.phase === 'complete') return true;

        if (state.phase === 'idle') {
            // Initialize
            state.phase = state.k === 1 ? 'sliding' : 'building';
            state.right = -1;
            state.left = 0;
            state.deque = [];
            state.result = [];
            state.step = 0;
            state.subPhase = 'start';

            elements.auxContainer.style.display = 'block';
            elements.resultContainer.style.display = 'block';
            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, 2);
            renderExplanation('init');
            updateStatusBar(elements.statusBar, 'Initialized, ready to process', 'info');
            return false;
        }

        state.step++;

        // Process based on sub-phase
        if (state.subPhase === 'start') {
            // Move to next element
            state.right++;

            if (state.right >= state.array.length) {
                state.phase = 'complete';
                highlightPseudocode(elements.pseudocode, 20);
                renderExplanation('done');
                updateStatusBar(elements.statusBar, `Complete! Result: [${state.result.join(', ')}]`, 'success');
                updateButtons();
                return true;
            }

            state.subPhase = 'removeOld';
            // Continue to removeOld phase
        }

        const windowLeft = state.right - state.k + 1;

        // Phase: Remove indices outside window
        if (state.subPhase === 'removeOld') {
            if (!dequeIsEmpty() && dequeFront() < windowLeft) {
                const removedIndex = dequePopFront();

                render();
                updateStepCount();
                highlightPseudocode(elements.pseudocode, 8);
                renderExplanation('removeOld', {
                    step: state.step,
                    removedIndex,
                    removedValue: state.array[removedIndex],
                    windowLeft: Math.max(0, windowLeft),
                    right: state.right
                });
                updateStatusBar(elements.statusBar, `Removed out-of-window index ${removedIndex}`, 'info');
                return false;
            }

            state.subPhase = 'removeSmaller';
        }

        // Phase: Remove smaller elements from back
        if (state.subPhase === 'removeSmaller') {
            if (!dequeIsEmpty() && state.array[dequeBack()] < state.array[state.right]) {
                const removedIndex = dequePopBack();

                render();
                updateStepCount();
                highlightPseudocode(elements.pseudocode, 12);
                renderExplanation('removeSmaller', {
                    step: state.step,
                    removedIndex,
                    removedValue: state.array[removedIndex],
                    right: state.right,
                    currentValue: state.array[state.right]
                });
                updateStatusBar(elements.statusBar, `Removed smaller element at index ${removedIndex}`, 'info');
                return false;
            }

            state.subPhase = 'push';
        }

        // Phase: Push current index
        if (state.subPhase === 'push') {
            dequePushBack(state.right);

            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, 14);
            renderExplanation('push', {
                step: state.step,
                right: state.right,
                value: state.array[state.right]
            });
            updateStatusBar(elements.statusBar, `Added index ${state.right} to deque`, 'info');

            state.subPhase = 'record';
            return false;
        }

        // Phase: Record result if window is complete
        if (state.subPhase === 'record') {
            if (state.right >= state.k - 1) {
                // Window is complete
                state.phase = 'sliding';
                const maxIndex = dequeFront();
                const maxValue = state.array[maxIndex];
                state.result.push(maxValue);

                render();
                updateStepCount();
                highlightPseudocode(elements.pseudocode, 18);
                renderExplanation('record', {
                    step: state.step,
                    windowLeft: Math.max(0, windowLeft),
                    right: state.right,
                    maxIndex,
                    maxValue
                });
                updateStatusBar(elements.statusBar, `Window [${Math.max(0, windowLeft)}, ${state.right}] max: ${maxValue}`, 'info');
            } else {
                // Still building initial window
                render();
                updateStepCount();
                highlightPseudocode(elements.pseudocode, 5);
                renderExplanation('building', {
                    step: state.step,
                    right: state.right,
                    value: state.array[state.right]
                });
                updateStatusBar(elements.statusBar, `Building window: ${state.right + 1}/${state.k} elements`, 'info');
            }

            state.subPhase = 'start';
            return false;
        }

        return false;
    }

    // ========================================================================
    // Animation Controls
    // ========================================================================

    function step() {
        if (state.phase === 'complete') return;
        algorithmStep();
        updateButtons();
    }

    function play() {
        if (state.phase === 'complete' || state.playing) return;

        state.playing = true;
        updateButtons();

        const speed = parseInt(elements.speedSlider.value, 10);

        function tick() {
            if (!state.playing || state.phase === 'complete') {
                stopPlaying();
                return;
            }

            const done = algorithmStep();
            updateButtons();

            if (!done && state.playing) {
                state.timer = setTimeout(tick, speed);
            } else {
                stopPlaying();
            }
        }

        tick();
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

        state.left = 0;
        state.right = -1;
        state.deque = [];
        state.result = [];
        state.step = 0;
        state.phase = 'idle';
        state.subPhase = 'start';

        elements.auxContainer.style.display = 'none';
        elements.resultContainer.style.display = 'none';
        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, 0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
                <br><br>
                <strong>Array:</strong> [${state.array.join(', ')}]
                <br>
                <strong>Window size K:</strong> ${state.k}
            </div>
        `;

        updateStatusBar(elements.statusBar, 'Ready to begin');
        updateButtons();
    }

    function load() {
        stopPlaying();

        let values;
        try {
            values = parseArrayInput(elements.arrayInput.value, 'number');
        } catch (e) {
            updateStatusBar(elements.statusBar, `Error: ${e.message}`, 'error');
            return;
        }

        const k = parseInt(elements.kInput.value, 10);

        if (values.length === 0) {
            updateStatusBar(elements.statusBar, 'Please enter at least one value', 'error');
            return;
        }

        if (k < 1 || k > values.length) {
            updateStatusBar(elements.statusBar, `K must be between 1 and ${values.length}`, 'error');
            return;
        }

        state.array = values;
        state.k = k;
        state.left = 0;
        state.right = -1;
        state.deque = [];
        state.result = [];
        state.step = 0;
        state.phase = 'idle';
        state.subPhase = 'start';

        elements.auxContainer.style.display = 'none';
        elements.resultContainer.style.display = 'none';
        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, 0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Array loaded with ${values.length} elements.
                <br>
                Window size K = ${k}
                <br>
                Expected ${values.length - k + 1} window maximums.
                <br><br>
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
            </div>
        `;

        updateStatusBar(elements.statusBar, `Loaded ${values.length} elements, K = ${k}`, 'info');
        updateButtons();
    }

    // ========================================================================
    // UI Updates
    // ========================================================================

    function updateButtons() {
        const hasArray = state.array.length > 0;
        const canStep = hasArray && state.phase !== 'complete' && !state.playing;
        const canPlay = hasArray && state.phase !== 'complete' && !state.playing;
        const canReset = hasArray && (state.phase !== 'idle' || state.step > 0);

        elements.stepBtn.disabled = !canStep;
        elements.playBtn.disabled = !canPlay;
        elements.resetBtn.disabled = !canReset;

        elements.playBtn.textContent = state.playing ? 'Pause' : 'Play';
    }

    // ========================================================================
    // Event Listeners
    // ========================================================================

    function initEventListeners() {
        elements.presetSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'custom') {
                elements.arrayInput.value = '';
                elements.kInput.value = '3';
            } else {
                loadPreset(value);
            }
        });

        elements.arrayInput.addEventListener('input', () => {
            elements.presetSelect.value = 'custom';
        });

        elements.kInput.addEventListener('input', () => {
            elements.presetSelect.value = 'custom';
        });

        elements.loadBtn.addEventListener('click', load);
        elements.stepBtn.addEventListener('click', step);
        elements.playBtn.addEventListener('click', () => {
            if (state.playing) {
                stopPlaying();
            } else {
                play();
            }
        });
        elements.resetBtn.addEventListener('click', reset);

        elements.speedSlider.addEventListener('input', (e) => {
            elements.speedValue.textContent = `${e.target.value}ms`;
        });
    }

    // ========================================================================
    // Initialization
    // ========================================================================

    function init() {
        initEventListeners();
        loadPreset('standard');
        updateButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
