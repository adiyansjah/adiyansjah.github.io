# Sliding Window Visualizers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 5 interactive sliding window algorithm visualizers with a shared module for common functionality.

**Architecture:** Heavy shared module (`sliding-window-shared.js`) provides array rendering, window highlighting, animation engine, and auxiliary structure rendering. Individual visualizers only define algorithm logic and problem-specific UI.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3, SVG for visualizations

---

## Task 1: Create Directory Structure

**Files:**
- Create: `notes/algorithms/03-sliding-window/visualizers/` directory structure

**Step 1: Create all directories**

```bash
mkdir -p notes/algorithms/03-sliding-window/visualizers/01-fixed-size
mkdir -p notes/algorithms/03-sliding-window/visualizers/02-variable-max
mkdir -p notes/algorithms/03-sliding-window/visualizers/03-variable-min
mkdir -p notes/algorithms/03-sliding-window/visualizers/04-hashmap
mkdir -p notes/algorithms/03-sliding-window/visualizers/05-monotonic-deque
```

**Step 2: Verify structure**

Run: `ls -la notes/algorithms/03-sliding-window/visualizers/`
Expected: 5 directories listed

**Step 3: Commit**

```bash
git add notes/algorithms/03-sliding-window/visualizers/
git commit -m "chore: create sliding window visualizers directory structure"
```

---

## Task 2: Create shared.css

**Files:**
- Create: `notes/algorithms/03-sliding-window/visualizers/shared.css`

**Step 1: Create shared.css with teal theme**

