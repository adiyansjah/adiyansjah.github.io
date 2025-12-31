/**
 * Shared module for Fast-Slow Pointer visualizers
 * Provides linked list data structure, SVG rendering, and layout utilities
 */

// ============================================================================
// ListNode Class
// ============================================================================

class ListNode {
    static _idCounter = 0;

    constructor(val) {
        this.val = val;
        this.next = null;
        this.id = ListNode._idCounter++;
    }

    static resetIdCounter() {
        ListNode._idCounter = 0;
    }
}

// ============================================================================
// Linked List Creation
// ============================================================================

/**
 * Creates a linked list from an array of values
 * @param {Array} values - Array of values for the nodes
 * @param {number} cycleIndex - Index where the tail connects back (-1 for no cycle)
 * @returns {Object} - { head, nodes, cycleNode }
 */
function createLinkedList(values, cycleIndex = -1) {
    if (!values || values.length === 0) {
        return { head: null, nodes: [], cycleNode: null };
    }

    ListNode.resetIdCounter();
    const nodes = values.map(val => new ListNode(val));

    // Link nodes
    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].next = nodes[i + 1];
    }

    // Create cycle if specified
    let cycleNode = null;
    if (cycleIndex >= 0 && cycleIndex < nodes.length) {
        nodes[nodes.length - 1].next = nodes[cycleIndex];
        cycleNode = nodes[cycleIndex];
    }

    return {
        head: nodes[0],
        nodes,
        cycleNode
    };
}

// ============================================================================
// Layout Constants
// ============================================================================

const LAYOUT = {
    nodeSize: 48,
    nodeSpacing: 80,
    verticalOffset: 120,
    cycleRadius: 80,
    pointerOffset: 35,
    arrowSize: 8
};

// ============================================================================
// Layout Calculation
// ============================================================================

/**
 * Calculates positions for all nodes in the linked list
 * Returns a Map of node id to { x, y, inCycle }
 * @param {Array} nodes - Array of ListNode objects
 * @param {number} cycleIndex - Index where cycle starts (-1 for no cycle)
 * @returns {Map} - Map of node id to position object
 */
function calculateLayout(nodes, cycleIndex = -1) {
    const positions = new Map();

    if (!nodes || nodes.length === 0) {
        return positions;
    }

    const { nodeSize, nodeSpacing, verticalOffset, cycleRadius } = LAYOUT;
    const centerY = verticalOffset;

    if (cycleIndex < 0 || cycleIndex >= nodes.length) {
        // Linear layout - no cycle
        nodes.forEach((node, index) => {
            positions.set(node.id, {
                x: nodeSpacing + index * (nodeSize + nodeSpacing),
                y: centerY,
                inCycle: false
            });
        });
    } else {
        // Hybrid layout: linear portion + circular portion
        const linearCount = cycleIndex;
        const cycleCount = nodes.length - cycleIndex;

        // Position linear portion
        for (let i = 0; i < linearCount; i++) {
            positions.set(nodes[i].id, {
                x: nodeSpacing + i * (nodeSize + nodeSpacing),
                y: centerY,
                inCycle: false
            });
        }

        // Calculate cycle center
        const cycleStartX = nodeSpacing + linearCount * (nodeSize + nodeSpacing) + cycleRadius;
        const cycleCenterY = centerY + cycleRadius * 0.3;

        // Position circular portion
        // Start angle at PI (left side) so cycle connects naturally from linear part
        const startAngle = Math.PI;
        const angleStep = (2 * Math.PI) / cycleCount;

        for (let i = 0; i < cycleCount; i++) {
            const node = nodes[linearCount + i];
            const angle = startAngle - i * angleStep; // Go clockwise
            positions.set(node.id, {
                x: cycleStartX + cycleRadius * Math.cos(angle),
                y: cycleCenterY + cycleRadius * Math.sin(angle),
                inCycle: true
            });
        }
    }

    return positions;
}

// ============================================================================
// SVG Rendering Utilities
// ============================================================================

/**
 * Creates an SVG element with given attributes
 * @param {string} tag - SVG element tag name
 * @param {Object} attrs - Attributes to set on the element
 * @returns {SVGElement}
 */
function createSVGElement(tag, attrs = {}) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) {
        elem.setAttribute(key, value);
    }
    return elem;
}

