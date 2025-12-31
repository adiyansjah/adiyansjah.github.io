# Fast-Slow Pointers Visualizers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create 3 interactive visualizers for fast-slow pointer algorithm patterns with hybrid linked list layout.

**Architecture:** Shared module (`fast-slow-shared.js`) handles linked list data structure and SVG rendering. Each visualizer (cycle-detection, middle-finding, nth-palindrome) has its own HTML/CSS/JS using the shared module. Layout is hybrid: linear chain that curves into a circle when cycles exist.

**Tech Stack:** Vanilla HTML/CSS/JS, SVG for node/arrow rendering, CSS variables for theming (matching existing visualizers).

---

## Task 1: Create Directory Structure

**Files:**
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection/`
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/02-middle-finding/`
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/03-nth-palindrome/`

**Step 1: Create directories**

```bash
mkdir -p notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection
mkdir -p notes/algorithms/02-fast-slow-pointers/visualizers/02-middle-finding
mkdir -p notes/algorithms/02-fast-slow-pointers/visualizers/03-nth-palindrome
```

**Step 2: Copy shared.css**

```bash
cp notes/algorithms/01-two-pointers/visualizers/shared.css notes/algorithms/02-fast-slow-pointers/visualizers/shared.css
```

**Step 3: Verify structure**

```bash
ls -la notes/algorithms/02-fast-slow-pointers/visualizers/
```

Expected: 3 directories + shared.css

**Step 4: Commit**

```bash
git add notes/algorithms/02-fast-slow-pointers/visualizers/
git commit -m "chore: create fast-slow pointers visualizers directory structure"
```

---

## Task 2: Create Shared Linked List Module

**Files:**
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/fast-slow-shared.js`

**Step 1: Create the shared module with LinkedList class**

```javascript
// ===== Linked List Data Structure =====
class ListNode {
    constructor(val, next = null) {
        this.val = val;
        this.next = next;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

function createLinkedList(values, cycleIndex = -1) {
    if (values.length === 0) return null;

    const nodes = values.map(val => new ListNode(val));

    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].next = nodes[i + 1];
    }

    // Create cycle if specified
    if (cycleIndex >= 0 && cycleIndex < nodes.length) {
        nodes[nodes.length - 1].next = nodes[cycleIndex];
    }

    return { head: nodes[0], nodes, cycleIndex };
}

// ===== Layout Calculator =====
const LAYOUT = {
    nodeSize: 48,
    nodeSpacing: 80,
    verticalOffset: 120,
    cycleRadius: 80
};

function calculateLayout(nodes, cycleIndex) {
    const positions = new Map();

    if (cycleIndex < 0) {
        // No cycle - simple linear layout
        nodes.forEach((node, i) => {
            positions.set(node.id, {
                x: 50 + i * LAYOUT.nodeSpacing,
                y: 60,
                inCycle: false
            });
        });
    } else {
        // Hybrid layout: linear until cycle, then circular
        const linearCount = cycleIndex;
        const cycleNodes = nodes.slice(cycleIndex);
        const cycleCount = cycleNodes.length;

        // Linear portion
        for (let i = 0; i < linearCount; i++) {
            positions.set(nodes[i].id, {
                x: 50 + i * LAYOUT.nodeSpacing,
                y: 60,
                inCycle: false
            });
        }

        // Circular portion
        const cycleStartX = 50 + linearCount * LAYOUT.nodeSpacing;
        const cycleStartY = 60 + LAYOUT.verticalOffset;
        const angleStep = (2 * Math.PI) / cycleCount;

        cycleNodes.forEach((node, i) => {
            const angle = -Math.PI / 2 + i * angleStep; // Start from top
            positions.set(node.id, {
                x: cycleStartX + LAYOUT.cycleRadius * Math.cos(angle),
                y: cycleStartY + LAYOUT.cycleRadius * Math.sin(angle),
                inCycle: true
            });
        });
    }

    return positions;
}

// ===== SVG Renderer =====
function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
    return el;
}

function renderLinkedListSVG(container, nodes, positions, pointers = {}) {
    const { slow, fast, found, cycleEntry } = pointers;

    // Calculate SVG dimensions
    let maxX = 0, maxY = 0;
    positions.forEach(pos => {
        maxX = Math.max(maxX, pos.x + LAYOUT.nodeSize);
        maxY = Math.max(maxY, pos.y + LAYOUT.nodeSize);
    });

    const svg = createSVGElement('svg', {
        width: Math.max(maxX + 100, 400),
        height: Math.max(maxY + 80, 200),
        class: 'linked-list-svg'
    });

    // Add arrow marker definition
    const defs = createSVGElement('defs');
    const marker = createSVGElement('marker', {
        id: 'arrowhead',
        markerWidth: '10',
        markerHeight: '7',
        refX: '9',
        refY: '3.5',
        orient: 'auto'
    });
    const arrowPath = createSVGElement('polygon', {
        points: '0 0, 10 3.5, 0 7',
        fill: '#9ca3af'
    });
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Draw arrows first (so they're behind nodes)
    const arrowGroup = createSVGElement('g', { class: 'arrows' });
    nodes.forEach((node, i) => {
        if (node.next) {
            const from = positions.get(node.id);
            const to = positions.get(node.next.id);
            const arrow = createArrow(from, to);
            arrowGroup.appendChild(arrow);
        }
    });
    svg.appendChild(arrowGroup);

    // Draw NULL indicator for last node (if no cycle)
    const lastNode = nodes[nodes.length - 1];
    if (!lastNode.next) {
        const lastPos = positions.get(lastNode.id);
        const nullText = createSVGElement('text', {
            x: lastPos.x + LAYOUT.nodeSpacing,
            y: lastPos.y + LAYOUT.nodeSize / 2 + 5,
            class: 'null-text',
            fill: '#9ca3af',
            'font-size': '14',
            'font-family': 'monospace'
        });
        nullText.textContent = 'NULL';
        svg.appendChild(nullText);
    }

    // Draw nodes
    const nodeGroup = createSVGElement('g', { class: 'nodes' });
    nodes.forEach((node, i) => {
        const pos = positions.get(node.id);
        const nodeEl = createNodeElement(node, pos, {
            isSlow: slow === i,
            isFast: fast === i,
            isFound: found === i,
            isCycleEntry: cycleEntry === i
        });
        nodeGroup.appendChild(nodeEl);
    });
    svg.appendChild(nodeGroup);

    container.innerHTML = '';
    container.appendChild(svg);
}

function createArrow(from, to) {
    const fromX = from.x + LAYOUT.nodeSize / 2;
    const fromY = from.y + LAYOUT.nodeSize / 2;
    const toX = to.x + LAYOUT.nodeSize / 2;
    const toY = to.y + LAYOUT.nodeSize / 2;

    // Calculate direction and adjust for node radius
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nodeRadius = LAYOUT.nodeSize / 2;

    const startX = fromX + (dx / dist) * nodeRadius;
    const startY = fromY + (dy / dist) * nodeRadius;
    const endX = toX - (dx / dist) * (nodeRadius + 5);
    const endY = toY - (dy / dist) * (nodeRadius + 5);

    // Check if this is a curved arrow (going backwards for cycle)
    if (from.inCycle && to.inCycle) {
        // Use quadratic curve for cycle arrows
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const curvature = 20;
        const perpX = -(endY - startY) / dist * curvature;
        const perpY = (endX - startX) / dist * curvature;

        return createSVGElement('path', {
            d: `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`,
            stroke: '#9ca3af',
            'stroke-width': '2',
            fill: 'none',
            'marker-end': 'url(#arrowhead)'
        });
    }

    return createSVGElement('line', {
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        stroke: '#9ca3af',
        'stroke-width': '2',
        'marker-end': 'url(#arrowhead)'
    });
}

function createNodeElement(node, pos, states) {
    const { isSlow, isFast, isFound, isCycleEntry } = states;
    const g = createSVGElement('g', { class: 'node-group' });

    // Determine colors
    let strokeColor = '#e5e5e5';
    let fillColor = '#ffffff';

    if (isFound) {
        strokeColor = '#22c55e';
        fillColor = '#f0fdf4';
    } else if (isCycleEntry) {
        strokeColor = '#eab308';
        fillColor = '#fefce8';
    } else if (isSlow && isFast) {
        strokeColor = '#8b5cf6'; // Purple when both
        fillColor = '#f5f3ff';
    } else if (isSlow) {
        strokeColor = '#3b82f6'; // Blue
        fillColor = '#eff6ff';
    } else if (isFast) {
        strokeColor = '#f97316'; // Orange
        fillColor = '#fff7ed';
    }

    // Node circle
    const circle = createSVGElement('circle', {
        cx: pos.x + LAYOUT.nodeSize / 2,
        cy: pos.y + LAYOUT.nodeSize / 2,
        r: LAYOUT.nodeSize / 2 - 2,
        fill: fillColor,
        stroke: strokeColor,
        'stroke-width': '2'
    });
    g.appendChild(circle);

    // Node value text
    const text = createSVGElement('text', {
        x: pos.x + LAYOUT.nodeSize / 2,
        y: pos.y + LAYOUT.nodeSize / 2 + 5,
        'text-anchor': 'middle',
        'font-family': 'ui-monospace, monospace',
        'font-size': '16',
        'font-weight': '600',
        fill: '#1a1a1a'
    });
    text.textContent = node.val;
    g.appendChild(text);

    // Pointer icons above node
    if (isSlow || isFast) {
        const iconY = pos.y - 25;
        if (isSlow && isFast) {
            // Both pointers - stack them
            const slowIcon = createPointerIcon(pos.x + LAYOUT.nodeSize / 2 - 15, iconY, 'slow');
            const fastIcon = createPointerIcon(pos.x + LAYOUT.nodeSize / 2 + 5, iconY, 'fast');
            g.appendChild(slowIcon);
            g.appendChild(fastIcon);
        } else if (isSlow) {
            const icon = createPointerIcon(pos.x + LAYOUT.nodeSize / 2 - 10, iconY, 'slow');
            g.appendChild(icon);
        } else {
            const icon = createPointerIcon(pos.x + LAYOUT.nodeSize / 2 - 10, iconY, 'fast');
            g.appendChild(icon);
        }
    }

    return g;
}

function createPointerIcon(x, y, type) {
    const text = createSVGElement('text', {
        x: x,
        y: y,
        'font-size': '18'
    });
    text.textContent = type === 'slow' ? '🐢' : '🐇';
    return text;
}

// ===== Preset Generators =====
const PRESETS = {
    cycle: {
        'no-cycle-5': { values: [1, 2, 3, 4, 5], cycleIndex: -1, label: 'No cycle (5 nodes)' },
        'cycle-at-2': { values: [1, 2, 3, 4, 5, 6], cycleIndex: 1, label: 'Cycle at node 2' },
        'self-loop': { values: [1], cycleIndex: 0, label: 'Self-loop' },
        'long-tail': { values: [1, 2, 3, 4, 5, 6, 7], cycleIndex: 4, label: 'Long tail, short cycle' }
    },
    middle: {
        'odd-5': { values: [1, 2, 3, 4, 5], label: 'Odd length (5 nodes)' },
        'even-6': { values: [1, 2, 3, 4, 5, 6], label: 'Even length (6 nodes)' },
        'two-nodes': { values: [1, 2], label: 'Two nodes' },
        'single': { values: [1], label: 'Single node' }
    },
    nth: {
        'n-2': { values: [1, 2, 3, 4, 5], n: 2, label: '5 nodes, n=2' },
        'n-first': { values: [1, 2, 3, 4, 5], n: 5, label: '5 nodes, n=5 (first)' },
        'n-exceeds': { values: [1, 2, 3], n: 5, label: 'n exceeds length' }
    },
    palindrome: {
        'true-even': { values: [1, 2, 2, 1], label: '1→2→2→1 (true)' },
        'true-odd': { values: [1, 2, 3, 2, 1], label: '1→2→3→2→1 (true)' },
        'false': { values: [1, 2, 3], label: '1→2→3 (false)' },
        'single': { values: [1], label: 'Single node' }
    }
};

// ===== Utility Functions =====
function parseNodeValues(text) {
    const parts = text.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return [];
    const nums = parts.map(p => Number(p));
    if (nums.some(n => isNaN(n))) {
        throw new Error('Values must be numbers');
    }
    return nums;
}

// Export for use in visualizers
window.FastSlowShared = {
    ListNode,
    createLinkedList,
    calculateLayout,
    renderLinkedListSVG,
    PRESETS,
    parseNodeValues,
    LAYOUT
};
```