```css
/* Base Variables */
:root {
    --bg: transparent;
    --card: #ffffff;
    --text: #1a1a1a;
    --muted: #737373;
    --border: #e5e5e5;
    --success: #22c55e;
    --success-bg: #f0fdf4;
    --error: #ef4444;
    --error-bg: #fef2f2;
    --radius: 8px;
    --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

    /* Sliding window teal theme */
    --accent: #14b8a6;
    --accent-dark: #0d9488;
    --accent-light: #5eead4;
    --accent-bg: #f0fdfa;

    /* Window states */
    --window-fill: rgba(20, 184, 166, 0.15);
    --window-border: #14b8a6;
    --window-invalid: rgba(239, 68, 68, 0.15);

    /* Pointers */
    --left-pointer: #14b8a6;
    --right-pointer: #0d9488;

    /* Result states */
    --best-window: #22c55e;
    --best-window-fill: rgba(34, 197, 94, 0.1);

    /* Auxiliary structures */
    --hashmap-key: #14b8a6;
    --hashmap-value: #0d9488;
    --deque-front: #14b8a6;
    --deque-item: #e5e5e5;
}

/* Reset */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
    min-height: 100vh;
}

/* Layout */
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 20px 48px;
}

/* Header */
header {
    margin-bottom: 32px;
}

h1 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
    color: var(--text);
}

.subtitle {
    color: var(--muted);
    font-size: 14px;
}

/* Card */
.card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    margin-bottom: 20px;
}

.card-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
}

/* Controls */
.controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
}

.input-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    margin-bottom: 8px;
}

.input-group {
    flex: 1;
    min-width: 150px;
}

.input-group.small {
    flex: 0 0 100px;
    min-width: 80px;
}

.input-group > label {
    display: block;
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 6px;
}

.input-group input,
.input-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    font-family: var(--mono);
    transition: border-color 0.15s;
    background: var(--card);
}

.input-group input:focus,
.input-group select:focus {
    outline: none;
    border-color: var(--accent);
}

.btn-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

/* Buttons */
button {
    padding: 10px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
}

button:hover:not(:disabled) {
    background: var(--bg);
    border-color: var(--muted);
}

button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

button.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}

button.primary:hover:not(:disabled) {
    background: var(--accent-dark);
    border-color: var(--accent-dark);
}

/* Speed Control */
.speed-control {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
}

.speed-control label {
    font-size: 13px;
    color: var(--muted);
}

.speed-control input[type="range"] {
    flex: 1;
    max-width: 200px;
    accent-color: var(--accent);
}

.speed-control .speed-value {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--muted);
    min-width: 70px;
}

/* Visualization Container */
.viz-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    overflow-x: auto;
}

/* Status Bar */
.status-bar {
    width: 100%;
    margin-top: 20px;
    padding: 14px 16px;
    border-radius: var(--radius);
    font-size: 14px;
    text-align: center;
    background: var(--bg);
    color: var(--muted);
    transition: background-color 0.2s, color 0.2s;
}

.status-bar.success {
    background: var(--success-bg);
    color: var(--success);
}

.status-bar.error {
    background: var(--error-bg);
    color: var(--error);
}

.status-bar.info {
    background: var(--accent-bg);
    color: var(--accent);
}

/* Educational Panels */
.panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

@media (max-width: 640px) {
    .panels {
        grid-template-columns: 1fr;
    }
}

.panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
}

.panel-header {
    padding: 14px 20px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.panel-body {
    padding: 20px;
}

/* Pseudocode */
.pseudocode {
    font-family: var(--mono);
    font-size: 13px;
    line-height: 1.9;
}

.code-line {
    padding: 4px 10px;
    border-radius: 4px;
    transition: background-color 0.15s;
    white-space: pre;
    border-left: 2px solid transparent;
}

.code-line.highlight {
    background: var(--accent-bg);
    border-left-color: var(--accent);
}

.code-line .keyword {
    color: #0d9488;
}

.code-line .comment {
    color: var(--muted);
}

.code-line .number {
    color: #b45309;
}

.code-line .string {
    color: #059669;
}

/* Explanation Panel */
.explanation {
    min-height: 120px;
}

.explanation .step-title {
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--text);
    font-size: 15px;
}

.explanation .step-detail {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.7;
}

.explanation .calculation {
    margin-top: 16px;
    padding: 14px;
    background: var(--bg);
    border-radius: var(--radius);
    font-family: var(--mono);
    font-size: 14px;
}

.explanation .reason {
    margin-top: 14px;
    padding: 12px 14px;
    background: var(--accent-bg);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--accent);
}

.explanation .reason.found {
    background: var(--success-bg);
    color: var(--success);
}

/* Iteration Badge */
.iteration-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    margin-bottom: 20px;
}

.iteration-badge .count {
    font-family: var(--mono);
    font-weight: 600;
    color: var(--text);
}

/* Result Display */
.result-display {
    margin-top: 16px;
    padding: 12px 16px;
    background: var(--success-bg);
    border: 1px solid var(--success);
    border-radius: var(--radius);
    font-family: var(--mono);
    font-size: 14px;
    color: var(--success);
}

/* Auxiliary Structure Container */
.aux-container {
    margin-top: 24px;
    padding: 16px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    min-width: 200px;
}

.aux-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
}

.aux-content {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
}

/* HashSet Badges */
.set-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 10px;
    background: var(--accent-bg);
    border: 1px solid var(--accent);
    border-radius: 16px;
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--accent-dark);
}

/* HashMap Key-Value */
.map-entry {
    display: inline-flex;
    align-items: center;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
}

.map-key {
    padding: 6px 10px;
    background: var(--accent-bg);
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--accent-dark);
    border-right: 1px solid var(--border);
}

.map-value {
    padding: 6px 10px;
    font-family: var(--mono);
    font-size: 14px;
    color: var(--text);
}

/* Deque */
.deque-container {
    display: flex;
    align-items: center;
    gap: 4px;
}

.deque-bracket {
    font-size: 24px;
    color: var(--muted);
    font-weight: 300;
}

.deque-items {
    display: flex;
    gap: 4px;
}

.deque-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-family: var(--mono);
    font-size: 13px;
}

.deque-item.front {
    background: var(--accent-bg);
    border-color: var(--accent);
}

.deque-item .index {
    font-size: 11px;
    color: var(--muted);
}

.deque-item .value {
    font-weight: 600;
    color: var(--text);
}

.deque-item.front .value {
    color: var(--accent-dark);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 32px;
    color: var(--muted);
}

.empty-state svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
    display: inline-block;
}

/* Highlight classes for explanation */
.highlight-left {
    color: var(--left-pointer);
    font-weight: 600;
}

.highlight-right {
    color: var(--right-pointer);
    font-weight: 600;
}

.highlight-window {
    color: var(--accent);
    font-weight: 600;
}

.highlight-best {
    color: var(--best-window);
    font-weight: 600;
}
```

