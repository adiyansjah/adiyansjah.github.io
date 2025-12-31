/**
 * Shared module for Sliding Window visualizers
 * Provides array rendering, window highlighting, animation, and auxiliary structures
 */

// ============================================================================
// Constants
// ============================================================================

const LAYOUT = {
    cellSize: 48,
    cellGap: 8,
    padding: 40,
    pointerHeight: 30,
    windowPadding: 4
};

const COLORS = {
    cell: '#ffffff',
    cellBorder: '#e5e5e5',
    cellText: '#1a1a1a',
    windowFill: 'rgba(20, 184, 166, 0.15)',
    windowBorder: '#14b8a6',
    windowInvalid: 'rgba(239, 68, 68, 0.15)',
    leftPointer: '#14b8a6',
    rightPointer: '#0d9488',
    bestFill: 'rgba(34, 197, 94, 0.1)',
    bestBorder: '#22c55e',
    indexText: '#737373'
};

// ============================================================================
// SVG Utilities
// ============================================================================

function createSVGElement(tag, attrs = {}) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) {
        elem.setAttribute(key, value);
    }
    return elem;
}

// ============================================================================
// Array Rendering
// ============================================================================

/**
 * Renders an array visualization with optional window highlighting
 * @param {Element} container - Container element
 * @param {Array} array - Array of values (numbers or characters)
 * @param {Object} options - Rendering options
 * @param {number} options.left - Left pointer index (-1 for none)
 * @param {number} options.right - Right pointer index (-1 for none)
 * @param {Object} options.bestWindow - Best window found { left, right } or null
 * @param {boolean} options.isValid - Whether current window is valid
 * @param {Set} options.highlightIndices - Indices to highlight specially
 */