**Step 2: Verify syntax**

Open in browser console or use Node to check for syntax errors:

```bash
node --check notes/algorithms/02-fast-slow-pointers/visualizers/fast-slow-shared.js
```

Expected: No output (no syntax errors)

**Step 3: Commit**

```bash
git add notes/algorithms/02-fast-slow-pointers/visualizers/fast-slow-shared.js
git commit -m "feat: add shared linked list module for fast-slow visualizers"
```

---

## Task 3: Create Cycle Detection Visualizer HTML

**Files:**
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection/cycle-detection.html`

**Step 1: Create HTML structure**

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fast-Slow Pointers: Cycle Detection | Algorithm Visualizer</title>
    <link rel="stylesheet" href="../shared.css">
    <link rel="stylesheet" href="cycle-detection.css">
</head>

<body>
    <div class="container">
        <header>
            <h1>Fast-Slow Pointers: Cycle Detection</h1>
            <p class="subtitle">Detect cycles and find entry points using Floyd's Tortoise and Hare algorithm</p>
        </header>

        <!-- Controls -->
        <div class="card">
            <div class="card-title">Configuration</div>
            <div class="controls">
                <div class="input-group">
                    <label for="presetSelect">Preset</label>
                    <select id="presetSelect">
                        <option value="no-cycle-5">No cycle (5 nodes)</option>
                        <option value="cycle-at-2" selected>Cycle at node 2</option>
                        <option value="self-loop">Self-loop</option>
                        <option value="long-tail">Long tail, short cycle</option>
                        <option value="custom">Custom...</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="valuesInput">Node Values</label>
                    <input type="text" id="valuesInput" value="1, 2, 3, 4, 5, 6" placeholder="1, 2, 3, 4, 5">
                </div>
                <div class="input-group" style="max-width: 150px;">
                    <label for="cycleInput">Cycle to Index</label>
                    <select id="cycleInput">
                        <option value="-1">None</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
                <div class="btn-group">
                    <button id="btnLoad" class="primary">Load</button>
                    <button id="btnStep" disabled>Step</button>
                    <button id="btnPlay" disabled>Play</button>
                    <button id="btnReset" disabled>Reset</button>
                </div>
                <div class="speed-control">
                    <label>Speed:</label>
                    <input type="range" id="speedSlider" min="200" max="2000" value="800" step="100">
                    <span class="speed-value" id="speedValue">800ms</span>
                </div>
            </div>
        </div>

        <!-- Phase Indicator -->
        <div class="phase-indicator" id="phaseIndicator">
            <span class="phase phase-1 active">Phase 1: Detection</span>
            <span class="phase-arrow">→</span>
            <span class="phase phase-2">Phase 2: Find Entry</span>
        </div>

        <!-- Visualization -->
        <div class="card">
            <div class="viz-container">
                <div class="iteration-badge">
                    Iteration: <span class="count" id="iterCount">0</span>
                </div>
                <div class="linked-list-viz" id="linkedListViz">
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <p>Configure a linked list and click Load to begin</p>
                    </div>
                </div>
                <div class="status-bar" id="statusBar">
                    Ready to start. Configure a linked list above.
                </div>
            </div>
        </div>

        <!-- Educational Panels -->
        <div class="panels">
            <!-- Pseudocode -->
            <div class="panel">
                <div class="panel-header">Algorithm</div>
                <div class="panel-body">
                    <div class="pseudocode" id="pseudocode">
                        <div class="code-line" data-line="0"><span class="keyword">def</span> detect_cycle(head):</div>
                        <div class="code-line" data-line="1">    slow = fast = head</div>
                        <div class="code-line" data-line="2">    <span class="comment"># Phase 1: Detect cycle</span></div>
                        <div class="code-line" data-line="3">    <span class="keyword">while</span> fast <span class="keyword">and</span> fast.next:</div>
                        <div class="code-line" data-line="4">        slow = slow.next</div>
                        <div class="code-line" data-line="5">        fast = fast.next.next</div>
                        <div class="code-line" data-line="6">        <span class="keyword">if</span> slow == fast:</div>
                        <div class="code-line" data-line="7">            <span class="keyword">break</span> <span class="comment"># Cycle found!</span></div>
                        <div class="code-line" data-line="8">    <span class="keyword">else</span>:</div>
                        <div class="code-line" data-line="9">        <span class="keyword">return</span> None <span class="comment"># No cycle</span></div>
                        <div class="code-line" data-line="10">    <span class="comment"># Phase 2: Find entry</span></div>
                        <div class="code-line" data-line="11">    slow = head</div>
                        <div class="code-line" data-line="12">    <span class="keyword">while</span> slow != fast:</div>
                        <div class="code-line" data-line="13">        slow = slow.next</div>
                        <div class="code-line" data-line="14">        fast = fast.next</div>
                        <div class="code-line" data-line="15">    <span class="keyword">return</span> slow <span class="comment"># Entry point</span></div>
                    </div>
                </div>
            </div>

            <!-- Explanation -->
            <div class="panel">
                <div class="panel-header">What's Happening</div>
                <div class="panel-body">
                    <div class="explanation" id="explanation">
                        <div class="step-title">Ready to Start</div>
                        <div class="step-detail">
                            Floyd's algorithm uses two pointers moving at different speeds.
                            If a cycle exists, the fast pointer will eventually catch up to the slow pointer.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../fast-slow-shared.js"></script>
    <script src="cycle-detection.js"></script>
</body>

</html>
```

