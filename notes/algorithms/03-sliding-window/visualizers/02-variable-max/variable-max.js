/**
 * Variable-Max Window Visualizer
 * Longest Substring Without Repeating Characters
 */

(function() {
    'use strict';

    const {
        renderArraySVG,
        renderHashSet,
        highlightPseudocode,
        updateStatusBar,
        parseArrayInput,
        PRESETS
    } = window.SlidingWindowShared;

    // ========================================================================
    // State
    // ========================================================================

    const state = {
        chars: [],
        left: 0,
        right: -1,
        charSet: new Set(),
        maxLen: 0,
        bestWindow: null,
        step: 0,
        phase: 'idle', // 'idle', 'expanding', 'contracting', 'done'
        contracting: false,
        playing: false,
        timer: null
    };

    // ========================================================================
    // DOM Elements
    // ========================================================================

    const elements = {
        presetSelect: document.getElementById('presetSelect'),
        stringInput: document.getElementById('stringInput'),
        loadBtn: document.getElementById('loadBtn'),
        stepBtn: document.getElementById('stepBtn'),
        playBtn: document.getElementById('playBtn'),
        resetBtn: document.getElementById('resetBtn'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        stepCount: document.getElementById('stepCount'),
        arrayViz: document.getElementById('arrayViz'),
        auxContainer: document.getElementById('auxContainer'),
        hashSetViz: document.getElementById('hashSetViz'),
        statusBar: document.getElementById('statusBar'),
        pseudocode: document.getElementById('pseudocode'),
        explanation: document.getElementById('explanation')
    };

    // ========================================================================
    // Preset Management
    // ========================================================================

    function loadPreset(key) {
        const preset = PRESETS.variableMax[key];
        if (!preset) return;

        elements.stringInput.value = preset.values;
    }

    // ========================================================================
    // Rendering
    // ========================================================================

    function render() {
        renderArraySVG(elements.arrayViz, state.chars, {
            left: state.left,
            right: state.right,
            bestWindow: state.bestWindow,
            isValid: !state.contracting
        });

        renderHashSet(elements.hashSetViz, state.charSet);
    }

    function renderExplanation(type, data = {}) {
        const templates = {
            init: () => ({
                title: 'Initialization',
                detail: `Starting with empty window. Left pointer at 0, right will expand.`,
                calculation: null,
                reason: 'We\'ll expand right and contract left when we find duplicates.'
            }),

            expand: () => ({
                title: `Expanding Right (Step ${data.step})`,
                detail: `Moving right pointer to index ${data.right}.
                        <br>Character '<strong>${data.char}</strong>' is not in the set.
                        <br><br>
                        Adding '${data.char}' to the set.`,
                calculation: `Window: [${data.left}, ${data.right}] = "${state.chars.slice(data.left, data.right + 1).join('')}"
Length: ${data.right - data.left + 1}`,
                reason: data.newMax
                    ? `New maximum! Length ${data.right - data.left + 1} > previous max ${data.oldMax}`
                    : `Length ${data.right - data.left + 1} <= max ${state.maxLen}`
            }),

            contract: () => ({
                title: `Contracting Left (Step ${data.step})`,
                detail: `Character '<strong>${data.duplicate}</strong>' already in set!
                        <br><br>
                        Removing '${data.removed}' from set and moving left from ${data.oldLeft} to ${data.left}.`,
                calculation: `Set after removal: {${Array.from(state.charSet).join(', ')}}`,
                reason: 'Must shrink window until no duplicates exist.'
            }),

            done: () => ({
                title: 'Algorithm Complete!',
                detail: `Processed all characters in the string.`,
                calculation: `Longest substring: "${state.chars.slice(state.bestWindow.left, state.bestWindow.right + 1).join('')}"
Length: ${state.maxLen}`,
                reason: 'found',
                reasonText: `Best window: [${state.bestWindow.left}, ${state.bestWindow.right}] with length ${state.maxLen}`
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
            state.phase = 'expanding';
            state.left = 0;
            state.right = -1;
            state.charSet = new Set();
            state.maxLen = 0;
            state.bestWindow = null;
            state.step = 0;
            state.contracting = false;

            elements.auxContainer.style.display = 'block';
            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, 3);
            renderExplanation('init');
            updateStatusBar(elements.statusBar, 'Initialized, ready to expand', 'info');
            return false;
        }

        state.step++;

        // If we're in the middle of contracting
        if (state.contracting) {
            const nextChar = state.chars[state.right];
            if (state.charSet.has(nextChar)) {
                // Still need to contract
                const removed = state.chars[state.left];
                const oldLeft = state.left;
                state.charSet.delete(removed);
                state.left++;

                render();
                updateStepCount();
                highlightPseudocode(elements.pseudocode, 8);
                renderExplanation('contract', {
                    step: state.step,
                    duplicate: nextChar,
                    removed,
                    oldLeft,
                    left: state.left
                });
                updateStatusBar(elements.statusBar, `Contracting: removed '${removed}'`, 'info');
                return false;
            } else {
                // Done contracting, add the character without advancing right
                state.contracting = false;

                state.charSet.add(nextChar);
                const oldMax = state.maxLen;
                const currentLen = state.right - state.left + 1;
                const newMax = currentLen > state.maxLen;

                if (newMax) {
                    state.maxLen = currentLen;
                    state.bestWindow = { left: state.left, right: state.right };
                }

                render();
                updateStepCount();
                highlightPseudocode(elements.pseudocode, newMax ? 14 : 11);
                renderExplanation('expand', {
                    step: state.step,
                    right: state.right,
                    left: state.left,
                    char: nextChar,
                    newMax,
                    oldMax
                });
                updateStatusBar(elements.statusBar, `Added '${nextChar}', window length: ${currentLen}`, 'info');
                return false;
            }
        }

        // Try to expand right
        state.right++;

        if (state.right >= state.chars.length) {
            state.right--;
            state.phase = 'done';
            highlightPseudocode(elements.pseudocode, 16);
            renderExplanation('done');
            updateStatusBar(elements.statusBar, `Complete! Longest: ${state.maxLen}`, 'success');
            updateButtons();
            return true;
        }

        const currentChar = state.chars[state.right];

        // Check for duplicate
        if (state.charSet.has(currentChar)) {
            state.contracting = true;
            // Start contracting
            const removed = state.chars[state.left];
            const oldLeft = state.left;
            state.charSet.delete(removed);
            state.left++;

            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, 8);
            renderExplanation('contract', {
                step: state.step,
                duplicate: currentChar,
                removed,
                oldLeft,
                left: state.left
            });
            updateStatusBar(elements.statusBar, `Duplicate '${currentChar}' found, contracting`, 'info');
            return false;
        }

        // No duplicate, add to set
        state.charSet.add(currentChar);
        const oldMax = state.maxLen;
        const currentLen = state.right - state.left + 1;
        const newMax = currentLen > state.maxLen;

        if (newMax) {
            state.maxLen = currentLen;
            state.bestWindow = { left: state.left, right: state.right };
        }

        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, newMax ? 14 : 11);
        renderExplanation('expand', {
            step: state.step,
            right: state.right,
            left: state.left,
            char: currentChar,
            newMax,
            oldMax
        });
        updateStatusBar(elements.statusBar, `Added '${currentChar}', window length: ${currentLen}`, 'info');

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
        state.charSet = new Set();
        state.maxLen = 0;
        state.bestWindow = null;
        state.step = 0;
        state.phase = 'idle';
        state.contracting = false;

        elements.auxContainer.style.display = 'none';
        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, 0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
                <br><br>
                <strong>String:</strong> "${state.chars.join('')}"
            </div>
        `;

        updateStatusBar(elements.statusBar, 'Ready to begin');
        updateButtons();
    }

    function load() {
        stopPlaying();

        const input = elements.stringInput.value.trim();

        if (!input) {
            updateStatusBar(elements.statusBar, 'Please enter a string', 'error');
            return;
        }

        state.chars = input.split('');
        state.left = 0;
        state.right = -1;
        state.charSet = new Set();
        state.maxLen = 0;
        state.bestWindow = null;
        state.step = 0;
        state.phase = 'idle';
        state.contracting = false;

        elements.auxContainer.style.display = 'none';
        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, 0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                String loaded: "${input}"
                <br>Length: ${input.length}
                <br><br>
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
            </div>
        `;

        updateStatusBar(elements.statusBar, `Loaded string of length ${input.length}`, 'info');
        updateButtons();
    }

    // ========================================================================
    // UI Updates
    // ========================================================================

    function updateButtons() {
        const hasChars = state.chars.length > 0;
        const canStep = hasChars && state.phase !== 'done' && !state.playing;
        const canPlay = hasChars && state.phase !== 'done' && !state.playing;
        const canReset = hasChars && (state.phase !== 'idle' || state.step > 0);

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
                elements.stringInput.value = '';
            } else {
                loadPreset(value);
            }
        });

        elements.stringInput.addEventListener('input', () => {
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
        loadPreset('abcabcbb');
        updateButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