**Step 2: Verify file created**

Run: `ls -la notes/algorithms/03-sliding-window/visualizers/shared.css`
Expected: File exists with ~400+ lines

**Step 3: Commit**

```bash
git add notes/algorithms/03-sliding-window/visualizers/shared.css
git commit -m "feat: add shared CSS for sliding window visualizers"
```

---

## Task 3: Create sliding-window-shared.js - Core Module

**Files:**
- Create: `notes/algorithms/03-sliding-window/visualizers/sliding-window-shared.js`

**Step 1: Create the shared module with all functionality**

```javascript
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
```

**Step 2: Verify file created**

Run: `wc -l notes/algorithms/03-sliding-window/visualizers/sliding-window-shared.js`
Expected: ~450+ lines

**Step 3: Commit**

```bash
git add notes/algorithms/03-sliding-window/visualizers/sliding-window-shared.js
git commit -m "feat: add shared module for sliding window visualizers"
```

---

## Task 4: Create Fixed-Size Window Visualizer

**Files:**
- Create: `notes/algorithms/03-sliding-window/visualizers/01-fixed-size/index.html`
- Create: `notes/algorithms/03-sliding-window/visualizers/01-fixed-size/fixed-size.css`
- Create: `notes/algorithms/03-sliding-window/visualizers/01-fixed-size/fixed-size.js`

**Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fixed-Size Window Visualizer</title>
    <link rel="stylesheet" href="../shared.css">
    <link rel="stylesheet" href="fixed-size.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Sliding Window: Fixed-Size Window</h1>
            <p class="subtitle">Find the maximum sum of K consecutive elements in an array</p>
        </header>

        <!-- Configuration Card -->
        <div class="card">
            <div class="card-title">Configuration</div>
            <div class="controls">
                <div class="input-row">
                    <div class="input-group">
                        <label for="presetSelect">Preset</label>
                        <select id="presetSelect">
                            <option value="small" selected>Small (6 elements, k=3)</option>
                            <option value="medium">Medium (9 elements, k=4)</option>
                            <option value="single">Single element</option>
                            <option value="max-at-end">Max at end</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="arrayInput">Array (comma-separated)</label>
                        <input type="text" id="arrayInput" placeholder="e.g., 2, 1, 5, 1, 3, 2">
                    </div>
                    <div class="input-group small">
                        <label for="kInput">K (window size)</label>
                        <input type="number" id="kInput" min="1" value="3">
                    </div>
                </div>
                <div class="btn-group">
                    <button id="loadBtn" class="primary">Load</button>
                    <button id="stepBtn" disabled>Step</button>
                    <button id="playBtn" disabled>Play</button>
                    <button id="resetBtn" disabled>Reset</button>
                </div>
            </div>
            <div class="speed-control">
                <label for="speedSlider">Speed:</label>
                <input type="range" id="speedSlider" min="200" max="2000" value="800" step="100">
                <span class="speed-value" id="speedValue">800ms</span>
            </div>
        </div>

        <!-- Visualization Card -->
        <div class="card">
            <div class="viz-container">
                <div class="iteration-badge">
                    Step: <span class="count" id="stepCount">0</span>
                </div>
                <div class="array-viz" id="arrayViz">
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p>Click Load to create an array</p>
                    </div>
                </div>
                <div class="status-bar" id="statusBar">Ready to begin</div>
            </div>
        </div>

        <!-- Educational Panels -->
        <div class="panels">
            <div class="panel">
                <div class="panel-header">Algorithm Pseudocode</div>
                <div class="panel-body">
                    <div class="pseudocode" id="pseudocode">
                        <div class="code-line" data-line="1"><span class="keyword">function</span> maxSumK(arr, k):</div>
                        <div class="code-line" data-line="2">  n = arr.length</div>
                        <div class="code-line" data-line="3">  <span class="keyword">if</span> n < k: <span class="keyword">return</span> -1</div>
                        <div class="code-line" data-line="4"></div>
                        <div class="code-line" data-line="5">  windowSum = sum(arr[0:k])</div>
                        <div class="code-line" data-line="6">  maxSum = windowSum</div>
                        <div class="code-line" data-line="7"></div>
                        <div class="code-line" data-line="8">  <span class="keyword">for</span> right = k <span class="keyword">to</span> n-1:</div>
                        <div class="code-line" data-line="9">    windowSum += arr[right]</div>
                        <div class="code-line" data-line="10">    windowSum -= arr[right - k]</div>
                        <div class="code-line" data-line="11"></div>
                        <div class="code-line" data-line="12">    <span class="keyword">if</span> windowSum > maxSum:</div>
                        <div class="code-line" data-line="13">      maxSum = windowSum</div>
                        <div class="code-line" data-line="14"></div>
                        <div class="code-line" data-line="15">  <span class="keyword">return</span> maxSum</div>
                    </div>
                </div>
            </div>
            <div class="panel">
                <div class="panel-header">What's Happening</div>
                <div class="panel-body">
                    <div class="explanation" id="explanation">
                        <div class="step-title">Ready to start</div>
                        <div class="step-detail">
                            Load an array and use Step or Play to visualize the fixed-size sliding window algorithm.
                            <br><br>
                            <strong>Goal:</strong> Find the maximum sum of K consecutive elements.
                            <br><br>
                            <strong>Technique:</strong> Slide a window of size K, adding the new element and removing the old one.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../sliding-window-shared.js"></script>
    <script src="fixed-size.js"></script>