**Step 2: Verify HTML in browser**

Open `notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection/cycle-detection.html` in browser.

Expected: Page loads with structure visible (styling may be incomplete)

**Step 3: Commit**

```bash
git add notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection/cycle-detection.html
git commit -m "feat: add cycle detection visualizer HTML structure"
```

---

## Task 4: Create Cycle Detection Visualizer CSS

**Files:**
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection/cycle-detection.css`

**Step 1: Create CSS styles**

```css
/* Algorithm-specific colors */
:root {
    --accent: #8b5cf6;
    --accent-bg: #f5f3ff;
    --slow-color: #3b82f6;
    --slow-bg: #eff6ff;
    --fast-color: #f97316;
    --fast-bg: #fff7ed;
    --both-color: #8b5cf6;
    --both-bg: #f5f3ff;
    --found-color: #22c55e;
    --entry-color: #eab308;
    --entry-bg: #fefce8;
}

/* Phase Indicator */
.phase-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px 20px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
}

.phase {
    padding: 6px 14px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    background: var(--bg);
    transition: all 0.2s;
}

.phase.active {
    background: var(--accent-bg);
    color: var(--accent);
    font-weight: 600;
}

.phase.completed {
    background: var(--success-bg);
    color: var(--success);
}

.phase-arrow {
    color: var(--muted);
    font-size: 16px;
}

/* Linked List Visualization */
.linked-list-viz {
    min-height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-x: auto;
}

.linked-list-svg {
    display: block;
}

/* Select dropdown styling */
select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    background: var(--card);
    cursor: pointer;
    transition: border-color 0.15s;
}

select:focus {
    outline: none;
    border-color: var(--accent);
}

/* Legend */
.legend {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--muted);
}

.legend-icon {
    font-size: 16px;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid;
}

.legend-color.slow {
    border-color: var(--slow-color);
    background: var(--slow-bg);
}

.legend-color.fast {
    border-color: var(--fast-color);
    background: var(--fast-bg);
}

.legend-color.both {
    border-color: var(--both-color);
    background: var(--both-bg);
}

/* Explanation highlights */
.explanation .highlight-slow {
    color: var(--slow-color);
    font-weight: 600;
}

.explanation .highlight-fast {
    color: var(--fast-color);
    font-weight: 600;
}

.explanation .reason.phase-2 {
    background: var(--entry-bg);
    color: #a16207;
}

/* Animation for meeting point */
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.node-group.meeting circle {
    animation: pulse 0.5s ease-in-out 2;
}
```

**Step 2: Verify styling in browser**

Refresh `cycle-detection.html` in browser.

Expected: Phase indicator and layout styled correctly

**Step 3: Commit**

```bash
git add notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection/cycle-detection.css
git commit -m "feat: add cycle detection visualizer CSS styles"
```

---

## Task 5: Create Cycle Detection Visualizer JavaScript

**Files:**
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection/cycle-detection.js`

**Step 1: Create JavaScript logic**

```javascript
// ===== State =====
const state = {
    nodes: [],
    head: null,
    cycleIndex: -1,
    slow: null,
    fast: null,
    phase: 0, // 0=not started, 1=detection, 2=finding entry
    iteration: 0,
    done: false,
    hasCycle: false,
    meetingPoint: null,
    cycleEntry: null,
    playing: false,
    timer: null
};

// ===== DOM Elements =====
const $ = id => document.getElementById(id);
const presetSelect = $('presetSelect');
const valuesInput = $('valuesInput');
const cycleInput = $('cycleInput');
const linkedListViz = $('linkedListViz');
const iterCount = $('iterCount');
const statusBar = $('statusBar');
const pseudocode = $('pseudocode');
const explanation = $('explanation');
const phaseIndicator = $('phaseIndicator');
const btnLoad = $('btnLoad');
const btnStep = $('btnStep');
const btnPlay = $('btnPlay');
const btnReset = $('btnReset');
const speedSlider = $('speedSlider');
const speedValue = $('speedValue');

const { createLinkedList, calculateLayout, renderLinkedListSVG, PRESETS, parseNodeValues } = window.FastSlowShared;

// ===== Preset Handling =====
function loadPreset(presetKey) {
    if (presetKey === 'custom') return;

    const preset = PRESETS.cycle[presetKey];
    if (preset) {
        valuesInput.value = preset.values.join(', ');
        updateCycleOptions(preset.values.length);
        cycleInput.value = preset.cycleIndex;
    }
}

function updateCycleOptions(length) {
    cycleInput.innerHTML = '<option value="-1">None</option>';
    for (let i = 0; i < length; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Index ${i}`;
        cycleInput.appendChild(option);
    }
}