/**
 * Creates an arrow between two positions
 * @param {Object} from - Starting position { x, y }
 * @param {Object} to - Ending position { x, y }
 * @param {boolean} curved - Whether to use curved path for cycle arrows
 * @returns {SVGElement} - Path element
 */
function createArrow(from, to, curved = false) {
    const { nodeSize, arrowSize } = LAYOUT;
    const halfNode = nodeSize / 2;

    // Calculate direction vector
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len === 0) return null;

    // Normalize direction
    const nx = dx / len;
    const ny = dy / len;

    // Start from edge of source node
    const startX = from.x + nx * halfNode;
    const startY = from.y + ny * halfNode;

    // End at edge of target node (with room for arrowhead)
    const endX = to.x - nx * (halfNode + arrowSize);
    const endY = to.y - ny * (halfNode + arrowSize);

    let pathD;
    if (curved) {
        // Calculate control point for curve (perpendicular offset)
        const perpX = -ny;
        const perpY = nx;
        const ctrlOffset = len * 0.3;
        const ctrlX = (startX + endX) / 2 + perpX * ctrlOffset;
        const ctrlY = (startY + endY) / 2 + perpY * ctrlOffset;

        pathD = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
    } else {
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    const path = createSVGElement('path', {
        d: pathD,
        stroke: '#9ca3af',
        'stroke-width': '2',
        fill: 'none',
        'marker-end': 'url(#arrowhead)'
    });

    return path;
}

/**
 * Creates a node element (circle with value)
 * @param {ListNode} node - The node to render
 * @param {Object} pos - Position { x, y, inCycle }
 * @param {Object} states - { slow: boolean, fast: boolean, found: boolean, cycleEntry: boolean }
 * @returns {SVGElement} - Group element containing the node
 */
function createNodeElement(node, pos, states = {}) {
    const { nodeSize } = LAYOUT;
    const { slow, fast, found, cycleEntry } = states;

    const group = createSVGElement('g', {
        transform: `translate(${pos.x}, ${pos.y})`,
        class: 'node-group'
    });

    // Determine color based on state
    let fillColor = '#ffffff';
    let strokeColor = pos.inCycle ? '#a855f7' : '#e5e5e5';
    let textColor = '#1a1a1a';

    if (found) {
        fillColor = '#dcfce7';
        strokeColor = '#22c55e';
    } else if (cycleEntry) {
        fillColor = '#fefce8';
        strokeColor = '#eab308';
    } else if (slow && fast) {
        fillColor = '#f3e8ff';
        strokeColor = '#a855f7';
    } else if (slow) {
        fillColor = '#dbeafe';
        strokeColor = '#3b82f6';
    } else if (fast) {
        fillColor = '#ffedd5';
        strokeColor = '#f97316';
    }

    // Node circle
    const circle = createSVGElement('circle', {
        cx: '0',
        cy: '0',
        r: String(nodeSize / 2),
        fill: fillColor,
        stroke: strokeColor,
        'stroke-width': '2'
    });

    // Value text
    const text = createSVGElement('text', {
        x: '0',
        y: '0',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        'font-size': '16',
        'font-weight': '600',
        fill: textColor
    });
    text.textContent = String(node.val);

    group.appendChild(circle);
    group.appendChild(text);

    return group;
}

/**
 * Creates a pointer icon (turtle or rabbit emoji)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} type - 'slow' or 'fast'
 * @returns {SVGElement} - Text element with emoji
 */
function createPointerIcon(x, y, type) {
    const { pointerOffset } = LAYOUT;
    const emoji = type === 'slow' ? '\uD83D\uDC22' : '\uD83D\uDC07'; // Turtle or Rabbit

    const text = createSVGElement('text', {
        x: String(x),
        y: String(y - pointerOffset),
        'text-anchor': 'middle',
        'font-size': '24',
        class: `pointer-icon pointer-${type}`
    });
    text.textContent = emoji;

    return text;
}

/**
 * Renders the linked list visualization to an SVG container
 * @param {Element} container - Container element (will be cleared)
 * @param {Array} nodes - Array of ListNode objects
 * @param {Map} positions - Map of node id to position
 * @param {Object} pointers - { slow: nodeId, fast: nodeId, found: nodeId }
 * @param {number} cycleIndex - Index where cycle starts (-1 for no cycle)
 */