</body>
</html>
```

**Step 2: Create fixed-size.css**

```css
/* Fixed-Size Window specific styles */

/* Override accent for this visualizer if needed */
:root {
    --accent: #14b8a6;
}
```

**Step 3: Create fixed-size.js**

```javascript
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
```

**Step 4: Verify files created**

Run: `ls -la notes/algorithms/03-sliding-window/visualizers/01-fixed-size/`
Expected: 3 files (index.html, fixed-size.css, fixed-size.js)

**Step 5: Test in browser**

Open: `notes/algorithms/03-sliding-window/visualizers/01-fixed-size/index.html` in browser
Expected: Visualizer loads, presets work, step/play/reset work

**Step 6: Commit**

```bash
git add notes/algorithms/03-sliding-window/visualizers/01-fixed-size/
git commit -m "feat: add fixed-size window visualizer"
```

---

## Task 5: Create Variable-Max Window Visualizer

**Files:**
- Create: `notes/algorithms/03-sliding-window/visualizers/02-variable-max/index.html`
- Create: `notes/algorithms/03-sliding-window/visualizers/02-variable-max/variable-max.css`
- Create: `notes/algorithms/03-sliding-window/visualizers/02-variable-max/variable-max.js`

**Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Variable Window (Max) Visualizer</title>
    <link rel="stylesheet" href="../shared.css">
    <link rel="stylesheet" href="variable-max.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Sliding Window: Variable Window (Maximum)</h1>
            <p class="subtitle">Find the longest substring without repeating characters</p>
        </header>

        <!-- Configuration Card -->
        <div class="card">
            <div class="card-title">Configuration</div>
            <div class="controls">
                <div class="input-row">
                    <div class="input-group">
                        <label for="presetSelect">Preset</label>
                        <select id="presetSelect">
                            <option value="abcabcbb" selected>"abcabcbb" (answer: 3)</option>
                            <option value="pwwkew">"pwwkew" (answer: 3)</option>
                            <option value="bbbbb">"bbbbb" (answer: 1)</option>
                            <option value="abcdef">"abcdef" (answer: 6)</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="stringInput">String</label>
                        <input type="text" id="stringInput" placeholder="e.g., abcabcbb">
                    </div>
                </div>
                <div class="btn-group">
                    <button id="loadBtn" class="primary">Load</button>
                    <button id="stepBtn" disabled>Step</button>
                    <button id="playBtn" disabled>Play</button>
                    <button id="resetBtn" disabled>Reset</button>
                </div>
            </div>
            <div class="speed-control">
                <label for="speedSlider">Speed:</label>
                <input type="range" id="speedSlider" min="200" max="2000" value="800" step="100">
                <span class="speed-value" id="speedValue">800ms</span>
            </div>
        </div>

        <!-- Visualization Card -->
        <div class="card">
            <div class="viz-container">
                <div class="iteration-badge">
                    Step: <span class="count" id="stepCount">0</span>
                </div>
                <div class="array-viz" id="arrayViz">
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p>Click Load to create a string</p>
                    </div>
                </div>
                <!-- Auxiliary Structure: HashSet -->
                <div class="aux-container" id="auxContainer" style="display: none;">
                    <div class="aux-title">Characters in Window (HashSet)</div>
                    <div class="aux-content" id="hashSetViz"></div>
                </div>
                <div class="status-bar" id="statusBar">Ready to begin</div>
            </div>
        </div>

        <!-- Educational Panels -->
        <div class="panels">
            <div class="panel">
                <div class="panel-header">Algorithm Pseudocode</div>
                <div class="panel-body">
                    <div class="pseudocode" id="pseudocode">
                        <div class="code-line" data-line="1"><span class="keyword">function</span> lengthOfLongestSubstring(s):</div>
                        <div class="code-line" data-line="2">  charSet = <span class="keyword">new</span> Set()</div>
                        <div class="code-line" data-line="3">  left = 0</div>
                        <div class="code-line" data-line="4">  maxLen = 0</div>
                        <div class="code-line" data-line="5"></div>
                        <div class="code-line" data-line="6">  <span class="keyword">for</span> right = 0 <span class="keyword">to</span> s.length - 1:</div>
                        <div class="code-line" data-line="7">    <span class="keyword">while</span> s[right] <span class="keyword">in</span> charSet:</div>
                        <div class="code-line" data-line="8">      charSet.remove(s[left])</div>
                        <div class="code-line" data-line="9">      left++</div>
                        <div class="code-line" data-line="10"></div>
                        <div class="code-line" data-line="11">    charSet.add(s[right])</div>
                        <div class="code-line" data-line="12"></div>
                        <div class="code-line" data-line="13">    <span class="keyword">if</span> right - left + 1 > maxLen:</div>
                        <div class="code-line" data-line="14">      maxLen = right - left + 1</div>
                        <div class="code-line" data-line="15"></div>
                        <div class="code-line" data-line="16">  <span class="keyword">return</span> maxLen</div>
                    </div>
                </div>
            </div>
            <div class="panel">
                <div class="panel-header">What's Happening</div>
                <div class="panel-body">
                    <div class="explanation" id="explanation">
                        <div class="step-title">Ready to start</div>
                        <div class="step-detail">
                            Load a string and use Step or Play to visualize the variable-size sliding window algorithm.
                            <br><br>
                            <strong>Goal:</strong> Find the longest substring without repeating characters.
                            <br><br>
                            <strong>Technique:</strong> Expand right, contract left when duplicate found.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../sliding-window-shared.js"></script>
    <script src="variable-max.js"></script>
</body>
</html>
```