// ===== Rendering =====
function render() {
    if (state.nodes.length === 0) {
        linkedListViz.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                </svg>
                <p>Configure a linked list and click Load to begin</p>
            </div>
        `;
        return;
    }

    const positions = calculateLayout(state.nodes, state.cycleIndex);
    renderLinkedListSVG(linkedListViz, state.nodes, positions, {
        slow: state.slow,
        fast: state.fast,
        found: state.meetingPoint,
        cycleEntry: state.cycleEntry
    });

    iterCount.textContent = state.iteration;
    updateButtons();
    updatePhaseIndicator();
}

function updatePhaseIndicator() {
    const phases = phaseIndicator.querySelectorAll('.phase');
    phases.forEach(p => p.classList.remove('active', 'completed'));

    if (state.phase === 1) {
        phases[0].classList.add('active');
    } else if (state.phase === 2) {
        phases[0].classList.add('completed');
        phases[1].classList.add('active');
    } else if (state.done && state.cycleEntry !== null) {
        phases[0].classList.add('completed');
        phases[1].classList.add('completed');
    }
}

function renderPseudocode(line) {
    const lines = pseudocode.querySelectorAll('.code-line');
    lines.forEach(el => {
        el.classList.remove('highlight');
        if (parseInt(el.dataset.line) === line) {
            el.classList.add('highlight');
        }
    });
}

function renderExplanation(type, data = {}) {
    const templates = {
        init: () => `
            <div class="step-title">Initialized</div>
            <div class="step-detail">
                Both pointers start at the head of the list.
            </div>
            <div class="calculation">
                <span class="highlight-slow">🐢 Slow</span> at index 0<br>
                <span class="highlight-fast">🐇 Fast</span> at index 0
            </div>
        `,
        moving: () => `
            <div class="step-title">Moving Pointers</div>
            <div class="step-detail">
                Slow moves 1 step, Fast moves 2 steps.
            </div>
            <div class="calculation">
                <span class="highlight-slow">🐢 Slow</span>: ${data.slowFrom} → ${state.slow}<br>
                <span class="highlight-fast">🐇 Fast</span>: ${data.fastFrom} → ${state.fast}
            </div>
        `,
        noCycle: () => `
            <div class="step-title">No Cycle Detected</div>
            <div class="step-detail">
                Fast pointer reached NULL. The list has no cycle.
            </div>
            <div class="reason">
                Algorithm complete in O(n) time, O(1) space.
            </div>
        `,
        cycleFound: () => `
            <div class="step-title">Cycle Detected!</div>
            <div class="step-detail">
                The pointers met at index ${state.meetingPoint}. A cycle exists!
            </div>
            <div class="reason">
                Now entering Phase 2 to find the cycle entry point.
            </div>
        `,
        phase2Init: () => `
            <div class="step-title">Phase 2: Finding Entry</div>
            <div class="step-detail">
                Reset slow to head. Both now move at speed 1.
            </div>
            <div class="calculation">
                <span class="highlight-slow">🐢 Slow</span>: reset to head (index 0)<br>
                <span class="highlight-fast">🐇 Fast</span>: stays at meeting point (index ${state.fast})
            </div>
        `,
        phase2Moving: () => `
            <div class="step-title">Moving to Entry</div>
            <div class="step-detail">
                Both pointers move 1 step at a time.
            </div>
            <div class="calculation">
                <span class="highlight-slow">🐢 Slow</span>: ${data.slowFrom} → ${state.slow}<br>
                <span class="highlight-fast">🐇 Fast</span>: ${data.fastFrom} → ${state.fast}
            </div>
        `,
        entryFound: () => `
            <div class="step-title">Cycle Entry Found!</div>
            <div class="step-detail">
                Both pointers met at the cycle entry point: index ${state.cycleEntry}.
            </div>
            <div class="reason phase-2">
                The cycle starts at node with value ${state.nodes[state.cycleEntry].val}.
            </div>
        `,
        ready: () => `
            <div class="step-title">Ready to Start</div>
            <div class="step-detail">
                Floyd's algorithm uses two pointers moving at different speeds.
                If a cycle exists, the fast pointer will eventually catch up to the slow pointer.
            </div>
        `
    };

    explanation.innerHTML = templates[type] ? templates[type]() : templates.ready();
}

function setStatus(message, type = '') {
    statusBar.textContent = message;
    statusBar.className = 'status-bar' + (type ? ` ${type}` : '');
}

function updateButtons() {
    const canRun = state.nodes.length >= 1 && !state.done;
    btnStep.disabled = !canRun || state.playing;
    btnPlay.disabled = !canRun;
    btnReset.disabled = state.nodes.length === 0;
    btnPlay.textContent = state.playing ? 'Pause' : 'Play';
}

// ===== Algorithm =====
function initRun() {
    stopPlaying();

    try {
        const values = parseNodeValues(valuesInput.value);
        if (values.length === 0) {
            throw new Error('Enter at least 1 node value');
        }

        const cycleIdx = parseInt(cycleInput.value);
        const { head, nodes } = createLinkedList(values, cycleIdx);

        Object.assign(state, {
            nodes,
            head,
            cycleIndex: cycleIdx,
            slow: 0,
            fast: 0,
            phase: 1,
            iteration: 0,
            done: false,
            hasCycle: cycleIdx >= 0,
            meetingPoint: null,
            cycleEntry: null
        });

        setStatus(`Loaded ${values.length} nodes. ${cycleIdx >= 0 ? `Cycle at index ${cycleIdx}.` : 'No cycle.'} Click Step or Play.`, 'info');
        renderExplanation('init');
        renderPseudocode(1);
        render();

    } catch (e) {
        setStatus(e.message, 'error');
        Object.assign(state, {
            nodes: [],
            head: null,
            done: true
        });
        render();
    }
}

function step() {
    if (state.done || state.nodes.length === 0) return;

    if (state.phase === 1) {
        stepPhase1();
    } else if (state.phase === 2) {
        stepPhase2();
    }
}

function stepPhase1() {
    const slowFrom = state.slow;
    const fastFrom = state.fast;

    // Check if fast can move
    const fastNode = state.nodes[state.fast];
    if (!fastNode.next) {
        // No cycle - fast reached end
        state.done = true;
        state.phase = 0;
        setStatus('No cycle detected. Fast pointer reached NULL.', 'info');
        renderExplanation('noCycle');
        renderPseudocode(9);
        render();
        stopPlaying();
        return;
    }

    const fastNextNode = fastNode.next;
    if (!fastNextNode.next && state.cycleIndex < 0) {
        // Fast.next exists but fast.next.next doesn't (and no cycle)
        state.done = true;
        state.phase = 0;
        setStatus('No cycle detected. Fast pointer reached end.', 'info');
        renderExplanation('noCycle');
        renderPseudocode(9);
        render();
        stopPlaying();
        return;
    }

    // Move pointers
    state.slow = state.nodes.findIndex(n => n === state.nodes[state.slow].next);

    // Fast moves twice
    let fastNext = state.nodes[state.fast].next;
    let fastNextIdx = state.nodes.findIndex(n => n === fastNext);
    if (fastNext.next) {
        fastNext = fastNext.next;
        fastNextIdx = state.nodes.findIndex(n => n === fastNext);
    }
    state.fast = fastNextIdx;

    state.iteration++;

    // Check if they met
    if (state.slow === state.fast) {
        state.meetingPoint = state.slow;
        state.phase = 2;
        setStatus(`Cycle detected! Pointers met at index ${state.slow}. Starting Phase 2...`, 'success');
        renderExplanation('cycleFound');
        renderPseudocode(7);
        render();

        // Auto-transition to Phase 2 init after a brief pause
        if (state.playing) {
            setTimeout(() => {
                if (state.phase === 2 && !state.done) {
                    initPhase2();
                }
            }, parseInt(speedSlider.value));
        }
        return;
    }

    setStatus(`Slow: ${slowFrom} → ${state.slow}, Fast: ${fastFrom} → ${state.fast}`, 'info');
    renderExplanation('moving', { slowFrom, fastFrom });
    renderPseudocode(5);
    render();
}

function initPhase2() {
    state.slow = 0; // Reset slow to head
    // fast stays at meeting point
    setStatus('Phase 2: Slow reset to head. Both move at speed 1.', 'info');
    renderExplanation('phase2Init');
    renderPseudocode(11);
    render();
}

function stepPhase2() {
    // Check if we need to init phase 2
    if (state.slow === 0 && state.fast === state.meetingPoint && state.iteration > 0) {
        // Already at start of phase 2, just rendered init
    }

    // Check if already at entry
    if (state.slow === state.fast && state.slow !== 0) {
        state.cycleEntry = state.slow;
        state.done = true;
        setStatus(`Cycle entry found at index ${state.cycleEntry}!`, 'success');
        renderExplanation('entryFound');
        renderPseudocode(15);
        render();
        stopPlaying();
        return;
    }

    // First step of phase 2 - init positions
    if (state.slow !== 0 || state.fast !== state.meetingPoint || state.meetingPoint === 0) {
        const slowFrom = state.slow;
        const fastFrom = state.fast;

        // Move both by 1
        state.slow = state.nodes.findIndex(n => n === state.nodes[state.slow].next);
        state.fast = state.nodes.findIndex(n => n === state.nodes[state.fast].next);
        state.iteration++;

        // Check if they met
        if (state.slow === state.fast) {
            state.cycleEntry = state.slow;
            state.done = true;
            setStatus(`Cycle entry found at index ${state.cycleEntry}!`, 'success');
            renderExplanation('entryFound');
            renderPseudocode(15);
            render();
            stopPlaying();
            return;
        }

        setStatus(`Phase 2: Slow ${slowFrom} → ${state.slow}, Fast ${fastFrom} → ${state.fast}`, 'info');
        renderExplanation('phase2Moving', { slowFrom, fastFrom });
        renderPseudocode(14);
        render();
    } else {
        initPhase2();
    }
}

function play() {
    if (state.nodes.length === 0 || state.done) return;

    if (state.playing) {
        stopPlaying();
        setStatus('Paused.', 'info');
        return;
    }

    state.playing = true;
    updateButtons();
    setStatus('Playing...', 'info');

    const tick = () => {
        if (!state.playing || state.done) {
            stopPlaying();
            return;
        }
        step();
        if (state.playing && !state.done) {
            state.timer = setTimeout(tick, parseInt(speedSlider.value));
        }
    };

    state.timer = setTimeout(tick, parseInt(speedSlider.value));
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
    initRun();
}

// ===== Event Listeners =====
presetSelect.addEventListener('change', () => {
    loadPreset(presetSelect.value);
});

valuesInput.addEventListener('input', () => {
    presetSelect.value = 'custom';
    try {
        const values = parseNodeValues(valuesInput.value);
        updateCycleOptions(values.length);
    } catch (e) {
        // Invalid input, ignore
    }
});

btnLoad.addEventListener('click', initRun);
btnStep.addEventListener('click', step);
btnPlay.addEventListener('click', play);
btnReset.addEventListener('click', reset);

speedSlider.addEventListener('input', () => {
    speedValue.textContent = `${speedSlider.value}ms`;
});

valuesInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') initRun();
});

// ===== Initialize =====
speedValue.textContent = `${speedSlider.value}ms`;
loadPreset('cycle-at-2');
```

**Step 2: Test in browser**

Open `cycle-detection.html` and test:
1. Load preset "Cycle at node 2"
2. Click Step - pointers should move
3. Click Play - animation should run
4. Test "No cycle" preset - should detect no cycle

Expected: Visualization works, pointers animate correctly

**Step 3: Commit**

```bash
git add notes/algorithms/02-fast-slow-pointers/visualizers/01-cycle-detection/cycle-detection.js
git commit -m "feat: add cycle detection visualizer JavaScript logic"
```

---

## Task 6: Create Middle Finding Visualizer

**Files:**
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/02-middle-finding/middle-finding.html`
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/02-middle-finding/middle-finding.css`
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/02-middle-finding/middle-finding.js`

**Step 1: Create HTML**

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fast-Slow Pointers: Middle Finding | Algorithm Visualizer</title>
    <link rel="stylesheet" href="../shared.css">
    <link rel="stylesheet" href="middle-finding.css">
</head>

<body>
    <div class="container">
        <header>
            <h1>Fast-Slow Pointers: Middle Finding</h1>
            <p class="subtitle">Find the middle element of a linked list in one pass</p>
        </header>

        <!-- Controls -->
        <div class="card">
            <div class="card-title">Configuration</div>
            <div class="controls">
                <div class="input-group">
                    <label for="presetSelect">Preset</label>
                    <select id="presetSelect">
                        <option value="odd-5" selected>Odd length (5 nodes)</option>
                        <option value="even-6">Even length (6 nodes)</option>
                        <option value="two-nodes">Two nodes</option>
                        <option value="single">Single node</option>
                        <option value="custom">Custom...</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="valuesInput">Node Values</label>
                    <input type="text" id="valuesInput" value="1, 2, 3, 4, 5" placeholder="1, 2, 3, 4, 5">
                </div>
                <div class="input-group middle-toggle">
                    <label>For Even Length</label>
                    <div class="toggle-group">
                        <label class="toggle-option">
                            <input type="radio" name="middleType" value="first" checked>
                            <span>First Middle</span>
                        </label>
                        <label class="toggle-option">
                            <input type="radio" name="middleType" value="second">
                            <span>Second Middle</span>
                        </label>
                    </div>
                </div>
            </div>
            <div style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
                <div class="btn-group">
                    <button id="btnLoad" class="primary">Load</button>
                    <button id="btnStep" disabled>Step</button>
                    <button id="btnPlay" disabled>Play</button>
                    <button id="btnReset" disabled>Reset</button>
                </div>
                <div class="speed-control">
                    <label>Speed:</label>
                    <input type="range" id="speedSlider" min="200" max="2000" value="800" step="100">
                    <span class="speed-value" id="speedValue">800ms</span>
                </div>
            </div>
        </div>

        <!-- Visualization -->
        <div class="card">
            <div class="viz-container">
                <div class="iteration-badge">
                    Iteration: <span class="count" id="iterCount">0</span>
                </div>
                <div class="linked-list-viz" id="linkedListViz">
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <p>Configure a linked list and click Load to begin</p>
                    </div>
                </div>
                <div class="status-bar" id="statusBar">
                    Ready to start. Configure a linked list above.
                </div>
            </div>
        </div>

        <!-- Educational Panels -->
        <div class="panels">
            <div class="panel">
                <div class="panel-header">Algorithm</div>
                <div class="panel-body">
                    <div class="pseudocode" id="pseudocode">
                        <div class="code-line" data-line="0"><span class="keyword">def</span> find_middle(head):</div>
                        <div class="code-line" data-line="1">    slow = fast = head</div>
                        <div class="code-line first-middle" data-line="2">    <span class="keyword">while</span> fast.next <span class="keyword">and</span> fast.next.next:</div>
                        <div class="code-line second-middle" data-line="2">    <span class="keyword">while</span> fast <span class="keyword">and</span> fast.next:</div>
                        <div class="code-line" data-line="3">        slow = slow.next</div>
                        <div class="code-line" data-line="4">        fast = fast.next.next</div>
                        <div class="code-line" data-line="5">    <span class="keyword">return</span> slow <span class="comment"># Middle!</span></div>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="panel-header">What's Happening</div>
                <div class="panel-body">
                    <div class="explanation" id="explanation">
                        <div class="step-title">Ready to Start</div>
                        <div class="step-detail">
                            When fast pointer reaches the end, slow pointer will be at the middle.
                            Fast travels 2x the distance of slow.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../fast-slow-shared.js"></script>
    <script src="middle-finding.js"></script>
</body>

</html>
```

**Step 2: Create CSS**

```css
:root {
    --accent: #10b981;
    --accent-bg: #ecfdf5;
    --slow-color: #3b82f6;
    --slow-bg: #eff6ff;
    --fast-color: #f97316;
    --fast-bg: #fff7ed;
    --middle-color: #10b981;
    --middle-bg: #ecfdf5;
}

.linked-list-viz {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-x: auto;
}

select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    background: var(--card);
    cursor: pointer;
}

select:focus {
    outline: none;
    border-color: var(--accent);
}

/* Middle type toggle */
.middle-toggle {
    min-width: 200px;
}

.toggle-group {
    display: flex;
    gap: 12px;
}

.toggle-option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    cursor: pointer;
}

.toggle-option input[type="radio"] {
    accent-color: var(--accent);
}

/* Pseudocode variants */
.pseudocode .second-middle {
    display: none;
}

.pseudocode.show-second .first-middle {
    display: none;
}

.pseudocode.show-second .second-middle {
    display: block;
}

/* Explanation */
.explanation .highlight-slow {
    color: var(--slow-color);
    font-weight: 600;
}

.explanation .highlight-fast {
    color: var(--fast-color);
    font-weight: 600;
}

.explanation .highlight-middle {
    color: var(--middle-color);
    font-weight: 600;
}
```

**Step 3: Create JavaScript**

```javascript
const state = {
    nodes: [],
    head: null,
    slow: null,
    fast: null,
    iteration: 0,
    done: false,
    middleIndex: null,
    useSecondMiddle: false,
    playing: false,
    timer: null
};

const $ = id => document.getElementById(id);
const presetSelect = $('presetSelect');
const valuesInput = $('valuesInput');
const linkedListViz = $('linkedListViz');
const iterCount = $('iterCount');
const statusBar = $('statusBar');
const pseudocode = $('pseudocode');
const explanation = $('explanation');
const btnLoad = $('btnLoad');
const btnStep = $('btnStep');
const btnPlay = $('btnPlay');
const btnReset = $('btnReset');
const speedSlider = $('speedSlider');
const speedValue = $('speedValue');
const middleTypeInputs = document.querySelectorAll('input[name="middleType"]');

const { createLinkedList, calculateLayout, renderLinkedListSVG, PRESETS, parseNodeValues } = window.FastSlowShared;

function loadPreset(key) {
    if (key === 'custom') return;
    const preset = PRESETS.middle[key];
    if (preset) {
        valuesInput.value = preset.values.join(', ');
    }
}

function render() {
    if (state.nodes.length === 0) {
        linkedListViz.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <p>Configure a linked list and click Load to begin</p>
            </div>
        `;
        return;
    }

    const positions = calculateLayout(state.nodes, -1);
    renderLinkedListSVG(linkedListViz, state.nodes, positions, {
        slow: state.slow,
        fast: state.fast,
        found: state.middleIndex
    });

    iterCount.textContent = state.iteration;
    updateButtons();

    // Update pseudocode variant
    if (state.useSecondMiddle) {
        pseudocode.classList.add('show-second');
    } else {
        pseudocode.classList.remove('show-second');
    }
}