function renderArraySVG(container, array, options = {}) {
    const {
        left = -1,
        right = -1,
        bestWindow = null,
        isValid = true,
        highlightIndices = new Set()
    } = options;

    container.innerHTML = '';

    if (!array || array.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p>Click Load to create an array</p>
            </div>
        `;
        return;
    }

    const { cellSize, cellGap, padding, pointerHeight } = LAYOUT;
    const totalWidth = array.length * cellSize + (array.length - 1) * cellGap + padding * 2;
    const totalHeight = cellSize + pointerHeight * 2 + padding * 2;

    const svg = createSVGElement('svg', {
        width: String(totalWidth),
        height: String(totalHeight),
        viewBox: `0 0 ${totalWidth} ${totalHeight}`,
        class: 'array-svg'
    });

    const cellsY = padding + pointerHeight;

    // Draw best window background (if exists and different from current)
    if (bestWindow && bestWindow.left >= 0 && bestWindow.right >= 0) {
        const bestX = padding + bestWindow.left * (cellSize + cellGap) - 4;
        const bestWidth = (bestWindow.right - bestWindow.left + 1) * (cellSize + cellGap) - cellGap + 8;

        const bestRect = createSVGElement('rect', {
            x: String(bestX),
            y: String(cellsY - 4),
            width: String(bestWidth),
            height: String(cellSize + 8),
            fill: COLORS.bestFill,
            stroke: COLORS.bestBorder,
            'stroke-width': '2',
            'stroke-dasharray': '4,2',
            rx: '6'
        });
        svg.appendChild(bestRect);
    }

    // Draw current window background
    if (left >= 0 && right >= 0 && left <= right) {
        const windowX = padding + left * (cellSize + cellGap) - 4;
        const windowWidth = (right - left + 1) * (cellSize + cellGap) - cellGap + 8;

        const windowRect = createSVGElement('rect', {
            x: String(windowX),
            y: String(cellsY - 4),
            width: String(windowWidth),
            height: String(cellSize + 8),
            fill: isValid ? COLORS.windowFill : COLORS.windowInvalid,
            stroke: COLORS.windowBorder,
            'stroke-width': '2',
            rx: '6'
        });
        svg.appendChild(windowRect);
    }

    // Draw cells
    array.forEach((value, index) => {
        const x = padding + index * (cellSize + cellGap);
        const y = cellsY;

        // Cell background
        const isInWindow = left >= 0 && right >= 0 && index >= left && index <= right;
        const isHighlighted = highlightIndices.has(index);

        const rect = createSVGElement('rect', {
            x: String(x),
            y: String(y),
            width: String(cellSize),
            height: String(cellSize),
            fill: isHighlighted ? '#fef3c7' : COLORS.cell,
            stroke: isHighlighted ? '#f59e0b' : COLORS.cellBorder,
            'stroke-width': '2',
            rx: '6'
        });
        svg.appendChild(rect);

        // Cell value
        const text = createSVGElement('text', {
            x: String(x + cellSize / 2),
            y: String(y + cellSize / 2),
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            'font-size': '16',
            'font-weight': '600',
            fill: COLORS.cellText
        });
        text.textContent = String(value);
        svg.appendChild(text);

        // Index below cell
        const indexText = createSVGElement('text', {
            x: String(x + cellSize / 2),
            y: String(y + cellSize + 16),
            'text-anchor': 'middle',
            'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            'font-size': '11',
            fill: COLORS.indexText
        });
        indexText.textContent = String(index);
        svg.appendChild(indexText);
    });

    // Draw pointers
    if (left >= 0) {
        const leftX = padding + left * (cellSize + cellGap) + cellSize / 2;
        const leftY = cellsY - 8;

        // Pointer arrow
        const arrow = createSVGElement('path', {
            d: `M ${leftX} ${leftY} L ${leftX - 6} ${leftY - 10} L ${leftX + 6} ${leftY - 10} Z`,
            fill: COLORS.leftPointer
        });
        svg.appendChild(arrow);

        // Label
        const label = createSVGElement('text', {
            x: String(leftX),
            y: String(leftY - 16),
            'text-anchor': 'middle',
            'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            'font-size': '12',
            'font-weight': '600',
            fill: COLORS.leftPointer
        });
        label.textContent = 'L';
        svg.appendChild(label);
    }

    if (right >= 0) {
        const rightX = padding + right * (cellSize + cellGap) + cellSize / 2;
        const rightY = cellsY - 8;

        // Offset if same position as left
        const offset = (left === right) ? 16 : 0;

        const arrow = createSVGElement('path', {
            d: `M ${rightX + offset} ${rightY} L ${rightX + offset - 6} ${rightY - 10} L ${rightX + offset + 6} ${rightY - 10} Z`,
            fill: COLORS.rightPointer
        });
        svg.appendChild(arrow);

        const label = createSVGElement('text', {
            x: String(rightX + offset),
            y: String(rightY - 16),
            'text-anchor': 'middle',
            'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            'font-size': '12',
            'font-weight': '600',
            fill: COLORS.rightPointer
        });
        label.textContent = 'R';
        svg.appendChild(label);
    }

    container.appendChild(svg);
}

// ============================================================================
// Auxiliary Structure Rendering
// ============================================================================

/**
 * Renders a HashSet as badges
 * @param {Element} container - Container element with class aux-content
 * @param {Set|Array} set - Set or array of values
 */
function renderHashSet(container, set) {
    container.innerHTML = '';

    const values = set instanceof Set ? Array.from(set) : set;

    if (values.length === 0) {
        container.innerHTML = '<span style="color: var(--muted); font-style: italic;">empty</span>';
        return;
    }

    values.forEach(value => {
        const badge = document.createElement('span');
        badge.className = 'set-badge';
        badge.textContent = String(value);
        container.appendChild(badge);
    });
}

/**
 * Renders a HashMap as key-value pairs
 * @param {Element} container - Container element with class aux-content
 * @param {Map|Object} map - Map or object of key-value pairs
 */
function renderHashMap(container, map) {
    container.innerHTML = '';

    const entries = map instanceof Map ? Array.from(map.entries()) : Object.entries(map);

    if (entries.length === 0) {
        container.innerHTML = '<span style="color: var(--muted); font-style: italic;">empty</span>';
        return;
    }

    entries.forEach(([key, value]) => {
        const entry = document.createElement('div');
        entry.className = 'map-entry';
        entry.innerHTML = `
            <span class="map-key">${key}</span>
            <span class="map-value">${value}</span>
        `;
        container.appendChild(entry);
    });
}

/**
 * Renders a Deque (showing indices and values)
 * @param {Element} container - Container element with class aux-content
 * @param {Array} deque - Array of indices in the deque
 * @param {Array} array - Original array to get values from
 */
function renderDeque(container, deque, array) {
    container.innerHTML = '';

    if (deque.length === 0) {
        container.innerHTML = '<span style="color: var(--muted); font-style: italic;">empty</span>';
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'deque-container';

    const leftBracket = document.createElement('span');
    leftBracket.className = 'deque-bracket';
    leftBracket.textContent = '[';
    wrapper.appendChild(leftBracket);

    const items = document.createElement('div');
    items.className = 'deque-items';

    deque.forEach((index, i) => {
        const item = document.createElement('div');
        item.className = 'deque-item' + (i === 0 ? ' front' : '');
        item.innerHTML = `
            <span class="index">i=${index}</span>
            <span class="value">${array[index]}</span>
        `;
        items.appendChild(item);
    });

    wrapper.appendChild(items);

    const rightBracket = document.createElement('span');
    rightBracket.className = 'deque-bracket';
    rightBracket.textContent = ']';
    wrapper.appendChild(rightBracket);

    container.appendChild(wrapper);
}

// ============================================================================
// Animation Controller
// ============================================================================

/**
 * Creates an animation controller for step-by-step visualization
 * @param {Function} stepFn - Function to call for each step, returns true if done
 * @param {Object} options - Controller options
 * @returns {Object} Controller with play, pause, step, reset methods
 */
function createAnimationController(stepFn, options = {}) {
    const {
        speed = 500,
        onStep = () => {},
        onComplete = () => {},
        onReset = () => {}
    } = options;

    let playing = false;
    let timer = null;
    let currentSpeed = speed;

    function step() {
        const done = stepFn();
        onStep();
        if (done) {
            stop();
            onComplete();
        }
        return done;
    }

    function play() {
        if (playing) return;
        playing = true;

        function tick() {
            if (!playing) return;

            const done = step();
            if (!done && playing) {
                timer = setTimeout(tick, currentSpeed);
            }
        }

        tick();
    }

    function pause() {
        playing = false;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function stop() {
        pause();
    }

    function reset() {
        stop();
        onReset();
    }

    function setSpeed(newSpeed) {
        currentSpeed = newSpeed;
    }

    function isPlaying() {
        return playing;
    }

    return {
        step,
        play,
        pause,
        stop,
        reset,
        setSpeed,
        isPlaying
    };
}

// ============================================================================
// UI Helpers
// ============================================================================

/**
 * Highlights a line in pseudocode
 * @param {Element} container - Pseudocode container
 * @param {number} lineNumber - Line to highlight (0 to clear)
 */
function highlightPseudocode(container, lineNumber) {
    const lines = container.querySelectorAll('.code-line');
    lines.forEach(el => {
        el.classList.remove('highlight');
        if (parseInt(el.dataset.line, 10) === lineNumber) {
            el.classList.add('highlight');
        }
    });
}

/**
 * Updates status bar
 * @param {Element} statusBar - Status bar element
 * @param {string} message - Message to display
 * @param {string} type - Type: '', 'info', 'success', 'error'
 */
function updateStatusBar(statusBar, message, type = '') {
    statusBar.textContent = message;
    statusBar.className = 'status-bar';
    if (type) {
        statusBar.classList.add(type);
    }
}

// ============================================================================
// Input Parsing
// ============================================================================

/**
 * Parse comma-separated values into array
 * @param {string} input - Comma-separated string
 * @param {string} type - 'number' or 'string'
 * @returns {Array} Parsed array
 */
function parseArrayInput(input, type = 'number') {
    if (!input || typeof input !== 'string') {
        return [];
    }

    const trimmed = input.trim();
    if (!trimmed) return [];

    // Handle string input (for substrings)
    if (type === 'string' && !trimmed.includes(',')) {
        return trimmed.split('');
    }

    const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);

    if (type === 'number') {
        return parts.map(p => {
            const n = Number(p);
            if (isNaN(n)) {
                throw new Error(`Invalid number: "${p}"`);
            }
            return n;
        });
    }

    return parts;
}

/**
 * Calculate sum of array slice
 * @param {Array} array - Array of numbers
 * @param {number} left - Start index
 * @param {number} right - End index (inclusive)
 * @returns {number} Sum
 */
function calculateSum(array, left, right) {
    let sum = 0;
    for (let i = left; i <= right; i++) {
        sum += array[i];
    }
    return sum;
}

// ============================================================================
// Presets
// ============================================================================

const PRESETS = {
    fixedSize: {
        'small': { values: [2, 1, 5, 1, 3, 2], k: 3, label: 'Small (6 elements, k=3)' },
        'medium': { values: [1, 4, 2, 10, 2, 3, 1, 0, 20], k: 4, label: 'Medium (9 elements, k=4)' },
        'single': { values: [5], k: 1, label: 'Single element' },
        'max-at-end': { values: [1, 1, 1, 1, 9, 9, 9], k: 3, label: 'Max at end' }
    },
    variableMax: {
        'abcabcbb': { values: 'abcabcbb', label: '"abcabcbb" (answer: 3)' },
        'pwwkew': { values: 'pwwkew', label: '"pwwkew" (answer: 3)' },
        'bbbbb': { values: 'bbbbb', label: '"bbbbb" (answer: 1)' },
        'abcdef': { values: 'abcdef', label: '"abcdef" (answer: 6)' }
    },
    variableMin: {
        'small': { values: [2, 3, 1, 2, 4, 3], target: 7, label: 'Target=7 (answer: 2)' },
        'single-match': { values: [1, 4, 4], target: 4, label: 'Target=4 (answer: 1)' },
        'no-solution': { values: [1, 1, 1, 1], target: 100, label: 'No solution' },
        'whole-array': { values: [1, 2, 3, 4, 5], target: 15, label: 'Whole array needed' }
    },
    hashmap: {
        'eceba': { values: 'eceba', k: 2, label: '"eceba", k=2 (answer: 3)' },
        'aaabbcccc': { values: 'aaabbcccc', k: 2, label: '"aaabbcccc", k=2 (answer: 7)' },
        'k1': { values: 'aabbcc', k: 1, label: '"aabbcc", k=1 (answer: 2)' },
        'all-same': { values: 'aaaa', k: 1, label: '"aaaa", k=1 (answer: 4)' }
    },
    monotonicDeque: {
        'standard': { values: [1, 3, -1, -3, 5, 3, 6, 7], k: 3, label: 'Standard (k=3)' },
        'descending': { values: [9, 8, 7, 6, 5, 4, 3, 2, 1], k: 3, label: 'Descending' },
        'k1': { values: [1, 2, 3, 4], k: 1, label: 'k=1 (identity)' },
        'ascending': { values: [1, 2, 3, 4, 5], k: 3, label: 'Ascending' }
    }
};

// ============================================================================
// Export
// ============================================================================

window.SlidingWindowShared = {
    // Constants
    LAYOUT,
    COLORS,
    PRESETS,

    // SVG utilities
    createSVGElement,

    // Array rendering
    renderArraySVG,

    // Auxiliary structures
    renderHashSet,
    renderHashMap,
    renderDeque,

    // Animation
    createAnimationController,

    // UI helpers
    highlightPseudocode,
    updateStatusBar,

    // Input parsing
    parseArrayInput,
    calculateSum
};
