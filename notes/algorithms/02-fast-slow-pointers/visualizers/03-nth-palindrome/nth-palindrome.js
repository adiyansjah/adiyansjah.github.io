/**
 * Nth from End & Palindrome Visualizer
 * Demonstrates two algorithms using fast-slow pointers:
 * 1. Finding Nth node from end
 * 2. Checking if linked list is palindrome
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
        // Mode
        mode: 'nth', // 'nth' or 'palindrome'

        // Linked list data
        nodes: [],
        positions: new Map(),

        // Pointers
        slow: null,        // Node ID of slow pointer
        fast: null,        // Node ID of fast pointer

        // Algorithm state
        stage: 0,          // 0 = not started
        iteration: 0,
        done: false,
        result: null,      // Result of the algorithm

        // Nth from End specific
        n: 2,              // N value for nth from end
        gapSteps: 0,       // Steps taken in gap creation phase

        // Palindrome specific
        middleIndex: null,
        reversedHalf: [],  // Reversed second half values
        compareIndex: 0,   // Current comparison index

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
        nValueInput: document.getElementById('nValueInput'),
        loadBtn: document.getElementById('loadBtn'),
        stepBtn: document.getElementById('stepBtn'),
        playBtn: document.getElementById('playBtn'),
        resetBtn: document.getElementById('resetBtn'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        stage1: document.getElementById('stage1'),
        stage2: document.getElementById('stage2'),
        stage3: document.getElementById('stage3'),
        iterationCount: document.getElementById('iterationCount'),
        linkedListViz: document.getElementById('linkedListViz'),
        reversedValues: document.getElementById('reversedValues'),
        statusBar: document.getElementById('statusBar'),
        pseudocodeNth: document.getElementById('pseudocodeNth'),
        pseudocodePalindrome: document.getElementById('pseudocodePalindrome'),
        explanation: document.getElementById('explanation')
    };

    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab');

    // ============================================================================
    // Mode Management
    // ============================================================================

    function setMode(mode) {
        // Stop any playing animation
        stopPlaying();

        state.mode = mode;

        // Clear loaded list to avoid state mismatch with new preset inputs
        state.nodes = [];
        state.positions = new Map();

        // Update body class
        document.body.classList.remove('mode-nth', 'mode-palindrome');
        document.body.classList.add(`mode-${mode}`);

        // Update tab buttons
        tabButtons.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // Load appropriate presets
        loadPresetsForMode(mode);

        // Reset state
        resetState();

        // Reset all UI elements
        render();
        updateIterationCount();
        updateStageIndicator();
        updateReversedHalfDisplay();
        renderPseudocode(0);
        updateInitialExplanation();
        updateStatus('Ready to begin');
        updateButtons();
    }

    function loadPresetsForMode(mode) {
        const presets = mode === 'nth' ? PRESETS.nth : PRESETS.palindrome;
        const select = elements.presetSelect;

        // Clear existing options
        select.innerHTML = '';

        // Add options for current mode
        Object.entries(presets).forEach(([key, preset]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = preset.label;
            select.appendChild(option);
        });

        // Add custom option
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = 'Custom';
        select.appendChild(customOption);

        // Load first preset
        const firstKey = Object.keys(presets)[0];
        if (firstKey) {
            loadPreset(firstKey);
        }
    }

    // ============================================================================
    // Preset Management
    // ============================================================================

    function loadPreset(key) {
        const presets = state.mode === 'nth' ? PRESETS.nth : PRESETS.palindrome;
        const preset = presets[key];
        if (!preset) return;

        elements.nodeValuesInput.value = preset.values.join(', ');

        if (state.mode === 'nth' && preset.n !== undefined) {
            elements.nValueInput.value = preset.n;
        }
    }

    // ============================================================================
    // State Management
    // ============================================================================

    function resetState() {
        state.slow = null;
        state.fast = null;
        state.stage = 0;
        state.iteration = 0;
        state.done = false;
        state.result = null;
        state.gapSteps = 0;
        state.middleIndex = null;
        state.reversedHalf = [];
        state.compareIndex = 0;
    }

    // ============================================================================
    // Rendering
    // ============================================================================

    function render() {
        const pointers = {
            slow: state.slow,
            fast: state.fast
        };

        // Add found highlight for result
        if (state.done && state.result !== null && state.mode === 'nth') {
            const resultNode = state.nodes.find((n, idx) => idx === state.result);
            if (resultNode) {
                pointers.found = resultNode.id;
            }
        }

        // For palindrome comparison stage, highlight comparing nodes
        if (state.mode === 'palindrome' && state.stage === 3 && !state.done) {
            // Both slow and fast are used as comparison pointers
        }

        renderLinkedListSVG(
            elements.linkedListViz,
            state.nodes,
            state.positions,
            pointers,
            -1 // No cycle
        );
    }

    function updateStageIndicator() {
        if (state.mode !== 'palindrome') return;

        // Reset all stages
        elements.stage1.classList.remove('active', 'completed');
        elements.stage2.classList.remove('active', 'completed');
        elements.stage3.classList.remove('active', 'completed');

        if (state.stage === 0) {
            elements.stage1.classList.add('active');
        } else if (state.stage === 1) {
            elements.stage1.classList.add('active');
        } else if (state.stage === 2) {
            elements.stage1.classList.add('completed');
            elements.stage2.classList.add('active');
        } else if (state.stage === 3) {
            elements.stage1.classList.add('completed');
            elements.stage2.classList.add('completed');
            elements.stage3.classList.add('active');
        }

        if (state.done) {
            elements.stage1.classList.add('completed');
            elements.stage2.classList.add('completed');
            elements.stage3.classList.add('completed');
        }
    }

    function updateReversedHalfDisplay() {
        if (state.mode !== 'palindrome') return;

        if (state.reversedHalf.length > 0) {
            elements.reversedValues.textContent = state.reversedHalf.join(' -> ');
        } else {
            elements.reversedValues.textContent = '-';
        }
    }

    function renderPseudocode(line) {
        const pseudocode = state.mode === 'nth' ? elements.pseudocodeNth : elements.pseudocodePalindrome;
        const lines = pseudocode.querySelectorAll('.code-line');
        lines.forEach(el => {
            el.classList.remove('highlight');
            if (parseInt(el.dataset.line, 10) === line) {
                el.classList.add('highlight');
            }
        });
    }

    function renderExplanation(type, data = {}) {
        const templates = getNthTemplates();
        const palindromeTemplates = getPalindromeTemplates();

        const allTemplates = state.mode === 'nth' ? templates : palindromeTemplates;
        const template = allTemplates[type];
        if (!template) return;

        const content = template(data);

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

    function getNthTemplates() {
        return {
            init: () => ({
                title: 'Initialization',
                detail: `Both <span class="highlight-slow">slow</span> and <span class="highlight-fast">fast</span> pointers start at the head.
                        <br><br>
                        <strong>Goal:</strong> Find the ${state.n}${getOrdinalSuffix(state.n)} node from the end.
                        <br><br>
                        <strong>Strategy:</strong> First, move fast ${state.n} steps ahead to create a gap.`,
                calculation: `n = ${state.n}`,
                reason: 'Creating a gap of n nodes between pointers ensures slow lands on the target when fast reaches the end.'
            }),

            gapCreation: (data) => ({
                title: `Gap Creation: Step ${data.step}/${state.n}`,
                detail: `<span class="highlight-fast">Fast</span> moves one step ahead.
                        <br><br>
                        Fast is now at node ${data.fastIndex} (value: ${data.fastValue}).
                        <br>
                        ${data.step < state.n ? `${state.n - data.step} more step(s) to create full gap.` : 'Gap of n nodes created!'}`,
                calculation: `Gap: ${data.step} / ${state.n} steps`,
                reason: `After moving fast ${state.n} steps, there will be exactly ${state.n} nodes between slow and the end when fast reaches NULL.`
            }),

            nExceeds: () => ({
                title: 'N Exceeds List Length',
                detail: `<span class="highlight-fast">Fast</span> reached NULL before completing ${state.n} steps.
                        <br><br>
                        This means the list has fewer than ${state.n} nodes, so there is no ${state.n}${getOrdinalSuffix(state.n)} node from the end.`,
                calculation: `List length < n (${state.n})`,
                reason: 'found',
                reasonText: 'Algorithm complete: N exceeds list length - no result.'
            }),

            moving: (data) => ({
                title: `Moving Both: Iteration ${data.iteration}`,
                detail: `<span class="highlight-slow">Slow</span>: node ${data.slowFrom} -> node ${data.slowTo} (value: ${data.slowToVal})
                        <br>
                        <span class="highlight-fast">Fast</span>: node ${data.fastFrom} -> node ${data.fastTo}${data.fastTo !== null ? ` (value: ${data.fastToVal})` : ' (NULL)'}`,
                calculation: `slow: ${data.slowFromVal} -> ${data.slowToVal}\nfast: ${data.fastFromVal} -> ${data.fastToVal || 'NULL'}`,
                reason: 'Both move at same speed. When fast reaches NULL, slow is at the nth node from end.'
            }),

            found: (data) => ({
                title: `Found: ${state.n}${getOrdinalSuffix(state.n)} from End`,
                detail: `<span class="highlight-fast">Fast</span> reached NULL.
                        <br><br>
                        <span class="highlight-found">Slow</span> is now at the ${state.n}${getOrdinalSuffix(state.n)} node from the end:
                        <br>Node index ${data.nodeIndex} with value <strong>${data.nodeValue}</strong>.`,
                calculation: `Result: node[${data.nodeIndex}] = ${data.nodeValue}`,
                reason: 'found',
                reasonText: `Algorithm complete: The ${state.n}${getOrdinalSuffix(state.n)} node from end is ${data.nodeValue}.`
            })
        };
    }

    function getPalindromeTemplates() {
        return {
            init: () => ({
                title: 'Stage 1: Find Middle',
                detail: `Both <span class="highlight-slow">slow</span> and <span class="highlight-fast">fast</span> pointers start at the head.
                        <br><br>
                        <strong>Goal:</strong> Find the middle of the list using fast/slow technique.
                        <br><br>
                        Fast moves 2 steps while slow moves 1 step.`,
                calculation: null,
                reason: 'When fast reaches the end, slow will be at the middle.'
            }),

            findingMiddle: (data) => ({
                title: `Stage 1: Finding Middle - Iteration ${data.iteration}`,
                detail: `<span class="highlight-slow">Slow</span>: node ${data.slowFrom} -> node ${data.slowTo} (value: ${data.slowToVal})
                        <br>
                        <span class="highlight-fast">Fast</span>: node ${data.fastFrom} -> node ${data.fastTo}${data.fastTo !== null ? ` (value: ${data.fastToVal})` : ' (end)'}`,
                calculation: `slow: ${data.slowFromVal} -> ${data.slowToVal}\nfast: ${data.fastFromVal} -> ${data.fastToVal || 'end'}`,
                reason: 'Fast moves 2x speed. When fast reaches end, slow is at middle.'
            }),

            middleFound: (data) => ({
                title: 'Middle Found - Starting Stage 2',
                detail: `<span class="highlight-slow">Slow</span> is at the middle: node ${data.middleIndex} (value: ${data.middleValue}).
                        <br><br>
                        <strong>Stage 2:</strong> Now we reverse the second half of the list starting from slow.`,
                calculation: `Middle at index: ${data.middleIndex}`,
                reason: 'Next, we reverse all nodes from the middle to the end.'
            }),

            reversing: (data) => ({
                title: 'Stage 2: Reversing Second Half',
                detail: `Building reversed second half from middle to end.
                        <br><br>
                        Reversed values so far: <strong>${data.reversed.join(' -> ') || 'none'}</strong>`,
                calculation: `Original second half: ${data.original.join(' -> ')}\nReversed: ${data.reversed.join(' -> ')}`,
                reason: 'Reversing allows us to compare from both ends toward the middle.'
            }),

            reverseComplete: (data) => ({
                title: 'Stage 2 Complete - Starting Stage 3',
                detail: `Second half reversed: <strong>${data.reversed.join(' -> ')}</strong>
                        <br><br>
                        <strong>Stage 3:</strong> Compare first half with reversed second half.`,
                calculation: `First half: ${data.firstHalf.join(' -> ')}\nReversed second half: ${data.reversed.join(' -> ')}`,
                reason: 'If all values match, the list is a palindrome.'
            }),

            comparing: (data) => ({
                title: `Stage 3: Comparing - Position ${data.position + 1}`,
                detail: `Comparing:
                        <br><span class="highlight-slow">First half[${data.position}]</span>: ${data.val1}
                        <br><span class="highlight-compare">Reversed half[${data.position}]</span>: ${data.val2}
                        <br><br>
                        ${data.val1 === data.val2 ? 'Values match! Continue...' : 'Values differ!'}`,
                calculation: `first[${data.position}] = ${data.val1}\nreversed[${data.position}] = ${data.val2}\n${data.val1 === data.val2 ? 'MATCH' : 'MISMATCH'}`,
                reason: data.val1 === data.val2 ? 'Values equal - continue comparing.' : 'Values differ - not a palindrome!'
            }),

            isPalindrome: () => ({
                title: 'Result: Is Palindrome!',
                detail: `All values in the first half match the reversed second half.
                        <br><br>
                        The linked list <strong>is a palindrome</strong>.`,
                calculation: `All comparisons: MATCH`,
                reason: 'found',
                reasonText: 'Algorithm complete: The linked list IS a palindrome!'
            }),

            notPalindrome: (data) => ({
                title: 'Result: Not a Palindrome',
                detail: `Mismatch found at position ${data.position}:
                        <br>First half: ${data.val1}
                        <br>Reversed second half: ${data.val2}
                        <br><br>
                        The linked list is <strong>not a palindrome</strong>.`,
                calculation: `first[${data.position}] = ${data.val1} != ${data.val2} = reversed[${data.position}]`,
                reason: 'found',
                reasonText: 'Algorithm complete: The linked list is NOT a palindrome.'
            })
        };
    }

    function getOrdinalSuffix(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
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

    function updateInitialExplanation() {
        const modeText = state.mode === 'nth'
            ? `<strong>Nth from End:</strong> Use a gap of N between pointers to find the Nth node from the end.`
            : `<strong>Palindrome Check:</strong> Find middle, reverse second half, compare both halves.`;

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                Click <strong>Load</strong> to create a linked list, then use <strong>Step</strong> or <strong>Play</strong>.
                <br><br>
                ${modeText}
            </div>
        `;
    }

    // ============================================================================
    // Nth from End Algorithm
    // ============================================================================

    function stepNth() {
        if (state.done) return;

        if (state.nodes.length === 0) return;

        // Initialize
        if (state.stage === 0) {
            state.stage = 1;
            state.slow = state.nodes[0].id;
            state.fast = state.nodes[0].id;
            state.gapSteps = 0;
            // Use validated state.n from load() - don't re-read from input

            render();
            renderPseudocode(3);
            renderExplanation('init');
            updateStatus(`Initialized: Creating gap of ${state.n} steps`, 'info');
            updateButtons();
            return;
        }

        // Stage 1: Create gap - move fast n steps ahead
        if (state.stage === 1) {
            const fastNode = state.fast !== null ? state.nodes.find(n => n.id === state.fast) : null;

            // If fast is already null (past end) before completing gap, n exceeds length
            if (state.fast === null && state.gapSteps < state.n) {
                state.done = true;
                state.result = null;

                render();
                renderPseudocode(6);
                renderExplanation('nExceeds');
                updateStatus(`N (${state.n}) exceeds list length`, 'n-exceeds');
                updateButtons();
                return;
            }

            if (state.gapSteps < state.n) {
                // Move fast one step (can move to null if at last node)
                if (fastNode) {
                    state.fast = fastNode.next ? fastNode.next.id : null;
                    state.gapSteps++;

                    const newFastNode = state.fast !== null ? state.nodes.find(n => n.id === state.fast) : null;
                    const fastIndex = state.fast !== null ? state.nodes.findIndex(n => n.id === state.fast) : null;

                    render();
                    renderPseudocode(7);
                    renderExplanation('gapCreation', {
                        step: state.gapSteps,
                        fastIndex: fastIndex !== null ? fastIndex : 'NULL',
                        fastValue: newFastNode ? newFastNode.val : 'NULL'
                    });
                    updateStatus(`Gap creation: ${state.gapSteps}/${state.n} steps`, 'info');

                    if (state.gapSteps === state.n) {
                        state.stage = 2; // Move to next stage
                    }
                } else {
                    // Fast is null and gap not complete - n exceeds list length
                    state.done = true;
                    state.result = null;

                    render();
                    renderPseudocode(6);
                    renderExplanation('nExceeds');
                    updateStatus(`N (${state.n}) exceeds list length`, 'n-exceeds');
                }
                updateButtons();
                return;
            }

            state.stage = 2;
        }

        // Stage 2: Move both until fast reaches null
        if (state.stage === 2) {
            const slowNode = state.nodes.find(n => n.id === state.slow);
            const fastNode = state.nodes.find(n => n.id === state.fast);

            if (!fastNode) {
                // Fast is null - slow is at the answer
                state.done = true;
                state.result = state.nodes.findIndex(n => n.id === state.slow);

                render();
                renderPseudocode(12);
                renderExplanation('found', {
                    nodeIndex: state.result,
                    nodeValue: slowNode.val
                });
                updateStatus(`Found: ${state.n}${getOrdinalSuffix(state.n)} from end is ${slowNode.val}`, 'nth-found');
                updateButtons();
                return;
            }

            // Store previous positions
            const slowFrom = state.nodes.findIndex(n => n.id === state.slow);
            const fastFrom = state.nodes.findIndex(n => n.id === state.fast);
            const slowFromVal = slowNode.val;
            const fastFromVal = fastNode.val;

            // Move both pointers
            state.slow = slowNode.next.id;
            state.fast = fastNode.next ? fastNode.next.id : null;
            state.iteration++;

            const newSlowNode = state.nodes.find(n => n.id === state.slow);
            const newFastNode = state.fast ? state.nodes.find(n => n.id === state.fast) : null;
            const slowTo = state.nodes.findIndex(n => n.id === state.slow);
            const fastTo = state.fast !== null ? state.nodes.findIndex(n => n.id === state.fast) : null;

            render();
            updateIterationCount();
            renderPseudocode(11);
            renderExplanation('moving', {
                iteration: state.iteration,
                slowFrom: slowFrom,
                slowTo: slowTo,
                fastFrom: fastFrom,
                fastTo: fastTo,
                slowFromVal: slowFromVal,
                slowToVal: newSlowNode.val,
                fastFromVal: fastFromVal,
                fastToVal: newFastNode ? newFastNode.val : null
            });

            if (state.fast === null) {
                // Fast reached null - slow is at the answer
                state.done = true;
                state.result = slowTo;

                render();
                renderPseudocode(12);
                renderExplanation('found', {
                    nodeIndex: state.result,
                    nodeValue: newSlowNode.val
                });
                updateStatus(`Found: ${state.n}${getOrdinalSuffix(state.n)} from end is ${newSlowNode.val}`, 'nth-found');
            } else {
                updateStatus(`Iteration ${state.iteration}: Moving both pointers`, 'info');
            }
            updateButtons();
        }
    }

    // ============================================================================
    // Palindrome Algorithm
    // ============================================================================

    function stepPalindrome() {
        if (state.done) return;

        if (state.nodes.length === 0) return;

        // Single node is always palindrome
        if (state.nodes.length === 1 && state.stage === 0) {
            state.done = true;
            state.result = true;
            render();
            renderPseudocode(14);
            renderExplanation('isPalindrome');
            updateStatus('Single node is a palindrome', 'palindrome-true');
            updateStageIndicator();
            updateButtons();
            return;
        }

        // Initialize - Stage 1: Find Middle
        if (state.stage === 0) {
            state.stage = 1;
            state.slow = state.nodes[0].id;
            state.fast = state.nodes[0].id;

            render();
            updateStageIndicator();
            renderPseudocode(3);
            renderExplanation('init');
            updateStatus('Stage 1: Finding middle', 'info');
            updateButtons();
            return;
        }

        // Stage 1: Find middle
        if (state.stage === 1) {
            const slowNode = state.nodes.find(n => n.id === state.slow);
            const fastNode = state.nodes.find(n => n.id === state.fast);

            // Check if fast can move 2 steps
            if (!fastNode || !fastNode.next) {
                // Fast reached end - slow is at middle
                state.middleIndex = state.nodes.findIndex(n => n.id === state.slow);
                state.stage = 2;

                render();
                updateStageIndicator();
                renderPseudocode(8);
                renderExplanation('middleFound', {
                    middleIndex: state.middleIndex,
                    middleValue: slowNode.val
                });
                updateStatus('Middle found, starting Stage 2: Reverse', 'info');
                updateButtons();
                return;
            }

            // Store previous positions
            const slowFrom = state.nodes.findIndex(n => n.id === state.slow);
            const fastFrom = state.nodes.findIndex(n => n.id === state.fast);
            const slowFromVal = slowNode.val;
            const fastFromVal = fastNode.val;

            // Move pointers
            state.slow = slowNode.next.id;
            state.fast = fastNode.next && fastNode.next.next ? fastNode.next.next.id : null;
            state.iteration++;

            const newSlowNode = state.nodes.find(n => n.id === state.slow);
            const newFastNode = state.fast ? state.nodes.find(n => n.id === state.fast) : null;
            const slowTo = state.nodes.findIndex(n => n.id === state.slow);
            const fastTo = state.fast !== null ? state.nodes.findIndex(n => n.id === state.fast) : null;

            render();
            updateIterationCount();
            renderPseudocode(6);
            renderExplanation('findingMiddle', {
                iteration: state.iteration,
                slowFrom: slowFrom,
                slowTo: slowTo,
                fastFrom: fastFrom,
                fastTo: fastTo,
                slowFromVal: slowFromVal,
                slowToVal: newSlowNode.val,
                fastFromVal: fastFromVal,
                fastToVal: newFastNode ? newFastNode.val : null
            });
            updateStatus(`Stage 1: Iteration ${state.iteration} - Finding middle`, 'info');

            // Check if we've found middle
            if (!newFastNode || !state.nodes.find(n => n.id === state.fast) || !state.nodes.find(n => n.id === state.fast).next) {
                state.middleIndex = slowTo;
                state.stage = 2;
                updateStageIndicator();
            }

            updateButtons();
            return;
        }

        // Stage 2: Reverse second half
        if (state.stage === 2) {
            // Build reversed second half
            const secondHalf = state.nodes.slice(state.middleIndex).map(n => n.val);
            state.reversedHalf = [...secondHalf].reverse();

            updateReversedHalfDisplay();
            render();
            updateStageIndicator();
            renderPseudocode(8);

            const firstHalf = state.nodes.slice(0, Math.ceil(state.nodes.length / 2)).map(n => n.val);

            renderExplanation('reverseComplete', {
                reversed: state.reversedHalf,
                firstHalf: firstHalf
            });
            updateStatus('Stage 2 complete, starting Stage 3: Compare', 'info');

            state.stage = 3;
            state.compareIndex = 0;
            state.slow = state.nodes[0].id;

            updateButtons();
            return;
        }

        // Stage 3: Compare
        if (state.stage === 3) {
            const compareLen = state.reversedHalf.length;

            if (state.compareIndex >= compareLen) {
                // All compared - is palindrome
                state.done = true;
                state.result = true;

                render();
                updateStageIndicator();
                renderPseudocode(14);
                renderExplanation('isPalindrome');
                updateStatus('Is Palindrome: TRUE', 'palindrome-true');
                updateButtons();
                return;
            }

            const firstHalfVal = state.nodes[state.compareIndex].val;
            const reversedVal = state.reversedHalf[state.compareIndex];

            // Update slow pointer to visualize current comparison position
            state.slow = state.nodes[state.compareIndex].id;
            render();

            renderPseudocode(12);
            renderExplanation('comparing', {
                position: state.compareIndex,
                val1: firstHalfVal,
                val2: reversedVal
            });

            if (firstHalfVal !== reversedVal) {
                // Mismatch - not palindrome
                state.done = true;
                state.result = false;

                render();
                updateStageIndicator();
                renderPseudocode(12);
                renderExplanation('notPalindrome', {
                    position: state.compareIndex,
                    val1: firstHalfVal,
                    val2: reversedVal
                });
                updateStatus('Is Palindrome: FALSE', 'palindrome-false');
                updateButtons();
                return;
            }

            state.compareIndex++;
            updateStatus(`Stage 3: Comparing position ${state.compareIndex}/${compareLen}`, 'info');

            // Check if all compared
            if (state.compareIndex >= compareLen) {
                state.done = true;
                state.result = true;

                render();
                updateStageIndicator();
                renderPseudocode(14);
                renderExplanation('isPalindrome');
                updateStatus('Is Palindrome: TRUE', 'palindrome-true');
            }

            updateButtons();
        }
    }

    // ============================================================================
    // Step Function (delegates to appropriate algorithm)
    // ============================================================================

    function step() {
        if (state.mode === 'nth') {
            stepNth();
        } else {
            stepPalindrome();
        }
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
        resetState();

        // Re-render
        render();
        updateIterationCount();
        updateStageIndicator();
        updateReversedHalfDisplay();
        renderPseudocode(0);
        updateInitialExplanation();
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

        // Get N value for nth mode
        if (state.mode === 'nth') {
            const nValue = parseInt(elements.nValueInput.value, 10);
            if (isNaN(nValue) || nValue < 1) {
                updateStatus('N must be a positive integer (>= 1)', 'error');
                return;
            }
            state.n = nValue;
        }

        // Create linked list
        const { nodes } = createLinkedList(values, -1);
        const positions = calculateLayout(nodes, -1);

        // Update state
        state.nodes = nodes;
        state.positions = positions;

        // Reset algorithm state
        resetState();

        // Render
        render();
        updateIterationCount();
        updateStageIndicator();
        updateReversedHalfDisplay();
        renderPseudocode(0);

        const loadMessage = state.mode === 'nth'
            ? `Loaded ${values.length} nodes. Finding ${state.n}${getOrdinalSuffix(state.n)} from end.`
            : `Loaded ${values.length} nodes. Checking if palindrome.`;

        elements.explanation.innerHTML = `
            <div class="step-title">Ready to start</div>
            <div class="step-detail">
                ${loadMessage}
                <br><br>
                Click <strong>Step</strong> to advance one step at a time, or <strong>Play</strong> to run automatically.
            </div>
        `;

        updateStatus(`Loaded ${values.length} nodes`, 'info');
        updateButtons();
    }

    // ============================================================================
    // UI Updates
    // ============================================================================

    function updateButtons() {
        const hasNodes = state.nodes.length > 0;
        const canStep = hasNodes && !state.done && !state.playing;
        const canPlay = hasNodes && !state.done && !state.playing;
        const canReset = hasNodes && (state.stage > 0 || state.done);

        elements.stepBtn.disabled = !canStep;
        elements.playBtn.disabled = !canPlay;
        elements.resetBtn.disabled = !canReset;

        elements.playBtn.textContent = state.playing ? 'Pause' : 'Play';
    }

    // ============================================================================
    // Event Listeners
    // ============================================================================

    function initEventListeners() {
        // Tab buttons
        tabButtons.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                if (mode && mode !== state.mode) {
                    setMode(mode);
                }
            });
        });

        // Preset selection
        elements.presetSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'custom') {
                elements.nodeValuesInput.value = '';
                if (state.mode === 'nth') {
                    elements.nValueInput.value = '2';
                }
            } else {
                loadPreset(value);
            }
        });

        // Node values input
        elements.nodeValuesInput.addEventListener('input', () => {
            elements.presetSelect.value = 'custom';
        });

        // N value input
        elements.nValueInput.addEventListener('input', () => {
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

        // Set default mode and load presets
        setMode('nth');

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
