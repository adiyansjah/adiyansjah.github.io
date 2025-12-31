/**
 * Cycle Detection Visualizer
 * Implements Floyd's Tortoise and Hare algorithm visualization
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
        cycleIndex: -1,
        positions: new Map(),

        // Pointers
        slow: null,        // Node ID of slow pointer
        fast: null,        // Node ID of fast pointer

        // Algorithm state
        phase: 0,          // 0 = not started, 1 = detection, 2 = finding entry
        iteration: 0,
        done: false,
        hasCycle: false,
        meetingPoint: null, // Node ID where pointers met
        cycleEntry: null,   // Node ID of cycle entry point

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
        cycleIndexSelect: document.getElementById('cycleIndexSelect'),
        loadBtn: document.getElementById('loadBtn'),
        stepBtn: document.getElementById('stepBtn'),
        playBtn: document.getElementById('playBtn'),
        resetBtn: document.getElementById('resetBtn'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        phase1: document.getElementById('phase1'),
        phase2: document.getElementById('phase2'),
        iterationCount: document.getElementById('iterationCount'),
        linkedListViz: document.getElementById('linkedListViz'),
        statusBar: document.getElementById('statusBar'),
        pseudocode: document.getElementById('pseudocode'),
        explanation: document.getElementById('explanation')
    };

    // ============================================================================
    // Preset Management
    // ============================================================================

    function loadPreset(key) {
        const preset = PRESETS.cycle[key];
        if (!preset) return;

        elements.nodeValuesInput.value = preset.values.join(', ');
        updateCycleOptions();

        // Set cycle index after options are populated
        setTimeout(() => {
            elements.cycleIndexSelect.value = String(preset.cycleIndex);
        }, 0);
    }

    function updateCycleOptions() {
        const input = elements.nodeValuesInput.value.trim();
        let values = [];

        try {
            values = parseNodeValues(input);
        } catch (e) {
            // Invalid input, clear options
        }

        const select = elements.cycleIndexSelect;
        const currentValue = select.value;

        // Clear existing options
        select.innerHTML = '<option value="-1">No cycle</option>';

        // Add options for each node
        values.forEach((val, index) => {
            const option = document.createElement('option');
            option.value = String(index);
            option.textContent = `Node ${index} (value: ${val})`;
            select.appendChild(option);
        });

        // Try to restore previous selection
        if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
            select.value = currentValue;
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

        // Add cycle entry highlight if found
        if (state.cycleEntry !== null) {
            pointers.found = state.cycleEntry;
        }

        renderLinkedListSVG(
            elements.linkedListViz,
            state.nodes,
            state.positions,
            pointers,
            state.cycleIndex
        );
    }

    function updatePhaseIndicator() {
        // Reset all phases
        elements.phase1.classList.remove('active', 'completed');
        elements.phase2.classList.remove('active', 'completed');

        if (state.phase === 0) {
            // Not started - phase 1 ready
            elements.phase1.classList.add('active');
        } else if (state.phase === 1) {
            // Detection phase
            elements.phase1.classList.add('active');
        } else if (state.phase === 2) {
            // Finding entry phase
            elements.phase1.classList.add('completed');
            elements.phase2.classList.add('active');
        } else if (state.done) {
            // Algorithm complete
            if (state.hasCycle) {
                elements.phase1.classList.add('completed');
                elements.phase2.classList.add('completed');
            } else {
                elements.phase1.classList.add('completed');
            }
        }
    }

    function renderPseudocode(line) {
        const lines = elements.pseudocode.querySelectorAll('.code-line');
        lines.forEach(el => {
            el.classList.remove('highlight');
            if (parseInt(el.dataset.line, 10) === line) {
                el.classList.add('highlight');
            }
        });
    }

    function renderExplanation(type, data = {}) {
        const templates = {
            init: () => ({
                title: 'Initialization',
                detail: `Both <span class="highlight-slow">slow (turtle)</span> and <span class="highlight-fast">fast (rabbit)</span> pointers start at the head of the list.
                        <br><br>
                        <strong>Phase 1 begins:</strong> We'll move slow by 1 step and fast by 2 steps each iteration.`,
                calculation: null,
                reason: 'If a cycle exists, the fast pointer will eventually catch up to the slow pointer inside the cycle.'
            }),

            moving: () => ({
                title: `Phase 1: Iteration ${data.iteration}`,
                detail: `<span class="highlight-slow">Slow</span> moves from node ${data.slowFrom} to node ${data.slowTo}.
                        <br>
                        <span class="highlight-fast">Fast</span> moves from node ${data.fastFrom} to node ${data.fastTo}.`,
                calculation: `slow: ${data.slowFromVal} -> ${data.slowToVal}\nfast: ${data.fastFromVal} -> ${data.fastToVal}`,
                reason: 'Fast moves twice as fast. If there is a cycle, fast will eventually lap slow.'
            }),

            noCycle: () => ({
                title: 'No Cycle Detected',
                detail: `The <span class="highlight-fast">fast pointer</span> reached the end of the list (null).
                        <br><br>
                        This means the linked list has no cycle.`,
                calculation: null,
                reason: 'found',
                reasonText: 'Algorithm complete: No cycle exists in this linked list.'
            }),

            cycleFound: () => ({
                title: 'Cycle Detected!',
                detail: `<span class="highlight-both">Both pointers met</span> at node with value ${data.meetingValue}.
                        <br><br>
                        <strong>Phase 2 begins:</strong> Now we'll find the entry point of the cycle.`,
                calculation: `Meeting point: node ${data.meetingIndex} (value: ${data.meetingValue})`,
                reason: 'The pointers met, proving a cycle exists. Phase 2 will find where the cycle starts.'
            }),

            phase2Init: () => ({
                title: 'Phase 2: Reset Slow Pointer',
                detail: `<span class="highlight-slow">Slow</span> is reset to the head of the list.
                        <br>
                        <span class="highlight-fast">Fast</span> stays at the meeting point.
                        <br><br>
                        Now both will move at the <strong>same speed</strong> (1 step each).`,
                calculation: null,
                reason: 'Mathematical property: When both move at same speed, they will meet at the cycle entry.'
            }),

            phase2Moving: () => ({
                title: `Phase 2: Step ${data.step}`,
                detail: `Both pointers move 1 step:
                        <br>
                        <span class="highlight-slow">Slow</span>: node ${data.slowFrom} -> node ${data.slowTo}
                        <br>
                        <span class="highlight-fast">Fast</span>: node ${data.fastFrom} -> node ${data.fastTo}`,
                calculation: `slow: ${data.slowFromVal} -> ${data.slowToVal}\nfast: ${data.fastFromVal} -> ${data.fastToVal}`,
                reason: 'Both move at same speed until they meet at the cycle entry point.'
            }),

            entryFound: () => ({
                title: 'Cycle Entry Found!',
                detail: `<span class="highlight-entry">Both pointers met</span> at the cycle entry point.
                        <br><br>
                        The cycle starts at node ${data.entryIndex} with value <strong>${data.entryValue}</strong>.`,
                calculation: `Cycle entry: node ${data.entryIndex} (value: ${data.entryValue})`,
                reason: 'found',
                reasonText: 'Algorithm complete: Cycle entry point identified!'
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

    function stepPhase1() {
        if (state.nodes.length === 0) return;

        // Get current nodes
        const slowNode = state.nodes.find(n => n.id === state.slow);
        const fastNode = state.nodes.find(n => n.id === state.fast);

        // Check if fast can move (2 steps)
        if (!fastNode || !fastNode.next || !fastNode.next.next) {
            // No cycle - fast reached end
            state.done = true;
            state.hasCycle = false;
            renderPseudocode(15);
            renderExplanation('noCycle');
            updateStatus('No cycle detected - fast pointer reached the end', 'info');
            updatePhaseIndicator();
            updateButtons();
            return;
        }

        // Store previous positions for explanation
        const slowFrom = slowNode.id;
        const fastFrom = fastNode.id;
        const slowFromVal = slowNode.val;
        const fastFromVal = fastNode.val;

        // Move pointers
        state.slow = slowNode.next.id;
        state.fast = fastNode.next.next.id;
        state.iteration++;

        const newSlowNode = state.nodes.find(n => n.id === state.slow);
        const newFastNode = state.nodes.find(n => n.id === state.fast);

        // Update display
        render();
        updateIterationCount();

        // Highlight code lines
        renderPseudocode(7);

        // Update explanation
        renderExplanation('moving', {
            iteration: state.iteration,
            slowFrom: slowFrom,
            slowTo: state.slow,
            fastFrom: fastFrom,
            fastTo: state.fast,
            slowFromVal: slowFromVal,
            slowToVal: newSlowNode.val,
            fastFromVal: fastFromVal,
            fastToVal: newFastNode.val
        });

        // Check if pointers met
        if (state.slow === state.fast) {
            state.hasCycle = true;
            state.meetingPoint = state.slow;
            state.phase = 2;

            renderPseudocode(8);
            renderExplanation('cycleFound', {
                meetingIndex: state.nodes.findIndex(n => n.id === state.meetingPoint),
                meetingValue: newSlowNode.val
            });
            updateStatus('Cycle detected! Pointers met. Starting Phase 2...', 'cycle-found');
            updatePhaseIndicator();
        } else {
            updateStatus(`Phase 1: Iteration ${state.iteration} - searching for cycle...`, 'info');
        }
    }

    function stepPhase2() {
        // First call to phase 2 - reset slow to head
        if (state.slow !== state.nodes[0].id || state.phase2Step === undefined) {
            state.phase2Step = 0;
            state.slow = state.nodes[0].id;
            state.fast = state.meetingPoint;

            render();
            renderPseudocode(10);
            renderExplanation('phase2Init');
            updateStatus('Phase 2: Slow reset to head, finding cycle entry...', 'info');
            return;
        }

        // Move both pointers by 1
        const slowNode = state.nodes.find(n => n.id === state.slow);
        const fastNode = state.nodes.find(n => n.id === state.fast);

        // Store for explanation
        const slowFrom = state.slow;
        const fastFrom = state.fast;
        const slowFromVal = slowNode.val;
        const fastFromVal = fastNode.val;

        // Check if already at entry (same position before moving)
        if (state.slow === state.fast && state.phase2Step > 0) {
            // Found entry
            state.done = true;
            state.cycleEntry = state.slow;

            render();
            renderPseudocode(14);
            renderExplanation('entryFound', {
                entryIndex: state.nodes.findIndex(n => n.id === state.cycleEntry),
                entryValue: slowNode.val
            });
            updateStatus(`Cycle entry found at node with value ${slowNode.val}!`, 'entry-found');
            updatePhaseIndicator();
            updateButtons();
            return;
        }

        // Move pointers
        state.slow = slowNode.next.id;
        state.fast = fastNode.next.id;
        state.phase2Step++;

        const newSlowNode = state.nodes.find(n => n.id === state.slow);
        const newFastNode = state.nodes.find(n => n.id === state.fast);

        render();
        renderPseudocode(12);
        renderExplanation('phase2Moving', {
            step: state.phase2Step,
            slowFrom: slowFrom,
            slowTo: state.slow,
            fastFrom: fastFrom,
            fastTo: state.fast,
            slowFromVal: slowFromVal,
            slowToVal: newSlowNode.val,
            fastFromVal: fastFromVal,
            fastToVal: newFastNode.val
        });

        // Check if met at entry
        if (state.slow === state.fast) {
            state.done = true;
            state.cycleEntry = state.slow;

            render();
            renderPseudocode(14);
            renderExplanation('entryFound', {
                entryIndex: state.nodes.findIndex(n => n.id === state.cycleEntry),
                entryValue: newSlowNode.val
            });
            updateStatus(`Cycle entry found at node with value ${newSlowNode.val}!`, 'entry-found');
            updatePhaseIndicator();
            updateButtons();
        } else {
            updateStatus(`Phase 2: Step ${state.phase2Step} - converging to entry...`, 'info');
        }
    }

    function step() {
        if (state.done) return;

        if (state.phase === 0) {
            // Initialize
            state.phase = 1;
            state.slow = state.nodes[0].id;
            state.fast = state.nodes[0].id;
            state.iteration = 0;

            render();
            updatePhaseIndicator();
            renderPseudocode(3);
            renderExplanation('init');
            updateStatus('Initialized: Both pointers at head', 'info');
            return;
        }

        if (state.phase === 1) {
            stepPhase1();
        } else if (state.phase === 2) {
            stepPhase2();
        }

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
        state.phase = 0;
        state.iteration = 0;
        state.done = false;
        state.hasCycle = false;
        state.meetingPoint = null;
        state.cycleEntry = null;
        state.phase2Step = undefined;

        // Re-render
        render();
        updateIterationCount();
        updatePhaseIndicator();
        renderPseudocode(0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
                <br><br>
                <strong>Phase 1:</strong> Slow moves 1 step, fast moves 2 steps. If they meet, a cycle exists.
                <br><br>
                <strong>Phase 2:</strong> Reset slow to head, move both 1 step until they meet at cycle entry.
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

        // Get cycle index
        const cycleIndex = parseInt(elements.cycleIndexSelect.value, 10);

        // Create linked list
        const { nodes } = createLinkedList(values, cycleIndex);
        const positions = calculateLayout(nodes, cycleIndex);

        // Update state
        state.nodes = nodes;
        state.cycleIndex = cycleIndex;
        state.positions = positions;

        // Reset algorithm state
        state.slow = null;
        state.fast = null;
        state.phase = 0;
        state.iteration = 0;
        state.done = false;
        state.hasCycle = false;
        state.meetingPoint = null;
        state.cycleEntry = null;
        state.phase2Step = undefined;

        // Render
        render();
        updateIterationCount();
        updatePhaseIndicator();
        renderPseudocode(0);

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Linked list loaded with ${values.length} node${values.length > 1 ? 's' : ''}.
                ${cycleIndex >= 0 ? `<br>Cycle configured to connect back to node ${cycleIndex}.` : '<br>No cycle configured.'}
                <br><br>
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
            </div>
        `;

        updateStatus(`Loaded ${values.length} nodes${cycleIndex >= 0 ? ` with cycle at index ${cycleIndex}` : ''}`, 'info');
        updateButtons();
    }

    // ============================================================================
    // UI Updates
    // ============================================================================

    function updateButtons() {
        const hasNodes = state.nodes.length > 0;
        const canStep = hasNodes && !state.done && !state.playing;
        const canPlay = hasNodes && !state.done && !state.playing;
        const canReset = hasNodes && (state.phase > 0 || state.done);

        elements.stepBtn.disabled = !canStep;
        elements.playBtn.disabled = !canPlay;
        elements.resetBtn.disabled = !canReset;

        elements.playBtn.textContent = state.playing ? 'Pause' : 'Play';
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
                elements.cycleIndexSelect.value = '-1';
            } else {
                loadPreset(value);
            }
        });

        // Node values input
        elements.nodeValuesInput.addEventListener('input', () => {
            updateCycleOptions();
            elements.presetSelect.value = 'custom';
        });

        // Cycle index change
        elements.cycleIndexSelect.addEventListener('change', () => {
            elements.presetSelect.value = 'custom';
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
        loadPreset('cycle-at-2');

        // Initialize buttons state
        updateButtons();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
