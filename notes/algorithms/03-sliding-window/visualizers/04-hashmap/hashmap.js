/**
 * HashMap Window Visualizer
 * Longest Substring with At Most K Distinct Characters
 */

(function() {
    'use strict';

    const {
        renderArraySVG,
        renderHashMap,
        highlightPseudocode,
        updateStatusBar,
        PRESETS
    } = window.SlidingWindowShared;

    // ========================================================================
    // State
    // ========================================================================

    const state = {
        chars: [],
        k: 2,                    // max distinct characters allowed
        left: 0,
        right: -1,
        charCount: new Map(),    // character -> frequency
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
        hashMapViz: document.getElementById('hashMapViz'),
        statusBar: document.getElementById('statusBar'),
        pseudocode: document.getElementById('pseudocode'),
        explanation: document.getElementById('explanation')
    };

    // ========================================================================
    // Preset Management
    // ========================================================================

    function loadPreset(key) {
        const preset = PRESETS.hashmap[key];
        if (!preset) return;

        elements.stringInput.value = preset.values;
        elements.kInput.value = preset.k;
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

        renderHashMap(elements.hashMapViz, state.charCount);
    }

    function renderExplanation(type, data = {}) {
        const templates = {
            init: () => ({
                title: 'Initialization',
                detail: `Starting with empty window. Left pointer at 0, right will expand.
                        <br><br>K = ${state.k} (max distinct characters allowed).`,
                calculation: null,
                reason: 'We\'ll expand right and contract left when distinct count exceeds K.'
            }),

            expand: () => ({
                title: `Expanding Right (Step ${data.step})`,
                detail: `Moving right pointer to index ${data.right}.
                        <br>Character '<strong>${data.char}</strong>': incrementing count.
                        <br><br>
                        Distinct characters: ${state.charCount.size} (limit: ${state.k})`,
                calculation: `Window: [${data.left}, ${data.right}] = "${state.chars.slice(data.left, data.right + 1).join('')}"
Length: ${data.right - data.left + 1}`,
                reason: data.newMax
                    ? `New maximum! Length ${data.right - data.left + 1} > previous max ${data.oldMax}`
                    : `Length ${data.right - data.left + 1} <= max ${state.maxLen}`
            }),

            contract: () => ({
                title: `Contracting Left (Step ${data.step})`,
                detail: `Too many distinct characters! (${data.distinctBefore} > ${state.k})
                        <br><br>
                        Decrementing '${data.removed}' count${data.wasDeleted ? ' and removing from map' : ''}.
                        <br>Moving left from ${data.oldLeft} to ${data.left}.`,
                calculation: `Distinct after: ${state.charCount.size}`,
                reason: 'Must shrink window until distinct count <= K.'
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
            state.charCount = new Map();
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
            if (state.charCount.size > state.k) {
                // Still need to contract
                const removed = state.chars[state.left];
                const oldLeft = state.left;
                const distinctBefore = state.charCount.size;

                const currentCount = state.charCount.get(removed);
                let wasDeleted = false;
                if (currentCount === 1) {
                    state.charCount.delete(removed);
                    wasDeleted = true;
                } else {
                    state.charCount.set(removed, currentCount - 1);
                }
                state.left++;

                render();
                updateStepCount();
                highlightPseudocode(elements.pseudocode, wasDeleted ? 12 : 10);
                renderExplanation('contract', {
                    step: state.step,
                    removed,
                    oldLeft,
                    left: state.left,
                    distinctBefore,
                    wasDeleted
                });
                updateStatusBar(elements.statusBar, `Contracting: ${wasDeleted ? 'removed' : 'decremented'} '${removed}'`, 'info');
                return false;
            } else {
                // Done contracting
                state.contracting = false;

                // Window is valid again; record max before next expansion
                const currentLen = state.right - state.left + 1;
                if (currentLen > state.maxLen) {
                    state.maxLen = currentLen;
                    state.bestWindow = { left: state.left, right: state.right };
                }
            }
        }

        // Try to expand right
        state.right++;

        if (state.right >= state.chars.length) {
            state.right--;
            state.phase = 'done';
            highlightPseudocode(elements.pseudocode, 19);
            renderExplanation('done');
            updateStatusBar(elements.statusBar, `Complete! Longest: ${state.maxLen}`, 'success');
            updateButtons();
            return true;
        }

        const currentChar = state.chars[state.right];

        // Add/increment character count
        const prevCount = state.charCount.get(currentChar) || 0;
        state.charCount.set(currentChar, prevCount + 1);

        // Check if we need to contract
        if (state.charCount.size > state.k) {
            state.contracting = true;
            // Start contracting
            const removed = state.chars[state.left];
            const oldLeft = state.left;
            const distinctBefore = state.charCount.size;

            const currentCount = state.charCount.get(removed);
            let wasDeleted = false;
            if (currentCount === 1) {
                state.charCount.delete(removed);
                wasDeleted = true;
            } else {
                state.charCount.set(removed, currentCount - 1);
            }
            state.left++;

            render();
            updateStepCount();
            highlightPseudocode(elements.pseudocode, wasDeleted ? 12 : 10);
            renderExplanation('contract', {
                step: state.step,
                removed,
                oldLeft,
                left: state.left,
                distinctBefore,
                wasDeleted
            });
            updateStatusBar(elements.statusBar, `Too many distinct (${distinctBefore} > ${state.k}), contracting`, 'info');
            return false;
        }

        // Window is valid, check for new max
        const oldMax = state.maxLen;
        const currentLen = state.right - state.left + 1;
        const newMax = currentLen > state.maxLen;

        if (newMax) {
            state.maxLen = currentLen;
            state.bestWindow = { left: state.left, right: state.right };
        }

        render();
        updateStepCount();
        highlightPseudocode(elements.pseudocode, newMax ? 16 : 7);
        renderExplanation('expand', {
            step: state.step,
            right: state.right,
            left: state.left,
            char: currentChar,
            newMax,
            oldMax
        });
        updateStatusBar(elements.statusBar, `Added '${currentChar}', window length: ${currentLen}, distinct: ${state.charCount.size}`, 'info');

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
        state.charCount = new Map();
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
                <br><strong>K:</strong> ${state.k}
            </div>
        `;

        updateStatusBar(elements.statusBar, 'Ready to begin');
        updateButtons();
    }

    function load() {
        stopPlaying();

        const input = elements.stringInput.value.trim();
        const k = parseInt(elements.kInput.value, 10);

        if (!input) {
            updateStatusBar(elements.statusBar, 'Please enter a string', 'error');
            return;
        }

        if (isNaN(k) || k < 1) {
            updateStatusBar(elements.statusBar, 'K must be a positive integer', 'error');
            return;
        }

        state.chars = input.split('');
        state.k = k;
        state.left = 0;
        state.right = -1;
        state.charCount = new Map();
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
                <br>K (max distinct): ${k}
                <br><br>
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
            </div>
        `;

        updateStatusBar(elements.statusBar, `Loaded string of length ${input.length} with K=${k}`, 'info');
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
                elements.kInput.value = '2';
            } else {
                loadPreset(value);
            }
        });

        elements.stringInput.addEventListener('input', () => {
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
        loadPreset('eceba');
        updateButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
