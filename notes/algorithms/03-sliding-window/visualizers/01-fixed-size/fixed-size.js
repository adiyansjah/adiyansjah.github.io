/**
 * Fixed-Size Window Visualizer
 * Maximum Sum of K Consecutive Elements
 */

(function() {
    'use strict';

    const {
        renderArraySVG,
        highlightPseudocode,
        updateStatusBar,
        parseArrayInput,
        calculateSum,
        PRESETS
    } = window.SlidingWindowShared;

    // ========================================================================
    // State
    // ========================================================================

    const state = {
        array: [],
        k: 3,
        left: -1,
        right: -1,
        windowSum: 0,
        maxSum: 0,
        bestWindow: null,
        step: 0,
        phase: 'idle', // 'idle', 'init', 'sliding', 'done'
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
        statusBar: document.getElementById('statusBar'),
        pseudocode: document.getElementById('pseudocode'),
        explanation: document.getElementById('explanation')
    };

    // ========================================================================
    // Preset Management
    // ========================================================================

    function loadPreset(key) {
        const preset = PRESETS.fixedSize[key];
        if (!preset) return;

        elements.arrayInput.value = preset.values.join(', ');
        elements.kInput.value = preset.k;
    }

    // ========================================================================
    // Rendering
    // ========================================================================

    function render() {
        renderArraySVG(elements.arrayViz, state.array, {
            left: state.left,
            right: state.right,
            bestWindow: state.bestWindow,
            isValid: true
        });
    }

    function renderExplanation(type, data = {}) {
        const templates = {
            init: () => ({
                title: 'Initialization',
                detail: `Computing initial window sum for first ${state.k} elements.`,
                calculation: `Window [0, ${state.k - 1}]: sum = ${data.sum}`,
                reason: 'This is our starting point. We\'ll slide this window across the array.'
            }),

            slide: () => ({
                title: `Sliding Window (Step ${data.step})`,
                detail: `Window moves from [${data.oldLeft}, ${data.oldRight}] to [${data.left}, ${data.right}].
                        <br><br>
                        <span class="highlight-left">Added:</span> arr[${data.right}] = ${data.added}
                        <br>
                        <span class="highlight-right">Removed:</span> arr[${data.oldLeft}] = ${data.removed}`,
                calculation: `${data.oldSum} + ${data.added} - ${data.removed} = ${data.newSum}`,
                reason: data.newSum > data.maxSum
                    ? `New maximum found! ${data.newSum} > ${data.maxSum}`
                    : `Current sum ${data.newSum} <= max ${data.maxSum}`
            }),

            done: () => ({
                title: 'Algorithm Complete!',
                detail: `Scanned all possible windows of size ${state.k}.`,
                calculation: `Maximum sum: ${state.maxSum}`,
                reason: 'found',
                reasonText: `Best window: [${state.bestWindow.left}, ${state.bestWindow.right}] with sum ${state.maxSum}`
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
        if (state.phase === 'done') return true;

        if (state.phase === 'idle') {
            // Initialize: compute first window
            state.phase = 'init';
            state.left = 0;
            state.right = state.k - 1;
            state.windowSum = calculateSum(state.array, 0, state.k - 1);
            state.maxSum = state.windowSum;
            state.bestWindow = { left: 0, right: state.k - 1 };
            state.step = 0;

            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, 5);
            renderExplanation('init', { sum: state.windowSum });
            updateStatusBar(elements.statusBar, `Initial window: sum = ${state.windowSum}`, 'info');

            state.phase = 'sliding';
            return false;
        }

        if (state.phase === 'sliding') {
            // Check if we can slide further
            if (state.right >= state.array.length - 1) {
                state.phase = 'done';
                highlightPseudocode(elements.pseudocode, 15);
                renderExplanation('done');
                updateStatusBar(elements.statusBar, `Complete! Maximum sum: ${state.maxSum}`, 'success');
                updateButtons();
                return true;
            }

            // Slide the window
            const oldLeft = state.left;
            const oldRight = state.right;
            const oldSum = state.windowSum;

            state.left++;
            state.right++;
            state.step++;

            const added = state.array[state.right];
            const removed = state.array[oldLeft];
            state.windowSum = state.windowSum + added - removed;

            // Check for new max
            if (state.windowSum > state.maxSum) {
                state.maxSum = state.windowSum;
                state.bestWindow = { left: state.left, right: state.right };
            }

            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, state.windowSum > oldSum ? 12 : 10);
            renderExplanation('slide', {
                step: state.step,
                oldLeft,
                oldRight,
                left: state.left,
                right: state.right,
                added,
                removed,
                oldSum,
                newSum: state.windowSum,
                maxSum: state.maxSum
            });
            updateStatusBar(elements.statusBar, `Window [${state.left}, ${state.right}]: sum = ${state.windowSum}`, 'info');

            return false;
        }

        return true;
    }

    // ========================================================================
    // Animation Controls
    // ========================================================================

    function step() {
        if (state.phase === 'done') return;
        algorithmStep();
        updateButtons();
    }

    function play() {
        if (state.phase === 'done' || state.playing) return;

        state.playing = true;
        updateButtons();

        const speed = parseInt(elements.speedSlider.value, 10);

        function tick() {
            if (!state.playing || state.phase === 'done') {
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

        state.left = -1;
        state.right = -1;
        state.windowSum = 0;
        state.maxSum = 0;
        state.bestWindow = null;
        state.step = 0;
        state.phase = 'idle';

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
        state.left = -1;
        state.right = -1;
        state.windowSum = 0;
        state.maxSum = 0;
        state.bestWindow = null;
        state.step = 0;
        state.phase = 'idle';

        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, 0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Array loaded with ${values.length} elements.
                <br>
                Window size K = ${k}
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
        const canStep = hasArray && state.phase !== 'done' && !state.playing;
        const canPlay = hasArray && state.phase !== 'done' && !state.playing;
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
        loadPreset('small');
        updateButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