function renderPseudocode(line) {
    const lines = pseudocode.querySelectorAll('.code-line');
    lines.forEach(el => {
        el.classList.remove('highlight');
        if (parseInt(el.dataset.line) === line) {
            el.classList.add('highlight');
        }
    });
}

function renderExplanation(type, data = {}) {
    const templates = {
        init: () => `
            <div class="step-title">Initialized</div>
            <div class="step-detail">Both pointers start at the head.</div>
            <div class="calculation">
                <span class="highlight-slow">🐢 Slow</span> at index 0<br>
                <span class="highlight-fast">🐇 Fast</span> at index 0
            </div>
        `,
        moving: () => `
            <div class="step-title">Moving Pointers</div>
            <div class="step-detail">Slow moves 1 step, Fast moves 2 steps.</div>
            <div class="calculation">
                <span class="highlight-slow">🐢 Slow</span>: ${data.slowFrom} → ${state.slow}<br>
                <span class="highlight-fast">🐇 Fast</span>: ${data.fastFrom} → ${state.fast !== null ? state.fast : 'NULL'}
            </div>
        `,
        found: () => `
            <div class="step-title">Middle Found!</div>
            <div class="step-detail">
                Fast reached the end. Slow is at the middle.
            </div>
            <div class="calculation">
                <span class="highlight-middle">Middle</span>: index ${state.middleIndex} (value: ${state.nodes[state.middleIndex].val})
            </div>
            <div class="reason" style="background: var(--middle-bg); color: #059669;">
                ${state.useSecondMiddle ? 'Second' : 'First'} middle for ${state.nodes.length % 2 === 0 ? 'even' : 'odd'}-length list.
            </div>
        `,
        ready: () => `
            <div class="step-title">Ready to Start</div>
            <div class="step-detail">
                When fast pointer reaches the end, slow pointer will be at the middle.
                Fast travels 2x the distance of slow.
            </div>
        `
    };

    explanation.innerHTML = templates[type] ? templates[type]() : templates.ready();
}