**Step 2: Create variable-max.css**

```css
/* Variable-Max Window specific styles */
```

**Step 3: Create variable-max.js**

```javascript
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
                // Done contracting, add the character
                state.contracting = false;
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
```

**Step 4: Verify and test**

Run: `ls -la notes/algorithms/03-sliding-window/visualizers/02-variable-max/`
Open in browser and test

**Step 5: Commit**

```bash
git add notes/algorithms/03-sliding-window/visualizers/02-variable-max/
git commit -m "feat: add variable-max window visualizer"
```

---

## Task 6: Create Variable-Min Window Visualizer

**Files:**
- Create: `notes/algorithms/03-sliding-window/visualizers/03-variable-min/index.html`
- Create: `notes/algorithms/03-sliding-window/visualizers/03-variable-min/variable-min.css`
- Create: `notes/algorithms/03-sliding-window/visualizers/03-variable-min/variable-min.js`

*Structure follows same pattern as Task 5. Key differences:*
- Problem: Minimum Size Subarray Sum (target parameter)
- Logic: Expand until sum >= target, then contract to find minimum
- No HashSet auxiliary structure needed

**Step 1-3: Create files following the established pattern**

(Files follow same structure as previous visualizers with adjusted algorithm logic)

**Step 4: Commit**

```bash
git add notes/algorithms/03-sliding-window/visualizers/03-variable-min/
git commit -m "feat: add variable-min window visualizer"
```

