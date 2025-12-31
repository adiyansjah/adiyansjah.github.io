/**
 * Variable-Min Window Visualizer
 * Minimum Size Subarray Sum
 */

(function() {
    'use strict';

    const {
        renderArraySVG,
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
        target: 7,
        left: 0,
        right: -1,
        currentSum: 0,
        minLength: Infinity,
        bestWindow: null,
        step: 0,
        phase: 'idle', // 'idle', 'expanding', 'contracting', 'done'
        playing: false,
        timer: null
    };

    // ========================================================================
    // DOM Elements
    // ========================================================================

    const elements = {
        presetSelect: document.getElementById('presetSelect'),
        arrayInput: document.getElementById('arrayInput'),
        targetInput: document.getElementById('targetInput'),
        loadBtn: document.getElementById('loadBtn'),
        stepBtn: document.getElementById('stepBtn'),
        playBtn: document.getElementById('playBtn'),
        resetBtn: document.getElementById('resetBtn'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        stepCount: document.getElementById('stepCount'),
        arrayViz: document.getElementById('arrayViz'),
        auxContainer: document.getElementById('auxContainer'),
        sumDisplay: document.getElementById('sumDisplay'),
        statusBar: document.getElementById('statusBar'),
        pseudocode: document.getElementById('pseudocode'),
        explanation: document.getElementById('explanation')
    };

    // ========================================================================
    // Preset Management
    // ========================================================================

    function loadPreset(key) {
        const preset = PRESETS.variableMin[key];
        if (!preset) return;

        elements.arrayInput.value = preset.values.join(', ');
        elements.targetInput.value = preset.target;
    }

    // ========================================================================
    // Rendering
    // ========================================================================

    function render() {
        const isValid = state.currentSum >= state.target;

        renderArraySVG(elements.arrayViz, state.array, {
            left: state.left,
            right: state.right,
            bestWindow: state.bestWindow,
            isValid: isValid
        });

        renderSumDisplay();
    }

    function renderSumDisplay() {
        const isValid = state.currentSum >= state.target;
        const comparisonClass = isValid ? 'valid' : 'invalid';
        const comparisonSymbol = isValid ? '>=' : '<';

        elements.sumDisplay.innerHTML = `
            <span class="sum-value">${state.currentSum}</span>
            <span class="sum-comparison ${comparisonClass}">${comparisonSymbol} ${state.target} (target)</span>
        `;
    }

    function renderExplanation(type, data = {}) {
        const templates = {
            init: () => ({
                title: 'Initialization',
                detail: `Starting with empty window. Left pointer at 0, right will expand.
                        <br><br>
                        Target sum: <strong>${state.target}</strong>`,
                calculation: null,
                reason: 'We\'ll expand right until sum >= target, then contract to find minimum.'
            }),

            expand: () => ({
                title: `Expanding Right (Step ${data.step})`,
                detail: `Moving right pointer to index ${data.right}.
                        <br>Adding <strong>${data.value}</strong> to sum.
                        <br><br>
                        Sum: ${data.oldSum} + ${data.value} = ${data.newSum}`,
                calculation: `Window: [${data.left}, ${data.right}] = [${state.array.slice(data.left, data.right + 1).join(', ')}]
Sum: ${data.newSum} ${data.newSum >= state.target ? '>=' : '<'} ${state.target}`,
                reason: data.newSum >= state.target
                    ? `Sum ${data.newSum} >= target ${state.target}. Window is valid, will try to contract.`
                    : `Sum ${data.newSum} < target ${state.target}. Need to expand more.`
            }),

            contract: () => ({
                title: `Contracting Left (Step ${data.step})`,
                detail: `Window is valid (sum >= target)!
                        <br><br>
                        Checking if this is the minimum length...
                        <br>Current length: ${data.windowLen}, Best: ${data.oldMinLen === Infinity ? 'none' : data.oldMinLen}
                        <br><br>
                        Removing <strong>${data.removedValue}</strong> from left to try smaller window.`,
                calculation: `Sum: ${data.oldSum} - ${data.removedValue} = ${data.newSum}
Window after: [${data.newLeft}, ${data.right}]`,
                reason: data.newBest
                    ? `New minimum! Length ${data.windowLen} < previous ${data.oldMinLen === Infinity ? 'Infinity' : data.oldMinLen}`
                    : `Length ${data.windowLen} >= min ${state.minLength}`
            }),

            done: () => ({
                title: 'Algorithm Complete!',
                detail: `Processed all elements in the array.`,
                calculation: state.minLength === Infinity
                    ? `No subarray found with sum >= ${state.target}`
                    : `Minimum subarray: [${state.array.slice(state.bestWindow.left, state.bestWindow.right + 1).join(', ')}]
Length: ${state.minLength}`,
                reason: 'found',
                reasonText: state.minLength === Infinity
                    ? `No valid subarray exists (return 0)`
                    : `Best window: [${state.bestWindow.left}, ${state.bestWindow.right}] with length ${state.minLength}`
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
            // Initialize
            state.phase = 'expanding';
            state.left = 0;
            state.right = -1;
            state.currentSum = 0;
            state.minLength = Infinity;
            state.bestWindow = null;
            state.step = 0;

            elements.auxContainer.style.display = 'block';
            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, 2);
            renderExplanation('init');
            updateStatusBar(elements.statusBar, 'Initialized, ready to expand', 'info');
            return false;
        }

        state.step++;

        // Check if we need to contract (sum >= target)
        if (state.phase === 'contracting' || (state.currentSum >= state.target && state.left <= state.right)) {
            state.phase = 'contracting';

            const windowLen = state.right - state.left + 1;
            const oldMinLen = state.minLength;
            let newBest = false;

            // Check if this is a new minimum
            if (windowLen < state.minLength) {
                state.minLength = windowLen;
                state.bestWindow = { left: state.left, right: state.right };
                newBest = true;
            }

            // Contract: remove left element
            const removedValue = state.array[state.left];
            const oldSum = state.currentSum;
            state.currentSum -= removedValue;
            const newLeft = state.left + 1;

            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, newBest ? 11 : 14);
            renderExplanation('contract', {
                step: state.step,
                windowLen,
                oldMinLen,
                newBest,
                removedValue,
                oldSum,
                newSum: state.currentSum,
                newLeft,
                right: state.right
            });
            updateStatusBar(elements.statusBar, `Contracting: removed ${removedValue}, sum = ${state.currentSum}`, 'info');

            state.left = newLeft;

            // Check if we should continue contracting or switch to expanding
            if (state.currentSum >= state.target && state.left <= state.right) {
                state.phase = 'contracting';
            } else {
                state.phase = 'expanding';
            }

            return false;
        }

        // Expand right
        state.right++;

        if (state.right >= state.array.length) {
            // Done - finished processing all elements
            state.right--;
            state.phase = 'done';
            highlightPseudocode(elements.pseudocode, 17);
            renderExplanation('done');
            const resultMsg = state.minLength === Infinity
                ? 'Complete! No valid subarray found (return 0)'
                : `Complete! Minimum length: ${state.minLength}`;
            updateStatusBar(elements.statusBar, resultMsg, 'success');
            updateButtons();
            return true;
        }

        // Add current element to sum
        const value = state.array[state.right];
        const oldSum = state.currentSum;
        state.currentSum += value;

        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, 7);
        renderExplanation('expand', {
            step: state.step,
            right: state.right,
            left: state.left,
            value,
            oldSum,
            newSum: state.currentSum
        });

        const sumStatus = state.currentSum >= state.target ? 'valid' : 'expanding';
        updateStatusBar(elements.statusBar, `Added ${value}, sum = ${state.currentSum} (${sumStatus})`, 'info');

        // If sum is now >= target, next step will contract
        if (state.currentSum >= state.target) {
            state.phase = 'contracting';
        }

        return false;
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

        state.left = 0;
        state.right = -1;
        state.currentSum = 0;
        state.minLength = Infinity;
        state.bestWindow = null;
        state.step = 0;
        state.phase = 'idle';

        elements.auxContainer.style.display = 'none';
        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, 0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
                <br><br>
                <strong>Array:</strong> [${state.array.join(', ')}]
                <br><strong>Target:</strong> ${state.target}
            </div>
        `;

        updateStatusBar(elements.statusBar, 'Ready to begin');
        updateButtons();
    }

    function load() {
        stopPlaying();

        const input = elements.arrayInput.value.trim();
        const targetValue = parseInt(elements.targetInput.value, 10);

        if (!input) {
            updateStatusBar(elements.statusBar, 'Please enter an array', 'error');
            return;
        }

        if (isNaN(targetValue) || targetValue <= 0) {
            updateStatusBar(elements.statusBar, 'Please enter a valid target (positive number)', 'error');
            return;
        }

        try {
            state.array = parseArrayInput(input, 'number');
        } catch (e) {
            updateStatusBar(elements.statusBar, `Invalid input: ${e.message}`, 'error');
            return;
        }

        if (state.array.length === 0) {
            updateStatusBar(elements.statusBar, 'Array cannot be empty', 'error');
            return;
        }

        state.target = targetValue;
        state.left = 0;
        state.right = -1;
        state.currentSum = 0;
        state.minLength = Infinity;
        state.bestWindow = null;
        state.step = 0;
        state.phase = 'idle';

        elements.auxContainer.style.display = 'none';
        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, 0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Array loaded: [${state.array.join(', ')}]
                <br>Target sum: ${state.target}
                <br>Length: ${state.array.length}
                <br><br>
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
            </div>
        `;

        updateStatusBar(elements.statusBar, `Loaded array of length ${state.array.length}, target = ${state.target}`, 'info');
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
                elements.targetInput.value = '';
            } else {
                loadPreset(value);
            }
        });

        elements.arrayInput.addEventListener('input', () => {
            elements.presetSelect.value = 'custom';
        });

        elements.targetInput.addEventListener('input', () => {
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