function setStatus(msg, type = '') {
    statusBar.textContent = msg;
    statusBar.className = 'status-bar' + (type ? ` ${type}` : '');
}

function updateButtons() {
    const canRun = state.nodes.length >= 1 && !state.done;
    btnStep.disabled = !canRun || state.playing;
    btnPlay.disabled = !canRun;
    btnReset.disabled = state.nodes.length === 0;
    btnPlay.textContent = state.playing ? 'Pause' : 'Play';
}

function initRun() {
    stopPlaying();

    try {
        const values = parseNodeValues(valuesInput.value);
        if (values.length === 0) throw new Error('Enter at least 1 node value');

        const { nodes } = createLinkedList(values, -1);
        state.useSecondMiddle = document.querySelector('input[name="middleType"]:checked').value === 'second';

        Object.assign(state, {
            nodes,
            slow: 0,
            fast: 0,
            iteration: 0,
            done: false,
            middleIndex: null
        });

        setStatus(`Loaded ${values.length} nodes. Using ${state.useSecondMiddle ? 'second' : 'first'} middle.`, 'info');
        renderExplanation('init');
        renderPseudocode(1);
        render();

    } catch (e) {
        setStatus(e.message, 'error');
        state.nodes = [];
        state.done = true;
        render();
    }
}

function step() {
    if (state.done || state.nodes.length === 0) return;

    const slowFrom = state.slow;
    const fastFrom = state.fast;

    // Check termination condition based on middle type
    const fastNode = state.nodes[state.fast];

    if (state.useSecondMiddle) {
        // while fast and fast.next
        if (!fastNode || !fastNode.next) {
            state.middleIndex = state.slow;
            state.done = true;
            setStatus(`Middle found at index ${state.slow}!`, 'success');
            renderExplanation('found');
            renderPseudocode(5);
            render();
            stopPlaying();
            return;
        }
    } else {
        // while fast.next and fast.next.next
        if (!fastNode.next || !fastNode.next.next) {
            state.middleIndex = state.slow;
            state.done = true;
            setStatus(`Middle found at index ${state.slow}!`, 'success');
            renderExplanation('found');
            renderPseudocode(5);
            render();
            stopPlaying();
            return;
        }
    }

    // Move pointers
    state.slow = state.nodes.findIndex(n => n === state.nodes[state.slow].next);
    const fastNext = state.nodes[state.fast].next;
    state.fast = fastNext && fastNext.next
        ? state.nodes.findIndex(n => n === fastNext.next)
        : (fastNext ? state.nodes.findIndex(n => n === fastNext) : null);

    state.iteration++;

    setStatus(`Slow: ${slowFrom} → ${state.slow}, Fast: ${fastFrom} → ${state.fast}`, 'info');
    renderExplanation('moving', { slowFrom, fastFrom });
    renderPseudocode(4);
    render();
}

function play() {
    if (state.nodes.length === 0 || state.done) return;

    if (state.playing) {
        stopPlaying();
        setStatus('Paused.', 'info');
        return;
    }

    state.playing = true;
    updateButtons();

    const tick = () => {
        if (!state.playing || state.done) {
            stopPlaying();
            return;
        }
        step();
        if (state.playing && !state.done) {
            state.timer = setTimeout(tick, parseInt(speedSlider.value));
        }
    };

    state.timer = setTimeout(tick, parseInt(speedSlider.value));
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
    initRun();
}

// Event listeners
presetSelect.addEventListener('change', () => loadPreset(presetSelect.value));
valuesInput.addEventListener('input', () => { presetSelect.value = 'custom'; });
btnLoad.addEventListener('click', initRun);
btnStep.addEventListener('click', step);
btnPlay.addEventListener('click', play);
btnReset.addEventListener('click', reset);
speedSlider.addEventListener('input', () => { speedValue.textContent = `${speedSlider.value}ms`; });
valuesInput.addEventListener('keypress', e => { if (e.key === 'Enter') initRun(); });
middleTypeInputs.forEach(input => input.addEventListener('change', () => {
    if (state.nodes.length > 0 && !state.done) initRun();
}));