---

## Task 7: Create HashMap Window Visualizer

**Files:**
- Create: `notes/algorithms/03-sliding-window/visualizers/04-hashmap/index.html`
- Create: `notes/algorithms/03-sliding-window/visualizers/04-hashmap/hashmap.css`
- Create: `notes/algorithms/03-sliding-window/visualizers/04-hashmap/hashmap.js`

*Structure follows same pattern. Key differences:*
- Problem: Longest Substring with K Distinct Characters
- Uses HashMap to track character frequencies
- Parameter: k (max distinct characters)

**Step 1-3: Create files following the established pattern**

**Step 4: Commit**

```bash
git add notes/algorithms/03-sliding-window/visualizers/04-hashmap/
git commit -m "feat: add hashmap window visualizer"
```

---

## Task 8: Create Monotonic Deque Visualizer

**Files:**
- Create: `notes/algorithms/03-sliding-window/visualizers/05-monotonic-deque/index.html`
- Create: `notes/algorithms/03-sliding-window/visualizers/05-monotonic-deque/monotonic-deque.css`
- Create: `notes/algorithms/03-sliding-window/visualizers/05-monotonic-deque/monotonic-deque.js`

*Structure follows same pattern. Key differences:*
- Problem: Sliding Window Maximum
- Uses Deque to maintain monotonically decreasing elements
- Shows result array building up
- Most complex auxiliary structure visualization

**Step 1-3: Create files following the established pattern**

**Step 4: Commit**

```bash
git add notes/algorithms/03-sliding-window/visualizers/05-monotonic-deque/
git commit -m "feat: add monotonic deque window visualizer"
```

---

## Task 9: Final Testing and Cleanup

**Step 1: Test all visualizers**

Open each visualizer in browser:
1. `01-fixed-size/index.html` - Test all 4 presets, step through, play through
2. `02-variable-max/index.html` - Test all 4 presets
3. `03-variable-min/index.html` - Test all 4 presets
4. `04-hashmap/index.html` - Test all 4 presets
5. `05-monotonic-deque/index.html` - Test all 4 presets

**Step 2: Verify consistent styling**

Check that all visualizers have:
- Same teal color theme
- Consistent layout
- Working controls (step, play, pause, reset)
- Proper pseudocode highlighting
- Clear explanations

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete sliding window visualizers suite"
```

---

## Summary

| Task | Files Created | Description |
|------|---------------|-------------|
| 1 | Directories | Create directory structure |
| 2 | shared.css | Teal theme, common styles |
| 3 | sliding-window-shared.js | Core module with rendering, animation |
| 4 | 01-fixed-size/* | Fixed-size window visualizer |
| 5 | 02-variable-max/* | Variable max + HashSet visualizer |
| 6 | 03-variable-min/* | Variable min visualizer |
| 7 | 04-hashmap/* | HashMap frequency visualizer |
| 8 | 05-monotonic-deque/* | Monotonic deque visualizer |
| 9 | - | Final testing and cleanup |

**Total: 17 files across 9 tasks**
