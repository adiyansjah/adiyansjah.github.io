/**
 * Middle Finding Visualizer
 * Demonstrates how fast/slow pointers find the middle of a linked list
 */

(function() {
    'use strict';

    // Get shared module
    const {
        createLinkedList,
        calculateLayout,
        renderLinkedListSVG,
        PRESETS,
        parseNodeValues
    } = window.FastSlowShared;

    // ============================================================================
    // State
    // ============================================================================

    const state = {
        // Linked list data
        nodes: [],
        positions: new Map(),

        // Pointers
        slow: null,        // Node ID of slow pointer
        fast: null,        // Node ID of fast pointer

        // Algorithm state
        iteration: 0,
        done: false,
        middleIndex: null, // Index of the middle node found

        // Configuration
        useSecondMiddle: false, // false = first middle, true = second middle

        // Animation
        playing: false,
        timer: null
    };

    // ============================================================================
    // DOM Elements
    // ============================================================================

    const elements = {
        presetSelect: document.getElementById('presetSelect'),
        nodeValuesInput: document.getElementById('nodeValuesInput'),
        loadBtn: document.getElementById('loadBtn'),
        stepBtn: document.getElementById('stepBtn'),
        playBtn: document.getElementById('playBtn'),
        resetBtn: document.getElementById('resetBtn'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        iterationCount: document.getElementById('iterationCount'),
        linkedListViz: document.getElementById('linkedListViz'),
        statusBar: document.getElementById('statusBar'),
        pseudocode: document.getElementById('pseudocode'),
        explanation: document.getElementById('explanation')
    };

    // Get radio buttons for middle type
    const middleTypeRadios = document.querySelectorAll('input[name="middleType"]');

    // ============================================================================
    // Preset Management
    // ============================================================================

    function loadPreset(key) {
        const preset = PRESETS.middle[key];
        if (!preset) return;

        elements.nodeValuesInput.value = preset.values.join(', ');
    }

    // ============================================================================
    // Pseudocode Toggle
    // ============================================================================

    function updatePseudocodeDisplay() {
        if (state.useSecondMiddle) {
            elements.pseudocode.classList.add('show-second');
        } else {
            elements.pseudocode.classList.remove('show-second');
        }
    }

    // ============================================================================
    // Rendering
    // ============================================================================

    function render() {
        const pointers = {
            slow: state.slow,
            fast: state.fast
        };

        // Add middle highlight if found
        if (state.middleIndex !== null) {
            pointers.found = state.nodes[state.middleIndex].id;
        }

        renderLinkedListSVG(
            elements.linkedListViz,
            state.nodes,
            state.positions,
            pointers,
            -1 // No cycle
        );
    }

    function renderPseudocode(lineOrLines) {
        // Support both single line number and array of line numbers
        const linesToHighlight = Array.isArray(lineOrLines) ? lineOrLines : [lineOrLines];

        const lines = elements.pseudocode.querySelectorAll('.code-line');
        lines.forEach(el => {
            el.classList.remove('highlight');
            const lineNum = parseInt(el.dataset.line, 10);
            // Handle the conditional lines (4 and 5)
            if (linesToHighlight.includes(lineNum)) {
                // Only highlight if visible
                const isFirstMiddleLine = el.classList.contains('first-middle');
                const isSecondMiddleLine = el.classList.contains('second-middle');
                const isShared = !isFirstMiddleLine && !isSecondMiddleLine;

                if (isShared) {
                    el.classList.add('highlight');
                } else if (isFirstMiddleLine && !state.useSecondMiddle) {
                    el.classList.add('highlight');
                } else if (isSecondMiddleLine && state.useSecondMiddle) {
                    el.classList.add('highlight');
                }
            }
        });
    }

    function renderExplanation(type, data = {}) {
        const middleTypeLabel = state.useSecondMiddle ? 'second' : 'first';

        const templates = {
            init: () => ({
                title: 'Initialization',
                detail: `Both <span class="highlight-slow">slow (turtle)</span> and <span class="highlight-fast">fast (rabbit)</span> pointers start at the head of the list.
                        <br><br>
                        <strong>Mode:</strong> Finding the <strong>${middleTypeLabel} middle</strong> for even-length lists.
                        <br><br>
                        <strong>Why it works:</strong> Fast moves twice as fast, so when fast reaches the end, slow is at the middle.`,
                calculation: null,
                reason: state.useSecondMiddle
                    ? 'Using condition: while fast and fast.next - finds second middle for even lists.'
                    : 'Using condition: while fast.next and fast.next.next - finds first middle for even lists.'
            }),

            moving: () => {
                const fastToDisplay = data.fastIsNull ? 'null (off list)' : `node ${data.fastTo}`;
                const fastCalcDisplay = data.fastIsNull ? 'null' : data.fastToVal;
                return {
                    title: `Iteration ${data.iteration}`,
                    detail: `<span class="highlight-slow">Slow</span> moves from node ${data.slowFrom} to node ${data.slowTo}.
                            <br>
                            <span class="highlight-fast">Fast</span> moves from node ${data.fastFrom} to ${fastToDisplay}.`,
                    calculation: `slow: ${data.slowFromVal} -> ${data.slowToVal}\nfast: ${data.fastFromVal} -> ${fastCalcDisplay}`,
                    reason: data.fastIsNull
                        ? `Slow has moved ${data.iteration} step(s). Fast fell off the list (null) - loop will end.`
                        : `Slow has moved ${data.iteration} step(s). Fast has moved ${data.iteration * 2} steps.`
                };
            },

            middleFound: () => ({
                title: 'Middle Found!',
                detail: `The <span class="highlight-middle">middle node</span> is at index ${data.middleIndex} with value <strong>${data.middleValue}</strong>.
                        <br><br>
                        ${data.listLength % 2 === 0
                            ? `<strong>Even-length list:</strong> This is the ${middleTypeLabel} of the two middle elements.`
                            : '<strong>Odd-length list:</strong> There is exactly one middle element.'}`,
                calculation: `List length: ${data.listLength}\nMiddle index: ${data.middleIndex}\nMiddle value: ${data.middleValue}`,
                reason: 'found',
                reasonText: 'Algorithm complete: Middle node identified!'
            }),

            conditionExplanation: () => ({
                title: 'Why Different Conditions?',
                detail: `For even-length lists like [1, 2, 3, 4, 5, 6], there are two "middle" nodes (3 and 4).
                        <br><br>
                        <strong>First Middle (while fast.next and fast.next.next):</strong>
                        <br>Stops earlier, slow lands on the first middle (node 3).
                        <br><br>
                        <strong>Second Middle (while fast and fast.next):</strong>
                        <br>Goes one more step, slow lands on the second middle (node 4).`,
                calculation: null,
                reason: 'For odd-length lists, both conditions yield the same middle node.'
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

    function updateStatus(message, type = '') {
        elements.statusBar.textContent = message;
        elements.statusBar.className = 'status-bar';
        if (type) {
            elements.statusBar.classList.add(type);
        }
    }

    function updateIterationCount() {
        elements.iterationCount.textContent = state.iteration;
    }

    // ============================================================================
    // Algorithm Steps
    // ============================================================================

    function checkCondition() {
        // Handle case where fast has fallen off the list (null)
        if (state.fast === null) {
            return false;
        }

        // Get current fast node
        const fastNode = state.nodes.find(n => n.id === state.fast);

        if (state.useSecondMiddle) {
            // Second middle: while fast and fast.next
            return fastNode !== null && fastNode !== undefined && fastNode.next !== null;
        } else {
            // First middle: while fast.next and fast.next.next
            return fastNode !== null && fastNode !== undefined &&
                   fastNode.next !== null && fastNode.next.next !== null;
        }
    }

    function step() {
        if (state.done) return;

        if (state.nodes.length === 0) return;

        // Initialize on first step
        if (state.slow === null && state.fast === null) {
            state.slow = state.nodes[0].id;
            state.fast = state.nodes[0].id;
            state.iteration = 0;

            render();
            renderPseudocode([2, 3]);
            renderExplanation('init');
            updateStatus('Initialized: Both pointers at head', 'info');
            updateButtons();
            return;
        }

        // Check if we should continue
        if (!checkCondition()) {
            // Condition failed - slow is at middle
            const slowNode = state.nodes.find(n => n.id === state.slow);
            state.middleIndex = state.nodes.findIndex(n => n.id === state.slow);
            state.done = true;

            render();
            renderPseudocode(8);
            renderExplanation('middleFound', {
                middleIndex: state.middleIndex,
                middleValue: slowNode.val,
                listLength: state.nodes.length
            });
            updateStatus(`Middle found: Node ${state.middleIndex} (value: ${slowNode.val})`, 'middle-found');
            updateButtons();
            return;
        }

        // Get current nodes
        const slowNode = state.nodes.find(n => n.id === state.slow);
        const fastNode = state.nodes.find(n => n.id === state.fast);

        // Store previous positions for explanation
        const slowFrom = state.nodes.findIndex(n => n.id === state.slow);
        const fastFrom = state.nodes.findIndex(n => n.id === state.fast);
        const slowFromVal = slowNode.val;
        const fastFromVal = fastNode.val;

        // Move pointers
        state.slow = slowNode.next.id;
        // In "second middle" mode, fast.next.next can be null on the last iteration
        const fastNextNext = fastNode.next ? fastNode.next.next : null;
        state.fast = fastNextNext ? fastNextNext.id : null;
        state.iteration++;

        const newSlowNode = state.nodes.find(n => n.id === state.slow);
        const newFastNode = state.fast !== null ? state.nodes.find(n => n.id === state.fast) : null;
        const slowTo = state.nodes.findIndex(n => n.id === state.slow);
        const fastTo = state.fast !== null ? state.nodes.findIndex(n => n.id === state.fast) : null;

        // Update display
        render();
        updateIterationCount();

        // Highlight code lines (both slow and fast movement)
        renderPseudocode([6, 7]);

        // Update explanation
        renderExplanation('moving', {
            iteration: state.iteration,
            slowFrom: slowFrom,
            slowTo: slowTo,
            fastFrom: fastFrom,
            fastTo: fastTo,
            slowFromVal: slowFromVal,
            slowToVal: newSlowNode.val,
            fastFromVal: fastFromVal,
            fastToVal: newFastNode ? newFastNode.val : 'null',
            fastIsNull: state.fast === null
        });

        const fastStatus = state.fast !== null ? `Fast at node ${fastTo}` : 'Fast fell off list (null)';
        updateStatus(`Iteration ${state.iteration}: Slow at node ${slowTo}, ${fastStatus}`, 'info');
        updateButtons();
    }

    // ============================================================================
    // Animation Controls
    // ============================================================================

    function play() {
        if (state.done || state.playing) return;

        state.playing = true;
        updateButtons();

        const speed = parseInt(elements.speedSlider.value, 10);

        function tick() {
            if (!state.playing || state.done) {
                stopPlaying();
                return;
            }

            step();

            if (!state.done) {
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

        // Reset algorithm state
        state.slow = null;
        state.fast = null;
        state.iteration = 0;
        state.done = false;
        state.middleIndex = null;

        // Re-render
        render();
        updateIterationCount();
        renderPseudocode(0);

        const middleTypeLabel = state.useSecondMiddle ? 'second' : 'first';

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
                <br><br>
                <strong>Mode:</strong> Finding the <strong>${middleTypeLabel} middle</strong> for even-length lists.
                <br><br>
                <strong>Key insight:</strong> When fast reaches the end, slow is at the middle because fast moves twice as fast.
            </div>
        `;

        updateStatus('Ready to begin');
        updateButtons();
    }

    function load() {
        stopPlaying();

        // Parse values
        const input = elements.nodeValuesInput.value.trim();
        let values;

        try {
            values = parseNodeValues(input);
        } catch (e) {
            updateStatus(`Error: ${e.message}`, 'error');
            return;
        }

        if (values.length === 0) {
            updateStatus('Please enter at least one node value', 'error');
            return;
        }

        // Create linked list (no cycle for middle finding)
        const { nodes } = createLinkedList(values, -1);
        const positions = calculateLayout(nodes, -1);

        // Update state
        state.nodes = nodes;
        state.positions = positions;

        // Reset algorithm state
        state.slow = null;
        state.fast = null;
        state.iteration = 0;
        state.done = false;
        state.middleIndex = null;

        // Update useSecondMiddle from radio buttons
        const selectedRadio = document.querySelector('input[name="middleType"]:checked');
        state.useSecondMiddle = selectedRadio && selectedRadio.value === 'second';
        updatePseudocodeDisplay();

        // Render
        render();
        updateIterationCount();
        renderPseudocode(0);

        const middleTypeLabel = state.useSecondMiddle ? 'second' : 'first';

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Linked list loaded with ${values.length} node${values.length > 1 ? 's' : ''}.
                <br><br>
                <strong>Mode:</strong> Finding the <strong>${middleTypeLabel} middle</strong> for even-length lists.
                <br><br>
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
            </div>
        `;

        updateStatus(`Loaded ${values.length} nodes (${middleTypeLabel} middle mode)`, 'info');
        updateButtons();
    }

    // ============================================================================
    // UI Updates
    // ============================================================================

    function updateButtons() {
        const hasNodes = state.nodes.length > 0;
        const canStep = hasNodes && !state.done && !state.playing;
        const canPlay = hasNodes && !state.done && !state.playing;
        const canReset = hasNodes && (state.slow !== null || state.done);

        elements.stepBtn.disabled = !canStep;
        elements.playBtn.disabled = !canPlay;
        elements.resetBtn.disabled = !canReset;

        elements.playBtn.textContent = state.playing ? 'Pause' : 'Play';

        // Disable middle type radio buttons once execution has started
        // to prevent changing the condition mid-run
        const executionStarted = state.slow !== null || state.done;
        middleTypeRadios.forEach(radio => {
            radio.disabled = executionStarted;
        });
    }

    // ============================================================================
    // Event Listeners
    // ============================================================================

    function initEventListeners() {
        // Preset selection
        elements.presetSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'custom') {
                // Clear for custom input
                elements.nodeValuesInput.value = '';
            } else {
                loadPreset(value);
            }
        });

        // Node values input
        elements.nodeValuesInput.addEventListener('input', () => {
            elements.presetSelect.value = 'custom';
        });

        // Middle type radio buttons
        middleTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.useSecondMiddle = e.target.value === 'second';
                updatePseudocodeDisplay();

                // If already loaded, update explanation
                if (state.nodes.length > 0 && state.slow === null && !state.done) {
                    const middleTypeLabel = state.useSecondMiddle ? 'second' : 'first';
                    elements.explanation.innerHTML = `
                        <div class="step-title">Ready to start</div>
                        <div class="step-detail">
                            Linked list loaded with ${state.nodes.length} node${state.nodes.length > 1 ? 's' : ''}.
                            <br><br>
                            <strong>Mode:</strong> Finding the <strong>${middleTypeLabel} middle</strong> for even-length lists.
                            <br><br>
                            Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
                        </div>
                    `;
                    updateStatus(`Mode changed to ${middleTypeLabel} middle`, 'info');
                }
            });
        });

        // Buttons
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

        // Speed slider
        elements.speedSlider.addEventListener('input', (e) => {
            elements.speedValue.textContent = `${e.target.value}ms`;
        });
    }

    // ============================================================================
    // Initialization
    // ============================================================================

    function init() {
        initEventListeners();

        // Load default preset
        loadPreset('odd-5');

        // Initialize buttons state
        updateButtons();

        // Initialize pseudocode display
        updatePseudocodeDisplay();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