speedValue.textContent = `${speedSlider.value}ms`;
loadPreset('odd-5');
```

**Step 4: Verify in browser**

Open `middle-finding.html` and test:
1. Odd length list - middle should be center
2. Even length with first/second toggle
3. Edge cases (single, two nodes)

Expected: Visualization works correctly

**Step 5: Commit**

```bash
git add notes/algorithms/02-fast-slow-pointers/visualizers/02-middle-finding/
git commit -m "feat: add middle finding visualizer"
```

---

## Task 7: Create Nth from End + Palindrome Visualizer

**Files:**
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/03-nth-palindrome/nth-palindrome.html`
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/03-nth-palindrome/nth-palindrome.css`
- Create: `notes/algorithms/02-fast-slow-pointers/visualizers/03-nth-palindrome/nth-palindrome.js`

**Step 1: Create HTML with tabs**

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fast-Slow Pointers: Nth from End & Palindrome | Algorithm Visualizer</title>
    <link rel="stylesheet" href="../shared.css">
    <link rel="stylesheet" href="nth-palindrome.css">
</head>

<body>
    <div class="container">
        <header>
            <h1>Fast-Slow Pointers: Nth from End & Palindrome</h1>
            <p class="subtitle">Position-based techniques using pointer gaps and middle finding</p>
        </header>

        <!-- Mode Tabs -->
        <div class="tabs">
            <button class="tab active" data-mode="nth">Nth from End</button>
            <button class="tab" data-mode="palindrome">Palindrome Check</button>
        </div>

        <!-- Controls -->
        <div class="card">
            <div class="card-title">Configuration</div>
            <div class="controls">
                <div class="input-group">
                    <label for="presetSelect">Preset</label>
                    <select id="presetSelect"></select>
                </div>
                <div class="input-group">
                    <label for="valuesInput">Node Values</label>
                    <input type="text" id="valuesInput" value="1, 2, 3, 4, 5">
                </div>
                <div class="input-group nth-only" style="max-width: 100px;">
                    <label for="nInput">N value</label>
                    <input type="number" id="nInput" value="2" min="1">
                </div>
            </div>
            <div style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
                <div class="btn-group">
                    <button id="btnLoad" class="primary">Load</button>
                    <button id="btnStep" disabled>Step</button>
                    <button id="btnPlay" disabled>Play</button>
                    <button id="btnReset" disabled>Reset</button>
                </div>
                <div class="speed-control">
                    <label>Speed:</label>
                    <input type="range" id="speedSlider" min="200" max="2000" value="800" step="100">
                    <span class="speed-value" id="speedValue">800ms</span>
                </div>
            </div>
        </div>

        <!-- Stage Indicator (Palindrome only) -->
        <div class="stage-indicator palindrome-only" id="stageIndicator">
            <span class="stage stage-1 active">Find Middle</span>
            <span class="stage-arrow">→</span>
            <span class="stage stage-2">Reverse Half</span>
            <span class="stage-arrow">→</span>
            <span class="stage stage-3">Compare</span>
        </div>

        <!-- Visualization -->
        <div class="card">
            <div class="viz-container">
                <div class="iteration-badge">
                    Step: <span class="count" id="iterCount">0</span>
                </div>
                <div class="linked-list-viz" id="linkedListViz">
                    <div class="empty-state">
                        <p>Configure a linked list and click Load to begin</p>
                    </div>
                </div>
                <div class="status-bar" id="statusBar">
                    Ready to start.
                </div>
            </div>
        </div>

        <!-- Educational Panels -->
        <div class="panels">
            <div class="panel">
                <div class="panel-header">Algorithm</div>
                <div class="panel-body">
                    <div class="pseudocode" id="pseudocode"></div>
                </div>
            </div>
            <div class="panel">
                <div class="panel-header">What's Happening</div>
                <div class="panel-body">
                    <div class="explanation" id="explanation">
                        <div class="step-title">Ready to Start</div>
                        <div class="step-detail">Select a mode and configure the list.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../fast-slow-shared.js"></script>
    <script src="nth-palindrome.js"></script>
</body>

</html>
```

**Step 2: Create CSS**

```css
:root {
    --accent: #6366f1;
    --accent-bg: #eef2ff;
    --slow-color: #3b82f6;
    --fast-color: #f97316;
    --found-color: #22c55e;
}

.tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    background: var(--card);
    padding: 4px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
}

.tab {
    flex: 1;
    padding: 10px 16px;
    border: none;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: calc(var(--radius) - 2px);
    transition: all 0.2s;
}

.tab:hover {
    background: var(--bg);
}

.tab.active {
    background: var(--accent);
    color: white;
}

.nth-only, .palindrome-only {
    display: none;
}

body.mode-nth .nth-only {
    display: block;
}

body.mode-palindrome .palindrome-only {
    display: flex;
}

.stage-indicator {
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px 20px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
}

.stage {
    padding: 6px 14px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    background: var(--bg);
}

.stage.active {
    background: var(--accent-bg);
    color: var(--accent);
    font-weight: 600;
}

.stage.completed {
    background: var(--success-bg);
    color: var(--success);
}

.stage-arrow {
    color: var(--muted);
}

.linked-list-viz {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-x: auto;
}

select, input[type="number"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    background: var(--card);
}

select:focus, input:focus {
    outline: none;
    border-color: var(--accent);
}
```

**Step 3: Create JavaScript**