function renderLinkedListSVG(container, nodes, positions, pointers = {}, cycleIndex = -1) {
    // Clear container
    container.innerHTML = '';

    if (!nodes || nodes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p>Enter values and click Load to create a linked list</p>
            </div>
        `;
        return;
    }

    // Calculate SVG dimensions
    let maxX = 0;
    let maxY = 0;
    positions.forEach(pos => {
        maxX = Math.max(maxX, pos.x);
        maxY = Math.max(maxY, pos.y);
    });

    const padding = LAYOUT.nodeSpacing;
    const width = maxX + padding + LAYOUT.nodeSize;
    const height = maxY + padding + LAYOUT.nodeSize;

    // Create SVG
    const svg = createSVGElement('svg', {
        width: String(width),
        height: String(height),
        viewBox: `0 0 ${width} ${height}`,
        class: 'linked-list-svg'
    });

    // Add arrowhead marker definition
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

    // Create arrows group (rendered below nodes)
    const arrowsGroup = createSVGElement('g', { class: 'arrows' });

    // Draw arrows between nodes
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.next) {
            const fromPos = positions.get(node.id);
            const toPos = positions.get(node.next.id);
            if (fromPos && toPos) {
                // Determine if this is a back-edge (cycle arrow)
                const isCycleArrow = cycleIndex >= 0 && i === nodes.length - 1;
                const arrow = createArrow(fromPos, toPos, isCycleArrow);
                if (arrow) {
                    if (isCycleArrow) {
                        arrow.setAttribute('stroke', '#a855f7');
                        arrow.setAttribute('stroke-dasharray', '5,3');
                    }
                    arrowsGroup.appendChild(arrow);
                }
            }
        }
    }
    svg.appendChild(arrowsGroup);

    // Create nodes group
    const nodesGroup = createSVGElement('g', { class: 'nodes' });

    // Draw nodes
    nodes.forEach(node => {
        const pos = positions.get(node.id);
        if (!pos) return;

        const states = {
            slow: pointers.slow === node.id,
            fast: pointers.fast === node.id,
            found: pointers.found === node.id
        };

        const nodeElem = createNodeElement(node, pos, states);
        nodesGroup.appendChild(nodeElem);
    });
    svg.appendChild(nodesGroup);

    // Create pointers group (rendered above nodes)
    const pointersGroup = createSVGElement('g', { class: 'pointers' });

    // Draw pointer icons
    if (pointers.slow !== undefined && pointers.slow !== null) {
        const slowNode = nodes.find(n => n.id === pointers.slow);
        if (slowNode) {
            const pos = positions.get(slowNode.id);
            if (pos) {
                const icon = createPointerIcon(pos.x, pos.y, 'slow');
                pointersGroup.appendChild(icon);
            }
        }
    }

    if (pointers.fast !== undefined && pointers.fast !== null) {
        const fastNode = nodes.find(n => n.id === pointers.fast);
        if (fastNode) {
            const pos = positions.get(fastNode.id);
            if (pos) {
                // Offset fast pointer slightly if on same node as slow
                let offsetX = 0;
                if (pointers.slow === pointers.fast) {
                    offsetX = 20;
                }
                const icon = createPointerIcon(pos.x + offsetX, pos.y, 'fast');
                pointersGroup.appendChild(icon);
            }
        }
    }
    svg.appendChild(pointersGroup);

    container.appendChild(svg);
}

// ============================================================================
// Presets
// ============================================================================

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
        'true-even': { values: [1, 2, 2, 1], label: '1->2->2->1 (true)' },
        'true-odd': { values: [1, 2, 3, 2, 1], label: '1->2->3->2->1 (true)' },
        'false': { values: [1, 2, 3], label: '1->2->3 (false)' },
        'single': { values: [1], label: 'Single node' }
    }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse comma-separated values into an array of numbers
 * @param {string} text - Comma-separated values
 * @returns {Array} - Array of numbers
 */
function parseNodeValues(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const parts = text.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) {
        return [];
    }

    const nums = parts.map(p => {
        const n = Number(p);
        if (isNaN(n)) {
            throw new Error(`Invalid value: "${p}" is not a number`);
        }
        return n;
    });

    return nums;
}

// ============================================================================
// Export as global module
// ============================================================================

window.FastSlowShared = {
    // Classes
    ListNode,

    // List creation
    createLinkedList,

    // Layout
    LAYOUT,
    calculateLayout,

    // SVG rendering
    createSVGElement,
    createArrow,
    createNodeElement,
    createPointerIcon,
    renderLinkedListSVG,

    // Presets
    PRESETS,

    // Utilities
    parseNodeValues
};