```javascript
const state = {
    mode: 'nth', // 'nth' or 'palindrome'
    nodes: [],
    slow: null,
    fast: null,
    n: 2,
    stage: 0,
    iteration: 0,
    done: false,
    result: null,
    playing: false,
    timer: null,
    // Palindrome specific
    middleIndex: null,
    reversedHalf: [],
    compareIndex: 0
};

const $ = id => document.getElementById(id);
const presetSelect = $('presetSelect');
const valuesInput = $('valuesInput');
const nInput = $('nInput');
const linkedListViz = $('linkedListViz');
const iterCount = $('iterCount');
const statusBar = $('statusBar');
const pseudocode = $('pseudocode');
const explanation = $('explanation');
const stageIndicator = $('stageIndicator');
const btnLoad = $('btnLoad');
const btnStep = $('btnStep');
const btnPlay = $('btnPlay');
const btnReset = $('btnReset');
const speedSlider = $('speedSlider');
const speedValue = $('speedValue');
const tabs = document.querySelectorAll('.tab');

const { createLinkedList, calculateLayout, renderLinkedListSVG, PRESETS, parseNodeValues } = window.FastSlowShared;

const PSEUDOCODE = {
    nth: `
        <div class="code-line" data-line="0"><span class="keyword">def</span> nth_from_end(head, n):</div>
        <div class="code-line" data-line="1">    slow = fast = head</div>
        <div class="code-line" data-line="2">    <span class="comment"># Move fast n steps ahead</span></div>
        <div class="code-line" data-line="3">    <span class="keyword">for</span> _ <span class="keyword">in</span> range(n):</div>
        <div class="code-line" data-line="4">        fast = fast.next</div>
        <div class="code-line" data-line="5">    <span class="comment"># Move both until fast is NULL</span></div>
        <div class="code-line" data-line="6">    <span class="keyword">while</span> fast:</div>
        <div class="code-line" data-line="7">        slow = slow.next</div>
        <div class="code-line" data-line="8">        fast = fast.next</div>
        <div class="code-line" data-line="9">    <span class="keyword">return</span> slow</div>
    `,
    palindrome: `
        <div class="code-line" data-line="0"><span class="keyword">def</span> is_palindrome(head):</div>
        <div class="code-line" data-line="1">    <span class="comment"># Stage 1: Find middle</span></div>
        <div class="code-line" data-line="2">    slow = fast = head</div>
        <div class="code-line" data-line="3">    <span class="keyword">while</span> fast.next <span class="keyword">and</span> fast.next.next:</div>
        <div class="code-line" data-line="4">        slow, fast = slow.next, fast.next.next</div>
        <div class="code-line" data-line="5">    <span class="comment"># Stage 2: Reverse second half</span></div>
        <div class="code-line" data-line="6">    second = reverse(slow.next)</div>
        <div class="code-line" data-line="7">    <span class="comment"># Stage 3: Compare halves</span></div>
        <div class="code-line" data-line="8">    first, sec = head, second</div>
        <div class="code-line" data-line="9">    <span class="keyword">while</span> sec:</div>
        <div class="code-line" data-line="10">        <span class="keyword">if</span> first.val != sec.val: <span class="keyword">return</span> False</div>
        <div class="code-line" data-line="11">        first, sec = first.next, sec.next</div>
        <div class="code-line" data-line="12">    <span class="keyword">return</span> True</div>
    `
};

function setMode(mode) {
    state.mode = mode;
    document.body.className = `mode-${mode}`;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    pseudocode.innerHTML = PSEUDOCODE[mode];
    loadPresets();

    const firstPreset = Object.keys(mode === 'nth' ? PRESETS.nth : PRESETS.palindrome)[0];
    loadPreset(firstPreset);
}

function loadPresets() {
    const presets = state.mode === 'nth' ? PRESETS.nth : PRESETS.palindrome;
    presetSelect.innerHTML = Object.entries(presets)
        .map(([key, p]) => `<option value="${key}">${p.label}</option>`)
        .join('') + '<option value="custom">Custom...</option>';
}

function loadPreset(key) {
    if (key === 'custom') return;
    const presets = state.mode === 'nth' ? PRESETS.nth : PRESETS.palindrome;
    const preset = presets[key];
    if (preset) {
        valuesInput.value = preset.values.join(', ');
        if (preset.n !== undefined) nInput.value = preset.n;
    }
}

function render() {
    if (state.nodes.length === 0) {
        linkedListViz.innerHTML = '<div class="empty-state"><p>Configure and click Load</p></div>';
        return;
    }

    const positions = calculateLayout(state.nodes, -1);
    renderLinkedListSVG(linkedListViz, state.nodes, positions, {
        slow: state.slow,
        fast: state.fast,
        found: state.result
    });

    iterCount.textContent = state.iteration;
    updateButtons();
    updateStages();
}

function updateStages() {
    if (state.mode !== 'palindrome') return;
    const stages = stageIndicator.querySelectorAll('.stage');
    stages.forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i + 1 < state.stage) s.classList.add('completed');
        else if (i + 1 === state.stage) s.classList.add('active');
    });
}

function renderPseudocode(line) {
    pseudocode.querySelectorAll('.code-line').forEach(el => {
        el.classList.toggle('highlight', parseInt(el.dataset.line) === line);
    });
}

function setStatus(msg, type = '') {
    statusBar.textContent = msg;
    statusBar.className = 'status-bar' + (type ? ` ${type}` : '');
}

function updateButtons() {
    const canRun = state.nodes.length >= 1 && !state.done;
    btnStep.disabled = !canRun || state.playing;
    btnPlay.disabled = !canRun;
    btnReset.disabled = state.nodes.length === 0;
    btnPlay.textContent = state.playing ? 'Pause' : 'Play';
}

function initRun() {
    stopPlaying();

    try {
        const values = parseNodeValues(valuesInput.value);
        if (values.length === 0) throw new Error('Enter at least 1 node');

        const { nodes } = createLinkedList(values, -1);

        Object.assign(state, {
            nodes,
            slow: 0,
            fast: 0,
            n: parseInt(nInput.value) || 2,
            stage: state.mode === 'nth' ? 1 : 1,
            iteration: 0,
            done: false,
            result: null,
            middleIndex: null,
            reversedHalf: [],
            compareIndex: 0
        });

        if (state.mode === 'nth' && state.n > values.length) {
            setStatus(`N (${state.n}) exceeds list length (${values.length})`, 'error');
            state.done = true;
        } else {
            setStatus('Ready. Click Step or Play.', 'info');
        }

        renderPseudocode(state.mode === 'nth' ? 1 : 2);
        render();

    } catch (e) {
        setStatus(e.message, 'error');
        state.nodes = [];
        state.done = true;
        render();
    }
}

function step() {
    if (state.done) return;
    state.mode === 'nth' ? stepNth() : stepPalindrome();
}

function stepNth() {
    if (state.stage === 1) {
        // Moving fast n steps ahead
        if (state.iteration < state.n) {
            state.fast = state.nodes.findIndex(n => n === state.nodes[state.fast].next);
            state.iteration++;
            setStatus(`Moving fast ahead: step ${state.iteration}/${state.n}`, 'info');
            renderPseudocode(4);

            if (state.fast === -1 || state.fast === null) {
                setStatus(`N exceeds list length`, 'error');
                state.done = true;
            } else if (state.iteration === state.n) {
                state.stage = 2;
                setStatus(`Gap created. Now moving both.`, 'info');
            }
            render();
            return;
        }
    }

    if (state.stage === 2) {
        const fastNode = state.nodes[state.fast];
        if (!fastNode || !fastNode.next) {
            state.result = state.slow;
            state.done = true;
            setStatus(`Found! ${state.n}th from end is index ${state.slow} (value: ${state.nodes[state.slow].val})`, 'success');
            renderPseudocode(9);
            render();
            stopPlaying();
            return;
        }

        state.slow = state.nodes.findIndex(n => n === state.nodes[state.slow].next);
        state.fast = state.nodes.findIndex(n => n === state.nodes[state.fast].next);
        state.iteration++;
        setStatus(`Moving both: slow=${state.slow}, fast=${state.fast}`, 'info');
        renderPseudocode(8);
        render();
    }
}

function stepPalindrome() {
    if (state.stage === 1) {
        // Find middle
        const fastNode = state.nodes[state.fast];
        if (!fastNode.next || !fastNode.next.next) {
            state.middleIndex = state.slow;
            state.stage = 2;

            // Prepare reversed half
            const secondHalfStart = state.slow + 1;
            state.reversedHalf = state.nodes.slice(secondHalfStart).map(n => n.val).reverse();
            state.compareIndex = 0;

            setStatus(`Middle at ${state.slow}. Reversing second half...`, 'info');
            renderPseudocode(6);
            render();
            return;
        }

        state.slow = state.nodes.findIndex(n => n === state.nodes[state.slow].next);
        state.fast = state.nodes.findIndex(n => n === state.nodes[state.fast].next.next);
        state.iteration++;
        setStatus(`Finding middle: slow=${state.slow}, fast=${state.fast}`, 'info');
        renderPseudocode(4);
        render();
        return;
    }

    if (state.stage === 2) {
        state.stage = 3;
        setStatus(`Comparing halves...`, 'info');
        renderPseudocode(9);
        render();
        return;
    }

    if (state.stage === 3) {
        if (state.compareIndex >= state.reversedHalf.length) {
            state.done = true;
            state.result = 0; // Mark as found/success
            setStatus(`Palindrome: TRUE`, 'success');
            renderPseudocode(12);
            render();
            stopPlaying();
            return;
        }

        const firstVal = state.nodes[state.compareIndex].val;
        const secondVal = state.reversedHalf[state.compareIndex];

        if (firstVal !== secondVal) {
            state.done = true;
            setStatus(`Palindrome: FALSE (${firstVal} != ${secondVal})`, 'error');
            renderPseudocode(10);
            render();
            stopPlaying();
            return;
        }

        state.slow = state.compareIndex;
        state.fast = state.nodes.length - 1 - state.compareIndex;
        state.compareIndex++;
        state.iteration++;
        setStatus(`Comparing: ${firstVal} == ${secondVal}`, 'info');
        renderPseudocode(11);
        render();
    }
}

function play() {
    if (state.done) return;
    if (state.playing) { stopPlaying(); return; }

    state.playing = true;
    updateButtons();

    const tick = () => {
        if (!state.playing || state.done) { stopPlaying(); return; }
        step();
        if (state.playing && !state.done) {
            state.timer = setTimeout(tick, parseInt(speedSlider.value));
        }
    };
    state.timer = setTimeout(tick, parseInt(speedSlider.value));
}

function stopPlaying() {
    state.playing = false;
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
    updateButtons();
}

function reset() { stopPlaying(); initRun(); }

// Event listeners
tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));
presetSelect.addEventListener('change', () => loadPreset(presetSelect.value));
valuesInput.addEventListener('input', () => { presetSelect.value = 'custom'; });
btnLoad.addEventListener('click', initRun);
btnStep.addEventListener('click', step);
btnPlay.addEventListener('click', play);
btnReset.addEventListener('click', reset);
speedSlider.addEventListener('input', () => { speedValue.textContent = `${speedSlider.value}ms`; });
valuesInput.addEventListener('keypress', e => { if (e.key === 'Enter') initRun(); });

// Initialize
speedValue.textContent = `${speedSlider.value}ms`;
setMode('nth');
```

**Step 4: Verify in browser**

Test both tabs:
1. Nth from End - test n=2 on 5 nodes
2. Palindrome - test "1,2,2,1" (true) and "1,2,3" (false)

Expected: Both modes work correctly

**Step 5: Commit**

```bash
git add notes/algorithms/02-fast-slow-pointers/visualizers/03-nth-palindrome/
git commit -m "feat: add nth from end and palindrome visualizer"
```

---

## Task 8: Final Integration and Testing

**Step 1: Test all visualizers**

Open each visualizer and verify:
- [ ] Cycle Detection: presets work, phase 1→2 transition, correct entry point
- [ ] Middle Finding: first/second middle toggle, edge cases
- [ ] Nth from End: gap creation, correct result
- [ ] Palindrome: all 3 stages, correct true/false results

**Step 2: Create index/navigation (optional)**

If desired, create an index.html linking all visualizers.

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete fast-slow pointers visualizers suite"
```

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | directories | Create folder structure |
| 2 | fast-slow-shared.js | Shared linked list module |
| 3 | cycle-detection.html | Cycle detection HTML |
| 4 | cycle-detection.css | Cycle detection styles |
| 5 | cycle-detection.js | Cycle detection logic |
| 6 | middle-finding/* | Middle finding visualizer |
| 7 | nth-palindrome/* | Nth + Palindrome visualizer |
| 8 | - | Integration testing |

**Implementation order:** Tasks 1-5 first (establishes core), then 6-7 (parallel-ready), then 8 (verification).
